<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'SCBARH API is online. Prefixo da API em /api/v1']);
});
