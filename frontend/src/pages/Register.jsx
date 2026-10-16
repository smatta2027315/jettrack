import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ email, password, firstname, lastname });
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-box">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input value={firstname} onChange={e=>setFirstname(e.target.value)} placeholder="First name" />
        <input value={lastname} onChange={e=>setLastname(e.target.value)} placeholder="Last name" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Register</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
