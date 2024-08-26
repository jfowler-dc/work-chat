import React, { useRef, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';


const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
    } catch {
      setError('Failed to sign in');
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Log In</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" ref={emailRef} required placeholder="Email" />
        <input type="password" ref={passwordRef} required placeholder="Password" />
        <button disabled={loading} type="submit">Log In</button>
      </form>
      <Link to="/signup">Sign Up</Link>
    </div>
  );
};

export default Login;
