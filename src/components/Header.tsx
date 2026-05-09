import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export default function Header({ currentPage, onNavigate, isAdmin, onLogout }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Home',      page: 'home' },
    { label: 'Servizi',   page: 'home#services' },
    { label: 'Galleria',  page: 'home#gallery' },
    { label: 'Prenota',   page: 'booking' },
  ];

  const handleLink = (page: string) => {
    setMenuOpen(false);
    if (page.includes('#')) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(page.split('#')[1]);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || currentPage !== 'home'
          ? 'bg-charcoal-950/95 backdrop-blur-md border-b border-charcoal-800 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => handleLink('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 bg-ink-500 rounded-lg flex items-center justify-center group-hover:bg-ink-600 transition-colors animate-pulse-glow">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-bold tracking-widest text-white uppercase">
              Ink <span className="text-ink-500">Society</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <span className="text-charcoal-400 text-sm mr-3">Dashboard Admin</span>
                <button onClick={onLogout} className="btn-ghost text-sm py-2 px-4">
                  Esci
                </button>
              </>
            ) : (
              <>
                {navLinks.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => handleLink(l.page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      l.page === 'booking'
                        ? 'btn-primary ml-2 py-2 text-sm'
                        : currentPage === l.page
                        ? 'text-ink-400'
                        : 'text-charcoal-300 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-charcoal-300 hover:text-white"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-charcoal-950/98 border-b border-charcoal-800 px-4 pb-4 animate-fade-in">
          {isAdmin ? (
            <button
              onClick={() => { setMenuOpen(false); onLogout?.(); }}
              className="w-full text-left py-3 text-charcoal-300 hover:text-white border-b border-charcoal-800"
            >
              Esci
            </button>
          ) : (
            navLinks.map((l) => (
              <button
                key={l.label}
                onClick={() => handleLink(l.page)}
                className={`block w-full text-left py-3 border-b border-charcoal-800 last:border-0 font-medium transition-colors ${
                  l.page === 'booking' ? 'text-ink-400' : 'text-charcoal-300 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))
          )}
        </div>
      )}
    </header>
  );
}
