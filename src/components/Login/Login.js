import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      console.log('Iniciando login com:', { email, senha });
      
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Se chegou aqui, o login foi bem sucedido
      console.log('Login bem sucedido, chamando onLogin com:', { 
        userId: data.userId, 
        nomeFamilia: data.nomeFamilia 
      });

      const userLogged = {
        id_usuario: data.userId,
        nome_familia: data.nomeFamilia
      };

      // Salva os dados no localStorage
      localStorage.setItem('currentUser', JSON.stringify(userLogged));
      // localStorage.setItem(`profile_${data.user.id_usuario}`, JSON.stringify(data.profile)); // Removido
      // localStorage.setItem(`permissions_${data.user.id_usuario}`, JSON.stringify(data.permissions)); // Removido

      // Chama a função onLogin com os dados corretos (passando um array vazio para perfis por enquanto)
      onLogin(userLogged, []); 
      
      // Navega para o dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro detalhado ao fazer login:', error);
      setErro(error.message || 'Erro ao fazer login. Tente novamente.');
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