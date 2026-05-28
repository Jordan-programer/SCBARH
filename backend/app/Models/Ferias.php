<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ferias extends Model
{
    use HasFactory;

    protected $table = 'ferias';

    protected $fillable = [
        'funcionario_id',
        'data_inicio',
        'data_fim',
        'dias_gozados',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'data_inicio' => 'date:Y-m-d',
        'data_fim' => 'date:Y-m-d',
        'dias_gozados' => 'integer',
    ];

    /**
     * Get the employee associated with this vacation.
     */
    public function funcionario()
    {
        return $this->belongsTo(Funcionario::class, 'funcionario_id');
    }
}
