import React from 'react';
import './Header.css';

function Header({ usuarioAtual, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="welcome-message">
          <h1>Olá, {usuarioAtual.nomeFamilia}</h1>
          <span className="perfil-tipo-header">{usuarioAtual.tipo}</span>
        </div>
        <button onClick={onLogout} className="btn-logout">
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header; 