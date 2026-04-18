// src/utils/bookingStore.js
// Firebase Realtime Database — global slot storage
import { db } from '../firebase';
import {
  ref, get, set, remove, onValue, off,
} from 'firebase/database';

export function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isFutureOrToday(dateStr) {
  return dateStr >= getTodayStr();
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function loadBookings() {
  try {
    const snap = await get(ref(db, 'bookings'));
    if (!snap.exists()) return {};
    const all = snap.val();
    const today = getTodayStr();
    const cleaned = {};
    for (const date in all) {
      if (date >= today) cleaned[date] = all[date];
      else remove(ref(db, `bookings/${date}`));
    }
    return cleaned;
  } catch {
    return {};
  }
}

export async function getSlotsForDate(date) {
  try {
    const snap = await get(ref(db, `bookings/${date}`));
    return snap.exists() ? snap.val() : {};
  } catch {
    return {};
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

// bookSlots: writes one booking entry per slot under bookings/<date>/<slotId>
// All slots from the same booking share a groupId so admin sees them as one request
export async function bookSlots({ date, slotIds, name, phone, sport, paymentStatus = 'pending', amountPaid = 0 }) {
  const now = new Date().toISOString();
  // groupId ties all slots from the same booking together
  const groupId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  for (const id of slotIds) {
    await set(ref(db, `bookings/${date}/${id}`), {
      name, phone, sport,
      bookedAt: now,
      paymentStatus,
      amountPaid,
      groupId,
      totalSlots: slotIds.length,
      allSlotIds: slotIds,
    });
  }
  return await loadBookings();
}

export async function updatePaymentStatus(date, slotId, paymentStatus, amountPaid) {
  await set(ref(db, `bookings/${date}/${slotId}/paymentStatus`), paymentStatus);
  await set(ref(db, `bookings/${date}/${slotId}/amountPaid`), amountPaid);
}

export async function deleteBooking(date, slotId) {
  await remove(ref(db, `bookings/${date}/${slotId}`));
  const snap = await get(ref(db, `bookings/${date}`));
  if (!snap.exists() || Object.keys(snap.val() || {}).length === 0) {
    await remove(ref(db, `bookings/${date}`));
  }
  return await loadBookings();
}

// ── Realtime listener ─────────────────────────────────────────────────────────

export function subscribeToDate(date, callback) {
  const r = ref(db, `bookings/${date}`);
  const handler = (snap) => callback(snap.exists() ? snap.val() : {});
  onValue(r, handler);
  return () => off(r, 'value', handler);
}

export function subscribeToAll(callback) {
  const today = getTodayStr();
  const r = ref(db, 'bookings');
  const handler = (snap) => {
    if (!snap.exists()) { callback({}); return; }
    const all = snap.val();
    const cleaned = {};
    for (const date in all) {
      if (date >= today) cleaned[date] = all[date];
    }
    callback(cleaned);
  };
  onValue(r, handler);
  return () => off(r, 'value', handler);
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function getAvailableDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 31; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dates.push({ value: str, label: formatDateLabel(d, i) });
  }
  return dates;
}

export function formatDateLabel(dateObj, dayOffset) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = days[dateObj.getDay()];
  const date = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  if (dayOffset === 0) return `Today, ${date} ${month}`;
  if (dayOffset === 1) return `Tomorrow, ${date} ${month}`;
  return `${day}, ${date} ${month}`;
}

export function parseDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const obj = new Date(y, m - 1, d);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[obj.getDay()]}, ${d} ${months[m - 1]} ${y}`;
}
