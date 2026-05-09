import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Star, Pen, Droplets, Box, Flame, ArrowRight, Calendar } from 'lucide-react';
import Footer from '../components/Footer';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const SERVICES = [
  { icon: Pen,      title: 'Design Personalizzato', desc: "Opere d'arte uniche create dalle tue idee e visioni, su misura esclusivamente per te." },
  { icon: Box,      title: 'Blackwork',              desc: 'Pezzi grafici in inchiostro nero con linee precise e ombreggiature profonde.' },
  { icon: Star,     title: 'Tradizionale',           desc: 'Motivi classici americani e giapponesi con contorni senza tempo e riempimenti vibranti.' },
  { icon: Droplets, title: 'Acquerello',             desc: 'Tecniche pittoriche morbide che portano colori vivaci e movimento sulla tua pelle.' },
  { icon: Flame,    title: 'Neo-Tradizionale',       desc: 'Una svolta contemporanea sugli stili classici — palette più ricche e dettagli illustrativi.' },
  { icon: Star,     title: 'Fine Line',              desc: 'Linework delicato e preciso per composizioni minimaliste e ad alto dettaglio.' },
];

const GALLERY_PHOTOS = [
  '/1sss.jpeg',
  '/3333.jpeg',
  '/5555.jpeg',
  '/9999.jpeg',
  '/666666.jpeg',
];

function useIntersection(ref: React.RefObject<Element | null>, options?: IntersectionObserverInit) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, options);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, options]);
  return visible;
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref, { threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-charcoal-950 font-body">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.pexels.com/photos/2183130/pexels-photo-2183130.jpeg?auto=compress&cs=tinysrgb&w=1920')` }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/30 via-transparent to-charcoal-950" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="opacity-0 animate-fade-in text-gold-400 font-display text-sm tracking-[0.3em] uppercase mb-6">
            Benvenuto da
          </p>
          <h1 className="opacity-0 animate-slide-up font-display text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-white leading-none mb-4">
            INK
            <span className="block text-gradient">SOCIETY</span>
          </h1>
          <p className="opacity-0 animate-slide-up-delayed text-charcoal-300 text-lg md:text-xl mt-4 mb-10 font-light">
            Dove l'Arte Incontra la Pelle — Tatuaggi Personalizzati Realizzati con Passione
          </p>
          <div className="opacity-0 animate-slide-up-delayed-2 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('booking')}
              className="btn-primary text-base px-8 py-4 animate-pulse-glow"
            >
              <Calendar size={18} />
              Prenota la Tua Sessione
            </button>
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost text-base px-8 py-4"
            >
              Scopri i Nostri Lavori
            </button>
          </div>
        </div>

        <button
          onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-charcoal-400 animate-float hover:text-white transition-colors"
        >
          <ChevronDown size={28} />
        </button>
      </section>

      {/* ORNAMENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="divider-ornament">
          <span className="text-gold-500 font-display text-lg">✦</span>
        </div>
      </div>

      {/* SERVIZI */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <RevealSection>
          <div className="text-center mb-14">
            <p className="text-ink-500 font-display text-xs tracking-[0.3em] uppercase mb-3">Cosa Facciamo</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Le Nostre Specialità</h2>
            <p className="text-charcoal-400 max-w-xl mx-auto">
              Dai pezzi tradizionali audaci al delicato lavoro fine-line, ogni tatuaggio è una collaborazione tra artista e cliente.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <RevealSection key={s.title}>
                <div
                  className="card p-6 group hover:border-ink-500/40 hover:bg-charcoal-900/80 transition-all duration-300 cursor-default"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="w-11 h-11 rounded-lg bg-ink-500/10 border border-ink-500/20 flex items-center justify-center mb-4 group-hover:bg-ink-500/20 transition-colors">
                    <Icon size={20} className="text-ink-400" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-charcoal-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </RevealSection>
            );
          })}
        </div>
      </section>

      {/* GALLERIA */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <RevealSection>
          <div className="text-center mb-14">
            <p className="text-ink-500 font-display text-xs tracking-[0.3em] uppercase mb-3">Portfolio</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">I Nostri Lavori</h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_PHOTOS.map((src, i) => (
            <RevealSection key={src}>
              <div
                className={`overflow-hidden rounded-xl group cursor-pointer ${i === 0 ? 'row-span-2' : ''}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <img
                  src={src}
                  alt={`Galleria ${i + 1}`}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${i === 0 ? 'h-full min-h-[320px]' : 'h-48 md:h-56'}`}
                  loading="lazy"
                />
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* CTA PRENOTAZIONE */}
      <section className="py-20 px-4">
        <RevealSection>
          <div className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-950 via-charcoal-900 to-charcoal-950 border border-ink-500/20 p-10 md:p-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-ink-500/20 rounded-full blur-3xl" />
            <p className="relative text-ink-400 font-display text-xs tracking-[0.3em] uppercase mb-4">Pronto?</p>
            <h2 className="relative font-display text-4xl md:text-5xl font-bold text-white mb-5">
              Scegli la Tua Tela
            </h2>
            <p className="relative text-charcoal-400 max-w-xl mx-auto mb-8">
              Il tuo prossimo capolavoro è a un solo appuntamento di distanza. Scegli la data, descrivi la tua visione, e creiamo insieme qualcosa di indimenticabile.
            </p>
            <button
              onClick={() => { onNavigate('booking'); window.scrollTo({ top: 0 }); }}
              className="relative btn-primary text-base px-10 py-4 gap-2"
            >
              Prenota Ora <ArrowRight size={18} />
            </button>
          </div>
        </RevealSection>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
