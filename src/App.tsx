import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Booking from './pages/Booking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

type Page = 'home' | 'booking' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAdminUser(data.session?.user ?? null);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate = (target: string) => {
    setPage(target as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setPage('admin-dashboard');
    window.scrollTo({ top: 0 });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
    setPage('home');
  };

  // Guard admin dashboard — redirect to login if not authenticated
  useEffect(() => {
    if (authChecked && page === 'admin-dashboard' && !adminUser) {
      setPage('admin-login');
    }
  }, [page, adminUser, authChecked]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {page === 'home' && <Home onNavigate={navigate} />}
      {page === 'booking' && <Booking onNavigate={navigate} />}
      {page === 'admin-login' && (
        <AdminLogin onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />
      )}
      {page === 'admin-dashboard' && adminUser && (
        <AdminDashboard onNavigate={navigate} onLogout={handleLogout} />
      )}
    </>
  );
}
