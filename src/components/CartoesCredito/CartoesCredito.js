import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaChartBar, FaChartPie, FaUsers, FaCog, FaCreditCard } from 'react-icons/fa';
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

const CartoesCredito = () => {
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

  useEffect(() => {
    // Simular carregamento de dados
    const cartoesMock = [
      {
        id: 1,
        nome: 'Cartão Principal',
        limite: 5000,
        diaVencimento: 15,
        bandeira: 'visa',
        gastos: 2500
      },
      {
        id: 2,
        nome: 'Cartão Secundário',
        limite: 3000,
        diaVencimento: 20,
        bandeira: 'mastercard',
        gastos: 1500
      }
    ];
    setCartoes(cartoesMock);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoCartao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!novoCartao.nome || !novoCartao.limite || !novoCartao.diaVencimento) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const novoCartaoCompleto = {
      id: Date.now(),
      ...novoCartao,
      limite: parseFloat(novoCartao.limite),
      diaVencimento: parseInt(novoCartao.diaVencimento),
      gastos: 0
    };

    setCartoes(prev => [...prev, novoCartaoCompleto]);
    setNovoCartao({
      nome: '',
      limite: '',
      diaVencimento: '',
      bandeira: 'visa'
    });
    setError('');
  };

  const handleEditar = (cartao) => {
    setEditandoCartao(cartao);
    setNovoCartao({
      nome: cartao.nome,
      limite: cartao.limite.toString(),
      diaVencimento: cartao.diaVencimento.toString(),
      bandeira: cartao.bandeira
    });
  };

  const handleSalvarEdicao = () => {
    if (!novoCartao.nome || !novoCartao.limite || !novoCartao.diaVencimento) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setCartoes(prev => prev.map(cartao => 
      cartao.id === editandoCartao.id
        ? {
            ...cartao,
            nome: novoCartao.nome,
            limite: parseFloat(novoCartao.limite),
            diaVencimento: parseInt(novoCartao.diaVencimento),
            bandeira: novoCartao.bandeira
          }
        : cartao
    ));

    setEditandoCartao(null);
    setNovoCartao({
      nome: '',
      limite: '',
      diaVencimento: '',
      bandeira: 'visa'
    });
    setError('');
  };

  const handleExcluir = (id) => {
    setCartoes(prev => prev.filter(cartao => cartao.id !== id));
  };

  const handleGastoChange = (id, valor) => {
    setGastos(prev => ({
      ...prev,
      [id]: parseFloat(valor) || 0
    }));
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
        data: cartoes.map(cartao => gastos[cartao.id] || cartao.gastos),
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
        data: cartoes.map(cartao => gastos[cartao.id] || cartao.gastos),
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
    responsive: true,
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

  return (
    <div className="layout-container">
      <div className="sidebar">
        <div className="menu">
          <div className="menu-item" onClick={() => navigate('/dashboard')}>
            <FaChartBar />
            <span>Dashboard</span>
          </div>
          <div className="menu-item" onClick={() => navigate('/cartoes')}>
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
          <button className="btn-novo-cartao" onClick={() => setNovoCartao({ nome: '', limite: '', diaVencimento: '', bandeira: 'visa' })}>
            <FaPlus /> Novo Cartão
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="cartoes-grid">
          {cartoes.map(cartao => (
            <div key={cartao.id} className="cartao-card">
              <div className="cartao-header">
                <h3>{cartao.nome}</h3>
                <div className="cartao-acoes">
                  <button onClick={() => handleEditar(cartao)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleExcluir(cartao.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="cartao-info">
                <p><strong>Limite:</strong> R$ {cartao.limite.toFixed(2)}</p>
                <p><strong>Vencimento:</strong> Dia {cartao.diaVencimento}</p>
                <p><strong>Bandeira:</strong> {cartao.bandeira}</p>
                <div className="gastos-input">
                  <label>Gastos Atuais:</label>
                  <input
                    type="number"
                    value={gastos[cartao.id] || cartao.gastos}
                    onChange={(e) => handleGastoChange(cartao.id, e.target.value)}
                    min="0"
                    max={cartao.limite}
                  />
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${((gastos[cartao.id] || cartao.gastos) / cartao.limite) * 100}%`,
                      backgroundColor: ((gastos[cartao.id] || cartao.gastos) / cartao.limite) > 0.8 ? 'var(--danger-color)' : 'var(--success-color)'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {(novoCartao.nome || editandoCartao) && (
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
                    setNovoCartao({ nome: '', limite: '', diaVencimento: '', bandeira: 'visa' });
                    setEditandoCartao(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="charts-container">
          <div className="chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartoesCredito; 