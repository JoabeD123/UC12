import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import './Receitas.css';
import Sidebar from '../Sidebar/Sidebar';

function Receitas({ usuario, perfil, onLogout, onPerfilAtualizado }) {
  const [receitas, setReceitas] = useState([]);
  const [novaReceita, setNovaReceita] = useState({
    nome_receita: '',
    valor_receita: '',
    data_recebimento: '',
    descricao: '',
    categoria_id: '',
    fixa: false
  });
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [editandoReceita, setEditandoReceita] = useState(null);
  const [perfis, setPerfis] = useState([]);
  const [perfilFiltro, setPerfilFiltro] = useState('todos');
  const navigate = useNavigate();

  const carregarReceitas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/receitas/${usuario.id_usuario}/${perfil.id_perfil}`);
      if (!response.ok) throw new Error('Erro ao carregar receitas');
      const data = await response.json();
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      setError('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [usuario, perfil]);

  const carregarCategorias = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categorias?tipo=receita');
      if (!response.ok) throw new Error('Erro ao carregar categorias de receita');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias de receita:', error);
      setError('Erro ao carregar categorias de receita');
    }
  }, []);

  useEffect(() => {
    if (!usuario || !perfil) {
      onLogout();
      return;
    }

    carregarReceitas();
    carregarCategorias();
    // Buscar perfis do usuário para o filtro
    fetch(`http://localhost:3001/api/user/profiles-and-permissions/${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => setPerfis(data.profiles || []));
  }, [usuario, perfil, onLogout, carregarReceitas, carregarCategorias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editandoReceita) {
        // Edição
        const response = await fetch(`http://localhost:3001/api/receitas/${editandoReceita.id_receita}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...novaReceita,
            perfil_id: perfil.id_perfil
          })
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Erro ao editar receita');
        }
        setEditandoReceita(null);
      } else {
        // Adição
        const response = await fetch('http://localhost:3001/api/receitas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: usuario.id_usuario,
            perfil_id: perfil.id_perfil,
            nome_receita: novaReceita.nome_receita,
            valor_receita: novaReceita.valor_receita,
            data_recebimento: novaReceita.data_recebimento,
            descricao: novaReceita.descricao,
            categoria_id: novaReceita.categoria_id,
            fixa: novaReceita.fixa
          })
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Erro ao adicionar receita');
        }
      }
      setNovaReceita({
        nome_receita: '',
        valor_receita: '',
        data_recebimento: '',
        descricao: '',
        categoria_id: '',
        fixa: false
      });
      await carregarReceitas();
    } catch (error) {
      console.error('Erro ao adicionar/editar receita:', error);
      setError(error.message || 'Erro ao adicionar/editar receita');
    }
  };

  const handleExcluir = async (id) => {
    // Exclusão imediata, sem confirmação
    try {
      const response = await fetch(`http://localhost:3001/api/receitas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir receita');
      }
      // Recarregar receitas
      await carregarReceitas();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      setError(error.message || 'Erro ao excluir receita');
    }
  };

  const handleAdicionarCategoria = async (e) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome_categoria: novaCategoria, tipo_categoria: 'receita' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao adicionar categoria de receita');
      }

      setNovaCategoria('');
      setShowCategoriaForm(false);
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao adicionar categoria de receita:', error);
      setError(error.message || 'Erro ao adicionar categoria de receita');
    }
  };

  if (!usuario || !perfil) {
    return null;
  }

  if (!perfil.permissoes?.ver_receitas) {
    return (
      <div className="sem-permissao">
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="layout-container">
      <Sidebar perfil={perfil} />

      <div className="receitas">
        <div className="receitas-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <h2>Receitas</h2>
          <div className="filtro-perfil">
            <label style={{ marginRight: 8 }}>Filtrar por perfil:</label>
            <select value={perfilFiltro} onChange={e => setPerfilFiltro(e.target.value)}>
              <option value="todos">Todos</option>
              {perfis.map(p => (
                <option key={p.id_perfil} value={p.nome}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="receitas-content">
          <div className="receitas-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descrição:</label>
                <input
                  type="text"
                  value={novaReceita.nome_receita}
                  onChange={(e) => setNovaReceita({...novaReceita, nome_receita: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Valor:</label>
                <input
                  type="number"
                  step="0.01"
                  value={novaReceita.valor_receita}
                  onChange={(e) => setNovaReceita({...novaReceita, valor_receita: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data de Recebimento:</label>
                <input
                  type="date"
                  value={novaReceita.data_recebimento}
                  onChange={(e) => setNovaReceita({...novaReceita, data_recebimento: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria:</label>
                <select
                  value={novaReceita.categoria_id}
                  onChange={(e) => setNovaReceita({...novaReceita, categoria_id: e.target.value})}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nome_categoria}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCategoriaForm(!showCategoriaForm)}
                  style={{ marginTop: '10px' }}
                >
                  {showCategoriaForm ? 'Cancelar' : 'Nova Categoria'}
                </button>
              </div>

              {showCategoriaForm && (
                <div className="nova-categoria-form">
                  <h4>Adicionar Nova Categoria</h4>
                  <div className="form-group">
                    <label>Nome da Categoria:</label>
                    <input
                      type="text"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-cancelar-categoria" onClick={() => setShowCategoriaForm(false)}>
                      Cancelar
                    </button>
                    <button type="button" className="btn-adicionar-categoria" onClick={handleAdicionarCategoria}>
                      Adicionar Categoria
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Descrição Detalhada (Opcional):</label>
                <textarea
                  value={novaReceita.descricao}
                  onChange={(e) => setNovaReceita({...novaReceita, descricao: e.target.value})}
                ></textarea>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={novaReceita.fixa}
                    onChange={e => setNovaReceita({ ...novaReceita, fixa: e.target.checked })}
                  /> Receita fixa (recorrente todo mês)
                </label>
              </div>

              <button type="submit" className="btn-primary">
                {editandoReceita ? 'Salvar' : 'Adicionar Receita'}
              </button>
              {editandoReceita && (
                <button type="button" className="btn-secondary" style={{marginTop: 10}} onClick={() => {
                  setEditandoReceita(null);
                  setNovaReceita({
                    nome_receita: '',
                    valor_receita: '',
                    data_recebimento: '',
                    descricao: '',
                    categoria_id: '',
                    fixa: false
                  });
                }}>
                  Cancelar Edição
                </button>
              )}
            </form>
          </div>

          <div className="receitas-list">
            <h3>Receitas Cadastradas</h3>
            {receitas.length === 0 ? (
              <div className="empty-list-message">
                <h4>Nenhuma receita cadastrada.</h4>
                <p>Comece adicionando suas receitas usando o formulário ao lado.</p>
              </div>
            ) : (
              <div className="receitas-grid">
                {receitas
                  .filter(r => perfilFiltro === 'todos' || r.nome_perfil === perfilFiltro)
                  .map((receita) => (
                    <div key={receita.id_receita} className="receita-card">
                      <div className="receita-header">
                        <h4 className="receita-titulo">{receita.nome_receita} {receita.fixa && <span title="Receita fixa" style={{color: '#1cc88a', fontSize: '1.1em', marginLeft: 4}}>📌</span>}<span style={{fontWeight: 400, fontSize: '0.95em', color: '#888'}}> ({receita.nome_perfil})</span></h4>
                        <span className="receita-valor">R$ {Number(receita.valor_receita).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="receita-info">
                        <p><strong>Data:</strong> {new Date(receita.data_recebimento).toLocaleDateString()}</p>
                        {receita.nome_categoria && <p><strong>Categoria:</strong> {receita.nome_categoria}</p>}
                        {receita.descricao && <p><strong>Descrição:</strong> {receita.descricao}</p>}
                      </div>
                      <div className="receita-actions">
                        <button onClick={() => handleExcluir(receita.id_receita)} className="btn-delete">
                          Excluir
                        </button>
                        <button onClick={() => {
                          setEditandoReceita(receita);
                          const formatarData = (data) => {
                            if (!data) return '';
                            const d = new Date(data);
                            const month = (d.getMonth() + 1).toString().padStart(2, '0');
                            const day = d.getDate().toString().padStart(2, '0');
                            return `${d.getFullYear()}-${month}-${day}`;
                          };
                          setNovaReceita({
                            nome_receita: receita.nome_receita,
                            valor_receita: receita.valor_receita,
                            data_recebimento: formatarData(receita.data_recebimento),
                            descricao: receita.descricao || '',
                            categoria_id: receita.categoria_id || '',
                            fixa: receita.fixa || false
                          });
                        }} className="btn-edit" style={{marginLeft: 8}}>
                          <FaEdit style={{marginRight: 4}} /> Editar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Receitas; 