import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaWallet, FaCreditCard, FaCog, FaSignOutAlt, FaRegChartBar, FaPiggyBank, FaUsers } from 'react-icons/fa';
import './Despesas.css';

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
    status_pagamento_id: 1
  });
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const navigate = useNavigate();

  const carregarDespesas = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/despesas/${perfil.id_perfil}`);
      if (!response.ok) throw new Error('Erro ao carregar despesas');
      const data = await response.json();
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      setError('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, [perfil]);

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
    if (!perfil.permissoes?.pode_criar_conta) {
      alert('Você não tem permissão para adicionar despesas.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/despesas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          perfil_id: perfil.id_perfil,
          ...novaDespesa,
          valor_conta: parseFloat(novaDespesa.valor_conta)
        }),
      });

      if (!response.ok) throw new Error('Erro ao criar despesa');
      
      const novaDespesaCriada = await response.json();
      setDespesas([...despesas, novaDespesaCriada]);
      
      setNovaDespesa({
        nome_conta: '',
        valor_conta: '',
        data_entrega: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        descricao: '',
        categoria_id: '',
        tipo_conta_id: 1,
        recorrencia_id: 1,
        status_pagamento_id: 1
      });
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      alert('Erro ao criar despesa. Tente novamente.');
    }
  };

  const handleExcluir = async (id) => {
    if (!perfil.permissoes?.pode_excluir_conta) {
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

  if (!perfil.permissoes?.pode_ver_todas_contas) {
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
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">GF</div>
        </div>
        <nav className="menu">
          <ul>
            <li onClick={() => handleNavigation('/dashboard')}>
              <FaRegChartBar className="menu-icon" />
              <span className="menu-text">Dashboard</span>
            </li>
            {perfil?.permissoes?.pode_ver_todas_contas && (
              <li onClick={() => handleNavigation('/receitas')}>
                <FaMoneyBillWave className="menu-icon" />
                <span className="menu-text">Receitas</span>
              </li>
            )}
            <li className="active">
              <FaWallet className="menu-icon" />
              <span className="menu-text">Despesas</span>
            </li>
            <li onClick={() => handleNavigation('/cartoes')}>
              <FaCreditCard className="menu-icon" />
              <span className="menu-text">Cartões</span>
            </li>
            <li onClick={() => handleNavigation('/imposto-renda')}>
              <FaPiggyBank className="menu-icon" />
              <span className="menu-text">Imposto Renda</span>
            </li>
            {perfil?.permissoes?.pode_ver_todas_contas && (
              <li onClick={() => handleNavigation('/gerenciar-perfis')}>
                <FaUsers className="menu-icon" />
                <span className="menu-text">Gerenciar Perfis</span>
              </li>
            )}
            <li onClick={() => handleNavigation('/configuracoes')}>
              <FaCog className="menu-icon" />
              <span className="menu-text">Configurações</span>
            </li>
            <li onClick={onLogout}>
              <FaSignOutAlt className="menu-icon" />
              <span className="menu-text">Sair</span>
            </li>
          </ul>
        </nav>
      </div>

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

              <button type="submit" className="btn-primary">
                Adicionar Despesa
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
                      <h4 className="despesa-titulo">{despesa.nome_conta}</h4>
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