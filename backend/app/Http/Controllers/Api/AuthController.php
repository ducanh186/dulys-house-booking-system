<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Customer;
use App\Models\User;
use App\Services\PasswordResetOtpService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PasswordResetOtpService $passwordResetOtp,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
            'role' => 'guest',
        ]);

        // Auto-create customer profile
        Customer::create([
            'user_id' => $user->id,
            'full_name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Đăng ký thành công.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->error('Email hoặc mật khẩu không đúng.', 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Đăng nhập thành công.');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Đăng xuất thành công.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('customer', 'staff');

        return $this->success($user);
    }

    public function requestForgotPasswordOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $this->passwordResetOtp->request($validated['email']);

        return $this->success(
            null,
            'Nếu email tồn tại trong hệ thống, mã OTP đã được gửi.'
        );
    }

    public function resendForgotPasswordOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $this->passwordResetOtp->resend($validated['email']);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), $exception->getCode() ?: 400);
        }

        return $this->success(
            null,
            'Nếu email tồn tại trong hệ thống, mã OTP mới đã được gửi.'
        );
    }

    public function verifyForgotPasswordOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        try {
            $this->passwordResetOtp->verify(
                $validated['email'],
                $validated['otp'],
                $validated['password'],
            );
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), $exception->getCode() ?: 400);
        }

        return $this->success(null, 'Đặt lại mật khẩu thành công.');
    }
}
