<?php

namespace App\Http\Controllers\Api\V1\Admin\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Model Imports
use App\Models\BookingRecord;
use App\Models\BookingReject;
use App\Models\RoomBill;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Booking\BookingIndexResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingRejectResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingApproveResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingShowResource;

// Request Validation Imports
use App\Http\Requests\Api\V1\Admin\Booking\BookingIndexRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingRejectRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingApproveRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingExportRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingShowDetailRequest;

class BookingController extends Controller
{
    public function index(BookingIndexRequest $request)
    {
        $bookingData = BookingRecord::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                return $query->whereHas('room', function ($query) use ($request) {
                    $query->where(
                        'name', 'like', '%' . $request->validated('search') . '%'
                    );
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                return $query->where('status', $request->validated('status'));
            })
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total', 'created_at')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name', 'phone_number', 'email'),
                'user' => fn ($q) => $q->select('id', 'name', 'email')
            ])
            ->orderByDesc('created_at')
            ->paginate(10);
        
        return BookingIndexResource::collection($bookingData)
            ->additional([
                'message' => 'Booking records successfully retrieved'
            ]);
    }

    public function show(BookingShowDetailRequest $request)
    {
        $ids = $request->validated('id');

        $roomDetailData = BookingRecord::query()
            ->whereIn('id', $ids)
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total', 'created_at')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name', 'room_type_id', 'price', 'floor'),
                'room.roomType' => fn ($q) => $q->select('id', 'name'),
                'room.facilities' => fn ($q) => $q->select('facilities.id', 'facilities.name', 'facilities.icon_name'),
                'room.utilities' => fn ($q) => $q->select('utilities.id', 'utilities.name', 'utilities.icon_name'),
                'room.imagePaths' => fn ($q) => $q->select('id', 'room_id', 'image_path', 'sort_order'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name', 'phone_number', 'email'),
                'bookingCancellation' => fn ($q) => $q->select('id', 'booking_record_id', 'reason'),
                'bookingReject' => fn ($q) => $q->select('id', 'booking_record_id', 'reason'),
                'roomBill' => fn ($q) => $q->select('id', 'booking_record_id', 'last_payment_id', 'status', 'next_due_date'),
                'roomBill.paymentRecord' => fn ($q) => $q->select('id', 'booking_record_id', 'amount', 'created_at')
            ])
            ->get();
        
        return BookingShowResource::collection($roomDetailData);
    }

    public function reject(BookingRejectRequest $request)
    {
        $result = DB::transaction(function () use ($request) {
            $ids = $request->validated('id');
            $reasons = $request->validated('reason');

            $bookings = BookingRecord::whereIn('id', $ids)->get();

            foreach ($bookings as $booking) {
                if ($booking->status === 'rejected') {
                    throw new \Exception(
                        "Booking ID {$booking->id} is already rejected."
                    );
                } elseif ($booking->status !== 'pending') {
                    throw new \Exception(
                        "Booking ID {$booking->id} cannot be rejected because its status is '{$booking->status}'. Only pending status bookings can be rejected."
                    );
                }
            }

            BookingRecord::whereIn('id', $ids)->update([
                'status' => 'rejected',
            ]);

            foreach ($ids as $id) {
                BookingReject::create([
                    'booking_record_id' => $id,
                    'reason' => $reasons[$id],
                ]);
            }

            return BookingRecord::whereIn('id', $ids)->get();
        });

        return BookingRejectResource::collection($result)
            ->response()
            ->setStatusCode(200);
    }

    public function approve(BookingApproveRequest $request) 
    {
        $ids = $request->validated('id');

        $bookings = BookingRecord::query()
            ->select('id', 'room_id', 'status', 'total')
            ->with([
                'room' => fn ($q) => $q->select('id', 'price')
            ])
            ->whereIn('id', $ids)
            ->get();

        foreach ($bookings as $booking) {
            if ($booking->status === 'approved') {
                throw new \Exception(
                    "Booking ID {$booking->ids} is already approved."
                );
            } elseif ($booking->status !== 'pending') {
                throw new \Exception(
                    "Booking ID {$booking->ids} cannot be approved because its status is '{$booking->status}'. Only pending status bookings can be approved."
                );
            }
        }

        DB::transaction(function () use ($bookings) {
            foreach ($bookings as $booking) {
                $booking->update([
                    'status' => 'approved'
                ]);

                RoomBill::create([
                    'booking_record_id' => $booking->id,
                    'amount_left' => $booking->total,
                    'current_month_bill' => $booking->room->price,
                    'status' => 'unpaid',
                    'next_due_date' => now()->addDay()->toDateString(),
                ]);
            }
        });

        return (new BookingApproveResource($bookings))
                ->response()
                ->setStatusCode(200);
    }

    public function export(BookingExportRequest $request) 
    {
        $payload = $request->validated();

        $bookings = BookingRecord::query()
            ->select(
                'id', 'room_id', 'user_id', 'move_in', 
                'move_out', 'rental_duration', 'status', 
                'total', 'created_at'
            )
            ->with([
                'room' => fn ($q) => $q->select('id', 'name'),
                'user' => fn ($q) => $q->select('id', 'name'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name', 'email', 'phone_number')
            ])
            ->whereDate('created_at', '>=', $payload['start_date'])
            ->whereDate('created_at', '<=', $payload['end_date'])
            ->when(isset($payload['status']), function ($q) use ($payload) {
                $q->where('status', $payload['status']);
            })
            ->when(isset($payload['rooms']), function ($q) use ($payload) {
                $q->where('room_id', $payload['rooms']);
            })
            ->orderBy('id');

        if (!$bookings->exists()) {
            abort(404, 'No bookings found for the selected filters.');
        }

        return response()->streamDownload(function () use ($bookings) {

            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV headers
            fputcsv($handle, [
                'Booking ID',
                'Room',
                'User',
                'Move In',
                'Move Out',
                'Total',
                'Status',
                'Booking Name',
                'Booking Email',
                'Booking Phone',
            ]);

            // Process bookings in chunks
            $bookings->chunkById(500, function ($records) use ($handle) {

                foreach ($records as $booking) {
                    fputcsv($handle, [
                        $booking->id,
                        $booking->room?->name,
                        $booking->user?->name,
                        $booking->move_in,
                        $booking->move_out,
                        $booking->total,
                        $booking->status,
                        $booking->contact->name,
                        $booking->contact->email,
                        $booking->contact->phone
                    ]);
                }

            });

            fclose($handle);

        }, 'bookings-export-' . now()->format('Y-m-d-H-i-s') . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
