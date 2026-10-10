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

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = $request->validated();

        $credentials = [
            'email' => $user['email'],
            'password' => $user['password']
        ];

        $phoneNumberUtil = PhoneNumberUtil::getInstance();        

        $number = $phoneNumberUtil->parse($user['phone'], 'ID');

        if ($phoneNumberUtil->isValidNumber($number)) {
            $phone = $phoneNumberUtil->format(
                $number,
                PhoneNumberFormat::E164
            );
            $user['phone'] = $phone;
        }

        $user['password'] = Hash::make($user['password']);

        $user = User::query()->create($user);

        $token = Auth::tokenById($user->id);

        return (new AuthRegisterResource($token))
               ->response()
               ->setStatusCode(201);
    }
}
