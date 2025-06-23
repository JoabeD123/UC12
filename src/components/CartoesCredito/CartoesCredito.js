import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaChartBar, FaChartPie, FaUsers, FaCog, FaCreditCard, FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './CartoesCredito.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = 'http://localhost:3001/api/cartoes';

const CartoesCredito = ({ perfil }) => {
  const navigate = useNavigate();
  const [cartoes, setCartoes] = useState([]);
  const [novoCartao, setNovoCartao] = useState({
    nome: '',
    limite: '',
    diaVencimento: '',
    bandeira: 'visa'
  });
  const [editandoCartao, setEditandoCartao] = useState(null);
  const [error, setError] = useState('');
  const [gastos, setGastos] = useState({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Buscar cartões do banco ao carregar a tela
  useEffect(() => {
    if (!perfil?.id_perfil) return;
    fetch(`${API_URL}/${perfil.id_perfil}`)
      .then(res => res.json())
      .then(data => {
        setCartoes(data);
        // Preencher gastos iniciais
        const gastosObj = {};
        data.forEach(cartao => {
          gastosObj[cartao.id_cartao] = parseFloat(cartao.gastos) || 0;
        });
        setGastos(gastosObj);
      })
      .catch(() => setCartoes([]));
  }, [perfil]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoCartao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novoCartao.nome || !novoCartao.limite || !novoCartao.diaVencimento) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfil_id: perfil.id_perfil,
          nome: novoCartao.nome,
          limite: Number(novoCartao.limite) > 0 ? Number(novoCartao.limite) : 0,
          dia_vencimento: parseInt(novoCartao.diaVencimento),
          bandeira: novoCartao.bandeira,
          gastos: 0
        })
      });
      const novo = await response.json();
      setCartoes(prev => [novo, ...prev]);
      setGastos(prev => ({ ...prev, [novo.id_cartao]: 0 }));
      setNovoCartao({ nome: '', limite: '', diaVencimento: '', bandeira: 'visa' });
      setError('');
      setMostrarFormulario(false);
    } catch {
      setError('Erro ao adicionar cartão');
    }
  };

  const handleEditar = (cartao) => {
    setEditandoCartao(cartao);
    setNovoCartao({
      nome: cartao.nome,
      limite: cartao.limite.toString(),
      diaVencimento: cartao.dia_vencimento.toString(),
      bandeira: cartao.bandeira
    });
    setMostrarFormulario(true);
  };

  const handleSalvarEdicao = async () => {
    if (!novoCartao.nome || !novoCartao.limite || !novoCartao.diaVencimento) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${editandoCartao.id_cartao}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoCartao.nome,
          limite: parseFloat(novoCartao.limite),
          dia_vencimento: parseInt(novoCartao.diaVencimento),
          bandeira: novoCartao.bandeira,
          gastos: gastos[editandoCartao.id_cartao] || 0
        })
      });
      const atualizado = await response.json();
      setCartoes(prev => prev.map(c => c.id_cartao === atualizado.id_cartao ? atualizado : c));
      setEditandoCartao(null);
      setNovoCartao({ nome: '', limite: '', diaVencimento: '', bandeira: 'visa' });
      setError('');
      setMostrarFormulario(false);
    } catch {
      setError('Erro ao editar cartão');
    }
  };

  const handleExcluir = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setCartoes(prev => prev.filter(cartao => cartao.id_cartao !== id));
      setGastos(prev => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
    } catch {
      setError('Erro ao excluir cartão');
    }
  };

  const handleGastoChange = async (id, valor) => {
    const valorNum = parseFloat(valor) || 0;
    setGastos(prev => ({ ...prev, [id]: valorNum }));
    // Atualizar no banco
    const cartao = cartoes.find(c => c.id_cartao === id);
    if (cartao) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: cartao.nome,
            limite: cartao.limite,
            dia_vencimento: cartao.dia_vencimento,
            bandeira: cartao.bandeira,
            gastos: valorNum
          })
        });
        setCartoes(prev => prev.map(c => c.id_cartao === id ? { ...c, gastos: valorNum } : c));
      } catch {
        setError('Erro ao atualizar gastos');
      }
    }
  };

  const chartData = {
    labels: cartoes.map(cartao => cartao.nome),
    datasets: [
      {
        label: 'Limite',
        data: cartoes.map(cartao => cartao.limite),
        backgroundColor: 'rgba(111, 66, 193, 0.5)',
        borderColor: 'rgba(111, 66, 193, 1)',
        borderWidth: 1
      },
      {
        label: 'Gastos',
        data: cartoes.map(cartao => gastos[cartao.id_cartao] || cartao.gastos),
        backgroundColor: 'rgba(28, 200, 138, 0.5)',
        borderColor: 'rgba(28, 200, 138, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Limite vs Gastos por Cartão'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutData = {
    labels: cartoes.map(cartao => cartao.nome),
    datasets: [
      {
        data: cartoes.map(cartao => gastos[cartao.id_cartao] || cartao.gastos),
        backgroundColor: [
          'rgba(111, 66, 193, 0.8)',
          'rgba(28, 200, 138, 0.8)',
          'rgba(78, 115, 223, 0.8)',
          'rgba(246, 194, 62, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  const doughnutOptions = {
    responsive: false,
    cutout: '30%',
    plugins: {
      legend: {
        position: 'right'
      },
      title: {
        display: true,
        text: 'Distribuição de Gastos'
      }
    }
  };

  console.log('doughnutData', doughnutData);

  return (
    <div className="layout-container">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">GF</div>
        </div>
        <div className="menu">
          <div className="menu-item" onClick={() => navigate('/dashboard')}>
            <FaChartBar />
            <span>Dashboard</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/receitas')}>
            <FaMoneyBillWave />
            <span>Receitas</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/despesas')}>
            <FaWallet />
            <span>Despesas</span>
          </div>
          <div className="menu-item active" onClick={() => navigate('/cartoes')}>
            <FaCreditCard />
            <span>Cartões</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/imposto-renda')}>
            <FaChartPie />
            <span>Imposto de Renda</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/gerenciar-perfis')}>
            <FaUsers />
            <span>Gerenciar Perfis</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/configuracoes')}>
            <FaCog />
            <span>Configurações</span>
          </div>
        </div>
      </div>

      <div className="cartoes-credito">
        <div className="cartoes-header">
          <h2>Cartões de Crédito</h2>
          <button 
            className="btn-novo-cartao" 
            onClick={() => {
              setMostrarFormulario(true);
              setEditandoCartao(null);
              setNovoCartao({
                nome: '',
                limite: '',
                diaVencimento: '',
                bandeira: 'visa'
              });
            }}
          >
            <FaPlus /> Novo Cartão
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mostrarFormulario && (
          <div className="novo-cartao-form">
            <h3>{editandoCartao ? 'Editar Cartão' : 'Novo Cartão'}</h3>
            <form onSubmit={editandoCartao ? handleSalvarEdicao : handleSubmit}>
              <div className="form-group">
                <label>Nome do Cartão</label>
                <input
                  type="text"
                  name="nome"
                  value={novoCartao.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do cartão"
                />
              </div>
              <div className="form-group">
                <label>Limite</label>
                <input
                  type="number"
                  name="limite"
                  value={novoCartao.limite}
                  onChange={handleInputChange}
                  placeholder="Digite o limite do cartão"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Dia de Vencimento</label>
                <input
                  type="number"
                  name="diaVencimento"
                  value={novoCartao.diaVencimento}
                  onChange={handleInputChange}
                  placeholder="Digite o dia de vencimento"
                  min="1"
                  max="31"
                />
              </div>
              <div className="form-group">
                <label>Bandeira</label>
                <select
                  name="bandeira"
                  value={novoCartao.bandeira}
                  onChange={handleInputChange}
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="elo">Elo</option>
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-primary">
                  {editandoCartao ? 'Salvar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNovoCartao({
                      nome: '',
                      limite: '',
                      diaVencimento: '',
                      bandeira: 'visa'
                    });
                    setEditandoCartao(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="cartoes-grid">
          {cartoes.map(cartao => (
            <div key={cartao.id_cartao} className="cartao-card">
              <div className="cartao-header">
                <h3>{cartao.nome}</h3>
                <div className="cartao-acoes">
                  <button onClick={() => handleEditar(cartao)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleExcluir(cartao.id_cartao)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="cartao-info">
                <p><strong>Limite:</strong> R$ {Number(cartao.limite ?? 0).toFixed(2)}</p>
                <p><strong>Vencimento:</strong> Dia {cartao.dia_vencimento}</p>
                <p><strong>Bandeira:</strong> {cartao.bandeira}</p>
                <div className="gastos-input">
                  <label>Gastos Atuais:</label>
                  <input
                    type="number"
                    value={gastos[cartao.id_cartao] ?? cartao.gastos ?? 0}
                    onChange={(e) => handleGastoChange(cartao.id_cartao, e.target.value)}
                    min="0"
                    max={Number(cartao.limite ?? 0)}
                  />
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${((gastos[cartao.id_cartao] ?? cartao.gastos ?? 0) / Number(cartao.limite ?? 1)) * 100}%`,
                      backgroundColor: ((gastos[cartao.id_cartao] ?? cartao.gastos ?? 0) / Number(cartao.limite ?? 1)) > 0.8 ? 'var(--danger-color)' : 'var(--success-color)'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {cartoes.length > 0 && (
          <div className="charts-container">
            <div className="chart-wrapper">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="donut-chart-wrapper">
              <Doughnut data={doughnutData} options={doughnutOptions} width={550} height={550} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartoesCredito; 