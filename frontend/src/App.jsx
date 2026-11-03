import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CadetHome from './pages/CadetHome';
import LeaderHome from './pages/LeaderHome';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>&nbsp;
          {user ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>&nbsp;
              <Link to="/register">Register</Link>
            </>
          )}
          <hr/>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'Cadet' ? (
                <CadetHome />
              ) : ['Instructor', 'Cadet Leader'].includes(user?.role) ? (
                <LeaderHome />
              ) : (
                <p>unregistered (role: {user?.role ?? 'unknown'})</p>
              )}
            </ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;