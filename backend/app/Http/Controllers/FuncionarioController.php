<?php

namespace App\Http\Controllers;

use App\Models\Funcionario;
use Illuminate\Http\Request;

class FuncionarioController extends Controller
{
    /**
     * Display a listing of employees.
     * Endpoint: GET /api/v1/funcionarios
     */
    public function index()
    {
        $funcionarios = Funcionario::orderBy('nome', 'asc')->get();
        return response()->json($funcionarios);
    }

    /**
     * Store a newly created employee in database.
     * Endpoint: POST /api/v1/funcionarios
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'nif' => 'nullable|string|max:50',
            'bi' => 'required|string|max:50',
            'data_nascimento' => 'required|date',
            'genero' => 'required|string|max:1',
            'telefone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'endereco' => 'nullable|string|max:255',
            'cargo' => 'required|string|max:100',
            'departamento' => 'required|string|max:100',
            'data_admissao' => 'required|date',
            'ativo' => 'nullable|boolean',
            'biometria_template' => 'nullable|string',
        ]);

        // Default 'ativo' to true if not specified
        if (!isset($validated['ativo'])) {
            $validated['ativo'] = true;
        }

        $funcionario = Funcionario::create($validated);

        return response()->json($funcionario, 201);
    }

    /**
     * Display the specified employee.
     * Endpoint: GET /api/v1/funcionarios/{id}
     */
    public function show($id)
    {
        $funcionario = Funcionario::find($id);

        if (!$funcionario) {
            return response()->json(['detail' => 'Funcionário não encontrado.'], 404);
        }

        return response()->json($funcionario);
    }

    /**
     * Update the specified employee.
     * Endpoint: PUT /api/v1/funcionarios/{id}
     */
    public function update(Request $request, $id)
    {
        $funcionario = Funcionario::find($id);

        if (!$funcionario) {
            return response()->json(['detail' => 'Funcionário não encontrado.'], 404);
        }

        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'nif' => 'nullable|string|max:50',
            'bi' => 'sometimes|required|string|max:50',
            'data_nascimento' => 'sometimes|required|date',
            'genero' => 'sometimes|required|string|max:1',
            'telefone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'endereco' => 'nullable|string|max:255',
            'cargo' => 'sometimes|required|string|max:100',
            'departamento' => 'sometimes|required|string|max:100',
            'data_admissao' => 'sometimes|required|date',
            'ativo' => 'nullable|boolean',
            'biometria_template' => 'nullable|string',
        ]);

        $funcionario->update($validated);

        return response()->json($funcionario);
    }

    /**
     * Remove the specified employee.
     * Endpoint: DELETE /api/v1/funcionarios/{id}
     */
    public function destroy($id)
    {
        $funcionario = Funcionario::find($id);

        if (!$funcionario) {
            return response()->json(['detail' => 'Funcionário não encontrado.'], 404);
        }

        $funcionario->delete();

        return response()->json(null, 204);
    }
}
