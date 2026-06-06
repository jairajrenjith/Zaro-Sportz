// src/App.jsx
import { useEffect, useState } from 'react';
import './styles/global.css';
import { ThemeProvider } from './ThemeContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sports from './components/Sports';
import Booking from './components/Booking';
import Gallery from './components/Gallery';
import Location from './components/Location';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

function useAdminRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  return path;
}

function MainApp() {
  const path = useAdminRoute();
  const [adminAuthed, setAdminAuthed] = useState(
    () => sessionStorage.getItem('zaro_admin') === '1'
  );

  const handleLogin = () => {
    sessionStorage.setItem('zaro_admin', '1');
    setAdminAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('zaro_admin');
    setAdminAuthed(false);
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    if (path === '/admin') return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    const els = document.querySelectorAll('.reveal');
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [path]);

  if (path === '/admin') {
    if (!adminAuthed) return <AdminLogin onLogin={handleLogin} />;
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Sports />
        <Booking />
        <Gallery />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
