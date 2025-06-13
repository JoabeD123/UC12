import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css';

function Registro() {
  const [nome, setNome] = useState(''); // Corresponde a nome_familia no backend
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
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome_familia: nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a resposta não for OK (ex: 409, 400, 500)
        throw new Error(data.message || 'Erro ao criar conta');
      }

      // Redirecionar para a tela de criação do primeiro perfil após registro bem-sucedido
      navigate('/criar-primeiro-perfil', { state: { userId: data.userId } });
      
    } catch (error) {
      console.error('Erro ao registrar:', error.message);
      setErro(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Criar Conta</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Família:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
        <button onClick={() => navigate('/')} className="btn-link">
          Já tem uma conta? Faça login
        </button>
      </div>
    </div>
  );
}

export default Registro; 