// src/components/Booking.jsx
import { useState, useEffect, useRef } from 'react';
import {
  bookSlots, subscribeToDate,
  getAvailableDates, getTodayStr,
} from '../utils/bookingStore';
import { IconCalendar, IconClock, IconChevronDown, IconCheck, IconWhatsApp } from './Icons';

const UPI_ID = 'zarosarojini101@okhdfcbank';
const ADMIN_PHONE = '917012890090';
const ADVANCE_PER_SLOT = 200;

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

// Returns true if this slot has already passed for today
function isPastSlot(slotId, dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  if (dateStr !== todayStr) return false; // future dates: never past
  return slotId < today.getHours(); // block only slots strictly before current hour
}
const SPORTS = ['Football (6-a-side)', 'Cricket'];

import upiQr from '../assets/upi_qr.png';

function UpiQR() {
  return (
    <img
      src={upiQr}
      alt="UPI QR Code"
      style={{
        width: 170, height: 170,
        border: '4px solid #fff',
        background: '#fff',
        padding: 4,
        display: 'block',
      }}
    />
  );
}

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

  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'done'
  const [paySubmitting, setPaySubmitting] = useState(false);

  const ref = useRef();

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
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) e.target.classList.add('visible'); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.date-dropdown')) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  const toggleSlot = (id) => {
    if (bookedMap[id] || isPastSlot(id, selectedDate)) return;
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const total = selected.reduce((sum, id) => {
    const slot = ALL_SLOTS.find(s => s.id === id);
    return sum + (slot?.price || 0);
  }, 0);

  const advance = selected.length * ADVANCE_PER_SLOT;
  const balance = total - advance;

  const selectedLabel = dates.find(d => d.value === selectedDate)?.label || selectedDate;

  const slotLabels = selected
    .sort((a, b) => a - b)
    .map(id => ALL_SLOTS.find(s => s.id === id)?.label)
    .join(', ');

  const handleProceedToPayment = () => {
    if (!name || !phone || selected.length === 0) return;
    setStep('payment');
  };

  const handlePaid = async () => {
    setPaySubmitting(true);

    await bookSlots({
      date: selectedDate,
      slotIds: selected,
      name, phone, sport,
      paymentStatus: 'advance_paid',
      amountPaid: advance,
    });

    // Clean WhatsApp message — no emojis or special chars that cause unknown chars
    const statusLine = selected.length > 1
      ? `Slots: ${slotLabels} (${selected.length} slots)`
      : `Slot: ${slotLabels}`;

    const msg =
      `NEW BOOKING - ZARO SPORTZ\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Sport: ${sport}\n` +
      `Date: ${selectedLabel}\n` +
      `${statusLine}\n` +
      `Total: Rs.${total}\n` +
      `Advance Paid: Rs.${advance}\n` +
      `Balance Due at Venue: Rs.${balance}\n\n` +
      `Please confirm the booking.`;

    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');

    setPaySubmitting(false);
    setStep('done');
  };

  const handleReset = () => {
    setSelected([]);
    setName('');
    setPhone('');
    setStep('form');
  };

  return (
    <section id="booking" style={{
      background: '#080808',
      borderTop: '1px solid var(--border)',
    }}>
      <div className="section-label">RESERVE YOUR TIME</div>
      <h2 className="section-title">Book a <span>Slot</span></h2>
      <p className="section-sub">Select date and time — pay advance via UPI to confirm</p>

      <div ref={ref} className="reveal" style={{
        maxWidth: 740, margin: '0 auto',
      }}>

        {/* DONE STATE */}
        {step === 'done' && (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--green)',
            padding: 'clamp(24px, 6vw, 40px) clamp(16px, 5vw, 32px)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48,
              background: 'var(--green)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <IconCheck size={22} color="#080808" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: 'var(--text)', letterSpacing: '0.06em', marginBottom: 8 }}>
              BOOKING SUBMITTED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.8, marginBottom: 28 }}>
              Your slot is reserved. The admin will verify your payment
              and send a WhatsApp confirmation shortly.
            </div>
            <button onClick={handleReset} style={{
              background: 'transparent',
              border: '1px solid var(--green)',
              color: 'var(--green)',
              padding: '10px 28px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              borderRadius: 0,
            }}>BOOK ANOTHER SLOT</button>
          </div>
        )}

        {/* PAYMENT STEP */}
        {step === 'payment' && (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            padding: 'clamp(20px, 5vw, 36px)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: '0.62rem', letterSpacing: '0.16em', marginBottom: 24 }}>
              STEP 2 OF 2 - ADVANCE PAYMENT
            </div>

            {/* Summary */}
            <div style={{
              background: '#0a0e07',
              border: '1px solid var(--border)',
              padding: '16px 18px',
              marginBottom: 24,
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 2 }}>
                <div><span style={{ color: 'var(--muted)' }}>NAME:</span> {name}</div>
                <div><span style={{ color: 'var(--muted)' }}>SPORT:</span> {sport}</div>
                <div><span style={{ color: 'var(--muted)' }}>DATE:</span> {selectedLabel}</div>
                <div><span style={{ color: 'var(--muted)' }}>SLOTS:</span> {slotLabels}</div>
              </div>
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 4 }}>TOTAL</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>RS.{total.toLocaleString()}</div>
                </div>
                <div style={{ background: '#0a110a', border: '1px solid var(--green)', padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--green)', letterSpacing: '0.12em', marginBottom: 4 }}>PAY NOW</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--green)', letterSpacing: '0.04em' }}>RS.{advance.toLocaleString()}</div>
                </div>
                <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 4 }}>AT VENUE</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>RS.{balance.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--muted)', marginTop: 10, letterSpacing: '0.04em' }}>
                Pay Rs.{ADVANCE_PER_SLOT} advance per slot online. Pay the balance at the venue.
              </div>
            </div>

            {/* UPI QR + ID */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              marginBottom: 24,
              padding: '20px 16px',
              border: '1px solid var(--border)',
              background: '#0a0a0a',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.6rem', letterSpacing: '0.16em' }}>
                SCAN TO PAY RS.{advance} ADVANCE
              </div>
              <UpiQR />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.6rem', letterSpacing: '0.16em', marginBottom: 6 }}>
                  OR PAY TO UPI ID
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--green)',
                  fontSize: 'clamp(0.72rem, 2.5vw, 0.9rem)',
                  letterSpacing: '0.04em',
                  wordBreak: 'break-all',
                  textAlign: 'center',
                  padding: '0 8px',
                }}>{UPI_ID}</div>
              </div>
            </div>

            <button
              onClick={handlePaid}
              disabled={paySubmitting}
              style={{
                width: '100%',
                background: paySubmitting ? '#1a1a1a' : 'var(--green)',
                color: paySubmitting ? 'var(--muted)' : '#080808',
                border: 'none',
                padding: '15px',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                letterSpacing: '0.1em',
                cursor: paySubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                borderRadius: 0,
              }}
              onMouseEnter={e => { if (!paySubmitting) e.currentTarget.style.background = '#d8ff50'; }}
              onMouseLeave={e => { if (!paySubmitting) e.currentTarget.style.background = 'var(--green)'; }}
            >
              <IconWhatsApp size={18} color={paySubmitting ? 'var(--muted)' : '#080808'} />
              {paySubmitting ? 'SAVING...' : 'I HAVE PAID - NOTIFY ADMIN'}
            </button>

            <p style={{
              textAlign: 'center', color: 'var(--muted)',
              fontSize: '0.7rem', marginTop: 12,
              fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
            }}>
              This will save your booking and open WhatsApp to notify the admin.
            </p>
          </div>
        )}

        {/* BOOKING FORM */}
        {step === 'form' && (
          <>
            {/* Pricing strip */}
            <div className="pricing-strip" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: '1px solid var(--border)',
              marginBottom: 2,
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
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: p.color, letterSpacing: '0.04em', marginTop: 2 }}>{p.price}</div>
                </div>
              ))}
            </div>

            {/* Main form */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              padding: 'clamp(16px, 5vw, 36px)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: '0.62rem', letterSpacing: '0.16em', marginBottom: 24 }}>
                STEP 1 OF 2 - DETAILS &amp; SLOTS
              </div>

              {/* Sport selector */}
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>SPORT</label>
                <div style={{ display: 'flex', gap: 2 }}>
                  {SPORTS.map(s => (
                    <button key={s} onClick={() => setSport(s)} style={{
                      flex: 1,
                      padding: '10px 8px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(0.65rem, 2vw, 0.78rem)',
                      letterSpacing: '0.04em',
                      transition: 'all 0.18s',
                      background: sport === s ? 'var(--green)' : 'var(--dark)',
                      color: sport === s ? '#080808' : 'var(--text-dim)',
                      border: '1px solid',
                      borderColor: sport === s ? 'var(--green)' : 'var(--border)',
                      borderRadius: 0,
                    }}>{s.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              {/* Date dropdown */}
              <div style={{ marginBottom: 28, position: 'relative' }} className="date-dropdown">
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
                  borderRadius: 0,
                  transition: 'border-color 0.2s',
                }}>
                  {selectedLabel}
                  <span style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <IconChevronDown size={15} color="var(--green)" />
                  </span>
                </button>

                {dropOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 30,
                    background: '#0e0e0e',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    maxHeight: 240, overflowY: 'auto',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  }}>
                    {dates.map(d => (
                      <button key={d.value} onClick={() => { setSelectedDate(d.value); setDropOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%',
                          background: d.value === selectedDate ? '#141a0e' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          color: d.value === selectedDate ? 'var(--green)' : 'var(--text-dim)',
                          padding: '11px 16px', cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (d.value !== selectedDate) e.currentTarget.style.background = '#111'; }}
                        onMouseLeave={e => { if (d.value !== selectedDate) e.currentTarget.style.background = 'transparent'; }}
                      >{d.label}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Slot grid */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>
                  <IconClock size={13} color="var(--green)" />
                  TIME SLOTS
                  <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.65rem', marginLeft: 6 }}>
                    - multi-select allowed
                  </span>
                  {loading && (
                    <span style={{ color: 'var(--muted)', fontSize: '0.62rem', marginLeft: 8 }}>
                      loading...
                    </span>
                  )}
                </label>
                <div className="slot-grid">
                  {ALL_SLOTS.map(slot => {
                    const isBooked = !!bookedMap[slot.id];
                    const isPast = isPastSlot(slot.id, selectedDate);
                    const isActive = selected.includes(slot.id);
                    return (
                      <button key={slot.id} onClick={() => toggleSlot(slot.id)}
                        disabled={isBooked || isPast || loading}
                        style={{
                          background: isBooked || isPast
                            ? '#0a0a0a'
                            : isActive
                              ? 'var(--green)'
                              : 'var(--dark)',
                          color: isBooked || isPast
                            ? '#2a2a2a'
                            : isActive
                              ? '#080808'
                              : slot.peak ? 'var(--yellow)' : 'var(--text-dim)',
                          border: '1px solid',
                          borderColor: isBooked || isPast
                            ? 'var(--border)'
                            : isActive
                              ? 'var(--green)'
                              : slot.peak ? '#f0c42022' : 'var(--border)',
                          padding: '9px 4px',
                          cursor: isBooked || isPast || loading ? 'not-allowed' : 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          transition: 'all 0.12s',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                          opacity: isBooked || isPast ? 0.3 : 1,
                          position: 'relative',
                          borderRadius: 0,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {isActive && (
                          <span style={{ position: 'absolute', top: 4, right: 4 }}>
                            <IconCheck size={10} color="#080808" />
                          </span>
                        )}
                        <span>{slot.label}</span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
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
                  background: '#141a0e',
                  border: '1px solid var(--green)',
                  padding: '14px 18px',
                  marginBottom: 24,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 8,
                }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                      {selected.length} SLOT{selected.length > 1 ? 'S' : ''} — TOTAL RS.{total.toLocaleString()}
                    </span>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.65rem', marginTop: 3 }}>
                      Advance to pay: RS.{advance} &nbsp;|&nbsp; Balance at venue: RS.{balance}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--green)', fontSize: '1.5rem', letterSpacing: '0.04em' }}>
                    RS. {advance}
                  </span>
                </div>
              )}

              {/* Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 20 }}
                className="booking-fields">
                <div>
                  <label style={labelStyle}>YOUR NAME</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    style={{ borderRadius: 0 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>PHONE NUMBER</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9XXXXXXXXX"
                    style={{ borderRadius: 0 }}
                  />
                </div>
              </div>

              <button onClick={handleProceedToPayment}
                disabled={!name || !phone || selected.length === 0}
                style={{
                  width: '100%',
                  background: !name || !phone || selected.length === 0 ? '#1a1a1a' : 'var(--green)',
                  color: !name || !phone || selected.length === 0 ? 'var(--muted)' : '#080808',
                  border: 'none',
                  padding: '15px',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  letterSpacing: '0.1em',
                  cursor: !name || !phone || selected.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  borderRadius: 0,
                }}
                onMouseEnter={e => {
                  if (name && phone && selected.length > 0) e.currentTarget.style.background = '#d8ff50';
                }}
                onMouseLeave={e => {
                  if (name && phone && selected.length > 0) e.currentTarget.style.background = 'var(--green)';
                }}
              >
                PROCEED TO PAYMENT
              </button>

              <p style={{
                textAlign: 'center', color: 'var(--muted)',
                fontSize: '0.7rem', marginTop: 12,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
              }}>
                You will be shown UPI payment details in the next step. Only advance of RS.{ADVANCE_PER_SLOT} per slot is collected online.
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 2px;
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
