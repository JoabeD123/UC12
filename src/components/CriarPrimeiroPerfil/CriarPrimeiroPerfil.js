import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CriarPrimeiroPerfil.css';

function CriarPrimeiroPerfil() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId; // Obter userId passado pelo Registro.js

  const [nomePerfil, setNomePerfil] = useState('');
  const [categoriaFamiliar, setCategoriaFamiliar] = useState('');
  const [senhaPerfil, setSenhaPerfil] = useState('');
  const [confirmarSenhaPerfil, setConfirmarSenhaPerfil] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Se não houver userId, redireciona de volta para o registro
  if (!userId) {
    // navigate('/registro', { replace: true });
    // return null;
    // Por enquanto, para facilitar o desenvolvimento, vou permitir continuar sem userId.
    // Em produção, a linha acima deve ser descomentada.
    console.warn("Nenhum userId encontrado. Isso pode indicar um fluxo de registro incorreto.");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    if (senhaPerfil !== confirmarSenhaPerfil) {
      setErro('As senhas do perfil não coincidem.');
      return;
    }

    if (!nomePerfil || !categoriaFamiliar || !senhaPerfil) {
      setErro('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/perfil/primeiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: userId, // Usar o userId obtido da rota
          nome_perfil: nomePerfil,
          categoria_familiar: categoriaFamiliar,
          senha_perfil: senhaPerfil,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar o primeiro perfil.');
      }

      alert('Primeiro perfil criado com sucesso!');
      navigate('/dashboard'); // Redireciona para o dashboard após criar o perfil

    } catch (error) {
      console.error('Erro ao criar o primeiro perfil:', error.message);
      setErro(error.message || 'Erro ao criar o primeiro perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="criar-perfil-container">
      <div className="criar-perfil-box">
        <h2>Crie seu Primeiro Perfil</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome do Perfil:</label>
            <input
              type="text"
              value={nomePerfil}
              onChange={(e) => setNomePerfil(e.target.value)}
              placeholder="Ex: Mãe, Pai, João..."
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria Familiar:</label>
            <select
              value={categoriaFamiliar}
              onChange={(e) => setCategoriaFamiliar(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {/* <option value="Principal">Principal (Administrador)</option> */}
              <option value="Pai">Pai</option>
              <option value="Mãe">Mãe</option>
              <option value="Filho">Filho(a)</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* A opção de foto do perfil será adicionada em uma iteração futura */}

          <div className="form-group">
            <label>Senha do Perfil:</label>
            <input
              type="password"
              value={senhaPerfil}
              onChange={(e) => setSenhaPerfil(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar Senha do Perfil:</label>
            <input
              type="password"
              value={confirmarSenhaPerfil}
              onChange={(e) => setConfirmarSenhaPerfil(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Criando Perfil...' : 'Criar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CriarPrimeiroPerfil; 