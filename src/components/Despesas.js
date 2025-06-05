import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Despesas.css';

function Despesas({ usuario, perfil, onLogout, onPerfilAtualizado }) {
  const [despesas, setDespesas] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: '',
    valor: '',
    data: '',
    categoria: 'Moradia'
  });
  const navigate = useNavigate();

  // Mova a verificação para depois dos hooks
  useEffect(() => {
    if (usuario && perfil) {
      const despesasSalvas = JSON.parse(localStorage.getItem(`despesas_${usuario.id}`)) || [];
      setDespesas(despesasSalvas);
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
      data: '',
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

  const categorias = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];

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
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <h1>Despesas</h1>
        </div>

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