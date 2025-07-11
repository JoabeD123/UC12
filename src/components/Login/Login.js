import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../../config';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSugestoes, setEmailSugestoes] = useState([]);
  const [sugestaoAtiva, setSugestaoAtiva] = useState(-1);
  const emailInputRef = useRef(null);
  const navigate = useNavigate();

  const dominiosPopulares = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

  // Sugestão de domínios ao digitar
  const handleEmailChange = (e) => {
    const valor = e.target.value;
    setEmail(valor);
    setSugestaoAtiva(-1);
    const atIndex = valor.indexOf('@');
    if (atIndex > -1) {
      const prefixo = valor.slice(0, atIndex + 1);
      const textoDominio = valor.slice(atIndex + 1).toLowerCase();
      if (textoDominio.length === 0) {
        setEmailSugestoes(dominiosPopulares.map(dom => prefixo + dom));
      } else {
        setEmailSugestoes(
          dominiosPopulares
            .filter(dom => dom.startsWith(textoDominio))
            .map(dom => prefixo + dom)
        );
      }
    } else {
      setEmailSugestoes([]);
    }
  };

  const handleSugestaoClick = (sugestao) => {
    setEmail(sugestao);
    setEmailSugestoes([]);
    setSugestaoAtiva(-1);
    // Foca no próximo campo (senha)
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.blur();
      }
    }, 100);
  };

  const handleEmailKeyDown = (e) => {
    if (emailSugestoes.length === 0) return;
    if (e.key === 'ArrowDown') {
      setSugestaoAtiva((prev) => (prev + 1) % emailSugestoes.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSugestaoAtiva((prev) => (prev - 1 + emailSugestoes.length) % emailSugestoes.length);
      e.preventDefault();
    } else if (e.key === 'Enter' && sugestaoAtiva >= 0) {
      handleSugestaoClick(emailSugestoes[sugestaoAtiva]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setEmailSugestoes([]);
      setSugestaoAtiva(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      console.log('Iniciando login com:', { email, senha });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (!response.ok) {
        // Mensagens específicas de erro
        if (data.message === 'Email inválido.') {
          setErro('O email informado não está cadastrado.');
        } else if (data.message === 'Senha incorreta.') {
          setErro('A senha informada está incorreta.');
        } else {
          setErro(data.message || 'Erro ao fazer login.');
        }
        setLoading(false);
        return;
      }

      // Se chegou aqui, o login foi bem sucedido
      console.log('Login bem sucedido, chamando onLogin com:', { 
        userId: data.userId, 
        nomeFamilia: data.nomeFamilia 
      });

      const userLogged = {
        id_usuario: data.userId,
        nome_familia: data.nomeFamilia
      };

      // Buscar perfis e permissões do usuário
      const profilesResponse = await fetch(`${API_BASE_URL}/user/profiles-and-permissions/${data.userId}`);
      const profilesData = await profilesResponse.json();

      if (!profilesResponse.ok) {
        throw new Error(profilesData.message || 'Erro ao buscar perfis do usuário');
      }

      // Se houver perfis, usar o primeiro como perfil atual
      if (profilesData.profiles && profilesData.profiles.length > 0) {
        const primeiroPerfil = profilesData.profiles[0];
        console.log('Usando primeiro perfil:', primeiroPerfil);
        
        // Salva os dados no localStorage
        localStorage.setItem('currentUser', JSON.stringify(userLogged));
        localStorage.setItem(`profile_${data.userId}`, JSON.stringify(primeiroPerfil));
        
        // Chama a função onLogin com os dados do usuário e perfil
        onLogin(userLogged, primeiroPerfil);
      } else {
        throw new Error('Nenhum perfil encontrado para este usuário');
      }

    } catch (error) {
      console.error('Erro detalhado ao fazer login:', error);
      setErro(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = () => {
    navigate('/registro');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleEmailKeyDown}
              ref={emailInputRef}
              required
              autoComplete="off"
            />
            {emailSugestoes.length > 0 && (
              <ul className="email-sugestoes">
                {emailSugestoes.map((sugestao, idx) => (
                  <li
                    key={sugestao}
                    className={sugestaoAtiva === idx ? 'ativa' : ''}
                    onMouseDown={() => handleSugestaoClick(sugestao)}
                  >
                    {sugestao}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <button onClick={handleCadastro} className="btn-link">
          Não tem uma conta? Cadastre-se
        </button>
      </div>
    </div>
  );
}

export default Login; 