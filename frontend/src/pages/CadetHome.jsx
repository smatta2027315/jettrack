


import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CadetHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cadet Dashboard Buttons
  const dashboardButtons = [
    {
      title: "CADET PROFILE",
      image: "/images/cadet-profile.png",
      path: "/cadet-profiles",
    },
    {
      title: "CADET RECORD",
      image: "/images/cadet-records.png",
      path: "/cadet-records",
    },
  ];

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

  // Only Cadets can access this dashboard
  if (user.role !== "Cadet") {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="leader-home">

      {/* Sidebar */}
      <aside className="leader-sidebar">

        <div className="sidebar-logo">
          <h2>JET</h2>
          <h2>TRACK</h2>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">

          <button
            title="Dashboard"
            onClick={() => navigate('/')}
          >
            🏠
          </button>

          <button
            title="My Profile"
            onClick={() => navigate('/cadet-profiles')}
          >
            👤
          </button>

          <button
            title="Settings"
            onClick={() => navigate('/users')}
          >
            ⚙️
          </button>

          <button
            title="Log Out"
            onClick={handleLogout}
          >
            ↪
          </button>

        </nav>
      </aside>

      {/* Main Dashboard */}
      <main className="leader-main">

        {/* Welcome Header */}
        <header className="leader-header">

          <div className="jet-track-logo">
            <h1>JET TRACK</h1>
          </div>

          <h2>
            INTEGRITY - SERVICE - EXCELLENCE
          </h2>

        </header>

        {/* Welcome Message */}
        <div className="leader-welcome">

          <p>
            Welcome back, {user.first_name}!
          </p>

          <span>{user.role}</span>

        </div>

        {/* Two Cadet Dashboard Buttons */}
        <section className="cadet-grid">

          {dashboardButtons.map((item) => (

            <button
              className="leader-card"
              key={item.path}
              onClick={() => navigate(item.path)}
            >

              <img
                src={item.image}
                alt={item.title}
                className="leader-card-image"
              />

              <span className="leader-card-title">
                {item.title}
              </span>

            </button>

          ))}

        </section>

      </main>
    </div>
  );
}
