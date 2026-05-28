// src/components/AdminLogin.jsx
import { useState } from 'react';
import { IconLock, IconShield } from './Icons';
import logo from '../assets/zaro_logo.jpg';

export default function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = () => {
    if (pw === 'zaro2026') {
      onLogin();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setTimeout(() => setError(false), 2800);
      setPw('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── LEFT PANEL ── */}
      <div className="admin-login-left" style={{
        width: '45%',
        background: '#0a0a0a',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '44px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Radial glows — same as hero */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 320, height: 320,
          background: 'radial-gradient(ellipse at top right, var(--green-dim) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: 240, height: 240,
          background: 'radial-gradient(ellipse at bottom left, var(--green-glow) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{
            width: 36, height: 36,
            border: '1px solid var(--border-bright)',
            overflow: 'hidden', flexShrink: 0, borderRadius: 4,
          }}>
            <img src={logo} alt="Zaro" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--green)', fontSize: '1.1rem', letterSpacing: '0.12em',
          }}>ZARO SPORTZ</div>
        </div>

        {/* Centre — venue photo card + info, mirroring hero right column */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Venue photo card — same style as hero */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
            height: 170,
            background: 'var(--card-bg)',
          }}>
            <img
              src={logo}
              alt="Zaro Sportz"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)',
            }} />
            <div style={{
              position: 'absolute', bottom: 14, left: 16,
              fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff',
              fontSize: '1.05rem', letterSpacing: '0.08em',
            }}>
              ZARO SPORTZ
              <span style={{ color: 'var(--green)', marginLeft: 8, fontSize: '0.8rem' }}>MANIYUR</span>
            </div>
          </div>

          {/* Headline */}
          <div style={{ paddingTop: 8 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem', color: 'var(--green)',
              letterSpacing: '0.2em',
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 16,
            }}>
              <div style={{ width: 16, height: 1, background: 'var(--green)', opacity: 0.5 }} />
              ADMIN ACCESS
            </div>

            <div style={{ fontFamily: 'var(--font-display)', lineHeight: 0.92, letterSpacing: '0.02em' }}>
              <div style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)', color: 'var(--text)' }}>MANAGE</div>
              <div style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)', color: 'var(--green)', margin: '5px 0' }}>BOOKINGS</div>
              <div style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)', color: 'var(--text)' }}>&amp; SLOTS</div>
            </div>

            <p style={{
              marginTop: 18,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.8, letterSpacing: '0.03em',
            }}>
              View and manage all bookings,<br />
              block slots, and track payments.
            </p>
          </div>
        </div>

        {/* Bottom tag */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem', color: 'var(--muted)',
          letterSpacing: '0.16em',
          display: 'flex', alignItems: 'center', gap: 10,
          position: 'relative',
        }}>
          <div style={{ width: 16, height: 1, background: 'var(--border-bright)' }} />
          AUTHORIZED PERSONNEL ONLY
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: '#080808',
      }}>
        <div style={{
          width: '100%', maxWidth: 380,
          animation: shaking ? 'shake 0.35s ease' : 'none',
        }}>

          {/* Mobile-only logo */}
          <div className="admin-mobile-logo" style={{
            display: 'none',
            alignItems: 'center', gap: 12,
            marginBottom: 40,
          }}>
            <div style={{
              width: 36, height: 36,
              border: '1px solid var(--border-bright)',
              overflow: 'hidden', flexShrink: 0, borderRadius: 4,
            }}>
              <img src={logo} alt="Zaro" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--green)', fontSize: '1.2rem', letterSpacing: '0.1em' }}>
                ZARO SPORTZ
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.56rem', letterSpacing: '0.14em', marginTop: 2 }}>
                ADMIN ACCESS
              </div>
            </div>
          </div>

          {/* Shield icon */}
          <div style={{
            width: 52, height: 52,
            border: `1px solid ${error ? 'var(--red)' : 'var(--border-bright)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28,
            background: error ? 'rgba(255,59,59,0.06)' : '#0f0f0f',
            transition: 'all 0.3s', borderRadius: 4,
          }}>
            <IconShield size={22} color={error ? 'var(--red)' : 'var(--green)'} />
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text)', fontSize: '2.2rem',
            letterSpacing: '0.06em', marginBottom: 6, lineHeight: 1,
          }}>ADMIN PANEL</h2>
          <p style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--muted)', fontSize: '0.68rem',
            letterSpacing: '0.12em', marginBottom: 40, lineHeight: 1.4,
          }}>ENTER YOUR CREDENTIALS TO CONTINUE</p>

          {/* Password field */}
          <div style={{ marginBottom: 4 }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem', color: 'var(--green)',
              letterSpacing: '0.16em',
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            }}>
              <IconLock size={11} color="var(--green)" />
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                borderColor: error ? 'var(--red)' : 'var(--border-bright)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem', letterSpacing: '0.2em',
                transition: 'border-color 0.2s',
              }}
              autoFocus
            />
          </div>

          {error && (
            <p style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--red)', fontSize: '0.65rem',
              letterSpacing: '0.1em', marginTop: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ✕ INCORRECT PASSWORD
            </p>
          )}

          <button onClick={handleSubmit} style={{
            width: '100%',
            background: 'var(--green)',
            color: '#000000',
            border: 'none', padding: '15px',
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem', fontWeight: 700,
            letterSpacing: '0.1em', cursor: 'pointer',
            marginTop: 20, borderRadius: 8,
            transition: 'background 0.2s, transform 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d8ff50'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            AUTHENTICATE
          </button>

          <div style={{ marginTop: 24 }}>
            <a href="/" style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--muted)', fontSize: '0.65rem',
              letterSpacing: '0.12em', textDecoration: 'none',
              transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-dim)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              <span style={{ fontSize: '0.8rem' }}>←</span> BACK TO SITE
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-login-left { display: none !important; }
          .admin-mobile-logo { display: flex !important; }
        }
        @media (max-width: 900px) and (min-width: 641px) {
          .admin-login-left { width: 36% !important; padding: 28px !important; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
