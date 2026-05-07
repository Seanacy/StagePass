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

// ─── Seed Data: Strip Clubs ───
const SEED_CLUBS = [
  // Florida
  { name: "Tootsie's Cabaret", city: "Miami", state: "Florida", address: "150 NW 183rd St, Miami Gardens, FL 33169", phone: "(305) 651-5822", type: "Full Nude", size: "Large" },
  { name: "Scarlett's Cabaret", city: "Miami", state: "Florida", address: "2920 SW 30th Ave, Hallandale Beach, FL 33009", phone: "(954) 457-5765", type: "Full Nude", size: "Large" },
  { name: "Mons Venus", city: "Tampa", state: "Florida", address: "2040 N Dale Mabry Hwy, Tampa, FL 33607", phone: "(813) 875-6667", type: "Full Nude", size: "Medium" },
  { name: "Deja Vu Tampa", city: "Tampa", state: "Florida", address: "6314 S Dale Mabry Hwy, Tampa, FL 33611", phone: "(813) 831-7700", type: "Full Nude", size: "Medium" },
  { name: "Rachel's Orlando", city: "Orlando", state: "Florida", address: "8401 S Orange Blossom Trl, Orlando, FL 32809", phone: "(407) 857-8825", type: "Full Nude", size: "Large" },
  { name: "Lido Cabaret", city: "Jacksonville", state: "Florida", address: "5535 Philips Hwy, Jacksonville, FL 32207", phone: "(904) 733-3330", type: "Bikini", size: "Medium" },

  // Texas
  { name: "XTC Cabaret", city: "Houston", state: "Texas", address: "7530 N Sam Houston Pkwy E, Humble, TX 77396", phone: "(281) 821-8099", type: "Full Nude", size: "Large" },
  { name: "Baby Dolls", city: "Dallas", state: "Texas", address: "10250 Shady Trail, Dallas, TX 75220", phone: "(214) 358-8tried ", type: "Full Nude", size: "Large" },
  { name: "Perfect 10", city: "Dallas", state: "Texas", address: "10477 Composite Dr, Dallas, TX 75220", phone: "(214) 630-0906", type: "Full Nude", size: "Medium" },
  { name: "Palazio Cabaret", city: "Austin", state: "Texas", address: "401 E Highland Mall Blvd, Austin, TX 78752", phone: "(512) 467-8822", type: "Bikini", size: "Medium" },
  { name: "Sugar's", city: "Houston", state: "Texas", address: "4540 Bissonnet St, Houston, TX 77401", phone: "(713) 668-2781", type: "Full Nude", size: "Large" },
  { name: "Rick's Cabaret", city: "San Antonio", state: "Texas", address: "10030 Luminance, San Antonio, TX 78249", phone: "(210) 408-2535", type: "Full Nude", size: "Medium" },

  // Georgia
  { name: "Magic City", city: "Atlanta", state: "Georgia", address: "241 Forsyth St SW, Atlanta, GA 30303", phone: "(404) 331-4799", type: "Full Nude", size: "Large" },
  { name: "Cheetah Lounge", city: "Atlanta", state: "Georgia", address: "887 Spring St NW, Atlanta, GA 30308", phone: "(404) 892-3037", type: "Full Nude", size: "Large" },
  { name: "Allure", city: "Atlanta", state: "Georgia", address: "2788 Metropolitan Pkwy SW, Atlanta, GA 30315", phone: "(404) 209-9798", type: "Full Nude", size: "Medium" },
  { name: "Onyx", city: "Atlanta", state: "Georgia", address: "2801 Metropolitan Pkwy SW, Atlanta, GA 30315", phone: "(404) 209-0990", type: "Full Nude", size: "Large" },

  // Nevada
  { name: "Spearmint Rhino", city: "Las Vegas", state: "Nevada", address: "3340 S Highland Dr, Las Vegas, NV 89109", phone: "(702) 796-3600", type: "Full Nude", size: "Large" },
  { name: "Sapphire", city: "Las Vegas", state: "Nevada", address: "3025 Sammy Davis Jr Dr, Las Vegas, NV 89109", phone: "(702) 796-6000", type: "Full Nude", size: "Large" },
  { name: "Crazy Horse III", city: "Las Vegas", state: "Nevada", address: "3525 W Russell Rd, Las Vegas, NV 89118", phone: "(702) 673-1700", type: "Full Nude", size: "Large" },
  { name: "Deja Vu Showgirls", city: "Las Vegas", state: "Nevada", address: "3247 Sammy Davis Jr Dr, Las Vegas, NV 89109", phone: "(702) 894-4167", type: "Full Nude", size: "Medium" },

  // New York
  { name: "Sapphire 60", city: "New York", state: "New York", address: "20 W 20th St, New York, NY 10011", phone: "(212) 206-8188", type: "Topless", size: "Medium" },
  { name: "Rick's Cabaret NYC", city: "New York", state: "New York", address: "50 W 33rd St, New York, NY 10001", phone: "(212) 279-8800", type: "Topless", size: "Large" },
  { name: "Hustler Club NYC", city: "New York", state: "New York", address: "641 W 51st St, New York, NY 10019", phone: "(212) 247-2460", type: "Topless", size: "Large" },

  // California
  { name: "Seventh Veil", city: "Los Angeles", state: "California", address: "7180 Sunset Blvd, Hollywood, CA 90046", phone: "(323) 851-7447", type: "Full Nude", size: "Medium" },
  { name: "Deja Vu Hollywood", city: "Los Angeles", state: "California", address: "7969 Santa Monica Blvd, Los Angeles, CA 90046", phone: "(323) 656-6461", type: "Full Nude", size: "Medium" },
  { name: "Gold Club SF", city: "San Francisco", state: "California", address: "650 Howard St, San Francisco, CA 94105", phone: "(415) 536-0300", type: "Full Nude", size: "Large" },
  { name: "Centerfolds", city: "San Francisco", state: "California", address: "391 Broadway, San Francisco, CA 94133", phone: "(415) 677-7625", type: "Full Nude", size: "Medium" },

  // Illinois
  { name: "Admirals Theatre", city: "Chicago", state: "Illinois", address: "3940 W Lawrence Ave, Chicago, IL 60625", phone: "(773) 478-8263", type: "Full Nude", size: "Medium" },
  { name: "VIP's Gentlemen's Club", city: "Chicago", state: "Illinois", address: "1621 N Harlem Ave, Elmwood Park, IL 60707", phone: "(708) 452-6400", type: "Full Nude", size: "Medium" },

  // Arizona
  { name: "Bourbon Street Circus", city: "Phoenix", state: "Arizona", address: "4341 W Thomas Rd, Phoenix, AZ 85031", phone: "(602) 233-8879", type: "Full Nude", size: "Medium" },
  { name: "Hi-Liter", city: "Phoenix", state: "Arizona", address: "1620 N Black Canyon Hwy, Phoenix, AZ 85009", phone: "(602) 254-1601", type: "Full Nude", size: "Large" },
  { name: "Skin Cabaret", city: "Scottsdale", state: "Arizona", address: "4240 N Craftsman Ct, Scottsdale, AZ 85251", phone: "(480) 947-7456", type: "Bikini", size: "Medium" },

  // North Carolina
  { name: "Blush", city: "Charlotte", state: "North Carolina", address: "3500 S Blvd, Charlotte, NC 28209", phone: "(704) 527-0808", type: "Topless", size: "Medium" },
  { name: "Uptown Cabaret", city: "Charlotte", state: "North Carolina", address: "3218 S Blvd, Charlotte, NC 28209", phone: "(704) 523-3377", type: "Topless", size: "Large" },

  // Louisiana
  { name: "Rick's Cabaret NOLA", city: "New Orleans", state: "Louisiana", address: "315 Bourbon St, New Orleans, LA 70130", phone: "(504) 524-4222", type: "Full Nude", size: "Medium" },
  { name: "Hustler Club NOLA", city: "New Orleans", state: "Louisiana", address: "225 Bourbon St, New Orleans, LA 70130", phone: "(504) 568-1313", type: "Topless", size: "Large" },

  // Ohio
  { name: "Diamond Fox", city: "Columbus", state: "Ohio", address: "886 W Broad St, Columbus, OH 43222", phone: "(614) 228-0200", type: "Full Nude", size: "Medium" },

  // Michigan
  { name: "Bouzouki", city: "Detroit", state: "Michigan", address: "432 Monroe St, Detroit, MI 48226", phone: "(313) 964-5744", type: "Full Nude", size: "Large" },
  { name: "Flight Club", city: "Detroit", state: "Michigan", address: "29709 Michigan Ave, Inkster, MI 48141", phone: "(734) 721-5540", type: "Full Nude", size: "Medium" },

  // Colorado
  { name: "Shotgun Willie's", city: "Denver", state: "Colorado", address: "490 S Colorado Blvd, Denver, CO 80246", phone: "(303) 399-2110", type: "Full Nude", size: "Large" },
  { name: "Diamond Cabaret", city: "Denver", state: "Colorado", address: "1222 Glenarm Pl, Denver, CO 80204", phone: "(303) 571-4242", type: "Full Nude", size: "Medium" },

  // Tennessee
  { name: "Deja Vu Nashville", city: "Nashville", state: "Tennessee", address: "218 Printers Alley, Nashville, TN 37201", phone: "(615) 244-7256", type: "Topless", size: "Medium" },

  // Washington
  { name: "Deja Vu Seattle", city: "Seattle", state: "Washington", address: "1538 Western Ave, Seattle, WA 98101", phone: "(206) 624-5610", type: "Full Nude", size: "Medium" },

  // Oregon
  { name: "Casa Diablo", city: "Portland", state: "Oregon", address: "2839 NW St Helens Rd, Portland, OR 97210", phone: "(503) 222-6600", type: "Full Nude", size: "Small" },
  { name: "Acropolis Steakhouse", city: "Portland", state: "Oregon", address: "8325 SE McLoughlin Blvd, Portland, OR 97202", phone: "(503) 231-9611", type: "Full Nude", size: "Medium" },

  // New Jersey
  { name: "Satin Dolls", city: "Lodi", state: "New Jersey", address: "230 NJ-17, Lodi, NJ 07644", phone: "(201) 845-2113", type: "Topless", size: "Large" },

  // Pennsylvania
  { name: "Club Risque", city: "Philadelphia", state: "Pennsylvania", address: "1700 S Columbus Blvd, Philadelphia, PA 19148", phone: "(215) 468-2010", type: "Full Nude", size: "Large" },
  { name: "Cheerleaders", city: "Philadelphia", state: "Pennsylvania", address: "2740 S Front St, Philadelphia, PA 19148", phone: "(215) 218-8400", type: "Full Nude", size: "Medium" },

  // South Carolina
  { name: "Platinum Plus", city: "Columbia", state: "South Carolina", address: "820 Harden St, Columbia, SC 29205", phone: "(803) 254-1000", type: "Full Nude", size: "Medium" },

  // Maryland
  { name: "Norma Jean's", city: "Baltimore", state: "Maryland", address: "5056 Washington Blvd, Halethorpe, MD 21227", phone: "(410) 789-8118", type: "Full Nude", size: "Medium" },
].map((c, i) => ({ ...c, id: `club_${i + 1}` }));

// ─── Navbar ───
function Navbar({ user, page, setPage, onLogout, role }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => setPage('landing')}>
        Stage<span className="green">Pass</span>
      </div>
      <div className="navbar-links">
        <a href="#" onClick={(e) => { e.preventDefault(); setPage('clubs'); }}>Clubs</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setPage('dancers'); }}>Dancers</a>
        {user ? (
          <>
            <a href="#" onClick={(e) => { e.preventDefault(); setPage('dashboard'); }}>Dashboard</a>
            <button onClick={onLogout}>Log Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-secondary" onClick={() => setPage('login')}>Log In</button>
            <button className="btn btn-sm btn-primary" onClick={() => setPage('signup')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Landing Page ───
function Landing({ setPage }) {
  const uniqueStates = [...new Set(SEED_CLUBS.map(c => c.state))].length;

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
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{SEED_CLUBS.length}+</div>
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
              <div>✓ {SEED_CLUBS.length}+ clubs across {uniqueStates} states</div>
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
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const states = [...new Set(SEED_CLUBS.map(c => c.state))].sort();
  const types = [...new Set(SEED_CLUBS.map(c => c.type))].sort();

  const filtered = SEED_CLUBS.filter(c => {
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
        <p>{SEED_CLUBS.length} clubs across {states.length} states</p>
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
              <button className="btn btn-sm btn-primary" style={{ marginTop: '0.75rem' }}
                onClick={() => setPage('tour-builder')}>
                + Add to Tour
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            No clubs match your search. Try a different state or keyword.
          </div>
        )}
      </div>
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
  return SEED_CLUBS.find(c => c.name.toLowerCase() === lower) || null;
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
function TourBuilder({ user }) {
  const [tourStops, setTourStops] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const addStop = () => {
    if (!selectedClub || !date) return;
    const club = SEED_CLUBS.find(c => c.id === selectedClub);
    if (!club) return;
    setTourStops(prev => [...prev, {
      id: Date.now(),
      club,
      date,
      notes,
      status: 'pending',
    }]);
    setSelectedClub('');
    setDate('');
    setNotes('');
  };

  const removeStop = (id) => {
    setTourStops(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="dashboard">
      <h2>Build Your Tour</h2>
      <p className="subtitle">Pick clubs, choose dates, and submit booking requests.</p>

      {/* Add Stop Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-light)' }}>Add a Stop</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label>Club</label>
            <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}>
              <option value="">Select a club...</option>
              {SEED_CLUBS.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name)).map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.city}, {c.state}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Notes for the club (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Available for 2 nights, experienced with VIP rooms" />
        </div>
        <button className="btn btn-primary" onClick={addStop} disabled={!selectedClub || !date}>Add to Tour</button>
      </div>

      {/* Tour Timeline */}
      {tourStops.length > 0 ? (
        <>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Tour ({tourStops.length} stops)</h3>
          <div className="tour-timeline">
            {tourStops.sort((a, b) => new Date(a.date) - new Date(b.date)).map((stop, i) => (
              <div key={stop.id} className="tour-stop">
                <div className="tour-stop-num">{i + 1}</div>
                <div className="tour-stop-info">
                  <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{stop.club.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    {stop.club.city}, {stop.club.state} — {new Date(stop.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  {stop.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>"{stop.notes}"</div>}
                </div>
                <span className={`status-badge status-${stop.status}`}>{stop.status}</span>
                <button onClick={() => removeStop(stop.id)} style={{
                  background: 'none', border: 'none', color: 'var(--danger)',
                  cursor: 'pointer', fontSize: '1rem', padding: '0.25rem'
                }}>✕</button>
              </div>
            ))}
          </div>
          <button className="btn btn-accent" style={{ marginTop: '1.5rem', width: '100%' }}>
            Submit All Booking Requests
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

// ─── Dancer Dashboard ───
function DancerDashboard({ user, setPage }) {
  const [tab, setTab] = useState('tours');
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
        <button className={`tab ${tab === 'tours' ? 'active' : ''}`} onClick={() => setTab('tours')}>My Tours</button>
        <button className={`tab ${tab === 'media' ? 'active' : ''}`} onClick={() => setTab('media')}>My Media</button>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>My Profile</button>
      </div>

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
function ClubDashboard({ user }) {
  const [tab, setTab] = useState('requests');
  const clubName = user?.user_metadata?.club_name || 'Your Club';

  // Sample booking requests for demo
  const sampleRequests = [
    { id: 1, dancer: 'Diamond', date: '2026-05-15', status: 'pending', notes: 'Available for 2 nights, 5 years experience' },
    { id: 2, dancer: 'Luna', date: '2026-05-20', status: 'pending', notes: 'Featured at Baby Dolls Dallas, touring through your city' },
  ];

  const [requests, setRequests] = useState(sampleRequests);

  const handleRequest = (id, action) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="dashboard">
      <h2>{clubName}</h2>
      <p className="subtitle">Manage your incoming booking requests</p>

      <div className="tab-bar">
        <button className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>Booking Requests</button>
        <button className={`tab ${tab === 'lineup' ? 'active' : ''}`} onClick={() => setTab('lineup')}>Upcoming Lineup</button>
      </div>

      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.filter(r => r.status === 'pending').length === 0 && (
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
                <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{req.dancer}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Requested: {new Date(req.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {req.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{req.notes}"</div>}
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
              {requests.filter(r => r.status === 'confirmed').map(req => (
                <div key={req.id} className="tour-stop">
                  <div className="tour-stop-num" style={{ background: 'var(--success)' }}>✓</div>
                  <div className="tour-stop-info">
                    <div style={{ fontWeight: 700 }}>{req.dancer}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(req.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
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
      <Navbar user={user} page={page} setPage={setPage} onLogout={handleLogout} role={role} />

      {page === 'landing' && <Landing setPage={setPage} />}
      {page === 'signup' && <AuthForm mode="signup" setPage={setPage} onAuth={handleAuth} />}
      {page === 'login' && <AuthForm mode="login" setPage={setPage} onAuth={handleAuth} />}
      {page === 'clubs' && <ClubDirectory setPage={setPage} user={user} />}
      {page === 'dancers' && <DancerShowcase />}
      {page === 'tour-builder' && user && <TourBuilder user={user} />}
      {page === 'dashboard' && user && (
        role === 'club' ? <ClubDashboard user={user} /> : <DancerDashboard user={user} setPage={setPage} />
      )}
    </div>
  );
}

// Mount
createRoot(document.getElementById('root')).render(<App />);
