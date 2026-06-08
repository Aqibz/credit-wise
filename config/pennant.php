<?php

return [
    'default' => env('PENNANT_STORE', 'database'),

    'stores' => [
        'array' => [
            'driver' => 'array',
        ],

        'database' => [
            'driver' => 'database',
            'connection' => 'landlord',
            'table' => 'features',
        ],
    ],
];
