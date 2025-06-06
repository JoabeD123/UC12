import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
            <li onClick={() => navigate('/')}>
              <span className="menu-icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </li>
            {perfil?.permissoes.verReceitas && (
              <li onClick={() => navigate('/receitas')}>
                <span className="menu-icon">💰</span>
                <span className="menu-text">Receitas</span>
              </li>
            )}
            <li className="active">
              <span className="menu-icon">💸</span>
              <span className="menu-text">Despesas</span>
            </li>
            <li onClick={() => navigate('/cartoes')}>
              <span className="menu-icon">💳</span>
              <span className="menu-text">Cartões</span>
            </li>
            <li onClick={() => navigate('/imposto-renda')}>
              <span className="menu-icon">📑</span>
              <span className="menu-text">Imposto de Renda</span>
            </li>
            {perfil?.permissoes.gerenciarPerfis && (
              <li onClick={() => navigate('/gerenciar-perfis')}>
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
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-row">
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
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Adicionar Despesa
              </button>
            </div>
          </form>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Categoria</th>
                {perfil.permissoes.editarDespesas && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {despesas.map(despesa => (
                <tr key={despesa.id}>
                  <td>{despesa.descricao}</td>
                  <td>R$ {despesa.valor.toFixed(2)}</td>
                  <td>{new Date(despesa.data).toLocaleDateString()}</td>
                  <td>{despesa.categoria}</td>
                  {perfil.permissoes.editarDespesas && (
                    <td>
                      <button
                        onClick={() => handleExcluir(despesa.id)}
                        className="btn-excluir"
                      >
                        Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Despesas; 