import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to A Studious Slice (of life)</h1>
      <p>Pomme is waiting!</p>

      {user ? (
        <Link to="/todo">Go to Dashboard</Link>
      ) : (
        <>
          <Link to="/register">Get Started</Link>
          <Link to="/login">Log In</Link>
        </>
      )}
    </div>
  );
}