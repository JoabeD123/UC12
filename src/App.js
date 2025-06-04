import React, { useState, useEffect } from 'react';
import './App.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Login from './components/Login';
import Register from './components/Register';
import Receitas from './components/Receitas';

// Registrar os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {
  const [usuario, setUsuario] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState('dashboard');
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    totalReceitas: 0,
    totalDespesas: 5350, // Por enquanto mantemos fixo até implementar as despesas
    saldoAtual: 0
  });

  useEffect(() => {
    // Verifica se há um usuário logado ao carregar a página
    const usuarioAtual = localStorage.getItem('usuarioAtual');
    if (usuarioAtual) {
      setUsuario(JSON.parse(usuarioAtual));
    }
  }, []);

  const atualizarDadosFinanceiros = React.useCallback(() => {
    if (!usuario) return;
    
    // Busca as receitas do usuário atual do localStorage
    const receitas = JSON.parse(localStorage.getItem(`receitas_${usuario.id}`)) || [];
    
    // Calcula o total de receitas
    const totalReceitas = receitas.reduce((total, receita) => total + parseFloat(receita.valor), 0);
    
    // Atualiza os dados financeiros
    setDadosFinanceiros({
      totalReceitas,
      totalDespesas: 5350, // Mantemos fixo por enquanto
      saldoAtual: totalReceitas - 5350
    });
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      // Atualiza os dados financeiros quando a página carregar ou quando mudar de página
      atualizarDadosFinanceiros();
    }
  }, [paginaAtual, usuario, atualizarDadosFinanceiros]);

  const handleLogin = (dadosUsuario) => {
    setUsuario(dadosUsuario);
  };

  const handleRegister = (dadosUsuario) => {
    setUsuario(dadosUsuario);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioAtual');
    setUsuario(null);
  };

  // Dados para o gráfico de rosca (despesas por categoria)
  const doughnutData = {
    labels: ['Educação', 'Casa', 'Alimentação', 'Outros'],
    datasets: [
      {
        data: [865, 1275, 1220, 1990],
        backgroundColor: [
          '#6c5ce7',
          '#00b894',
          '#ffeaa7',
          '#ff7675',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Dados para o gráfico de barras (balanço mensal)
  const barData = {
    labels: ['Receitas', 'Despesas'],
    datasets: [
      {
        data: [dadosFinanceiros.totalReceitas, dadosFinanceiros.totalDespesas],
        backgroundColor: [
          '#00b894',
          '#ff7675',
        ],
        borderRadius: 8,
        maxBarThickness: 50,
      },
    ],
  };

  // Opções para o gráfico de rosca
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    cutout: '70%',
  };

  // Opções para o gráfico de barras
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Função para formatar valores em reais
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Se não houver usuário logado, mostra a tela de login ou registro
  if (!usuario) {
    return mostrarRegistro ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setMostrarRegistro(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setMostrarRegistro(true)}
      />
    );
  }

  // Renderiza o conteúdo principal baseado na página atual
  const renderConteudo = () => {
    switch (paginaAtual) {
      case 'receitas':
        return <Receitas onUpdateDashboard={atualizarDadosFinanceiros} />;
      case 'dashboard':
      default:
        return (
          <>
            {/* Cards */}
            <div className="cards">
              <div className="card">
                <h3>Saldo atual</h3>
                <p className={`amount ${dadosFinanceiros.saldoAtual >= 0 ? 'positive' : 'negative'}`}>
                  {formatarMoeda(dadosFinanceiros.saldoAtual)}
                </p>
              </div>
              <div className="card">
                <h3>Receitas</h3>
                <p className="amount positive">
                  {formatarMoeda(dadosFinanceiros.totalReceitas)}
                </p>
              </div>
              <div className="card">
                <h3>Despesas</h3>
                <p className="amount negative">
                  {formatarMoeda(dadosFinanceiros.totalDespesas)}
                </p>
              </div>
              <div className="card">
                <h3>Cartão de crédito</h3>
                <p className="amount">R$ 0,00</p>
              </div>
            </div>

            {/* Charts */}
            <div className="charts">
              <div className="chart-container">
                <h2>Despesas por categoria</h2>
                <div className="donut-chart">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>
              <div className="chart-container">
                <h2>Balanço mensal</h2>
                <div className="bar-chart">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  // Se houver usuário logado, mostra o dashboard
  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">G</div>
        </div>
        <nav className="menu">
          <ul>
            <li 
              className={paginaAtual === 'dashboard' ? 'active' : ''}
              onClick={() => setPaginaAtual('dashboard')}
            >
              <span className="menu-icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </li>
            <li 
              className={paginaAtual === 'receitas' ? 'active' : ''}
              onClick={() => setPaginaAtual('receitas')}
            >
              <span className="menu-icon">💰</span>
              <span className="menu-text">Receitas</span>
            </li>
            <li>
              <span className="menu-icon">💳</span>
              <span className="menu-text">Cartões</span>
            </li>
            <li>
              <span className="menu-icon">📈</span>
              <span className="menu-text">Relatórios</span>
            </li>
            <li onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              <span className="menu-text">Sair</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1>{paginaAtual === 'dashboard' ? 'Dashboard' : 'Receitas'}</h1>
          <div className="header-right">
            <span className="user-name">Olá, {usuario.nomeFamilia}</span>
            {paginaAtual === 'dashboard' && (
              <select className="month-selector">
                <option>Setembro</option>
              </select>
            )}
          </div>
        </div>

        {renderConteudo()}
      </div>
    </div>
  );
}

export default App;
