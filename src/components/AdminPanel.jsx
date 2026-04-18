// src/components/AdminPanel.jsx
import { useState, useEffect } from 'react';
import {
  subscribeToAll, subscribeToDate, deleteBooking,
  getAvailableDates, parseDateLabel, getTodayStr,
  bookSlots, updatePaymentStatus,
} from '../utils/bookingStore';
import {
  IconTrash, IconLogout, IconCalendar, IconChevronDown,
  IconPlus, IconMinus, IconCheck, IconX, IconWhatsApp,
} from './Icons';
import logo from '../assets/zaro_logo.jpg';

const ADMIN_PHONE = '917012890090';
const ALL_SLOT_IDS = Array.from({ length: 18 }, (_, i) => i + 6);

function slotLabel(h) {
  const fmt = (n, s) => `${n % 12 === 0 ? 12 : n % 12}:00 ${s}`;
  const startS = h < 12 ? 'AM' : 'PM';
  const endH = h + 1;
  const endS = endH < 12 ? 'AM' : endH === 24 ? 'AM' : 'PM';
  return `${fmt(h, startS)} – ${fmt(endH, endS)}`;
}

const SPORTS = ['Football (6-a-side)', 'Cricket'];
const TABS = ['BOOKINGS', 'SLOTS', 'OVERVIEW'];

const PAYMENT_LABELS = {
  pending:       { label: '⏳ NO PAYMENT YET',        color: 'var(--muted)', bg: '#111',    border: '#33332a' },
  advance_paid:  { label: '⚠ AWAITING VERIFICATION', color: '#f0a020',      bg: '#1a1200', border: '#f0a02040' },
  advance_exact: { label: '⚠ AWAITING VERIFICATION', color: '#f0a020',      bg: '#1a1200', border: '#f0a02040' },
  paid_less:     { label: '⚠ PARTIAL — UNVERIFIED',  color: '#f0a020',      bg: '#1a1200', border: '#f0a02040' },
  paid_more:     { label: '⚠ OVERPAID — UNVERIFIED', color: '#f0a020',      bg: '#1a1200', border: '#f0a02040' },
  verified:      { label: '✓ VERIFIED',              color: 'var(--green)', bg: '#0e1a0a', border: 'var(--green)50' },
};

// Helper: group slots by groupId (or by name+phone+bookedAt if no groupId)
function groupSlotsByBooking(slotsObj) {
  const groups = {};
  const seen = new Set();
  const slotIds = Object.keys(slotsObj).map(Number).sort((a, b) => a - b);
  for (const id of slotIds) {
    const b = slotsObj[id];
    const key = b.groupId || `${b.name}_${b.phone}_${b.bookedAt}`;
    if (!groups[key]) groups[key] = { ids: [], booking: b };
    groups[key].ids.push(id);
  }
  return Object.values(groups);
}

// WhatsApp message templates (admin to customer) - plain text only, no emojis
function buildConfirmMessage(b, dateLabel, slotLines, totalPaid, balanceDue, status) {
  const slotsText = Array.isArray(slotLines) ? slotLines.join(', ') : slotLines;

  if (status === 'advance_paid' || status === 'advance_exact') {
    return (
      `Hi ${b.name},\n\n` +
      `Your booking at Zaro Sportz is CONFIRMED.\n\n` +
      `Date: ${dateLabel}\n` +
      `Slots: ${slotsText}\n` +
      `Sport: ${b.sport}\n` +
      `Advance Paid: Rs.${totalPaid}\n` +
      `Balance Due at Venue: Rs.${balanceDue}\n\n` +
      `See you on the field!\n- Zaro Sportz`
    );
  }
  if (status === 'paid_less') {
    return (
      `Hi ${b.name},\n\n` +
      `Your booking at Zaro Sportz is confirmed.\n\n` +
      `Date: ${dateLabel}\n` +
      `Slots: ${slotsText}\n` +
      `Sport: ${b.sport}\n` +
      `Paid: Rs.${totalPaid}\n` +
      `Remaining: Rs.${balanceDue} - please pay at the venue.\n\n` +
      `- Zaro Sportz`
    );
  }
  if (status === 'paid_more') {
    return (
      `Hi ${b.name},\n\n` +
      `Your booking at Zaro Sportz is confirmed.\n\n` +
      `Date: ${dateLabel}\n` +
      `Slots: ${slotsText}\n` +
      `Sport: ${b.sport}\n` +
      `Paid: Rs.${totalPaid}\n` +
      `Extra Rs.${Math.abs(balanceDue)} will be adjusted in your next booking.\n\n` +
      `- Zaro Sportz`
    );
  }
  return (
    `Hi ${b.name}, your booking at Zaro Sportz (${slotsText}, ${dateLabel}) is confirmed.\n- Zaro Sportz`
  );
}

export default function AdminPanel({ onLogout }) {
  const [bookings, setBookings] = useState({});
  const [slotsForDate, setSlotsForDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [dates] = useState(getAvailableDates());
  const [dropOpen, setDropOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tab, setTab] = useState('BOOKINGS');

  // Add slot form
  const [addMode, setAddMode] = useState(false);
  const [addSlotIds, setAddSlotIds] = useState([]);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addSport, setAddSport] = useState(SPORTS[0]);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Verify payment modal
  const [verifyModal, setVerifyModal] = useState(null); // { date, slotId, booking }
  const [verifyStatus, setVerifyStatus] = useState('advance_exact');
  const [verifyAmount, setVerifyAmount] = useState('');

  // Subscribe to all bookings (for overview stats)
  useEffect(() => {
    const unsub = subscribeToAll((all) => setBookings(all));
    return unsub;
  }, []);

  // Subscribe to selected date slots
  useEffect(() => {
    const unsub = subscribeToDate(selectedDate, (slots) => setSlotsForDate(slots));
    return unsub;
  }, [selectedDate]);

  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.admin-date-drop')) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  const handleDelete = async (date, slotId) => {
    await deleteBooking(date, slotId);
    setConfirmDelete(null);
  };

  const toggleAddSlot = (id) => {
    setAddSlotIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAddSlot = async () => {
    if (addSlotIds.length === 0) { setAddError('Select at least one slot.'); return; }
    if (!addName.trim()) { setAddError('Name is required.'); return; }
    if (!addPhone.trim()) { setAddError('Phone is required.'); return; }
    setAddError('');
    await bookSlots({
      date: selectedDate, slotIds: addSlotIds,
      name: addName.trim(), phone: addPhone.trim(), sport: addSport,
      paymentStatus: 'advance_exact', amountPaid: 0,
    });
    const n = addName.trim();
    setAddMode(false);
    setAddSlotIds([]);
    setAddName('');
    setAddPhone('');
    setAddSuccess(`${addSlotIds.length} slot${addSlotIds.length > 1 ? 's' : ''} booked for ${n}.`);
    setTimeout(() => setAddSuccess(''), 3500);
  };

  const openVerify = (date, slotId, b) => {
    // Gather all slots from the same group booking
    const daySlots = date === selectedDate ? slotsForDate : (bookings[date] || {});
    let groupSlotIds = [slotId];
    if (b.groupId) {
      groupSlotIds = Object.keys(daySlots)
        .filter(id => daySlots[id]?.groupId === b.groupId)
        .map(Number)
        .sort((a, z) => a - z);
    }
    setVerifyModal({ date, slotId, booking: b, groupSlotIds });
    setVerifyStatus('verified');
    // Total advance already paid for all slots in group
    setVerifyAmount(String(b.amountPaid || ''));
  };

  const handleVerify = async () => {
    if (!verifyModal) return;
    const { date, groupSlotIds } = verifyModal;
    const paid = Number(verifyAmount) || 0;
    // Update ALL slots in this group with the same payment status
    for (const sid of groupSlotIds) {
      await updatePaymentStatus(date, sid, verifyStatus, paid);
    }
    // Build one combined WhatsApp message for all slots
    const dateLabel = parseDateLabel(date);
    const b = { ...verifyModal.booking, paymentStatus: verifyStatus, amountPaid: paid };
    const slotLines = groupSlotIds.map(id => slotLabel(id));
    // Calculate balance: total slot price minus what was paid
    const totalPrice = groupSlotIds.reduce((sum, id) => sum + (id >= 19 ? 1200 : 1000), 0);
    const balanceDue = verifyStatus === 'paid_more' ? paid - totalPrice : totalPrice - paid;
    const msg = encodeURIComponent(buildConfirmMessage(b, dateLabel, slotLines, paid, balanceDue, verifyStatus));
    const customerPhone = b.phone.replace(/\D/g, '');
    const fullPhone = customerPhone.startsWith('91') ? customerPhone : `91${customerPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    setVerifyModal(null);
  };

  const bookedSlots = ALL_SLOT_IDS.filter(id => slotsForDate[id]);
  const freeSlots = ALL_SLOT_IDS.filter(id => !slotsForDate[id]);

  const selectedLabel = dates.find(d => d.value === selectedDate)?.label || parseDateLabel(selectedDate);

  const totalBooked = Object.values(bookings).reduce((sum, day) => sum + Object.keys(day).length, 0);
  const todayBooked = Object.keys(bookings[getTodayStr()] || {}).length;
  const daysWithBookings = Object.keys(bookings).length;
  const addTotal = addSlotIds.reduce((sum, id) => sum + (id >= 19 ? 1200 : 1000), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', fontFamily: 'var(--font-ui)' }}>

      {/* Top nav */}
      <div style={{
        background: '#040404', borderBottom: '1px solid var(--border)',
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 30, height: 30, border: '1px solid var(--border-bright)', overflow: 'hidden', flexShrink: 0 }}>
            <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--green)', fontSize: '1.1rem', letterSpacing: '0.1em' }}>ZARO SPORTZ</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.6rem', letterSpacing: '0.14em', marginLeft: 10 }}>ADMIN</span>
          </div>
        </div>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 7, background: 'transparent',
          border: '1px solid var(--border)', color: 'var(--muted)', padding: '7px 14px',
          cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          letterSpacing: '0.1em', borderRadius: 0, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          <IconLogout size={13} /> LOGOUT
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 32, border: '1px solid var(--border)' }}>
          {[
            { label: 'TOTAL BOOKINGS', value: totalBooked, color: 'var(--green)' },
            { label: "TODAY'S BOOKED", value: todayBooked, color: 'var(--yellow)' },
            { label: 'ACTIVE DAYS', value: daysWithBookings, color: '#60a5fa' },
          ].map((s, i) => (
            <div key={s.label} style={{ background: 'var(--card-bg)', borderRight: i < 2 ? '1px solid var(--border)' : 'none', padding: '20px 24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', letterSpacing: '0.14em', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid var(--green)' : '2px solid transparent',
              color: tab === t ? 'var(--green)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.14em',
              padding: '10px 20px', cursor: 'pointer', transition: 'color 0.2s', marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {/* Date selector */}
        <div style={{ marginBottom: 28, position: 'relative' }} className="admin-date-drop">
          <label style={adminLabelStyle}>
            <IconCalendar size={12} color="var(--green)" />
            SELECT DATE
          </label>
          <button onClick={() => setDropOpen(o => !o)} style={{
            width: '100%', background: 'var(--card-bg)',
            border: '1px solid', borderColor: dropOpen ? 'var(--green)' : 'var(--border)',
            padding: '12px 16px', color: 'var(--text)', fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: 0, transition: 'border-color 0.2s',
          }}>
            {selectedLabel}
            <span style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <IconChevronDown size={14} color="var(--green)" />
            </span>
          </button>

          {dropOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 40,
              background: '#0c0c0c', border: '1px solid var(--border)', borderTop: 'none',
              maxHeight: 260, overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
            }}>
              {dates.map(d => {
                const count = Object.keys(bookings[d.value] || {}).length;
                return (
                  <button key={d.value} onClick={() => { setSelectedDate(d.value); setDropOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', background: d.value === selectedDate ? '#141a0e' : 'transparent',
                      border: 'none', borderBottom: '1px solid var(--border)',
                      color: d.value === selectedDate ? 'var(--green)' : 'var(--text-dim)',
                      padding: '11px 16px', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem', transition: 'background 0.12s',
                    }}>
                    {d.label}
                    {count > 0 && (
                      <span style={{
                        background: 'var(--green)', color: '#080808', borderRadius: 0,
                        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                      }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {addSuccess && (
          <div style={{
            background: '#141a0e', border: '1px solid var(--green)',
            padding: '12px 16px', marginBottom: 16, color: 'var(--green)',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <IconCheck size={13} color="var(--green)" /> {addSuccess}
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === 'BOOKINGS' && (() => {
          const groups = groupSlotsByBooking(slotsForDate);
          return (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={sectionHeadStyle}>BOOKED SLOTS</span>
                  <span style={countBadge('var(--green)')}>{bookedSlots.length}</span>
                </div>

                {groups.length === 0 ? (
                  <div style={emptyState}>NO BOOKINGS FOR THIS DATE</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {groups.map(({ ids, booking: b }) => {
                      const ps = PAYMENT_LABELS[b.paymentStatus] || PAYMENT_LABELS.pending;
                      const isVerified = b.paymentStatus === 'verified';
                      const totalPrice = ids.reduce((s, id) => s + (id >= 19 ? 1200 : 1000), 0);
                      const slotLines = ids.map(id => slotLabel(id)).join('  /  ');
                      return (
                        <div key={ids.join('-')} style={{
                          background: 'var(--card-bg)',
                          border: isVerified
                            ? '1px solid var(--green)50'
                            : (b.paymentStatus && b.paymentStatus !== 'pending')
                              ? '1px solid #f0a02040'
                              : '1px solid var(--border)',
                          padding: '16px 18px',
                          display: 'flex', alignItems: 'flex-start',
                          justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                          transition: 'background 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
                        >
                          <div style={{ flex: 1, minWidth: 160 }}>
                            {/* Slot time(s) */}
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: '0.82rem', letterSpacing: '0.04em', marginBottom: 6 }}>
                              {slotLines}
                              {ids.length > 1 && (
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.6rem', marginLeft: 10 }}>
                                  ({ids.length} SLOTS)
                                </span>
                              )}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.72rem', lineHeight: 1.8 }}>
                              <span style={{ color: 'var(--green)' }}>{b.name}</span>
                              <span style={{ color: 'var(--border-bright)', margin: '0 8px' }}>|</span>
                              {b.phone}
                              <span style={{ color: 'var(--border-bright)', margin: '0 8px' }}>|</span>
                              {b.sport}
                            </div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                              BOOKED {new Date(b.bookedAt).toLocaleString('en-IN')}
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{
                                background: ps.bg, color: ps.color,
                                border: `1px solid ${ps.border || ps.color + '40'}`,
                                padding: '3px 10px', fontSize: '0.62rem',
                                fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
                              }}>
                                {ps.label}
                              </span>
                              {b.amountPaid > 0 && (
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                                  RS. {b.amountPaid?.toLocaleString()} PAID
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {isVerified ? (
                              <span style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: '#141a0e', border: '1px solid var(--green)',
                                color: 'var(--green)', padding: '6px 12px',
                                fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em',
                              }}>
                                <IconCheck size={11} color="var(--green)" /> VERIFIED
                              </span>
                            ) : (
                              <button onClick={() => openVerify(selectedDate, ids[0], b)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  background: '#0e1a0a', border: '1px solid var(--green)40',
                                  color: 'var(--green)', padding: '6px 12px',
                                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                  fontSize: '0.62rem', letterSpacing: '0.08em', borderRadius: 0,
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--green)40'; }}
                              >
                                <IconCheck size={11} color="var(--green)" /> VERIFY
                              </button>
                            )}

                            <span style={{
                              background: '#0e1a0a',
                              color: 'var(--green)',
                              border: '1px solid var(--green)30',
                              padding: '4px 12px', fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                            }}>
                              RS. {totalPrice.toLocaleString()}
                            </span>

                            <button onClick={() => setConfirmDelete({ date: selectedDate, slotId: ids[0], groupIds: ids })}
                              style={{
                                background: '#140a0a', border: '1px solid #3a1515',
                                color: 'var(--red)', width: 34, height: 34,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', borderRadius: 0, flexShrink: 0,
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#200a0a'}
                              onMouseLeave={e => e.currentTarget.style.background = '#140a0a'}
                            >
                              <IconTrash size={14} color="var(--red)" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── SLOTS TAB ── */}
        {tab === 'SLOTS' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <span style={sectionHeadStyle}>SLOT MANAGEMENT</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginTop: 4, letterSpacing: '0.08em' }}>
                  {selectedLabel} &mdash; {bookedSlots.length} BOOKED / {freeSlots.length} FREE
                </div>
              </div>
              {!addMode && (
                <button onClick={() => setAddMode(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--green)', color: '#080808', border: 'none',
                  padding: '9px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s', borderRadius: 0,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#d8ff50'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >
                  <IconPlus size={13} color="#080808" /> ADD BOOKING
                </button>
              )}
            </div>

            {/* Add slot form */}
            {addMode && (
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--green)', padding: '24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: '0.72rem', letterSpacing: '0.14em' }}>
                    ADD BOOKING — {selectedLabel}
                  </span>
                  <button onClick={() => { setAddMode(false); setAddError(''); setAddSlotIds([]); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <IconX size={16} color="var(--muted)" />
                  </button>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ ...adminLabelStyle, marginBottom: 10 }}>
                    SELECT SLOTS
                    <span style={{ color: 'var(--muted)', fontSize: '0.62rem', marginLeft: 6 }}>— multi-select</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                    {ALL_SLOT_IDS.map(id => {
                      const isBooked = !!slotsForDate[id];
                      const isSelected = addSlotIds.includes(id);
                      const isPast = selectedDate === getTodayStr() && id < new Date().getHours();
                      const isDisabled = isBooked || isPast;
                      return (
                        <button key={id} onClick={() => !isDisabled && toggleAddSlot(id)}
                          disabled={isDisabled}
                          style={{
                            background: isBooked ? '#0a0a0a' : isPast ? '#0a0a0a' : isSelected ? 'var(--green)' : 'var(--dark)',
                            color: isDisabled ? '#2a2a2a' : isSelected ? '#080808' : id >= 19 ? 'var(--yellow)' : 'var(--text-dim)',
                            border: '1px solid',
                            borderColor: isDisabled ? 'var(--border)' : isSelected ? 'var(--green)' : 'var(--border)',
                            padding: '8px 6px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.02em',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            opacity: isDisabled ? 0.3 : 1, borderRadius: 0, transition: 'all 0.12s',
                            position: 'relative',
                          }}
                        >
                          {isSelected && (
                            <span style={{ position: 'absolute', top: 3, right: 4 }}>
                              <IconCheck size={9} color="#080808" />
                            </span>
                          )}
                          <span>{slotLabel(id)}</span>
                          <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>
                            {isBooked ? 'BOOKED' : isPast ? 'PAST' : `RS.${id >= 19 ? 1200 : 1000}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {addSlotIds.length > 0 && (
                    <div style={{
                      background: '#141a0e', border: '1px solid var(--green)',
                      padding: '12px 16px', marginTop: 10,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                        {addSlotIds.length} SLOT{addSlotIds.length > 1 ? 'S' : ''} SELECTED
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--green)', fontSize: '1.3rem' }}>
                        RS. {addTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={adminLabelStyle}>SPORT</label>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {SPORTS.map(s => (
                      <button key={s} onClick={() => setAddSport(s)} style={{
                        flex: 1, padding: '9px 12px', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em',
                        background: addSport === s ? 'var(--green)' : 'var(--dark)',
                        color: addSport === s ? '#080808' : 'var(--text-dim)',
                        border: '1px solid', borderColor: addSport === s ? 'var(--green)' : 'var(--border)',
                        borderRadius: 0, transition: 'all 0.15s',
                      }}>{s.toUpperCase()}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 16 }} className="add-form-fields">
                  <div>
                    <label style={adminLabelStyle}>CUSTOMER NAME</label>
                    <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Enter name" style={{ borderRadius: 0 }} />
                  </div>
                  <div>
                    <label style={adminLabelStyle}>PHONE</label>
                    <input value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="9XXXXXXXXX" style={{ borderRadius: 0 }} />
                  </div>
                </div>

                {addError && (
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: '0.68rem', marginBottom: 12, letterSpacing: '0.08em' }}>
                    {addError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 2 }}>
                  <button onClick={handleAddSlot} style={{
                    flex: 1, background: 'var(--green)', color: '#080808', border: 'none',
                    padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                    letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0, transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#d8ff50'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                  >
                    CONFIRM BOOKING
                  </button>
                  <button onClick={() => { setAddMode(false); setAddError(''); setAddSlotIds([]); }} style={{
                    padding: '12px 20px', background: 'var(--dark)', color: 'var(--text-dim)',
                    border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem', cursor: 'pointer', borderRadius: 0, letterSpacing: '0.08em',
                  }}>CANCEL</button>
                </div>
              </div>
            )}

            {/* All slots grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 2 }}>
              {ALL_SLOT_IDS.map(id => {
                const b = slotsForDate[id];
                const isBooked = !!b;
                // Slot is "past" only on today — if the slot's start hour has already passed
                const isPast = selectedDate === getTodayStr() && id < new Date().getHours();
                return (
                  <div key={id} style={{
                    background: isBooked ? '#141a0e' : isPast ? '#0a0a0a' : 'var(--card-bg)',
                    border: '1px solid',
                    borderColor: isBooked ? 'var(--green)30' : isPast ? 'var(--border)' : 'var(--border)',
                    padding: '12px', position: 'relative',
                    opacity: isPast && !isBooked ? 0.45 : 1,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isBooked ? 'var(--green)' : isPast ? 'var(--muted)' : 'var(--text-dim)', letterSpacing: '0.04em', marginBottom: 4 }}>
                      {slotLabel(id)}
                    </div>
                    {isBooked ? (
                      <>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: '0.72rem', marginBottom: 2 }}>{b.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginBottom: 6 }}>{b.sport}</div>
                        {b.paymentStatus && (
                          <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                            color: (PAYMENT_LABELS[b.paymentStatus] || PAYMENT_LABELS.pending).color,
                            letterSpacing: '0.06em', marginBottom: 8,
                          }}>
                            {(PAYMENT_LABELS[b.paymentStatus] || PAYMENT_LABELS.pending).label}
                          </div>
                        )}
                        <button onClick={() => setConfirmDelete({ date: selectedDate, slotId: id })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: '#140a0a', border: '1px solid #3a1515',
                            color: 'var(--red)', width: '100%',
                            padding: '6px 10px', cursor: 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                            letterSpacing: '0.08em', borderRadius: 0,
                          }}>
                          <IconMinus size={11} color="var(--red)" /> REMOVE
                        </button>
                      </>
                    ) : isPast ? (
                      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', letterSpacing: '0.08em' }}>
                        PAST
                      </div>
                    ) : (
                      <>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', letterSpacing: '0.06em', marginBottom: 8 }}>
                          RS. {id >= 19 ? '1,200' : '1,000'} / FREE
                        </div>
                        <button onClick={() => { setAddMode(true); setAddSlotIds([id]); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'transparent', border: '1px solid var(--border)',
                            color: 'var(--text-dim)', width: '100%',
                            padding: '6px 10px', cursor: 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                            letterSpacing: '0.08em', borderRadius: 0, transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                        >
                          <IconPlus size={11} color="currentColor" /> ASSIGN
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === 'OVERVIEW' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={sectionHeadStyle}>ALL UPCOMING BOOKINGS</span>
              <span style={countBadge('var(--green)')}>{totalBooked}</span>
            </div>

            {Object.keys(bookings).length === 0 ? (
              <div style={emptyState}>NO UPCOMING BOOKINGS</div>
            ) : (
              Object.keys(bookings).sort().map(date => {
                const dayBookings = bookings[date];
                const dayLabel = parseDateLabel(date);
                const groups = groupSlotsByBooking(dayBookings);
                return (
                  <div key={date} style={{ marginBottom: 12 }}>
                    <div style={{
                      background: '#0e0e0e', border: '1px solid var(--border)', borderBottom: 'none',
                      padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.72rem', letterSpacing: '0.1em' }}>{dayLabel}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--green)', letterSpacing: '0.08em' }}>
                        {Object.keys(dayBookings).length} SLOT{Object.keys(dayBookings).length !== 1 ? 'S' : ''}
                      </span>
                    </div>
                    {groups.map(({ ids, booking: b }) => {
                      const ps = PAYMENT_LABELS[b.paymentStatus] || PAYMENT_LABELS.pending;
                      const isVerified = b.paymentStatus === 'verified';
                      const slotLines = ids.map(id => slotLabel(Number(id))).join('  /  ');
                      return (
                        <div key={ids.join('-')} style={{
                          background: 'var(--card-bg)', border: '1px solid var(--border)', borderTop: 'none',
                          padding: '12px 16px', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', gap: 8, flexWrap: 'wrap',
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                            <span style={{ color: 'var(--green)', marginRight: 12 }}>{slotLines}</span>
                            {ids.length > 1 && (
                              <span style={{ color: 'var(--muted)', fontSize: '0.6rem', marginRight: 12 }}>({ids.length} slots)</span>
                            )}
                            <span style={{ color: 'var(--text)', marginRight: 8 }}>{b.name}</span>
                            <span style={{ color: 'var(--muted)', marginRight: 8 }}>{b.phone}</span>
                            <span style={{ color: ps.color, fontSize: '0.62rem' }}>{ps.label}</span>
                            {b.amountPaid > 0 && (
                              <span style={{ color: 'var(--muted)', fontSize: '0.6rem', marginLeft: 6 }}>RS.{b.amountPaid} PAID</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {isVerified ? (
                              <span style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                background: '#141a0e', border: '1px solid var(--green)',
                                color: 'var(--green)', padding: '3px 10px',
                                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.06em',
                              }}>
                                <IconCheck size={9} color="var(--green)" /> VERIFIED
                              </span>
                            ) : (
                              <button onClick={() => openVerify(date, Number(ids[0]), b)}
                                style={{
                                  background: '#0e1a0a', border: '1px solid var(--green)40',
                                  color: 'var(--green)', padding: '4px 10px',
                                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                  fontSize: '0.6rem', letterSpacing: '0.06em', borderRadius: 0,
                                }}>
                                VERIFY
                              </button>
                            )}
                            <button onClick={() => setConfirmDelete({ date, slotId: Number(ids[0]), groupIds: ids.map(Number) })}
                              style={{
                                background: 'none', border: '1px solid #3a1515',
                                color: 'var(--red)', width: 28, height: 28,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', borderRadius: 0,
                              }}>
                              <IconTrash size={12} color="var(--red)" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── VERIFY PAYMENT MODAL ── */}
      {verifyModal && (
        <div onClick={() => setVerifyModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24, animation: 'fadeIn 0.15s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card-bg)', border: '1px solid var(--green)',
            padding: 28, maxWidth: 420, width: '100%',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 6 }}>
              VERIFY PAYMENT
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', fontSize: '1.2rem', letterSpacing: '0.06em', marginBottom: 4 }}>
              {verifyModal.groupSlotIds.length > 1
                ? `${verifyModal.groupSlotIds.length} SLOTS (GROUP BOOKING)`
                : slotLabel(verifyModal.slotId)}
            </h3>
            {verifyModal.groupSlotIds.length > 1 && (
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginBottom: 20, lineHeight: 1.8 }}>
                {verifyModal.groupSlotIds.map(id => slotLabel(id)).join(' / ')}
              </div>
            )}
            {verifyModal.groupSlotIds.length === 1 && <div style={{ marginBottom: 20 }} />}

            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.9,
              color: 'var(--text-dim)', borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)', padding: '14px 0', marginBottom: 20,
            }}>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>NAME</span>{verifyModal.booking.name}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>PHONE</span>{verifyModal.booking.phone}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>SPORT</span>{verifyModal.booking.sport}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>TOTAL PRICE</span>RS. {verifyModal.groupSlotIds.reduce((s, id) => s + (id >= 19 ? 1200 : 1000), 0).toLocaleString()}</div>
            </div>

            {/* Payment status */}
            <div style={{ marginBottom: 16 }}>
              <label style={adminLabelStyle}>PAYMENT STATUS</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { val: 'verified', label: 'VERIFIED - CONFIRMED' },
                  { val: 'paid_less', label: 'PAID LESS (ADVANCE)' },
                  { val: 'paid_more', label: 'PAID MORE' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setVerifyStatus(opt.val)} style={{
                    background: verifyStatus === opt.val ? 'var(--green)' : 'var(--dark)',
                    color: verifyStatus === opt.val ? '#080808' : 'var(--text-dim)',
                    border: '1px solid', borderColor: verifyStatus === opt.val ? 'var(--green)' : 'var(--border)',
                    padding: '9px 14px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em',
                    borderRadius: 0, transition: 'all 0.15s',
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={adminLabelStyle}>AMOUNT RECEIVED (RS.)</label>
              <input
                type="number"
                value={verifyAmount}
                onChange={e => setVerifyAmount(e.target.value)}
                placeholder="Enter amount received"
                style={{ borderRadius: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={handleVerify} style={{
                flex: 1, background: 'var(--green)', color: '#080808', border: 'none',
                padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#d8ff50'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
              >
                <IconWhatsApp size={14} color="#080808" />
                CONFIRM &amp; SEND WHATSAPP
              </button>
              <button onClick={() => setVerifyModal(null)} style={{
                padding: '12px 16px', background: 'var(--dark)', color: 'var(--text-dim)',
                border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', cursor: 'pointer', borderRadius: 0, letterSpacing: '0.08em',
              }}>CANCEL</button>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginTop: 10, textAlign: 'center', letterSpacing: '0.04em' }}>
              Opens WhatsApp with a pre-filled confirmation message.
            </p>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE MODAL ── */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24, animation: 'fadeIn 0.15s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card-bg)', border: '1px solid var(--red)',
            padding: 32, maxWidth: 360, width: '100%',
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 8 }}>
                CONFIRM REMOVAL
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', fontSize: '1.6rem', letterSpacing: '0.06em' }}>
                DELETE BOOKING?
              </h3>
            </div>

            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.9, color: 'var(--text-dim)',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              padding: '16px 0', marginBottom: 24,
            }}>
              <div>{slotLabel(confirmDelete.slotId)}</div>
              <div>{parseDateLabel(confirmDelete.date)}</div>
              <div style={{ color: 'var(--text)' }}>
                {(bookings[confirmDelete.date] || slotsForDate)?.[confirmDelete.slotId]?.name}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-dim)', padding: '11px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.1em', borderRadius: 0,
              }}>CANCEL</button>
              <button onClick={() => handleDelete(confirmDelete.date, confirmDelete.slotId)}
                style={{
                  flex: 1, background: 'var(--red)', border: 'none', color: '#fff', padding: '11px',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  letterSpacing: '0.1em', borderRadius: 0, transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ff5555'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
              >DELETE</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .add-form-fields { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const adminLabelStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  marginBottom: 8, fontFamily: 'var(--font-mono)',
  color: 'var(--green)', fontSize: '0.62rem', letterSpacing: '0.16em',
};

const sectionHeadStyle = {
  fontFamily: 'var(--font-mono)', color: 'var(--text-dim)',
  fontSize: '0.72rem', letterSpacing: '0.16em',
};

function countBadge(color) {
  return {
    background: `${color}18`, color, border: `1px solid ${color}40`,
    padding: '2px 10px', fontFamily: 'var(--font-mono)',
    fontSize: '0.68rem', letterSpacing: '0.1em',
  };
}

const emptyState = {
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  padding: '32px', textAlign: 'center', color: 'var(--muted)',
  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.14em',
};
