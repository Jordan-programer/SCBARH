<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Authenticate user and return an API token.
     * Endpoint: POST /api/v1/auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'senha' => 'required|string',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('senha'), $user->password)) {
            return response()->json([
                'detail' => 'Credenciais de login inválidas. Por favor, verifique o e-mail e a senha.'
            ], 401);
        }

        if (!$user->ativo) {
            return response()->json([
                'detail' => 'Esta conta de utilizador está desativada.'
            ], 403);
        }

        // Gera um novo token aleatório e persiste na tabela users
        $token = Str::random(60);
        $user->api_token = $token;
        $user->save();

        return response()->json([
            'access_token' => $token,
            'refresh_token' => 'offline-refresh-token-' . Str::random(10),
            'token_type' => 'bearer'
        ]);
    }

    /**
     * Retrieve the authenticated user's profile.
     * Endpoint: GET /api/v1/usuarios/me
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'detail' => 'Não autenticado.'
            ], 401);
        }

        return response()->json([
            'id' => $user->id,
            'nome' => $user->nome,
            'email' => $user->email,
            'role' => $user->role,
            'ativo' => (bool) $user->ativo,
            'funcionario_id' => $user->funcionario_id,
            'morador_id' => $user->morador_id,
        ]);
    }

    /**
     * Terminate the session by clearing the token.
     * Endpoint: POST /api/v1/auth/logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->api_token = null;
            $user->save();
        }

        return response()->json(['message' => 'Sessão encerrada com sucesso.'], 204);
    }
}
