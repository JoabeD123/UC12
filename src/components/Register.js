import React, { useState } from 'react';
import './Login.css';

function Register({ onRegister, onSwitchToLogin }) {
  const [nomeFamilia, setNomeFamilia] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação das senhas
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    // Recupera os usuários existentes
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Verifica se o email já está cadastrado
    if (usuarios.some(u => u.email === email)) {
      setErro('Este email já está cadastrado');
      return;
    }

    // Cria novo usuário
    const novoUsuario = {
      id: Date.now(), // Usando timestamp como ID
      nomeFamilia,
      email,
      senha,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    // Adiciona o novo usuário à lista
    usuarios.push(novoUsuario);
    
    // Salva no localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Salva o usuário atual
    localStorage.setItem('usuarioAtual', JSON.stringify(novoUsuario));
    
    // Chama a função de callback
    onRegister(novoUsuario);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit}>
          {erro && <div className="erro-mensagem">{erro}</div>}

          <div className="form-group">
            <label>Nome da Família:</label>
            <input
              type="text"
              value={nomeFamilia}
              onChange={(e) => setNomeFamilia(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar Senha:</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">Cadastrar</button>
        </form>

        <p className="register-link">
          Já tem uma conta?{' '}
          <button onClick={onSwitchToLogin} className="btn-link">
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register; 