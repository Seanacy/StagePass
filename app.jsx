import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase (will be updated once project is ready) ───
const SUPABASE_URL = 'https://uxfvrlmszkhlxmiqolue.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZnZybG1zemtobHhtaXFvbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDUxNTcsImV4cCI6MjA5MzY4MTE1N30.fIfsCdy8bK6XuvR_OTksdRhuEP8HPRNX6nq7txw-Fms';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── US States ───
const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming'
];

// ─── Admin ───
const ADMIN_EMAIL = '247ggtms@gmail.com';

// ─── Clubs are fetched from Supabase (no more hardcoded data) ───
// Global club cache so multiple components can share one fetch
let _clubsCache = null;
let _clubsFetching = false;
let _clubsListeners = [];

async function getClubs() {
  if (_clubsCache) return _clubsCache;
  if (_clubsFetching) {
    return new Promise(resolve => _clubsListeners.push(resolve));
  }
  _clubsFetching = true;
  const { data, error } = await supabase.from('clubs').select('*').order('state').order('name');
  _clubsCache = error ? [] : data;
  _clubsFetching = false;
  _clubsListeners.forEach(cb => cb(_clubsCache));
  _clubsListeners = [];
  return _clubsCache;
}

// Hook: useClubs
function useClubs() {
  const [clubs, setClubs] = useState(_clubsCache || []);
  const [loading, setLoading] = useState(!_clubsCache);
  useEffect(() => {
    if (_clubsCache) { setClubs(_clubsCache); setLoading(false); return; }
    getClubs().then(c => { setClubs(c); setLoading(false); });
  }, []);
  return { clubs, loading };
}

// ─── Notifications Hook ───
function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setUnreadCount((data || []).filter(n => !n.read).length);
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return { notifications, unreadCount, markAllRead, reload: loadNotifications };
}

// ─── Navbar ───
function Navbar({ user, page, setPage, onLogout, role, unreadCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = (pg) => { setPage(pg); setMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => nav('landing')}>
        Stage<span className="green">Pass</span>
        {unreadCount > 0 && (
          <span style={{
            marginLeft: '6px', background: 'var(--danger)', color: '#fff', fontSize: '0.6rem',
            fontWeight: 800, borderRadius: '50%', width: '18px', height: '18px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu">{menuOpen ? '✕' : '☰'}</button>
      <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <a href="#" onClick={(e) => { e.preventDefault(); nav('clubs'); }}>Clubs</a>
        <a href="#" onClick={(e) => { e.preventDefault(); nav('dancers'); }}>Dancers</a>
        {user ? (
          <>
            <a href="#" onClick={(e) => { e.preventDefault(); nav('dashboard'); }} style={{ position: 'relative' }}>
              Dashboard
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-10px',
                  background: 'var(--danger)', color: '#fff', fontSize: '0.65rem',
                  fontWeight: 800, borderRadius: '50%', width: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); nav('claim'); }}>Claim</a>
            {user.email === ADMIN_EMAIL && (
              <a href="#" onClick={(e) => { e.preventDefault(); nav('admin-codes'); }} style={{ color: 'var(--accent)' }}>Admin</a>
            )}
            <button onClick={() => { onLogout(); setMenuOpen(false); }}>Log Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-secondary" onClick={() => nav('login')}>Log In</button>
            <button className="btn btn-sm btn-primary" onClick={() => nav('signup')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Landing Page ───
function Landing({ setPage }) {
  const { clubs } = useClubs();
  const uniqueStates = [...new Set(clubs.map(c => c.state))].length;

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem' }}>
          <span style={{ color: 'var(--primary)' }}>Build Your Tour.</span><br />
          <span style={{ color: 'var(--text-muted)' }}>or</span><br />
          <span style={{ color: 'var(--accent)', fontFamily: "'Dancing Script', cursive", fontSize: '1.15em' }}>Join The <span style={{ color: 'var(--success)' }}>$</span>howcase.</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 2rem' }}>
          The platform for dancers to plan tours across clubs nationwide — and get seen by the people who matter.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setPage('signup')}>I'm a Dancer</button>
          <button className="btn btn-accent btn-lg" onClick={() => setPage('login')}>I'm a Club</button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{clubs.length}+</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Clubs Listed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)' }}>{uniqueStates}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>States</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)' }}>Free</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>For Dancers</div>
          </div>
        </div>
      </div>

      {/* ─── Tour Section ─── */}
      <div className="section" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {/* Left — copy */}
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '0.75rem' }}>TOUR BUILDER</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Build Your <span style={{ color: 'var(--primary)' }}>Next Tour</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Browse clubs by state, city, or name. Pick your dates. Submit booking requests. Track confirmations from one dashboard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <div>✓ {clubs.length}+ clubs across {uniqueStates} states</div>
              <div>✓ Full Nude, Topless, and Bikini venues</div>
              <div>✓ Send booking requests directly to clubs</div>
              <div>✓ Track every stop from your dashboard</div>
            </div>
            <button className="btn btn-primary" onClick={() => setPage('clubs')}>Browse Clubs</button>
          </div>

          {/* Right — tour preview card */}
          <div style={{ flex: '1 1 300px', maxWidth: '380px' }}>
            <div className="tour-preview" style={{ maxWidth: '100%' }}>
              <div className="tour-preview-header">SAMPLE TOUR</div>
              {[
                { num: 1, name: "Tootsie's Cabaret", meta: 'Miami, FL — Jun 14', status: 'confirmed' },
                { num: 2, name: 'Magic City', meta: 'Atlanta, GA — Jun 18', status: 'pending' },
                { num: 3, name: 'King of Diamonds', meta: 'Miami, FL — Jun 22', status: 'pending' },
              ].map((stop, i) => (
                <div key={i} className="tour-preview-stop">
                  <div className="tour-preview-num">{stop.num}</div>
                  <div>
                    <div className="tour-preview-name">{stop.name}</div>
                    <div className="tour-preview-meta">{stop.meta}</div>
                  </div>
                  <span className={`tour-preview-badge status-${stop.status}`}>{stop.status === 'confirmed' ? 'Confirmed' : 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Showcase Section ─── */}
      <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section" style={{ padding: '4rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap-reverse' }}>
            {/* Left — dancer preview cards */}
            <div style={{ flex: '1 1 300px', maxWidth: '380px' }}>
              <div className="dancer-preview-row" style={{ maxWidth: '100%' }}>
                {[
                  { name: 'Diamond', city: 'Miami, FL', emoji: '💃', tags: ['IG', 'Linktree'] },
                  { name: 'Sapphire', city: 'Atlanta, GA', emoji: '✨', tags: ['IG', 'OnlyFans'] },
                ].map((d, i) => (
                  <div key={i} className="dancer-preview-card">
                    <div className="dancer-preview-avatar">{d.emoji}</div>
                    <div className="dancer-preview-info">
                      <div className="dancer-preview-name">{d.name}</div>
                      <div className="dancer-preview-loc">{d.city}</div>
                      <div className="dancer-preview-tags">
                        {d.tags.map((t, j) => <span key={j} className="dancer-preview-tag">{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — copy */}
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent)', marginBottom: '0.75rem' }}>THE $HOWCASE</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Where The Money <span style={{ color: 'var(--accent)' }}>Looks First</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Your profile. Your links. Your spotlight. Get discovered by the people who spend.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <div>✓ All your social links in one place</div>
                <div>✓ Searchable by state, city, and club</div>
                <div>✓ Featured profiles for top dancers</div>
                <div>✓ Free to join — own your spotlight</div>
              </div>
              <button className="btn btn-accent" onClick={() => setPage('dancers')}>See Dancers</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── For Clubs CTA ─── */}
      <div className="section" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--success)', marginBottom: '0.75rem' }}>FOR CLUBS</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Manage Your Bookings</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          Review dancer requests, accept or decline with one click, and build your upcoming lineup — all from one dashboard.
        </p>
        <button className="btn btn-secondary btn-lg" onClick={() => setPage('login')}>Club Log In</button>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p><span style={{ color: 'var(--accent)', fontWeight: 700 }}>Stage</span><span style={{ color: 'var(--success)', fontWeight: 700 }}>Pass</span> — Tour. Perform. Get Discovered.</p>
      </footer>
    </div>
  );
}

// ─── Club Directory ───
function ClubDirectory({ setPage, user }) {
  const { clubs: allClubs, loading: clubsLoading } = useClubs();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [bookingClub, setBookingClub] = useState(null);

  const states = [...new Set(allClubs.map(c => c.state))].sort();
  const types = [...new Set(allClubs.map(c => c.type))].sort();

  const filtered = allClubs.filter(c => {
    if (stateFilter && c.state !== stateFilter) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.city.toLowerCase().includes(s) || c.state.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="section">
      <div className="section-header">
        <h2>Club Directory</h2>
        <p>{allClubs.length} clubs across {states.length} states</p>
      </div>

      <div className="filter-bar">
        <input placeholder="Search clubs, cities..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="club-grid">
        {filtered.map(club => (
          <div key={club.id} className="club-card">
            <div className="club-name">{club.name}</div>
            <div className="club-location">{club.city}, {club.state}</div>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="club-tag">{club.type}</span>
              <span className="club-tag">{club.size}</span>
            </div>
            <div className="club-contact">{club.address}</div>
            <div className="club-contact" style={{ marginTop: '0.25rem' }}>{club.phone}</div>
            {user && user.user_metadata?.role === 'dancer' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="btn btn-sm btn-accent"
                  onClick={() => setBookingClub(club)}>
                  Request to Book
                </button>
                <button className="btn btn-sm btn-secondary"
                  onClick={() => setPage('tour-builder')}>
                  + Tour
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            No clubs match your search. Try a different state or keyword.
          </div>
        )}
      </div>

      {bookingClub && (
        <BookingRequestModal
          club={bookingClub}
          user={user}
          onClose={() => setBookingClub(null)}
          onSent={() => setBookingClub(null)}
        />
      )}
    </div>
  );
}

// ─── Media Carousel (used inside dancer cards) ───
function MediaCarousel({ photos, videos }) {
  const [mediaMode, setMediaMode] = useState('photos'); // 'photos' or 'videos'
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = mediaMode === 'photos' ? photos : videos;
  const hasVideos = videos && videos.length > 0;
  const hasPhotos = photos && photos.length > 0;

  // Reset index when switching modes
  useEffect(() => { setCurrentIndex(0); }, [mediaMode]);

  const goNext = (e) => { e.stopPropagation(); setCurrentIndex(i => (i + 1) % items.length); };
  const goPrev = (e) => { e.stopPropagation(); setCurrentIndex(i => (i - 1 + items.length) % items.length); };

  return (
    <div className="carousel-wrapper">
      {/* Media display */}
      <div className="carousel-viewport">
        {items.length === 0 ? (
          <div className="carousel-empty">
            {mediaMode === 'photos' ? '📷' : '🎬'}
            <span>{mediaMode === 'photos' ? 'No photos yet' : 'No videos yet'}</span>
          </div>
        ) : mediaMode === 'photos' ? (
          <img src={items[currentIndex]?.url} alt="" className="carousel-img" />
        ) : (
          <video src={items[currentIndex]?.url} className="carousel-video" controls playsInline />
        )}

        {/* Arrows (only if more than 1 item) */}
        {items.length > 1 && (
          <>
            <button className="carousel-arrow carousel-arrow-left" onClick={goPrev}>‹</button>
            <button className="carousel-arrow carousel-arrow-right" onClick={goNext}>›</button>
          </>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="carousel-dots">
          {items.map((_, i) => (
            <span key={i} className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }} />
          ))}
        </div>
      )}

      {/* Photo / Video toggle */}
      {(hasPhotos || hasVideos) && hasVideos && (
        <div className="carousel-toggle">
          <button className={`toggle-btn ${mediaMode === 'photos' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setMediaMode('photos'); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Photos
          </button>
          <button className={`toggle-btn ${mediaMode === 'videos' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setMediaMode('videos'); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            Videos
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Social Icon Tray ───
function SocialIconTray({ instagram, twitter, onlyfans, linktree }) {
  const socials = [
    { url: instagram, label: 'Instagram', color: '#E1306C',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { url: twitter, label: 'X / Twitter', color: '#1DA1F2',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { url: onlyfans, label: 'OnlyFans', color: '#00AFF0',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.6a6.6 6.6 0 110-13.2 6.6 6.6 0 010 13.2zm0-10.8a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4zm0 6.6a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8z"/></svg> },
    { url: linktree, label: 'Links', color: 'var(--success)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
  ];

  const activeSocials = socials.filter(s => s.url);
  if (activeSocials.length === 0) return null;

  return (
    <div className="social-icon-tray">
      {activeSocials.map((s, i) => (
        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
          className="social-icon-btn" style={{ color: s.color }} title={s.label}
          onClick={(e) => e.stopPropagation()}>
          {s.icon}
        </a>
      ))}
    </div>
  );
}

// ─── Club Card Modal ───
function ClubCardModal({ club, onClose }) {
  if (!club) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="club-detail-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {/* Club header area (styled like dancer card carousel area) */}
        <div className="club-detail-header">
          <div className="club-detail-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="club-detail-type-badge">{club.type}</div>
          <div className="club-detail-size-badge">{club.size} Venue</div>
        </div>
        {/* Club info */}
        <div className="club-detail-info">
          <div className="club-detail-name">{club.name}</div>
          <div className="club-detail-location">{club.city}, {club.state}</div>
          <div className="club-detail-divider"></div>
          <div className="club-detail-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{club.address}</span>
          </div>
          <div className="club-detail-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            <span>{club.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Availability Display ───
function AvailabilityDisplay({ days, timeStart, timeEnd }) {
  if (!days || days.length === 0) return null;
  const dayAbbrevs = { 'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun' };
  const abbrevDays = days.map(d => dayAbbrevs[d] || d);
  const timeStr = timeStart && timeEnd ? `${timeStart} – ${timeEnd}` : timeStart || '';

  return (
    <div className="availability-display">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span className="avail-days">{abbrevDays.join(', ')}</span>
      {timeStr && <span className="avail-time">{timeStr}</span>}
    </div>
  );
}

// ─── Helper: find a club in our system by name ───
function findClubInSystem(clubName) {
  if (!clubName) return null;
  const lower = clubName.toLowerCase().trim();
  return (_clubsCache || []).find(c => c.name.toLowerCase() === lower) || null;
}

// ─── Dancer Showcase ───
function DancerShowcase() {
  const [dancers, setDancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    loadDancers();
  }, []);

  const loadDancers = async () => {
    try {
      // Fetch dancers
      const { data: dancerRows, error: dErr } = await supabase
        .from('dancers')
        .select('*')
        .order('stage_name');

      if (dErr) throw dErr;

      // Fetch all media
      const { data: mediaRows, error: mErr } = await supabase
        .from('dancer_media')
        .select('*')
        .order('display_order');

      if (mErr) throw mErr;

      // Group media by dancer
      const mediaByDancer = {};
      (mediaRows || []).forEach(m => {
        if (!mediaByDancer[m.dancer_id]) mediaByDancer[m.dancer_id] = { photos: [], videos: [] };
        if (m.media_type === 'photo') mediaByDancer[m.dancer_id].photos.push(m);
        else mediaByDancer[m.dancer_id].videos.push(m);
      });

      // Merge
      const merged = (dancerRows || []).map(d => ({
        ...d,
        photos: mediaByDancer[d.id]?.photos || [],
        videos: mediaByDancer[d.id]?.videos || [],
      }));

      setDancers(merged);
    } catch (err) {
      console.error('Failed to load dancers:', err);
    } finally {
      setLoading(false);
    }
  };

  const states = [...new Set(dancers.map(d => d.state).filter(Boolean))].sort();

  const filtered = dancers.filter(d => {
    if (stateFilter && d.state !== stateFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (d.stage_name || '').toLowerCase().includes(s) ||
        (d.city || '').toLowerCase().includes(s) ||
        (d.state || '').toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading dancers...</div>;

  return (
    <div className="section">
      <div className="section-header">
        <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent)', marginBottom: '0.5rem' }}>THE $HOWCASE</div>
        <h2>Where The Money <span style={{ color: 'var(--accent)' }}>Looks First</span></h2>
        <p>Discover dancers from across the country</p>
      </div>

      <div className="filter-bar">
        <input placeholder="Search by name, city..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
          {dancers.length === 0
            ? 'No dancers in the showcase yet. Be the first!'
            : 'No dancers match your search.'}
        </div>
      ) : (
        <div className="dancer-grid">
          {filtered.map(dancer => {
            const matchedClub = findClubInSystem(dancer.home_club);
            return (
              <div key={dancer.id} className="dancer-card">
                <MediaCarousel photos={dancer.photos} videos={dancer.videos} />
                <div className="dancer-info">
                  <div className="dancer-name">{dancer.stage_name}</div>
                  <div className="dancer-location">{[dancer.city, dancer.state].filter(Boolean).join(', ') || 'Location not set'}</div>
                  {dancer.home_club && (
                    <div className={`dancer-club ${matchedClub ? 'clickable' : ''}`}
                      onClick={matchedClub ? () => setSelectedClub(matchedClub) : undefined}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      {dancer.home_club}
                    </div>
                  )}
                  <AvailabilityDisplay
                    days={dancer.available_days}
                    timeStart={dancer.available_time_start}
                    timeEnd={dancer.available_time_end}
                  />
                  <SocialIconTray
                    instagram={dancer.instagram}
                    twitter={dancer.twitter}
                    onlyfans={dancer.onlyfans}
                    linktree={dancer.linktree}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Club detail modal */}
      {selectedClub && <ClubCardModal club={selectedClub} onClose={() => setSelectedClub(null)} />}
    </div>
  );
}

// ─── Claim Account ───
function ClaimAccount({ user, setPage }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClaim = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Look up the code
      const { data: claim, error: fetchErr } = await supabase
        .from('claim_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .single();

      if (fetchErr || !claim) throw new Error('Invalid claim code. Check your code and try again.');
      if (claim.claimed_by) throw new Error('This code has already been used.');

      // Mark the code as claimed
      const { error: updateErr } = await supabase
        .from('claim_codes')
        .update({ claimed_by: user.id, claimed_at: new Date().toISOString() })
        .eq('id', claim.id);

      if (updateErr) throw new Error('Failed to claim. Try again.');

      // Update the actual entity (club or dancer) with claimed_by
      const table = claim.entity_type === 'club' ? 'clubs' : 'dancers';
      await supabase.from(table).update({ claimed_by: user.id }).eq('id', claim.entity_id);

      // Update user metadata with their role
      if (claim.entity_type === 'club') {
        await supabase.auth.updateUser({ data: { role: 'club' } });
      }

      setSuccess(`Successfully claimed your ${claim.entity_type} account! Redirecting to dashboard...`);
      setTimeout(() => setPage('dashboard'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Claim Your Account</h2>
      <p className="subtitle">Enter the claim code you received to take ownership of your listing.</p>

      <form onSubmit={handleClaim}>
        <div className="form-group">
          <label>Claim Code</label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SP-CLUB-A7X3"
            required
            style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.05em', textAlign: 'center' }}
          />
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1rem' }}>{success}</div>}

        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
          {loading ? 'Claiming...' : 'Claim Account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        Don't have a code? Contact StagePass to get one for your club or dancer profile.
      </div>
    </div>
  );
}

// ─── Admin Claim Code Generator ───
function AdminClaimCodes({ user }) {
  const { clubs } = useClubs();
  const [dancers, setDancers] = useState([]);
  const [entityType, setEntityType] = useState('club');
  const [entityId, setEntityId] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCodes, setAllCodes] = useState([]);

  useEffect(() => {
    // Fetch all dancers for the dropdown
    supabase.from('dancers').select('id, stage_name').order('stage_name').then(({ data }) => {
      setDancers(data || []);
    });
    // Fetch existing codes
    loadCodes();
  }, []);

  const loadCodes = async () => {
    const { data } = await supabase.from('claim_codes').select('*').order('created_at', { ascending: false });
    setAllCodes(data || []);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars[Math.floor(Math.random() * chars.length)];
    const prefix = entityType === 'club' ? 'SP-CLUB' : 'SP-DANCER';
    return `${prefix}-${result}`;
  };

  const handleGenerate = async () => {
    if (!entityId) return;
    setLoading(true);

    const code = generateCode();
    const { data, error } = await supabase.from('claim_codes').insert({
      code,
      entity_type: entityType,
      entity_id: entityId
    }).select().single();

    if (!error && data) {
      setGeneratedCodes(prev => [data, ...prev]);
      setAllCodes(prev => [data, ...prev]);
    }
    setLoading(false);
  };

  // Only allow admin
  if (user?.email !== ADMIN_EMAIL) {
    return <div className="auth-container"><h2>Access Denied</h2><p>Admin only.</p></div>;
  }

  const entityOptions = entityType === 'club' ? clubs : dancers;
  const getEntityName = (type, id) => {
    if (type === 'club') return clubs.find(c => c.id === id)?.name || id;
    return dancers.find(d => d.id === id)?.stage_name || id;
  };

  return (
    <div className="dashboard">
      <h2>Admin: Claim Codes</h2>
      <p className="subtitle">Generate codes for clubs and dancers to claim their accounts.</p>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Generate New Code</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Type</label>
            <select value={entityType} onChange={e => { setEntityType(e.target.value); setEntityId(''); }}>
              <option value="club">Club</option>
              <option value="dancer">Dancer</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>{entityType === 'club' ? 'Club' : 'Dancer'}</label>
            <select value={entityId} onChange={e => setEntityId(e.target.value)}>
              <option value="">Select...</option>
              {entityOptions.map(item => (
                <option key={item.id} value={item.id}>
                  {entityType === 'club' ? `${item.name} — ${item.city}, ${item.state}` : item.stage_name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={!entityId || loading}>
            {loading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
      </div>

      {/* Recently generated */}
      {generatedCodes.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-card)', border: '2px solid var(--success)' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--success)' }}>Just Generated</h3>
          {generatedCodes.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{c.code}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {c.entity_type}: {getEntityName(c.entity_type, c.entity_id)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* All codes table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>All Codes ({allCodes.length})</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {allCodes.map(c => (
            <div key={c.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem'
            }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</span>
              <span style={{ color: 'var(--text-muted)' }}>{c.entity_type}: {getEntityName(c.entity_type, c.entity_id)}</span>
              <span className={`status-badge ${c.claimed_by ? 'status-confirmed' : 'status-pending'}`}>
                {c.claimed_by ? 'Claimed' : 'Available'}
              </span>
            </div>
          ))}
          {allCodes.length === 0 && <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>No codes generated yet.</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Auth Form ───
function AuthForm({ mode, setPage, onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stageName, setStageName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { stage_name: stageName, role: 'dancer' } }
        });
        if (err) throw err;
        if (data.user) {
          onAuth(data.user);
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) {
          onAuth(data.user);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{mode === 'signup' ? 'Join StagePass' : 'Welcome Back'}</h2>
      <p className="subtitle">{mode === 'signup' ? 'Create your dancer profile for free' : 'Log in to your account'}</p>

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="form-group">
            <label>Stage Name</label>
            <input value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Your stage name" required />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
          {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Log In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {mode === 'signup' ? (
          <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setPage('login'); }}>Log in</a></>
        ) : (
          <>Need an account? <a href="#" onClick={e => { e.preventDefault(); setPage('signup'); }}>Sign up</a></>
        )}
      </div>
    </div>
  );
}

// ─── Tour Builder ───
// MapBox token (free tier: 100k requests/month)
// MapBox token loaded from index.html (set via Vercel env var)
const MAPBOX_TOKEN = window.__MAPBOX_TOKEN || '';

// Geocode an address to lat/lng using MapBox
async function geocodeAddress(address) {
  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) { /* silently fail */ }
  return null;
}

// Get driving distance and duration between two points
async function getDrivingRoute(from, to) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?access_token=${MAPBOX_TOKEN}`
    );
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance, // meters
        duration: route.duration, // seconds
      };
    }
  } catch (e) { /* silently fail */ }
  return null;
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hrs === 0) return `${mins} min`;
  return `${hrs}h ${mins}m`;
}

function formatMiles(meters) {
  return (meters / 1609.344).toFixed(0);
}

// ─── Booking Request Modal ───
function BookingRequestModal({ club, user, onClose, onSent }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('experienced');
  const [preferredShift, setPreferredShift] = useState('night');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!startDate) { setError('Pick a start date.'); return; }
    setSending(true);
    setError('');
    try {
      const { data: req, error: insertErr } = await supabase
        .from('booking_requests')
        .insert({
          dancer_id: user.id,
          club_id: club.id,
          start_date: startDate,
          end_date: endDate || startDate,
          message,
          experience_level: experienceLevel,
          preferred_shift: preferredShift,
          status: 'pending',
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      // Create notification for club owner (if club is claimed)
      if (club.claimed_by) {
        const dancerName = user.user_metadata?.stage_name || 'A dancer';
        await supabase.from('notifications').insert({
          user_id: club.claimed_by,
          type: 'booking_request',
          title: 'New Booking Request',
          message: `${dancerName} wants to book ${club.name} on ${new Date(startDate + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          booking_request_id: req.id,
        });
      }

      onSent && onSent();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', position: 'relative' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Request to Book</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{club.name} — {club.city}, {club.state}</p>

        {error && <div style={{ padding: '0.5rem', background: 'rgba(255,71,87,0.12)', color: 'var(--danger)', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label>Experience Level</label>
            <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
              <option value="beginner">Beginner (under 1 year)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="experienced">Experienced (3+ years)</option>
              <option value="featured">Featured / Headliner</option>
            </select>
          </div>
          <div className="form-group">
            <label>Preferred Shift</label>
            <select value={preferredShift} onChange={e => setPreferredShift(e.target.value)}>
              <option value="day">Day Shift</option>
              <option value="night">Night Shift</option>
              <option value="both">Both / Double</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Message to Club</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Introduce yourself — mention your experience, home club, what nights you're looking for..."
            style={{ minHeight: '80px' }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={sending} style={{ width: '100%', marginTop: '0.5rem' }}>
          {sending ? 'Sending...' : 'Send Booking Request'}
        </button>
      </div>
    </div>
  );
}

function TourBuilder({ user }) {
  const { clubs: allClubs } = useClubs();
  const [tourStops, setTourStops] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [routeLegs, setRouteLegs] = useState([]); // { from, to, distance, duration }
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  const [customFee, setCustomFee] = useState('');
  const [submittingAll, setSubmittingAll] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [bookingClub, setBookingClub] = useState(null); // for individual booking modal

  const submitAllRequests = async () => {
    if (sortedStops.length === 0) return;
    setSubmittingAll(true);
    setSubmitMsg('');
    let successCount = 0;
    try {
      for (const stop of sortedStops) {
        const { data: req, error } = await supabase
          .from('booking_requests')
          .insert({
            dancer_id: user.id,
            club_id: stop.club.id,
            start_date: stop.date,
            end_date: stop.date,
            message: stop.notes || '',
            experience_level: 'experienced',
            preferred_shift: 'night',
            status: 'pending',
          })
          .select()
          .single();
        if (error) { console.error('Booking error:', error); continue; }
        successCount++;

        // Notify club owner
        if (stop.club.claimed_by) {
          const dancerName = user.user_metadata?.stage_name || 'A dancer';
          await supabase.from('notifications').insert({
            user_id: stop.club.claimed_by,
            type: 'booking_request',
            title: 'New Booking Request',
            message: `${dancerName} wants to book ${stop.club.name} on ${new Date(stop.date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            booking_request_id: req.id,
          });
        }
      }
      setSubmitMsg(`Sent ${successCount} request${successCount !== 1 ? 's' : ''}!`);
      setTimeout(() => setSubmitMsg(''), 4000);
    } catch (err) {
      setSubmitMsg('Error: ' + err.message);
    } finally {
      setSubmittingAll(false);
    }
  };

  const addStop = () => {
    if (!selectedClub || !date) return;
    const club = allClubs.find(c => c.id === selectedClub);
    if (!club) return;
    // Use club's listed fee, or the dancer's custom estimate
    const fee = club.house_fee || (customFee ? parseFloat(customFee) : null);
    setTourStops(prev => [...prev, {
      id: Date.now(),
      club: { ...club, house_fee: fee },
      date,
      time,
      notes,
      status: 'pending',
      customFee: !club.house_fee && customFee ? parseFloat(customFee) : null,
    }]);
    setSelectedClub('');
    setDate('');
    setTime('');
    setNotes('');
    setCustomFee('');
  };

  const removeStop = (id) => {
    setTourStops(prev => prev.filter(s => s.id !== id));
    setRouteLegs([]);
  };

  // Calculate routes whenever stops change (2+ stops)
  const sortedStops = [...tourStops].sort((a, b) => new Date(a.date) - new Date(b.date));

  const calculateRoutes = useCallback(async () => {
    if (sortedStops.length < 2) { setRouteLegs([]); return; }
    setCalculatingRoute(true);

    const legs = [];
    for (let i = 0; i < sortedStops.length - 1; i++) {
      const fromClub = sortedStops[i].club;
      const toClub = sortedStops[i + 1].club;

      // Use stored lat/lng or geocode from address
      let fromCoords = fromClub.lat && fromClub.lng ? { lat: fromClub.lat, lng: fromClub.lng } : null;
      let toCoords = toClub.lat && toClub.lng ? { lat: toClub.lat, lng: toClub.lng } : null;

      if (!fromCoords) {
        const addr = `${fromClub.address || ''} ${fromClub.city}, ${fromClub.state}`;
        fromCoords = await geocodeAddress(addr);
      }
      if (!toCoords) {
        const addr = `${toClub.address || ''} ${toClub.city}, ${toClub.state}`;
        toCoords = await geocodeAddress(addr);
      }

      if (fromCoords && toCoords) {
        const route = await getDrivingRoute(fromCoords, toCoords);
        legs.push({
          from: fromClub.name,
          to: toClub.name,
          distance: route?.distance || 0,
          duration: route?.duration || 0,
        });
      } else {
        legs.push({ from: fromClub.name, to: toClub.name, distance: 0, duration: 0 });
      }
    }

    setRouteLegs(legs);
    setCalculatingRoute(false);
  }, [tourStops.length]);

  useEffect(() => {
    if (tourStops.length >= 2) calculateRoutes();
    else setRouteLegs([]);
  }, [tourStops.length]);

  // Tour totals
  const totalDistance = routeLegs.reduce((sum, l) => sum + l.distance, 0);
  const totalDuration = routeLegs.reduce((sum, l) => sum + l.duration, 0);
  const totalFees = sortedStops.reduce((sum, s) => sum + (s.club.house_fee || 0), 0);

  return (
    <div className="dashboard">
      <h2>Build Your Tour</h2>
      <p className="subtitle">Pick clubs, choose dates, and see travel costs at a glance.</p>

      {/* Add Stop Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-light)' }}>Add a Stop</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label>Club</label>
            <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}>
              <option value="">Select a club...</option>
              {allClubs.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name)).map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.city}, {c.state}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>
        {/* Show fee info or let dancer enter it */}
        {selectedClub && (() => {
          const club = allClubs.find(c => c.id === selectedClub);
          if (club?.house_fee) {
            return (
              <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(76,175,80,0.08)', borderRadius: '0.5rem' }}>
                House fee listed by club: <strong>${club.house_fee}/night</strong>
              </div>
            );
          }
          return (
            <div className="form-group">
              <label>House Fee (club hasn't listed one — enter your estimate)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 700 }}>$</span>
                <input type="number" value={customFee} onChange={e => setCustomFee(e.target.value)} placeholder="e.g. 40" style={{ maxWidth: '120px' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>/night</span>
              </div>
            </div>
          );
        })()}

        <div className="form-group">
          <label>Notes for the club (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Available for 2 nights, experienced with VIP rooms" />
        </div>
        <button className="btn btn-primary" onClick={addStop} disabled={!selectedClub || !date}>Add to Tour</button>
      </div>

      {/* Tour Summary Stats */}
      {sortedStops.length >= 2 && (
        <div className="tour-summary" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              {calculatingRoute ? '...' : `${formatMiles(totalDistance)} mi`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Distance</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
              {calculatingRoute ? '...' : formatDuration(totalDuration)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Drive Time</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>
              ${totalFees}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total House Fees</div>
          </div>
        </div>
      )}

      {/* Tour Timeline */}
      {sortedStops.length > 0 ? (
        <>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Tour ({sortedStops.length} stops)</h3>
          <div className="tour-timeline">
            {sortedStops.map((stop, i) => (
              <React.Fragment key={stop.id}>
                <div className="tour-stop">
                  <div className="tour-stop-num">{i + 1}</div>
                  <div className="tour-stop-info">
                    <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{stop.club.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {stop.club.city}, {stop.club.state} — {new Date(stop.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {stop.time && ` at ${stop.time}`}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                      {stop.club.house_fee && (
                        <span style={{ color: 'var(--danger)' }}>
                          House fee: ${stop.club.house_fee}{stop.customFee ? ' (your estimate)' : ''}
                        </span>
                      )}
                      {stop.club.address && (
                        <span style={{ color: 'var(--text-dim)' }}>{stop.club.address}</span>
                      )}
                    </div>
                    {stop.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '0.25rem' }}>"{stop.notes}"</div>}
                  </div>
                  <span className={`status-badge status-${stop.status}`}>{stop.status}</span>
                  <button onClick={() => removeStop(stop.id)} style={{
                    background: 'none', border: 'none', color: 'var(--danger)',
                    cursor: 'pointer', fontSize: '1rem', padding: '0.25rem'
                  }}>✕</button>
                </div>

                {/* Travel leg between stops */}
                {routeLegs[i] && routeLegs[i].distance > 0 && (
                  <div className="tour-leg" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.4rem 0 0.4rem 2.5rem', fontSize: '0.75rem', color: 'var(--text-dim)'
                  }}>
                    <span style={{ color: 'var(--primary)' }}>↓</span>
                    <span>{formatMiles(routeLegs[i].distance)} mi</span>
                    <span>•</span>
                    <span>{formatDuration(routeLegs[i].duration)} drive</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <button className="btn btn-accent" style={{ marginTop: '1.5rem', width: '100%' }}
            disabled={submittingAll}
            onClick={submitAllRequests}>
            {submittingAll ? 'Submitting...' : submitMsg ? submitMsg : `Submit All Booking Requests (${sortedStops.length})`}
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
          No stops added yet. Pick a club and date above to start building your tour.
        </div>
      )}
    </div>
  );
}

// ─── Dancer Bookings (sub-component) ───
function DancerBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clubs } = useClubs();

  useEffect(() => {
    loadBookings();
  }, [user.id]);

  const loadBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('dancer_id', user.id)
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const cancelBooking = async (id) => {
    await supabase.from('booking_requests').update({ status: 'cancelled' }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? `${club.name} — ${club.city}, ${club.state}` : 'Unknown Club';
  };

  const statusColors = {
    pending: 'var(--accent)',
    confirmed: 'var(--success)',
    declined: 'var(--danger)',
    cancelled: 'var(--text-dim)',
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Loading bookings...</div>;

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Booking Requests ({bookings.length})</h3>
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
          No booking requests yet. Visit the Club Directory to send your first request!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookings.map(b => (
            <div key={b.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{getClubName(b.club_id)}</div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem', borderRadius: '1rem',
                  background: `${statusColors[b.status]}22`,
                  color: statusColors[b.status],
                }}>{b.status}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                {new Date(b.start_date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {b.end_date && b.end_date !== b.start_date && ` — ${new Date(b.end_date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                {b.experience_level && <span className="club-tag" style={{ fontSize: '0.65rem' }}>{b.experience_level}</span>}
                {b.preferred_shift && <span className="club-tag" style={{ fontSize: '0.65rem' }}>{b.preferred_shift} shift</span>}
              </div>
              {b.message && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>"{b.message}"</div>}
              {b.status === 'pending' && (
                <button className="btn btn-sm btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={() => cancelBooking(b.id)}>Cancel Request</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dancer Dashboard ───
function DancerDashboard({ user, setPage }) {
  const [tab, setTab] = useState('bookings');
  const [dancerProfile, setDancerProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  // Profile form state
  const [stageName, setStageName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [homeClub, setHomeClub] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [onlyfans, setOnlyfans] = useState('');
  const [linktree, setLinktree] = useState('');
  const [availDays, setAvailDays] = useState([]);
  const [availTimeStart, setAvailTimeStart] = useState('');
  const [availTimeEnd, setAvailTimeEnd] = useState('');

  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const toggleDay = (day) => {
    setAvailDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      // Get or create dancer profile
      let { data: dancer, error } = await supabase
        .from('dancers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile yet — create one
        const { data: newDancer, error: createErr } = await supabase
          .from('dancers')
          .insert({ user_id: user.id, stage_name: user.user_metadata?.stage_name || 'New Dancer' })
          .select()
          .single();
        if (createErr) throw createErr;
        dancer = newDancer;
      } else if (error) throw error;

      setDancerProfile(dancer);
      setStageName(dancer.stage_name || '');
      setCity(dancer.city || '');
      setState(dancer.state || '');
      setHomeClub(dancer.home_club || '');
      setBio(dancer.bio || '');
      setInstagram(dancer.instagram || '');
      setTwitter(dancer.twitter || '');
      setOnlyfans(dancer.onlyfans || '');
      setLinktree(dancer.linktree || '');
      setAvailDays(dancer.available_days || []);
      setAvailTimeStart(dancer.available_time_start || '');
      setAvailTimeEnd(dancer.available_time_end || '');

      // Load media
      const { data: media } = await supabase
        .from('dancer_media')
        .select('*')
        .eq('dancer_id', dancer.id)
        .order('display_order');

      const p = (media || []).filter(m => m.media_type === 'photo');
      const v = (media || []).filter(m => m.media_type === 'video');
      setPhotos(p);
      setVideos(v);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!dancerProfile) return;
    setSaving(true);
    setMsg('');
    try {
      const { error } = await supabase
        .from('dancers')
        .update({
          stage_name: stageName,
          city, state, home_club: homeClub, bio,
          instagram, twitter, onlyfans, linktree,
          available_days: availDays,
          available_time_start: availTimeStart,
          available_time_end: availTimeEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dancerProfile.id);
      if (error) throw error;
      setMsg('Profile saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadMedia = async (files, mediaType) => {
    if (!dancerProfile || !files.length) return;
    if (mediaType === 'video' && videos.length + files.length > 2) {
      setMsg('Max 2 videos allowed.');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    setUploading(true);
    setMsg('');
    try {
      const currentItems = mediaType === 'photo' ? photos : videos;
      let order = currentItems.length;

      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${mediaType}s/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('dancer-media')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage.from('dancer-media').getPublicUrl(path);

        const { error: dbErr } = await supabase
          .from('dancer_media')
          .insert({
            dancer_id: dancerProfile.id,
            media_type: mediaType,
            url: urlData.publicUrl,
            storage_path: path,
            display_order: order++,
            is_main: mediaType === 'photo' && photos.length === 0 && order === 1,
          });
        if (dbErr) throw dbErr;
      }

      await loadProfile();
      setMsg(`${mediaType === 'photo' ? 'Photo' : 'Video'}(s) uploaded!`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (mediaItem) => {
    try {
      await supabase.storage.from('dancer-media').remove([mediaItem.storage_path]);
      await supabase.from('dancer_media').delete().eq('id', mediaItem.id);
      await loadProfile();
      setMsg('Deleted!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('Delete error: ' + err.message);
    }
  };

  const setMainPhoto = async (mediaItem) => {
    try {
      // Unset all mains for this dancer
      await supabase.from('dancer_media').update({ is_main: false }).eq('dancer_id', dancerProfile.id);
      // Set this one
      await supabase.from('dancer_media').update({ is_main: true }).eq('id', mediaItem.id);
      // Also set profile_photo_url
      await supabase.from('dancers').update({ profile_photo_url: mediaItem.url }).eq('id', dancerProfile.id);
      await loadProfile();
      setMsg('Main photo updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  };

  const displayName = stageName || user?.user_metadata?.stage_name || 'Dancer';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>Hey, {displayName}</h2>
      <p className="subtitle">Manage your tours, media, and profile</p>

      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem',
          background: msg.startsWith('Error') || msg.startsWith('Upload error') || msg.startsWith('Delete error')
            ? 'rgba(255,71,87,0.15)' : 'rgba(0,184,148,0.15)',
          color: msg.startsWith('Error') || msg.startsWith('Upload error') || msg.startsWith('Delete error')
            ? 'var(--danger)' : 'var(--success)',
          fontSize: '0.85rem', fontWeight: 600
        }}>{msg}</div>
      )}

      <div className="tab-bar">
        <button className={`tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>My Bookings</button>
        <button className={`tab ${tab === 'tours' ? 'active' : ''}`} onClick={() => setTab('tours')}>My Tours</button>
        <button className={`tab ${tab === 'media' ? 'active' : ''}`} onClick={() => setTab('media')}>My Media</button>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>My Profile</button>
      </div>

      {/* ─── Bookings Tab ─── */}
      {tab === 'bookings' && <DancerBookings user={user} />}

      {/* ─── Tours Tab ─── */}
      {tab === 'tours' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Tour Stops</h3>
            <button className="btn btn-sm btn-primary" onClick={() => setPage('tour-builder')}>+ Build New Tour</button>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
            No tours yet. Start by building your first tour!
          </div>
        </div>
      )}

      {/* ─── Media Tab ─── */}
      {tab === 'media' && (
        <div>
          {/* Photos Section */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                Photos ({photos.length})
              </h3>
              <label className="btn btn-sm btn-primary" style={{ cursor: 'pointer', position: 'relative' }}>
                {uploading ? 'Uploading...' : '+ Upload Photos'}
                <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => uploadMedia(Array.from(e.target.files), 'photo')}
                  disabled={uploading} />
              </label>
            </div>
            {photos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
                No photos yet. Upload some to appear in the showcase!
              </div>
            ) : (
              <div className="media-grid">
                {photos.map((p) => (
                  <div key={p.id} className="media-thumb">
                    <img src={p.url} alt="" />
                    {p.is_main && <span className="main-badge">MAIN</span>}
                    <div className="media-thumb-actions">
                      {!p.is_main && (
                        <button onClick={() => setMainPhoto(p)} title="Set as main photo">★</button>
                      )}
                      <button onClick={() => deleteMedia(p)} title="Delete" className="delete-btn">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                Videos ({videos.length}/2)
              </h3>
              <label className={`btn btn-sm btn-primary ${videos.length >= 2 ? 'disabled' : ''}`}
                style={{ cursor: videos.length >= 2 ? 'not-allowed' : 'pointer', opacity: videos.length >= 2 ? 0.5 : 1, position: 'relative' }}>
                {uploading ? 'Uploading...' : '+ Upload Video'}
                <input type="file" accept="video/*" style={{ display: 'none' }}
                  onChange={e => uploadMedia(Array.from(e.target.files), 'video')}
                  disabled={uploading || videos.length >= 2} />
              </label>
            </div>
            {videos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
                No videos yet. You can upload up to 2 videos.
              </div>
            ) : (
              <div className="media-grid">
                {videos.map((v) => (
                  <div key={v.id} className="media-thumb video-thumb">
                    <video src={v.url} />
                    <div className="video-play-overlay">▶</div>
                    <div className="media-thumb-actions">
                      <button onClick={() => deleteMedia(v)} title="Delete" className="delete-btn">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Profile Tab ─── */}
      {tab === 'profile' && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-light)' }}>Your Profile</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Stage Name</label>
              <input value={stageName} onChange={e => setStageName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Home Club</label>
              <input value={homeClub} onChange={e => setHomeClub(e.target.value)} placeholder="Where you usually dance" />
            </div>
            <div className="form-group">
              <label>City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Miami" />
            </div>
            <div className="form-group">
              <label>State</label>
              <select value={state} onChange={e => setState(e.target.value)}>
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell clubs about yourself..." style={{ minHeight: '80px' }} />
          </div>

          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>Availability</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            When are you available to work? This shows on your card so clubs and viewers know your schedule.
          </p>
          <div className="form-group">
            <label>Days Available</label>
            <div className="day-picker">
              {ALL_DAYS.map(day => (
                <button key={day} type="button"
                  className={`day-chip ${availDays.includes(day) ? 'active' : ''}`}
                  onClick={() => toggleDay(day)}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Start Time</label>
              <select value={availTimeStart} onChange={e => setAvailTimeStart(e.target.value)}>
                <option value="">Select...</option>
                {['6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM','12:00 AM'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>End Time</label>
              <select value={availTimeEnd} onChange={e => setAvailTimeEnd(e.target.value)}>
                <option value="">Select...</option>
                {['12:00 AM','1:00 AM','2:00 AM','3:00 AM','4:00 AM','5:00 AM','6:00 AM'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
            </div>
          </div>

          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>Social Links</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Paste your full profile URLs. Only filled-in links will show on your card.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Instagram URL</label>
              <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/yourname" />
            </div>
            <div className="form-group">
              <label>Twitter / X URL</label>
              <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://x.com/yourname" />
            </div>
            <div className="form-group">
              <label>OnlyFans URL</label>
              <input value={onlyfans} onChange={e => setOnlyfans(e.target.value)} placeholder="https://onlyfans.com/yourname" />
            </div>
            <div className="form-group">
              <label>Link Hub URL</label>
              <input value={linktree} onChange={e => setLinktree(e.target.value)} placeholder="https://linktr.ee/yourname" />
            </div>
          </div>

          <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ marginTop: '0.5rem' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Club Dashboard ───
function ClubDashboard({ user, onNotificationChange }) {
  const [tab, setTab] = useState('requests');
  const [clubData, setClubData] = useState(null);
  const [houseFee, setHouseFee] = useState('');
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeSaved, setFeeSaved] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const clubName = user?.user_metadata?.club_name || 'Your Club';

  useEffect(() => {
    // Load the club this user claimed
    supabase.from('clubs').select('*').eq('claimed_by', user.id).single().then(({ data }) => {
      if (data) {
        setClubData(data);
        setHouseFee(data.house_fee || '');
        loadRequests(data.id);
      } else {
        setLoadingRequests(false);
      }
    });
  }, [user.id]);

  const loadRequests = async (clubId) => {
    setLoadingRequests(true);
    const { data } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoadingRequests(false);
  };

  const saveHouseFee = async () => {
    if (!clubData) return;
    setFeeSaving(true);
    await supabase.from('clubs').update({ house_fee: houseFee ? parseFloat(houseFee) : null }).eq('id', clubData.id);
    setFeeSaving(false);
    setFeeSaved(true);
    setTimeout(() => setFeeSaved(false), 2000);
  };

  const handleRequest = async (requestId, action) => {
    const newStatus = action === 'confirmed' ? 'confirmed' : 'declined';
    const { error } = await supabase
      .from('booking_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);
    if (error) { console.error(error); return; }

    // Find the request to get dancer info
    const req = requests.find(r => r.id === requestId);
    if (req) {
      // Notify the dancer
      await supabase.from('notifications').insert({
        user_id: req.dancer_id,
        type: newStatus === 'confirmed' ? 'booking_confirmed' : 'booking_declined',
        title: newStatus === 'confirmed' ? 'Booking Confirmed!' : 'Booking Declined',
        message: `${clubData?.name || 'A club'} has ${newStatus} your booking for ${new Date(req.start_date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        booking_request_id: requestId,
      });
    }

    // Refresh
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    onNotificationChange && onNotificationChange();
  };

  // Helper to get dancer display name from request
  const getDancerLabel = (req) => {
    return req.message ? req.message.slice(0, 60) : 'Dancer';
  };

  return (
    <div className="dashboard">
      <h2>{clubData?.name || clubName}</h2>
      <p className="subtitle">Manage your club</p>

      <div className="tab-bar">
        <button className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>Booking Requests</button>
        <button className={`tab ${tab === 'lineup' ? 'active' : ''}`} onClick={() => setTab('lineup')}>Upcoming Lineup</button>
        <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'settings' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Club Settings</h3>
          <div className="form-group">
            <label>House Fee (per night)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>$</span>
              <input
                type="number"
                value={houseFee}
                onChange={e => setHouseFee(e.target.value)}
                placeholder="e.g. 40"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={saveHouseFee} disabled={feeSaving}>
                {feeSaving ? 'Saving...' : feeSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
            <small style={{ color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
              The fee dancers pay you to work for the night. This shows up in their tour planner so they can budget.
            </small>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loadingRequests && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Loading requests...</div>}
          {!loadingRequests && requests.filter(r => r.status === 'pending').length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
              No pending requests right now. New requests will appear here.
            </div>
          )}
          {requests.filter(r => r.status === 'pending').map(req => (
            <div key={req.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0
              }}>💃</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  {req.experience_level && <span className="club-tag" style={{ fontSize: '0.7rem' }}>{req.experience_level}</span>}
                  {req.preferred_shift && <span className="club-tag" style={{ fontSize: '0.7rem' }}>{req.preferred_shift} shift</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Dates: {new Date(req.start_date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {req.end_date && req.end_date !== req.start_date && ` — ${new Date(req.end_date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                </div>
                {req.message && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{req.message}"</div>}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  Sent {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff', border: 'none' }}
                    onClick={() => handleRequest(req.id, 'confirmed')}>Accept</button>
                  <button className="btn btn-sm btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    onClick={() => handleRequest(req.id, 'declined')}>Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'lineup' && (
        <div>
          {requests.filter(r => r.status === 'confirmed').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
              No confirmed dancers yet. Accept booking requests to build your lineup.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.filter(r => r.status === 'confirmed').sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map(req => (
                <div key={req.id} className="tour-stop">
                  <div className="tour-stop-num" style={{ background: 'var(--success)' }}>✓</div>
                  <div className="tour-stop-info">
                    <div style={{ fontWeight: 700 }}>Dancer</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(req.start_date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {req.end_date && req.end_date !== req.start_date && ` — ${new Date(req.end_date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </div>
                    {req.preferred_shift && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{req.preferred_shift} shift • {req.experience_level}</div>}
                  </div>
                  <span className="status-badge status-confirmed">Confirmed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── App ───
function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing');
  const [loading, setLoading] = useState(true);
  const { notifications, unreadCount, markAllRead, reload: reloadNotifications } = useNotifications(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mark notifications read when user opens dashboard
  useEffect(() => {
    if (page === 'dashboard' && unreadCount > 0) {
      markAllRead();
    }
  }, [page]);

  const handleAuth = (user) => {
    setUser(user);
    setPage('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage('landing');
  };

  const role = user?.user_metadata?.role || 'dancer';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <Navbar user={user} page={page} setPage={setPage} onLogout={handleLogout} role={role} unreadCount={unreadCount} />

      {page === 'landing' && <Landing setPage={setPage} />}
      {page === 'signup' && <AuthForm mode="signup" setPage={setPage} onAuth={handleAuth} />}
      {page === 'login' && <AuthForm mode="login" setPage={setPage} onAuth={handleAuth} />}
      {page === 'clubs' && <ClubDirectory setPage={setPage} user={user} />}
      {page === 'dancers' && <DancerShowcase />}
      {page === 'tour-builder' && user && <TourBuilder user={user} />}
      {page === 'claim' && user && <ClaimAccount user={user} setPage={setPage} />}
      {page === 'admin-codes' && user && <AdminClaimCodes user={user} />}
      {page === 'dashboard' && user && (
        role === 'club'
          ? <ClubDashboard user={user} onNotificationChange={reloadNotifications} />
          : <DancerDashboard user={user} setPage={setPage} />
      )}
    </div>
  );
}

// Mount
createRoot(document.getElementById('root')).render(<App />);
