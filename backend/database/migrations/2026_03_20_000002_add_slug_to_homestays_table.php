<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homestays', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name');
        });

        // Use the query builder instead of the Eloquent model so this migration
        // does not depend on soft-delete columns that are introduced later.
        foreach (DB::table('homestays')->select('id', 'name')->orderBy('created_at')->orderBy('id')->get() as $homestay) {
            $baseSlug = Str::slug($homestay->name) ?: 'homestay';
            $slug = $baseSlug;
            $suffix = 2;

            while (DB::table('homestays')->where('slug', $slug)->where('id', '!=', $homestay->id)->exists()) {
                $slug = "{$baseSlug}-{$suffix}";
                $suffix++;
            }

            DB::table('homestays')
                ->where('id', $homestay->id)
                ->update(['slug' => $slug]);
        }
    }

    public function down(): void
    {
        Schema::table('homestays', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
