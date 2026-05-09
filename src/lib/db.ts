import { exec, query, esc } from './duckdb';
import { supabase } from './supabase';

export interface Booking {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  description: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  today: number;
}

export async function initSchema(): Promise<void> {
  await exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR PRIMARY KEY,
      name VARCHAR,
      surname VARCHAR,
      phone VARCHAR,
      email VARCHAR DEFAULT '',
      description VARCHAR,
      booking_date VARCHAR,
      booking_time VARCHAR,
      status VARCHAR DEFAULT 'pending',
      created_at VARCHAR
    );
  `);
}

export async function syncFromSupabase(authenticated = false): Promise<void> {
  let req = supabase.from('bookings').select('*');

  if (!authenticated) {
    const today = new Date().toISOString().split('T')[0];
    req = req.gte('booking_date', today);
  }

  const { data, error } = await req.order('booking_date', { ascending: true });
  if (error) {
    console.warn('Supabase sync error:', error.message);
    return;
  }

  await exec('DELETE FROM bookings;');

  if (data && data.length > 0) {
    const rows = (data as Booking[])
      .map(
        (b) =>
          `('${esc(b.id)}','${esc(b.name)}','${esc(b.surname)}','${esc(b.phone)}','${esc(b.email ?? '')}','${esc(b.description)}','${esc(b.booking_date)}','${esc(b.booking_time)}','${esc(b.status)}','${esc(b.created_at)}')`
      )
      .join(',');
    await exec(`INSERT OR IGNORE INTO bookings VALUES ${rows};`);
  }
}

export async function getBookedSlotsForDate(date: string): Promise<string[]> {
  const rows = await query<{ booking_time: string }>(
    `SELECT booking_time FROM bookings WHERE booking_date = '${esc(date)}' AND status != 'cancelled';`
  );
  return rows.map((r) => r.booking_time);
}

export async function getBookingCountPerDate(): Promise<Record<string, number>> {
  const rows = await query<{ booking_date: string; cnt: unknown }>(
    `SELECT booking_date, COUNT(*) AS cnt FROM bookings WHERE status != 'cancelled' GROUP BY booking_date;`
  );
  return Object.fromEntries(rows.map((r) => [r.booking_date, Number(r.cnt)]));
}

export async function getAllBookings(filter?: { status?: string; date?: string; search?: string }): Promise<Booking[]> {
  let sql = `SELECT * FROM bookings WHERE 1=1`;
  if (filter?.status && filter.status !== 'all') sql += ` AND status = '${esc(filter.status)}'`;
  if (filter?.date) sql += ` AND booking_date = '${esc(filter.date)}'`;
  if (filter?.search) {
    const s = esc(filter.search.toLowerCase());
    sql += ` AND (lower(name) LIKE '%${s}%' OR lower(surname) LIKE '%${s}%' OR lower(phone) LIKE '%${s}%')`;
  }
  sql += ` ORDER BY booking_date ASC, booking_time ASC;`;
  return query<Booking>(sql);
}

export async function getStats(): Promise<BookingStats> {
  const today = new Date().toISOString().split('T')[0];
  const rows = await query<Record<string, unknown>>(`
    SELECT
      COUNT(*)                                                     AS total,
      SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END)       AS pending,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)       AS confirmed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)       AS cancelled,
      SUM(CASE WHEN booking_date = '${today}'  THEN 1 ELSE 0 END) AS today
    FROM bookings;
  `);
  const r = rows[0] ?? {};
  return {
    total:     Number(r.total     ?? 0),
    pending:   Number(r.pending   ?? 0),
    confirmed: Number(r.confirmed ?? 0),
    cancelled: Number(r.cancelled ?? 0),
    today:     Number(r.today     ?? 0),
  };
}
