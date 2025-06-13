import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaChartBar, FaChartPie, FaUsers, FaCog, FaCreditCard } from 'react-icons/fa';
import './ImpostoRenda.css';

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ImpostoRenda = () => {
  const navigate = useNavigate();
  const [rendaInfo, setRendaInfo] = useState({
    rendaFixa: '',
    rendaVariavel: '',
    incluir13: false
  });

  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [chartData, setChartData] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const faixasIR2024 = [
    { limite: 2259.20, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
    { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { limite: Infinity, aliquota: 0.275, deducao: 896.00 }
  ];

  // Calcular imposto total
  const calcularImposto = () => {
    try {
      // Converter valores de string para número
      const rendaFixaNum = rendaInfo.rendaFixa ? 
        parseFloat(rendaInfo.rendaFixa.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.')) : 0;
      const rendaVariavelNum = rendaInfo.rendaVariavel ? 
        parseFloat(rendaInfo.rendaVariavel.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.')) : 0;
      
      // Calcular renda total mensal
      let rendaMensal = rendaFixaNum + rendaVariavelNum;

      // Validar se há renda para calcular
      if (rendaMensal <= 0) {
        setErro('Por favor, insira valores válidos de renda.');
        return;
      }
      
      // Adicionar 13º se selecionado
      const mesesCalculo = rendaInfo.incluir13 ? 13 : 12;
      const rendaAnual = rendaMensal * mesesCalculo;

      // Calcular imposto por faixa
      let impostoTotal = 0;
      let detalhamentoFaixas = [];
      let rendaRestante = rendaMensal;

      for (let i = 0; i < faixasIR2024.length; i++) {
        const faixaAtual = faixasIR2024[i];
        const faixaAnterior = i > 0 ? faixasIR2024[i - 1].limite : 0;
        const valorNaFaixa = Math.min(
          Math.max(0, rendaRestante),
          faixaAtual.limite - faixaAnterior
        );
        
        if (valorNaFaixa > 0) {
          const impostoNaFaixa = valorNaFaixa * faixaAtual.aliquota;
          impostoTotal += impostoNaFaixa;
          
          detalhamentoFaixas.push({
            faixa: `${formatarMoeda(faixaAnterior)} até ${formatarMoeda(faixaAtual.limite)}`,
            aliquota: `${(faixaAtual.aliquota * 100).toFixed(1)}%`,
            valorNaFaixa: formatarMoeda(valorNaFaixa),
            impostoNaFaixa: formatarMoeda(impostoNaFaixa)
          });
        }
        
        rendaRestante -= valorNaFaixa;
        if (rendaRestante <= 0) break;
      }

      // Calcular imposto mensal e anual
      const impostoMensal = impostoTotal;
      const impostoAnual = impostoMensal * mesesCalculo;
      
      // Calcular alíquota efetiva
      const aliquotaEfetiva = (impostoMensal / rendaMensal) * 100;

      // Preparar dados para o gráfico
      const chartData = {
        labels: ['Renda vs Imposto (Mensal)'],
        datasets: [
          {
            label: 'Renda Líquida',
            data: [rendaMensal - impostoMensal],
            backgroundColor: 'rgba(28, 200, 138, 0.8)'
          },
          {
            label: 'Imposto',
            data: [impostoMensal],
            backgroundColor: 'rgba(231, 74, 59, 0.8)'
          }
        ]
      };

      const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Distribuição de Renda vs Imposto'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatarMoeda(value)
            }
          }
        }
      };

      setChartData({ data: chartData, options: chartOptions });

      setResultado({
        rendaMensal: formatarMoeda(rendaMensal),
        rendaAnual: formatarMoeda(rendaAnual),
        impostoMensal: formatarMoeda(impostoMensal),
        impostoAnual: formatarMoeda(impostoAnual),
        aliquotaEfetiva: aliquotaEfetiva.toFixed(2),
        detalhamentoFaixas
      });

    } catch (error) {
      console.error('Erro ao calcular imposto:', error);
      setErro('Erro ao calcular imposto. Verifique os valores informados.');
    }
  };

  // Formatar valor para moeda
  const formatarMoeda = (valor) => {
    if (typeof valor !== 'number' || isNaN(valor)) {
      valor = 0;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Aplicar máscara de moeda no input
  const mascaraMoeda = (valor) => {
    if (!valor) return '';
    
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para ter os centavos
    valor = (parseFloat(valor) / 100).toFixed(2);
    
    // Formata para o padrão monetário brasileiro
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    
    return `R$ ${valor}`;
  };

  // Atualizar valores do formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setRendaInfo(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Remove qualquer formatação existente
      const valorLimpo = value.replace(/\D/g, '');
      
      // Se o campo estiver vazio, não aplica máscara
      if (valorLimpo === '') {
        setRendaInfo(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }

      // Aplica a máscara de moeda
      const valorFormatado = mascaraMoeda(valorLimpo);
      
      setRendaInfo(prev => ({
        ...prev,
        [name]: valorFormatado
      }));
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
          <div className="menu-item active" onClick={() => navigate('/imposto-renda')}>
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

      <div className="imposto-renda">
        <div className="imposto-header">
          <h2>Calculadora de Imposto de Renda</h2>
        </div>

        {erro && <div className="error-message">{erro}</div>}

        <div className="imposto-content">
          <div className="imposto-form">
            <div className="form-group">
              <label>Renda Fixa Mensal</label>
              <input
                type="text"
                name="rendaFixa"
                value={rendaInfo.rendaFixa}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="form-group">
              <label>Renda Variável Mensal</label>
              <input
                type="text"
                name="rendaVariavel"
                value={rendaInfo.rendaVariavel}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="incluir13"
                  checked={rendaInfo.incluir13}
                  onChange={handleInputChange}
                />
                Incluir 13º Salário
              </label>
            </div>

            <button onClick={calcularImposto} className="btn-primary">
              Calcular Imposto
            </button>
          </div>

          {resultado && (
            <div className="imposto-resultado">
              <div className="resultado-header">
                <h3>Resultado do Cálculo</h3>
                <button
                  className="btn-secondary"
                  onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                >
                  {mostrarDetalhes ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
                </button>
              </div>

              <div className="resultado-resumo">
                <div className="resultado-item">
                  <span>Renda Mensal:</span>
                  <strong>{resultado.rendaMensal}</strong>
                </div>
                <div className="resultado-item">
                  <span>Renda Anual:</span>
                  <strong>{resultado.rendaAnual}</strong>
                </div>
                <div className="resultado-item">
                  <span>Imposto Mensal:</span>
                  <strong>{resultado.impostoMensal}</strong>
                </div>
                <div className="resultado-item">
                  <span>Imposto Anual:</span>
                  <strong>{resultado.impostoAnual}</strong>
                </div>
                <div className="resultado-item">
                  <span>Alíquota Efetiva:</span>
                  <strong>{resultado.aliquotaEfetiva}%</strong>
                </div>
              </div>

              {mostrarDetalhes && (
                <div className="resultado-detalhes">
                  <h4>Detalhamento por Faixa</h4>
                  <div className="detalhes-tabela">
                    <div className="tabela-header">
                      <span>Faixa</span>
                      <span>Alíquota</span>
                      <span>Valor na Faixa</span>
                      <span>Imposto na Faixa</span>
                    </div>
                    {resultado.detalhamentoFaixas.map((faixa, index) => (
                      <div key={index} className="tabela-row">
                        <span>{faixa.faixa}</span>
                        <span>{faixa.aliquota}</span>
                        <span>{faixa.valorNaFaixa}</span>
                        <span>{faixa.impostoNaFaixa}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {chartData && (
                <div className="chart-container">
                  <Bar data={chartData.data} options={chartData.options} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpostoRenda; 