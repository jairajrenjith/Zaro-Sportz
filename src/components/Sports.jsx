// src/components/Sports.jsx
import { useEffect, useRef } from 'react';
import { IconFootball, IconCricket } from './Icons';
import footballImg from '../assets/sports/football.jpg';
import cricketImg from '../assets/sports/cricket.jpg';

const sports = [
  {
    name: 'Football',
    sub: '6-a-side',
    Icon: IconFootball,
    img: footballImg,
    desc: 'Full-turf 6\'s football. Floodlit arena for day and night games. Professional astroturf surface maintained to match standard.',
    features: ['Floodlit Turf', '6-a-side Format', 'Night Games', 'Astroturf Surface'],
  },
  {
    name: 'Cricket',
    sub: 'Nets',
    Icon: IconCricket,
    img: cricketImg,
    desc: 'Professional cricket nets with quality pitch surface. Perfect for serious practice sessions, batting drills and bowling run-ups.',
    features: ['Cricket Nets', 'Quality Pitch', 'Batting & Bowling', 'Practice Sessions'],
  },
];

export default function Sports() {
  const refs = useRef([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    refs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="sports" style={{
      background: 'var(--dark)',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="section-label">WHAT WE OFFER</div>
      <h2 className="section-title">Available <span>Sports</span></h2>
      <p className="section-sub">Choose your game. Own the field.</p>

      <div className="sports-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 2,
        maxWidth: 900, margin: '0 auto',
        border: '1px solid var(--border)',
      }}>
        {sports.map((s, i) => (
          <div
            key={s.name}
            ref={el => refs.current[i] = el}
            className="reveal"
            style={{
              background: 'var(--card-bg)',
              padding: 'clamp(20px, 5vw, 36px) clamp(16px, 4vw, 32px)',
              position: 'relative',
              transition: 'background 0.3s',
              cursor: 'default',
              borderRight: i === 0 ? '1px solid var(--border)' : 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#161810'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
          >
            {/* Image area */}
            <div style={{
              height: 220,
              borderRadius: 2,
              marginBottom: 24,
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--border)',
            }}>
              <img
                src={s.img}
                alt={s.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              {/* subtle bottom vignette only — keeps image clear */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(8,8,8,0.45) 0%, transparent 45%)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Sport name */}
            <div style={{ marginBottom: 6 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: 'var(--green)', letterSpacing: '0.2em',
              }}>{s.sub.toUpperCase()}</span>
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)', color: 'var(--text)',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', letterSpacing: '0.06em', marginBottom: 14,
            }}>{s.name.toUpperCase()}</h3>

            <p style={{
              color: 'var(--text-dim)', fontSize: '0.85rem',
              lineHeight: 1.65, marginBottom: 24, fontWeight: 400,
              fontFamily: 'var(--font-mono)',
            }}>{s.desc}</p>

            {/* Feature tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {s.features.map(f => (
                <span key={f} style={{
                  background: 'transparent', border: '1px solid var(--border-bright)',
                  color: 'var(--text-dim)', fontSize: '0.66rem',
                  padding: '4px 8px', borderRadius: 1,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                }}>{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 560px) {
          .sports-grid {
            grid-template-columns: 1fr !important;
          }
          .sports-grid > div {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .sports-grid > div:last-child {
            border-bottom: none;
          }
        }
      `}</style>
    </section>
  );
}
