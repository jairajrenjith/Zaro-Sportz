// src/components/Contact.jsx
import { useEffect, useRef } from 'react';
import { IconPhone, IconWhatsApp, IconInstagram, IconClock } from './Icons';

export default function Contact() {
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const contacts = [
    {
      Icon: IconPhone,
      label: 'Call Us',
      value: '+91 70128 90090',
      href: 'tel:+917012890090',
      accentColor: 'var(--green)',
    },
    {
      Icon: IconWhatsApp,
      label: 'WhatsApp',
      value: 'Chat on WhatsApp',
      href: 'https://wa.me/917012890090',
      accentColor: '#25D366',
    },
    {
      Icon: IconInstagram,
      label: 'Instagram',
      value: '@zarofootball',
      href: 'https://www.instagram.com/zarofootball?igsh=dHUxMWo0eTVvY2Vl',
      accentColor: '#E1306C',
    },
  ];

  return (
    <section id="contact" style={{
      background: 'var(--dark)',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="section-label">GET IN TOUCH</div>
      <h2 className="section-title">Contact <span>Us</span></h2>
      <p className="section-sub">Enquiries, bookings and support</p>

      <div ref={ref} className="reveal stagger contact-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 2,
        maxWidth: 740, margin: '0 auto 2px',
        border: '1px solid var(--border)',
      }}>
        {contacts.map((c, i) => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 14, padding: 'clamp(18px, 4vw, 28px) clamp(14px, 3vw, 24px)',
              background: 'var(--card-bg)',
              borderRight: i < contacts.length - 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none',
              transition: 'background 0.25s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#141414';
              e.currentTarget.querySelector('.contact-accent').style.opacity = '1';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.querySelector('.contact-accent').style.opacity = '0';
            }}
          >
            {/* Accent bar */}
            <div className="contact-accent" style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 2,
              background: c.accentColor,
              opacity: 0,
              transition: 'opacity 0.25s',
            }} />

            <div style={{
              width: 38, height: 38,
              border: `1px solid ${c.accentColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${c.accentColor}08`,
              flexShrink: 0,
            }}>
              <c.Icon size={17} color={c.accentColor} />
            </div>

            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                marginBottom: 4,
              }}>{c.label.toUpperCase()}</div>
              <div style={{
                color: 'var(--text)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                fontWeight: 600,
                fontFamily: 'var(--font-ui)',
                wordBreak: 'break-word',
              }}>{c.value}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Hours */}
      <div style={{
        maxWidth: 740, margin: '0 auto',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderTop: 'none',
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconClock size={16} color="var(--green)" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--muted)',
            letterSpacing: '0.12em',
          }}>OPENING HOURS</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text)',
          letterSpacing: '0.06em',
        }}>
          <span style={{ color: 'var(--muted)', marginRight: 12 }}>MON – SUN</span>
          6:00 AM – 11:00 PM
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-grid > a {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
            flex-direction: row !important;
            align-items: center !important;
            gap: 16px !important;
          }
          .contact-grid > a:last-child {
            border-bottom: none;
          }
        }
      `}</style>
    </section>
  );
}
