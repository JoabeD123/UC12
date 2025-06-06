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

const ImpostoRenda = ({ usuario, perfil }) => {
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
            backgroundColor: '#4CAF50'
          },
          {
            label: 'Imposto',
            data: [impostoMensal],
            backgroundColor: '#f44336'
          }
        ]
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatarMoeda(value)
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatarMoeda(context.raw)}`
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
            <li onClick={() => navigate('/cartoes')}>
              <span className="menu-icon">💳</span>
              <span className="menu-text">Cartões</span>
            </li>
            <li className="active">
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

      <div className="imposto-renda-container">
        <div className="content-header">
          <h1>Cálculo de Imposto de Renda</h1>
        </div>

        <div className="calculo-container">
          <div className="form-section">
            {erro && (
              <div className="erro-mensagem">
                {erro}
              </div>
            )}

            <div className="form-group">
              <label>Renda Mensal Fixa:</label>
              <input
                type="text"
                name="rendaFixa"
                value={rendaInfo.rendaFixa}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
                className="input-moeda"
              />
            </div>

            <div className="form-group">
              <label>Renda Mensal Variável:</label>
              <input
                type="text"
                name="rendaVariavel"
                value={rendaInfo.rendaVariavel}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
                className="input-moeda"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="incluir13"
                  checked={rendaInfo.incluir13}
                  onChange={handleInputChange}
                />
                Incluir 13º salário no cálculo
              </label>
            </div>

            <button 
              onClick={calcularImposto} 
              className="btn-calcular"
              disabled={!rendaInfo.rendaFixa && !rendaInfo.rendaVariavel}
            >
              Calcular Imposto
            </button>
          </div>

          {resultado && (
            <div className="resultado-section">
              <div className="resultado-resumo">
                <h3>Resumo do Cálculo</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Renda Mensal:</span>
                    <span className="value">{resultado.rendaMensal}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Renda Anual:</span>
                    <span className="value">{resultado.rendaAnual}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Imposto Mensal:</span>
                    <span className="value">{resultado.impostoMensal}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Imposto Anual:</span>
                    <span className="value">{resultado.impostoAnual}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Alíquota Efetiva:</span>
                    <span className="value">{resultado.aliquotaEfetiva}%</span>
                  </div>
                </div>

                {chartData && (
                  <div className="grafico-container">
                    <h4>Distribuição da Renda</h4>
                    <div className="grafico-wrapper">
                      <Bar data={chartData.data} options={chartData.options} />
                    </div>
                  </div>
                )}

                <div className="mostrar-detalhes-container">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={mostrarDetalhes}
                      onChange={(e) => setMostrarDetalhes(e.target.checked)}
                    />
                    Mostrar detalhamento por faixa
                  </label>
                </div>

                {mostrarDetalhes && (
                  <div className="detalhamento">
                    <h4>Detalhamento por Faixa</h4>
                    <div className="tabela-detalhamento">
                      <table>
                        <thead>
                          <tr>
                            <th>Faixa</th>
                            <th>Alíquota</th>
                            <th>Valor na Faixa</th>
                            <th>Imposto na Faixa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.detalhamentoFaixas.map((faixa, index) => (
                            <tr key={index}>
                              <td>{faixa.faixa}</td>
                              <td>{faixa.aliquota}</td>
                              <td>{faixa.valorNaFaixa}</td>
                              <td>{faixa.impostoNaFaixa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpostoRenda; 