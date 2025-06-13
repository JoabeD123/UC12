import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMoneyBillWave, FaWallet, FaCreditCard, FaChartPie, FaCog, FaSignOutAlt, FaRegChartBar, FaPiggyBank, FaUniversity, FaArrowUp, FaArrowDown, FaUsers } from 'react-icons/fa';
import './Despesas.css';

function Despesas({ usuario, perfil, onLogout, onPerfilAtualizado }) {
  const [despesas, setDespesas] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'Moradia'
  });
  const [categorias, setCategorias] = useState(['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros']);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario && perfil) {
      const despesasSalvas = JSON.parse(localStorage.getItem(`despesas_${usuario.id}`)) || [];
      setDespesas(despesasSalvas);

      // Carregar categorias personalizadas
      const categoriasPersonalizadas = JSON.parse(localStorage.getItem(`categorias_despesas_${usuario.id}`)) || ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];
      setCategorias(categoriasPersonalizadas);
    }
  }, [usuario, perfil]);

  if (!usuario || !perfil || !perfil.permissoes.verDespesas) {
    onLogout();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!perfil.permissoes.editarDespesas) {
      alert('Você não tem permissão para adicionar despesas.');
      return;
    }

    const novaDespesaObj = {
      id: Date.now().toString(),
      ...novaDespesa,
      valor: parseFloat(novaDespesa.valor),
      usuarioId: usuario.id
    };

    const despesasAtualizadas = [...despesas, novaDespesaObj];
    setDespesas(despesasAtualizadas);
    localStorage.setItem(`despesas_${usuario.id}`, JSON.stringify(despesasAtualizadas));

    setNovaDespesa({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: 'Moradia'
    });
  };

  const handleExcluir = (id) => {
    if (!perfil.permissoes.editarDespesas) {
      alert('Você não tem permissão para excluir despesas.');
      return;
    }

    const despesasAtualizadas = despesas.filter(despesa => despesa.id !== id);
    setDespesas(despesasAtualizadas);
    localStorage.setItem(`despesas_${usuario.id}`, JSON.stringify(despesasAtualizadas));
  };

  const handleAdicionarCategoria = (e) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    const categoriaFormatada = novaCategoria.trim();
    if (categorias.includes(categoriaFormatada)) {
      alert('Esta categoria já existe!');
      return;
    }

    const categoriasAtualizadas = [...categorias, categoriaFormatada];
    setCategorias(categoriasAtualizadas);
    localStorage.setItem(`categorias_despesas_${usuario.id}`, JSON.stringify(categoriasAtualizadas));
    setNovaCategoria('');
    setMostrarFormCategoria(false);
  };

  const handleExcluirCategoria = (categoria) => {
    const categoriasFixas = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];
    if (categoriasFixas.includes(categoria)) {
      alert('Não é possível excluir categorias padrão!');
      return;
    }

    const categoriasAtualizadas = categorias.filter(cat => cat !== categoria);
    setCategorias(categoriasAtualizadas);
    localStorage.setItem(`categorias_despesas_${usuario.id}`, JSON.stringify(categoriasAtualizadas));
  };

  return (
    <div className="layout-container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">GF</div>
        </div>
        <nav className="menu">
          <ul>
            <li onClick={() => navigate('/dashboard')}>
              <FaRegChartBar className="menu-icon" />
              <span className="menu-text">Dashboard</span>
            </li>
            {perfil?.permissoes.verReceitas && (
              <li onClick={() => navigate('/receitas')}>
                <FaMoneyBillWave className="menu-icon" />
                <span className="menu-text">Receitas</span>
              </li>
            )}
            <li className="active">
              <FaWallet className="menu-icon" />
              <span className="menu-text">Despesas</span>
            </li>
            <li onClick={() => navigate('/cartoes')}>
              <FaCreditCard className="menu-icon" />
              <span className="menu-text">Cartões</span>
            </li>
            <li onClick={() => navigate('/imposto-renda')}>
              <FaPiggyBank className="menu-icon" />
              <span className="menu-text">Imposto Renda</span>
            </li>
            {perfil?.permissoes.gerenciarPerfis && (
              <li onClick={() => navigate('/gerenciar-perfis')}>
                <FaUsers className="menu-icon" />
                <span className="menu-text">Gerenciar Perfis</span>
              </li>
            )}
            <li onClick={() => navigate('/configuracoes')}>
                <FaCog className="menu-icon" />
                <span className="menu-text">Configurações</span>
            </li>
            <li onClick={onLogout}>
              <FaSignOutAlt className="menu-icon" />
              <span className="menu-text">Sair</span>
            </li>
          </ul>
        </nav>
        <div className="add-button">
            <FaPlus />
        </div>
      </div>

      <div className="despesas-container">
        <div className="content-header">
          <h1>Despesas</h1>
          {perfil.permissoes.editarDespesas && (
            <button 
              onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
              className="btn-secondary"
            >
              {mostrarFormCategoria ? 'Cancelar' : 'Gerenciar Categorias'}
            </button>
          )}
        </div>

        {mostrarFormCategoria && perfil.permissoes.editarDespesas && (
          <div className="categorias-container">
            <h3>Gerenciar Categorias</h3>
            <form onSubmit={handleAdicionarCategoria} className="categoria-form">
              <div className="form-group">
                <input
                  type="text"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Nova categoria"
                  required
                />
                <button type="submit" className="btn-primary">
                  Adicionar Categoria
                </button>
              </div>
            </form>
            <div className="categorias-lista">
              {categorias.map(categoria => (
                <div key={categoria} className="categoria-item">
                  <span>{categoria}</span>
                  {!['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'].includes(categoria) && (
                    <button
                      onClick={() => handleExcluirCategoria(categoria)}
                      className="btn-excluir"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {perfil.permissoes.editarDespesas && (
          <form onSubmit={handleSubmit} className="despesa-form">
            <div className="form-group">
                <label>Descrição:</label>
                <input
                  type="text"
                  value={novaDespesa.descricao}
                  onChange={(e) => setNovaDespesa(prev => ({ ...prev, descricao: e.target.value }))}
                  required
                />
            </div>

            <div className="form-group">
                <label>Valor:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novaDespesa.valor}
                  onChange={(e) => setNovaDespesa(prev => ({ ...prev, valor: e.target.value }))}
                  required
                />
            </div>

            <div className="form-group">
                <label>Data:</label>
                <input
                  type="date"
                  value={novaDespesa.data}
                  onChange={(e) => setNovaDespesa(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
            </div>

            <div className="form-group">
                <label>Categoria:</label>
                <select
                  value={novaDespesa.categoria}
                  onChange={(e) => setNovaDespesa(prev => ({ ...prev, categoria: e.target.value }))}
                  required
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
            </div>
            
            <button type="submit" className="btn-submit">
              Adicionar Despesa
            </button>
          </form>
        )}

        <div className="lista-container">
          <div className="lista-header">
            <h3>Minhas Despesas</h3>
          </div>
          {despesas.length === 0 ? (
            <p className="sem-despesas">Nenhuma despesa cadastrada.</p>
          ) : (
            <div className="lista-items">
              {despesas.map(despesa => (
                <div key={despesa.id} className="item">
                  <div className="item-info">
                    <strong>{despesa.descricao}</strong>
                    <span className="categoria">{despesa.categoria}</span>
                    <span className="data">{new Date(despesa.data).toLocaleDateString()}</span>
                  </div>
                  <span className="valor-despesa">R$ {despesa.valor.toFixed(2).replace('.', ',')}</span>
                  <div className="item-actions">
                      <button onClick={() => handleExcluir(despesa.id)} className="btn-excluir">
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
  );
}

export default Despesas; 