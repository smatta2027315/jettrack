
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
    <div className="login-page">

      <div className="login-box">

        <h1>JET TRACK</h1>

        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Sign in to access your account
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

      </div>

    </div>
  );
}
