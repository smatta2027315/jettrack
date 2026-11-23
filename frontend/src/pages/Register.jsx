import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstname] = useState('');
  const [last_name, setLastname] = useState('');
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ email, password, first_name, last_name });
      setRegistered(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-box">
      <h2>Register</h2>
      {registered ? (
        <p role="status">
          Account created. An instructor must assign your role before you can access a dashboard.{' '}
          <Link to="/login">Sign in</Link>
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <input value={first_name} onChange={e=>setFirstname(e.target.value)} placeholder="First name" />
            <input value={last_name} onChange={e=>setLastname(e.target.value)} placeholder="Last name" />
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
            <button type="submit">Register</button>
          </form>
          {error && <div className="error" role="alert">{error}</div>}
        </>
      )}
    </div>
  );
}
