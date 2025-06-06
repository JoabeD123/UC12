import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './CartoesCredito.css';

// Registrar os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CartoesCredito({ usuario, perfil }) {
  const [cartoes, setCartoes] = useState([]);
  const [novoCartao, setNovoCartao] = useState({
    nome: '',
    limite: '',
    mesVencimento: '',
    anoVencimento: '',
    diaFechamento: ''
  });
  const [modoEdicao, setModoEdicao] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cartoesArmazenados = JSON.parse(localStorage.getItem(`cartoes_${usuario.id}`)) || [];
    // Migrar dados antigos para o novo formato
    const cartoesMigrados = cartoesArmazenados.map(cartao => {
      if (cartao.diaVencimento && !cartao.mesVencimento) {
        return {
          ...cartao,
          mesVencimento: 1, // Define mês padrão como Janeiro
          anoVencimento: new Date().getFullYear() % 100 // Ano atual com 2 dígitos
        };
      }
      return cartao;
    });
    setCartoes(cartoesMigrados);
  }, [usuario.id]);

  const salvarCartoes = (novosCartoes) => {
    localStorage.setItem(`cartoes_${usuario.id}`, JSON.stringify(novosCartoes));
    setCartoes(novosCartoes);
  };

  const adicionarCartao = (e) => {
    e.preventDefault();
    if (!novoCartao.nome || !novoCartao.limite || !novoCartao.mesVencimento || 
        !novoCartao.anoVencimento || !novoCartao.diaFechamento) return;

    const novosDados = {
      ...novoCartao,
      id: Date.now(),
      limite: parseFloat(novoCartao.limite),
      mesVencimento: parseInt(novoCartao.mesVencimento),
      anoVencimento: parseInt(novoCartao.anoVencimento),
      diaFechamento: parseInt(novoCartao.diaFechamento),
      gastoAtual: 0
    };

    salvarCartoes([...cartoes, novosDados]);
    setNovoCartao({ 
      nome: '', 
      limite: '', 
      mesVencimento: '', 
      anoVencimento: '', 
      diaFechamento: '' 
    });
  };

  const atualizarCartao = (cartao) => {
    const cartoesAtualizados = cartoes.map(c => 
      c.id === cartao.id ? cartao : c
    );
    salvarCartoes(cartoesAtualizados);
    setModoEdicao(null);
  };

  const removerCartao = (id) => {
    if (window.confirm('Tem certeza que deseja remover este cartão?')) {
      const cartoesAtualizados = cartoes.filter(cartao => cartao.id !== id);
      salvarCartoes(cartoesAtualizados);
    }
  };

  const registrarGasto = (id, valor) => {
    const cartoesAtualizados = cartoes.map(cartao => {
      if (cartao.id === id) {
        const novoGasto = cartao.gastoAtual + parseFloat(valor);
        if (novoGasto <= cartao.limite) {
          return { ...cartao, gastoAtual: novoGasto };
        }
      }
      return cartao;
    });
    salvarCartoes(cartoesAtualizados);
  };

  const chartData = {
    labels: cartoes.map(cartao => cartao.nome),
    datasets: [
      {
        label: 'Limite Disponível',
        data: cartoes.map(cartao => cartao.limite - cartao.gastoAtual),
        backgroundColor: '#4CAF50',
        stack: 'Stack 0',
      },
      {
        label: 'Valor Utilizado',
        data: cartoes.map(cartao => cartao.gastoAtual),
        backgroundColor: '#f44336',
        stack: 'Stack 0',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value) => `R$ ${value.toFixed(2)}`
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
          label: (context) => `${context.dataset.label}: R$ ${context.raw.toFixed(2)}`
        }
      }
    }
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
            <li className="active">
              <span className="menu-icon">💳</span>
              <span className="menu-text">Cartões</span>
            </li>
            <li onClick={() => navigate('/imposto-renda')}>
              <span className="menu-icon">📑</span>
              <span className="menu-text">Imposto de Renda</span>
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

      <div className="cartoes-credito">
        <div className="cartoes-header">
          <h2>Cartões de Crédito</h2>
          <form onSubmit={adicionarCartao} className="novo-cartao-form">
            <input
              type="text"
              placeholder="Nome do cartão"
              value={novoCartao.nome}
              onChange={(e) => setNovoCartao({ ...novoCartao, nome: e.target.value })}
            />
            <input
              type="number"
              placeholder="Limite"
              value={novoCartao.limite}
              onChange={(e) => setNovoCartao({ ...novoCartao, limite: e.target.value })}
            />
            <select
              value={novoCartao.mesVencimento}
              onChange={(e) => setNovoCartao({ ...novoCartao, mesVencimento: e.target.value })}
              required
            >
              <option value="">Mês</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                <option key={mes} value={mes}>
                  {mes.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <select
              value={novoCartao.anoVencimento}
              onChange={(e) => setNovoCartao({ ...novoCartao, anoVencimento: e.target.value })}
              required
            >
              <option value="">Ano</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(ano => (
                <option key={ano} value={ano % 100}>
                  {(ano % 100).toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <select
              value={novoCartao.diaFechamento}
              onChange={(e) => setNovoCartao({ ...novoCartao, diaFechamento: e.target.value })}
              required
            >
              <option value="">Dia do Fechamento</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                <option key={dia} value={dia}>
                  {dia.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <button type="submit">Adicionar Cartão</button>
          </form>
        </div>

        <div className="cartoes-grid">
          {cartoes.map(cartao => (
            <div key={cartao.id} className="cartao-item">
              {modoEdicao === cartao.id ? (
                <div className="cartao-edicao">
                  <input
                    type="text"
                    value={cartao.nome}
                    onChange={(e) => atualizarCartao({ ...cartao, nome: e.target.value })}
                  />
                  <input
                    type="number"
                    value={cartao.limite}
                    onChange={(e) => atualizarCartao({ ...cartao, limite: parseFloat(e.target.value) })}
                  />
                  <select
                    value={cartao.mesVencimento}
                    onChange={(e) => atualizarCartao({ ...cartao, mesVencimento: parseInt(e.target.value) })}
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                      <option key={mes} value={mes}>
                        {mes.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={cartao.anoVencimento}
                    onChange={(e) => atualizarCartao({ ...cartao, anoVencimento: parseInt(e.target.value) })}
                    required
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(ano => (
                      <option key={ano} value={ano % 100}>
                        {(ano % 100).toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={cartao.diaFechamento}
                    onChange={(e) => atualizarCartao({ ...cartao, diaFechamento: parseInt(e.target.value) })}
                    required
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                      <option key={dia} value={dia}>
                        {dia.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => setModoEdicao(null)}>Salvar</button>
                </div>
              ) : (
                <>
                  <div className="cartao-header">
                    <h3>{cartao.nome}</h3>
                    <div className="cartao-acoes">
                      <button onClick={() => setModoEdicao(cartao.id)}>✏️</button>
                      <button onClick={() => removerCartao(cartao.id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="cartao-info">
                    <p>Limite: R$ {cartao.limite.toFixed(2)}</p>
                    <p>Gasto Atual: R$ {cartao.gastoAtual.toFixed(2)}</p>
                    <p>Disponível: R$ {(cartao.limite - cartao.gastoAtual).toFixed(2)}</p>
                    <p>Vencimento: {(cartao.mesVencimento || 1).toString().padStart(2, '0')}/{(cartao.anoVencimento || new Date().getFullYear() % 100).toString().padStart(2, '0')}</p>
                    <p>Fechamento: Dia {(cartao.diaFechamento || 1).toString().padStart(2, '0')}</p>
                  </div>
                  <div className="cartao-gasto">
                    <input
                      type="number"
                      placeholder="Valor do gasto"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          registrarGasto(cartao.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="cartao-progresso">
                    <div 
                      className="progresso-barra"
                      style={{
                        width: `${(cartao.gastoAtual / cartao.limite) * 100}%`,
                        backgroundColor: cartao.gastoAtual > cartao.limite * 0.8 ? '#f44336' : '#4CAF50'
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {cartoes.length > 0 && (
          <div className="grafico-container">
            <h3>Comparativo de Utilização</h3>
            <div className="grafico-wrapper">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartoesCredito; 