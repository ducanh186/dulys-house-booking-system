<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homestays', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name');
        });

        // Generate slugs for existing rows
        foreach (\App\Models\Homestay::all() as $homestay) {
            $homestay->slug = Str::slug($homestay->name);
            $homestay->saveQuietly();
        }
    }

    public function down(): void
    {
        Schema::table('homestays', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
