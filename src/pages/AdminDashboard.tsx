import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Search, RefreshCw, MessageCircle, Mail, Phone, Check, X, ChevronDown, Loader2 } from 'lucide-react';
import { initSchema, syncFromSupabase, getAllBookings, getStats, type Booking, type BookingStats } from '../lib/db';
import { updateBookingStatus, buildWhatsAppUrl, buildMailtoUrl, buildTelUrl, formatDate } from '../lib/bookings';
import Header from '../components/Header';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  pending:   'In Attesa',
  confirmed: 'Confermato',
  cancelled: 'Annullato',
};

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  cancelled: 'bg-charcoal-800 text-charcoal-500 border-charcoal-700',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[status] ?? STATUS_BADGE.pending}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`card p-5 border-l-2 ${color}`}>
      <p className="text-charcoal-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-3xl font-bold font-display">{value}</p>
    </div>
  );
}

export default function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({ total: 0, pending: 0, confirmed: 0, cancelled: 0, today: 0 });

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await getAllBookings({ status: filterStatus, date: filterDate, search });
    setBookings(rows);
    const s = await getStats();
    setStats(s);
  }, [filterStatus, filterDate, search]);

  const init = useCallback(async () => {
    setLoading(true);
    try {
      await initSchema();
      await syncFromSupabase(true);
      await load();
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!loading) load();
  }, [filterStatus, filterDate, search, load, loading]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncFromSupabase(true);
      await load();
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (booking: Booking, status: 'confirmed' | 'cancelled' | 'pending') => {
    setUpdatingId(booking.id);
    try {
      await updateBookingStatus(booking.id, status);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 font-body">
      <Header currentPage="admin-dashboard" onNavigate={onNavigate} isAdmin onLogout={onLogout} />

      <div className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Intestazione pagina */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8 mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Appuntamenti</h1>
              <p className="text-charcoal-400 text-sm mt-1">Gestisci tutte le prenotazioni dello studio</p>
            </div>
            <button onClick={handleSync} disabled={syncing} className="btn-ghost self-start gap-2 text-sm">
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizzazione...' : 'Sincronizza dal DB'}
            </button>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Totale"     value={stats.total}     color="border-charcoal-600" />
            <StatCard label="Oggi"       value={stats.today}     color="border-gold-500" />
            <StatCard label="In Attesa"  value={stats.pending}   color="border-amber-500" />
            <StatCard label="Confermati" value={stats.confirmed} color="border-emerald-500" />
            <StatCard label="Annullati"  value={stats.cancelled} color="border-ink-500" />
          </div>

          {/* Filtri */}
          <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500" />
              <input
                className="input-field pl-9 py-2.5 text-sm"
                placeholder="Cerca per nome o telefono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field py-2.5 text-sm pr-8 appearance-none cursor-pointer"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In Attesa</option>
                <option value="confirmed">Confermato</option>
                <option value="cancelled">Annullato</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 pointer-events-none" />
            </div>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field py-2.5 text-sm cursor-pointer"
            />

            {(search || filterStatus !== 'all' || filterDate) && (
              <button
                onClick={() => { setSearch(''); setFilterStatus('all'); setFilterDate(''); }}
                className="btn-ghost text-sm py-2.5 whitespace-nowrap"
              >
                Azzera
              </button>
            )}
          </div>

          {/* Tabella */}
          {loading ? (
            <div className="flex items-center justify-center h-48 gap-3 text-charcoal-400">
              <Loader2 size={20} className="animate-spin text-ink-500" />
              Caricamento appuntamenti...
            </div>
          ) : bookings.length === 0 ? (
            <div className="card p-12 text-center text-charcoal-500">
              <Calendar size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-charcoal-400">Nessun appuntamento trovato</p>
              <p className="text-sm mt-1">Prova a modificare i filtri</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Tabella desktop */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-charcoal-800">
                      <th className="text-left px-5 py-3.5 text-xs text-charcoal-500 font-semibold uppercase tracking-wider">Data</th>
                      <th className="text-left px-4 py-3.5 text-xs text-charcoal-500 font-semibold uppercase tracking-wider">Orario</th>
                      <th className="text-left px-4 py-3.5 text-xs text-charcoal-500 font-semibold uppercase tracking-wider">Cliente</th>
                      <th className="text-left px-4 py-3.5 text-xs text-charcoal-500 font-semibold uppercase tracking-wider">Telefono</th>
                      <th className="text-left px-4 py-3.5 text-xs text-charcoal-500 font-semibold uppercase tracking-wider">Descrizione</th>
                      <th className="text-left px-4 py-3.5 text-xs text-charcoal-500 font-semibold uppercase tracking-wider">Stato</th>
                      <th className="text-right px-5 py-3.5 text-xs text-charcoal-500 font-semibold uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-charcoal-800/50 hover:bg-charcoal-900/40 transition-colors">
                        <td className="px-5 py-4 text-charcoal-200 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-ink-500" />
                            {formatDate(b.booking_date)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-charcoal-200 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-ink-500" />
                            {b.booking_time}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-charcoal-500" />
                            <span className="text-white font-medium">{b.name} {b.surname}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-charcoal-300 whitespace-nowrap font-mono text-xs">{b.phone}</td>
                        <td className="px-4 py-4 text-charcoal-400 max-w-xs">
                          <span className="truncate block max-w-[180px]" title={b.description}>{b.description || '—'}</span>
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={b.status} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {updatingId === b.id ? (
                              <Loader2 size={16} className="animate-spin text-charcoal-400" />
                            ) : (
                              <>
                                {b.status !== 'confirmed' && (
                                  <button
                                    onClick={() => handleStatusChange(b, 'confirmed')}
                                    title="Conferma"
                                    className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-charcoal-500 hover:text-emerald-400 transition-colors"
                                  >
                                    <Check size={15} />
                                  </button>
                                )}
                                {b.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleStatusChange(b, 'cancelled')}
                                    title="Annulla"
                                    className="p-1.5 rounded-lg hover:bg-ink-500/15 text-charcoal-500 hover:text-ink-400 transition-colors"
                                  >
                                    <X size={15} />
                                  </button>
                                )}
                                <a
                                  href={buildWhatsAppUrl(b.phone, b.name, b.booking_date, b.booking_time, b.status)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp"
                                  className="p-1.5 rounded-lg hover:bg-[#25D366]/15 text-charcoal-500 hover:text-[#25D366] transition-colors"
                                >
                                  <MessageCircle size={15} />
                                </a>
                                {b.email && (
                                  <a
                                    href={buildMailtoUrl(b.email, b.name, b.booking_date, b.booking_time, b.status)}
                                    title={`Email: ${b.email}`}
                                    className="p-1.5 rounded-lg hover:bg-sky-500/15 text-charcoal-500 hover:text-sky-400 transition-colors"
                                  >
                                    <Mail size={15} />
                                  </a>
                                )}
                                <a
                                  href={buildTelUrl(b.phone)}
                                  title={`Chiama: ${b.phone}`}
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-charcoal-500 hover:text-emerald-400 transition-colors"
                                >
                                  <Phone size={15} />
                                </a>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card mobile */}
              <div className="md:hidden divide-y divide-charcoal-800">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold">{b.name} {b.surname}</p>
                        <p className="text-charcoal-400 text-xs font-mono mt-0.5">{b.phone}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="flex gap-4 text-sm text-charcoal-300">
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-ink-500" />{formatDate(b.booking_date)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13} className="text-ink-500" />{b.booking_time}</span>
                    </div>
                    {b.description && <p className="text-charcoal-500 text-xs leading-relaxed">{b.description}</p>}
                    <div className="flex gap-2 pt-1">
                      {b.status !== 'confirmed' && (
                        <button onClick={() => handleStatusChange(b, 'confirmed')} className="btn-ghost text-xs py-1.5 px-3 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10">
                          <Check size={13} /> Conferma
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button onClick={() => handleStatusChange(b, 'cancelled')} className="btn-ghost text-xs py-1.5 px-3 hover:border-ink-500">
                          <X size={13} /> Annulla
                        </button>
                      )}
                      <a
                        href={buildWhatsAppUrl(b.phone, b.name, b.booking_date, b.booking_time, b.status)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs py-1.5 px-3 text-[#25D366] border-[#25D366]/25 hover:bg-[#25D366]/10"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                      {b.email && (
                        <a
                          href={buildMailtoUrl(b.email, b.name, b.booking_date, b.booking_time, b.status)}
                          className="btn-ghost text-xs py-1.5 px-3 text-sky-400 border-sky-500/25 hover:bg-sky-500/10"
                        >
                          <Mail size={13} /> Email
                        </a>
                      )}
                      <a
                        href={buildTelUrl(b.phone)}
                        className="btn-ghost text-xs py-1.5 px-3 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10"
                      >
                        <Phone size={13} /> Chiama
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-charcoal-800 text-xs text-charcoal-500">
                {bookings.length} appuntament{bookings.length === 1 ? 'o' : 'i'} visualizzat{bookings.length === 1 ? 'o' : 'i'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
