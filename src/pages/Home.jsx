import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { usePromotions } from '../hooks/usePromotions';
import Toast from '../components/Toast';
import ceoImage from '../assets/ceo.png';
import logoImg from '../assets/logo.png';
import barberCraftImg from '../assets/barber_craft.jpg';
import barberInteriorImg from '../assets/barber_interior.jpg';
import { API_BASE_URL } from '../config/api';
import './Home.css';

const BOOKING_SERVICES = [
  { id: 1, name: 'VIP', duration: 60, category: 'PREMIUM' },
  { id: 2, name: 'Haircut', duration: 30, category: 'HAIR' },
  { id: 3, name: 'Hair Cut With Hair Wash', duration: 40, category: 'HAIRCARE' },
  { id: 4, name: 'Finger coils (ከርል)', duration: 45, category: 'HAIR STYLE' },
  { id: 5, name: 'Hair Wash', duration: 30, category: 'HAIRCARE' },
  { id: 6, name: 'Hair cut + Finger coils', duration: 60, category: 'HAIR STYLE' },
  { id: 7, name: 'Home to Home Service', duration: 120, category: 'PREMIUM', isHomeService: true },
];

const BARBERS = [
  { id: 0, name: 'Any Barber',  role: 'Next available professional', initials: '✦', isAny: true },
  { id: 1, name: 'John',        role: 'Barber', initials: 'JO', rating: 9.0,  years: '5+', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' },
  { id: 2, name: 'Michael',     role: 'Barber', initials: 'MI', rating: 9.5,  years: '8+', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { id: 3, name: 'David',       role: 'Barber', initials: 'DA', rating: 8.5,  years: '6+', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  { id: 4, name: 'Tedi',        role: 'Home Service Specialist', initials: 'TE', rating: 9.8,  years: '7+', photo_url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200' },
];

const TIME_SLOTS = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
  '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM',
  '6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM',
];



const Home = () => {
  const { promotions } = usePromotions();
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1=service, 2=barber, 3=datetime+details, 4=confirmed
  
  const [servicesList, setServicesList] = useState([]);
  const [barbersList, setBarbersList] = useState([]);
  const [slotBlocks, setSlotBlocks] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  
  const defaultAnyBarber = { id: 0, name: 'Any Barber', role: 'Next available professional', initials: '✦', isAny: true };
  const [selectedBarber, setSelectedBarber] = useState(defaultAnyBarber);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Fetch initial dynamic database records
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then(res => res.json())
      .then(data => setServicesList(data))
      .catch(err => console.error('Error fetching services:', err));

    fetch(`${API_BASE_URL}/api/barbers`)
      .then(res => res.json())
      .then(data => {
        // filter active barbers and apply placeholder photos if missing
        const activeBarbers = data.filter(b => b.active === 1).map(b => {
          if (!b.photo_url) {
            if (b.name === 'John') b.photo_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200';
            else if (b.name === 'Michael') b.photo_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
            else if (b.name === 'David') b.photo_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200';
            else if (b.name === 'Tedi') b.photo_url = 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200';
            else b.photo_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200';
          }
          return b;
        });
        setBarbersList([defaultAnyBarber, ...activeBarbers]);
      })
      .catch(err => console.error('Error fetching barbers:', err));

    fetch(`${API_BASE_URL}/api/slot_blocks`)
      .then(res => res.json())
      .then(data => setSlotBlocks(data))
      .catch(err => console.error('Error fetching slot blocks:', err));

    if (window.location.search.includes('book=true') || window.location.hash === '#booking') {
      setShowBooking(true);
    }
    if (window.location.hash && window.location.hash !== '#booking') {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  // Fetch bookings when the booking modal opens
  useEffect(() => {
    if (showBooking) {
      fetch(`${API_BASE_URL}/api/bookings`)
        .then(res => res.json())
        .then(data => setExistingBookings(data))
        .catch(err => console.error('Error fetching bookings:', err));
        
      fetch(`${API_BASE_URL}/api/slot_blocks`)
        .then(res => res.json())
        .then(data => setSlotBlocks(data))
        .catch(err => console.error('Error fetching slot blocks:', err));
    }
  }, [showBooking]);

  const isSlotTaken = (date, time) => {
    const isBooked = existingBookings.some(b => b.date === date && b.time === time);
    const isBlocked = slotBlocks.some(b => b.date === date && b.time === time);
    return isBooked || isBlocked;
  };

  const isHomeServiceChosen = (svc) => svc?.isHomeService || svc?.name?.toLowerCase().includes('home to home');

  const openBooking = (service = null) => {
    setSelectedService(service);
    if (isHomeServiceChosen(service)) {
      const tedi = barbersList.find(b => b.name?.toLowerCase() === 'tedi') || { id: 4, name: 'Tedi', role: 'Home Service Specialist', initials: 'TE', rating: 9.8, years: '7+', photo_url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200' };
      setSelectedBarber(tedi);
    } else {
      setSelectedBarber(defaultAnyBarber);
    }
    setSelectedDate('');
    setSelectedTime('');
    setBookingName('');
    setBookingPhone('');
    setBookingNotes('');
    setTransactionRef('');
    setBookingStep(service ? 2 : 1);
    setShowBooking(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !selectedDate || !selectedTime) return;
    const isHomeService = isHomeServiceChosen(selectedService);
    if (isHomeService && !transactionRef) {
      setToast({ message: 'Transaction Reference is required for Home Service.', type: 'error' });
      return;
    }
    
    const bookingData = {
      name: bookingName,
      phone: bookingPhone,
      service: selectedService?.name || 'General',
      date: selectedDate,
      time: selectedTime,
      barber: isHomeService ? 'Tedi' : (selectedBarber?.name || 'Any Barber'),
      notes: bookingNotes,
      transaction_ref: transactionRef || null,
    };
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Booking failed');
      setBookingStep(4);
      setToast({ message: 'Booking Confirmed! See you soon.', type: 'success' });
      
      // refresh existing bookings
      fetch(`${API_BASE_URL}/api/bookings`)
        .then(res => res.json())
        .then(data => setExistingBookings(data))
        .catch(err => console.error('Error fetching bookings:', err));
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Header onBooking={() => setShowBooking(true)} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Booking Modal */}
      {showBooking && (
        <div className="booking-modal-overlay">
          <div className="booking-modal bm-wide">

            {/* Step Progress Bar */}
            <div className="bm-header">
              <div className="bm-steps">
                {['Service', 'Barber', 'Time'].map((label, i) => {
                  const step = i + 1;
                  const done = bookingStep > step;
                  const active = bookingStep === step;
                  return (
                    <React.Fragment key={label}>
                      <div className={`bm-step ${active ? 'bm-step-active' : ''} ${done ? 'bm-step-done' : ''}`}>
                        <div className="bm-step-circle">{done ? '✓' : step === 1 ? '✂' : step === 2 ? '👤' : '📅'}</div>
                        <span className="bm-step-label">STEP {step}<br /><strong>{label}</strong></span>
                      </div>
                      {i < 2 && <div className={`bm-step-line ${bookingStep > step ? 'bm-line-done' : ''}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
              <button onClick={() => setShowBooking(false)} className="bm-close">&times;</button>
            </div>

            {/* STEP 1 — Choose Service */}
            {bookingStep === 1 && (
              <div className="bm-body">
                <h2 className="bm-title">Choose a service</h2>
                <p className="bm-subtitle">Pick what you'd like today.</p>
                <div className="bm-service-grid">
                  {BOOKING_SERVICES.map(svc => (
                    <button
                      key={svc.id}
                      className={`bm-service-card ${selectedService?.id === svc.id ? 'bm-selected' : ''}`}
                      onClick={() => {
                        setSelectedService(svc);
                        if (isHomeServiceChosen(svc)) {
                          const tedi = barbersList.find(b => b.name?.toLowerCase() === 'tedi') || { id: 4, name: 'Tedi', role: 'Home Service Specialist', initials: 'TE', rating: 9.8, years: '7+', photo_url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200' };
                          setSelectedBarber(tedi);
                        } else {
                          setSelectedBarber(defaultAnyBarber);
                        }
                        setBookingStep(2);
                      }}
                    >
                      <div className="bm-svc-icon">✂</div>
                      <div className="bm-svc-info">
                        <div className="bm-svc-name">{svc.name}</div>
                        <div className="bm-svc-meta">🕐 {svc.duration} min</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — Choose Barber */}
            {bookingStep === 2 && (() => {
              const isHome = isHomeServiceChosen(selectedService);
              let barbersToDisplay = barbersList;
              if (isHome) {
                const tediBarbers = barbersList.filter(b => b.name?.toLowerCase() === 'tedi');
                barbersToDisplay = tediBarbers.length > 0 ? tediBarbers : [{ id: 4, name: 'Tedi', role: 'Home Service Specialist', initials: 'TE', rating: 9.8, years: '7+', photo_url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200' }];
              }

              return (
                <div className="bm-body">
                  <h2 className="bm-title">Choose your barber</h2>
                  <p className="bm-subtitle">
                    {isHome
                      ? '🏠 Home to Home service is exclusively provided by our dedicated specialist, Tedi.'
                      : 'Pick a specific professional, or let us match you with the next available.'}
                  </p>
                  <div className="bm-barber-grid">
                    {barbersToDisplay.map(barber => (
                      <button
                        key={barber.id}
                        className={`bm-barber-card ${selectedBarber?.name?.toLowerCase() === barber.name?.toLowerCase() || selectedBarber?.id === barber.id ? 'bm-selected' : ''}`}
                        onClick={() => { setSelectedBarber(barber); setBookingStep(3); }}
                      >
                        <div className={`bm-barber-avatar ${barber.isAny ? 'bm-avatar-any' : ''}`}>
                          {barber.photo_url ? (
                            <img src={barber.photo_url} alt={barber.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : barber.initials}
                        </div>
                        <div className="bm-barber-info">
                          <div className="bm-barber-name">{barber.name}</div>
                          <div className="bm-barber-meta">
                            {barber.isAny
                              ? barber.role
                              : <span>💈 {barber.role} · ⭐ {barber.rating} · {barber.years} yrs</span>
                            }
                          </div>
                        </div>
                        {(selectedBarber?.name?.toLowerCase() === barber.name?.toLowerCase() || selectedBarber?.id === barber.id) && <span className="bm-check">✓</span>}
                      </button>
                    ))}
                  </div>
                  <button className="bm-back-btn" onClick={() => setBookingStep(1)}>← Back</button>
                </div>
              );
            })()}

            {/* STEP 3 — Date / Time / Details */}
            {bookingStep === 3 && (
              <form className="bm-body bm-final" onSubmit={handleBookingSubmit}>
                <div className="bm-final-left">
                  <h2 className="bm-title">Pick a date, time &amp; your details</h2>
                  <p className="bm-subtitle">Final step — confirm your slot.</p>

                  <label className="bm-label">DATE</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                    className="bm-input"
                    style={{ colorScheme: 'dark' }}
                  />

                  <label className="bm-label" style={{ marginTop: '20px' }}>AVAILABLE TIME</label>
                  {!selectedDate ? (
                    <p className="bm-empty-time">Pick a date first</p>
                  ) : (
                    <div className="bm-time-grid">
                      {TIME_SLOTS.map(slot => {
                        const taken = isSlotTaken(selectedDate, slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={taken}
                            className={`bm-time-slot ${
                              selectedTime === slot ? 'bm-time-selected' : ''
                            } ${taken ? 'bm-time-taken' : ''}`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button type="button" className="bm-back-btn" onClick={() => setBookingStep(2)} style={{ marginTop: '24px' }}>← Back</button>
                </div>

                <div className="bm-final-right">
                  <label className="bm-label">FULL NAME *</label>
                  <input required className="bm-input" type="text" placeholder="Your name" value={bookingName} onChange={e => setBookingName(e.target.value)} />

                  <label className="bm-label">PHONE *</label>
                  <input required className="bm-input" type="tel" placeholder="+251 92 ..." value={bookingPhone} onChange={e => setBookingPhone(e.target.value)} />

                  {(selectedService?.isHomeService || selectedService?.name?.toLowerCase().includes('home to home')) && (
                    <>
                      <label className="bm-label" style={{ color: '#C9915C' }}>TELEBIRR/CBE TRANSACTION REF *</label>
                      <input 
                        required 
                        className="bm-input" 
                        style={{ borderColor: '#C9915C' }}
                        type="text" 
                        placeholder="e.g. 7N34XQ..." 
                        value={transactionRef} 
                        onChange={e => setTransactionRef(e.target.value)} 
                      />
                    </>
                  )}

                  <label className="bm-label">NOTES (OPTIONAL)</label>
                  <textarea className="bm-input bm-textarea" placeholder="Anything we should know?" value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} />

                  <div className="bm-summary">
                    <div className="bm-summary-title">Booking summary</div>
                    <div className="bm-summary-barber">{selectedBarber?.name}</div>
                    <div className="bm-summary-service">{selectedService?.name}{selectedService ? ` · ${selectedService.duration} min` : ''}</div>
                    <div className="bm-summary-line" />
                    <div className="bm-summary-slot">{selectedDate || '—'} {selectedTime ? `· ${selectedTime}` : ''}</div>
                    
                    {(selectedService?.isHomeService || selectedService?.name?.toLowerCase().includes('home to home')) && (
                      <div className="bm-payment-info" style={{ marginTop: '15px', padding: '15px', backgroundColor: 'rgba(201, 145, 92, 0.1)', border: '1px solid #C9915C', borderRadius: '4px' }}>
                        <h4 style={{ color: '#C9915C', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Payment Information</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'white' }}>Total Price: <strong>5000 ETB</strong></p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'white' }}>Pre-payment Required: <strong>1000 ETB</strong></p>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#ccc' }}>* Appointment is only reserved when pre-payment is paid. Remaining 4000 ETB due after service.</p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'white' }}><strong>Telebirr:</strong> 0911282784</p>
                        <p style={{ margin: '0', fontSize: '0.85rem', color: 'white' }}><strong>CBE:</strong> 1000262574311</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedTime || !bookingName || !bookingPhone || ((selectedService?.isHomeService || selectedService?.name?.toLowerCase().includes('home to home')) && !transactionRef)}
                    className="bm-submit-btn"
                  >
                    {loading ? 'PROCESSING...' : 'CONFIRM BOOKING'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4 — Confirmed */}
            {bookingStep === 4 && (
              <div className="bm-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', color: '#C9915C' }}>✓</div>
                <h2 className="bm-title">Booking Confirmed!</h2>
                <p className="bm-subtitle" style={{ maxWidth: '400px', margin: '0 auto 30px' }}>Our team will contact you to confirm your appointment.</p>
                <button onClick={() => setShowBooking(false)} className="bm-submit-btn">CLOSE</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: -1,
          background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}></div>
        <div className="hero-content">
          <div className="hero-subtitle">PREMIUM BARBERSHOP</div>
          <h1 className="hero-title">The Art of the Perfect Cut</h1>
          <p className="hero-description">Expert grooming. Timeless style. Walk in as yourself, leave as your best self.</p>
          <div className="hero-buttons">
            <button onClick={() => setShowBooking(true)} className="btn-primary">BOOK ONLINE</button>
            <a href="tg://resolve?phone=251911282784" className="btn-telegram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'text-bottom'}}><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-17.5 7.904a2.25 2.25 0 0 0 .108 4.148l4.475 1.545 1.83 5.485c.182.548.77.822 1.309.605a1.272 1.272 0 0 0 .762-.738l2.064-4.225 4.966 3.655a2.26 2.26 0 0 0 3.327-.927l3.966-14.73a2.25 2.25 0 0 0-2.072-2.915c-.073 0-.147.006-.213.018z"></path></svg>
              BOOK VIA TELEGRAM
            </a>
          </div>
        </div>
      </section>

      {/* New Service Banner */}
      <section className="new-service-banner">
        <div className="ns-banner-content">
          <div className="ns-badge">NEW IN ETHIOPIA</div>
          <h2 className="ns-title">Introducing Our Home to Home Service</h2>
          <p className="ns-text">Experience premium grooming from the comfort of your home, exclusively provided by our specialist <strong>Tedi</strong>. We bring the barbershop to you.</p>
          <button onClick={() => openBooking(BOOKING_SERVICES.find(s => s.isHomeService))} className="ns-book-btn">BOOK HOME SERVICE NOW</button>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="section-header">
          <h2 className="section-subtitle">WHAT WE OFFER</h2>
          <h2 className="section-title">Our Services</h2>
        </div>

        <div className="svc-cards-grid">
          {servicesList.map((svc) => (
            <div key={svc.id} className="svc-card">
              <div className="svc-card-img-wrap">
                <img src={svc.image_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600'} alt={svc.name} className="svc-card-img" />
                <span className="svc-card-badge">{svc.category}</span>
                {svc.price && svc.price !== '0' && <span className="svc-price-badge">ETB {svc.price}</span>}
              </div>
              <div className="svc-card-body">
                <h3 className="svc-card-title">{svc.name}</h3>
                {svc.description && <p className="svc-card-desc">{svc.description}</p>}
                
                <div className="svc-card-footer">
                  <div className="svc-duration">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{svc.duration} min</span>
                  </div>
                  <button className="svc-book-btn" onClick={() => openBooking(svc)}>Book now →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section" id="reviews">
        <div className="section-header">
          <h2 className="section-subtitle">CLIENT REVIEWS</h2>
          <h2 className="section-title">What They Say</h2>
        </div>

        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-stars">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            <p className="review-text">"Best fade in town. The attention to detail is unmatched — I walk out feeling like a new man every time."</p>
            <p className="review-author">MARCUS T.</p>
          </div>

          <div className="review-card">
            <div className="review-stars">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            <p className="review-text">"The hot towel shave experience is absolutely luxurious. Old-school craftsmanship meets modern comfort."</p>
            <p className="review-author">JAMES O.</p>
          </div>

          <div className="review-card">
            <div className="review-stars">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            <p className="review-text">"My go-to for dreadlock maintenance. They really understand the craft and take pride in every cut."</p>
            <p className="review-author">DAVID K.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-content">
            <h2 className="section-subtitle">OUR STORY</h2>
            <h2 className="about-title">Craft, Care & Community</h2>
            <p className="about-text">At Afro Men's Beauty Salon, we believe a great haircut is more than a trim — it's an experience. Our skilled barbers bring years of expertise and a passion for precision to every appointment.</p>
            <p className="about-text">From classic cuts to modern fades, beard grooming to full skincare treatments, we offer a complete men's grooming experience in a welcoming, professional space.</p>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">10+</div>
                <div className="stat-label">YEARS EXPERIENCE</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5K+</div>
                <div className="stat-label">HAPPY CLIENTS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">35+</div>
                <div className="stat-label">SERVICES</div>
              </div>
            </div>
          </div>

          <div className="about-images">
            <img src={barberCraftImg} alt="Master barber at work" className="about-img main-img" />
            <img src={barberInteriorImg} alt="Luxury salon interior" className="about-img secondary-img" />
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="promotions-section">
        <div className="section-header">
          <h2 className="section-subtitle">SPECIAL OFFERS</h2>
          <h2 className="section-title">Featured Collections</h2>
        </div>

        <div className="promotions-grid">
          {promotions.map((promo, index) => (
            <div key={promo.id} className="promo-card">
              <div className="promo-image">
                {promo.type === 'video' ? (
                  <video
                    src={promo.url}
                    autoPlay
                    muted
                    loop
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={promo.url}
                    alt={promo.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="promo-overlay">
                <h3>{promo.title}</h3>
                <p>{promo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location Section */}
      <section id="location" style={{
        padding: '100px 40px',
        background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1209 100%)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '0.85rem', letterSpacing: '4px', color: '#C9915C', marginBottom: '12px', textTransform: 'uppercase' }}>FIND US</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', color: 'white', margin: 0 }}>Our Location</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center',
          }}>
            {/* Map Embed */}
            <div style={{
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid rgba(201, 145, 92, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              height: '400px',
            }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.7!2d38.8921!3d9.0170!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9bb11f77a44b%3A0x466139f637c44aaa!2sAFRO%20MEN%E2%80%99S%20BEAUTY%20SALON!5e0!3m2!1sen!2set!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Afro Men's Beauty Salon Location"
              />
            </div>

            {/* Location Info */}
            <div style={{ color: 'white' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: '30px', color: '#C9915C' }}>Visit Us</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', minWidth: '40px' }}>📍</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#C9915C', marginBottom: '6px', textTransform: 'uppercase' }}>Address</div>
                    <div style={{ fontSize: '1rem', lineHeight: 1.6 }}>Ayat Tebel Condominium<br />Addis Ababa, Ethiopia</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', minWidth: '40px' }}>🕐</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#C9915C', marginBottom: '6px', textTransform: 'uppercase' }}>Working Hours</div>
                    <div style={{ fontSize: '1rem', lineHeight: 1.8 }}>
                      <div>Monday – Sunday</div>
                      <div style={{ color: '#C9915C', fontWeight: 600 }}>2:00 AM – 9:00 PM</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', minWidth: '40px' }}>📞</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#C9915C', marginBottom: '6px', textTransform: 'uppercase' }}>Phone</div>
                    <div style={{ fontSize: '1rem' }}>+251 911 282 784</div>
                  </div>
                </div>

                <a
                  href="https://maps.app.goo.gl/PDfzMFJNBbj217NK9"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '14px 30px',
                    background: '#C9915C',
                    color: '#0f0f0f',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e8a96f'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#C9915C'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  📍 Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <img src={logoImg} alt="AFRO Men's Beauty Salon" style={{ height: '55px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(201,145,92,0.3))' }} />
            </div>
            <p className="footer-description">Where craftsmanship meets modern grooming. Experience the difference.</p>
          </div>

          <div className="footer-section">
            <h4>VISIT US</h4>
            <p style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: '#C9915C' }}>📍</span>
              <span>Ayat Tebel Condominium, Addis Ababa, Ethiopia
              </span>
            </p>
            <p style={{ marginTop: '15px' }}>
              <span style={{ color: '#C9915C' }}>🕐</span>
              <span style={{ marginLeft: '10px' }}>
                <div>Mon–Sun: 2am – 9pm</div>
                {/* <div>Sunday: 10am – 6pm</div> */}
              </span>
            </p>
            <p style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#C9915C' }}>📞</span>
              <span>+251 911282784</span>
            </p>
          </div>

          <div className="footer-section">
            <h4>BOOK ONLINE</h4>
            <p>Ready for your next look? Book an appointment online or via Telegram.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowBooking(true)} className="footer-book-btn">BOOK NOW</button>
              <a href="tg://resolve?phone=251911282784" className="footer-book-btn" style={{ background: '#229ED9', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-17.5 7.904a2.25 2.25 0 0 0 .108 4.148l4.475 1.545 1.83 5.485c.182.548.77.822 1.309.605a1.272 1.272 0 0 0 .762-.738l2.064-4.225 4.966 3.655a2.26 2.26 0 0 0 3.327-.927l3.966-14.73a2.25 2.25 0 0 0-2.072-2.915c-.073 0-.147.006-.213.018z"></path></svg>
                TELEGRAM
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 AFRO MEN'S BEAUTY SALON. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
