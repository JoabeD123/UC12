import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CriarPrimeiroPerfil.css';

function CriarPrimeiroPerfil() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [nomePerfil, setNomePerfil] = useState('');
  const [categoriaFamiliar, setCategoriaFamiliar] = useState('');
  const [senhaPerfil, setSenhaPerfil] = useState('');
  const [confirmarSenhaPerfil, setConfirmarSenhaPerfil] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  if (!userId) {
    navigate('/registro', { replace: true });
    return null;
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
          usuario_id: userId,
          nome_perfil: nomePerfil,
          categoria_familiar: categoriaFamiliar,
          senha_perfil: senhaPerfil,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar o primeiro perfil.');
      }

      // Buscar perfis e permissões do usuário
      const profilesResponse = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${userId}`);
      const profilesData = await profilesResponse.json();

      if (!profilesResponse.ok) {
        throw new Error(profilesData.message || 'Erro ao buscar perfis do usuário');
      }

      // Se houver perfis, usar o primeiro como perfil atual
      if (profilesData.profiles && profilesData.profiles.length > 0) {
        const primeiroPerfil = profilesData.profiles[0];
        
        // Salva os dados no localStorage
        const userLogged = {
          id_usuario: userId,
          nome_familia: data.nome_familia
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userLogged));
        localStorage.setItem(`profile_${userId}`, JSON.stringify(primeiroPerfil));
        
        // Recarrega a página para atualizar o estado global
        window.location.href = '/dashboard';
      } else {
        throw new Error('Nenhum perfil encontrado para este usuário');
      }

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
            {loading ? 'Criando...' : 'Criar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CriarPrimeiroPerfil; 