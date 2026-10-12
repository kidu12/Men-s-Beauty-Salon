import React, { useState } from 'react';
import Toast from '../components/Toast';
import Header from '../components/Header';
import { API_BASE_URL } from '../config/api';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const messageData = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      setSubmitted(true);
      setToast({ message: 'Message Sent Successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error sending message.', type: 'error' });
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '130px 20px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <h1 className="gold-text" style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '60px' }}>Contact <span className="text-white">Us</span></h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
        {/* Contact Info */}
        <div className="fade-in">
          <h2 style={{ marginBottom: '30px' }}>Get in Touch with the <span className="gold-text">Manager</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Have questions about our services or want to partner with us? Our management team is here to help.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass" style={{ padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent)' }}>Direct Phone</h3>
              <p>+2519-11-28-27-84</p>
            </div>
            <div className="glass" style={{ padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent)' }}>Email Address</h3>
              <p>teddykefale470@gmail.com</p>
            </div>
            <div className="glass" style={{ padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent)' }}>Our Location</h3>
              <p>Addis Ababa, Ayat 49 condominium</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass fade-in" style={{ padding: '40px', borderRadius: 'var(--card-radius)', animationDelay: '0.2s' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h2 className="gold-text">Message Sent!</h2>
              <p>Our manager will get back to you shortly.</p>
              <button
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '20px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '10px 20px', borderRadius: '8px' }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Your Name</label>
                <input required name="name" type="text" style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Your Email</label>
                <input required name="email" type="email" style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Message</label>
                <textarea required name="message" style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px', minHeight: '150px' }}></textarea>
              </div>
              <button
                type="submit"
                style={{ padding: '15px', background: 'var(--accent)', color: 'black', fontWeight: 'bold', borderRadius: '8px', textTransform: 'uppercase' }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      <div style={{ marginTop: '80px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Back to Home</a>
      </div>
    </div>
  </div>
);
};

export default Contact;
