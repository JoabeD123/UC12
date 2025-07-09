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
import RelatorioDesempenho from './components/RelatorioDesempenho/RelatorioDesempenho';
import RelatorioPersonalizado from './components/RelatorioPersonalizado/RelatorioPersonalizado';
import { API_BASE_URL } from './config';

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
        // Tentar recuperar sessão do sessionStorage
        const savedUser = sessionStorage.getItem('currentUser');
        const savedProfile = sessionStorage.getItem('currentProfile');
        
        if (savedUser && savedProfile) {
          console.log('🔄 Recuperando sessão do sessionStorage');
          const user = JSON.parse(savedUser);
          const profile = JSON.parse(savedProfile);
          
          // Verificar se a sessão ainda é válida no backend
          try {
            const userCheck = await fetch(`${API_BASE_URL}/usuario/${user.id_usuario}`);
            const profileCheck = await fetch(`${API_BASE_URL}/perfil/${profile.id_perfil}`);
            
            if (userCheck.ok && profileCheck.ok) {
              console.log('✅ Sessão válida, restaurando estado');
              setCurrentUser(user);
              setProfile(profile);
              
              // Carregar configurações
              try {
                const configResponse = await fetch(`${API_BASE_URL}/configuracoes/${user.id_usuario}`);
                if (configResponse.ok) {
                  const configData = await configResponse.json();
                  setDarkMode(configData.darkMode || false);
                  document.documentElement.setAttribute('data-theme', configData.darkMode ? 'dark' : 'light');
                }
              } catch (error) {
                setDarkMode(false);
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } else {
              console.log('❌ Sessão inválida, limpando sessionStorage');
              sessionStorage.removeItem('currentUser');
              sessionStorage.removeItem('currentProfile');
              setCurrentUser(null);
              setProfile(null);
            }
          } catch (error) {
            console.log('❌ Erro ao verificar sessão:', error);
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentProfile');
            setCurrentUser(null);
            setProfile(null);
          }
        } else {
          console.log('📝 Nenhuma sessão encontrada');
          setCurrentUser(null);
          setProfile(null);
        }
        
        setDarkMode(false);
        document.documentElement.setAttribute('data-theme', 'light');
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
      console.log('🔐 handleLogin chamado com:', { user, userProfile });
      // Buscar perfis do usuário SEM usar localStorage
      const profilesResponse = await fetch(`${API_BASE_URL}/user/profiles-and-permissions/${user.id_usuario}`);
      const profilesData = await profilesResponse.json();
      if (!profilesResponse.ok) {
        throw new Error(profilesData.message || 'Erro ao buscar perfis do usuário');
      }
      if (profilesData.profiles && profilesData.profiles.length > 0) {
        const primeiroPerfil = profilesData.profiles[0];
        console.log('👤 Definindo currentUser e profile:', { user, primeiroPerfil });
        setCurrentUser(user);
        setProfile(primeiroPerfil);
        
        // Salvar sessão no sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('currentProfile', JSON.stringify(primeiroPerfil));
        console.log('💾 Sessão salva no sessionStorage');
        
        // Carregar configurações do usuário do backend
        try {
          const configResponse = await fetch(`${API_BASE_URL}/configuracoes/${user.id_usuario}`);
          if (configResponse.ok) {
            const configData = await configResponse.json();
            setDarkMode(configData.darkMode || false);
            document.documentElement.setAttribute('data-theme', configData.darkMode ? 'dark' : 'light');
          } else {
            setDarkMode(false);
            document.documentElement.setAttribute('data-theme', 'light');
          }
        } catch (error) {
          setDarkMode(false);
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } else {
        window.location.href = `/criar-primeiro-perfil?userId=${user.id_usuario}`;
      }
    } catch (error) {
      console.error('❌ Erro detalhado no handleLogin:', error);
    }
  };

  const handleLogout = () => {
    console.log('🚪 handleLogout chamado - limpando estado global');
    try {
      setCurrentUser(null);
      setProfile(null);
      setDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
      // Limpar sessionStorage
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentProfile');
      console.log('🗑️ SessionStorage limpo');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleThemeChange = (isDark) => {
    try {
      setDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
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
                <CriarPrimeiroPerfil onLogin={handleLogin} />
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
                (() => {
                  console.log('🚫 Redirecionando para login - currentUser é null:', { currentUser, profile });
                  return <Navigate to="/login" replace />;
                })()
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
            path="/desempenho"
            element={
              currentUser && profile ? (
                <RelatorioDesempenho
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
            path="/relatorio-personalizado"
            element={
              currentUser && profile ? (
                <RelatorioPersonalizado
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
