import React, { useState, useEffect, useCallback } from 'react';
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
import { FaPlus, FaMoneyBillWave, FaWallet, FaCreditCard, FaCog, FaSignOutAlt, FaRegChartBar, FaPiggyBank, FaUniversity, FaArrowUp, FaArrowDown, FaUsers } from 'react-icons/fa';
import { IoArrowForward } from "react-icons/io5";
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

function Dashboard({ onLogout, setUsuario, setPerfil, usuario, perfil }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    despesasPorCategoria: []
  });
  const navigate = useNavigate();

  const carregarDadosFinanceiros = useCallback(async () => {
    try {
      // Carregar receitas
      const receitasResponse = await fetch(`http://localhost:3001/api/receitas/${perfil.id_perfil}`);
      if (!receitasResponse.ok) throw new Error('Erro ao carregar receitas');
      const receitas = await receitasResponse.json();

      // Carregar despesas
      const despesasResponse = await fetch(`http://localhost:3001/api/despesas/${perfil.id_perfil}`);
      if (!despesasResponse.ok) throw new Error('Erro ao carregar despesas');
      const despesas = await despesasResponse.json();

      // Calcular totais
      const totalReceitas = receitas.reduce((total, receita) => total + parseFloat(receita.valor_receita), 0);
      const totalDespesas = despesas.reduce((total, despesa) => total + parseFloat(despesa.valor_conta), 0);

      // Agrupar despesas por categoria
      const despesasPorCategoria = despesas.reduce((acc, despesa) => {
        const categoria = despesa.nome_categoria || 'Sem categoria';
        if (!acc[categoria]) {
          acc[categoria] = 0;
        }
        acc[categoria] += parseFloat(despesa.valor_conta);
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
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      setError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [perfil]);

  useEffect(() => {
    if (!usuario || !perfil) {
      onLogout();
      return;
    }

    carregarDadosFinanceiros();
  }, [usuario, perfil, onLogout, carregarDadosFinanceiros]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
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
        borderWidth: 1,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#333' : '#fff'
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
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333',
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
        backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#333' : '#fff',
        titleColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333',
        bodyColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333',
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#444' : '#ddd',
        borderWidth: 1,
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
        grid: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#333' : 'var(--chart-grid-color-light)'
        },
        ticks: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : 'var(--chart-legend-color-light)',
          callback: function(value) {
            return 'R$ ' + value.toFixed(0);
          }
        }
      },
      x: {
        grid: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#333' : 'var(--chart-grid-color-light)'
        },
        ticks: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : 'var(--chart-legend-color-light)',
          display: false,
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
          },
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : 'var(--chart-legend-color-light)'
        }
      },
      tooltip: {
        backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#333' : '#fff',
        titleColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333',
        bodyColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333',
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#444' : '#ddd',
        borderWidth: 1,
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
            <li className="active" onClick={() => handleNavigation('/dashboard')}>
              <FaRegChartBar className="menu-icon" />
              <span className="menu-text">Dashboard</span>
            </li>
            {perfil?.permissoes?.pode_ver_todas_contas && (
              <li onClick={() => handleNavigation('/receitas')}>
                <FaMoneyBillWave className="menu-icon" />
                <span className="menu-text">Receitas</span>
              </li>
            )}
            {perfil?.permissoes?.pode_ver_todas_contas && (
              <li onClick={() => handleNavigation('/despesas')}>
                <FaWallet className="menu-icon" />
                <span className="menu-text">Despesas</span>
              </li>
            )}
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
            <li onClick={handleLogout}>
              <FaSignOutAlt className="menu-icon" />
              <span className="menu-text">Sair</span>
            </li>
          </ul>
        </nav>
        <div className="add-button">
          <FaPlus />
        </div>
      </div>
      <div className="dashboard-content">
        <div className="content-header">
          <h1>Dashboard</h1>
          <div className="user-profile-header">
            <select
              className="month-selector"
              value={new Date().getMonth()}
              onChange={(e) => {}}
            >
              {meses.map((mes, index) => (
                <option key={index} value={index}>
                  {mes}
                </option>
              ))}
            </select>
            <div className="user-profile-icon">
              {usuario?.nome_familia ? usuario.nome_familia.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="user-name">{usuario?.nome_familia || 'Usuário'}</span>
            <span className="joranda">Jornada</span>
          </div>
        </div>

        <div className="cards">
          <div className="card saldo-atual">
            <div className="card-header">
              <span className="card-title">Saldo atual</span>
              <div className="card-icon-wrapper default">
                <FaUniversity />
              </div>
            </div>
            <p className="amount">R$ {dadosFinanceiros.saldo.toFixed(2).replace('.', ',')}</p>
            <button 
              onClick={() => handleNavigation('/desempenho')} 
              className="meu-desempenho"
            >
              Meu Desempenho <IoArrowForward />
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Receitas</span>
              <div className="card-icon-wrapper green">
                <FaArrowUp />
              </div>
            </div>
            <p className="amount positive">R$ {dadosFinanceiros.receitas.toFixed(2).replace('.', ',')}</p>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Despesas</span>
              <div className="card-icon-wrapper red">
                <FaArrowDown />
              </div>
            </div>
            <p className="amount negative">R$ {dadosFinanceiros.despesas.toFixed(2).replace('.', ',')}</p>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Cartão de crédito</span>
              <div className="card-icon-wrapper blue">
                <FaCreditCard />
              </div>
            </div>
            <p className="amount">R$ 0,00</p>
          </div>
        </div>

        <div className="charts">
          <div className="chart-container">
            <h2>Despesas por Categoria</h2>
            <div className="chart-wrapper">
              <Doughnut data={despesasChartData} options={chartOptions} />
            </div>
            <div className="doughnut-summary">
              <div className="doughnut-center-text">R$ {dadosFinanceiros.despesas.toFixed(2).replace('.', ',')}</div>
              <div className="doughnut-center-subtext">Total</div>
            </div>
            <button className="ver-mais-btn">VER MAIS</button>
          </div>

          <div className="chart-container">
            <h2>Balanço Mensal</h2>
            <div className="chart-wrapper">
              <Bar data={comparacaoChartData} options={barChartOptions} />
            </div>
            <button className="ver-mais-btn">VER MAIS</button>
          </div>
        </div>

        <div className="credit-card-section">
          <h2>Cartões de crédito</h2>
          <div className="credit-card-tabs">
            <div className="credit-card-tab active">Faturas abertas</div>
            <div className="credit-card-tab">Faturas fechadas</div>
          </div>
          <div className="credit-card-list">
            <div className="card-item">
              <div className="card-info">
                <div className="card-logo">N</div>
                <div className="card-details">
                  <span className="card-name">Nubank</span>
                  <span className="card-due-date">Vence amanhã</span>
                </div>
              </div>
              <span className="card-amount negative">R$30,00</span>
              <button className="pay-bill-btn">Pagar fatura</button>
            </div>
            <div className="card-item">
              <div className="card-info">
                <div className="card-logo">C</div>
                <div className="card-details">
                  <span className="card-name">Caixa</span>
                  <span className="card-due-date">Vence em 10/09</span>
                </div>
              </div>
              <span className="card-amount negative">R$150,00</span>
              <button className="pay-bill-btn">Pagar fatura</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 