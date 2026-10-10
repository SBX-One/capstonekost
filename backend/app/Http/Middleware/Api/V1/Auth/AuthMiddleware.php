<?php

namespace App\Http\Middleware\Api\V1\Auth;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AdminAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$role): Response
    {
        $user = Auth::user();

        if (!$user || $user->role !== $role) {
            return response()->json(['message' => 'Not authorized'], 401);
        }

        return $next($request);
    }
}
