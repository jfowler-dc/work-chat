import React, { useRef, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';

const Signup = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
    } catch {
      setError('Failed to create an account');
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" ref={emailRef} required placeholder="Email" />
        <input type="password" ref={passwordRef} required placeholder="Password" />
        <input type="password" ref={passwordConfirmRef} required placeholder="Confirm Password" />
        <button disabled={loading} type="submit">Sign Up</button>
      </form>
      <Link to="/login">Login</Link>
    </div>
  );
};

export default Signup;
