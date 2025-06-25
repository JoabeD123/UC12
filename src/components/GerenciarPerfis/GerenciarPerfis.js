import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaUsers, FaCog, FaCreditCard, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import './GerenciarPerfis.css';

const GerenciarPerfis = ({ usuario }) => {
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState([]);
  const [novoPerfil, setNovoPerfil] = useState({
    nome: '',
    categoria_familiar: '',
    senha: '',
    renda: '',
    pode_criar_conta: true,
    pode_editar_conta: true,
    pode_excluir_conta: true,
    pode_ver_todas_contas: true
  });
  const [perfilEditando, setPerfilEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario?.id_usuario) return;
    const fetchPerfis = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${usuario.id_usuario}`);
        const data = await res.json();
        if (res.ok) {
          setPerfis(data.profiles);
        } else {
          setPerfis([]);
        }
      } catch {
        setPerfis([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfis();
  }, [usuario]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovoPerfil(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novoPerfil.nome.trim() || !novoPerfil.categoria_familiar.trim() || !novoPerfil.senha.trim()) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      if (perfilEditando) {
        // Editar perfil (não permite editar senha por aqui)
        const res = await fetch(`http://localhost:3001/api/perfis/${perfilEditando.id_perfil}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: novoPerfil.nome,
            categoria_familiar: novoPerfil.categoria_familiar,
            renda: novoPerfil.renda || 0,
            pode_criar_conta: novoPerfil.pode_criar_conta,
            pode_editar_conta: novoPerfil.pode_editar_conta,
            pode_excluir_conta: novoPerfil.pode_excluir_conta,
            pode_ver_todas_contas: novoPerfil.pode_ver_todas_contas
          })
        });
        if (!res.ok) throw new Error('Erro ao editar perfil');
      } else {
        // Criar perfil
        const res = await fetch('http://localhost:3001/api/perfis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: usuario.id_usuario,
            nome: novoPerfil.nome,
            categoria_familiar: novoPerfil.categoria_familiar,
            senha: novoPerfil.senha,
            renda: novoPerfil.renda || 0,
            pode_criar_conta: novoPerfil.pode_criar_conta,
            pode_editar_conta: novoPerfil.pode_editar_conta,
            pode_excluir_conta: novoPerfil.pode_excluir_conta,
            pode_ver_todas_contas: novoPerfil.pode_ver_todas_contas
          })
        });
        if (!res.ok) throw new Error('Erro ao criar perfil');
      }
      setNovoPerfil({ nome: '', categoria_familiar: '', senha: '', renda: '', pode_criar_conta: true, pode_editar_conta: true, pode_excluir_conta: true, pode_ver_todas_contas: true });
      setPerfilEditando(null);
      // Atualizar lista
      const res = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${usuario.id_usuario}`);
      const data = await res.json();
      setPerfis(data.profiles);
    } catch (err) {
      setErro('Erro ao salvar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (perfil) => {
    setPerfilEditando(perfil);
    setNovoPerfil({
      nome: perfil.nome,
      categoria_familiar: perfil.categoria_familiar,
      senha: '',
      renda: perfil.renda || '',
      pode_criar_conta: perfil.pode_criar_conta,
      pode_editar_conta: perfil.pode_editar_conta,
      pode_excluir_conta: perfil.pode_excluir_conta,
      pode_ver_todas_contas: perfil.pode_ver_todas_contas
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:3001/api/perfis/${id}`, { method: 'DELETE' });
      setPerfis(prev => prev.filter(perfil => perfil.id_perfil !== id));
    } catch {
      setErro('Erro ao excluir perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPerfilEditando(null);
    setNovoPerfil({ nome: '', categoria_familiar: '', senha: '', renda: '', pode_criar_conta: true, pode_editar_conta: true, pode_excluir_conta: true, pode_ver_todas_contas: true });
    setErro('');
  };

  return (
    <div className="layout-container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">GF</div>
        </div>
        <div className="menu">
          <div className="menu-item" onClick={() => navigate('/dashboard')}>
            <FaChartBar />
            <span>Dashboard</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/receitas')}>
            <FaMoneyBillWave />
            <span>Receitas</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/despesas')}>
            <FaWallet />
            <span>Despesas</span>
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
                <label>Categoria Familiar</label>
                <input
                  type="text"
                  name="categoria_familiar"
                  value={novoPerfil.categoria_familiar}
                  onChange={handleInputChange}
                  placeholder="Digite a categoria familiar do perfil"
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={novoPerfil.senha}
                  onChange={handleInputChange}
                  placeholder="Digite a senha do perfil"
                />
              </div>

              <div className="form-group">
                <label>Renda</label>
                <input
                  type="text"
                  name="renda"
                  value={novoPerfil.renda}
                  onChange={handleInputChange}
                  placeholder="Digite a renda do perfil"
                />
              </div>

              <div className="form-group">
                <label>Permissões</label>
                <div className="permissoes-checkboxes">
                  <label>
                    <input type="checkbox" name="pode_criar_conta" checked={novoPerfil.pode_criar_conta} onChange={handleInputChange} /> Pode criar contas
                  </label>
                  <label>
                    <input type="checkbox" name="pode_editar_conta" checked={novoPerfil.pode_editar_conta} onChange={handleInputChange} /> Pode editar contas
                  </label>
                  <label>
                    <input type="checkbox" name="pode_excluir_conta" checked={novoPerfil.pode_excluir_conta} onChange={handleInputChange} /> Pode excluir contas
                  </label>
                  <label>
                    <input type="checkbox" name="pode_ver_todas_contas" checked={novoPerfil.pode_ver_todas_contas} onChange={handleInputChange} /> Pode ver todas as contas
                  </label>
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
                <div key={perfil.id_perfil} className="perfil-card">
                  <div className="perfil-header">
                    <h4>{perfil.nome}</h4>
                    <div className="perfil-actions">
                      <button onClick={() => handleEdit(perfil)} className="btn-icon">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(perfil.id_perfil)} className="btn-icon">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="perfil-descricao">{perfil.categoria_familiar}</p>
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