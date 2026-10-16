import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-box">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Login</button>
      </form>
      {error && <div className="error">{error}</div>}

    </div>
  );
}
