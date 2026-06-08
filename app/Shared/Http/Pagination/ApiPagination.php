<?php

namespace App\Shared\Http\Pagination;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class ApiPagination
{
    public function perPage(Request $request, int $default = 15, int $max = 100): int
    {
        $requested = $request->integer('per_page', $default);

        return max(1, min($requested, $max));
    }

    public function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
