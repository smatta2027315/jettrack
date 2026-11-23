import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [savingUserID, setSavingUserID] = useState(null);

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

  async function assignRole(userID, role) {
    setAssignmentError('');
    setSavingUserID(userID);

    try {
      const response = await fetch(`/api/users/${userID}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Unable to assign role (${response.status})`);
      }

      setUsers((currentUsers) => currentUsers.map((user) => (
        user.userID === result.user.userID ? result.user : user
      )));
    } catch (err) {
      setAssignmentError(err.message || 'Unable to assign role.');
    } finally {
      setSavingUserID(null);
    }
  }

  return (
    <section className="users-page">
      <h1>Users</h1>
      <p>Assign a role to each new account to enable its dashboard.</p>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error" role="alert">{error}</p>
      ) : (
        <>
          {assignmentError && <p className="error" role="alert">{assignmentError}</p>}
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Assign role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userID ?? user.userid ?? user.email}>
                      <td>{[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}</td>
                      <td>{user.email}</td>
                      <td>{user.role || 'Unassigned'}</td>
                      <td>{user.accountStatus || '—'}</td>
                      <td>
                        {!user.role && user.accountStatus === 'pending' ? (
                          <div className="user-role-actions">
                            {['Cadet', 'Cadet Leader', 'Instructor'].map((role) => (
                              <button
                                key={role}
                                type="button"
                                disabled={savingUserID !== null}
                                onClick={() => assignRole(user.userID, role)}
                              >
                                {savingUserID === user.userID ? `Assigning ${role}...` : role}
                              </button>
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
