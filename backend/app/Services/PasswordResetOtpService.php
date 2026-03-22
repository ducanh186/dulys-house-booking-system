<?php

namespace App\Services;

use App\Mail\PasswordResetOtpMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetOtpService
{
    public const OTP_EXPIRY_MINUTES = 10;

    public const RESEND_THROTTLE_SECONDS = 60;

    public function request(string $email): void
    {
        $this->issueOtp($email);
    }

    public function resend(string $email): void
    {
        $normalizedEmail = $this->normalizeEmail($email);
        $existing = DB::table('password_reset_tokens')
            ->where('email', $normalizedEmail)
            ->first();

        if ($existing?->created_at) {
            $createdAt = Carbon::parse($existing->created_at);

            if ($createdAt->copy()->addSeconds(self::RESEND_THROTTLE_SECONDS)->isFuture()) {
                throw new \RuntimeException('Vui lòng chờ 60 giây trước khi gửi lại mã OTP.', 429);
            }
        }

        $this->issueOtp($normalizedEmail);
    }

    public function verify(string $email, string $otp, string $password): void
    {
        $normalizedEmail = $this->normalizeEmail($email);

        $tokenRow = DB::table('password_reset_tokens')
            ->where('email', $normalizedEmail)
            ->first();

        if (!$tokenRow) {
            throw new \RuntimeException('Mã OTP không hợp lệ hoặc đã hết hạn.', 422);
        }

        $createdAt = Carbon::parse($tokenRow->created_at);

        if ($createdAt->copy()->addMinutes(self::OTP_EXPIRY_MINUTES)->isPast()) {
            DB::table('password_reset_tokens')
                ->where('email', $normalizedEmail)
                ->delete();

            throw new \RuntimeException('Mã OTP không hợp lệ hoặc đã hết hạn.', 422);
        }

        if (!Hash::check($otp, $tokenRow->token)) {
            throw new \RuntimeException('Mã OTP không hợp lệ hoặc đã hết hạn.', 422);
        }

        $user = User::where('email', $normalizedEmail)->first();

        if (!$user) {
            DB::table('password_reset_tokens')
                ->where('email', $normalizedEmail)
                ->delete();

            throw new \RuntimeException('Mã OTP không hợp lệ hoặc đã hết hạn.', 422);
        }

        $user->forceFill([
            'password' => $password,
        ])->save();

        DB::table('password_reset_tokens')
            ->where('email', $normalizedEmail)
            ->delete();
    }

    protected function issueOtp(string $email): void
    {
        $normalizedEmail = $this->normalizeEmail($email);
        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $normalizedEmail],
            [
                'token' => Hash::make($otp),
                'created_at' => now(),
            ],
        );

        $user = User::where('email', $normalizedEmail)->first();

        if (!$user) {
            return;
        }

        Mail::to($normalizedEmail)->send(new PasswordResetOtpMail(
            $user->name,
            $otp,
            self::OTP_EXPIRY_MINUTES,
        ));
    }

    protected function normalizeEmail(string $email): string
    {
        return Str::lower(trim($email));
    }
}
