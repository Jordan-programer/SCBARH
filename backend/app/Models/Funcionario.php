<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Funcionario extends Model
{
    use HasFactory;

    protected $table = 'funcionarios';

    protected $fillable = [
        'nome',
        'nif',
        'bi',
        'data_nascimento',
        'genero',
        'telefone',
        'email',
        'endereco',
        'cargo',
        'departamento',
        'data_admissao',
        'ativo',
        'biometria_template',
    ];

    protected $casts = [
        'data_nascimento' => 'date:Y-m-d',
        'data_admissao' => 'date:Y-m-d',
        'ativo' => 'boolean',
    ];

    /**
     * Get the contracts associated with the employee.
     */
    public function contratos()
    {
        return $this->hasMany(Contrato::class, 'funcionario_id');
    }

    /**
     * Get the vacations associated with the employee.
     */
    public function ferias()
    {
        return $this->hasMany(Ferias::class, 'funcionario_id');
    }

    /**
     * Get the user account associated with the employee.
     */
    public function user()
    {
        return $this->hasOne(User::class, 'funcionario_id');
    }
}
