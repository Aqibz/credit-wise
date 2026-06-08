<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'landlord';

    public function up(): void
    {
        Schema::connection($this->connection)->table('tenants', function (Blueprint $table): void {
            $table->timestamp('provisioned_at')->nullable()->after('status');
            $table->text('failed_reason')->nullable()->after('provisioned_at');
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->table('tenants', function (Blueprint $table): void {
            $table->dropColumn(['provisioned_at', 'failed_reason']);
        });
    }
};
