import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/admin');
      } else {
        alert(data.message || 'Invalid credentials!');
      }
    } catch (error) {
      alert('Error connecting to server');
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'var(--bg-primary)'
    }}>
      <form onSubmit={handleLogin} className="glass" style={{ 
        padding: '40px', 
        borderRadius: 'var(--card-radius)', 
        width: '100%', 
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2 className="gold-text" style={{ textAlign: 'center', marginBottom: '10px' }}>Admin Login</h2>
        <div>
          <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' }}
            placeholder="admin"
          />
        </div>
        <div>
          <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' }}
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit" 
          style={{ 
            padding: '15px', 
            background: 'var(--accent)', 
            color: 'black', 
            fontWeight: 'bold', 
            borderRadius: '8px',
            marginTop: '10px'
          }}
        >
          LOG IN
        </button>
      </form>
    </div>
  );
};

export default Login;
