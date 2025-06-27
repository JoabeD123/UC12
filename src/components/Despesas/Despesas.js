import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Despesas.css';
import Sidebar from '../Sidebar/Sidebar';

function Despesas({ usuario, perfil, onLogout, onPerfilAtualizado }) {
  const [despesas, setDespesas] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState({
    nome_conta: '',
    valor_conta: '',
    data_entrega: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria_id: '',
    tipo_conta_id: 1,
    recorrencia_id: 1,
    status_pagamento_id: 1,
    fixa: false
  });
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [editandoDespesa, setEditandoDespesa] = useState(null);
  const navigate = useNavigate();

  const carregarDespesas = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/despesas/${usuario.id_usuario}`);
      if (!response.ok) throw new Error('Erro ao carregar despesas');
      const data = await response.json();
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      setError('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  const carregarCategorias = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categorias?tipo=despesa');
      if (!response.ok) throw new Error('Erro ao carregar categorias de despesa');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias de despesa:', error);
      setError('Erro ao carregar categorias de despesa');
    }
  }, []);

  useEffect(() => {
    if (usuario && perfil) {
      carregarDespesas();
      carregarCategorias();
    }
  }, [usuario, perfil, carregarDespesas, carregarCategorias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!perfil.permissoes?.ver_despesas) {
      alert('Você não tem permissão para adicionar despesas.');
      return;
    }
    try {
      if (editandoDespesa) {
        // Edição de despesa existente
        const response = await fetch(`http://localhost:3001/api/despesas/${editandoDespesa.id_conta}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            perfil_id: perfil.id_perfil,
            ...novaDespesa,
            valor_conta: parseFloat(novaDespesa.valor_conta)
          })
        });
        if (!response.ok) throw new Error('Erro ao editar despesa');
        await carregarDespesas();
        setEditandoDespesa(null);
      } else {
        // Adição normal
        const response = await fetch('http://localhost:3001/api/despesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: usuario.id_usuario,
            perfil_id: perfil.id_perfil,
            nome_conta: novaDespesa.nome_conta,
            valor_conta: novaDespesa.valor_conta,
            data_entrega: novaDespesa.data_entrega,
            data_vencimento: novaDespesa.data_vencimento,
            descricao: novaDespesa.descricao,
            categoria_id: novaDespesa.categoria_id,
            tipo_conta_id: novaDespesa.tipo_conta_id,
            recorrencia_id: novaDespesa.recorrencia_id,
            status_pagamento_id: novaDespesa.status_pagamento_id,
            fixa: novaDespesa.fixa
          })
        });
        if (!response.ok) throw new Error('Erro ao criar despesa');
        const novaDespesaCriada = await response.json();
        setDespesas([...despesas, novaDespesaCriada]);
      }
      setNovaDespesa({
        nome_conta: '',
        valor_conta: '',
        data_entrega: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        descricao: '',
        categoria_id: '',
        tipo_conta_id: 1,
        recorrencia_id: 1,
        status_pagamento_id: 1,
        fixa: false
      });
    } catch (error) {
      console.error('Erro ao criar/editar despesa:', error);
      alert('Erro ao criar/editar despesa. Tente novamente.');
    }
  };

  const handleExcluir = async (id) => {
    if (!perfil.permissoes?.ver_despesas) {
      alert('Você não tem permissão para excluir despesas.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/despesas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir despesa');
      
      setDespesas(despesas.filter(despesa => despesa.id_conta !== id));
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa. Tente novamente.');
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
        body: JSON.stringify({ nome_categoria: novaCategoria, tipo_categoria: 'despesa' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao adicionar categoria de despesa');
      }

      setNovaCategoria('');
      setShowCategoriaForm(false);
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao adicionar categoria de despesa:', error);
      setError(error.message || 'Erro ao adicionar categoria de despesa');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (!usuario || !perfil) {
    return null;
  }

  if (!perfil.permissoes?.ver_despesas) {
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

      <div className="despesas">
        <div className="despesas-header">
          <h2>Despesas</h2>
        </div>

        <div className="despesas-content">
          <div className="despesas-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descrição:</label>
                <input
                  type="text"
                  value={novaDespesa.nome_conta}
                  onChange={(e) => setNovaDespesa({...novaDespesa, nome_conta: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Valor:</label>
                <input
                  type="number"
                  step="0.01"
                  value={novaDespesa.valor_conta}
                  onChange={(e) => setNovaDespesa({...novaDespesa, valor_conta: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data de Entrega:</label>
                <input
                  type="date"
                  value={novaDespesa.data_entrega}
                  onChange={(e) => setNovaDespesa({...novaDespesa, data_entrega: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data de Vencimento:</label>
                <input
                  type="date"
                  value={novaDespesa.data_vencimento}
                  onChange={(e) => setNovaDespesa({...novaDespesa, data_vencimento: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria:</label>
                <select
                  value={novaDespesa.categoria_id}
                  onChange={(e) => setNovaDespesa({...novaDespesa, categoria_id: e.target.value})}
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
                  value={novaDespesa.descricao}
                  onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                ></textarea>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={novaDespesa.fixa}
                    onChange={e => setNovaDespesa({ ...novaDespesa, fixa: e.target.checked })}
                  /> Despesa fixa (recorrente todo mês)
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary"
              >
                {editandoDespesa ? 'Salvar' : 'Adicionar Despesa'}
              </button>
            </form>
          </div>

          <div className="despesas-list">
            <h3>Minhas Despesas</h3>
            {despesas.length === 0 ? (
              <div className="empty-list-message">
                <h4>Nenhuma despesa cadastrada.</h4>
                <p>Comece adicionando suas despesas usando o formulário ao lado.</p>
              </div>
            ) : (
              <div className="despesas-grid">
                {despesas.map((despesa) => (
                  <div key={despesa.id_conta} className="despesa-card">
                    <div className="despesa-header">
                      <h4 className="despesa-titulo">{despesa.nome_conta} {despesa.fixa && <span title="Despesa fixa" style={{color: '#e74a3b', fontSize: '1.1em', marginLeft: 4}}>📌</span>}<span style={{fontWeight: 400, fontSize: '0.95em', color: '#888'}}> ({despesa.nome_perfil})</span></h4>
                      <span className="despesa-valor">R$ {Number(despesa.valor_conta).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="despesa-info">
                      <p><strong>Data de Vencimento:</strong> {new Date(despesa.data_vencimento).toLocaleDateString()}</p>
                      <p><strong>Data de Entrega:</strong> {new Date(despesa.data_entrega).toLocaleDateString()}</p>
                      {despesa.nome_categoria && <p><strong>Categoria:</strong> {despesa.nome_categoria}</p>}
                      {despesa.descricao && <p><strong>Descrição:</strong> {despesa.descricao}</p>}
                      <p><strong>Tipo:</strong> {despesa.nome_tipo_conta}</p>
                      <p><strong>Recorrência:</strong> {despesa.nome_recorrencia}</p>
                      <p><strong>Status:</strong> {despesa.nome_status_pagamento}</p>
                    </div>
                    <div className="despesa-actions">
                      <button onClick={() => handleExcluir(despesa.id_conta)} className="btn-delete">
                        Excluir
                      </button>
                      <button
                        onClick={() => {
                          setEditandoDespesa(despesa);
                          // Corrigir formato das datas para yyyy-MM-dd
                          const formatarData = (data) => {
                            if (!data) return '';
                            const d = new Date(data);
                            const month = (d.getMonth() + 1).toString().padStart(2, '0');
                            const day = d.getDate().toString().padStart(2, '0');
                            return `${d.getFullYear()}-${month}-${day}`;
                          };
                          setNovaDespesa({
                            nome_conta: despesa.nome_conta,
                            valor_conta: despesa.valor_conta,
                            data_entrega: formatarData(despesa.data_entrega),
                            data_vencimento: formatarData(despesa.data_vencimento),
                            descricao: despesa.descricao || '',
                            categoria_id: despesa.categoria_id || '',
                            tipo_conta_id: despesa.tipo_conta_id || 1,
                            recorrencia_id: despesa.recorrencia_id || 1,
                            status_pagamento_id: despesa.status_pagamento_id || 1,
                            fixa: despesa.fixa || false
                          });
                        }}
                        className="btn-edit"
                        style={{ marginLeft: 8 }}
                      >
                        Editar
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

export default Despesas; 