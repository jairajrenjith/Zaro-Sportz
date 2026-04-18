// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import logo from '../assets/zaro_logo.jpg';
import { IconMenu, IconX } from './Icons';

const links = ['Home', 'Sports', 'Booking', 'Gallery', 'Location', 'Contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setOpen(false);
    setActive(id);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(8,8,8,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.4s ease',
      padding: '0 16px',
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>

      {/* Logo area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div style={{
          width: 32, height: 32,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid var(--border-bright)',
          flexShrink: 0,
        }}>
          <img src={logo} alt="Zaro" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            color: 'var(--green)',
            letterSpacing: '0.1em',
          }}>ZARO SPORTZ</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: 'var(--muted)',
            letterSpacing: '0.15em',
            marginTop: 1,
          }}>MANIYUR · KERALA</span>
        </div>
      </div>

      {/* Desktop links */}
      <ul style={{ display: 'flex', gap: 0, listStyle: 'none', alignItems: 'center' }} className="nav-desktop">
        {links.map(l => (
          <li key={l}>
            <button onClick={() => scrollTo(l)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: active === l ? 'var(--green)' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem', letterSpacing: '0.12em',
              transition: 'color 0.2s', padding: '8px 16px',
              position: 'relative',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = active === l ? 'var(--green)' : 'var(--text-dim)'}
            >{l.toUpperCase()}
              {active === l && (
                <span style={{
                  position: 'absolute', bottom: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4, height: 4,
                  background: 'var(--green)',
                  borderRadius: '50%',
                }} />
              )}
            </button>
          </li>
        ))}
        <li style={{ marginLeft: 8 }}>
          <a href="/admin" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--muted)',
            textDecoration: 'none',
            letterSpacing: '0.12em',
            padding: '6px 12px',
            border: '1px solid var(--border)',
            borderRadius: 2,
            transition: 'all 0.2s',
            display: 'inline-block',
          }}
            onMouseEnter={e => {
              e.target.style.borderColor = 'var(--border-bright)';
              e.target.style.color = 'var(--text-dim)';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.color = 'var(--muted)';
            }}
          >ADMIN</a>
        </li>
      </ul>

      {/* Hamburger */}
      <button onClick={() => setOpen(!open)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'none', padding: 8,
        minWidth: 40, minHeight: 40,
        alignItems: 'center', justifyContent: 'center',
      }} className="hamburger" aria-label="menu">
        {open ? <IconX size={22} color="var(--green)" /> : <IconMenu size={22} color="var(--green)" />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(8,8,8,0.99)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '8px 0 20px',
          animation: 'slideUp 0.2s ease',
        }}>
          {links.map(l => (
            <button key={l} onClick={() => scrollTo(l)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active === l ? 'var(--green)' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem', letterSpacing: '0.14em',
              padding: '15px 20px',
              transition: 'color 0.2s',
              borderLeft: active === l ? '2px solid var(--green)' : '2px solid transparent',
            }}>{l.toUpperCase()}</button>
          ))}
          <a href="/admin" style={{
            display: 'block', padding: '12px 20px',
            color: 'var(--muted)', fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem', letterSpacing: '0.14em', textDecoration: 'none',
          }}>ADMIN</a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
