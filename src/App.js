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
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Carregar usuário e configurações ao iniciar
    const loadUserData = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('currentUser'));
        if (userData) {
          setCurrentUser(userData);
          setProfile(JSON.parse(localStorage.getItem(`profile_${userData.id}`)));
          
          // Carregar configurações específicas do usuário
          const userConfig = JSON.parse(localStorage.getItem(`config_${userData.id}`)) || {};
          setDarkMode(userConfig.darkMode || false);
          document.documentElement.setAttribute('data-theme', userConfig.darkMode ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogin = (user, profiles) => {
    try {
      console.log('handleLogin chamado com:', { user, profiles });
      
      // Salvar dados do usuário
      setCurrentUser(user);
      console.log('currentUser atualizado:', user);
      
      // Se houver perfis, usar o primeiro como perfil atual
      if (profiles && profiles.length > 0) {
        const primeiroPerfil = profiles[0];
        console.log('Usando primeiro perfil:', primeiroPerfil);
        setProfile(primeiroPerfil);
        
        // Adicionar permissões padrão se não existirem
        if (!primeiroPerfil.permissoes) {
          console.log('Adicionando permissões padrão ao perfil');
          primeiroPerfil.permissoes = {
            verReceitas: true,
            verDespesas: true,
            editarReceitas: true,
            editarDespesas: true,
            gerenciarPerfis: true,
            verImpostoRenda: true
          };
        }
      } else {
        console.log('Nenhum perfil encontrado');
      }
      
      // Carregar configurações do usuário ao fazer login
      const userConfig = JSON.parse(localStorage.getItem(`config_${user.id_usuario}`)) || {};
      setDarkMode(userConfig.darkMode || false);
      document.documentElement.setAttribute('data-theme', userConfig.darkMode ? 'dark' : 'light');
      
      console.log('Login processado com sucesso');
    } catch (error) {
      console.error('Erro detalhado no handleLogin:', error);
    }
  };

  const handleLogout = () => {
    try {
      setCurrentUser(null);
      setProfile(null);
      setDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleThemeChange = (isDark) => {
    try {
      setDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      
      // Salvar configuração de tema específica do usuário
      if (currentUser?.id_usuario) {
        const userConfig = JSON.parse(localStorage.getItem(`config_${currentUser.id_usuario}`)) || {};
        userConfig.darkMode = isDark;
        localStorage.setItem(`config_${currentUser.id_usuario}`, JSON.stringify(userConfig));
      }
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              !currentUser ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/registro" 
            element={
              !currentUser ? (
                <Registro />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentUser ? (
                <Dashboard 
                  usuario={currentUser}
                  perfil={profile}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          {profile?.permissoes?.verReceitas && (
            <Route
              path="/receitas"
              element={
                currentUser ? (
                  <Receitas 
                    usuario={currentUser}
                    perfil={profile}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          )}
          {profile?.permissoes?.verDespesas && (
            <Route
              path="/despesas"
              element={
                currentUser ? (
                  <Despesas 
                    usuario={currentUser}
                    perfil={profile}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          )}
          {profile?.permissoes?.gerenciarPerfis && (
            <Route
              path="/gerenciar-perfis"
              element={
                currentUser ? (
                  <GerenciarPerfis
                    usuario={currentUser}
                    perfil={profile}
                    onPerfilAtualizado={setProfile}
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
              currentUser ? (
                <CartoesCredito 
                  usuario={currentUser}
                  perfil={profile}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/imposto-renda"
            element={
              currentUser ? (
                <ImpostoRenda 
                  usuario={currentUser}
                  perfil={profile}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/configuracoes"
            element={
              currentUser ? (
                <Configuracoes
                  usuario={currentUser}
                  perfil={profile}
                  darkMode={darkMode}
                  onThemeChange={handleThemeChange}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
