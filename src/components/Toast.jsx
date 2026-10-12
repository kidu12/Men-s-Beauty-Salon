import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      background: type === 'success' ? 'var(--accent)' : '#ef4444',
      color: type === 'success' ? 'black' : 'white',
      padding: '16px 32px',
      borderRadius: '12px',
      fontWeight: 'bold',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 2000,
      animation: 'fadeInUp 0.4s ease forwards',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '1.2rem' }}>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
};

export default Toast;
