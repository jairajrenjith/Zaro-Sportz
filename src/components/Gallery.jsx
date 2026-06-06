import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from './Icons';

import g1 from '../assets/gallery/1.png';
import g2 from '../assets/gallery/2.png';
import g3 from '../assets/gallery/3.png';
import g4 from '../assets/gallery/4.png';
import g5 from '../assets/gallery/5.png';
import g6 from '../assets/gallery/6.png';
import g7 from '../assets/gallery/7.png';
import g8 from '../assets/gallery/8.png';
import g9 from '../assets/gallery/9.png';
import g10 from '../assets/gallery/10.png';

const images = [g1,g2,g3,g4,g5,g6,g7,g8,g9,g10].map((src, i) => ({
  src,
  alt: `Zaro Sportz - Field ${i + 1}`,
}));

function Lightbox({ index, onClose, onPrev, onNext, total }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'lbFadeIn 0.15s ease',
        padding: '56px 12px 76px',
        boxSizing: 'border-box',
      }}
    >
      <img
        src={images[index].src}
        alt={images[index].alt}
        onClick={e => e.stopPropagation()}
        draggable={false}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: 4,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: 12, right: 12,
          zIndex: 100000,
          width: 40, height: 40,
          background: 'rgba(18,18,18,0.95)',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <IconX size={18} color="#fff" />
      </button>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 16,
          left: 0, right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          zIndex: 100000,
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          disabled={index === 0}
          aria-label="Previous"
          style={{ ...navBtnStyle, opacity: index === 0 ? 0.25 : 1 }}
        >&#8592;</button>

        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.65rem',
          color: '#888',
          letterSpacing: '0.14em',
          minWidth: 44,
          textAlign: 'center',
        }}>
          {index + 1} / {total}
        </span>

        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          disabled={index === total - 1}
          aria-label="Next"
          style={{ ...navBtnStyle, opacity: index === total - 1 ? 0.25 : 1 }}
        >&#8594;</button>
      </div>

      <style>{`
        @keyframes lbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const ref = useRef();
  const savedScrollY = useRef(0);
  const isOpen = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox !== null) {
      if (!isOpen.current) {
        savedScrollY.current = window.scrollY;
        isOpen.current = true;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY.current}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (isOpen.current) {
        isOpen.current = false;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
      }
    }
    return () => {
    };
  }, [lightbox]);

  useEffect(() => {
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') setLightbox(l => Math.max(0, l - 1));
      if (e.key === 'ArrowRight') setLightbox(l => Math.min(images.length - 1, l + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  return (
    <section id="gallery" style={{
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="section-label">THE FIELD</div>
      <h2 className="section-title">Gallery</h2>
      <p className="section-sub">Moments from Zaro Sportz</p>

      <div ref={ref} className="reveal gallery-grid">
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightbox(i)}
            style={{
              aspectRatio: '1',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              borderRadius: 8,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-bright)';
              e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
              e.currentTarget.querySelector('img').style.opacity = '0.85';
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
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.4s, opacity 0.3s',
                display: 'block',
              }}
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
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 4,
              }}>VIEW</div>
            </div>
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          total={images.length}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(l => Math.max(0, l - 1))}
          onNext={() => setLightbox(l => Math.min(images.length - 1, l + 1))}
        />
      )}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 6px;
          max-width: 980px;
          margin: 0 auto;
        }
        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

const navBtnStyle = {
  background: 'rgba(22,22,22,0.95)',
  border: '1px solid #2a2a2a',
  color: '#c8f135',
  fontSize: '1.2rem',
  width: 44, height: 44,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'opacity 0.2s',
  borderRadius: 8,
};
