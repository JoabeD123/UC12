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
import './Dashboard.css';
import Sidebar from '../Sidebar/Sidebar';
import { FaUniversity, FaArrowUp, FaArrowDown, FaCreditCard } from 'react-icons/fa';
import { IoArrowForward } from 'react-icons/io5';

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
  const [cartoes, setCartoes] = useState([]);
  const [gastosCartoes, setGastosCartoes] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [cartaoAviso, setCartaoAviso] = useState(null);
  const [faturasFechadas, setFaturasFechadas] = useState([]);
  const [cartoesLoading, setCartoesLoading] = useState(true);
  const [anoSelecionado] = useState(new Date().getFullYear());
  const [abaFatura, setAbaFatura] = useState('abertas'); // 'abertas' ou 'fechadas'
  const navigate = useNavigate();

  const carregarDadosFinanceiros = useCallback(async () => {
    try {
      // Carregar receitas
      const receitasResponse = await fetch(`http://localhost:3001/api/receitas/${usuario.id_usuario}/${perfil.id_perfil}?mes=${mesSelecionado+1}&ano=${anoSelecionado}`);
      if (!receitasResponse.ok) throw new Error('Erro ao carregar receitas');
      const receitas = await receitasResponse.json();

      // Carregar despesas
      const despesasResponse = await fetch(`http://localhost:3001/api/despesas/${usuario.id_usuario}/${perfil.id_perfil}?mes=${mesSelecionado+1}&ano=${anoSelecionado}`);
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
      // Não setar loading aqui, só após cartões
    }
  }, [usuario, perfil, mesSelecionado, anoSelecionado]);

  useEffect(() => {
    if (!usuario || !perfil) {
      onLogout();
      return;
    }
    setLoading(true);
    setCartoesLoading(true);
    carregarDadosFinanceiros();
  }, [usuario, perfil, onLogout, carregarDadosFinanceiros]);

  useEffect(() => {
    const fetchCartoes = async () => {
      if (!usuario?.id_usuario || !perfil?.id_perfil) {
        setCartoesLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3001/api/cartoes/${usuario.id_usuario}/${perfil.id_perfil}?mes=${mesSelecionado+1}`);
        if (!res.ok) throw new Error('Erro ao buscar cartões de crédito');
        const data = await res.json();
        setCartoes(data);
        const totalGastos = data.reduce((acc, cartao) => acc + (parseFloat(cartao.gastos) || 0), 0);
        setGastosCartoes(totalGastos);
      } catch (err) {
        setCartoes([]);
        setGastosCartoes(0);
        console.error('Erro ao buscar cartões:', err);
      } finally {
        setCartoesLoading(false);
      }
    };
    fetchCartoes();
  }, [usuario, perfil, mesSelecionado]);

  // Quando ambos carregarem, libera o loading principal
  useEffect(() => {
    if (!cartoesLoading) {
      setLoading(false);
    }
  }, [cartoesLoading]);

  useEffect(() => {
    if (cartoes.length > 0) {
      const hoje = new Date();
      const diaHoje = hoje.getDate();
      // Para cada cartão, calcular diferença de dias
      for (const cartao of cartoes) {
        let diaVenc = Number(cartao.dia_vencimento);
        // Se o vencimento já passou neste mês, não avisar
        if (diaVenc < diaHoje) continue;
        // Se o vencimento não existe (inválido), ignorar
        if (!diaVenc || diaVenc < 1 || diaVenc > 31) continue;
        // Só avisar se houver valor gasto
        if (!(parseFloat(cartao.gastos) > 0)) continue;
        // Se está a 3 dias ou menos do vencimento, avisar
        if (diaVenc - diaHoje <= 3 && diaVenc - diaHoje >= 0) {
          setCartaoAviso(cartao);
          break; // Só mostra um aviso por vez
        }
      }
    }
  }, [cartoes]);

  // Fechamento automático de faturas
  useEffect(() => {
    if (!usuario?.id_usuario || cartoes.length === 0) return;
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth() + 1;
    const anoHoje = hoje.getFullYear();
    const fecharFaturas = async () => {
      let houveFechamento = false;
      for (const cartao of cartoes) {
        let diaVenc = Number(cartao.dia_vencimento);
        if (!diaVenc || diaVenc < 1 || diaVenc > 31) continue;
        if (parseFloat(cartao.gastos) > 0 && diaHoje > diaVenc) {
          // Verifica se já existe fatura fechada para este cartão e mês
          const jaFechada = faturasFechadas.some(f => f.id_cartao === cartao.id_cartao && f.mes_ano === `${anoHoje}-${String(mesHoje).padStart(2, '0')}`);
          if (!jaFechada) {
            // Cria fatura fechada usando o novo endpoint
            await fetch('http://localhost:3001/api/faturas-cartao', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id_cartao: cartao.id_cartao,
                mes_ano: `${anoHoje}-${String(mesHoje).padStart(2, '0')}`,
                valor_fechado: cartao.gastos,
                data_fechamento: `${anoHoje}-${String(mesHoje).padStart(2, '0')}-${String(diaVenc).padStart(2, '0')}`
              })
            });
            // Zera o valor gasto do cartão
            await fetch(`http://localhost:3001/api/cartoes/${cartao.id_cartao}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nome: cartao.nome,
                limite: cartao.limite,
                dia_vencimento: cartao.dia_vencimento,
                bandeira: cartao.bandeira,
                gastos: 0
              })
            });
            houveFechamento = true;
          }
        }
      }
      // Se houve fechamento, atualize as faturas fechadas
      if (houveFechamento) {
        try {
          const res = await fetch(`http://localhost:3001/api/faturas-cartao/perfil/${usuario.id_usuario}/${perfil.id_perfil}`);
          if (res.ok) {
            const data = await res.json();
            setFaturasFechadas(data);
          }
        } catch {}
      }
    };
    fecharFaturas();
    // eslint-disable-next-line
  }, [cartoes, usuario]);

  useEffect(() => {
    if (!usuario?.id_usuario || !perfil?.id_perfil) return;
    const fetchFaturasFechadas = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/faturas-cartao/perfil/${usuario.id_usuario}/${perfil.id_perfil}`);
        if (res.ok) {
          const data = await res.json();
          setFaturasFechadas(data);
        }
      } catch {}
    };
    fetchFaturasFechadas();
  }, [usuario, perfil]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Função para pagar fatura (zerar gastos)
  const handlePagarFatura = async (cartao) => {
    try {
      const res = await fetch(`http://localhost:3001/api/cartoes/${cartao.id_cartao}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: cartao.nome,
          limite: cartao.limite,
          dia_vencimento: cartao.dia_vencimento,
          bandeira: cartao.bandeira,
          gastos: 0
        })
      });
      if (!res.ok) throw new Error('Erro ao pagar fatura');
      // Atualizar localmente
      setCartoes(prev => prev.map(c => c.id_cartao === cartao.id_cartao ? { ...c, gastos: 0 } : c));
      // Atualizar o total de gastos
      setGastosCartoes(prev => prev - (parseFloat(cartao.gastos) || 0));
    } catch (err) {
      alert('Erro ao pagar fatura!');
    }
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
    <div className="layout-container">
      {/* Pop-up de aviso de vencimento */}
      {cartaoAviso && (
        <div className="modal-aviso-vencimento">
          <div className="modal-content">
            <h3>Atenção!</h3>
            <p>O cartão <b>{cartaoAviso.nome}</b> vence em {cartaoAviso.dia_vencimento - new Date().getDate()} dia(s)!</p>
            <button onClick={() => setCartaoAviso(null)}>OK</button>
          </div>
        </div>
      )}
      <Sidebar perfil={perfil} />
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="content-header">
            <h1>Dashboard</h1>
            <div className="user-profile-header">
              <select
                className="month-selector"
                value={mesSelecionado}
                onChange={e => setMesSelecionado(Number(e.target.value))}
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
              {perfil && (perfil.id_perfil === 1 || perfil.is_principal) && (
                <button 
                  onClick={() => handleNavigation('/desempenho')} 
                  className="meu-desempenho"
                >
                  Meu Desempenho <IoArrowForward />
                </button>
              )}
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
              <p className="amount">R$ {gastosCartoes.toFixed(2).replace('.', ',')}</p>
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
              <div className={`credit-card-tab${abaFatura === 'abertas' ? ' active' : ''}`} onClick={() => setAbaFatura('abertas')}>Faturas abertas</div>
              <div className={`credit-card-tab${abaFatura === 'fechadas' ? ' active' : ''}`} onClick={() => setAbaFatura('fechadas')}>Faturas fechadas</div>
            </div>
            {abaFatura === 'abertas' ? (
              <div className="credit-card-list">
                {cartoes.length === 0 ? (
                  <div style={{ padding: '1rem', color: '#888' }}>Nenhum cartão cadastrado.</div>
                ) : (
                  cartoes.map((cartao) => (
                    <div className="card-item" key={cartao.id_cartao}>
                      <div className="card-info">
                        <div className="card-logo">{cartao.nome.charAt(0).toUpperCase()}</div>
                        <div className="card-details">
                          <span className="card-name">{cartao.nome}</span>
                          <span className="card-due-date">Vence dia {cartao.dia_vencimento}</span>
                        </div>
                      </div>
                      <span className="card-amount negative">R$ {Number(cartao.gastos ?? 0).toFixed(2).replace('.', ',')}</span>
                      <button className="pay-bill-btn" onClick={() => handlePagarFatura(cartao)}>Pagar fatura</button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="credit-card-list">
                {faturasFechadas.length === 0 ? (
                  <div style={{ padding: '1rem', color: '#888' }}>Nenhuma fatura fechada encontrada.</div>
                ) : (
                  faturasFechadas.map((fatura) => (
                    <div className="card-item" key={fatura.id_fatura}>
                      <div className="card-info">
                        <div className="card-logo">{fatura.nome_cartao ? fatura.nome_cartao.charAt(0).toUpperCase() : '?'}</div>
                        <div className="card-details">
                          <span className="card-name">{fatura.nome_cartao || 'Cartão'}</span>
                          <span className="card-due-date">Referente: {fatura.mes_ano}</span>
                          <span className="card-due-date">Fechada em: {fatura.data_fechamento}</span>
                        </div>
                      </div>
                      <span className="card-amount negative">R$ {Number(fatura.valor_fechado ?? 0).toFixed(2).replace('.', ',')}</span>
                      <span style={{ color: fatura.paga ? 'green' : 'red', fontWeight: 600, marginLeft: 10 }}>
                        {fatura.paga ? 'Paga' : `Pendente (Pago: R$ ${Number(fatura.valor_pago ?? 0).toFixed(2).replace('.', ',')})`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 