import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import Registro from './components/Registro/Registro';
import Dashboard from './components/Dashboard/Dashboard';
import Receitas from './components/Receitas/Receitas';
import Despesas from './components/Despesas/Despesas';
import GerenciarPerfis from './components/GerenciarPerfis/GerenciarPerfis';
import CartoesCredito from './components/CartoesCredito/CartoesCredito';
import Configuracoes from './components/Configuracoes/Configuracoes';
import ImpostoRenda from './components/ImpostoRenda/ImpostoRenda';

function App() {
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const usuarioSalvo = JSON.parse(localStorage.getItem('usuarioAtual'));
      const perfilSalvo = JSON.parse(localStorage.getItem('perfilAtual'));
      if (usuarioSalvo) setUsuarioAtual(usuarioSalvo);
      if (perfilSalvo) setPerfilAtual(perfilSalvo);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (usuario, perfil) => {
    setUsuarioAtual(usuario);
    setPerfilAtual(perfil);
    localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
    localStorage.setItem('perfilAtual', JSON.stringify(perfil));
  };

  const handleLogout = () => {
    setUsuarioAtual(null);
    setPerfilAtual(null);
    localStorage.removeItem('usuarioAtual');
    localStorage.removeItem('perfilAtual');
  };

  const handlePerfilAtualizado = (perfil) => {
    setPerfilAtual(perfil);
    localStorage.setItem('perfilAtual', JSON.stringify(perfil));
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              !usuarioAtual ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/registro" 
            element={
              !usuarioAtual ? (
                <Registro />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              usuarioAtual ? (
                <Dashboard 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          {perfilAtual?.permissoes.verReceitas && (
            <Route
              path="/receitas"
              element={
                usuarioAtual ? (
                  <Receitas 
                    usuario={usuarioAtual}
                    perfil={perfilAtual}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          )}
          {perfilAtual?.permissoes.verDespesas && (
            <Route
              path="/despesas"
              element={
                usuarioAtual ? (
                  <Despesas 
                    usuario={usuarioAtual}
                    perfil={perfilAtual}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          )}
          {perfilAtual?.permissoes.gerenciarPerfis && (
            <Route
              path="/gerenciar-perfis"
              element={
                usuarioAtual ? (
                  <GerenciarPerfis
                    usuario={usuarioAtual}
                    perfil={perfilAtual}
                    onPerfilAtualizado={handlePerfilAtualizado}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          )}
          <Route
            path="/cartoes"
            element={
              usuarioAtual ? (
                <CartoesCredito 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/imposto-renda"
            element={
              usuarioAtual ? (
                <ImpostoRenda 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/configuracoes"
            element={
              usuarioAtual ? (
                <Configuracoes 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route 
            path="/" 
            element={
              usuarioAtual ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
