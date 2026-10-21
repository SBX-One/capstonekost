<?php

namespace App\Http\Controllers\Api\V1\Auth;

// Laravel Imports
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

// Model Imports
use App\Models\User;

// Phone Formatter Imports
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

// Resource Imports
use App\Http\Resources\Api\V1\Auth\AuthRegisterResource;
use App\Http\Resources\Api\V1\Auth\AuthLoginResource;
use App\Http\Resources\Api\V1\Auth\AuthRefreshResource;

// Request Validation Imports
use App\Http\Requests\Api\V1\Auth\AuthRegisterRequest;
use App\Http\Requests\Api\V1\Auth\AuthLoginRequest;

class AuthController extends Controller
{
    public function register(AuthRegisterRequest $request)
    {
        $user = $request->validated();

        $phoneNumberUtil = PhoneNumberUtil::getInstance();        

        $number = $phoneNumberUtil->parse($user['phone'], 'ID');

        if ($phoneNumberUtil->isValidNumber($number)) {
            $phone = $phoneNumberUtil->format(
                $number,
                PhoneNumberFormat::E164
            );

            $existing_number = User::query()
                                   ->where('phone', $phone)
                                   ->first();

            if ($existing_number) {
                return response()->json([
                    'message' => 'Phone number has already been taken.'
                ], 422);
            } 

            $user['phone'] = $phone;
        }

        $user['password'] = Hash::make($user['password']);

        $user = User::query()->create($user);

        $token = Auth::tokenById($user->id);

        $user = Auth::user();

        return (new AuthRegisterResource([
                'token' => $token,
                'id' => $user->id,
                'name'=> $user->name,
                'email'=> $user->email,
                'role'=> $user->role
            ]))
            ->response()
            ->setStatusCode(201);
    }

    public function login(AuthLoginRequest $request)
    {
        $credentials = $request->validated();

        if (!$token = Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials.'
            ], 401);
        }

        return (new AuthLoginResource([
                'token' => $token,
            ]))
            ->response()
            ->setStatusCode(200);
    }

    public function refresh()
    {
        $token = Auth::refresh();

        return (new AuthRefreshResource([
                'token' => $token,
            ]))
            ->response()
            ->setStatusCode(200);
    }

    public function logout()
    {
        Auth::logout();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}
