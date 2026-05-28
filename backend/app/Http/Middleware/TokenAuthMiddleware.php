<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TokenAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authorization = $request->header('Authorization');

        if (!$authorization || !str_starts_with($authorization, 'Bearer ')) {
            return response()->json([
                'detail' => 'Token de autorização ausente ou inválido no cabeçalho.'
            ], 401);
        }

        $token = substr($authorization, 7);
        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json([
                'detail' => 'Sessão expirada ou token de autorização inválido.'
            ], 401);
        }

        if (!$user->ativo) {
            return response()->json([
                'detail' => 'Esta conta de utilizador está desativada.'
            ], 403);
        }

        // Permite usar $request->user() nos controladores de forma nativa
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}
