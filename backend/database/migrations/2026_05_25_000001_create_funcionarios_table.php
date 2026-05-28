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
        Schema::create('funcionarios', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('nif', 50)->nullable();
            $table->string('bi', 50);
            $table->date('data_nascimento');
            $table->char('genero', 1);
            $table->string('telefone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('endereco', 255)->nullable();
            $table->string('cargo');
            $table->string('departamento');
            $table->date('data_admissao');
            $table->boolean('ativo')->default(true);
            $table->text('biometria_template')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funcionarios');
    }
};
