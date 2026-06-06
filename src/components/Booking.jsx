// src/components/Booking.jsx
import { useState, useEffect, useRef } from 'react';
import {
  bookSlots, subscribeToDate,
  getAvailableDates, getTodayStr,
} from '../utils/bookingStore';
import { IconCalendar, IconClock, IconChevronDown, IconCheck, IconWhatsApp } from './Icons';

const ADMIN_PHONE = '917012890090';

function generateSlots() {
  const slots = [];
  for (let h = 6; h <= 23; h++) {
    const fmt = (n, s) => `${n % 12 === 0 ? 12 : n % 12}:00 ${s}`;
    const startS = h < 12 ? 'AM' : 'PM';
    const endH = h + 1;
    const endS = endH < 12 ? 'AM' : endH === 24 ? 'AM' : 'PM';
    slots.push({
      id: h,
      label: `${fmt(h, startS)} - ${fmt(endH, endS)}`,
      price: h < 19 ? 1000 : 1200,
      peak: h >= 19,
    });
  }
  return slots;
}

const ALL_SLOTS = generateSlots();

function isPastSlot(slotId, dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (dateStr !== todayStr) return false;
  return slotId < today.getHours();
}

const SPORTS = ["6's Football", 'Cricket'];

export default function Booking() {
  const dates = getAvailableDates();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [bookedMap, setBookedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [sport, setSport] = useState(SPORTS[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dropOpen, setDropOpen] = useState(false);

  const [step, setStep] = useState('form'); // 'form' | 'done'
  const [submitting, setSubmitting] = useState(false);

  const sectionRef = useRef();

  useEffect(() => {
    setLoading(true);
    setSelected([]);
    const unsub = subscribeToDate(selectedDate, (slots) => {
      setBookedMap(slots);
      setLoading(false);
    });
    return unsub;
  }, [selectedDate]);

  useEffect(() => {
    if (step === 'done') {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [step]);

  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.date-dropdown')) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  const toggleSlot = (id) => {
    // Only block if slot is accepted (truly booked) or past
    const slotData = bookedMap[id];
    const isAccepted = slotData?.status === 'accepted';
    if (isAccepted || isPastSlot(id, selectedDate)) return;
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const total = selected.reduce((sum, id) => {
    const slot = ALL_SLOTS.find(s => s.id === id);
    return sum + (slot?.price || 0);
  }, 0);

  const selectedLabel = dates.find(d => d.value === selectedDate)?.label || selectedDate;

  const slotLabels = selected
    .sort((a, b) => a - b)
    .map(id => ALL_SLOTS.find(s => s.id === id)?.label)
    .join(', ');

  const handleSubmit = async () => {
    if (!name || !phone || selected.length === 0) return;
    setSubmitting(true);

    await bookSlots({
      date: selectedDate,
      slotIds: selected,
      name, phone, sport,
      status: 'pending',
    });

    const statusLine = selected.length > 1
      ? `Slots: ${slotLabels} (${selected.length} slots)`
      : `Slot: ${slotLabels}`;

    const msg =
      `NEW BOOKING REQUEST - ZARO SPORTZ\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Sport: ${sport}\n` +
      `Date: ${selectedLabel}\n` +
      `${statusLine}\n` +
      `Total: Rs.${total}\n\n` +
      `Please confirm this booking.`;

    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');

    setSubmitting(false);
    setStep('done');
  };

  const handleReset = () => {
    setSelected([]);
    setName('');
    setPhone('');
    setSport(SPORTS[0]);
    setStep('form');
  };

  return (
    <section id="booking" ref={sectionRef} style={{
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="section-label">RESERVE YOUR TIME</div>
      <h2 className="section-title">Book a <span>Slot</span></h2>
      <p className="section-sub">Select your date and time — admin will confirm via WhatsApp</p>

      <div className="reveal visible" style={{
        maxWidth: 740, margin: '0 auto',
      }}>

        {/* DONE STATE */}
        {step === 'done' && (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--green)',
            padding: 'clamp(24px, 6vw, 40px) clamp(16px, 5vw, 32px)',
            textAlign: 'center',
            borderRadius: 12,
          }}>
            <div style={{
              width: 64, height: 64,
              background: 'var(--green)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 24px rgba(200,241,53,0.4)',
            }}>
              <IconCheck size={30} color="#000000" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: 'var(--text)', letterSpacing: '0.06em', marginBottom: 8 }}>
              REQUEST SENT
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.8, marginBottom: 28 }}>
              Your booking request has been submitted and the admin has been notified on WhatsApp.
              You will receive a WhatsApp confirmation once the admin accepts your slot.
            </div>
            <button onClick={handleReset} style={{
              background: 'transparent',
              border: '1px solid var(--green)',
              color: 'var(--green)',
              padding: '10px 28px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              borderRadius: 8,
            }}>BOOK ANOTHER SLOT</button>
          </div>
        )}

        {/* BOOKING FORM */}
        {step === 'form' && (
          <>
            {/* Pricing strip */}
            <div className="pricing-strip" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: '1px solid var(--border)',
              marginBottom: 8,
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              {[
                { time: '06:00 - 19:00', label: 'STANDARD RATE', price: 'RS. 1,000 / HR', color: 'var(--green)' },
                { time: '19:00 - 23:00', label: 'PEAK RATE', price: 'RS. 1,200 / HR', color: 'var(--yellow)' },
              ].map((p, i) => (
                <div key={i} style={{
                  padding: '14px 16px',
                  background: 'var(--card-bg)',
                  borderRight: i === 0 ? '1px solid var(--border)' : 'none',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.12em' }}>{p.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>{p.time}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: p.color, letterSpacing: '0.04em', marginTop: 2 }}>{p.price}</div>
                </div>
              ))}
            </div>

            {/* Main form */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              padding: 'clamp(16px, 5vw, 36px)',
              borderRadius: 12,
            }}>

              {/* Date dropdown */}
              <div style={{ marginBottom: 24, position: 'relative' }} className="date-dropdown">
                <label style={labelStyle}>
                  <IconCalendar size={13} color="var(--green)" />
                  DATE
                </label>
                <button onClick={() => setDropOpen(o => !o)} style={{
                  width: '100%',
                  background: 'var(--dark)',
                  border: '1px solid',
                  borderColor: dropOpen ? 'var(--green)' : 'var(--border)',
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderRadius: 8,
                  transition: 'border-color 0.2s',
                }}>
                  {selectedLabel}
                  <span style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <IconChevronDown size={15} color="var(--green)" />
                  </span>
                </button>

                {dropOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    maxHeight: 240, overflowY: 'auto',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.9)',
                    borderRadius: '0 0 8px 8px',
                  }}>
                    {dates.map(d => (
                      <button key={d.value} onClick={() => { setSelectedDate(d.value); setDropOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%',
                          background: d.value === selectedDate ? 'var(--green-dim)' : 'var(--card-bg)',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          color: d.value === selectedDate ? 'var(--green)' : 'var(--text-dim)',
                          padding: '11px 16px', cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (d.value !== selectedDate) e.currentTarget.style.background = 'var(--bg)'; }}
                        onMouseLeave={e => { if (d.value !== selectedDate) e.currentTarget.style.background = 'var(--card-bg)'; }}
                      >{d.label}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Slot grid */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>
                  <IconClock size={13} color="var(--green)" />
                  TIME SLOTS
                  <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.65rem', marginLeft: 6 }}>
                    — multi-select allowed
                  </span>
                  {loading && (
                    <span style={{ color: 'var(--muted)', fontSize: '0.62rem', marginLeft: 8 }}>
                      loading...
                    </span>
                  )}
                </label>
                <div className="slot-grid">
                  {ALL_SLOTS.map(slot => {
                    const slotData = bookedMap[slot.id];
                    // Only truly booked (accepted) slots are shown as unavailable to users
                    const isBooked = slotData?.status === 'accepted';
                    const isPast = isPastSlot(slot.id, selectedDate);
                    const isUnavailable = isBooked;
                    const isActive = selected.includes(slot.id);
                    return (
                      <button key={slot.id} onClick={() => toggleSlot(slot.id)}
                        disabled={isUnavailable || isPast || loading}
                        style={{
                          background: isBooked
                            ? 'var(--bg)'
                            : isPast
                              ? 'var(--bg)'
                              : isActive
                                ? 'var(--green)'
                                : 'var(--dark)',
                          color: isBooked
                            ? '#c02020'
                            : isPast
                              ? '#2a2a2a'
                              : isActive
                                ? '#000000'
                                : slot.peak ? 'var(--yellow)' : 'var(--text-dim)',
                          border: '1px solid',
                          borderColor: isBooked
                            ? '#5a1515'
                            : isPast
                              ? 'var(--border)'
                              : isActive
                                ? 'var(--green)'
                                : slot.peak ? '#f0c42022' : 'var(--border)',
                          padding: '9px 4px',
                          cursor: isUnavailable || isPast || loading ? 'not-allowed' : 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          transition: 'all 0.12s',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                          opacity: isPast ? 0.3 : 1,
                          position: 'relative',
                          borderRadius: 8,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {isActive && (
                          <span style={{ position: 'absolute', top: 4, right: 4 }}>
                            <IconCheck size={10} color="#000000" />
                          </span>
                        )}
                        <span>{slot.label}</span>
                        <span style={{ fontSize: '0.6rem', opacity: isBooked ? 1 : 0.7, fontWeight: isBooked ? 600 : 400 }}>
                          {isBooked ? 'BOOKED' : isPast ? 'PAST' : `RS.${slot.price}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary bar */}
              {selected.length > 0 && (
                <div style={{
                  background: 'var(--green)',
                  border: '1px solid var(--green)',
                  padding: '14px 18px',
                  marginBottom: 24,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 8,
                  borderRadius: 8,
                }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#000000', fontSize: '0.78rem', fontWeight: 700 }}>
                      {selected.length} SLOT{selected.length > 1 ? 'S' : ''} — TOTAL RS.{total.toLocaleString()}
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', color: '#1a1a00', fontSize: '0.65rem', marginTop: 3 }}>
                      Payment to be settled at the venue
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#000000', fontSize: '1.5rem', letterSpacing: '0.04em' }}>
                    RS. {total.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Name, Phone & Sport type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}
                className="booking-fields">
                <div>
                  <label style={labelStyle}>YOUR NAME</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>PHONE NUMBER</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9XXXXXXXXX"
                  />
                </div>
              </div>

              {/* Sport type selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>SPORT TYPE</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SPORTS.map(s => (
                    <button key={s} onClick={() => setSport(s)} style={{
                      flex: 1,
                      padding: '11px 8px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 'clamp(0.75rem, 2.5vw, 0.95rem)',
                      letterSpacing: '0.04em',
                      transition: 'all 0.18s',
                      background: sport === s ? 'var(--green)' : 'var(--dark)',
                      color: sport === s ? '#000000' : 'var(--text-dim)',
                      border: '1px solid',
                      borderColor: sport === s ? 'var(--green)' : 'var(--border)',
                      borderRadius: 8,
                    }}>{s.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              {/* Tournament disclaimer */}
              <div style={{
                background: '#0f0e00',
                border: '1px solid #f0c42030',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }}>⚠</span>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.66rem',
                  color: 'var(--text-dim)',
                  lineHeight: 1.7,
                  letterSpacing: '0.03em',
                  margin: 0,
                }}>
                  <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>NOTE:</span> In the event of a tournament or special event organized by Zaro Sportz, the management reserves the right to cancel a confirmed booking. You will be notified in advance via WhatsApp if this occurs.
                </p>
              </div>

              <button onClick={handleSubmit}
                disabled={!name || !phone || selected.length === 0 || submitting}
                style={{
                  width: '100%',
                  background: !name || !phone || selected.length === 0 || submitting ? 'var(--card-bg)' : 'var(--green)',
                  color: !name || !phone || selected.length === 0 || submitting ? 'var(--muted)' : '#000000',
                  border: 'none',
                  padding: '15px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  letterSpacing: '0.1em',
                  cursor: !name || !phone || selected.length === 0 || submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  borderRadius: 8,
                }}
                onMouseEnter={e => {
                  if (name && phone && selected.length > 0 && !submitting) e.currentTarget.style.background = '#d8ff50';
                }}
                onMouseLeave={e => {
                  if (name && phone && selected.length > 0 && !submitting) e.currentTarget.style.background = 'var(--green)';
                }}
              >
                <IconWhatsApp size={18} color={!name || !phone || selected.length === 0 || submitting ? 'var(--muted)' : '#000000'} />
                {submitting ? 'SUBMITTING...' : 'REQUEST BOOKING'}
              </button>

              <p style={{
                textAlign: 'center', color: 'var(--muted)',
                fontSize: '0.7rem', marginTop: 12,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
              }}>
                Your request will be sent to the admin. A WhatsApp confirmation will follow once accepted.
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 6px;
        }
        @media (max-width: 480px) {
          .booking-fields { grid-template-columns: 1fr !important; }
          .slot-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  marginBottom: 10,
  fontFamily: 'var(--font-mono)',
  color: 'var(--green)',
  fontSize: '0.68rem',
  letterSpacing: '0.16em',
};
