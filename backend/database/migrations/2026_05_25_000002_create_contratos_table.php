<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('funcionario_id')->constrained('funcionarios')->onDelete('cascade');
            $table->string('tipo');
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->decimal('salario_base', 15, 2);
            $table->boolean('ativo')->default(true);
            $table->decimal('subsidio_alimentacao', 15, 2)->default(0);
            $table->decimal('subsidio_transporte', 15, 2)->default(0);
            $table->decimal('outros_subsidios', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
