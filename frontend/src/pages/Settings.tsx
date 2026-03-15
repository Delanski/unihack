import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); 

    <section>
    <h2>Account</h2>
    <button onClick={() => { logout(); navigate('/login'); }}>
        Log Out
    </button>
    </section>

  const handle = (endpoint: string, body: object, optimistic?: Partial<typeof user>) =>
    async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus(null);
      setError(null);
      try {
        const res = await apiFetch(endpoint, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message ?? 'Update failed');
        }
        if (optimistic) updateUser(optimistic);
        setStatus('Updated successfully');
      } catch (err: any) {
        setError(err.message);
      }
    };

  return (
    <div>
      <h1>Settings</h1>

      <section>
        <h2>Change Username</h2>
        <form onSubmit={(e) => {
          const username = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value;
          handle('/user/update/username', { username }, { username })(e);
        }}>
          <input name="username" placeholder="New username" defaultValue={user?.username} required />
          <button type="submit">Save</button>
        </form>
      </section>

      <section>
        <h2>Change Email</h2>
        <form onSubmit={(e) => {
          const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
          handle('/user/update/email', { email }, { email })(e);
        }}>
          <input name="email" type="email" placeholder="New email" defaultValue={user?.email} required />
          <button type="submit">Save</button>
        </form>
      </section>

      <section>
        <h2>Change Password</h2>
        <form onSubmit={(e) => {
          const oldPassword = (e.currentTarget.elements.namedItem('oldPassword') as HTMLInputElement).value;
          const newPassword = (e.currentTarget.elements.namedItem('newPassword') as HTMLInputElement).value;
          handle('/user/update/password', { oldPassword, newPassword })(e);
        }}>
          <input name="oldPassword" type="password" placeholder="Current password" required />
          <input name="newPassword" type="password" placeholder="New password" required />
          <button type="submit">Save</button>
        </form>
      </section>

      {status && <p style={{ color: 'green' }}>{status}</p>}
      {error  && <p style={{ color: 'red'   }}>{error}</p>}
    </div>
  );
}