import React, { useState, useEffect, useCallback } from 'react';
import './Receitas.css';

function Receitas({ onUpdateDashboard }) {
  const [receitas, setReceitas] = useState([]);
  const [novaReceita, setNovaReceita] = useState({
    nome: '',
    valor: '',
    dataRecebimento: '',
    descricao: ''
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [receitaEditando, setReceitaEditando] = useState(null);

  // Obtém o usuário atual do localStorage
  const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));

  // Função para obter a chave específica do usuário para as receitas
  const getChaveReceitas = useCallback(() => `receitas_${usuarioAtual.id}`, [usuarioAtual]);

  useEffect(() => {
    // Carrega as receitas do usuário atual do localStorage
    const receitasSalvas = JSON.parse(localStorage.getItem(getChaveReceitas())) || [];
    setReceitas(receitasSalvas);
  }, [getChaveReceitas]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovaReceita(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modoEdicao && receitaEditando) {
      // Atualiza a receita existente
      const receitasAtualizadas = receitas.map(receita =>
        receita.id === receitaEditando.id
          ? { ...novaReceita, id: receitaEditando.id, usuarioId: usuarioAtual.id }
          : receita
      );
      setReceitas(receitasAtualizadas);
      localStorage.setItem(getChaveReceitas(), JSON.stringify(receitasAtualizadas));
      onUpdateDashboard();
    } else {
      // Adiciona nova receita
      const novaReceitaComId = {
        ...novaReceita,
        id: Date.now(),
        usuarioId: usuarioAtual.id,
        valor: parseFloat(novaReceita.valor)
      };
      const receitasAtualizadas = [...receitas, novaReceitaComId];
      setReceitas(receitasAtualizadas);
      localStorage.setItem(getChaveReceitas(), JSON.stringify(receitasAtualizadas));
      onUpdateDashboard();
    }

    // Limpa o formulário
    setNovaReceita({
      nome: '',
      valor: '',
      dataRecebimento: '',
      descricao: ''
    });
    setModoEdicao(false);
    setReceitaEditando(null);
  };

  const handleEditar = (receita) => {
    setModoEdicao(true);
    setReceitaEditando(receita);
    setNovaReceita({
      nome: receita.nome,
      valor: receita.valor,
      dataRecebimento: receita.dataRecebimento,
      descricao: receita.descricao
    });
  };

  const handleExcluir = (id) => {
    const receitasAtualizadas = receitas.filter(receita => receita.id !== id);
    setReceitas(receitasAtualizadas);
    localStorage.setItem(getChaveReceitas(), JSON.stringify(receitasAtualizadas));
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

  return (
    <div className="receitas-container">
      <div className="receitas-content">
        <h2>{modoEdicao ? 'Editar Receita' : 'Nova Receita'}</h2>
        
        <form onSubmit={handleSubmit} className="receita-form">
          <div className="form-group">
            <label>Nome da Receita:</label>
            <input
              type="text"
              name="nome"
              value={novaReceita.nome}
              onChange={handleInputChange}
              required
              placeholder="Ex: Salário"
            />
          </div>

          <div className="form-group">
            <label>Valor:</label>
            <input
              type="number"
              name="valor"
              value={novaReceita.valor}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="R$ 0,00"
            />
          </div>

          <div className="form-group">
            <label>Data de Recebimento:</label>
            <input
              type="date"
              name="dataRecebimento"
              value={novaReceita.dataRecebimento}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              name="descricao"
              value={novaReceita.descricao}
              onChange={handleInputChange}
              placeholder="Descrição opcional"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit">
            {modoEdicao ? 'Atualizar' : 'Adicionar'} Receita
          </button>
        </form>

        <div className="receitas-lista">
          <h2>Receitas Cadastradas</h2>
          {receitas.length === 0 ? (
            <p className="sem-receitas">Nenhuma receita cadastrada</p>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {receitas.map(receita => (
                    <tr key={receita.id}>
                      <td>{receita.nome}</td>
                      <td className="valor-receita">{formatarValor(receita.valor)}</td>
                      <td>{formatarData(receita.dataRecebimento)}</td>
                      <td>{receita.descricao || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleEditar(receita)}
                          className="btn-editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(receita.id)}
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
    </div>
  );
}

export default Receitas; 