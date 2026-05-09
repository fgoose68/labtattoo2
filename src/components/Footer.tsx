import { Instagram, Facebook, Phone, MapPin, Clock, Zap } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-charcoal-950 border-t border-charcoal-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-ink-500 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" fill="currentColor" />
              </div>
              <span className="font-display text-xl font-bold tracking-widest text-white uppercase">
                Ink <span className="text-ink-500">Society</span>
              </span>
            </div>
            <p className="text-charcoal-400 text-sm leading-relaxed">
              Dove l'arte incontra la pelle. Specializzati in tatuaggi personalizzati che raccontano la tua storia unica.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg border border-charcoal-700 flex items-center justify-center text-charcoal-400 hover:border-ink-500 hover:text-ink-400 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg border border-charcoal-700 flex items-center justify-center text-charcoal-400 hover:border-ink-500 hover:text-ink-400 transition-colors">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white mb-4">Info Studio</h4>
            <ul className="space-y-3 text-sm text-charcoal-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-ink-500 mt-0.5 shrink-0" />
                Via dell'Arte 42, Roma, IT
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="text-ink-500 mt-0.5 shrink-0" />
                +39 06 1234 5678
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="text-ink-500 mt-0.5 shrink-0" />
                <span>Lun–Sab: 10:00 – 19:00<br />Domenica: Chiuso</span>
              </li>
            </ul>
          </div>

          {/* Link rapidi */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white mb-4">Link Rapidi</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Prenota un Appuntamento', page: 'booking' },
                { label: 'Accesso Admin',            page: 'admin-login' },
              ].map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => onNavigate(l.page)}
                    className="text-charcoal-400 hover:text-ink-400 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <span>© {new Date().getFullYear()} Ink Society. Tutti i diritti riservati.</span>
          <div className="flex flex-col items-end gap-0.5">
            <span>Sviluppato con DuckDB + Supabase</span>
            <span className="text-charcoal-600">Ver9.1.Mag2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
