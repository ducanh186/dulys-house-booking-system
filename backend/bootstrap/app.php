<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EnsureActiveInternalAccount;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => CheckRole::class,
            'active.internal' => EnsureActiveInternalAccount::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dữ liệu.',
            ], 404);
        });

        $exceptions->renderable(function (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Chưa đăng nhập.',
            ], 401);
        });

        $exceptions->renderable(function (AccessDeniedHttpException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền truy cập.',
            ], 403);
        });

        $exceptions->renderable(function (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        });

        $exceptions->renderable(function (ThrottleRequestsException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.',
            ], 429, $e->getHeaders());
        });
    })->create();
