import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    try {
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      
      // Verificar se o email já está em uso
      if (usuarios.some(u => u.email === email)) {
        setErro('Este email já está cadastrado');
        return;
      }

      // Criar novo usuário
      const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        senha
      };

      // Criar perfil principal para o usuário
      const perfil = {
        id: Date.now(),
        usuarioId: novoUsuario.id,
        nome: 'Principal',
        tipo: 'Principal',
        permissoes: {
          verReceitas: true,
          verDespesas: true,
          editarReceitas: true,
          editarDespesas: true,
          gerenciarPerfis: true,
          verImpostoRenda: true
        }
      };

      // Salvar usuário e perfil
      usuarios.push(novoUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      const perfis = JSON.parse(localStorage.getItem('perfis')) || [];
      perfis.push(perfil);
      localStorage.setItem('perfis', JSON.stringify(perfis));

      // Redirecionar para login
      navigate('/');
    } catch (error) {
      setErro('Erro ao criar conta. Tente novamente.');
      console.error('Erro no registro:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Criar Conta</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome:</label>
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
          <button type="submit" className="btn-primary">
            Criar Conta
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