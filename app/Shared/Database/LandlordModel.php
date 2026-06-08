<?php

namespace App\Shared\Database;

use Illuminate\Database\Eloquent\Model;

abstract class LandlordModel extends Model
{
    protected $connection = 'landlord';
}
