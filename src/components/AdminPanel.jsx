import { useState, useEffect } from 'react';
import {
  subscribeToAll, subscribeToDate, deleteBooking,
  getAvailableDates, parseDateLabel, getTodayStr,
  bookSlots, updateBookingStatus,
} from '../utils/bookingStore';
import {
  IconTrash, IconLogout, IconCalendar, IconChevronDown,
  IconPlus, IconMinus, IconCheck, IconX, IconWhatsApp, IconTrophy, IconClock,
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

const SPORTS = ["6's Football", 'Cricket'];
const TABS = ['BOOKINGS', 'SLOTS', 'OVERVIEW'];

function IconHourglass({ size = 12, color = '#f0a020' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5 22h14"/>
      <path d="M5 2h14"/>
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
    </svg>
  );
}

const STATUS_LABELS = {
  pending:   { label: 'PENDING APPROVAL', icon: <IconHourglass size={11} color="#f0a020" />, color: '#f0a020', bg: '#1a1200', border: '#f0a02040' },
  accepted:  { label: '✓ ACCEPTED',        color: 'var(--green)', bg: '#0e1a0a', border: 'var(--green)50' },
  rejected:  { label: '✕ REJECTED',        color: 'var(--red)',   bg: '#140a0a', border: 'var(--red)40' },
};

function groupSlotsByBooking(slotsObj) {
  const groups = {};
  const slotIds = Object.keys(slotsObj).map(Number).sort((a, b) => a - b);
  for (const id of slotIds) {
    const b = slotsObj[id];
    const key = b.groupId || `${b.name}_${b.phone}_${b.bookedAt}`;
    if (!groups[key]) groups[key] = { ids: [], booking: b };
    groups[key].ids.push(id);
  }
  return Object.values(groups);
}

function buildAcceptMessage(b, dateLabel, slotLines) {
  const slotsText = Array.isArray(slotLines) ? slotLines.join(', ') : slotLines;
  return (
    `Hi ${b.name},\n\n` +
    `Great news! Your booking at Zaro Sportz has been ACCEPTED.\n\n` +
    `Date: ${dateLabel}\n` +
    `Slots: ${slotsText}\n` +
    `Sport: ${b.sport}\n\n` +
    `Please arrive a few minutes early. Payment to be settled at the venue.\n\n` +
    `See you on the field!\n- Zaro Sportz`
  );
}

function buildRejectMessage(b, dateLabel, slotLines) {
  const slotsText = Array.isArray(slotLines) ? slotLines.join(', ') : slotLines;
  return (
    `Hi ${b.name},\n\n` +
    `Thank you for your interest in booking at Zaro Sportz. We regret to inform you that we are unable to confirm your booking request at this time.\n\n` +
    `Date: ${dateLabel}\n` +
    `Slots: ${slotsText}\n` +
    `Sport: ${b.sport}\n\n` +
    `We apologize for any inconvenience caused. Please feel free to choose a different time slot and we will do our best to accommodate you.\n\n` +
    `Thank you for your understanding.\n- Zaro Sportz`
  );
}

function buildTournamentCancelMessage(b, dateLabel, slotLines) {
  const slotsText = Array.isArray(slotLines) ? slotLines.join(', ') : slotLines;
  return (
    `Hi ${b.name},\n\n` +
    `We regret to inform you that your booking at Zaro Sportz has been cancelled.\n\n` +
    `Date: ${dateLabel}\n` +
    `Slots: ${slotsText}\n` +
    `Sport: ${b.sport}\n\n` +
    `Reason: A tournament has been scheduled for this time slot. We apologize for the inconvenience.\n\n` +
    `Please feel free to rebook for another date. We look forward to seeing you!\n\n` +
    `- Zaro Sportz`
  );
}

export default function AdminPanel({ onLogout }) {
  const [bookings, setBookings] = useState({});
  const [slotsForDate, setSlotsForDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [dates] = useState(getAvailableDates());
  const [dropOpen, setDropOpen] = useState(false);
  const [tab, setTab] = useState('BOOKINGS');

  const [addMode, setAddMode] = useState(false);
  const [addSlotIds, setAddSlotIds] = useState([]);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addSport, setAddSport] = useState(SPORTS[0]);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const [acceptModal, setAcceptModal] = useState(null);

  const [rejectModal, setRejectModal] = useState(null);

  const [tournamentModal, setTournamentModal] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAll((all) => setBookings(all));
    return unsub;
  }, []);

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

  const handleAccept = async () => {
    if (!acceptModal) return;
    const { date, ids, booking: b } = acceptModal;
    for (const sid of ids) {
      await updateBookingStatus(date, sid, 'accepted');
    }
    const dateLabel = parseDateLabel(date);
    const slotLines = ids.map(id => slotLabel(id));
    const msg = encodeURIComponent(buildAcceptMessage(b, dateLabel, slotLines));
    const customerPhone = b.phone.replace(/\D/g, '');
    const fullPhone = customerPhone.startsWith('91') ? customerPhone : `91${customerPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    setAcceptModal(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const { date, ids, booking: b } = rejectModal;
    const dateLabel = parseDateLabel(date);
    const slotLines = ids.map(id => slotLabel(id));
    for (const sid of ids) {
      await deleteBooking(date, sid);
    }
    const msg = encodeURIComponent(buildRejectMessage(b, dateLabel, slotLines));
    const customerPhone = b.phone.replace(/\D/g, '');
    const fullPhone = customerPhone.startsWith('91') ? customerPhone : `91${customerPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    setRejectModal(null);
  };

  const handleTournamentCancel = async () => {
    if (!tournamentModal) return;
    const { date, ids, booking: b } = tournamentModal;
    const dateLabel = parseDateLabel(date);
    const slotLines = ids.map(id => slotLabel(id));
    for (const sid of ids) {
      await deleteBooking(date, sid);
    }
    const msg = encodeURIComponent(buildTournamentCancelMessage(b, dateLabel, slotLines));
    const customerPhone = b.phone.replace(/\D/g, '');
    const fullPhone = customerPhone.startsWith('91') ? customerPhone : `91${customerPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    setTournamentModal(null);
  };

  const handleDelete = async (date, slotId) => {
    await deleteBooking(date, slotId);
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
      status: 'accepted',
    });
    const n = addName.trim();
    setAddMode(false);
    setAddSlotIds([]);
    setAddName('');
    setAddPhone('');
    setAddSuccess(`${addSlotIds.length} slot${addSlotIds.length > 1 ? 's' : ''} booked for ${n}.`);
    setTimeout(() => setAddSuccess(''), 3500);
  };

  const bookedSlots = ALL_SLOT_IDS.filter(id => slotsForDate[id]);
  const freeSlots = ALL_SLOT_IDS.filter(id => !slotsForDate[id]);

  const selectedLabel = dates.find(d => d.value === selectedDate)?.label || parseDateLabel(selectedDate);

  const totalBooked = Object.values(bookings).reduce((sum, day) => sum + Object.keys(day).length, 0);
  const daysWithBookings = Object.keys(bookings).length;
  const addTotal = addSlotIds.reduce((sum, id) => sum + (id >= 19 ? 1200 : 1000), 0);

  const pendingCount = Object.values(bookings).reduce((sum, day) => {
    return sum + Object.values(day).filter(b => b.status === 'pending').length;
  }, 0);

  function renderStatusLabel(st) {
    if (st.icon) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {st.icon} {st.label}
        </span>
      );
    }
    return st.label;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', fontFamily: 'var(--font-ui)' }}>

      <div style={{
        background: '#040404', borderBottom: '1px solid var(--border)',
        padding: '0 16px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', overflow: 'hidden', flexShrink: 0 }}>
            <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--green)', fontSize: '1rem', letterSpacing: '0.1em' }}>ZARO SPORTZ</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.6rem', letterSpacing: '0.14em', marginLeft: 8 }}>ADMIN</span>
          </div>
        </div>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 7, background: 'transparent',
          border: '1px solid var(--border)', color: 'var(--muted)', padding: '7px 12px',
          cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          letterSpacing: '0.1em', borderRadius: 0, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          <IconLogout size={13} /> LOGOUT
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 12px 80px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 24, border: '1px solid var(--border)' }}>
          {[
            { label: 'TOTAL BOOKINGS', value: totalBooked, color: 'var(--green)' },
            {
              label: 'PENDING APPROVAL',
              value: pendingCount,
              color: pendingCount > 0 ? '#f0a020' : 'var(--muted)',
              icon: pendingCount > 0 ? <IconHourglass size={14} color="#f0a020" /> : null,
            },
            { label: 'ACTIVE DAYS', value: daysWithBookings, color: '#60a5fa' },
          ].map((s, i) => (
            <div key={s.label} style={{ background: 'var(--card-bg)', borderRight: i < 2 ? '1px solid var(--border)' : 'none', padding: '16px 14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3rem)', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.58rem', letterSpacing: '0.12em', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                {s.icon}{s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid var(--green)' : '2px solid transparent',
              color: tab === t ? 'var(--green)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.14em',
              padding: '10px 16px', cursor: 'pointer', transition: 'color 0.2s', marginBottom: -1,
              position: 'relative', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {t}
              {t === 'BOOKINGS' && pendingCount > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 3,
                  background: '#f0a020', color: '#000',
                  borderRadius: '50%', width: 14, height: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', fontWeight: 700,
                }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 24, position: 'relative' }} className="admin-date-drop">
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

        {tab === 'BOOKINGS' && (() => {
          const groups = groupSlotsByBooking(slotsForDate);
          const pendingGroups = groups.filter(g => g.booking.status === 'pending');
          const acceptedGroups = groups.filter(g => g.booking.status === 'accepted');
          const otherGroups = groups.filter(g => g.booking.status !== 'pending' && g.booking.status !== 'accepted');
          const orderedGroups = [...pendingGroups, ...acceptedGroups, ...otherGroups];

          return (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={sectionHeadStyle}>BOOKINGS</span>
                  <span style={countBadge('var(--green)')}>{bookedSlots.length} slots</span>
                  {pendingGroups.length > 0 && (
                    <span style={{ ...countBadge('#f0a020'), display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconHourglass size={10} color="#f0a020" /> {pendingGroups.length} pending
                    </span>
                  )}
                </div>

                {orderedGroups.length === 0 ? (
                  <div style={emptyState}>NO BOOKINGS FOR THIS DATE</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {orderedGroups.map(({ ids, booking: b }) => {
                      const st = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
                      const isAccepted = b.status === 'accepted';
                      const isPending = b.status === 'pending';
                      const totalPrice = ids.reduce((s, id) => s + (id >= 19 ? 1200 : 1000), 0);
                      const slotLines = ids.map(id => slotLabel(id)).join('  /  ');
                      return (
                        <div key={ids.join('-')} style={{
                          background: 'var(--card-bg)',
                          border: isAccepted
                            ? '1px solid var(--green)50'
                            : isPending
                              ? '1px solid #f0a02040'
                              : '1px solid var(--border)',
                          padding: '14px 14px',
                          display: 'flex', alignItems: 'flex-start',
                          justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                          transition: 'background 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
                        >
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: '0.95rem', letterSpacing: '0.04em', marginBottom: 6, fontWeight: 500 }}>
                              {slotLines}
                              {ids.length > 1 && (
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginLeft: 10 }}>
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
                            <div style={{ marginTop: 8 }}>
                              <span style={{
                                background: st.bg, color: st.color,
                                border: `1px solid ${st.border || st.color + '40'}`,
                                padding: '3px 10px', fontSize: '0.62rem',
                                fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                              }}>
                                {renderStatusLabel(st)}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {isPending && (
                              <button onClick={() => setAcceptModal({ date: selectedDate, ids, booking: b })}
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
                                <IconCheck size={11} color="var(--green)" /> ACCEPT
                              </button>
                            )}

                            {isPending && (
                              <button onClick={() => setRejectModal({ date: selectedDate, ids, booking: b })}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  background: '#140a0a', border: '1px solid var(--red)40',
                                  color: 'var(--red)', padding: '6px 12px',
                                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                  fontSize: '0.62rem', letterSpacing: '0.08em', borderRadius: 0,
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--red)40'; }}
                              >
                                <IconX size={11} color="var(--red)" /> REJECT
                              </button>
                            )}

                            {isAccepted && (
                              <span style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: '#141a0e', border: '1px solid var(--green)',
                                color: 'var(--green)', padding: '6px 12px',
                                fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em',
                              }}>
                                <IconCheck size={11} color="var(--green)" /> ACCEPTED
                              </span>
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

                            {isAccepted && (
                              <button
                                onClick={() => setTournamentModal({ date: selectedDate, ids, booking: b })}
                                title="Cancel due to tournament"
                                style={{
                                  background: '#1a0e00', border: '1px solid #f0a02040',
                                  color: '#f0a020', padding: '6px 10px',
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                  fontSize: '0.6rem', letterSpacing: '0.06em',
                                  borderRadius: 0, transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f0a020'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0a02040'; }}
                              >
                                <IconTrophy size={12} color="#f0a020" /> TOURNAMENT
                              </button>
                            )}

                            <button onClick={() => handleDelete(selectedDate, ids[0])}
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

        {tab === 'SLOTS' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
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

            {addMode && (
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--green)', padding: '20px', marginBottom: 24 }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
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
                            padding: '9px 4px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.02em',
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
                          <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
              {ALL_SLOT_IDS.map(id => {
                const b = slotsForDate[id];
                const isBooked = !!b;
                const isPast = selectedDate === getTodayStr() && id < new Date().getHours();
                return (
                  <div key={id} style={{
                    background: isBooked ? '#141a0e' : isPast ? '#0a0a0a' : 'var(--card-bg)',
                    border: '1px solid',
                    borderColor: isBooked ? 'var(--green)30' : isPast ? 'var(--border)' : 'var(--border)',
                    padding: '12px', position: 'relative',
                    opacity: isPast && !isBooked ? 0.45 : 1,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: isBooked ? 'var(--green)' : isPast ? 'var(--muted)' : 'var(--text-dim)', letterSpacing: '0.03em', marginBottom: 5, fontWeight: 500 }}>
                      {slotLabel(id)}
                    </div>
                    {isBooked ? (
                      <>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: '0.72rem', marginBottom: 2 }}>{b.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginBottom: 4 }}>{b.sport}</div>
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                          color: (STATUS_LABELS[b.status] || STATUS_LABELS.pending).color,
                          letterSpacing: '0.06em', marginBottom: 8,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {b.status === 'pending' && <IconHourglass size={10} color="#f0a020" />}
                          {(STATUS_LABELS[b.status] || STATUS_LABELS.pending).label}
                        </div>
                        <button onClick={() => handleDelete(selectedDate, id)}
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
                      const st = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
                      const isAccepted = b.status === 'accepted';
                      const isPending = b.status === 'pending';
                      const slotLines = ids.map(id => slotLabel(Number(id))).join('  /  ');
                      return (
                        <div key={ids.join('-')} style={{
                          background: 'var(--card-bg)', border: '1px solid var(--border)', borderTop: 'none',
                          padding: '12px 16px', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', gap: 8, flexWrap: 'wrap',
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                            <span style={{ color: 'var(--green)', marginRight: 12, fontSize: '0.85rem', fontWeight: 500 }}>{slotLines}</span>
                            {ids.length > 1 && (
                              <span style={{ color: 'var(--muted)', fontSize: '0.6rem', marginRight: 12 }}>({ids.length} slots)</span>
                            )}
                            <span style={{ color: 'var(--text)', marginRight: 8 }}>{b.name}</span>
                            <span style={{ color: 'var(--muted)', marginRight: 8 }}>{b.phone}</span>
                            <span style={{ color: st.color, fontSize: '0.62rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {isPending && <IconHourglass size={10} color="#f0a020" />}
                              {st.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {isPending && (
                              <button onClick={() => setAcceptModal({ date, ids: ids.map(Number), booking: b })}
                                style={{
                                  background: '#0e1a0a', border: '1px solid var(--green)40',
                                  color: 'var(--green)', padding: '4px 10px',
                                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                  fontSize: '0.6rem', letterSpacing: '0.06em', borderRadius: 0,
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                <IconCheck size={10} color="var(--green)" /> ACCEPT
                              </button>
                            )}
                            {isPending && (
                              <button onClick={() => setRejectModal({ date, ids: ids.map(Number), booking: b })}
                                style={{
                                  background: '#140a0a', border: '1px solid var(--red)40',
                                  color: 'var(--red)', padding: '4px 10px',
                                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                  fontSize: '0.6rem', letterSpacing: '0.06em', borderRadius: 0,
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                <IconX size={10} color="var(--red)" /> REJECT
                              </button>
                            )}
                            {isAccepted && (
                              <button onClick={() => setTournamentModal({ date, ids: ids.map(Number), booking: b })}
                                style={{
                                  background: '#1a0e00', border: '1px solid #f0a02040',
                                  color: '#f0a020', padding: '4px 10px',
                                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                  fontSize: '0.6rem', letterSpacing: '0.06em', borderRadius: 0,
                                  display: 'flex', alignItems: 'center', gap: 5,
                                }}>
                                <IconTrophy size={11} color="#f0a020" /> TOURNAMENT
                              </button>
                            )}
                            <button onClick={() => handleDelete(date, Number(ids[0]))}
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

      {acceptModal && (
        <div onClick={() => setAcceptModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 16, animation: 'fadeIn 0.15s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card-bg)', border: '1px solid var(--green)',
            padding: 24, maxWidth: 420, width: '100%',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 6 }}>
              ACCEPT BOOKING
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', fontSize: '1.2rem', letterSpacing: '0.06em', marginBottom: 16 }}>
              CONFIRM &amp; NOTIFY CUSTOMER?
            </h3>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.9,
              color: 'var(--text-dim)', borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)', padding: '14px 0', marginBottom: 24,
            }}>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>NAME</span>{acceptModal.booking.name}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>PHONE</span>{acceptModal.booking.phone}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>SPORT</span>{acceptModal.booking.sport}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>DATE</span>{parseDateLabel(acceptModal.date)}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>SLOTS</span>{acceptModal.ids.map(id => slotLabel(id)).join(' / ')}</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={handleAccept} style={{
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
                ACCEPT &amp; SEND WHATSAPP
              </button>
              <button onClick={() => setAcceptModal(null)} style={{
                padding: '12px 16px', background: 'var(--dark)', color: 'var(--text-dim)',
                border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', cursor: 'pointer', borderRadius: 0, letterSpacing: '0.08em',
              }}>CANCEL</button>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginTop: 10, textAlign: 'center', letterSpacing: '0.04em' }}>
              Opens WhatsApp with a confirmation message to the customer.
            </p>
          </div>
        </div>
      )}

      {rejectModal && (
        <div onClick={() => setRejectModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 16, animation: 'fadeIn 0.15s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card-bg)', border: '1px solid var(--red)',
            padding: 24, maxWidth: 420, width: '100%',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 6 }}>
              REJECT BOOKING
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', fontSize: '1.2rem', letterSpacing: '0.06em', marginBottom: 8 }}>
              REJECT &amp; NOTIFY CUSTOMER?
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.66rem', lineHeight: 1.7, marginBottom: 20 }}>
              This will remove the booking and send a polite WhatsApp message to the customer.
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.9,
              color: 'var(--text-dim)', borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)', padding: '14px 0', marginBottom: 24,
            }}>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>NAME</span>{rejectModal.booking.name}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>PHONE</span>{rejectModal.booking.phone}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>SPORT</span>{rejectModal.booking.sport}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>DATE</span>{parseDateLabel(rejectModal.date)}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>SLOTS</span>{rejectModal.ids.map(id => slotLabel(id)).join(' / ')}</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={handleReject} style={{
                flex: 1, background: 'var(--red)', color: '#fff', border: 'none',
                padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e03030'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
              >
                <IconWhatsApp size={14} color="#fff" />
                REJECT &amp; SEND WHATSAPP
              </button>
              <button onClick={() => setRejectModal(null)} style={{
                padding: '12px 16px', background: 'var(--dark)', color: 'var(--text-dim)',
                border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', cursor: 'pointer', borderRadius: 0, letterSpacing: '0.08em',
              }}>BACK</button>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.62rem', marginTop: 10, textAlign: 'center', letterSpacing: '0.04em' }}>
              Opens WhatsApp with a polite rejection message to the customer.
            </p>
          </div>
        </div>
      )}

      {tournamentModal && (
        <div onClick={() => setTournamentModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 16, animation: 'fadeIn 0.15s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card-bg)', border: '1px solid #f0a020',
            padding: 24, maxWidth: 420, width: '100%',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#f0a020', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconTrophy size={14} color="#f0a020" /> TOURNAMENT CANCELLATION
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', fontSize: '1.1rem', letterSpacing: '0.06em', marginBottom: 8 }}>
              CANCEL DUE TO TOURNAMENT?
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.66rem', lineHeight: 1.7, marginBottom: 20 }}>
              This will delete the booking and send a WhatsApp message to the customer informing them of the cancellation due to a tournament.
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.9,
              color: 'var(--text-dim)', borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)', padding: '14px 0', marginBottom: 24,
            }}>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>NAME</span>{tournamentModal.booking.name}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>PHONE</span>{tournamentModal.booking.phone}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>DATE</span>{parseDateLabel(tournamentModal.date)}</div>
              <div><span style={{ color: 'var(--muted)', marginRight: 10 }}>SLOTS</span>{tournamentModal.ids.map(id => slotLabel(id)).join(' / ')}</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={handleTournamentCancel} style={{
                flex: 1, background: '#f0a020', color: '#000', border: 'none',
                padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#ffbb44'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0a020'}
              >
                <IconWhatsApp size={14} color="#000" />
                CANCEL &amp; NOTIFY VIA WHATSAPP
              </button>
              <button onClick={() => setTournamentModal(null)} style={{
                padding: '12px 16px', background: 'var(--dark)', color: 'var(--text-dim)',
                border: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem', cursor: 'pointer', borderRadius: 0, letterSpacing: '0.08em',
              }}>BACK</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .add-form-fields { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
