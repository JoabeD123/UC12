import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const atualizarPermissoes = (perfilId) => {
    const perfis = JSON.parse(localStorage.getItem('perfis')) || [];
    const perfilIndex = perfis.findIndex(p => p.id === perfilId);
    
    if (perfilIndex !== -1) {
      perfis[perfilIndex].permissoes = {
        ...perfis[perfilIndex].permissoes,
        editarReceitas: true,
        editarDespesas: true,
        verImpostoRenda: true
      };
      localStorage.setItem('perfis', JSON.stringify(perfis));
      return perfis[perfilIndex];
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      // Simular autenticação
      const userData = {
        id: 1,
        nome: 'Usuário Teste',
        email: email
      };

      // Salvar dados do usuário
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Criar perfil padrão se não existir
      const profile = {
        id: 1,
        nome: 'Perfil Padrão',
        permissoes: {
          verReceitas: true,
          verDespesas: true,
          gerenciarPerfis: true
        }
      };
      localStorage.setItem(`profile_${userData.id}`, JSON.stringify(profile));

      // Chamar callback de login com os dados do usuário
      onLogin(userData);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
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