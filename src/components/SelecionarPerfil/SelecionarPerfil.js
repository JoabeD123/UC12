import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser } from 'react-icons/fa';
import './SelecionarPerfil.css';

const SelecionarPerfil = ({ usuario, onPerfilSelecionado }) => {
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState([]);
  const [senha, setSenha] = useState('');
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarPerfis = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${usuario.id_usuario}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao carregar perfis');
        }

        setPerfis(data.profiles);
      } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        setErro('Erro ao carregar perfis. Tente novamente.');
      }
    };

    carregarPerfis();
  }, [usuario.id_usuario]);

  const handleSelecionarPerfil = (perfil) => {
    setPerfilSelecionado(perfil);
    setSenha('');
    setErro('');
  };

  const handleConfirmarPerfil = async () => {
    if (!perfilSelecionado) {
      setErro('Selecione um perfil');
      return;
    }

    if (!senha) {
      setErro('Digite a senha do perfil');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const response = await fetch('http://localhost:3001/api/perfil/validar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          perfil_id: perfilSelecionado.id_perfil,
          senha: senha
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Senha incorreta');
      }

      // Atualizar o perfil no localStorage
      localStorage.setItem(`profile_${usuario.id_usuario}`, JSON.stringify(perfilSelecionado));
      
      // Notificar o componente pai sobre a mudança de perfil
      onPerfilSelecionado(perfilSelecionado);
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao validar senha:', error);
      setErro(error.message || 'Erro ao validar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="selecionar-perfil-container">
      <div className="selecionar-perfil-box">
        <h2>Selecionar Perfil</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        
        <div className="perfis-grid">
          {perfis.map(perfil => (
            <div
              key={perfil.id_perfil}
              className={`perfil-card ${perfilSelecionado?.id_perfil === perfil.id_perfil ? 'selecionado' : ''}`}
              onClick={() => handleSelecionarPerfil(perfil)}
            >
              <div className="perfil-icon">
                <FaUser />
              </div>
              <div className="perfil-info">
                <h3>{perfil.nome}</h3>
                <span className="perfil-tipo">{perfil.categoria_familiar}</span>
              </div>
            </div>
          ))}
        </div>

        {perfilSelecionado && (
          <div className="senha-container">
            <div className="form-group">
              <label>
                <FaLock />
                Senha do Perfil
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha do perfil"
              />
            </div>
          </div>
        )}

        <div className="botoes-container">
          <button
            className="btn-confirmar"
            onClick={handleConfirmarPerfil}
            disabled={loading || !perfilSelecionado}
          >
            {loading ? 'Carregando...' : 'Confirmar'}
          </button>
          <button
            className="btn-voltar"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelecionarPerfil; 