import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './RelatorioDesempenho.css';
// import Sidebar from '../Sidebar/Sidebar';
import { IoArrowBack } from 'react-icons/io5';

// Registrar os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

function RelatorioDesempenho({ usuario, perfil, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dadosMensais, setDadosMensais] = useState([]);
  const navigate = useNavigate();

  const meses = useMemo(() => [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ], []);

  const anoAtual = new Date().getFullYear();

  const carregarDadosAnuais = useCallback(async () => {
    try {
      setLoading(true);
      const dadosMensaisTemp = [];

      // Carregar dados de cada mês do ano atual
      for (let mes = 1; mes <= 12; mes++) {
        try {
          // Carregar despesas do mês
          const despesasResponse = await fetch(
            `http://localhost:3001/api/despesas/${usuario.id_usuario}/${perfil.id_perfil}?mes=${mes}&ano=${anoAtual}`
          );
          
          let totalDespesas = 0;
          if (despesasResponse.ok) {
            const despesas = await despesasResponse.json();
            totalDespesas = despesas.reduce((total, despesa) => total + parseFloat(despesa.valor_conta), 0);
          }

          // Carregar receitas do mês
          const receitasResponse = await fetch(
            `http://localhost:3001/api/receitas/${usuario.id_usuario}/${perfil.id_perfil}?mes=${mes}&ano=${anoAtual}`
          );
          
          let totalReceitas = 0;
          if (receitasResponse.ok) {
            const receitas = await receitasResponse.json();
            totalReceitas = receitas.reduce((total, receita) => total + parseFloat(receita.valor_receita), 0);
          }

          dadosMensaisTemp.push({
            mes: mes - 1, // Índice do mês (0-11)
            nomeMes: meses[mes - 1],
            despesas: totalDespesas,
            receitas: totalReceitas,
            saldo: totalReceitas - totalDespesas
          });
        } catch (error) {
          console.error(`Erro ao carregar dados do mês ${mes}:`, error);
          dadosMensaisTemp.push({
            mes: mes - 1,
            nomeMes: meses[mes - 1],
            despesas: 0,
            receitas: 0,
            saldo: 0
          });
        }
      }

      setDadosMensais(dadosMensaisTemp);
    } catch (error) {
      console.error('Erro ao carregar dados anuais:', error);
      setError('Erro ao carregar dados de desempenho');
    } finally {
      setLoading(false);
    }
  }, [usuario, perfil, anoAtual, meses]);

  useEffect(() => {
    if (!usuario || !perfil) {
      onLogout();
      return;
    }
    carregarDadosAnuais();
  }, [usuario, perfil, carregarDadosAnuais, onLogout]);

  const chartData = {
    labels: dadosMensais.map(d => d.nomeMes),
    datasets: [
      {
        label: 'Receitas',
        data: dadosMensais.map(d => d.receitas),
        borderColor: '#1cc88a',
        backgroundColor: 'rgba(28, 200, 138, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Despesas',
        data: dadosMensais.map(d => d.despesas),
        borderColor: '#e74a3b',
        backgroundColor: 'rgba(231, 74, 59, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Saldo',
        data: dadosMensais.map(d => d.saldo),
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          },
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333'
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
    },
    scales: {
      x: {
        grid: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#444' : '#e0e0e0'
        },
        ticks: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333'
        }
      },
      y: {
        grid: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#444' : '#e0e0e0'
        },
        ticks: {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333',
          callback: function(value) {
            return 'R$ ' + value.toFixed(0);
          }
        }
      }
    }
  };

  const handleVoltar = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="relatorio-desempenho">
        <div className="loading-container">
          <div className="loading">Carregando dados de desempenho...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relatorio-desempenho">
        <div className="error-container">
          <div className="error">{error}</div>
          <button onClick={carregarDadosAnuais} className="btn-retry">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relatorio-desempenho">
      <div className="relatorio-header">
        <button onClick={handleVoltar} className="btn-voltar">
          <IoArrowBack /> Voltar ao Dashboard
        </button>
        <h1>Meu Desempenho Financeiro</h1>
        <p className="ano-atual">{anoAtual}</p>
      </div>
      <div className="relatorio-content">
        <div className="chart-container">
          <h2>Evolução Financeira Anual</h2>
          <p className="chart-description">
            Acompanhe sua evolução financeira ao longo do ano através de receitas, despesas e saldo mensal.
          </p>
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="resumo-mensal">
          <h3>Resumo Mensal</h3>
          <div className="resumo-grid">
            {dadosMensais.map((dados, index) => (
              <div key={index} className="resumo-item">
                <h4>{dados.nomeMes}</h4>
                <div className="resumo-valores">
                  <div className="valor-item">
                    <span className="label">Receitas:</span>
                    <span className="valor positivo">R$ {dados.receitas.toFixed(2)}</span>
                  </div>
                  <div className="valor-item">
                    <span className="label">Despesas:</span>
                    <span className="valor negativo">R$ {dados.despesas.toFixed(2)}</span>
                  </div>
                  <div className="valor-item">
                    <span className="label">Saldo:</span>
                    <span className={`valor ${dados.saldo >= 0 ? 'positivo' : 'negativo'}`}>R$ {dados.saldo.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelatorioDesempenho; 