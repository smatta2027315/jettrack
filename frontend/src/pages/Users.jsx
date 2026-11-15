import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users', { credentials: 'include' });
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || `Unable to load users (${response.status})`);
        }

        const result = await response.json();
        if (!Array.isArray(result)) {
          throw new Error('The server returned an invalid users response.');
        }

        setUsers(result);
      } catch (err) {
        setError(err.message || 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <section className="users-page">
      <h1>Users</h1>
      <p>Manage users</p>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error" role="alert">{error}</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userID ?? user.userid ?? user.email}>
                  <td>{[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td>{user.email}</td>
                  <td>{user.role || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
