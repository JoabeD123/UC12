import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GerenciarPerfis.css';

function GerenciarPerfis({ usuario, perfil, onLogout, onPerfilAtualizado }) {
  const [perfis, setPerfis] = useState([]);
  const [novoPerfil, setNovoPerfil] = useState({
    nome: '',
    tipo: 'Secundário',
    permissoes: {
      verReceitas: false,
      editarReceitas: false,
      verDespesas: false,
      editarDespesas: false,
      gerenciarPerfis: false
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const perfisArmazenados = JSON.parse(localStorage.getItem('perfis') || '[]');
    const perfisFiltrados = perfisArmazenados.filter(p => p.usuarioId === usuario.id);
    setPerfis(perfisFiltrados);
  }, [usuario.id]);

  const salvarPerfis = (novosPerfis) => {
    const todosOsPerfis = JSON.parse(localStorage.getItem('perfis') || '[]');
    const perfisOutrosUsuarios = todosOsPerfis.filter(p => p.usuarioId !== usuario.id);
    const perfisSalvar = [...perfisOutrosUsuarios, ...novosPerfis];
    
    localStorage.setItem('perfis', JSON.stringify(perfisSalvar));
    setPerfis(novosPerfis);
  };

  const handlePermissaoChange = (permissao) => {
    setNovoPerfil(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permissao]: !prev.permissoes[permissao]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!novoPerfil.nome.trim()) return;

    const novoPerfilCompleto = {
      ...novoPerfil,
      id: Date.now().toString(),
      usuarioId: usuario.id
    };

    const novosPerfis = [...perfis, novoPerfilCompleto];
    salvarPerfis(novosPerfis);
    
    setNovoPerfil({
      nome: '',
      tipo: 'Secundário',
      permissoes: {
        verReceitas: false,
        editarReceitas: false,
        verDespesas: false,
        editarDespesas: false,
        gerenciarPerfis: false
      }
    });
  };

  const handleExcluirPerfil = (perfilId) => {
    if (perfilId === perfil.id) {
      alert('Você não pode excluir o perfil que está usando atualmente.');
      return;
    }
    const novosPerfis = perfis.filter(p => p.id !== perfilId);
    salvarPerfis(novosPerfis);
  };

  const handleAlterarPerfil = (novoPerfil) => {
    if (novoPerfil.id === perfil.id) {
      alert('Este já é seu perfil atual.');
      return;
    }
    onPerfilAtualizado(novoPerfil);
    navigate('/dashboard');
  };

  return (
    <div className="layout-container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">GF</div>
        </div>
        <nav className="menu">
          <ul>
            <li onClick={() => navigate('/')}>
              <span className="menu-icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </li>
            {perfis.find(p => p.usuarioId === usuario.id && p.permissoes.verReceitas) && (
              <li onClick={() => navigate('/receitas')}>
                <span className="menu-icon">💰</span>
                <span className="menu-text">Receitas</span>
              </li>
            )}
            {perfis.find(p => p.usuarioId === usuario.id && p.permissoes.verDespesas) && (
              <li onClick={() => navigate('/despesas')}>
                <span className="menu-icon">💸</span>
                <span className="menu-text">Despesas</span>
              </li>
            )}
            <li onClick={() => navigate('/cartoes')}>
              <span className="menu-icon">💳</span>
              <span className="menu-text">Cartões</span>
            </li>
            {perfil?.permissoes.gerenciarPerfis && (
              <li className="active">
                <span className="menu-icon">👥</span>
                <span className="menu-text">Gerenciar Perfis</span>
              </li>
            )}
          </ul>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => navigate('/configuracoes')} className="config-button">
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">Configurações</span>
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <h1>Gerenciar Perfis</h1>
          <p className="perfil-atual">Perfil atual: {perfil.nome}</p>
        </div>

        <div className="perfis-container">
          <div className="perfis-grid">
            {perfis.map(perfilItem => (
              <div key={perfilItem.id} className={`perfil-card ${perfilItem.id === perfil.id ? 'perfil-atual' : ''}`}>
                <h3>{perfilItem.nome}</h3>
                <p>Tipo: {perfilItem.tipo}</p>
                <div className="permissoes-lista">
                  <h4>Permissões:</h4>
                  <ul>
                    {Object.entries(perfilItem.permissoes).map(([key, value]) => (
                      <li key={key} className={value ? 'permitido' : 'negado'}>
                        {key}: {value ? '✓' : '✗'}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="perfil-acoes">
                  {perfilItem.id !== perfil.id && (
                    <button 
                      className="btn-alternar"
                      onClick={() => handleAlterarPerfil(perfilItem)}
                    >
                      Usar este perfil
                    </button>
                  )}
                  {perfilItem.tipo !== 'Principal' && perfilItem.id !== perfil.id && (
                    <button 
                      className="btn-excluir"
                      onClick={() => handleExcluirPerfil(perfilItem.id)}
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="novo-perfil-form">
            <h2>Adicionar Novo Perfil</h2>
            <div className="form-group">
              <label>Nome do Perfil:</label>
              <input
                type="text"
                value={novoPerfil.nome}
                onChange={(e) => setNovoPerfil(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <h3>Permissões:</h3>
              <div className="permissoes-grid">
                {Object.entries(novoPerfil.permissoes).map(([key, value]) => (
                  <label key={key} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handlePermissaoChange(key)}
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Adicionar Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GerenciarPerfis; 