<?php

namespace Database\Seeders;

use App\Models\Contrato;
use App\Models\Ferias;
use App\Models\Funcionario;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Criar Funcionários
        $funcionariosData = [
            [
                'id' => 1,
                'nome' => 'Amélia Rodrigues Santos',
                'nif' => '123456789LA',
                'bi' => '123456789LA123',
                'data_nascimento' => '1988-04-15',
                'genero' => 'F',
                'telefone' => '+244 923 456 789',
                'email' => 'a.rodrigues@scbarh.ao',
                'endereco' => 'Luanda, Angola',
                'cargo' => 'Contabilista Sénior',
                'departamento' => 'Financeiro',
                'data_admissao' => '2019-03-15',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_AMELIA',
            ],
            [
                'id' => 2,
                'nome' => 'Domingos Ferreira Lopes',
                'nif' => '234567890LA',
                'bi' => '234567890LA123',
                'data_nascimento' => '1992-09-02',
                'genero' => 'M',
                'telefone' => '+244 912 345 678',
                'email' => 'd.lopes@scbarh.ao',
                'endereco' => 'Viana, Luanda',
                'cargo' => 'Engenheiro de Software',
                'departamento' => 'TI',
                'data_admissao' => '2020-07-02',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_DOMINGOS',
            ],
            [
                'id' => 3,
                'nome' => 'Carlos Eduardo Teixeira',
                'nif' => '345678901LA',
                'bi' => '345678901LA123',
                'data_nascimento' => '1985-11-20',
                'genero' => 'M',
                'telefone' => '+244 934 567 890',
                'email' => 'c.teixeira@scbarh.ao',
                'endereco' => 'Maianga, Luanda',
                'cargo' => 'Supervisor de Linha',
                'departamento' => 'Operações',
                'data_admissao' => '2021-01-10',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_CARLOS',
            ],
            [
                'id' => 4,
                'nome' => 'Beatriz Matos Oliveira',
                'nif' => '456789012LA',
                'bi' => '456789012LA123',
                'data_nascimento' => '1990-07-22',
                'genero' => 'F',
                'telefone' => '+244 945 678 901',
                'email' => 'b.matos@scbarh.ao',
                'endereco' => 'Talatona, Luanda',
                'cargo' => 'Técnica de Recursos Humanos',
                'departamento' => 'RH',
                'data_admissao' => '2018-09-22',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_BEATRIZ',
            ],
            [
                'id' => 5,
                'nome' => 'Filomena Neto da Silva',
                'nif' => '567890123LA',
                'bi' => '567890123LA123',
                'data_nascimento' => '1989-01-30',
                'genero' => 'F',
                'telefone' => '+244 956 789 012',
                'email' => 'f.neto@scbarh.ao',
                'endereco' => 'Luanda Sul, Angola',
                'cargo' => 'Gestora de Vendas',
                'departamento' => 'Comercial',
                'data_admissao' => '2022-04-05',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_FILOMENA',
            ],
            [
                'id' => 6,
                'nome' => 'Hélder António Cardoso',
                'nif' => '678901234LA',
                'bi' => '678901234LA123',
                'data_nascimento' => '1991-06-14',
                'genero' => 'M',
                'telefone' => '+244 967 890 123',
                'email' => 'h.cardoso@scbarh.ao',
                'endereco' => 'Cazenga, Luanda',
                'cargo' => 'Coordenador de Armazém',
                'departamento' => 'Logística',
                'data_admissao' => '2020-11-14',
                'ativo' => true,
                'biometria_template' => null, // Registrado mas sem template validado
            ],
            [
                'id' => 7,
                'nome' => 'Ivone Maria Ferreira',
                'nif' => '789012345LA',
                'bi' => '789012345LA123',
                'data_nascimento' => '1995-12-08',
                'genero' => 'F',
                'telefone' => '+244 978 901 234',
                'email' => 'i.ferreira@scbarh.ao',
                'endereco' => 'Samba, Luanda',
                'cargo' => 'Técnica de Suporte TI',
                'departamento' => 'Suporte',
                'data_admissao' => '2021-06-28',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_IVONE',
            ],
            [
                'id' => 8,
                'nome' => 'Jorge Manuel Sebastião',
                'nif' => '890123456LA',
                'bi' => '890123456LA123',
                'data_nascimento' => '1993-02-03',
                'genero' => 'M',
                'telefone' => '+244 989 012 345',
                'email' => 'j.sebastiao@scbarh.ao',
                'endereco' => 'Rangel, Luanda',
                'cargo' => 'Operador de Produção',
                'departamento' => 'Operações',
                'data_admissao' => '2023-02-03',
                'ativo' => true,
                'biometria_template' => null, // Falhou registro
            ],
            [
                'id' => 9,
                'nome' => 'Lurdes Conceição Pinto',
                'nif' => '901234567LA',
                'bi' => '901234567LA123',
                'data_nascimento' => '1987-10-17',
                'genero' => 'F',
                'telefone' => '+244 900 123 456',
                'email' => 'l.pinto@scbarh.ao',
                'endereco' => 'Cacuaco, Luanda',
                'cargo' => 'Assistente Financeira',
                'departamento' => 'Financeiro',
                'data_admissao' => '2019-08-17',
                'ativo' => false, // Inativo
                'biometria_template' => 'TEMPLATE_VALIDO_LURDES',
            ],
            [
                'id' => 10,
                'nome' => 'Manuel António Afonso',
                'nif' => '012345678LA',
                'bi' => '012345678LA123',
                'data_nascimento' => '1983-05-01',
                'genero' => 'M',
                'telefone' => '+244 911 234 567',
                'email' => 'm.afonso@scbarh.ao',
                'endereco' => 'Palanca, Luanda',
                'cargo' => 'Administrador de Sistemas',
                'departamento' => 'TI',
                'data_admissao' => '2017-01-01',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_MANUEL',
            ],
            [
                'id' => 11,
                'nome' => 'Natália Sousa Mendes',
                'nif' => '112345678LA',
                'bi' => '112345678LA123',
                'data_nascimento' => '1994-08-12',
                'genero' => 'F',
                'telefone' => '+244 922 345 678',
                'email' => 'n.mendes@scbarh.ao',
                'endereco' => 'Patrice Lumumba, Luanda',
                'cargo' => 'Representante Comercial',
                'departamento' => 'Comercial',
                'data_admissao' => '2022-05-12',
                'ativo' => true,
                'biometria_template' => 'TEMPLATE_VALIDO_NATALIA',
            ],
            [
                'id' => 12,
                'nome' => 'Pedro Augusto Alves',
                'nif' => '212345678LA',
                'bi' => '212345678LA123',
                'data_nascimento' => '1986-03-20',
                'genero' => 'M',
                'telefone' => '+244 933 456 789',
                'email' => 'p.alves@scbarh.ao',
                'endereco' => 'Mubanga, Luanda',
                'cargo' => 'Chefe de Turno',
                'departamento' => 'Operações',
                'data_admissao' => '2020-03-20',
                'ativo' => true,
                'biometria_template' => null, // Bloqueado/Falha
            ],
        ];

        foreach ($funcionariosData as $func) {
            Funcionario::create($func);
        }

        // 2. Criar Contratos
        $contratosData = [
            ['funcionario_id' => 1, 'tipo' => 'Efectivo', 'data_inicio' => '2019-03-15', 'salario_base' => 450000.00, 'subsidio_alimentacao' => 40000, 'subsidio_transporte' => 30000],
            ['funcionario_id' => 2, 'tipo' => 'Efectivo', 'data_inicio' => '2020-07-02', 'salario_base' => 520000.00, 'subsidio_alimentacao' => 40000, 'subsidio_transporte' => 35000],
            ['funcionario_id' => 3, 'tipo' => 'Efectivo', 'data_inicio' => '2021-01-10', 'salario_base' => 380000.00, 'subsidio_alimentacao' => 30000, 'subsidio_transporte' => 25000],
            ['funcionario_id' => 4, 'tipo' => 'Efectivo', 'data_inicio' => '2018-09-22', 'salario_base' => 480000.00, 'subsidio_alimentacao' => 40000, 'subsidio_transporte' => 30000],
            ['funcionario_id' => 5, 'tipo' => 'Efectivo', 'data_inicio' => '2022-04-05', 'salario_base' => 490000.00, 'subsidio_alimentacao' => 35000, 'subsidio_transporte' => 30000],
            ['funcionario_id' => 6, 'tipo' => 'Prazo Certo', 'data_inicio' => '2020-11-14', 'data_fim' => '2026-06-14', 'salario_base' => 350000.00, 'subsidio_alimentacao' => 30000, 'subsidio_transporte' => 20000],
            ['funcionario_id' => 7, 'tipo' => 'Efectivo', 'data_inicio' => '2021-06-28', 'salario_base' => 360000.00, 'subsidio_alimentacao' => 35000, 'subsidio_transporte' => 25000],
            ['funcionario_id' => 8, 'tipo' => 'Prazo Certo', 'data_inicio' => '2023-02-03', 'data_fim' => '2025-02-03', 'salario_base' => 280000.00, 'subsidio_alimentacao' => 25000, 'subsidio_transporte' => 15000],
            ['funcionario_id' => 9, 'tipo' => 'Prazo Incerto', 'data_inicio' => '2019-08-17', 'salario_base' => 320000.00, 'ativo' => false],
            ['funcionario_id' => 10, 'tipo' => 'Efectivo', 'data_inicio' => '2017-01-01', 'salario_base' => 680000.00, 'subsidio_alimentacao' => 50000, 'subsidio_transporte' => 40000],
            ['funcionario_id' => 11, 'tipo' => 'Efectivo', 'data_inicio' => '2022-05-12', 'salario_base' => 420000.00, 'subsidio_alimentacao' => 35000, 'subsidio_transporte' => 25000],
            ['funcionario_id' => 12, 'tipo' => 'Prazo Certo', 'data_inicio' => '2020-03-20', 'data_fim' => '2026-06-20', 'salario_base' => 390000.00, 'subsidio_alimentacao' => 30000, 'subsidio_transporte' => 25000],
        ];

        foreach ($contratosData as $cnt) {
            Contrato::create($cnt);
        }

        // 3. Criar Registo de Férias e Ausências
        $feriasData = [
            ['funcionario_id' => 3, 'data_inicio' => '2026-07-14', 'data_fim' => '2026-07-28', 'dias_gozados' => 11, 'status' => 'Aprovado', 'observacoes' => 'Férias anuais programadas'],
            ['funcionario_id' => 6, 'data_inicio' => '2026-06-01', 'data_fim' => '2026-06-30', 'dias_gozados' => 22, 'status' => 'Aprovado', 'observacoes' => 'Recuperação cirúrgica'],
            ['funcionario_id' => 5, 'data_inicio' => '2026-08-04', 'data_fim' => '2026-08-15', 'dias_gozados' => 10, 'status' => 'Pendente', 'observacoes' => 'Férias anuais'],
            ['funcionario_id' => 7, 'data_inicio' => '2026-05-22', 'data_fim' => '2026-05-22', 'dias_gozados' => 1, 'status' => 'Pendente', 'observacoes' => 'Consulta médica urgente'],
            ['funcionario_id' => 8, 'data_inicio' => '2026-05-19', 'data_fim' => '2026-05-19', 'dias_gozados' => 1, 'status' => 'Pendente', 'observacoes' => 'Sem justificação apresentada'],
            ['funcionario_id' => 1, 'data_inicio' => '2026-09-01', 'data_fim' => '2026-09-12', 'dias_gozados' => 10, 'status' => 'Pendente', 'observacoes' => 'Férias anuais'],
            ['funcionario_id' => 2, 'data_inicio' => '2026-06-10', 'data_fim' => '2026-06-17', 'dias_gozados' => 6, 'status' => 'Aprovado', 'observacoes' => 'Nascimento de filho'],
            ['funcionario_id' => 11, 'data_inicio' => '2026-07-21', 'data_fim' => '2026-08-01', 'dias_gozados' => 10, 'status' => 'Rejeitado', 'observacoes' => 'Férias anuais'],
        ];

        foreach ($feriasData as $fer) {
            Ferias::create($fer);
        }

        // 4. Criar Utilizadores para acesso ao sistema
        $usersData = [
            [
                'nome' => 'Beatriz Matos Oliveira',
                'email' => 'b.matos@scbarh.ao',
                'password' => Hash::make('password123'),
                'role' => 'ADMIN_RH',
                'ativo' => true,
                'funcionario_id' => 4,
            ],
            [
                'nome' => 'Carlos Eduardo Teixeira',
                'email' => 'c.teixeira@scbarh.ao',
                'password' => Hash::make('password123'),
                'role' => 'GESTOR',
                'ativo' => true,
                'funcionario_id' => 3,
            ],
            [
                'nome' => 'Super Administrador',
                'email' => 'admin@scbarh.ao',
                'password' => Hash::make('admin123'),
                'role' => 'SUPER_ADMIN',
                'ativo' => true,
                'funcionario_id' => null,
            ],
            [
                'nome' => 'Amélia Rodrigues Santos',
                'email' => 'a.rodrigues@scbarh.ao',
                'password' => Hash::make('password123'),
                'role' => 'FUNCIONARIO',
                'ativo' => true,
                'funcionario_id' => 1,
            ],
            [
                'nome' => 'Domingos Ferreira Lopes',
                'email' => 'd.lopes@scbarh.ao',
                'password' => Hash::make('password123'),
                'role' => 'FUNCIONARIO',
                'ativo' => true,
                'funcionario_id' => 2,
            ],
            [
                'nome' => 'Administrador Demo',
                'email' => 'admin_demo@scbarh.ao',
                'password' => Hash::make('Admin@2026'),
                'role' => 'SUPER_ADMIN',
                'ativo' => true,
                'funcionario_id' => null,
            ],
            [
                'nome' => 'Responsável RH Demo',
                'email' => 'rh@scbarh.ao',
                'password' => Hash::make('RhScb@2026'),
                'role' => 'ADMIN_RH',
                'ativo' => true,
                'funcionario_id' => null,
            ],
            [
                'nome' => 'Supervisor Demo',
                'email' => 'supervisor@scbarh.ao',
                'password' => Hash::make('Supv@2026'),
                'role' => 'GESTOR',
                'ativo' => true,
                'funcionario_id' => null,
            ],
        ];

        foreach ($usersData as $usr) {
            User::create($usr);
        }
    }
}
