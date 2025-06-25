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
import CriarPrimeiroPerfil from './components/CriarPrimeiroPerfil/CriarPrimeiroPerfil';
import SelecionarPerfil from './components/SelecionarPerfil/SelecionarPerfil';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [precisaSelecionarPerfil, setPrecisaSelecionarPerfil] = useState(false);

  useEffect(() => {
    // Carregar usuário e configurações ao iniciar
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('currentUser'));
        if (userData) {
          // Verifica se o usuário ainda existe no backend
          const res = await fetch(`http://localhost:3001/api/usuario/${userData.id_usuario}`);
          if (!res.ok) {
            handleLogout();
            setLoading(false);
            return;
          }
          setCurrentUser(userData);
          const profileData = JSON.parse(localStorage.getItem(`profile_${userData.id_usuario}`));
          if (profileData) {
            // Verifica se o perfil ainda existe no backend
            const resPerfil = await fetch(`http://localhost:3001/api/perfil/${profileData.id_perfil}`);
            if (!resPerfil.ok) {
              handleLogout();
              setLoading(false);
              return;
            }
            setProfile(profileData);
          }
          // Carregar configurações específicas do usuário
          const userConfig = JSON.parse(localStorage.getItem(`config_${userData.id_usuario}`)) || {};
          setDarkMode(userConfig.darkMode || false);
          document.documentElement.setAttribute('data-theme', userConfig.darkMode ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogin = async (user, userProfile) => {
    try {
      // Buscar perfis do usuário
      const profilesResponse = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${user.id_usuario}`);
      const profilesData = await profilesResponse.json();
      if (!profilesResponse.ok) {
        throw new Error(profilesData.message || 'Erro ao buscar perfis do usuário');
      }
      if (profilesData.profiles && profilesData.profiles.length > 1) {
        // Mais de um perfil: forçar seleção
        setCurrentUser(user);
        setPrecisaSelecionarPerfil(true);
        return;
      } else if (profilesData.profiles && profilesData.profiles.length === 1) {
        setCurrentUser(user);
        setProfile(profilesData.profiles[0]);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem(`profile_${user.id_usuario}`, JSON.stringify(profilesData.profiles[0]));
      }
      // Carregar configurações do usuário ao fazer login
      const userConfig = JSON.parse(localStorage.getItem(`config_${user.id_usuario}`)) || {};
      setDarkMode(userConfig.darkMode || false);
      document.documentElement.setAttribute('data-theme', userConfig.darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro detalhado no handleLogin:', error);
    }
  };

  const handleLogout = () => {
    try {
      // Limpar dados do usuário atual
      if (currentUser?.id_usuario) {
        localStorage.removeItem(`profile_${currentUser.id_usuario}`);
        localStorage.removeItem(`permissions_${currentUser.id_usuario}`);
        localStorage.removeItem(`config_${currentUser.id_usuario}`);
        localStorage.removeItem(`receitas_${currentUser.id_usuario}`);
        localStorage.removeItem(`despesas_${currentUser.id_usuario}`);
        localStorage.removeItem(`categorias_receitas_${currentUser.id_usuario}`);
        localStorage.removeItem(`categorias_despesas_${currentUser.id_usuario}`);
      }
      
      // Limpar dados gerais
      localStorage.removeItem('currentUser');
      
      // Resetar estados
      setCurrentUser(null);
      setProfile(null);
      setDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
      
      console.log('Logout realizado com sucesso');
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

  const handlePerfilSelecionado = (perfil) => {
    setProfile(perfil);
    setPrecisaSelecionarPerfil(false);
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
            path="/criar-primeiro-perfil" 
            element={
              !currentUser ? (
                <CriarPrimeiroPerfil />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentUser && profile ? (
                <Dashboard 
                  onLogout={handleLogout}
                  setUsuario={setCurrentUser}
                  setPerfil={setProfile}
                  usuario={currentUser}
                  perfil={profile}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
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
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/selecionar-perfil"
            element={
              currentUser ? (
                <SelecionarPerfil usuario={currentUser} onPerfilSelecionado={handlePerfilSelecionado} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        {/* Redirecionamento automático para seleção de perfil se necessário */}
        {precisaSelecionarPerfil && <Navigate to="/selecionar-perfil" replace />}
      </div>
    </Router>
  );
}

export default App;
