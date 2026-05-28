<?php

namespace App\Http\Controllers;

use App\Models\Ferias;
use Illuminate\Http\Request;

class FeriasController extends Controller
{
    /**
     * Display a listing of vacations.
     * Endpoint: GET /api/v1/ferias
     */
    public function index()
    {
        $ferias = Ferias::all();
        return response()->json($ferias);
    }

    /**
     * Store a newly created vacation in database.
     * Endpoint: POST /api/v1/ferias
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'funcionario_id' => 'required|exists:funcionarios,id',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
            'dias_gozados' => 'required|integer|min:1',
            'status' => 'nullable|string|max:50',
            'observacoes' => 'nullable|string',
        ]);

        if (!isset($validated['status'])) {
            $validated['status'] = 'Pendente';
        }

        $ferias = Ferias::create($validated);

        return response()->json($ferias, 201);
    }

    /**
     * Display the specified vacation.
     * Endpoint: GET /api/v1/ferias/{id}
     */
    public function show($id)
    {
        $ferias = Ferias::find($id);

        if (!$ferias) {
            return response()->json(['detail' => 'Registo de férias não encontrado.'], 404);
        }

        return response()->json($ferias);
    }

    /**
     * Update the specified vacation (e.g. approve/reject).
     * Endpoint: PUT /api/v1/ferias/{id}
     */
    public function update(Request $request, $id)
    {
        $ferias = Ferias::find($id);

        if (!$ferias) {
            return response()->json(['detail' => 'Registo de férias não encontrado.'], 404);
        }

        $validated = $request->validate([
            'data_inicio' => 'sometimes|required|date',
            'data_fim' => 'sometimes|required|date|after_or_equal:data_inicio',
            'dias_gozados' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|string|max:50',
            'observacoes' => 'nullable|string',
        ]);

        $ferias->update($validated);

        return response()->json($ferias);
    }

    /**
     * Remove the specified vacation.
     * Endpoint: DELETE /api/v1/ferias/{id}
     */
    public function destroy($id)
    {
        $ferias = Ferias::find($id);

        if (!$ferias) {
            return response()->json(['detail' => 'Registo de férias não encontrado.'], 404);
        }

        $ferias->delete();

        return response()->json(null, 204);
    }
}
