import React, { useState, useEffect, useCallback } from 'react';
import './Despesas.css';

function Despesas({ onUpdateDashboard }) {
  const [despesas, setDespesas] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState({
    nome: '',
    valor: '',
    dataPagamento: '',
    categoria: '',
    descricao: ''
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState(null);

  // Obtém o usuário atual do localStorage
  const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));

  // Função para obter a chave específica do usuário para as despesas
  const getChaveDespesas = useCallback(() => `despesas_${usuarioAtual.id}`, [usuarioAtual]);

  useEffect(() => {
    // Carrega as despesas do usuário atual do localStorage
    const despesasSalvas = JSON.parse(localStorage.getItem(getChaveDespesas())) || [];
    setDespesas(despesasSalvas);
  }, [getChaveDespesas]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovaDespesa(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modoEdicao && despesaEditando) {
      // Atualiza a despesa existente
      const despesasAtualizadas = despesas.map(despesa =>
        despesa.id === despesaEditando.id
          ? { ...novaDespesa, id: despesaEditando.id, usuarioId: usuarioAtual.id }
          : despesa
      );
      setDespesas(despesasAtualizadas);
      localStorage.setItem(getChaveDespesas(), JSON.stringify(despesasAtualizadas));
      onUpdateDashboard();
    } else {
      // Adiciona nova despesa
      const novaDespesaComId = {
        ...novaDespesa,
        id: Date.now(),
        usuarioId: usuarioAtual.id,
        valor: parseFloat(novaDespesa.valor)
      };
      const despesasAtualizadas = [...despesas, novaDespesaComId];
      setDespesas(despesasAtualizadas);
      localStorage.setItem(getChaveDespesas(), JSON.stringify(despesasAtualizadas));
      onUpdateDashboard();
    }

    // Limpa o formulário
    setNovaDespesa({
      nome: '',
      valor: '',
      dataPagamento: '',
      categoria: '',
      descricao: ''
    });
    setModoEdicao(false);
    setDespesaEditando(null);
  };

  const handleEditar = (despesa) => {
    setModoEdicao(true);
    setDespesaEditando(despesa);
    setNovaDespesa({
      nome: despesa.nome,
      valor: despesa.valor,
      dataPagamento: despesa.dataPagamento,
      categoria: despesa.categoria,
      descricao: despesa.descricao
    });
  };

  const handleExcluir = (id) => {
    const despesasAtualizadas = despesas.filter(despesa => despesa.id !== id);
    setDespesas(despesasAtualizadas);
    localStorage.setItem(getChaveDespesas(), JSON.stringify(despesasAtualizadas));
    onUpdateDashboard();
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const categorias = [
    'Alimentação',
    'Casa',
    'Educação',
    'Lazer',
    'Saúde',
    'Transporte',
    'Outros'
  ];

  return (
    <div className="despesas-container">
      <div className="despesas-content">
        <h2>{modoEdicao ? 'Editar Despesa' : 'Nova Despesa'}</h2>
        
        <form onSubmit={handleSubmit} className="despesa-form">
          <div className="form-group">
            <label>Nome da Despesa:</label>
            <input
              type="text"
              name="nome"
              value={novaDespesa.nome}
              onChange={handleInputChange}
              required
              placeholder="Ex: Aluguel"
            />
          </div>

          <div className="form-group">
            <label>Valor:</label>
            <input
              type="number"
              name="valor"
              value={novaDespesa.valor}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="R$ 0,00"
            />
          </div>

          <div className="form-group">
            <label>Data de Pagamento:</label>
            <input
              type="date"
              name="dataPagamento"
              value={novaDespesa.dataPagamento}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria:</label>
            <select
              name="categoria"
              value={novaDespesa.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              name="descricao"
              value={novaDespesa.descricao}
              onChange={handleInputChange}
              placeholder="Descrição opcional"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit">
            {modoEdicao ? 'Atualizar' : 'Adicionar'} Despesa
          </button>
        </form>

        <h2>Despesas Cadastradas</h2>
        {despesas.length === 0 ? (
          <p className="sem-despesas">Nenhuma despesa cadastrada</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map(despesa => (
                  <tr key={despesa.id}>
                    <td>{despesa.nome}</td>
                    <td className="valor-despesa">{formatarValor(despesa.valor)}</td>
                    <td>{formatarData(despesa.dataPagamento)}</td>
                    <td>{despesa.categoria}</td>
                    <td>{despesa.descricao || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleEditar(despesa)}
                        className="btn-editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(despesa.id)}
                        className="btn-excluir"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Despesas; 