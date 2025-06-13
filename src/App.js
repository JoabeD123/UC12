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
          setProfile(JSON.parse(localStorage.getItem(`profile_${userData.id_usuario}`)));
          
          // Carregar configurações específicas do usuário
          const userConfig = JSON.parse(localStorage.getItem(`config_${userData.id_usuario}`)) || {};
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

  const handleLogin = async (user) => {
    try {
      console.log('handleLogin chamado com:', { user });
      
      // Salvar dados do usuário no localStorage e no estado
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('currentUser atualizado:', user);

      // Buscar perfis e permissões do usuário recém-logado
      const profilesResponse = await fetch(`http://localhost:3001/api/user/profiles-and-permissions/${user.id_usuario}`);
      const profilesData = await profilesResponse.json();

      if (!profilesResponse.ok) {
        throw new Error(profilesData.message || 'Erro ao buscar perfis do usuário');
      }

      const fetchedProfiles = profilesData.profiles;

      // Se houver perfis, usar o primeiro como perfil atual
      if (fetchedProfiles && fetchedProfiles.length > 0) {
        const primeiroPerfil = fetchedProfiles[0];
        console.log('Usando primeiro perfil:', primeiroPerfil);
        setProfile(primeiroPerfil);
        localStorage.setItem(`profile_${user.id_usuario}`, JSON.stringify(primeiroPerfil));
        // As permissões já vêm aninhadas no objeto perfil
        localStorage.setItem(`permissions_${user.id_usuario}`, JSON.stringify(primeiroPerfil.permissoes));
      } else {
        console.log('Nenhum perfil encontrado para o usuário. Redirecionando para criação de perfil...');
        // Se não houver perfis, redirecionar para a tela de criação do primeiro perfil
        // Isso deve ser tratado no Login.js ou onde o redirecionamento inicial acontece
        // Por agora, apenas logar. A navegação para /criar-primeiro-perfil é feita no Registro.js.
        // No caso de um login onde não há perfis, o usuário será levado ao dashboard com profile=null
        // O que pode causar erros em rotas protegidas por permissões.
        // Precisamos garantir que, ao logar, um perfil *exista* ou o usuário seja forçado a criar um.
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
