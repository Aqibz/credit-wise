<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->dropIfExists('blacklist_entries');
        Schema::connection($this->connection)->dropIfExists('customer_guarantors');
        Schema::connection($this->connection)->dropIfExists('customers');

        Schema::connection($this->connection)->create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('cnic')->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('status')->default('active');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('customer_guarantors', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('name');
            $table->string('cnic');
            $table->string('phone')->nullable();
            $table->string('relationship')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('blacklist_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('cnic')->index();
            $table->string('reason');
            $table->string('status')->default('active');
            $table->timestamp('listed_at')->nullable();
            $table->timestamp('cleared_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('blacklist_entries');
        Schema::connection($this->connection)->dropIfExists('customer_guarantors');
        Schema::connection($this->connection)->dropIfExists('customers');
    }
};
