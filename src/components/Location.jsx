// src/components/Location.jsx
import { useEffect, useRef } from 'react';
import { IconMapPin, IconNavigation } from './Icons';

export default function Location() {
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="location" style={{
      background: 'var(--dark)',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="section-label">WHERE TO FIND US</div>
      <h2 className="section-title">Location</h2>
      <p className="section-sub">Navodaya Road, Guhamukk, Maniyur, Kerala</p>

      <div ref={ref} className="reveal" style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Address strip */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          padding: '12px 16px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <IconMapPin size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.08em',
            lineHeight: 1.5,
          }}>
            NAVODAYA ROAD, GUHAMUKK, MANIYUR, KERALA, INDIA
          </span>
        </div>

        {/* Map */}
        <div style={{
          overflow: 'hidden',
          border: '1px solid var(--border)',
          marginBottom: 2,
        }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.5!2d75.6422527!3d11.5576421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba687e0fbff97b1%3A0x36368057b1be7ab1!2sZaro+Sportz!5e0!3m2!1sen!2sin!4v1"
            width="100%"
            height="300"
            style={{ border: 0, display: 'block', filter: 'grayscale(80%) invert(10%)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Zaro Sportz Location"
          />
        </div>

        {/* CTA buttons */}
        <div className="location-btns" style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <a
            href="https://www.google.com/maps/place/Zaro+Sportz/@11.5576421,75.6422527,17z"
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, minWidth: 140,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--green)', color: '#080808',
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              letterSpacing: '0.1em', textDecoration: 'none',
              transition: 'background 0.2s',
              borderRadius: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#d8ff50'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
          >
            <IconMapPin size={14} color="#080808" />
            OPEN IN GOOGLE MAPS
          </a>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=11.5576421,75.6422527"
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, minWidth: 140,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              letterSpacing: '0.1em', textDecoration: 'none',
              transition: 'all 0.2s',
              borderRadius: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            <IconNavigation size={14} color="currentColor" />
            GET DIRECTIONS
          </a>
        </div>
      </div>
    </section>
  );
}
