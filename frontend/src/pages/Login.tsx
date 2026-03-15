import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';
import bg from '../assets/backgrounds/pomme_room.png';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(
        (e.currentTarget.elements.namedItem('loginForm') as HTMLInputElement).value,
        (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value,
      );
      navigate('/menu');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <img src={bg} alt="background" className={styles.bg} />
      <div className={styles.overlay} />

      <div className={styles.panel}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            name="loginForm"
            placeholder="Email or username"
            required
          />
          <input
            className={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.link}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.anchor}>Register</Link>
        </p>
      </div>
    </div>
  );
}