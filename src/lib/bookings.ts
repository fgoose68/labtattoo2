import { supabase } from './supabase';
import { exec, esc } from './duckdb';

export interface BookingInput {
  name: string;
  surname: string;
  phone: string;
  email: string;
  description: string;
  booking_date: string;
  booking_time: string;
}

export async function createBooking(input: BookingInput): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      name: input.name.trim(),
      surname: input.surname.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      description: input.description.trim(),
      booking_date: input.booking_date,
      booking_time: input.booking_time,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  await exec(`
    INSERT OR IGNORE INTO bookings VALUES (
      '${esc(data.id)}','${esc(input.name)}','${esc(input.surname)}',
      '${esc(input.phone)}','${esc(input.email)}','${esc(input.description)}',
      '${esc(input.booking_date)}','${esc(input.booking_time)}',
      'pending','${esc(new Date().toISOString())}'
    );
  `);

  return { id: data.id as string };
}

export async function updateBookingStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'pending'
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);

  await exec(`UPDATE bookings SET status = '${status}' WHERE id = '${esc(id)}';`);
}

/** Converts stored ISO date (yyyy-mm-dd) to display format (dd-MM-yyyy). */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}-${m}-${y}`;
}

export function buildWhatsAppUrl(phone: string, name: string, date: string, time: string, status?: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const d = formatDate(date);
  const msg = status === 'confirmed'
    ? `Ciao ${name}! Il tuo appuntamento da Ink Society per il ${d} alle ${time} è stato confermato. Ti aspettiamo!`
    : `Ciao ${name}! Ti contatto da Ink Society riguardo al tuo appuntamento del ${d} alle ${time}.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function buildMailtoUrl(email: string, name: string, date: string, time: string, status?: string): string {
  const d = formatDate(date);
  const subject = status === 'confirmed'
    ? `Ink Society – Appuntamento confermato ${d}`
    : `Ink Society – Il tuo appuntamento del ${d}`;
  const body = status === 'confirmed'
    ? `Ciao ${name},\n\nil tuo appuntamento da Ink Society per il ${d} alle ${time} è stato confermato.\n\nTi aspettiamo!\n\nInk Society`
    : `Ciao ${name},\n\nti scriviamo da Ink Society riguardo al tuo appuntamento del ${d} alle ${time}.\n\nA presto,\nInk Society`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildTelUrl(phone: string): string {
  const cleanPhone = phone.replace(/\s/g, '');
  return `tel:${cleanPhone}`;
}
