import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar, User, Clock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { initSchema, syncFromSupabase, getBookedSlotsForDate, getBookingCountPerDate } from '../lib/db';
import { createBooking } from '../lib/bookings';
import Header from '../components/Header';

const TIME_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const TOTAL_SLOTS = TIME_SLOTS.length;

function padTwo(n: number) {
  return String(n).padStart(2, '0');
}

function toISODate(y: number, m: number, d: number) {
  return `${y}-${padTwo(m + 1)}-${padTwo(d)}`;
}

function isSunday(y: number, m: number, d: number) {
  return new Date(y, m, d).getDay() === 0;
}

interface FormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  description: string;
}

interface BookingProps {
  onNavigate: (page: string) => void;
}

const STEP_LABELS = ['Data & Orario', 'I Tuoi Dati', 'Conferma'];

export default function Booking({ onNavigate }: BookingProps) {
  const [step, setStep] = useState(1);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(false);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedCounts, setBookedCounts] = useState<Record<string, number>>({});
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [form, setForm] = useState<FormData>({ name: '', surname: '', phone: '', email: '', description: '' });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    initSchema()
      .then(() => syncFromSupabase(false))
      .then(() => getBookingCountPerDate())
      .then((counts) => { setBookedCounts(counts); setDbReady(true); })
      .catch(() => { setDbError(true); setDbReady(true); });
  }, []);

  useEffect(() => {
    if (!selectedDate || !dbReady) return;
    getBookedSlotsForDate(selectedDate).then(setBookedSlots);
  }, [selectedDate, dbReady]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  const isDayDisabled = (d: number) => {
    const iso = toISODate(calYear, calMonth, d);
    if (iso < todayStr) return true;
    if (isSunday(calYear, calMonth, d)) return true;
    return (bookedCounts[iso] ?? 0) >= TOTAL_SLOTS;
  };

  const isDayFullyBooked = (d: number) => {
    const iso = toISODate(calYear, calMonth, d);
    return (bookedCounts[iso] ?? 0) >= TOTAL_SLOTS;
  };

  const monthName = new Date(calYear, calMonth).toLocaleString('it-IT', { month: 'long' });

  const validateForm = useCallback((): boolean => {
    const errs: Partial<FormData> = {};
    if (form.name.trim().length < 2) errs.name = 'Minimo 2 caratteri';
    if (form.surname.trim().length < 2) errs.surname = 'Minimo 2 caratteri';
    if (!/^\+?[\d\s\-().]{7,20}$/.test(form.phone.trim())) errs.phone = 'Inserisci un numero di telefono valido';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Inserisci un indirizzo email valido';
    if (form.description.trim().length < 10) errs.description = 'Descrivi la tua idea di tatuaggio (min. 10 caratteri)';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { id } = await createBooking({
        name: form.name.trim(),
        surname: form.surname.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        booking_date: selectedDate,
        booking_time: selectedTime,
      });
      setBookingId(id);
      setStep(4);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Prenotazione fallita. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // Capitalize first letter for Italian date
  const formattedDateCap = formattedDate
    ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
    : '';

  return (
    <div className="min-h-screen bg-charcoal-950 font-body">
      <Header currentPage="booking" onNavigate={onNavigate} />

      <div className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Titolo */}
          <div className="text-center mb-10 pt-8">
            <p className="text-ink-500 font-display text-xs tracking-[0.3em] uppercase mb-3">Il Conte</p>
            <h1 className="font-display text-4xl font-bold text-white mb-2">Prenota la Tua Sessione</h1>
            <p className="text-charcoal-400 text-sm">Scegli data, orario e raccontaci la tua visione.</p>
          </div>

          {/* Barra progresso */}
          {step < 4 && (
            <div className="flex items-center gap-0 mb-10">
              {STEP_LABELS.map((label, i) => {
                const num = i + 1;
                const active = step === num;
                const done = step > num;
                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        done  ? 'bg-ink-500 text-white' :
                        active ? 'bg-ink-500/20 border-2 border-ink-500 text-ink-400' :
                                 'bg-charcoal-800 text-charcoal-500'
                      }`}>
                        {done ? <Check size={16} /> : num}
                      </div>
                      <span className={`text-xs whitespace-nowrap ${active ? 'text-ink-400' : 'text-charcoal-500'}`}>{label}</span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`flex-1 h-px mx-2 mb-4 transition-colors duration-500 ${done ? 'bg-ink-500' : 'bg-charcoal-800'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Banner errore DB */}
          {dbError && step === 1 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-5 text-amber-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              Verifica disponibilità non disponibile — puoi comunque prenotare, ma potrebbero verificarsi conflitti.
            </div>
          )}

          {/* STEP 1: Data & Orario */}
          {step === 1 && (
            <div className="card p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-ink-500" /> Seleziona Data & Orario
              </h2>

              {/* Calendario */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-charcoal-800 text-charcoal-300 hover:text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-display font-semibold text-white tracking-wide capitalize">{monthName} {calYear}</span>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-charcoal-800 text-charcoal-300 hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Intestazioni giorni */}
                <div className="grid grid-cols-7 mb-2">
                  {['Do','Lu','Ma','Me','Gi','Ve','Sa'].map((d) => (
                    <div key={d} className="text-center text-xs text-charcoal-500 py-1 font-medium">{d}</div>
                  ))}
                </div>

                {/* Griglia calendario */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const iso = toISODate(calYear, calMonth, d);
                    const disabled = isDayDisabled(d);
                    const fullyBooked = isDayFullyBooked(d);
                    const isToday = iso === todayStr;
                    const selected = iso === selectedDate;
                    const isSun = isSunday(calYear, calMonth, d);

                    return (
                      <button
                        key={d}
                        disabled={disabled}
                        onClick={() => { setSelectedDate(iso); setSelectedTime(''); }}
                        className={`
                          aspect-square rounded-lg text-sm font-medium border transition-all duration-150
                          ${selected ? 'cal-day-selected' : ''}
                          ${isToday && !selected ? 'cal-day-today border-gold-500/50 text-gold-400' : ''}
                          ${!disabled && !selected ? 'cal-day-available border-transparent text-charcoal-300 hover:text-white cursor-pointer' : ''}
                          ${disabled && !isSun ? 'border-transparent text-charcoal-700 cursor-not-allowed' : ''}
                          ${isSun ? 'border-transparent text-charcoal-800 cursor-not-allowed' : ''}
                          ${fullyBooked && !disabled ? 'opacity-40' : ''}
                        `}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fasce orarie */}
              {selectedDate && (
                <div className="mt-2 animate-fade-in">
                  <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                    <Clock size={15} className="text-ink-500" />
                    Orari Disponibili — {formattedDateCap}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((t) => {
                      const booked = bookedSlots.includes(t);
                      const sel = t === selectedTime;
                      return (
                        <button
                          key={t}
                          disabled={booked}
                          onClick={() => setSelectedTime(t)}
                          className={`
                            py-2.5 rounded-lg border text-sm font-medium transition-all duration-150
                            ${sel ? 'slot-selected' : ''}
                            ${booked ? 'border-charcoal-800 text-charcoal-700 cursor-not-allowed bg-charcoal-900' : ''}
                            ${!booked && !sel ? 'slot-available border-charcoal-700 text-charcoal-300 bg-charcoal-900 cursor-pointer' : ''}
                          `}
                        >
                          {booked ? <span className="line-through opacity-40">{t}</span> : t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(2)}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Continua <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Dati personali */}
          {step === 2 && (
            <div className="card p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-ink-500" /> I Tuoi Dati
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-charcoal-300 mb-1.5 font-medium">Nome *</label>
                    <input
                      className="input-field"
                      placeholder="Mario"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    {formErrors.name && <p className="text-ink-400 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-charcoal-300 mb-1.5 font-medium">Cognome *</label>
                    <input
                      className="input-field"
                      placeholder="Rossi"
                      value={form.surname}
                      onChange={(e) => setForm((f) => ({ ...f, surname: e.target.value }))}
                    />
                    {formErrors.surname && <p className="text-ink-400 text-xs mt-1">{formErrors.surname}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-charcoal-300 mb-1.5 font-medium">Numero di Telefono *</label>
                  <input
                    className="input-field"
                    placeholder="+39 333 1234567"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  {formErrors.phone && <p className="text-ink-400 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm text-charcoal-300 mb-1.5 font-medium">Email <span className="text-charcoal-600 font-normal">(facoltativa)</span></label>
                  <input
                    className="input-field"
                    placeholder="mario.rossi@email.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  {formErrors.email && <p className="text-ink-400 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm text-charcoal-300 mb-1.5 font-medium">Descrizione del Tatuaggio *</label>
                  <textarea
                    className="input-field min-h-[110px] resize-y"
                    placeholder="Descrivi la tua idea — stile, dimensioni, posizione, riferimenti visivi che hai in mente..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  {formErrors.description && <p className="text-ink-400 text-xs mt-1">{formErrors.description}</p>}
                  <p className="text-charcoal-600 text-xs mt-1">{form.description.length} caratteri</p>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost gap-1.5">
                  <ArrowLeft size={15} /> Indietro
                </button>
                <button onClick={() => { if (validateForm()) setStep(3); }} className="btn-primary">
                  Rivedi Prenotazione <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Conferma */}
          {step === 3 && (
            <div className="card p-6 md:p-8 animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Check size={20} className="text-ink-500" /> Controlla la Tua Prenotazione
              </h2>

              <div className="space-y-4 mb-8">
                {[
                  { label: 'Data',        value: formattedDateCap },
                  { label: 'Orario',      value: selectedTime },
                  { label: 'Nome',        value: form.name },
                  { label: 'Cognome',     value: form.surname },
                  { label: 'Telefono',    value: form.phone },
                  ...(form.email ? [{ label: 'Email', value: form.email }] : []),
                  { label: 'Descrizione', value: form.description },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3 border-b border-charcoal-800 last:border-0">
                    <span className="text-charcoal-500 text-sm w-28 shrink-0">{label}</span>
                    <span className="text-white text-sm">{value}</span>
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="flex items-center gap-2 bg-ink-950 border border-ink-500/30 rounded-lg p-3 mb-5 text-ink-300 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(2)} className="btn-ghost gap-1.5">
                  <ArrowLeft size={15} /> Indietro
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Prenotazione...</>
                    : <>Conferma Prenotazione <Check size={16} /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Successo */}
          {step === 4 && (
            <div className="card p-8 md:p-12 text-center animate-fade-in">
              <div className="w-16 h-16 bg-ink-500/15 border border-ink-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Check size={28} className="text-ink-500" />
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-3">Prenotazione Confermata!</h2>
              <p className="text-charcoal-400 mb-2">
                Il tuo appuntamento è confermato per
              </p>
              <p className="text-ink-400 font-semibold text-lg mb-1">{formattedDateCap}</p>
              <p className="text-ink-400 font-semibold text-lg mb-6">alle {selectedTime}</p>
              <p className="text-charcoal-500 text-sm mb-8">
                Riferimento: <span className="font-mono text-charcoal-300">{bookingId.slice(0, 8).toUpperCase()}</span>
              </p>
              <p className="text-charcoal-400 text-sm mb-8">
                Ti contatteremo per confermare i dettagli. Per qualsiasi domanda, non esitare a contattarci.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => onNavigate('home')} className="btn-ghost">
                  Torna alla Home
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedDate('');
                    setSelectedTime('');
                    setForm({ name: '', surname: '', phone: '', email: '', description: '' });
                    setBookingId('');
                  }}
                  className="btn-primary"
                >
                  Nuova Prenotazione
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
