import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Configuracoes.css';

function Configuracoes({ usuario, perfil, onLogout }) {
  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar configurações salvas
    const configSalvas = JSON.parse(localStorage.getItem(`config_${usuario?.id}`)) || {};
    setDarkMode(configSalvas.darkMode || false);
    setZoom(configSalvas.zoom || 100);

    // Aplicar configurações
    if (configSalvas.darkMode) {
      document.body.classList.add('dark-mode');
    }
    
    // Aplicar zoom apenas no container principal da aplicação
    const appContainer = document.querySelector('.app > div:not(.auth-container)');
    if (appContainer) {
      appContainer.style.zoom = `${configSalvas.zoom || 100}%`;
    }

    return () => {
      // Cleanup: remover zoom ao desmontar
      if (appContainer) {
        appContainer.style.zoom = '100%';
      }
    };
  }, [usuario]);

  const handleDarkModeChange = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    salvarConfiguracoes({ darkMode: newDarkMode, zoom });
  };

  const handleZoomChange = (novoZoom) => {
    setZoom(novoZoom);
    // Aplicar zoom apenas no container principal da aplicação
    const appContainer = document.querySelector('.app > div:not(.auth-container)');
    if (appContainer) {
      appContainer.style.zoom = `${novoZoom}%`;
    }
    salvarConfiguracoes({ darkMode, zoom: novoZoom });
  };

  const salvarConfiguracoes = (config) => {
    if (usuario) {
      localStorage.setItem(`config_${usuario.id}`, JSON.stringify(config));
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