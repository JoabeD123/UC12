import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css';
import { API_BASE_URL } from '../../config';

function Registro() {
  const [nome, setNome] = useState(''); // Corresponde a nome_familia no backend
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSugestoes, setEmailSugestoes] = useState([]);
  const [sugestaoAtiva, setSugestaoAtiva] = useState(-1);
  const emailInputRef = useRef(null);
  const navigate = useNavigate();

  const dominiosPopulares = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    // Validação básica no frontend
    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }
    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(senha)) {
      setErro('A senha deve conter pelo menos 1 número.');
      setLoading(false);
      return;
    }
    if (!(/[A-Z]/.test(senha) || /[^a-zA-Z0-9]/.test(senha))) {
      setErro('A senha deve conter pelo menos 1 letra maiúscula ou 1 caractere especial.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome_familia: nome, email, senha }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        // Se não for possível fazer o parse do JSON
        setErro('Erro inesperado. Tente novamente mais tarde.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        // Erros conhecidos do backend
        if (response.status === 409) {
          setErro('Este email já está cadastrado.');
        } else if (response.status === 400) {
          setErro(data.message || 'Preencha todos os campos obrigatórios.');
        } else {
          setErro(data.message || 'Erro ao criar conta. Tente novamente.');
        }
        setLoading(false);
        return;
      }

      // Redirecionar para a tela de criação do primeiro perfil após registro bem-sucedido
      navigate('/criar-primeiro-perfil', { state: { userId: data.userId } });
      
    } catch (error) {
      if (error.name === 'TypeError') {
        setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        setErro(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Criar Conta</h2>
        {erro && <div className="erro-mensagem">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Família:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
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
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
        <button onClick={() => navigate('/')} className="btn-link">
          Já tem uma conta? Faça login
        </button>
      </div>
    </div>
  );
}

export default Registro; 