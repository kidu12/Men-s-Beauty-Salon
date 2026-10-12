import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePromotions } from '../hooks/usePromotions';
import Toast from '../components/Toast';
import Header from '../components/Header';
import { API_BASE_URL } from '../config/api';
import './Admin.css';

const API = API_BASE_URL;

const Admin = () => {
  const { promotions, addPromotion, deletePromotion } = usePromotions();
  const [activeTab, setActiveTab] = useState('services');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ─── Services ─────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [svcForm, setSvcForm] = useState({ name: '', duration: 30, category: 'HAIR', price: '', description: '' });
  const [svcFile, setSvcFile] = useState(null);
  const [editingSvc, setEditingSvc] = useState(null);
  const svcFileRef = useRef();

  const fetchServices = () =>
    fetch(`${API}/api/services`).then(r => r.json()).then(setServices).catch(console.error);

  // ─── Barbers ──────────────────────────────────────────
  const [barbers, setBarbers] = useState([]);
  const [barberForm, setBarberForm] = useState({ name: '', role: 'Barber', rating: 9.0, years: '5+' });
  const [barberFile, setBarberFile] = useState(null);
  const [editingBarber, setEditingBarber] = useState(null);
  const barberFileRef = useRef();

  const fetchBarbers = () =>
    fetch(`${API}/api/barbers`).then(r => r.json()).then(setBarbers).catch(console.error);

  // ─── Bookings ─────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const fetchBookings = () =>
    fetch(`${API}/api/bookings`).then(r => r.json()).then(setBookings).catch(console.error);

  // ─── Slot Blocks ──────────────────────────────────────
  const [slotBlocks, setSlotBlocks] = useState([]);
  const [slotDate, setSlotDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  const fetchSlotBlocks = () =>
    fetch(`${API}/api/slot_blocks`).then(r => r.json()).then(setSlotBlocks).catch(console.error);

  const TIME_SLOTS = [
    '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
    '12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
    '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM',
    '6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM',
  ];

  // ─── Promotions ───────────────────────────────────────
  const [promoForm, setPromoForm] = useState({ title: '', type: 'photo', description: '' });
  const [promoFile, setPromoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeTab === 'services') fetchServices();
    if (activeTab === 'barbers') fetchBarbers();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'schedule') fetchSlotBlocks();
  }, [activeTab]);

  useEffect(() => {
    if (!slotDate) return;
    const blocked = new Set(slotBlocks.filter(b => b.date === slotDate).map(b => b.time));
    setSelectedSlots(blocked);
  }, [slotDate, slotBlocks]);

  // ─── Service handlers ─────────────────────────────────
  const handleSvcSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', svcForm.name);
    fd.append('duration', svcForm.duration);
    fd.append('category', svcForm.category);
    fd.append('price', svcForm.price);
    fd.append('description', svcForm.description);
    if (svcFile) fd.append('image', svcFile);
    try {
      if (editingSvc) {
        await fetch(`${API}/api/services/${editingSvc.id}`, { method: 'PUT', body: fd });
        showToast('Service updated!');
      } else {
        await fetch(`${API}/api/services`, { method: 'POST', body: fd });
        showToast('Service added!');
      }
      setSvcForm({ name: '', duration: 30, category: 'HAIR', price: '', description: '' });
      setSvcFile(null); setEditingSvc(null);
      if (svcFileRef.current) svcFileRef.current.value = '';
      fetchServices();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const startEditSvc = (svc) => {
    setEditingSvc(svc);
    setSvcForm({ name: svc.name, duration: svc.duration, category: svc.category, price: svc.price || '', description: svc.description || '' });
    setSvcFile(null);
    if (svcFileRef.current) svcFileRef.current.value = '';
    document.getElementById('svc-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteSvc = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await fetch(`${API}/api/services/${id}`, { method: 'DELETE' });
    showToast('Service deleted.'); fetchServices();
  };

  // ─── Barber handlers ──────────────────────────────────
  const handleBarberSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    // Auto-generate initials from name (first 2 chars, uppercased)
    const autoInitials = barberForm.name.trim().slice(0, 2).toUpperCase();
    Object.entries(barberForm).forEach(([k, v]) => fd.append(k, v));
    fd.append('initials', autoInitials);
    if (barberFile) fd.append('photo', barberFile);

    try {
      if (editingBarber) {
        await fetch(`${API}/api/barbers/${editingBarber.id}`, { method: 'PUT', body: fd });
        showToast('Barber updated!');
      } else {
        await fetch(`${API}/api/barbers`, { method: 'POST', body: fd });
        showToast('Barber added!');
      }
      setBarberForm({ name: '', role: 'Barber', rating: 9.0, years: '5+' });
      setBarberFile(null); setEditingBarber(null);
      if (barberFileRef.current) barberFileRef.current.value = '';
      fetchBarbers();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const startEditBarber = (b) => {
    setEditingBarber(b);
    setBarberForm({ name: b.name, role: b.role, rating: b.rating, years: b.years });
    setBarberFile(null);
    if (barberFileRef.current) barberFileRef.current.value = '';
    document.getElementById('barber-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleBarberActive = async (b) => {
    const fd = new FormData();
    fd.append('name', b.name); fd.append('role', b.role); fd.append('initials', b.initials);
    fd.append('rating', b.rating); fd.append('years', b.years);
    fd.append('active', b.active === 1 ? 0 : 1);
    if (b.photo_url) fd.append('photo_url', b.photo_url);
    await fetch(`${API}/api/barbers/${b.id}`, { method: 'PUT', body: fd });
    showToast(`${b.name} is now ${b.active === 1 ? 'unavailable' : 'available'}.`);
    fetchBarbers();
  };

  const deleteBarber = async (id) => {
    if (!window.confirm('Delete this barber?')) return;
    await fetch(`${API}/api/barbers/${id}`, { method: 'DELETE' });
    showToast('Barber deleted.'); fetchBarbers();
  };

  // ─── Slot handlers ────────────────────────────────────
  const toggleSlot = async (time) => {
    if (!slotDate) { showToast('Select a date first.', 'error'); return; }
    const isBlocked = selectedSlots.has(time);
    if (isBlocked) {
      await fetch(`${API}/api/slot_blocks?date=${slotDate}&time=${encodeURIComponent(time)}`, { method: 'DELETE' });
      showToast(`${time} is now open.`);
    } else {
      await fetch(`${API}/api/slot_blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: slotDate, time }),
      });
      showToast(`${time} is now blocked.`);
    }
    fetchSlotBlocks();
  };

  // ─── Booking handlers ─────────────────────────────────
  const deleteBooking = async (id) => {
    await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE' });
    setBookings(prev => prev.filter(b => b.id !== id));
    showToast('Booking removed.');
  };

  // ─── Promo handlers ───────────────────────────────────
  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    if (!promoForm.title || !promoFile) { showToast('Title and file required.', 'error'); return; }
    const fd = new FormData();
    fd.append('title', promoForm.title); fd.append('type', promoForm.type);
    fd.append('description', promoForm.description); fd.append('file', promoFile);
    setUploading(true);
    try {
      const result = await addPromotion(fd);
      if (result) {
        showToast('Promotion added!');
        setPromoForm({ title: '', type: 'photo', description: '' });
        setPromoFile(null); e.target.reset();
      } else showToast('Failed to add promotion.', 'error');
    } catch { showToast('Error uploading.', 'error'); }
    finally { setUploading(false); }
  };

  const TABS = [
    { id: 'services', label: '✂ Services' },
    { id: 'barbers', label: '💈 Barbers' },
    { id: 'schedule', label: '📅 Schedule' },
    { id: 'bookings', label: '📋 Bookings' },
    { id: 'promotions', label: '🖼 Promotions' },
  ];

  const CATEGORIES = ['HAIR', 'HAIRCARE', 'HAIR STYLE', 'GROOMING', 'SKINCARE', 'PREMIUM'];

  return (
    <div className="admin-container">
      <Header onBooking={() => {}} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Portal</h1>
            <p className="admin-subtitle">Manage services, barbers, schedule &amp; promotions</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <div className="admin-tabs">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SERVICES ── */}
        {activeTab === 'services' && (
          <div className="mgmt-layout">
            <section className="mgmt-form-card" id="svc-form-section">
              <h2 className="mgmt-form-title">{editingSvc ? '✏️ Edit Service' : '+ Add Service'}</h2>
              <form onSubmit={handleSvcSubmit} className="mgmt-form">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input required value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} placeholder="e.g. VIP Haircut" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (mins) *</label>
                    <input required type="number" min="5" value={svcForm.duration} onChange={e => setSvcForm({ ...svcForm, duration: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={svcForm.category} onChange={e => setSvcForm({ ...svcForm, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input value={svcForm.price} onChange={e => setSvcForm({ ...svcForm, price: e.target.value })} placeholder="e.g. 3,500" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} placeholder="Short description of the service" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Service Image (from gallery)</label>
                  <div className="file-input-wrapper">
                    <input ref={svcFileRef} type="file" accept="image/*" id="svc-file-input" onChange={e => setSvcFile(e.target.files[0])} />
                    <label htmlFor="svc-file-input" className="file-input-label">{svcFile ? svcFile.name : '📷 Choose Image'}</label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">{editingSvc ? 'Update Service' : 'Add Service'}</button>
                  {editingSvc && <button type="button" className="cancel-btn" onClick={() => { setEditingSvc(null); setSvcForm({ name: '', duration: 30, category: 'HAIR', price: '', description: '' }); }}>Cancel</button>}
                </div>
              </form>
            </section>

            <section className="mgmt-list-card">
              <div className="list-header"><h2>All Services</h2><span className="count-badge">{services.length}</span></div>
              {services.length === 0 ? (
                <div className="empty-state"><p>No services yet. Add one!</p></div>
              ) : (
                <div className="mgmt-item-list">
                  {services.map(svc => (
                    <div key={svc.id} className="mgmt-item">
                      <div className="mgmt-item-img">
                        <img src={svc.image_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=100'} alt={svc.name} />
                      </div>
                      <div className="mgmt-item-info">
                        <div className="mgmt-item-name">{svc.name}</div>
                        <div className="mgmt-item-meta">⏱ {svc.duration} min · <span className="badge">{svc.category}</span> · {svc.price ? `ETB ${svc.price}` : 'No Price'}</div>
                      </div>
                      <div className="mgmt-item-actions">
                        <button className="edit-btn" onClick={() => startEditSvc(svc)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteSvc(svc.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── BARBERS ── */}
        {activeTab === 'barbers' && (
          <div className="mgmt-layout">
            <section className="mgmt-form-card" id="barber-form-section">
              <h2 className="mgmt-form-title">{editingBarber ? '✏️ Edit Barber' : '+ Add Barber'}</h2>
              <form onSubmit={handleBarberSubmit} className="mgmt-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={barberForm.name} onChange={e => setBarberForm({ ...barberForm, name: e.target.value })} placeholder="e.g. John" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input value={barberForm.role} onChange={e => setBarberForm({ ...barberForm, role: e.target.value })} placeholder="Barber" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rating (0–10)</label>
                    <input type="number" min="0" max="10" step="0.1" value={barberForm.rating} onChange={e => setBarberForm({ ...barberForm, rating: parseFloat(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>Experience</label>
                    <input value={barberForm.years} onChange={e => setBarberForm({ ...barberForm, years: e.target.value })} placeholder="5+" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Profile Photo (from gallery)</label>
                  <div className="file-input-wrapper">
                    <input ref={barberFileRef} type="file" accept="image/*" id="barber-file-input" onChange={e => setBarberFile(e.target.files[0])} />
                    <label htmlFor="barber-file-input" className="file-input-label">{barberFile ? barberFile.name : '📷 Choose Photo'}</label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">{editingBarber ? 'Update Barber' : 'Add Barber'}</button>
                  {editingBarber && <button type="button" className="cancel-btn" onClick={() => { setEditingBarber(null); setBarberForm({ name: '', role: 'Barber', rating: 9.0, years: '5+' }); }}>Cancel</button>}
                </div>
              </form>
            </section>

            <section className="mgmt-list-card">
              <div className="list-header"><h2>All Barbers</h2><span className="count-badge">{barbers.length}</span></div>
              {barbers.length === 0 ? (
                <div className="empty-state"><p>No barbers yet. Add one!</p></div>
              ) : (
                <div className="mgmt-item-list">
                  {barbers.map(b => (
                    <div key={b.id} className={`mgmt-item ${b.active !== 1 ? 'mgmt-item-inactive' : ''}`}>
                      <div className="mgmt-barber-avatar">
                        {b.photo_url ? <img src={b.photo_url} alt={b.name} /> : <span>{b.initials}</span>}
                      </div>
                      <div className="mgmt-item-info">
                        <div className="mgmt-item-name">{b.name}</div>
                        <div className="mgmt-item-meta">💈 {b.role} · ⭐ {b.rating} · {b.years} yrs</div>
                      </div>
                      <div className="mgmt-item-actions">
                        <button className={`toggle-btn ${b.active === 1 ? 'toggle-on' : 'toggle-off'}`} onClick={() => toggleBarberActive(b)}>
                          {b.active === 1 ? '🟢 Available' : '🔴 Unavailable'}
                        </button>
                        <button className="edit-btn" onClick={() => startEditBarber(b)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteBarber(b.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <div className="schedule-header">
              <h2>Manage Time Slots</h2>
              <p className="admin-subtitle">Select a date, then click slots to block or unblock them. Blocked slots won&apos;t show as available for customers — perfect for walk-ins or closed hours.</p>
            </div>
            <div className="schedule-date-picker">
              <label className="schedule-label">SELECT DATE</label>
              <input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)} className="schedule-date-input" style={{ colorScheme: 'dark' }} />
            </div>
            {slotDate ? (
              <div className="schedule-slots-container">
                <div className="schedule-legend">
                  <span className="legend-item"><span className="legend-dot available"></span>Open</span>
                  <span className="legend-item"><span className="legend-dot blocked"></span>Blocked</span>
                </div>
                <div className="schedule-slots-grid">
                  {TIME_SLOTS.map(slot => {
                    const isBlocked = selectedSlots.has(slot);
                    return (
                      <button key={slot} onClick={() => toggleSlot(slot)} className={`schedule-slot ${isBlocked ? 'schedule-slot-blocked' : 'schedule-slot-available'}`}>
                        {slot}
                        <span className="slot-status">{isBlocked ? '✕ Blocked' : '✓ Open'}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="schedule-summary">
                  <span>📅 {slotDate}</span>
                  <span>🔴 {selectedSlots.size} blocked · 🟢 {TIME_SLOTS.length - selectedSlots.size} open</span>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: '40px' }}><p>👆 Select a date above to manage its time slots.</p></div>
            )}
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <div className="section-header-admin"><h2>Appointments</h2><span className="count-badge">{bookings.length}</span></div>
            {bookings.length === 0 ? (
              <div className="empty-state"><p>No bookings yet.</p></div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-details">
                      <h3 style={{ color: '#C9915C', marginBottom: '10px' }}>{booking.name}</h3>
                      <div className="booking-info-grid">
                        <div><span className="label">Service</span><p>{booking.service}</p></div>
                        <div><span className="label">Date &amp; Time</span><p>{booking.date} at {booking.time}</p></div>
                        <div><span className="label">Barber</span><p>{booking.barber || 'Any Barber'}</p></div>
                        <div><span className="label">Phone</span><p>{booking.phone}</p></div>
                        {booking.transaction_ref && (
                          <div style={{ gridColumn: '1 / -1', background: 'rgba(201, 145, 92, 0.1)', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #C9915C' }}>
                            <span className="label" style={{ color: '#C9915C' }}>Transaction Reference</span>
                            <p style={{ margin: '5px 0 0', fontWeight: 'bold', letterSpacing: '1px' }}>{booking.transaction_ref}</p>
                          </div>
                        )}
                        {booking.notes && <div style={{ gridColumn: '1 / -1' }}><span className="label">Notes</span><p>{booking.notes}</p></div>}
                      </div>
                    </div>
                    <button onClick={() => deleteBooking(booking.id)} className="delete-btn">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROMOTIONS ── */}
        {activeTab === 'promotions' && (
          <div className="promotions-section">
            <section className="promo-form-container">
              <div className="form-header"><h2>Add New Promotion</h2><p>Upload videos and images to showcase your services</p></div>
              <form onSubmit={handleSubmitPromo} className="promo-form">
                <div className="form-group">
                  <label>Promotion Title *</label>
                  <input type="text" value={promoForm.title} onChange={e => setPromoForm({ ...promoForm, title: e.target.value })} placeholder="e.g. Summer Fade Special" required />
                </div>
                <div className="form-group">
                  <label>Media Type *</label>
                  <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value })}>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Select File *</label>
                  <div className="file-input-wrapper">
                    <input type="file" accept={promoForm.type === 'photo' ? 'image/*' : 'video/*'} onChange={e => setPromoFile(e.target.files[0])} id="promo-file-input" />
                    <label htmlFor="promo-file-input" className="file-input-label">{promoFile ? promoFile.name : '📷 Choose File'}</label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Short Description</label>
                  <textarea value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })} placeholder="Tell customers about this style..." rows="4" />
                </div>
                <button type="submit" disabled={uploading} className="submit-btn">{uploading ? 'UPLOADING...' : 'Add Promotion'}</button>
              </form>
            </section>
            <section className="promo-list-container">
              <div className="list-header"><h2>Live Promotions</h2><span className="promo-count">{promotions.length} Total</span></div>
              {promotions.length === 0 ? <div className="empty-state"><p>No promotions yet.</p></div> : (
                <div className="promo-grid">
                  {promotions.map(promo => (
                    <div key={promo.id} className="promo-item">
                      <div className="promo-media">
                        {promo.type === 'video' ? <video src={promo.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={promo.url} alt={promo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        <span className="media-badge">{promo.type.toUpperCase()}</span>
                      </div>
                      <div className="promo-info"><h3>{promo.title}</h3><p>{promo.description}</p><button onClick={() => deletePromotion(promo.id)} className="delete-btn">Delete</button></div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

