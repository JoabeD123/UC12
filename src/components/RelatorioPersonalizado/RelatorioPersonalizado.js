import React, { useState, useEffect } from 'react';
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
import './RelatorioPersonalizado.css';
import Sidebar from '../Sidebar/Sidebar';
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

function RelatorioPersonalizado({ usuario, perfil, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dadosMensais, setDadosMensais] = useState([]);
  const [mesesSelecionados, setMesesSelecionados] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const anos = [];
  const anoAtual = new Date().getFullYear();
  for (let ano = anoAtual; ano >= anoAtual - 5; ano--) {
    anos.push(ano);
  }

  useEffect(() => {
    if (!usuario || !perfil) {
      onLogout();
      return;
    }
  }, [usuario, perfil]);

  const handleMesChange = (mesIndex) => {
    setMesesSelecionados(prev => {
      if (prev.includes(mesIndex)) {
        return prev.filter(m => m !== mesIndex);
      } else {
        return [...prev, mesIndex].sort((a, b) => a - b);
      }
    });
  };

  const handleGerarRelatorio = async () => {
    if (mesesSelecionados.length === 0) {
      setError('Selecione pelo menos um mês para gerar o relatório.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dadosMensaisTemp = [];

      // Carregar dados dos meses selecionados
      for (const mesIndex of mesesSelecionados) {
        const mes = mesIndex + 1; // Converter para formato do backend (1-12)
        
        try {
          // Carregar despesas do mês
          const despesasResponse = await fetch(
            `http://localhost:3001/api/despesas/${usuario.id_usuario}/${perfil.id_perfil}?mes=${mes}&ano=${anoSelecionado}`
          );
          
          let totalDespesas = 0;
          if (despesasResponse.ok) {
            const despesas = await despesasResponse.json();
            totalDespesas = despesas.reduce((total, despesa) => total + parseFloat(despesa.valor_conta), 0);
          }

          // Carregar receitas do mês
          const receitasResponse = await fetch(
            `http://localhost:3001/api/receitas/${usuario.id_usuario}/${perfil.id_perfil}?mes=${mes}&ano=${anoSelecionado}`
          );
          
          let totalReceitas = 0;
          if (receitasResponse.ok) {
            const receitas = await receitasResponse.json();
            totalReceitas = receitas.reduce((total, receita) => total + parseFloat(receita.valor_receita), 0);
          }

          dadosMensaisTemp.push({
            mes: mesIndex,
            nomeMes: meses[mesIndex],
            despesas: totalDespesas,
            receitas: totalReceitas,
            saldo: totalReceitas - totalDespesas
          });
        } catch (error) {
          console.error(`Erro ao carregar dados do mês ${mes}:`, error);
          dadosMensaisTemp.push({
            mes: mesIndex,
            nomeMes: meses[mesIndex],
            despesas: 0,
            receitas: 0,
            saldo: 0
          });
        }
      }

      setDadosMensais(dadosMensaisTemp);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError('Erro ao gerar relatório personalizado');
    } finally {
      setLoading(false);
    }
  };

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

  const calcularTotais = () => {
    return dadosMensais.reduce((totais, dados) => {
      totais.receitas += dados.receitas;
      totais.despesas += dados.despesas;
      totais.saldo += dados.saldo;
      return totais;
    }, { receitas: 0, despesas: 0, saldo: 0 });
  };

  const totais = calcularTotais();

  return (
    <div className="layout-container">
      <Sidebar perfil={perfil} />
      <div className="relatorio-personalizado">
        <div className="relatorio-header">
          <button onClick={handleVoltar} className="btn-voltar">
            <IoArrowBack /> Voltar ao Dashboard
          </button>
          <h1>Relatório Personalizado</h1>
          <p className="subtitulo">Selecione os meses e ano para gerar seu relatório</p>
        </div>

        <div className="relatorio-content">
          <div className="configuracao-relatorio">
            <div className="selecao-ano">
              <h3>Ano</h3>
              <select 
                value={anoSelecionado} 
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                className="ano-selector"
              >
                {anos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div className="selecao-meses">
              <h3>Meses</h3>
              <div className="meses-grid">
                {meses.map((mes, index) => (
                  <label key={index} className="mes-checkbox">
                    <input
                      type="checkbox"
                      checked={mesesSelecionados.includes(index)}
                      onChange={() => handleMesChange(index)}
                    />
                    <span className="mes-label">{mes}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGerarRelatorio} 
              className="btn-gerar-relatorio"
              disabled={loading || mesesSelecionados.length === 0}
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          {dadosMensais.length > 0 && (
            <>
              <div className="resumo-geral">
                <h3>Resumo Geral do Período</h3>
                <div className="resumo-cards">
                  <div className="resumo-card">
                    <span className="resumo-label">Total Receitas</span>
                    <span className="resumo-valor positivo">R$ {totais.receitas.toFixed(2)}</span>
                  </div>
                  <div className="resumo-card">
                    <span className="resumo-label">Total Despesas</span>
                    <span className="resumo-valor negativo">R$ {totais.despesas.toFixed(2)}</span>
                  </div>
                  <div className="resumo-card">
                    <span className="resumo-label">Saldo Geral</span>
                    <span className={`resumo-valor ${totais.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                      R$ {totais.saldo.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h2>Evolução Financeira - Período Selecionado</h2>
                <p className="chart-description">
                  Gráfico mostrando a evolução financeira nos meses selecionados.
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
                          <span className={`valor ${dados.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                            R$ {dados.saldo.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RelatorioPersonalizado; 