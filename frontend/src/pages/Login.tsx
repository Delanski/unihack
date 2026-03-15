import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    try {
      await login(
        (form.elements.namedItem('loginForm') as HTMLInputElement).value,
        (form.elements.namedItem('password') as HTMLInputElement).value,
      );
      navigate('/todo');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="loginForm" placeholder="Email or username" required />
      <input name="password" type="password" placeholder="Password" required />
      {error && <p>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
      <Link to="/register">Don't have an account? Register</Link>
    </form>
  );
}