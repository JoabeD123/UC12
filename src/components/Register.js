import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    if (usuarios.some(u => u.email === formData.email)) {
      setErro('Este email já está cadastrado');
      return;
    }

    const novoUsuario = {
      id: Date.now().toString(),
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      dataCriacao: new Date().toISOString()
    };

    // Criar perfil principal para o novo usuário
    const perfilPrincipal = {
      id: Date.now().toString() + '1',
      usuarioId: novoUsuario.id,
      nome: formData.nome,
      tipo: 'Principal',
      permissoes: {
        verReceitas: true,
        editarReceitas: true,
        verDespesas: true,
        editarDespesas: true,
        verRelatorios: true,
        gerenciarPerfis: true
      }
    };

    // Salvar usuário e perfil
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    const perfis = JSON.parse(localStorage.getItem('perfis')) || [];
    perfis.push(perfilPrincipal);
    localStorage.setItem('perfis', JSON.stringify(perfis));

    // Fazer login com o novo usuário
    onLogin(novoUsuario, perfilPrincipal);
    navigate('/dashboard');
  };

  const handleVoltar = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Cadastro</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmar Senha:</label>
            <input
              type="password"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Cadastrar
          </button>
        </form>
        <button onClick={handleVoltar} className="btn-link">
          Já tem uma conta? Faça login
        </button>
      </div>
    </div>
  );
}

export default Register; 