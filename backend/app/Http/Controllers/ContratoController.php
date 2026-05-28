<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    /**
     * Display a listing of contracts.
     * Endpoint: GET /api/v1/contratos
     */
    public function index()
    {
        $contratos = Contrato::all();
        return response()->json($contratos);
    }

    /**
     * Store a newly created contract in database.
     * Endpoint: POST /api/v1/contratos
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'funcionario_id' => 'required|exists:funcionarios,id',
            'tipo' => 'required|string|max:100',
            'data_inicio' => 'required|date',
            'data_fim' => 'nullable|date',
            'salario_base' => 'required|numeric',
            'ativo' => 'nullable|boolean',
            'subsidio_alimentacao' => 'nullable|numeric',
            'subsidio_transporte' => 'nullable|numeric',
            'outros_subsidios' => 'nullable|numeric',
        ]);

        if (!isset($validated['ativo'])) {
            $validated['ativo'] = true;
        }

        $contrato = Contrato::create($validated);

        return response()->json($contrato, 201);
    }

    /**
     * Display the specified contract.
     * Endpoint: GET /api/v1/contratos/{id}
     */
    public function show($id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json(['detail' => 'Contrato não encontrado.'], 404);
        }

        return response()->json($contrato);
    }

    /**
     * Update the specified contract.
     * Endpoint: PUT /api/v1/contratos/{id}
     */
    public function update(Request $request, $id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json(['detail' => 'Contrato não encontrado.'], 404);
        }

        $validated = $request->validate([
            'tipo' => 'sometimes|required|string|max:100',
            'data_inicio' => 'sometimes|required|date',
            'data_fim' => 'nullable|date',
            'salario_base' => 'sometimes|required|numeric',
            'ativo' => 'nullable|boolean',
            'subsidio_alimentacao' => 'nullable|numeric',
            'subsidio_transporte' => 'nullable|numeric',
            'outros_subsidios' => 'nullable|numeric',
        ]);

        $contrato->update($validated);

        return response()->json($contrato);
    }

    /**
     * Remove the specified contract.
     * Endpoint: DELETE /api/v1/contratos/{id}
     */
    public function destroy($id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json(['detail' => 'Contrato não encontrado.'], 404);
        }

        $contrato->delete();

        return response()->json(null, 204);
    }
}
