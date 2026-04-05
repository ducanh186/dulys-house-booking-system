<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInternalAccountRequest;
use App\Http\Requests\Admin\UpdateInternalAccountRequest;
use App\Http\Resources\Admin\InternalAccountResource;
use App\Models\Staff;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminUserAccountController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'in:admin,owner,staff'],
        ]);

        $query = User::query()
            ->internal()
            ->whereHas('staff')
            ->with('staff');

        $search = trim((string) ($validated['search'] ?? ''));
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('staff', function ($staffQuery) use ($search) {
                        $staffQuery
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($validated['role'])) {
            $query->where('role', $validated['role']);
        }

        $accounts = $query
            ->orderByDesc('created_at')
            ->paginate(15);

        return $this->paginated(
            $accounts,
            data: InternalAccountResource::collection($accounts->getCollection())
        );
    }

    public function store(StoreInternalAccountRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $temporaryPassword = sprintf(
            '%s%s',
            Str::upper(Str::random(4)),
            random_int(100000, 999999)
        );

        /** @var User $user */
        $user = DB::transaction(function () use ($validated, $temporaryPassword) {
            $user = User::create([
                'name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'role' => $validated['role'],
                'password' => $temporaryPassword,
            ]);

            $this->syncStaffProfile($user, $validated);

            return $user->fresh('staff');
        });

        return $this->success([
            'account' => (new InternalAccountResource($user))->resolve(),
            'temporary_password' => $temporaryPassword,
        ], 'Tạo tài khoản nội bộ thành công.', 201);
    }

    public function update(UpdateInternalAccountRequest $request, User $user): JsonResponse
    {
        $user = $this->resolveManagedUser($user);
        $validated = $request->validated();

        $this->guardAccessMutation($request->user(), $user, $validated['role'], $validated['is_active']);

        DB::transaction(function () use ($user, $validated) {
            $user->update([
                'name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'role' => $validated['role'],
            ]);

            $this->syncStaffProfile($user, $validated);

            if (!$validated['is_active']) {
                $user->tokens()->delete();
            }
        });

        return $this->success(
            new InternalAccountResource($user->fresh('staff')),
            'Cập nhật tài khoản nội bộ thành công.'
        );
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user = $this->resolveManagedUser($user);

        $this->guardAccessMutation($request->user(), $user, $user->role, $validated['is_active']);

        DB::transaction(function () use ($user, $validated) {
            $staff = $this->ensureStaffProfile($user);
            $staff->update(['is_active' => $validated['is_active']]);

            if (!$validated['is_active']) {
                $user->tokens()->delete();
            }
        });

        return $this->success(
            new InternalAccountResource($user->fresh('staff')),
            $validated['is_active'] ? 'Kích hoạt tài khoản thành công.' : 'Vô hiệu hóa tài khoản thành công.'
        );
    }

    private function resolveManagedUser(User $user): User
    {
        abort_unless($user->isStaff(), 404);

        $user->loadMissing('staff');
        $this->ensureStaffProfile($user);

        return $user;
    }

    private function ensureStaffProfile(User $user): Staff
    {
        return $user->staff()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'role_title' => $this->roleTitleFor($user->role),
                'is_active' => true,
            ]
        );
    }

    private function syncStaffProfile(User $user, array $validated): void
    {
        $staff = $this->ensureStaffProfile($user);

        $staff->update([
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'],
            'role_title' => $this->roleTitleFor($validated['role']),
            'is_active' => $validated['is_active'] ?? true,
        ]);
    }

    private function guardAccessMutation(User $actor, User $target, string $nextRole, bool $nextActive): void
    {
        if ($actor->is($target) && (!$nextActive || $nextRole !== 'admin')) {
            throw ValidationException::withMessages([
                'access' => ['Không thể tự thay đổi quyền truy cập của tài khoản đang đăng nhập.'],
            ]);
        }

        if ($this->wouldLeaveNoActiveAdmins($target, $nextRole, $nextActive)) {
            throw ValidationException::withMessages([
                'role' => ['Hệ thống phải luôn có ít nhất một quản trị viên đang hoạt động.'],
            ]);
        }
    }

    private function wouldLeaveNoActiveAdmins(User $target, string $nextRole, bool $nextActive): bool
    {
        $otherActiveAdmins = User::query()
            ->internal()
            ->where('role', 'admin')
            ->whereKeyNot($target->id)
            ->whereHas('staff', fn ($query) => $query->where('is_active', true))
            ->count();

        $targetRemainsActiveAdmin = $nextRole === 'admin' && $nextActive;

        return ($otherActiveAdmins + ($targetRemainsActiveAdmin ? 1 : 0)) < 1;
    }

    private function roleTitleFor(string $role): string
    {
        return match ($role) {
            'admin' => 'Quản trị',
            'owner' => 'Quản lý',
            default => 'Lễ tân',
        };
    }
}
