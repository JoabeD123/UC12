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

// Endpoint para inicializar/reiniciar o banco de dados
app.get('/init-db', async (req, res) => {
  const dropSchema = `
    DROP TABLE IF EXISTS orcamento CASCADE;
    DROP TABLE IF EXISTS historico_alteracoes CASCADE;
    DROP TABLE IF EXISTS receita CASCADE;
    DROP TABLE IF EXISTS contas CASCADE;
    DROP TABLE IF EXISTS permissoes CASCADE;
    DROP TABLE IF EXISTS perfil CASCADE;
    DROP TABLE IF EXISTS usuario CASCADE;
    DROP TABLE IF EXISTS categoria CASCADE;
    DROP TABLE IF EXISTS status_pagamento_tipo CASCADE;
    DROP TABLE IF EXISTS tipo_conta_tipo CASCADE;
    DROP TABLE IF EXISTS recorrencia_tipo CASCADE;
    DROP TABLE IF EXISTS tabela_afetada_tipo CASCADE;
    DROP TABLE IF EXISTS tipo_acao_tipo CASCADE;
    DROP TABLE IF EXISTS cartao_credito CASCADE;
  `;

  const createSchema = `
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
        renda DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        senha VARCHAR(255) NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
    );

    -- Tabela de Categorias (Ex: Moradia, Alimentação, etc.)
    CREATE TABLE IF NOT EXISTS categoria (
        id_categoria SERIAL PRIMARY KEY,
        nome_categoria VARCHAR(100) NOT NULL UNIQUE,
        tipo_categoria VARCHAR(20) NOT NULL -- 'receita' ou 'despesa'
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

    -- Inserir categorias pré-definidas
    INSERT INTO categoria (nome_categoria, tipo_categoria) VALUES
    -- Categorias de Receitas
    ('Salário', 'receita'),
    ('Freelancer', 'receita'),
    ('Investimentos', 'receita'),
    ('Aluguel', 'receita'),
    ('Outros (Receita)', 'receita'),
    -- Categorias de Despesas
    ('Moradia', 'despesa'),
    ('Alimentação', 'despesa'),
    ('Transporte', 'despesa'),
    ('Saúde', 'despesa'),
    ('Educação', 'despesa'),
    ('Lazer', 'despesa'),
    ('Vestuário', 'despesa'),
    ('Contas', 'despesa'),
    ('Impostos', 'despesa'),
    ('Outros (Despesa)', 'despesa')
    ON CONFLICT (nome_categoria) DO NOTHING;

    -- Tabela de Contas (Despesas) - Atualizada com FOREIGN KEYs
    CREATE TABLE IF NOT EXISTS contas (
        id_conta SERIAL PRIMARY KEY,
        nome_conta VARCHAR(255) NOT NULL,
        valor_conta DECIMAL(10,2) NOT NULL,
        data_entrega DATE NOT NULL,
        data_vencimento DATE NOT NULL,
        status_pagamento_id INT,
        descricao TEXT,
        tipo_conta_id INT,
        avisado BOOLEAN DEFAULT FALSE,
        recorrencia_id INT,
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
        categoria_id INT,
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil),
        FOREIGN KEY (categoria_id) REFERENCES categoria(id_categoria)
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

    -- Tabela de Cartões de Crédito
    CREATE TABLE IF NOT EXISTS cartao_credito (
        id_cartao SERIAL PRIMARY KEY,
        perfil_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        limite DECIMAL(10,2) NOT NULL,
        dia_vencimento INT NOT NULL,
        bandeira VARCHAR(50) NOT NULL,
        gastos DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (perfil_id) REFERENCES perfil(id_perfil)
    );

    -- Tabela de Faturas de Cartão de Crédito
    CREATE TABLE IF NOT EXISTS fatura_cartao (
        id_fatura SERIAL PRIMARY KEY,
        id_cartao INT NOT NULL,
        mes_ano VARCHAR(7) NOT NULL, -- 'AAAA-MM' do mês de vencimento
        valor_fechado DECIMAL(10,2) NOT NULL,
        valor_pago DECIMAL(10,2) DEFAULT 0,
        data_fechamento DATE NOT NULL,
        paga BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (id_cartao) REFERENCES cartao_credito(id_cartao)
    );
  `;

  try {
    const client = await pool.connect();
    console.log('Conexão com o banco estabelecida para init-db.');
    // Excluir tabelas existentes (para garantir um estado limpo)
    console.log('Excluindo tabelas existentes...');
    await client.query(dropSchema);
    console.log('Tabelas excluídas com sucesso (se existiam).');
    
    // Criar tabelas
    console.log('Criando tabelas...');
    await client.query(createSchema);
    console.log('Tabelas criadas com sucesso.');
    
    client.release();
    res.status(200).send('Banco de dados inicializado/reiniciado com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err); // Loga o erro completo
    res.status(500).send('Erro ao inicializar o banco de dados.');
  }
});

// Endpoint de Registro de Usuário
app.post('/api/register', async (req, res) => {
  const { nome_familia, email, senha } = req.body;
  console.log('Recebendo requisição de registro:', { nome_familia, email });

  if (!nome_familia || !email || !senha) {
    console.log('Campos obrigatórios faltando');
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    console.log('Iniciando processo de registro');
    const hashedPassword = await bcrypt.hash(senha, 10);
    console.log('Senha hasheada com sucesso');
    
    const client = await pool.connect();
    console.log('Conexão com o banco estabelecida');
    
    try {
      // Inicia uma transação
      await client.query('BEGIN');
      console.log('Transação iniciada');
      
      // Verifica se o email já existe
      const checkEmail = await client.query('SELECT id_usuario FROM usuario WHERE email = $1', [email]);
      console.log('Verificação de email:', checkEmail.rows);
      
      if (checkEmail.rows.length > 0) {
        console.log('Email já cadastrado');
        await client.query('ROLLBACK');
        client.release();
        return res.status(409).json({ message: 'Email já cadastrado.' });
      }

      // Insere o usuário
      console.log('Inserindo novo usuário');
      const userResult = await client.query(
        'INSERT INTO usuario (nome_familia, email, senha) VALUES ($1, $2, $3) RETURNING id_usuario, nome_familia, email, criado_em, atualizado_em',
        [nome_familia, email, hashedPassword]
      );
      console.log('Usuário inserido:', userResult.rows[0]);
      
      const newUser = userResult.rows[0];

      await client.query('COMMIT'); // Confirma a transação
      console.log('Transação de registro de usuário confirmada.');
      client.release(); // Libera o cliente de volta para o pool
      res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: newUser.id_usuario });
    } catch (error) {
      await client.query('ROLLBACK'); // Em caso de erro, desfaz a transação
      console.error('Erro na transação de registro:', error);
      client.release();
      throw error; // Propaga o erro para o catch externo
    }

  } catch (err) {
    console.error('Erro no registro de usuário:', err);
    let errorMessage = 'Erro interno do servidor ao registrar usuário.';
    if (err.message.includes('duplicate key value violates unique constraint "usuario_email_key"')) {
      errorMessage = 'Este email já está cadastrado.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    res.status(500).json({ message: errorMessage });
  }
});

// Novo Endpoint para criar o primeiro perfil após o registro
app.post('/api/perfil/primeiro', async (req, res) => {
  const { usuario_id, nome_perfil, categoria_familiar, senha_perfil } = req.body; // Adicione senha_perfil aqui
  console.log('Recebendo requisição para criar primeiro perfil:', { usuario_id, nome_perfil, categoria_familiar });

  if (!usuario_id || !nome_perfil || !categoria_familiar || !senha_perfil) { // Verifique também a senha_perfil
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  let client; // Declarar client fora do try para ser acessível no finally
  try {
    const hashedPasswordPerfil = await bcrypt.hash(senha_perfil, 10); // Hashear a senha do perfil
    client = await pool.connect();
    await client.query('BEGIN');

    // Gerar um código único para o perfil
    const timestamp = Date.now().toString();
    const codPerfil = `PERF${timestamp.slice(-6)}`; // Usar PERF para perfis

    // Inserir o perfil
    const perfilResult = await client.query(
      `INSERT INTO perfil (usuario_id, nome, categoria_familiar, cod_perfil, renda, is_admin, senha) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_perfil`,
      [usuario_id, nome_perfil, categoria_familiar, codPerfil, 0.00, true, hashedPasswordPerfil] // Definir renda inicial como 0.00 e is_admin como true
    );
    const id_perfil = perfilResult.rows[0].id_perfil;

    // Inserir todas as permissões como ativas para o primeiro perfil
    await client.query(
      `INSERT INTO permissoes (perfil_id, pode_criar_conta, pode_editar_conta, pode_excluir_conta, pode_ver_todas_contas) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id_perfil, true, true, true, true] // Todas as permissões ativas
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Primeiro perfil criado com sucesso!', perfilId: id_perfil });

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Erro ao criar o primeiro perfil:', err);
    res.status(500).json({ message: 'Erro ao criar o primeiro perfil.' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Endpoint de Login de Usuário
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  console.log('Recebendo requisição de login:', { email });

  if (!email || !senha) {
    console.log('Campos obrigatórios faltando para login');
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const client = await pool.connect();
    const userResult = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      client.release();
      console.log('Usuário não encontrado');
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(senha, user.senha);

    if (!isMatch) {
      client.release();
      console.log('Senha incorreta');
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Se login bem-sucedido, você pode retornar os dados do usuário (exceto a senha hasheada)
    // Ou gerar um token de sessão, etc.
    // Para esta etapa, vamos retornar o ID do usuário e o nome da família
    res.status(200).json({ 
      message: 'Login bem-sucedido!', 
      userId: user.id_usuario,
      nomeFamilia: user.nome_familia
    });
    client.release();

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Novo Endpoint para buscar perfis e permissões de um usuário
app.get('/api/user/profiles-and-permissions/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(`Recebendo requisição para buscar perfis e permissões para userId: ${userId}`);

  try {
    const client = await pool.connect();

    // Buscar perfis do usuário
    const profilesResult = await client.query('SELECT * FROM perfil WHERE usuario_id = $1', [userId]);
    const profiles = profilesResult.rows;

    if (profiles.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Nenhum perfil encontrado para este usuário.' });
    }

    // Para cada perfil, buscar suas permissões
    const profilesWithPermissions = await Promise.all(profiles.map(async (profile) => {
      const permissionsResult = await client.query('SELECT * FROM permissoes WHERE perfil_id = $1', [profile.id_perfil]);
      const permissions = permissionsResult.rows[0]; // Assumindo 1:1 perfil-permissões

      return { ...profile, permissoes: permissions || {} }; // Garante que permissoes seja um objeto mesmo se não houver
    }));

    client.release();
    res.status(200).json({ profiles: profilesWithPermissions });

  } catch (err) {
    console.error('Erro ao buscar perfis e permissões do usuário:', err);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar perfis e permissões.' });
  }
});

// Rotas para Gerenciamento de Contas
app.post('/api/contas', async (req, res) => {
  const { nome_conta, valor_conta, data_entrega, data_vencimento, status_pagamento_id, 
          descricao, tipo_conta_id, recorrencia_id, perfil_id, categoria_id } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO contas (nome_conta, valor_conta, data_entrega, data_vencimento, 
        status_pagamento_id, descricao, tipo_conta_id, recorrencia_id, perfil_id, categoria_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [nome_conta, valor_conta, data_entrega, data_vencimento, status_pagamento_id,
       descricao, tipo_conta_id, recorrencia_id, perfil_id, categoria_id]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({ message: 'Erro ao criar conta.' });
  }
});

app.get('/api/contas/:perfilId', async (req, res) => {
  const { perfilId } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT c.*, s.nome_status, t.nome_tipo, r.nome_recorrencia, cat.nome_categoria
       FROM contas c
       LEFT JOIN status_pagamento_tipo s ON c.status_pagamento_id = s.id_status_pagamento_tipo
       LEFT JOIN tipo_conta_tipo t ON c.tipo_conta_id = t.id_tipo_conta_tipo
       LEFT JOIN recorrencia_tipo r ON c.recorrencia_id = r.id_recorrencia_tipo
       LEFT JOIN categoria cat ON c.categoria_id = cat.id_categoria
       WHERE c.perfil_id = $1
       ORDER BY c.data_vencimento DESC`,
      [perfilId]
    );
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar contas:', err);
    res.status(500).json({ message: 'Erro ao buscar contas.' });
  }
});

app.put('/api/contas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_conta, valor_conta, data_entrega, data_vencimento, status_pagamento_id,
          descricao, tipo_conta_id, recorrencia_id, categoria_id } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE contas 
       SET nome_conta = $1, valor_conta = $2, data_entrega = $3, data_vencimento = $4,
           status_pagamento_id = $5, descricao = $6, tipo_conta_id = $7, 
           recorrencia_id = $8, categoria_id = $9
       WHERE id_conta = $10 RETURNING *`,
      [nome_conta, valor_conta, data_entrega, data_vencimento, status_pagamento_id,
       descricao, tipo_conta_id, recorrencia_id, categoria_id, id]
    );
    client.release();
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar conta:', err);
    res.status(500).json({ message: 'Erro ao atualizar conta.' });
  }
});

app.delete('/api/contas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM contas WHERE id_conta = $1', [id]);
    client.release();
    res.status(200).json({ message: 'Conta excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    res.status(500).json({ message: 'Erro ao excluir conta.' });
  }
});

// Endpoints para Receitas
app.get('/api/receitas/:perfilId', async (req, res) => {
  const { perfilId } = req.params;
  const { mes, ano } = req.query;
  try {
    const client = await pool.connect();
    let query = `SELECT r.*, cat.nome_categoria
       FROM receita r
       LEFT JOIN categoria cat ON r.categoria_id = cat.id_categoria
       WHERE r.perfil_id = $1 AND cat.tipo_categoria = 'receita'`;
    const params = [perfilId];
    if (mes && ano) {
      query += ` AND ((EXTRACT(MONTH FROM r.data_recebimento) = $2 AND EXTRACT(YEAR FROM r.data_recebimento) = $3) OR r.fixa = TRUE)`;
      params.push(mes, ano);
    }
    query += ' ORDER BY r.data_recebimento DESC';
    const result = await client.query(query, params);
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar receitas:', err);
    res.status(500).json({ message: 'Erro ao buscar receitas.' });
  }
});

app.post('/api/receitas', async (req, res) => {
  const { perfil_id, nome_receita, valor_receita, data_recebimento, descricao, categoria_id, fixa } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO receita (perfil_id, nome_receita, valor_receita, data_recebimento, descricao, categoria_id, fixa) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [perfil_id, nome_receita, valor_receita, data_recebimento, descricao, categoria_id, fixa]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar receita:', err);
    res.status(500).json({ message: 'Erro ao criar receita.' });
  }
});

app.delete('/api/receitas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM receita WHERE id_receita = $1', [id]);
    client.release();
    res.status(200).json({ message: 'Receita excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir receita:', err);
    res.status(500).json({ message: 'Erro ao excluir receita.' });
  }
});

// Endpoints para Despesas
app.get('/api/despesas/:perfilId', async (req, res) => {
  const { perfilId } = req.params;
  const { mes, ano } = req.query;
  try {
    const client = await pool.connect();
    let query = `SELECT c.*, cat.nome_categoria 
       FROM contas c 
       LEFT JOIN categoria cat ON c.categoria_id = cat.id_categoria 
       WHERE c.perfil_id = $1 AND cat.tipo_categoria = 'despesa'`;
    const params = [perfilId];
    if (mes && ano) {
      query += ` AND ((EXTRACT(MONTH FROM c.data_vencimento) = $2 AND EXTRACT(YEAR FROM c.data_vencimento) = $3) OR c.fixa = TRUE)`;
      params.push(mes, ano);
    }
    query += ' ORDER BY c.data_vencimento DESC';
    const result = await client.query(query, params);
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar despesas:', err);
    res.status(500).json({ message: 'Erro ao buscar despesas.' });
  }
});

app.post('/api/despesas', async (req, res) => {
  const { 
    perfil_id, 
    nome_conta, 
    valor_conta, 
    data_entrega, 
    data_vencimento, 
    descricao, 
    categoria_id,
    tipo_conta_id,
    recorrencia_id,
    status_pagamento_id,
    fixa
  } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO contas (
        perfil_id, nome_conta, valor_conta, data_entrega, data_vencimento, 
        descricao, categoria_id, tipo_conta_id, recorrencia_id, status_pagamento_id, fixa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        perfil_id, nome_conta, valor_conta, data_entrega, data_vencimento,
        descricao, categoria_id, tipo_conta_id, recorrencia_id, status_pagamento_id, fixa
      ]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar despesa:', err);
    res.status(500).json({ message: 'Erro ao criar despesa.' });
  }
});

app.delete('/api/despesas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM contas WHERE id_conta = $1', [id]);
    client.release();
    res.status(200).json({ message: 'Despesa excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir despesa:', err);
    res.status(500).json({ message: 'Erro ao excluir despesa.' });
  }
});

// Rotas para Gerenciamento de Orçamentos
app.post('/api/orcamentos', async (req, res) => {
  const { perfil_id, mes_ano, valor_limite } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO orcamento (perfil_id, mes_ano, valor_limite)
       VALUES ($1, $2, $3) RETURNING *`,
      [perfil_id, mes_ano, valor_limite]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar orçamento:', err);
    res.status(500).json({ message: 'Erro ao criar orçamento.' });
  }
});

app.get('/api/orcamentos/:perfilId', async (req, res) => {
  const { perfilId } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM orcamento WHERE perfil_id = $1 ORDER BY mes_ano DESC',
      [perfilId]
    );
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar orçamentos:', err);
    res.status(500).json({ message: 'Erro ao buscar orçamentos.' });
  }
});

app.put('/api/orcamentos/:id', async (req, res) => {
  const { id } = req.params;
  const { valor_limite } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE orcamento SET valor_limite = $1 WHERE id_orcamento = $2 RETURNING *',
      [valor_limite, id]
    );
    client.release();
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar orçamento:', err);
    res.status(500).json({ message: 'Erro ao atualizar orçamento.' });
  }
});

// Rotas para Gerenciamento de Categorias
app.get('/api/categorias', async (req, res) => {
  const { tipo } = req.query; // Pega o parâmetro 'tipo' da query string
  try {
    const client = await pool.connect();
    let query = 'SELECT * FROM categoria';
    const params = [];

    if (tipo) {
      query += ' WHERE tipo_categoria = $1';
      params.push(tipo);
    }

    const result = await client.query(query, params);
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    res.status(500).json({ message: 'Erro ao buscar categorias.' });
  }
});

app.post('/api/categorias', async (req, res) => {
  const { nome_categoria, tipo_categoria } = req.body; // Agora espera o tipo_categoria

  if (!nome_categoria || !tipo_categoria) {
    return res.status(400).json({ message: 'Nome da categoria e tipo são obrigatórios.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO categoria (nome_categoria, tipo_categoria) VALUES ($1, $2) RETURNING *; ', // Insere o tipo
      [nome_categoria, tipo_categoria]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar categoria:', err);
    res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
});

// Rotas para Gerenciamento de Perfis
app.post('/api/perfis', async (req, res) => {
  const { usuario_id, nome, categoria_familiar, senha, renda } = req.body;

  try {
    const client = await pool.connect();
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(senha, 10);
    const timestamp = Date.now().toString();
    const codPerfil = `PERF${timestamp.slice(-6)}`;

    // Busca o nome_familia do usuário
    const userResult = await client.query('SELECT nome_familia FROM usuario WHERE id_usuario = $1', [usuario_id]);
    if (userResult.rows.length === 0) {
      throw new Error('Usuário não encontrado.');
    }
    const nome_familia = userResult.rows[0].nome_familia;

    const perfilResult = await client.query(
      `INSERT INTO perfil (usuario_id, nome, categoria_familiar, cod_perfil, renda, senha)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_perfil`,
      [usuario_id, nome, categoria_familiar, codPerfil, renda, hashedPassword]
    );

    const id_perfil = perfilResult.rows[0].id_perfil;

    await client.query(
      `INSERT INTO permissoes (perfil_id, pode_criar_conta, pode_editar_conta, pode_excluir_conta, pode_ver_todas_contas)
       VALUES ($1, $2, $3, $4, $5)`,
      [id_perfil, true, true, true, true]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Perfil criado com sucesso!', perfilId: id_perfil, nome_familia: nome_familia });

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Erro ao criar perfil:', err);
    res.status(500).json({ message: 'Erro ao criar perfil.' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.put('/api/perfis/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, categoria_familiar, renda } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE perfil 
       SET nome = $1, categoria_familiar = $2, renda = $3
       WHERE id_perfil = $4 RETURNING *`,
      [nome, categoria_familiar, renda, id]
    );
    client.release();
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

app.delete('/api/perfis/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM perfil WHERE id_perfil = $1', [id]);
    client.release();
    res.status(200).json({ message: 'Perfil excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir perfil:', err);
    res.status(500).json({ message: 'Erro ao excluir perfil.' });
  }
});

// Rotas para Cartões de Crédito
app.get('/api/cartoes/:perfilId', async (req, res) => {
  const { perfilId } = req.params;
  // Para cartões, normalmente não há filtro de mês/ano, pois o cartão existe independente do mês.
  // Se quiser filtrar gastos por mês, seria necessário uma tabela de gastos mensais por cartão.
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM cartao_credito WHERE perfil_id = $1 ORDER BY id_cartao DESC',
      [perfilId]
    );
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar cartões:', err);
    res.status(500).json({ message: 'Erro ao buscar cartões.' });
  }
});

app.post('/api/cartoes', async (req, res) => {
  console.log('Recebido no backend:', req.body); // Debug do que chega do frontend
  const { perfil_id, nome, limite, dia_vencimento, bandeira, gastos } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO cartao_credito (perfil_id, nome, limite, dia_vencimento, bandeira, gastos) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [perfil_id, nome, limite, dia_vencimento, bandeira, gastos || 0]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar cartão:', err);
    res.status(500).json({ message: 'Erro ao criar cartão.' });
  }
});

app.put('/api/cartoes/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, limite, dia_vencimento, bandeira, gastos } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE cartao_credito SET nome = $1, limite = $2, dia_vencimento = $3, bandeira = $4, gastos = $5 WHERE id_cartao = $6 RETURNING *',
      [nome, limite, dia_vencimento, bandeira, gastos, id]
    );
    client.release();
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar cartão:', err);
    res.status(500).json({ message: 'Erro ao atualizar cartão.' });
  }
});

app.delete('/api/cartoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM cartao_credito WHERE id_cartao = $1', [id]);
    client.release();
    res.status(200).json({ message: 'Cartão excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir cartão:', err);
    res.status(500).json({ message: 'Erro ao excluir cartão.' });
  }
});

// ENDPOINTS DE FATURAS DE CARTÃO DE CRÉDITO

// Criar fatura fechada (fechamento automático)
app.post('/api/faturas-cartao', async (req, res) => {
  const { id_cartao, mes_ano, valor_fechado, data_fechamento } = req.body;
  if (!id_cartao || !mes_ano || !valor_fechado || !data_fechamento) {
    return res.status(400).json({ message: 'Dados obrigatórios faltando.' });
  }
  try {
    const client = await pool.connect();
    // Verifica se já existe fatura para esse cartão e mês
    const existe = await client.query(
      'SELECT * FROM fatura_cartao WHERE id_cartao = $1 AND mes_ano = $2',
      [id_cartao, mes_ano]
    );
    if (existe.rows.length > 0) {
      client.release();
      return res.status(409).json({ message: 'Fatura já existe para este cartão e mês.' });
    }
    const result = await client.query(
      'INSERT INTO fatura_cartao (id_cartao, mes_ano, valor_fechado, data_fechamento) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_cartao, mes_ano, valor_fechado, data_fechamento]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar fatura:', err);
    res.status(500).json({ message: 'Erro ao criar fatura.' });
  }
});

// Listar faturas por perfil (todas faturas dos cartões do perfil)
app.get('/api/faturas-cartao/perfil/:perfilId', async (req, res) => {
  const { perfilId } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT f.*, c.nome as nome_cartao, c.bandeira FROM fatura_cartao f
       JOIN cartao_credito c ON f.id_cartao = c.id_cartao
       WHERE c.perfil_id = $1
       ORDER BY f.data_fechamento DESC`,
      [perfilId]
    );
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar faturas:', err);
    res.status(500).json({ message: 'Erro ao buscar faturas.' });
  }
});

// Listar faturas por cartão
app.get('/api/faturas-cartao/cartao/:idCartao', async (req, res) => {
  const { idCartao } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM fatura_cartao WHERE id_cartao = $1 ORDER BY data_fechamento DESC',
      [idCartao]
    );
    client.release();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar faturas do cartão:', err);
    res.status(500).json({ message: 'Erro ao buscar faturas do cartão.' });
  }
});

// Pagar fatura (total ou parcial)
app.put('/api/faturas-cartao/:idFatura/pagar', async (req, res) => {
  const { idFatura } = req.params;
  const { valor_pago } = req.body;
  if (valor_pago === undefined) {
    return res.status(400).json({ message: 'Valor pago é obrigatório.' });
  }
  try {
    const client = await pool.connect();
    // Busca a fatura
    const faturaResult = await client.query('SELECT * FROM fatura_cartao WHERE id_fatura = $1', [idFatura]);
    if (faturaResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: 'Fatura não encontrada.' });
    }
    const fatura = faturaResult.rows[0];
    let novoValorPago = parseFloat(valor_pago);
    if (novoValorPago > fatura.valor_fechado) novoValorPago = fatura.valor_fechado;
    const paga = novoValorPago >= fatura.valor_fechado;
    const result = await client.query(
      'UPDATE fatura_cartao SET valor_pago = $1, paga = $2 WHERE id_fatura = $3 RETURNING *',
      [novoValorPago, paga, idFatura]
    );
    client.release();
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao pagar fatura:', err);
    res.status(500).json({ message: 'Erro ao pagar fatura.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});

// Captura de exceções não tratadas
process.on('uncaughtException', (err) => {
  console.error('Erro não capturado (uncaughtException):', err);
  // Opcional: Terminar o processo de forma graciosa após logar o erro
  // process.exit(1);
});

// Captura de rejeições de promessas não tratadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição de promessa não tratada (unhandledRejection):', reason);
  // Opcional: Terminar o processo de forma graciosa após logar o erro
  // process.exit(1);
});