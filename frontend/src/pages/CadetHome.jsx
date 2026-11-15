

import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';


export default function CadetHome() {
  const { user } = useAuth();
  const navigate = useNavigate();


  // Log out the current user
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      navigate('/login', { replace: true });
    }
  }


  // Display loading message if user information is unavailable
  if (!user) {
    return <p>Loading Cadet Dashboard...</p>;
  }


  return (
    <div className="dashboard">


      {/* Sidebar */}
      <aside className="sidebar">
        <h2>JET TRACK</h2>


        <p>Cadet Portal</p>


        <nav>
          <a href="#overview">Dashboard</a>
          <a href="#profile">My Profile</a>
          <a href="#fitness">Fitness Records</a>
          <a href="#service">Service Hours</a>
          <a href="#awards">Awards</a>
          <a href="#promotions">Promotions</a>
          <a href="#events">Events</a>
        </nav>


        <button onClick={handleLogout}>
          Log Out
        </button>
      </aside>


      {/* Main Dashboard */}
      <main className="dashboard-content">


        {/* Welcome Header */}
        <header className="dashboard-header" id="overview">
          <div>
            <h1>Cadet Dashboard</h1>


            <p>
              Welcome back, {user.first_name}!
            </p>
          </div>


          <span className="role-badge">
            {user.role}
          </span>
        </header>


        {/* Dashboard Sections */}
        <section className="dashboard-grid">


          {/* Profile */}
          <article className="dashboard-card" id="profile">
            <h3>My Profile</h3>


            <p>View your personal and cadet information.</p>


            <p>
              <strong>Name:</strong>{' '}
              {user.first_name} {user.last_name}
            </p>


            <p>
              <strong>Email:</strong> {user.email}
            </p>


            <p>
              <strong>Account Status:</strong>{' '}
              {user.accountStatus}
            </p>
          </article>


          {/* Fitness */}
          <article className="dashboard-card" id="fitness">
            <h3>Fitness Records</h3>
            <p>Review your fitness assessment results.</p>
          </article>


          {/* Service Hours */}
          <article className="dashboard-card" id="service">
            <h3>Service Hours</h3>
            <p>Track your community service contributions.</p>
          </article>


          {/* Awards */}
          <article className="dashboard-card" id="awards">
            <h3>Awards</h3>
            <p>View your earned awards and decorations.</p>
          </article>


          {/* Promotions */}
          <article className="dashboard-card" id="promotions">
            <h3>Promotions</h3>
            <p>Review your promotion history.</p>
          </article>


          {/* Events */}
          <article className="dashboard-card" id="events">
            <h3>Events</h3>
            <p>Explore unit events and activities.</p>
          </article>


        </section>
      </main>
    </div>
  );
}


