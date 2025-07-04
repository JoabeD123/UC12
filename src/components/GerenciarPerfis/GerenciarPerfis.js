import React, { useState, useEffect } from 'react';
import './GerenciarPerfis.css';
import Sidebar from '../Sidebar/Sidebar';
import { FaSave, FaPlus, FaTimes, FaEdit, FaTrash, FaCrown, FaUser } from 'react-icons/fa';

const GerenciarPerfis = ({ usuario, perfil }) => {
  const [perfis, setPerfis] = useState([]);
  const [novoPerfil, setNovoPerfil] = useState({
    nome: '',
    categoria_familiar: '',
    senha: '',
    ver_receitas: true,
    ver_despesas: true,
    ver_cartoes: true,
    gerenciar_perfis: false,
    ver_imposto: false
  });
  const [perfilEditando, setPerfilEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [perfilParaExcluir, setPerfilParaExcluir] = useState(null);

  useEffect(() => {
    if (!usuario?.id_usuario) return;
    const fetchPerfis = async () => {
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
    try {
      if (perfilEditando) {
        // Editar perfil (não permite editar senha por aqui)
        const res = await fetch(`http://localhost:3001/api/perfis/${perfilEditando.id_perfil}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: novoPerfil.nome,
            categoria_familiar: novoPerfil.categoria_familiar,
            ver_receitas: novoPerfil.ver_receitas,
            ver_despesas: novoPerfil.ver_despesas,
            ver_cartoes: novoPerfil.ver_cartoes,
            gerenciar_perfis: novoPerfil.gerenciar_perfis,
            ver_imposto: novoPerfil.ver_imposto
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
            ver_receitas: novoPerfil.ver_receitas,
            ver_despesas: novoPerfil.ver_despesas,
            ver_cartoes: novoPerfil.ver_cartoes,
            gerenciar_perfis: novoPerfil.gerenciar_perfis,
            ver_imposto: novoPerfil.ver_imposto
          })
        });
        if (!res.ok) throw new Error('Erro ao criar perfil');
      }
      setNovoPerfil({ nome: '', categoria_familiar: '', senha: '', ver_receitas: true, ver_despesas: true, ver_cartoes: true, gerenciar_perfis: false, ver_imposto: false });
      setPerfilEditando(null);
      // Atualizar lista
      const res = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${usuario.id_usuario}`);
      const data = await res.json();
      setPerfis(data.profiles);
    } catch (err) {
      setErro('Erro ao salvar perfil.');
    }
  };

  const handleEdit = (perfil) => {
    setPerfilEditando(perfil);
    setNovoPerfil({
      nome: perfil.nome,
      categoria_familiar: perfil.categoria_familiar,
      senha: '',
      ver_receitas: perfil.permissoes?.ver_receitas ?? true,
      ver_despesas: perfil.permissoes?.ver_despesas ?? true,
      ver_cartoes: perfil.permissoes?.ver_cartoes ?? true,
      gerenciar_perfis: perfil.permissoes?.gerenciar_perfis ?? false,
      ver_imposto: perfil.permissoes?.ver_imposto ?? false
    });
  };

  const handleDelete = (id) => {
    setPerfilParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (cascade) => {
    if (!perfilParaExcluir) return;
    try {
      const res = await fetch(`http://localhost:3001/api/perfis/${perfilParaExcluir}?cascade=${cascade}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.message || 'Erro ao excluir perfil.');
      } else {
        setPerfis(prev => prev.filter(perfil => perfil.id_perfil !== perfilParaExcluir));
        setErro('');
      }
    } catch {
      setErro('Erro ao excluir perfil.');
    } finally {
      setShowDeleteModal(false);
      setPerfilParaExcluir(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPerfilParaExcluir(null);
  };

  const handleHierarchyChange = async (perfilId, isPrincipal) => {
    try {
      const res = await fetch(`http://localhost:3001/api/perfis/${perfilId}/hierarquia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_principal: isPrincipal })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setErro(data.message || 'Erro ao alterar hierarquia do perfil.');
      } else {
        // Atualizar lista de perfis
        const profilesRes = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${usuario.id_usuario}`);
        const profilesData = await profilesRes.json();
        setPerfis(profilesData.profiles);
        setErro('');
      }
    } catch {
      setErro('Erro ao alterar hierarquia do perfil.');
    }
  };

  const handleCancel = () => {
    setPerfilEditando(null);
    setNovoPerfil({ nome: '', categoria_familiar: '', senha: '', ver_receitas: true, ver_despesas: true, ver_cartoes: true, gerenciar_perfis: false, ver_imposto: false });
    setErro('');
  };

  return (
    <div className="layout-container">
      <Sidebar perfil={perfil} />

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
                  disabled={perfilEditando?.is_admin}
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
                  disabled={perfilEditando?.is_admin}
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
                  disabled={perfilEditando?.is_admin}
                />
              </div>

              <div className="form-group">
                <label>Permissões de acesso às telas</label>
                <div className="permissoes-checkboxes">
                  <label>
                    <input type="checkbox" name="ver_receitas" checked={novoPerfil.ver_receitas} onChange={handleInputChange} disabled={perfilEditando?.is_admin} /> Ver Receitas
                  </label>
                  <label>
                    <input type="checkbox" name="ver_despesas" checked={novoPerfil.ver_despesas} onChange={handleInputChange} disabled={perfilEditando?.is_admin} /> Ver Despesas
                  </label>
                  <label>
                    <input type="checkbox" name="ver_cartoes" checked={novoPerfil.ver_cartoes} onChange={handleInputChange} disabled={perfilEditando?.is_admin} /> Ver Cartões
                  </label>
                  <label>
                    <input type="checkbox" name="gerenciar_perfis" checked={novoPerfil.gerenciar_perfis} onChange={handleInputChange} disabled={perfilEditando?.is_admin} /> Gerenciar Perfis
                  </label>
                  <label>
                    <input type="checkbox" name="ver_imposto" checked={novoPerfil.ver_imposto} onChange={handleInputChange} disabled={perfilEditando?.is_admin} /> Ver Imposto de Renda
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={perfilEditando?.is_admin}>
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
                  <div className="perfil-header" style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem'}}>
                    <div style={{flex: '1 1 40%', minWidth: 0}}>
                      <h4>{perfil.nome}</h4>
                      <div className="perfil-tipo" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem'}}>
                        {perfil.is_principal ? (
                          <>
                            <FaCrown style={{color: '#FFD700'}} />
                            <span style={{color: '#FFD700', fontWeight: 'bold'}}>Perfil Principal</span>
                          </>
                        ) : (
                          <>
                            <FaUser style={{color: '#6c757d'}} />
                            <span style={{color: '#6c757d'}}>Perfil Secundário</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{flex: '2 1 60%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                      <p className="perfil-descricao">{perfil.categoria_familiar}</p>
                      <div className="perfil-permissoes">
                        <h5>Permissões:</h5>
                        <ul>
                          {Object.entries(perfil.permissoes)
                            .filter(([permissao]) => ['ver_receitas','ver_despesas','ver_cartoes','gerenciar_perfis','ver_imposto'].includes(permissao))
                            .map(([permissao, valor]) => (
                              <li key={permissao} className={valor ? 'permitido' : 'negado'}>
                                {(() => {
                                  switch(permissao) {
                                    case 'ver_receitas': return 'Ver Receitas';
                                    case 'ver_despesas': return 'Ver Despesas';
                                    case 'ver_cartoes': return 'Ver Cartões';
                                    case 'gerenciar_perfis': return 'Gerenciar Perfis';
                                    case 'ver_imposto': return 'Ver Imposto de Renda';
                                    default: return permissao;
                                  }
                                })()}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {!perfil.is_admin && (
                    <div className="perfil-actions">
                      <button onClick={() => handleEdit(perfil)} className="btn-icon">
                        <FaEdit /> Editar
                      </button>
                      {!perfil.is_principal ? (
                        <button 
                          onClick={() => handleHierarchyChange(perfil.id_perfil, true)} 
                          className="btn-icon promover"
                          title="Promover para Perfil Principal"
                        >
                          <FaCrown /> Promover
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleHierarchyChange(perfil.id_perfil, false)} 
                          className="btn-icon rebaixar"
                          title="Rebaixar para Perfil Secundário"
                        >
                          <FaUser /> Rebaixar
                        </button>
                      )}
                      <button onClick={() => handleDelete(perfil.id_perfil)} className="btn-icon excluir">
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Excluir Perfil</h3>
            <p>Deseja excluir também todas as informações relacionadas a este perfil (receitas, despesas, cartões, etc)?</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => confirmDelete(true)}>Sim, excluir tudo</button>
              <button className="btn-secondary" onClick={() => confirmDelete(false)}>Não, excluir apenas o perfil</button>
              <button className="btn-secondary" onClick={cancelDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarPerfis; 