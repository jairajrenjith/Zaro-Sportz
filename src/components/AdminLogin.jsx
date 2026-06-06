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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 400, height: 400,
        background: 'radial-gradient(ellipse at top right, var(--green-dim) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: 300, height: 300,
        background: 'radial-gradient(ellipse at bottom left, var(--green-glow) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 400,
        animation: shaking ? 'shake 0.35s ease' : 'none',
        position: 'relative',
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center', gap: 12,
          marginBottom: 48,
          justifyContent: 'center',
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

        <div style={{
          width: 56, height: 56,
          border: `1px solid ${error ? 'var(--red)' : 'var(--border-bright)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
          background: error ? 'rgba(255,59,59,0.06)' : '#0f0f0f',
          transition: 'all 0.3s', borderRadius: 6,
          margin: '0 auto 28px',
        }}>
          <IconShield size={24} color={error ? 'var(--red)' : 'var(--green)'} />
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text)', fontSize: '2.4rem',
          letterSpacing: '0.06em', marginBottom: 6, lineHeight: 1,
          textAlign: 'center',
        }}>ADMIN PANEL</h2>
        <p style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)', fontSize: '0.68rem',
          letterSpacing: '0.12em', marginBottom: 40, lineHeight: 1.4,
          textAlign: 'center',
        }}>ENTER YOUR CREDENTIALS TO CONTINUE</p>

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

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/" style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--muted)', fontSize: '0.65rem',
            letterSpacing: '0.12em', textDecoration: 'none',
            transition: 'color 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-dim)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <span style={{ fontSize: '0.8rem' }}>←</span> BACK TO SITE
          </a>
        </div>
      </div>

      <style>{`
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
