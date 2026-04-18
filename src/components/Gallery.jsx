// src/components/Gallery.jsx
import { useState, useEffect, useRef } from 'react';
import { IconX } from './Icons';

const images = Array.from({ length: 10 }, (_, i) => ({
  src: `/src/assets/gallery/${i + 1}.png`,
  alt: `Zaro Sportz - Field ${i + 1}`,
}));

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft' && lightbox !== null) setLightbox(l => Math.max(0, l - 1));
      if (e.key === 'ArrowRight' && lightbox !== null) setLightbox(l => Math.min(images.length - 1, l + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  return (
    <section id="gallery" style={{
      background: '#080808',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="section-label">THE FIELD</div>
      <h2 className="section-title">Gallery</h2>
      <p className="section-sub">Moments from Zaro Sportz</p>

      <div ref={ref} className="reveal gallery-grid">
        {images.map((img, i) => (
          <div key={i} onClick={() => setLightbox(i)} style={{
            aspectRatio: '1',
            background: '#111',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-bright)';
              e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
              e.currentTarget.querySelector('img').style.opacity = '0.8';
              e.currentTarget.querySelector('.overlay').style.opacity = '1';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.querySelector('img').style.transform = 'scale(1)';
              e.currentTarget.querySelector('img').style.opacity = '1';
              e.currentTarget.querySelector('.overlay').style.opacity = '0';
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s, opacity 0.3s' }}
              loading="lazy"
            />
            <div className="overlay" style={{
              position: 'absolute', inset: 0,
              background: 'rgba(200,241,53,0.08)',
              opacity: 0, transition: 'opacity 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'var(--green)',
                letterSpacing: '0.16em',
                border: '1px solid var(--green)',
                padding: '5px 12px',
              }}>VIEW</div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.97)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 0 56px',
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* Image */}
          <img
            src={images[lightbox].src}
            alt={images[lightbox].alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: 'calc(100vh - 140px)',
              objectFit: 'contain',
              border: '1px solid var(--border)',
              flexShrink: 0,
            }}
          />

          {/* Bottom nav row — always inside viewport */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0, right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              padding: '0 16px',
            }}
          >
            <button
              onClick={e => { e.stopPropagation(); setLightbox(l => Math.max(0, l - 1)); }}
              disabled={lightbox === 0}
              style={{
                ...navBtn,
                opacity: lightbox === 0 ? 0.3 : 1,
              }}
            >&#8592;</button>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--muted)',
              letterSpacing: '0.14em',
              minWidth: 48,
              textAlign: 'center',
            }}>
              {lightbox + 1} / {images.length}
            </span>

            <button
              onClick={e => { e.stopPropagation(); setLightbox(l => Math.min(images.length - 1, l + 1)); }}
              disabled={lightbox === images.length - 1}
              style={{
                ...navBtn,
                opacity: lightbox === images.length - 1 ? 0.3 : 1,
              }}
            >&#8594;</button>
          </div>

          {/* Close */}
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: 16, right: 16,
            background: '#141414', border: '1px solid var(--border)',
            color: 'var(--text)', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', borderRadius: 0,
          }}>
            <IconX size={16} color="var(--text)" />
          </button>
        </div>
      )}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 2px;
          max-width: 980px;
          margin: 0 auto;
        }
        @media (max-width: 480px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}

const navBtn = {
  background: '#141414',
  border: '1px solid var(--border)',
  color: 'var(--green)',
  fontSize: '1.2rem',
  width: 44, height: 44,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'all 0.2s',
  borderRadius: 0,
};
