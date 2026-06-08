<?php

namespace App\Modules\Contracts\Enums;

enum ContractStatus: string
{
    case UnderProcess = 'Under Process';
    case UnderVerification = 'Under Verification';
    case UnderApproval = 'Under Approval';
    case Approved = 'Approved';
    case Rejected = 'Rejected';
    case Closed = 'Closed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::UnderProcess => in_array($target, [self::UnderVerification, self::Rejected], true),
            self::UnderVerification => in_array($target, [self::UnderApproval, self::Rejected], true),
            self::UnderApproval => in_array($target, [self::Approved, self::Rejected], true),
            self::Approved => $target === self::Closed,
            self::Rejected, self::Closed => false,
        };
    }
}
