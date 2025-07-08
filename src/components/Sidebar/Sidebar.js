import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRegChartBar, FaMoneyBillWave, FaWallet, FaCreditCard, FaUsers, FaCog, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar({ perfil }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="sidebar">
      <div 
        className="logo" 
        style={{cursor: 'pointer'}} 
        onClick={() => navigate('/dashboard')} 
        onKeyDown={(e) => handleKeyDown(e, '/dashboard')}
        tabIndex={0}
        role="button"
        title="Ir para Dashboard"
        aria-label="Ir para Dashboard"
      >
        <div className="logo-icon">
          <img 
            src="/logo.png" 
            alt="Gestor Familiar" 
            className="logo-image"
          />
        </div>
      </div>
      <div className="menu">
        <div 
          className={`menu-item${location.pathname === '/dashboard' ? ' active' : ''}`} 
          onClick={() => navigate('/dashboard')}
          onKeyDown={(e) => handleKeyDown(e, '/dashboard')}
          tabIndex={0}
          role="menuitem"
          aria-label="Dashboard"
        >
          <FaRegChartBar />
          <span>Dashboard</span>
        </div>
        {perfil?.permissoes?.ver_receitas && (
          <div 
            className={`menu-item${location.pathname === '/receitas' ? ' active' : ''}`} 
            onClick={() => navigate('/receitas')}
            onKeyDown={(e) => handleKeyDown(e, '/receitas')}
            tabIndex={0}
            role="menuitem"
            aria-label="Receitas"
          >
            <FaMoneyBillWave />
            <span>Receitas</span>
          </div>
        )}
        {perfil?.permissoes?.ver_despesas && (
          <div 
            className={`menu-item${location.pathname === '/despesas' ? ' active' : ''}`} 
            onClick={() => navigate('/despesas')}
            onKeyDown={(e) => handleKeyDown(e, '/despesas')}
            tabIndex={0}
            role="menuitem"
            aria-label="Despesas"
          >
            <FaWallet />
            <span>Despesas</span>
          </div>
        )}
        {perfil?.permissoes?.ver_cartoes && (
          <div 
            className={`menu-item${location.pathname === '/cartoes' ? ' active' : ''}`} 
            onClick={() => navigate('/cartoes')}
            onKeyDown={(e) => handleKeyDown(e, '/cartoes')}
            tabIndex={0}
            role="menuitem"
            aria-label="Cartões"
          >
            <FaCreditCard />
            <span>Cartões</span>
          </div>
        )}
        {perfil?.permissoes?.ver_imposto && (
          <div 
            className={`menu-item${location.pathname === '/imposto-renda' ? ' active' : ''}`} 
            onClick={() => navigate('/imposto-renda')}
            onKeyDown={(e) => handleKeyDown(e, '/imposto-renda')}
            tabIndex={0}
            role="menuitem"
            aria-label="Imposto de Renda"
          >
            <FaFileInvoiceDollar />
            <span>Imposto de Renda</span>
          </div>
        )}
        <div 
          className={`menu-item${location.pathname === '/relatorio-personalizado' ? ' active' : ''}`} 
          onClick={() => navigate('/relatorio-personalizado')}
          onKeyDown={(e) => handleKeyDown(e, '/relatorio-personalizado')}
          tabIndex={0}
          role="menuitem"
          aria-label="Relatório Personalizado"
        >
          <FaChartLine />
          <span>Relatório Personalizado</span>
        </div>
        {perfil?.permissoes?.gerenciar_perfis && (
          <div 
            className={`menu-item${location.pathname === '/gerenciar-perfis' ? ' active' : ''}`} 
            onClick={() => navigate('/gerenciar-perfis')}
            onKeyDown={(e) => handleKeyDown(e, '/gerenciar-perfis')}
            tabIndex={0}
            role="menuitem"
            aria-label="Gerenciar Perfis"
          >
            <FaUsers />
            <span>Gerenciar Perfis</span>
          </div>
        )}
        <div 
          className={`menu-item${location.pathname === '/configuracoes' ? ' active' : ''}`} 
          onClick={() => navigate('/configuracoes')}
          onKeyDown={(e) => handleKeyDown(e, '/configuracoes')}
          tabIndex={0}
          role="menuitem"
          aria-label="Configurações"
        >
          <FaCog />
          <span>Configurações</span>
        </div>
        <div 
          className={`menu-item${location.pathname === '/selecionar-perfil' ? ' active' : ''}`} 
          onClick={() => navigate('/selecionar-perfil')}
          onKeyDown={(e) => handleKeyDown(e, '/selecionar-perfil')}
          tabIndex={0}
          role="menuitem"
          aria-label="Trocar de Perfil"
        >
          <FaUsers />
          <span>Trocar de Perfil</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 