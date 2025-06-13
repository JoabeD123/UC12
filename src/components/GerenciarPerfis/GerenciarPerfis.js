import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaUsers, FaCog, FaCreditCard, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import './GerenciarPerfis.css';

const GerenciarPerfis = () => {
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState([
    {
      id: 1,
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      permissoes: {
        verDashboard: true,
        verReceitas: true,
        verDespesas: true,
        verCartoes: true,
        verImpostoRenda: true,
        gerenciarPerfis: true,
        verConfiguracoes: true
      }
    },
    {
      id: 2,
      nome: 'Usuário',
      descricao: 'Acesso básico ao sistema',
      permissoes: {
        verDashboard: true,
        verReceitas: true,
        verDespesas: true,
        verCartoes: true,
        verImpostoRenda: false,
        gerenciarPerfis: false,
        verConfiguracoes: true
      }
    }
  ]);

  const [novoPerfil, setNovoPerfil] = useState({
    nome: '',
    descricao: '',
    permissoes: {
      verDashboard: true,
      verReceitas: true,
      verDespesas: true,
      verCartoes: true,
      verImpostoRenda: false,
      gerenciarPerfis: false,
      verConfiguracoes: true
    }
  });

  const [perfilEditando, setPerfilEditando] = useState(null);
  const [erro, setErro] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const [permissao, campo] = name.split('.');
      setNovoPerfil(prev => ({
        ...prev,
        permissoes: {
          ...prev.permissoes,
          [campo]: checked
        }
      }));
    } else {
      setNovoPerfil(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!novoPerfil.nome.trim()) {
      setErro('O nome do perfil é obrigatório');
      return;
    }

    if (perfilEditando) {
      setPerfis(prev => prev.map(perfil => 
        perfil.id === perfilEditando.id ? { ...novoPerfil, id: perfil.id } : perfil
      ));
      setPerfilEditando(null);
    } else {
      setPerfis(prev => [...prev, { ...novoPerfil, id: Date.now() }]);
    }

    setNovoPerfil({
      nome: '',
      descricao: '',
      permissoes: {
        verDashboard: true,
        verReceitas: true,
        verDespesas: true,
        verCartoes: true,
        verImpostoRenda: false,
        gerenciarPerfis: false,
        verConfiguracoes: true
      }
    });
    setErro('');
  };

  const handleEdit = (perfil) => {
    setPerfilEditando(perfil);
    setNovoPerfil(perfil);
  };

  const handleDelete = (id) => {
    setPerfis(prev => prev.filter(perfil => perfil.id !== id));
  };

  const handleCancel = () => {
    setPerfilEditando(null);
    setNovoPerfil({
      nome: '',
      descricao: '',
      permissoes: {
        verDashboard: true,
        verReceitas: true,
        verDespesas: true,
        verCartoes: true,
        verImpostoRenda: false,
        gerenciarPerfis: false,
        verConfiguracoes: true
      }
    });
    setErro('');
  };

  return (
    <div className="layout-container">
      <div className="sidebar">
        <div className="menu">
          <div className="menu-item" onClick={() => navigate('/dashboard')}>
            <FaChartBar />
            <span>Dashboard</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/cartoes')}>
            <FaCreditCard />
            <span>Cartões</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/imposto-renda')}>
            <FaChartPie />
            <span>Imposto de Renda</span>
          </div>
          <div className="menu-item active" onClick={() => navigate('/gerenciar-perfis')}>
            <FaUsers />
            <span>Gerenciar Perfis</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/configuracoes')}>
            <FaCog />
            <span>Configurações</span>
          </div>
        </div>
      </div>

      <div className="perfis-container">
        <div className="perfis-header">
          <h2>Gerenciar Perfis de Acesso</h2>
        </div>

        {erro && <div className="error-message">{erro}</div>}

        <div className="perfis-content">
          <div className="novo-perfil-form">
            <h3>{perfilEditando ? 'Editar Perfil' : 'Novo Perfil'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome do Perfil</label>
                <input
                  type="text"
                  name="nome"
                  value={novoPerfil.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do perfil"
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  value={novoPerfil.descricao}
                  onChange={handleInputChange}
                  placeholder="Digite a descrição do perfil"
                />
              </div>

              <div className="permissoes-section">
                <h4>Permissões</h4>
                <div className="permissoes-grid">
                  <div className="permissao-item">
                    <label>
                      <input
                        type="checkbox"
                        name="permissoes.verDashboard"
                        checked={novoPerfil.permissoes.verDashboard}
                        onChange={handleInputChange}
                      />
                      Ver Dashboard
                    </label>
                  </div>
                  <div className="permissao-item">
                    <label>
                      <input
                        type="checkbox"
                        name="permissoes.verReceitas"
                        checked={novoPerfil.permissoes.verReceitas}
                        onChange={handleInputChange}
                      />
                      Ver Receitas
                    </label>
                  </div>
                  <div className="permissao-item">
                    <label>
                      <input
                        type="checkbox"
                        name="permissoes.verDespesas"
                        checked={novoPerfil.permissoes.verDespesas}
                        onChange={handleInputChange}
                      />
                      Ver Despesas
                    </label>
                  </div>
                  <div className="permissao-item">
                    <label>
                      <input
                        type="checkbox"
                        name="permissoes.verCartoes"
                        checked={novoPerfil.permissoes.verCartoes}
                        onChange={handleInputChange}
                      />
                      Ver Cartões
                    </label>
                  </div>
                  <div className="permissao-item">
                    <label>
                      <input
                        type="checkbox"
                        name="permissoes.verImpostoRenda"
                        checked={novoPerfil.permissoes.verImpostoRenda}
                        onChange={handleInputChange}
                      />
                      Ver Imposto de Renda
                    </label>
                  </div>
                  <div className="permissao-item">
                    <label>
                      <input
                        type="checkbox"
                        name="permissoes.gerenciarPerfis"
                        checked={novoPerfil.permissoes.gerenciarPerfis}
                        onChange={handleInputChange}
                      />
                      Gerenciar Perfis
                    </label>
                  </div>
                  <div className="permissao-item">
                    <label>
                      <input
                        type="checkbox"
                        name="permissoes.verConfiguracoes"
                        checked={novoPerfil.permissoes.verConfiguracoes}
                        onChange={handleInputChange}
                      />
                      Ver Configurações
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {perfilEditando ? <FaSave /> : <FaPlus />}
                  {perfilEditando ? 'Salvar' : 'Adicionar'}
                </button>
                {perfilEditando && (
                  <button type="button" onClick={handleCancel} className="btn-secondary">
                    <FaTimes />
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="perfis-list">
            <h3>Perfis Existentes</h3>
            <div className="perfis-grid">
              {perfis.map(perfil => (
                <div key={perfil.id} className="perfil-card">
                  <div className="perfil-header">
                    <h4>{perfil.nome}</h4>
                    <div className="perfil-actions">
                      <button onClick={() => handleEdit(perfil)} className="btn-icon">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(perfil.id)} className="btn-icon">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="perfil-descricao">{perfil.descricao}</p>
                  <div className="perfil-permissoes">
                    <h5>Permissões:</h5>
                    <ul>
                      {Object.entries(perfil.permissoes).map(([permissao, valor]) => (
                        <li key={permissao} className={valor ? 'permitido' : 'negado'}>
                          {permissao.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciarPerfis; 