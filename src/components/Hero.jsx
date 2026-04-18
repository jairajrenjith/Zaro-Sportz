// src/components/Hero.jsx
import { useEffect, useRef } from 'react';
import logo from '../assets/zaro_logo.jpg';
import { IconArrowRight, IconClock, IconMapPin } from './Icons';

const STATS = [
  { value: '6-A-SIDE', label: 'Football Format' },
  { value: 'NETS', label: 'Cricket Practice' },
  { value: '17HRS', label: 'Daily Open' },
  { value: '2024', label: 'Established' },
];

export default function Hero() {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setTimeout(() => el.classList.add('visible'), 80);
  }, []);

  return (
    <section id="home" className="hero-section" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0',
      background: '#080808',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(200,241,53,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,241,53,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />

      {/* Top-right accent corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 340, height: 340,
        background: 'radial-gradient(ellipse at top right, rgba(200,241,53,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />


      {/* Main content */}
      <div ref={ref} className="reveal hero-outer">
        <div className="hero-grid" style={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center',
        }}>

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Overline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 1, background: 'var(--green)', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: 'var(--green)', letterSpacing: '0.16em',
              }}>MANIYUR · KERALA · EST. 2024</span>
            </div>

            {/* Big title — inline on mobile if space allows, stacked on desktop left col */}
            <div className="hero-title-wrap" style={{ marginBottom: 28 }}>
              <span className="hero-title-zaro" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.2rem, 12vw, 9rem)',
                color: 'var(--text)', lineHeight: 0.9,
                letterSpacing: '0.02em',
                display: 'inline-block',
              }}>ZARO</span>
              <span className="hero-title-space">&nbsp;</span>
              <span className="hero-title-sportz" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.2rem, 12vw, 9rem)',
                color: 'var(--green)', lineHeight: 0.9,
                letterSpacing: '0.02em',
                WebkitTextStroke: '1px var(--green)',
                display: 'inline-block',
              }}>SPORTZ</span>
            </div>

            {/* Sub tagline */}
            <p style={{
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-dim)',
              fontSize: 'clamp(0.82rem, 2.2vw, 1.05rem)',
              maxWidth: 440, lineHeight: 1.65,
              marginBottom: 36, fontWeight: 400,
            }}>
              6-a-side football turf &amp; cricket nets — fully floodlit, open every day.
              Kick start your passion.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <button className="btn" onClick={() =>
                document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
              } style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                BOOK A SLOT
                <IconArrowRight size={16} color="#080808" />
              </button>
              <button className="btn btn-outline" onClick={() =>
                document.getElementById('sports')?.scrollIntoView({ behavior: 'smooth' })
              }>
                VIEW SPORTS
              </button>
            </div>

            {/* Info pills */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)',
              }}>
                <IconClock size={14} color="var(--green)" />
                6:00 AM – 11:00 PM DAILY
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)',
              }}>
                <IconMapPin size={14} color="var(--green)" />
                NAVODAYA ROAD, GUHAMUKK
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="hero-right" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Logo / venue photo card */}
            <div style={{
              border: '1px solid var(--border)',
              overflow: 'hidden',
              position: 'relative',
              height: 190,
              background: '#0d0d0d',
            }}>
              <img
                src={logo}
                alt="Zaro Sportz"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(8,8,8,0.85) 0%, transparent 55%)',
              }} />
              <div style={{
                position: 'absolute', bottom: 14, left: 16,
                fontFamily: 'var(--font-display)', color: 'var(--text)',
                fontSize: '1.1rem', letterSpacing: '0.08em',
              }}>
                ZARO SPORTZ
                <span style={{ color: 'var(--green)', marginLeft: 8, fontSize: '0.85rem' }}>MANIYUR</span>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2,
            }}>
              {STATS.map((s, i) => (
                <div key={i} style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  padding: '16px 18px',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161810'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--green)', fontSize: '1.5rem',
                    letterSpacing: '0.04em', lineHeight: 1,
                    marginBottom: 4,
                  }}>{s.value}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', color: 'var(--muted)',
                    fontSize: '0.6rem', letterSpacing: '0.12em',
                  }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Quick book strip */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.58rem', letterSpacing: '0.14em', marginBottom: 3 }}>
                  SLOTS FROM
                </div>
                <div style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', fontSize: '1.4rem', letterSpacing: '0.04em' }}>
                  RS. 1,000<span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}> / HR</span>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  background: 'var(--green)', color: '#080808',
                  border: 'none', padding: '10px 18px',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0,
                  transition: 'background 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#d8ff50'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
              >
                BOOK NOW →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — hidden on mobile to avoid overlap */}
      <div className="scroll-indicator" style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        animation: 'bounce 2s ease-in-out infinite',
      }}>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="#555550" strokeWidth="1.5"/>
          <rect x="6.5" y="5" width="3" height="6" rx="1.5" fill="#c8f135"/>
        </svg>
      </div>

      <style>{`
        /* Desktop */
        .hero-outer {
          padding: 80px 40px 60px;
          width: 100%;
        }

        /* Desktop: always stack ZARO / SPORTZ on two lines (left col is narrow) */
        @media (min-width: 769px) {
          .hero-title-zaro,
          .hero-title-sportz {
            display: block !important;
          }
          .hero-title-space { display: none; }
        }

        /* Mobile: single column */
        @media (max-width: 768px) {
          .hero-outer {
            padding: 72px 16px 48px !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .hero-right {
            display: flex !important;
          }
          .scroll-indicator {
            display: none !important;
          }
          .hero-section {
            min-height: unset !important;
          }
          /* One-line title on mobile — fits nicely on >=360px screens */
          .hero-title-wrap {
            white-space: nowrap;
            line-height: 0.92;
            margin-bottom: 24px;
          }
          .hero-title-zaro,
          .hero-title-sportz {
            display: inline-block !important;
            font-size: clamp(2.6rem, 14vw, 4.6rem) !important;
          }
        }

        /* Very small phones (<=320px): allow wrap to two lines */
        @media (max-width: 320px) {
          .hero-title-wrap { white-space: normal; }
          .hero-title-zaro,
          .hero-title-sportz {
            display: block !important;
            font-size: clamp(2.4rem, 18vw, 3.8rem) !important;
          }
          .hero-title-space { display: none; }
        }

        @media (max-width: 480px) {
          .hero-outer {
            padding: 70px 14px 40px !important;
          }
          .hero-right > div:first-child {
            height: 150px !important;
          }
        }
      `}</style>
    </section>
  );
}
