<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contrato extends Model
{
    use HasFactory;

    protected $table = 'contratos';

    protected $fillable = [
        'funcionario_id',
        'tipo',
        'data_inicio',
        'data_fim',
        'salario_base',
        'ativo',
        'subsidio_alimentacao',
        'subsidio_transporte',
        'outros_subsidios',
    ];

    protected $casts = [
        'data_inicio' => 'date:Y-m-d',
        'data_fim' => 'date:Y-m-d',
        'salario_base' => 'float',
        'subsidio_alimentacao' => 'float',
        'subsidio_transporte' => 'float',
        'outros_subsidios' => 'float',
        'ativo' => 'boolean',
    ];

    /**
     * Get the employee that owns this contract.
     */
    public function funcionario()
    {
        return $this->belongsTo(Funcionario::class, 'funcionario_id');
    }
}
