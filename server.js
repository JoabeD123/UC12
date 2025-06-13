const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Para permitir requisições do frontend
const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs

const app = express();
const port = 3001; // Porta para o backend

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres', // Substitua pelo seu usuário do PostgreSQL
  host: 'localhost',
  database: 'gestao_familiar', // Substitua pelo nome do seu banco de dados
  password: '1234', // Substitua pela sua senha do PostgreSQL
  port: 5432, // Porta padrão do PostgreSQL
});

app.use(cors()); // Habilita o CORS para permitir requisições de diferentes origens (seu frontend)
app.use(express.json()); // Permite que o Express parseie requisições JSON

// Rota de teste para verificar a conexão com o banco de dados
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.status(200).send(`Conexão com o PostgreSQL estabelecida! Hora atual no DB: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Erro de conexão com o banco de dados:', err);
    res.status(500).send('Erro ao conectar com o banco de dados.');
  }
});

// Endpoint para criar as tabelas no banco de dados (executar uma vez)
app.get('/init-db', async (req, res) => {
  const schema = `
    -- Tabela de Usuários (Conta da Família)
    CREATE TABLE IF NOT EXISTS usuario (
        id_usuario SERIAL PRIMARY KEY,
        nome_familia VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Perfis (Membros da Família)
    CREATE TABLE IF NOT EXISTS perfil (
        id_perfil SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        categoria_familiar VARCHAR(50) NOT NULL,
        cod_perfil VARCHAR(10) UNIQUE NOT NULL,
        renda DECIMAL(10,2) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
    );

    -- Tabela de Categorias (Ex: Moradia, Alimentação, etc.)
    CREATE TABLE IF NOT EXISTS categoria (
        id_categoria SERIAL PRIMARY KEY,
        nome_categoria VARCHAR(100) NOT NULL UNIQUE
    );

    -- Tabelas de Lookup para Status, Tipos e Recorrências
    CREATE TABLE IF NOT EXISTS status_pagamento_tipo (
        id_status_pagamento_tipo SERIAL PRIMARY KEY,
        nome_status VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tipo_conta_tipo (
        id_tipo_conta_tipo SERIAL PRIMARY KEY,
        nome_tipo VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recorrencia_tipo (
        id_recorrencia_tipo SERIAL PRIMARY KEY,
        nome_recorrencia VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tabela_afetada_tipo (
        id_tabela_afetada_tipo SERIAL PRIMARY KEY,
        nome_tabela VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tipo_acao_tipo (
        id_tipo_acao_tipo SERIAL PRIMARY KEY,
        nome_acao VARCHAR(50) UNIQUE NOT NULL
    );

    -- Inserção inicial de dados nas tabelas de lookup (se não existirem)
    INSERT INTO status_pagamento_tipo (nome_status) VALUES
    ('pendente'), ('pago'), ('atrasado')
    ON CONFLICT (nome_status) DO NOTHING;

    INSERT INTO tipo_conta_tipo (nome_tipo) VALUES
    ('fixa'), ('variável')
    ON CONFLICT (nome_tipo) DO NOTHING;

    INSERT INTO recorrencia_tipo (nome_recorrencia) VALUES
    ('nenhuma'), ('mensal'), ('anual'), ('outro')
    ON CONFLICT (nome_recorrencia) DO NOTHING;

    INSERT INTO tabela_afetada_tipo (nome_tabela) VALUES
    ('contas'), ('receita')
    ON CONFLICT (nome_tabela) DO NOTHING;

    INSERT INTO tipo_acao_tipo (nome_acao) VALUES
    ('insercao'), ('atualizacao'), ('remocao')
    ON CONFLICT (nome_acao) DO NOTHING;

    -- Tabela de Contas (Despesas) - Atualizada com FOREIGN KEYs
    CREATE TABLE IF NOT EXISTS contas (
        id_conta SERIAL PRIMARY KEY,
        nome_conta VARCHAR(255) NOT NULL,
        valor_conta DECIMAL(10,2) NOT NULL,
        data_entrega DATE NOT NULL,
        data_vencimento DATE NOT NULL,
        status_pagamento_id INT DEFAULT (SELECT id_status_pagamento_tipo FROM status_pagamento_tipo WHERE nome_status = 'pendente'),
        descricao TEXT,
        tipo_conta_id INT DEFAULT (SELECT id_tipo_conta_tipo FROM tipo_conta_tipo WHERE nome_tipo = 'variável'),
        avisado BOOLEAN DEFAULT FALSE,
        recorrencia_id INT DEFAULT (SELECT id_recorrencia_tipo FROM recorrencia_tipo WHERE nome_recorrencia = 'nenhuma'),
        perfil_id INT,
        categoria_id INT,
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil),
        FOREIGN KEY (categoria_id) REFERENCES categoria(id_categoria),
        FOREIGN KEY (status_pagamento_id) REFERENCES status_pagamento_tipo(id_status_pagamento_tipo),
        FOREIGN KEY (tipo_conta_id) REFERENCES tipo_conta_tipo(id_tipo_conta_tipo),
        FOREIGN KEY (recorrencia_id) REFERENCES recorrencia_tipo(id_recorrencia_tipo)
    );

    -- Tabela de Receitas (Entradas de dinheiro)
    CREATE TABLE IF NOT EXISTS receita (
        id_receita SERIAL PRIMARY KEY,
        perfil_id INT NOT NULL,
        nome_receita VARCHAR(255) NOT NULL,
        valor_receita DECIMAL(10,2) NOT NULL,
        data_recebimento DATE NOT NULL,
        descricao TEXT,
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil)
    );

    -- Tabela de Histórico de Alterações (Auditoria) - Atualizada com FOREIGN KEYs
    CREATE TABLE IF NOT EXISTS historico_alteracoes (
        id_log SERIAL PRIMARY KEY,
        perfil_id INT NOT NULL,
        tabela_afetada_id INT NOT NULL,
        registro_id INT NOT NULL,
        tipo_acao_id INT NOT NULL,
        data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        detalhes TEXT,
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil),
        FOREIGN KEY (tabela_afetada_id) REFERENCES tabela_afetada_tipo(id_tabela_afetada_tipo),
        FOREIGN KEY (tipo_acao_id) REFERENCES tipo_acao_tipo(id_tipo_acao_tipo)
    );

    -- Tabela de Permissões por Perfil
    CREATE TABLE IF NOT EXISTS permissoes (
        id_permissao SERIAL PRIMARY KEY,
        perfil_id INT NOT NULL UNIQUE,
        pode_criar_conta BOOLEAN DEFAULT FALSE,
        pode_editar_conta BOOLEAN DEFAULT FALSE,
        pode_excluir_conta BOOLEAN DEFAULT FALSE,
        pode_ver_todas_contas BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil)
    );

    -- Tabela de Orçamento Mensal
    CREATE TABLE IF NOT EXISTS orcamento (
        id_orcamento SERIAL PRIMARY KEY,
        perfil_id INT NOT NULL,
        mes_ano VARCHAR(7) NOT NULL, -- formato: 'AAAA-MM'
        valor_limite DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil),
        UNIQUE (perfil_id, mes_ano)
    );
  `;

  try {
    const client = await pool.connect();
    await client.query(schema);
    client.release();
    res.status(200).send('Tabelas criadas ou já existentes no banco de dados.');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
    res.status(500).send('Erro ao inicializar o banco de dados.');
  }
});

// Endpoint de Registro de Usuário
app.post('/api/register', async (req, res) => {
  const { nome_familia, email, senha } = req.body;

  if (!nome_familia || !email || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const client = await pool.connect();
    
    try {
      // Inicia uma transação
      await client.query('BEGIN');
      
      // Verifica se o email já existe
      const checkEmail = await client.query('SELECT id_usuario FROM usuario WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(409).json({ message: 'Email já cadastrado.' });
      }

      // Insere o usuário
      const userResult = await client.query(
        'INSERT INTO usuario (nome_familia, email, senha) VALUES ($1, $2, $3) RETURNING id_usuario, nome_familia, email, criado_em, atualizado_em',
        [nome_familia, email, hashedPassword]
      );
      
      const newUser = userResult.rows[0];

      // Cria um perfil padrão para o usuário
      const perfilResult = await client.query(
        `INSERT INTO perfil (usuario_id, nome, categoria_familiar, cod_perfil, renda, is_admin) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [newUser.id_usuario, 'Administrador', 'Principal', 'ADM001', 0.00, true]
      );

      // Cria as permissões para o perfil
      await client.query(
        `INSERT INTO permissoes (perfil_id, pode_criar_conta, pode_editar_conta, pode_excluir_conta, pode_ver_todas_contas) 
         VALUES ($1, $2, $3, $4, $5)`,
        [perfilResult.rows[0].id_perfil, true, true, true, true]
      );

      // Commit da transação
      await client.query('COMMIT');

      // Retorna o usuário e o perfil criado
      res.status(201).json({ 
        message: 'Usuário registrado com sucesso!', 
        user: newUser,
        profile: perfilResult.rows[0]
      });

    } catch (err) {
      // Em caso de erro, faz rollback
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Erro no registro de usuário:', err);
    res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
});

// Endpoint de Login de Usuário
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const client = await pool.connect();

    // Busca o usuário pelo email
    const userResult = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      client.release();
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = userResult.rows[0];

    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      client.release();
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Busca o perfil do usuário
    const profileResult = await client.query(
      `SELECT p.*, perm.* 
       FROM perfil p 
       LEFT JOIN permissoes perm ON p.id_perfil = perm.perfil_id 
       WHERE p.usuario_id = $1`,
      [user.id_usuario]
    );

    // Remove a senha do objeto do usuário antes de enviar para o frontend
    delete user.senha;

    // Prepara o objeto de perfil com as permissões
    const profile = profileResult.rows[0];
    if (profile) {
      profile.permissoes = {
        verReceitas: true,
        verDespesas: true,
        editarReceitas: true,
        editarDespesas: true,
        gerenciarPerfis: true,
        verImpostoRenda: true
      };
    }

    client.release();
    res.status(200).json({ 
      message: 'Login bem-sucedido!', 
      user: user, 
      profiles: profile ? [profile] : [] 
    });

  } catch (err) {
    console.error('Erro no login de usuário:', err);
    res.status(500).json({ message: 'Erro ao fazer login.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
}); 