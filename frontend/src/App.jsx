
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';


import Login from './pages/Login';
import Register from './pages/Register';
import CadetHome from './pages/CadetHome';
import LeaderHome from './pages/LeaderHome';
import ProtectedRoute from './ProtectedRoute';


import CadetProfiles from './pages/CadetProfiles';
import CadetRecords from './pages/CadetRecords';
import EventsService from './pages/EventsService';
import AwardsPromotions from './pages/AwardsPromotions';
import FitnessManagement from './pages/FitnessManagement';
import Users from './pages/Users';


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


          <hr />
        </nav>
      </header>


      <main>
        <Routes>
          {/* Main Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {!user?.role ? (
                  <p>Your account is awaiting role assignment by an instructor. Refresh this page after your role has been assigned.</p>
                ) : user.role === 'Cadet' ? (
                  <CadetHome />
                ) : ['Instructor', 'Cadet Leader'].includes(user.role) ? (
                  <LeaderHome />
                ) : (
                  <p>Unregistered (role: {user.role})</p>
                )}
              </ProtectedRoute>
            }
          />


          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          {/* Cadet Management */}
          <Route path="/cadet-profiles" element={<CadetProfiles />} />
          <Route path="/cadet-records" element={<CadetRecords />} />


          {/* Events and Service */}
          <Route path="/events-service" element={<EventsService />} />


          {/* Awards and Promotions */}
          <Route path="/awards-promotions" element={<AwardsPromotions />} />


          {/* Fitness Management */}
          <Route path="/fitness-management" element={<FitnessManagement />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                {user?.role === 'Instructor' ? <Users /> : <p>You do not have permission to view this page.</p>}
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}


export default App;


