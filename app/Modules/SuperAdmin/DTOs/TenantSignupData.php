<?php

namespace App\Modules\SuperAdmin\DTOs;

class TenantSignupData
{
    public function __construct(
        public readonly string $companyName,
        public readonly string $companySlug,
        public readonly string $adminName,
        public readonly string $adminEmail,
        public readonly string $password,
        public readonly string $planSlug,
    ) {
    }

    public static function fromArray(array $payload): self
    {
        return new self(
            companyName: $payload['company_name'],
            companySlug: $payload['company_slug'],
            adminName: $payload['admin_name'],
            adminEmail: $payload['admin_email'],
            password: $payload['password'],
            planSlug: $payload['plan_slug'] ?? 'starter',
        );
    }
}
