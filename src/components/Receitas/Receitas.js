import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaWallet, FaCreditCard, FaCog, FaSignOutAlt, FaRegChartBar, FaPiggyBank, FaUsers } from 'react-icons/fa';
import './Receitas.css';

function Receitas({ usuario, perfil, onLogout, onPerfilAtualizado }) {
  const [receitas, setReceitas] = useState([]);
  const [novaReceita, setNovaReceita] = useState({
    nome_receita: '',
    valor_receita: '',
    data_recebimento: '',
    descricao: '',
    categoria_id: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const navigate = useNavigate();

  const carregarReceitas = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/receitas/${perfil.id_perfil}`);
      if (!response.ok) throw new Error('Erro ao carregar receitas');
      const data = await response.json();
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      setError('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [perfil]);

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
  }, [usuario, perfil, onLogout, carregarReceitas, carregarCategorias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/receitas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...novaReceita,
          perfil_id: perfil.id_perfil
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao adicionar receita');
      }

      // Limpar formulário
      setNovaReceita({
        nome_receita: '',
        valor_receita: '',
        data_recebimento: '',
        descricao: '',
        categoria_id: ''
      });

      // Recarregar receitas
      await carregarReceitas();
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      setError(error.message || 'Erro ao adicionar receita');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta receita?')) {
      return;
    }

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
        <div className="menu">
          <div className="menu-item" onClick={() => handleNavigation('/dashboard')}>
            <FaRegChartBar />
            <span>Dashboard</span>
          </div>
          <div className="menu-item active" onClick={() => handleNavigation('/receitas')}>
            <FaMoneyBillWave />
            <span>Receitas</span>
          </div>
          {perfil?.permissoes?.pode_ver_todas_contas && (
            <div className="menu-item" onClick={() => handleNavigation('/despesas')}>
              <FaWallet />
              <span>Despesas</span>
            </div>
          )}
          <div className="menu-item" onClick={() => handleNavigation('/cartoes')}>
            <FaCreditCard />
            <span>Cartões</span>
          </div>
          <div className="menu-item" onClick={() => handleNavigation('/imposto-renda')}>
            <FaPiggyBank />
            <span>Imposto Renda</span>
          </div>
          {perfil?.permissoes?.pode_ver_todas_contas && (
            <div className="menu-item" onClick={() => handleNavigation('/gerenciar-perfis')}>
              <FaUsers />
              <span>Gerenciar Perfis</span>
            </div>
          )}
          <div className="menu-item" onClick={() => handleNavigation('/configuracoes')}>
            <FaCog />
            <span>Configurações</span>
          </div>
        </div>
      </div>

      <div className="receitas">
        <div className="receitas-header">
          <h2>Receitas</h2>
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

              <button type="submit" className="btn-primary">
                Adicionar Receita
              </button>
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
                {receitas.map((receita) => (
                  <div key={receita.id_receita} className="receita-card">
                    <div className="receita-header">
                      <h4 className="receita-titulo">{receita.nome_receita}</h4>
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