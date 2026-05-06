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
      {/* Split Hero */}
      <div className="split-hero">
        {/* Left — Tour Builder */}
        <div className="split-side split-left">
          <div className="split-label" style={{ color: 'var(--primary)' }}>TOUR BUILDER</div>
          <h1 className="split-title">
            Build Your<br /><span style={{ color: 'var(--primary)' }}>Next Tour</span>
          </h1>
          <p className="split-subtitle">Browse clubs. Pick dates. Get confirmed.</p>

          {/* Mini tour preview */}
          <div className="tour-preview">
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

          <div className="split-stat-row">
            <div className="split-stat">
              <div className="split-stat-num" style={{ color: 'var(--primary)' }}>{SEED_CLUBS.length}+</div>
              <div className="split-stat-label">Clubs</div>
            </div>
            <div className="split-stat">
              <div className="split-stat-num" style={{ color: 'var(--primary-light)' }}>{uniqueStates}</div>
              <div className="split-stat-label">States</div>
            </div>
            <div className="split-stat">
              <div className="split-stat-num" style={{ color: 'var(--primary)' }}>Free</div>
              <div className="split-stat-label">For Dancers</div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => setPage('signup')}>Start Planning Your Tour</button>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.75rem' }}>Sign up free — browse all clubs instantly</p>
        </div>

        {/* Center Divider Line */}
        <div className="split-divider" />

        {/* Right — Dancer Showcase */}
        <div className="split-side split-right">
          <div className="split-label" style={{ color: 'var(--accent)' }}>DANCER SHOWCASE</div>
          <h1 className="split-title">
            Where The Money<br /><span style={{ color: 'var(--accent)' }}>Looks First</span>
          </h1>
          <p className="split-subtitle">Your profile. Your links. Your spotlight.</p>

          {/* Mini dancer cards */}
          <div className="dancer-preview-row">
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

          <div className="split-features">
            <div>🔗 Social links in one place</div>
            <div>📍 Searchable by state & city</div>
            <div>⭐ Featured profiles for top dancers</div>
          </div>

          <button className="btn btn-accent btn-lg" onClick={() => setPage('signup')}>Create Your Profile</button>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.75rem' }}>Free to join — start getting noticed</p>
        </div>
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

// ─── Dancer Showcase ───
function DancerShowcase() {
  // For now — seed data until real signups happen
  const sampleDancers = [
    { id: 1, name: 'Diamond', city: 'Miami', state: 'Florida', homeClub: "Tootsie's Cabaret", socials: [{ platform: 'IG', handle: '@diamond' }, { platform: 'Twitter', handle: '@diamondx' }] },
    { id: 2, name: 'Coco', city: 'Atlanta', state: 'Georgia', homeClub: 'Magic City', socials: [{ platform: 'IG', handle: '@cocoatl' }] },
    { id: 3, name: 'Jade', city: 'Las Vegas', state: 'Nevada', homeClub: 'Spearmint Rhino', socials: [{ platform: 'IG', handle: '@jadelv' }, { platform: 'Linktree', handle: 'jade.lv' }] },
    { id: 4, name: 'Sapphire', city: 'Houston', state: 'Texas', homeClub: 'XTC Cabaret', socials: [{ platform: 'IG', handle: '@sapphiretx' }] },
    { id: 5, name: 'Raven', city: 'New York', state: 'New York', homeClub: "Rick's Cabaret NYC", socials: [{ platform: 'IG', handle: '@ravennyc' }, { platform: 'OnlyFans', handle: 'ravenx' }] },
    { id: 6, name: 'Luna', city: 'Dallas', state: 'Texas', homeClub: 'Baby Dolls', socials: [{ platform: 'IG', handle: '@lunadallas' }] },
  ];

  const [stateFilter, setStateFilter] = useState('');
  const states = [...new Set(sampleDancers.map(d => d.state))].sort();

  const filtered = stateFilter ? sampleDancers.filter(d => d.state === stateFilter) : sampleDancers;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Dancer Showcase</h2>
        <p>Discover dancers from across the country</p>
      </div>

      <div className="filter-bar">
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="dancer-grid">
        {filtered.map(dancer => (
          <div key={dancer.id} className="dancer-card">
            <div className="dancer-avatar">💃</div>
            <div className="dancer-info">
              <div className="dancer-name">{dancer.name}</div>
              <div className="dancer-location">{dancer.city}, {dancer.state}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Home: {dancer.homeClub}</div>
              <div className="dancer-socials">
                {dancer.socials.map((s, i) => (
                  <span key={i} className="social-link">{s.platform}: {s.handle}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
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
  const stageName = user?.user_metadata?.stage_name || 'Dancer';

  return (
    <div className="dashboard">
      <h2>Hey, {stageName}</h2>
      <p className="subtitle">Manage your tours and profile</p>

      <div className="tab-bar">
        <button className={`tab ${tab === 'tours' ? 'active' : ''}`} onClick={() => setTab('tours')}>My Tours</button>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>My Profile</button>
      </div>

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

      {tab === 'profile' && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-light)' }}>Your Profile</h3>
          <div className="form-group">
            <label>Stage Name</label>
            <input defaultValue={stageName} />
          </div>
          <div className="form-group">
            <label>Home City</label>
            <input placeholder="e.g. Miami, FL" />
          </div>
          <div className="form-group">
            <label>Home Club</label>
            <input placeholder="Where you usually dance" />
          </div>
          <div className="form-group">
            <label>Instagram</label>
            <input placeholder="@yourhandle" />
          </div>
          <div className="form-group">
            <label>Linktree / Link Hub URL</label>
            <input placeholder="https://linktr.ee/yourname" />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea placeholder="Tell clubs about yourself..." style={{ minHeight: '80px' }} />
          </div>
          <button className="btn btn-primary">Save Profile</button>
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
