import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRegChartBar, FaMoneyBillWave, FaWallet, FaCreditCard, FaPiggyBank, FaUsers, FaCog } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar({ perfil }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">GF</div>
      </div>
      <div className="menu">
        <div className={`menu-item${location.pathname === '/dashboard' ? ' active' : ''}`} onClick={() => navigate('/dashboard')}>
          <FaRegChartBar />
          <span>Dashboard</span>
        </div>
        {perfil?.permissoes?.ver_receitas && (
          <div className={`menu-item${location.pathname === '/receitas' ? ' active' : ''}`} onClick={() => navigate('/receitas')}>
            <FaMoneyBillWave />
            <span>Receitas</span>
          </div>
        )}
        {perfil?.permissoes?.ver_despesas && (
          <div className={`menu-item${location.pathname === '/despesas' ? ' active' : ''}`} onClick={() => navigate('/despesas')}>
            <FaWallet />
            <span>Despesas</span>
          </div>
        )}
        {perfil?.permissoes?.ver_cartoes && (
          <div className={`menu-item${location.pathname === '/cartoes' ? ' active' : ''}`} onClick={() => navigate('/cartoes')}>
            <FaCreditCard />
            <span>Cartões</span>
          </div>
        )}
        {perfil?.permissoes?.ver_imposto && (
          <div className={`menu-item${location.pathname === '/imposto-renda' ? ' active' : ''}`} onClick={() => navigate('/imposto-renda')}>
            <span role="img" aria-label="Imposto">💰</span>
            <span>Imposto de Renda</span>
          </div>
        )}
        {perfil?.permissoes?.gerenciar_perfis && (
          <div className={`menu-item${location.pathname === '/gerenciar-perfis' ? ' active' : ''}`} onClick={() => navigate('/gerenciar-perfis')}>
            <FaUsers />
            <span>Gerenciar Perfis</span>
          </div>
        )}
        <div className={`menu-item${location.pathname === '/configuracoes' ? ' active' : ''}`} onClick={() => navigate('/configuracoes')}>
          <FaCog />
          <span>Configurações</span>
        </div>
        <div className={`menu-item${location.pathname === '/selecionar-perfil' ? ' active' : ''}`} onClick={() => navigate('/selecionar-perfil')}>
          <FaUsers />
          <span>Trocar de Perfil</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 