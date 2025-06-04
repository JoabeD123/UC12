import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ usuario, perfil, onLogout }) {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    receitasPorCategoria: [],
    despesasPorCategoria: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario || !perfil) {
      onLogout();
      return;
    }

    // Carregar dados financeiros
    const receitas = JSON.parse(localStorage.getItem(`receitas_${usuario.id}`)) || [];
    const despesas = JSON.parse(localStorage.getItem(`despesas_${usuario.id}`)) || [];

    // Calcular totais
    const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);
    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);

    // Agrupar por categoria
    const receitasPorCategoria = receitas.reduce((acc, receita) => {
      if (!acc[receita.categoria]) {
        acc[receita.categoria] = 0;
      }
      acc[receita.categoria] += receita.valor;
      return acc;
    }, {});

    const despesasPorCategoria = despesas.reduce((acc, despesa) => {
      if (!acc[despesa.categoria]) {
        acc[despesa.categoria] = 0;
      }
      acc[despesa.categoria] += despesa.valor;
      return acc;
    }, {});

    // Formatar dados para exibição
    setDadosFinanceiros({
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: totalReceitas - totalDespesas,
      receitasPorCategoria: Object.entries(receitasPorCategoria).map(([categoria, valor]) => ({
        categoria,
        valor
      })),
      despesasPorCategoria: Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
        categoria,
        valor
      }))
    });
  }, [usuario, perfil, onLogout]);

  if (!usuario || !perfil) {
    return null;
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">GF</div>
        </div>
        <nav className="menu">
          <ul>
            <li className="active">
              <span className="menu-icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </li>
            {perfil.permissoes.verReceitas && (
              <li onClick={() => navigate('/receitas')}>
                <span className="menu-icon">💰</span>
                <span className="menu-text">Receitas</span>
              </li>
            )}
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
          <h1>Bem-vindo(a), {usuario.nome}!</h1>
          <select 
            className="month-selector"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
          >
            {meses.map((mes, index) => (
              <option key={index} value={index}>
                {mes}
              </option>
            ))}
          </select>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Receitas</h3>
            <p className="amount positive">R$ {dadosFinanceiros.receitas.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Despesas</h3>
            <p className="amount negative">R$ {dadosFinanceiros.despesas.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Saldo</h3>
            <p className={`amount ${dadosFinanceiros.saldo >= 0 ? 'positive' : 'negative'}`}>
              R$ {dadosFinanceiros.saldo.toFixed(2)}
            </p>
          </div>
        </div>

        {perfil.permissoes.verRelatorios && (
          <div className="charts">
            <div className="chart-container">
              <h2>Receitas por Categoria</h2>
              <div className="donut-chart">
                <ul>
                  {dadosFinanceiros.receitasPorCategoria.map((item, index) => (
                    <li key={index}>
                      {item.categoria}: R$ {item.valor.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="chart-container">
              <h2>Despesas por Categoria</h2>
              <div className="bar-chart">
                <ul>
                  {dadosFinanceiros.despesasPorCategoria.map((item, index) => (
                    <li key={index}>
                      {item.categoria}: R$ {item.valor.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 