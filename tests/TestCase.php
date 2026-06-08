<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected array $connectionsToTransact = ['landlord', 'tenant'];

    protected function setUp(): void
    {
        parent::setUp();
    }
}
