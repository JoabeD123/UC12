import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './Dashboard.css';

// Registrar os componentes necessários do Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement
);

function Dashboard({ usuario, perfil, onLogout }) {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
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

    // Agrupar despesas por categoria
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

  // Configuração do gráfico de rosca (Despesas por Categoria)
  const despesasChartData = {
    labels: dadosFinanceiros.despesasPorCategoria.map(item => item.categoria),
    datasets: [
      {
        data: dadosFinanceiros.despesasPorCategoria.map(item => item.valor),
        backgroundColor: [
          '#f44336',
          '#E91E63',
          '#9C27B0',
          '#673AB7',
          '#3F51B5',
          '#2196F3'
        ],
        borderWidth: 1
      }
    ]
  };

  // Configuração do gráfico de barras (Comparação Receitas x Despesas)
  const comparacaoChartData = {
    labels: ['Receitas x Despesas'],
    datasets: [
      {
        label: 'Receitas',
        data: [dadosFinanceiros.receitas],
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        borderWidth: 1
      },
      {
        label: 'Despesas',
        data: [dadosFinanceiros.despesas],
        backgroundColor: '#f44336',
        borderColor: '#f44336',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: R$ ${value.toFixed(2)}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: isNaN(value) || value === 0,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `R$ ${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toFixed(2);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `${context.dataset.label}: R$ ${value.toFixed(2)}`;
          }
        }
      }
    }
  };

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
            {perfil?.permissoes.verReceitas && (
              <li onClick={() => navigate('/receitas')}>
                <span className="menu-icon">💰</span>
                <span className="menu-text">Receitas</span>
              </li>
            )}
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

        <div className="charts">
          <div className="chart-container">
            <h2>Comparação Receitas x Despesas</h2>
            <div className="chart-wrapper">
              <Bar data={comparacaoChartData} options={barChartOptions} />
            </div>
          </div>

          {dadosFinanceiros.despesasPorCategoria.length > 0 && (
            <div className="chart-container">
              <h2>Despesas por Categoria</h2>
              <div className="chart-wrapper">
                <Doughnut data={despesasChartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 