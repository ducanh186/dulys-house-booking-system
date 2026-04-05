<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveInternalAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isStaff()) {
            return $next($request);
        }

        $user->loadMissing('staff');

        if ($user->staff?->is_active) {
            return $next($request);
        }

        $user->currentAccessToken()?->delete();

        return new JsonResponse([
            'success' => false,
            'message' => 'Tài khoản nội bộ đã bị vô hiệu hóa.',
        ], 403);
    }
}
