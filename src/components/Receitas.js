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
  const navigate = useNavigate();

  // Mova a verificação para depois dos hooks
  useEffect(() => {
    if (usuario && perfil) {
      const receitasSalvas = JSON.parse(localStorage.getItem(`receitas_${usuario.id}`)) || [];
      setReceitas(receitasSalvas);
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

  const categorias = ['Salário', 'Freelance', 'Investimentos', 'Outros'];

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">GF</div>
        </div>
        <nav className="menu">
          <ul>
            <li onClick={() => navigate('/dashboard')}>
              <span className="menu-icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </li>
            <li className="active">
              <span className="menu-icon">💰</span>
              <span className="menu-text">Receitas</span>
            </li>
            {perfil.permissoes.verDespesas && (
              <li onClick={() => navigate('/despesas')}>
                <span className="menu-icon">💸</span>
                <span className="menu-text">Despesas</span>
              </li>
            )}
            {perfil.permissoes.gerenciarPerfis && (
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
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <h1>Receitas</h1>
        </div>

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