<?php

namespace App\Shared\Authz;

class PermissionCatalog
{
    public static function all(): array
    {
        return [
            'customers.view',
            'customers.create',
            'customers.update',
            'customers.delete',
            'customers.blacklist.manage',
            'accounts.view',
            'accounts.manage',
            'accounts.post',
            'contracts.view',
            'contracts.create',
            'contracts.update',
            'contracts.approve',
            'installments.view',
            'payments.view',
            'payments.create',
            'catalog.view',
            'catalog.create',
            'catalog.update',
            'catalog.delete',
            'inventory.view',
            'inventory.manage',
            'purchases.view',
            'purchases.create',
            'purchases.update',
            'purchases.receive',
            'recovery.view',
            'recovery.manage',
            'support.view',
            'support.manage',
            'hr.view',
            'hr.manage',
            'hr.payroll.process',
        ];
    }
}
