"use client";
import React, { useState } from 'react';
import { apiFetch } from '../apiClient';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup') {
      try {
        await apiFetch('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, role })
        });
        setMode('login');
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        setToken(data.token);
        // Optionally store user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ id: data.id, username, role: data.role }));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: '40px auto', padding: 32, border: '1px solid #eee', borderRadius: 8 }}>
      <h1>{mode === 'login' ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%' }} />
        </div>
        {mode === 'signup' && (
          <div style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%' }} />
        </div>
        {mode === 'signup' && (
          <div style={{ marginBottom: 16 }}>
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%' }}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
        <button type="submit" style={{ width: '100%', padding: 8 }}>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
      {token && <p style={{ color: 'green', marginTop: 16 }}>Logged in! JWT: {token}</p>}
      <div style={{ marginTop: 24 }}>
        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ width: '100%' }}>
          {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </main>
  );
};

export default AuthPage;
