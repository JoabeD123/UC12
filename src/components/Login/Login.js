import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const atualizarPermissoes = (perfilId) => {
    const perfis = JSON.parse(localStorage.getItem('perfis')) || [];
    const perfilIndex = perfis.findIndex(p => p.id === perfilId);
    
    if (perfilIndex !== -1) {
      perfis[perfilIndex].permissoes = {
        ...perfis[perfilIndex].permissoes,
        editarReceitas: true,
        editarDespesas: true
      };
      localStorage.setItem('perfis', JSON.stringify(perfis));
      return perfis[perfilIndex];
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      const perfis = JSON.parse(localStorage.getItem('perfis')) || [];
      const perfilPrincipal = perfis.find(p => p.usuarioId === usuario.id && p.tipo === 'Principal');
      
      if (perfilPrincipal) {
        // Atualiza as permissões e obtém o perfil atualizado
        const perfilAtualizado = atualizarPermissoes(perfilPrincipal.id) || perfilPrincipal;
        onLogin(usuario, perfilAtualizado);
        navigate('/');
      } else {
        setErro('Erro ao carregar o perfil do usuário');
      }
    } else {
      setErro('Email ou senha incorretos');
    }
  };

  const handleCadastro = () => {
    navigate('/registro');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>
        <button onClick={handleCadastro} className="btn-link">
          Não tem uma conta? Cadastre-se
        </button>
      </div>
    </div>
  );
}

export default Login; 