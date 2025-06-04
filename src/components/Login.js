import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Recupera os usuários do localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Procura o usuário
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
      // Salva o usuário atual no localStorage
      localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
      onLogin(usuario);
    } else {
      setErro('Email ou senha incorretos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {erro && <div className="erro-mensagem">{erro}</div>}
          
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

          <button type="submit" className="btn-login">Entrar</button>
        </form>

        <p className="register-link">
          Não tem uma conta?{' '}
          <button onClick={onSwitchToRegister} className="btn-link">
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login; 