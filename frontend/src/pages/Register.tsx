import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Register.module.css';
import bg from '../assets/backgrounds/pomme_room.png';

interface Props {
  onLogin: () => void;
}

export default function Register({ onLogin }: Props) {
  const { register }          = useAuth();
  const navigate              = useNavigate();
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(
        (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value,
        (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value,
        (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value,
      );
      onLogin();
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
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join to get started</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            name="username"
            placeholder="Username"
            required
          />
          <input
            className={styles.input}
            name="email"
            type="email"
            placeholder="Email"
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
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className={styles.link}>
          Already have an account?{' '}
          <Link to="/login" className={styles.anchor}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}