// src/components/Footer.jsx
import logo from '../assets/zaro_logo.jpg';
import { IconInstagram, IconWhatsApp, IconPhone } from './Icons';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: '#040404',
      borderTop: '1px solid var(--border)',
    }}>
      {/* Main footer */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '40px 20px 28px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 40, alignItems: 'start',
      }} className="footer-grid">

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36,
              border: '1px solid var(--border-bright)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img src={logo} alt="Zaro" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--green)', fontSize: '1.3rem',
                letterSpacing: '0.08em',
              }}>ZARO SPORTZ</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)', fontSize: '0.58rem',
                letterSpacing: '0.14em',
                marginTop: 1,
              }}>MANIYUR · KERALA</div>
            </div>
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--muted)',
            fontSize: '0.72rem',
            lineHeight: 1.7,
            letterSpacing: '0.03em',
            maxWidth: 200,
          }}>
            6-a-side Football Turf<br />
            Cricket Nets<br />
            Open 6 AM – 11 PM daily
          </p>
        </div>

        {/* Center rule */}
        <div className="footer-rule" style={{ borderLeft: '1px solid var(--border)', height: '100%', alignSelf: 'stretch' }} />

        {/* Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--muted)',
            letterSpacing: '0.2em',
            marginBottom: 4,
          }}>CONTACT</div>
          {[
            { Icon: IconPhone, text: '+91 70128 90090', href: 'tel:+917012890090' },
            { Icon: IconWhatsApp, text: 'WhatsApp Us', href: 'https://wa.me/917012890090' },
            { Icon: IconInstagram, text: '@zarofootball', href: 'https://www.instagram.com/zarofootball' },
          ].map(c => (
            <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'var(--text-dim)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              <c.Icon size={14} color="currentColor" />
              {c.text}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
        maxWidth: 1100, margin: '0 auto',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
        }}>
          © {year} ZARO SPORTZ. ALL RIGHTS RESERVED.
        </span>
        <a href="/admin" style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--border-bright)',
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.target.style.color = 'var(--muted)'}
          onMouseLeave={e => e.target.style.color = 'var(--border-bright)'}
        >ADMIN</a>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .footer-rule { display: none !important; }
        }
      `}</style>
    </footer>
  );
}
