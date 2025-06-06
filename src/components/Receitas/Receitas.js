import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Receitas.css';

function Receitas({ usuario, perfil, onLogout, onPerfilAtualizado }) {
  const [receitas, setReceitas] = useState([]);
  const [novaReceita, setNovaReceita] = useState({
    descricao: '',
    valor: '',
    data: '',
    categoria: 'Salário'
  });
  const [categorias, setCategorias] = useState(['Salário', 'Freelance', 'Investimentos', 'Outros']);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario && perfil) {
      const receitasSalvas = JSON.parse(localStorage.getItem(`receitas_${usuario.id}`)) || [];
      setReceitas(receitasSalvas);
      
      // Carregar categorias personalizadas
      const categoriasPersonalizadas = JSON.parse(localStorage.getItem(`categorias_receitas_${usuario.id}`)) || ['Salário', 'Freelance', 'Investimentos', 'Outros'];
      setCategorias(categoriasPersonalizadas);
    }
  }, [usuario, perfil]);

  if (!usuario || !perfil || !perfil.permissoes.verReceitas) {
    onLogout();
    return null;
  }

  if (!perfil.permissoes.verReceitas) {
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
    if (!perfil.permissoes.editarReceitas) {
      alert('Você não tem permissão para adicionar receitas.');
      return;
    }

    const novaReceitaObj = {
      id: Date.now().toString(),
      ...novaReceita,
      valor: parseFloat(novaReceita.valor),
      usuarioId: usuario.id
    };

    const receitasAtualizadas = [...receitas, novaReceitaObj];
    setReceitas(receitasAtualizadas);
    localStorage.setItem(`receitas_${usuario.id}`, JSON.stringify(receitasAtualizadas));

    setNovaReceita({
      descricao: '',
      valor: '',
      data: '',
      categoria: 'Salário'
    });
  };

  const handleExcluir = (id) => {
    if (!perfil.permissoes.editarReceitas) {
      alert('Você não tem permissão para excluir receitas.');
      return;
    }

    const receitasAtualizadas = receitas.filter(receita => receita.id !== id);
    setReceitas(receitasAtualizadas);
    localStorage.setItem(`receitas_${usuario.id}`, JSON.stringify(receitasAtualizadas));
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
    localStorage.setItem(`categorias_receitas_${usuario.id}`, JSON.stringify(categoriasAtualizadas));
    setNovaCategoria('');
    setMostrarFormCategoria(false);
  };

  const handleExcluirCategoria = (categoria) => {
    if (categoria === 'Salário' || categoria === 'Freelance' || categoria === 'Investimentos' || categoria === 'Outros') {
      alert('Não é possível excluir categorias padrão!');
      return;
    }

    const categoriasAtualizadas = categorias.filter(cat => cat !== categoria);
    setCategorias(categoriasAtualizadas);
    localStorage.setItem(`categorias_receitas_${usuario.id}`, JSON.stringify(categoriasAtualizadas));
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
            <li className="active">
              <span className="menu-icon">💰</span>
              <span className="menu-text">Receitas</span>
            </li>
            {perfil?.permissoes.verDespesas && (
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
              <li onClick={() => navigate('/gerenciar-perfis')}>
                <span className="menu-icon">👥</span>
                <span className="menu-text">Gerenciar Perfis</span>
              </li>
            )}
            <li onClick={onLogout}>
              <span className="menu-icon">🚪</span>
              <span className="menu-text">Sair</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => navigate('/configuracoes')} className="config-button">
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">Configurações</span>
          </button>
        </div>
      </div>

      <div className="receitas-container">
        <div className="content-header">
          <h1>Receitas</h1>
          {perfil.permissoes.editarReceitas && (
            <button 
              onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
              className="btn-secondary"
            >
              {mostrarFormCategoria ? 'Cancelar' : 'Gerenciar Categorias'}
            </button>
          )}
        </div>

        {mostrarFormCategoria && perfil.permissoes.editarReceitas && (
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
                  {!['Salário', 'Freelance', 'Investimentos', 'Outros'].includes(categoria) && (
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

        {perfil.permissoes.editarReceitas && (
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label>Descrição:</label>
                <input
                  type="text"
                  value={novaReceita.descricao}
                  onChange={(e) => setNovaReceita(prev => ({ ...prev, descricao: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novaReceita.valor}
                  onChange={(e) => setNovaReceita(prev => ({ ...prev, valor: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Data:</label>
                <input
                  type="date"
                  value={novaReceita.data}
                  onChange={(e) => setNovaReceita(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoria:</label>
                <select
                  value={novaReceita.categoria}
                  onChange={(e) => setNovaReceita(prev => ({ ...prev, categoria: e.target.value }))}
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
                Adicionar Receita
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
                {perfil.permissoes.editarReceitas && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {receitas.map(receita => (
                <tr key={receita.id}>
                  <td>{receita.descricao}</td>
                  <td>R$ {receita.valor.toFixed(2)}</td>
                  <td>{new Date(receita.data).toLocaleDateString()}</td>
                  <td>{receita.categoria}</td>
                  {perfil.permissoes.editarReceitas && (
                    <td>
                      <button
                        onClick={() => handleExcluir(receita.id)}
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

export default Receitas; 