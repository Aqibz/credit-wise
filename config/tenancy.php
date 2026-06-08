<?php

return [
    'landlord_connection' => 'landlord',
    'tenant_connection' => 'tenant',
    'identify_by_domain' => filter_var(env('TENANCY_IDENTIFY_BY_DOMAIN', true), FILTER_VALIDATE_BOOL),
    'header' => env('TENANCY_HEADER', 'X-Tenant'),
];
