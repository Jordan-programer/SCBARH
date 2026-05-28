<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BiometriaController;
use App\Http\Controllers\ContratoController;
use App\Http\Controllers\FeriasController;
use App\Http\Controllers\FuncionarioController;
use App\Http\Middleware\TokenAuthMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui definimos todas as rotas da API v1 para o SCBARH.
|
*/

Route::prefix('v1')->group(function () {

    // Rotas Públicas (Sem necessidade de Token)
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Rotas Protegidas (Requer Token Bearer no cabeçalho Authorization)
    Route::middleware(TokenAuthMiddleware::class)->group(function () {

        // Autenticação e Perfil
        Route::get('/usuarios/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Funcionários CRUD
        Route::apiResource('funcionarios', FuncionarioController::class);

        // Contratos de Trabalho CRUD
        Route::apiResource('contratos', ContratoController::class);

        // Férias e Ausências CRUD
        Route::apiResource('ferias', FeriasController::class);

        // Integração Biométrica Realand A-C121
        Route::post('/biometria/ping', [BiometriaController::class, 'ping']);
        Route::post('/biometria/puxar-logs', [BiometriaController::class, 'puxarLogs']);
        Route::post('/biometria/sincronizar-usuarios', [BiometriaController::class, 'sincronizarUsuarios']);

    });
});
