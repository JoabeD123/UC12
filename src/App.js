import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Receitas from './components/Receitas';
import Despesas from './components/Despesas';
import GerenciarPerfis from './components/GerenciarPerfis';

function App() {
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [perfilAtual, setPerfilAtual] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const usuarioSalvo = localStorage.getItem('usuarioAtual');
      const perfilSalvo = localStorage.getItem('perfilAtual');
      
      if (usuarioSalvo && perfilSalvo) {
        const usuarioParsed = JSON.parse(usuarioSalvo);
        const perfilParsed = JSON.parse(perfilSalvo);
        
        if (usuarioParsed && perfilParsed) {
          setUsuarioAtual(usuarioParsed);
          setPerfilAtual(perfilParsed);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      // Limpar dados corrompidos
      localStorage.removeItem('usuarioAtual');
      localStorage.removeItem('perfilAtual');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (usuario, perfil) => {
    try {
      if (!usuario || !perfil) {
        throw new Error('Dados de usuário ou perfil inválidos');
      }
      setUsuarioAtual(usuario);
      setPerfilAtual(perfil);
      localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
      localStorage.setItem('perfilAtual', JSON.stringify(perfil));
    } catch (error) {
      console.error('Erro ao salvar dados de login:', error);
      alert('Erro ao fazer login. Por favor, tente novamente.');
    }
  };

  const handleLogout = () => {
    setUsuarioAtual(null);
    setPerfilAtual(null);
    localStorage.removeItem('usuarioAtual');
    localStorage.removeItem('perfilAtual');
  };

  const handlePerfilAtualizado = (novoPerfil) => {
    try {
      if (!novoPerfil) {
        throw new Error('Dados do perfil inválidos');
      }
      setPerfilAtual(novoPerfil);
      localStorage.setItem('perfilAtual', JSON.stringify(novoPerfil));
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Por favor, tente novamente.');
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              usuarioAtual && perfilAtual ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/registro" 
            element={
              usuarioAtual && perfilAtual ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              usuarioAtual && perfilAtual ? (
                <Dashboard 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                  onLogout={handleLogout}
                  onPerfilAtualizado={handlePerfilAtualizado}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/receitas" 
            element={
              usuarioAtual && perfilAtual ? (
                <Receitas 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                  onLogout={handleLogout}
                  onPerfilAtualizado={handlePerfilAtualizado}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/despesas" 
            element={
              usuarioAtual && perfilAtual ? (
                <Despesas 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                  onLogout={handleLogout}
                  onPerfilAtualizado={handlePerfilAtualizado}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/gerenciar-perfis" 
            element={
              usuarioAtual && perfilAtual ? (
                <GerenciarPerfis 
                  usuario={usuarioAtual}
                  perfil={perfilAtual}
                  onLogout={handleLogout}
                  onPerfilAtualizado={handlePerfilAtualizado}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              usuarioAtual && perfilAtual ? (
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
