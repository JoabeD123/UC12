import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaUsers, FaCog, FaCreditCard, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import './Configuracoes.css';

const Configuracoes = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    darkMode: false,
    zoom: 100,
    notificacoes: true,
    privacidade: false
  });

  useEffect(() => {
    const configSalva = localStorage.getItem('config');
    if (configSalva) {
      setConfig(JSON.parse(configSalva));
    }
  }, []);

  const handleConfigChange = (campo, valor) => {
    const novaConfig = { ...config, [campo]: valor };
    setConfig(novaConfig);
    localStorage.setItem('config', JSON.stringify(novaConfig));

    if (campo === 'darkMode') {
      document.documentElement.setAttribute('data-theme', valor ? 'dark' : 'light');
    }

    if (campo === 'zoom') {
      document.body.style.zoom = `${valor}%`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('perfil');
    navigate('/login');
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
          <div className="menu-item active" onClick={() => navigate('/configuracoes')}>
            <FaCog />
            <span>Configurações</span>
          </div>
        </div>
      </div>

      <div className="config-container">
        <div className="config-header">
          <h2>Configurações</h2>
        </div>

        <div className="config-content">
          <div className="config-section">
            <h3>Aparência</h3>
            <div className="config-item">
              <div className="config-label">
                <span>Modo Escuro</span>
                <p className="config-description">Alterar entre tema claro e escuro</p>
              </div>
              <div className="theme-toggle">
                <button
                  className={`theme-btn ${!config.darkMode ? 'active' : ''}`}
                  onClick={() => handleConfigChange('darkMode', false)}
                >
                  <FaSun />
                  <span>Claro</span>
                </button>
                <button
                  className={`theme-btn ${config.darkMode ? 'active' : ''}`}
                  onClick={() => handleConfigChange('darkMode', true)}
                >
                  <FaMoon />
                  <span>Escuro</span>
                </button>
              </div>
            </div>

            <div className="config-item">
              <div className="config-label">
                <span>Zoom da Interface</span>
                <p className="config-description">Ajustar o tamanho dos elementos da interface</p>
              </div>
              <div className="zoom-controls">
                <button
                  onClick={() => handleConfigChange('zoom', Math.max(50, config.zoom - 10))}
                  disabled={config.zoom <= 50}
                >
                  -
                </button>
                <span>{config.zoom}%</span>
                <button
                  onClick={() => handleConfigChange('zoom', Math.min(150, config.zoom + 10))}
                  disabled={config.zoom >= 150}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="config-section">
            <h3>Notificações</h3>
            <div className="config-item">
              <div className="config-label">
                <span>Notificações do Sistema</span>
                <p className="config-description">Receber alertas e notificações importantes</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.notificacoes}
                  onChange={(e) => handleConfigChange('notificacoes', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="config-section">
            <h3>Privacidade</h3>
            <div className="config-item">
              <div className="config-label">
                <span>Modo Privado</span>
                <p className="config-description">Ocultar informações sensíveis</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.privacidade}
                  onChange={(e) => handleConfigChange('privacidade', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="config-section">
            <h3>Conta</h3>
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes; 