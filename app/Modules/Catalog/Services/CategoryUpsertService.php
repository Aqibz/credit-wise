<?php

namespace App\Modules\Catalog\Services;

use App\Modules\Catalog\Models\Category;
use Illuminate\Support\Facades\DB;

class CategoryUpsertService
{
    public function handle(array $payload, ?Category $category = null): Category
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $category): Category {
            $category ??= new Category();
            $category->fill($payload)->save();

            return $category->refresh();
        });
    }
}
