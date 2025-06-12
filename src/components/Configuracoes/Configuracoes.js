import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Configuracoes.css';

function Configuracoes({ usuario, perfil, onLogout, darkMode, onThemeChange }) {
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Carregar configurações salvas
      const configSalvas = JSON.parse(localStorage.getItem(`config_${usuario?.id}`)) || {};
      setZoom(configSalvas.zoom || 100);
      aplicarZoom(configSalvas.zoom || 100);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setError('Erro ao carregar configurações. Usando valores padrão.');
    }

    return () => {
      // Cleanup: remover zoom ao desmontar
      aplicarZoom(100);
    };
  }, [usuario]);

  const aplicarZoom = (zoomValue) => {
    try {
      const appContainer = document.querySelector('.app');
      if (appContainer) {
        // Usar transform scale como fallback para navegadores que não suportam zoom
        if (typeof appContainer.style.zoom !== 'undefined') {
          appContainer.style.zoom = `${zoomValue}%`;
        } else {
          appContainer.style.transform = `scale(${zoomValue / 100})`;
          appContainer.style.transformOrigin = 'top left';
        }
      }
    } catch (error) {
      console.error('Erro ao aplicar zoom:', error);
    }
  };

  const handleDarkModeChange = () => {
    try {
      onThemeChange(!darkMode);
    } catch (error) {
      console.error('Erro ao alterar modo escuro:', error);
      setError('Erro ao alterar modo escuro. Tente novamente.');
    }
  };

  const handleZoomChange = (novoZoom) => {
    try {
      setZoom(novoZoom);
      aplicarZoom(novoZoom);
      salvarConfiguracoes({ darkMode, zoom: novoZoom });
    } catch (error) {
      console.error('Erro ao alterar zoom:', error);
      setError('Erro ao alterar zoom. Tente novamente.');
    }
  };

  const salvarConfiguracoes = (config) => {
    try {
      if (usuario?.id) {
        localStorage.setItem(`config_${usuario.id}`, JSON.stringify(config));
        setError(null);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações. Tente novamente.');
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

      <div className="config-container">
        <div className="content-header">
          <h1>Configurações</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="config-content">
          <div className="config-section">
            <h3>Aparência</h3>
            <div className="config-item">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleDarkModeChange}
                />
                <span className="slider round"></span>
              </label>
              <span>Modo Escuro</span>
            </div>
          </div>

          <div className="config-section">
            <h3>Zoom</h3>
            <div className="config-item">
              <div className="zoom-controls">
                <button 
                  onClick={() => handleZoomChange(Math.max(50, zoom - 10))}
                  className="zoom-btn"
                  disabled={zoom <= 50}
                >
                  -
                </button>
                <span>{zoom}%</span>
                <button 
                  onClick={() => handleZoomChange(Math.min(150, zoom + 10))}
                  className="zoom-btn"
                  disabled={zoom >= 150}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="config-section">
            <h3>Conta</h3>
            <div className="config-item">
              <button onClick={onLogout} className="btn-sair">
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes; 