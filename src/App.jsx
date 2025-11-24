import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';

// Component Imports
import Header from '@/components/Header.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import BarberDashboard from '@/pages/BarberDashboard.jsx';
import BarberProfile from '@/pages/BarberProfile.jsx';
import BarberPublicProfile from '@/pages/BarberPublicProfile.jsx';
import CustomerDashboard from '@/pages/CustomerDashboard.jsx';
import FindBarberByCode from '@/pages/FindBarberByCode.jsx';
import BarberAppointmentSystem from '@/pages/BarberAppointmentSystem.jsx';
import BarberPortfolio from '@/pages/BarberPortfolio.jsx';
import BarberFollowers from '@/pages/BarberFollowers.jsx';
import BarberInstagramProfile from '@/pages/BarberInstagramProfile.jsx';
import { Toaster } from '@/components/ui/toaster';

// Context Imports
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

function App() {
  
  // SUPABASE BAĞLANTI TESTİ
  useEffect(() => {
    const testConnection = async () => {
      console.log("🟠 Supabase bağlantısı test ediliyor...");
      try {
        const { data, error } = await supabase.from('barbers').select('*').limit(1);

        if (error) {
          console.error("🔴 Bağlantı Hatası Detayı:", error.message);
          console.error("🔴 İpucu: Supabase panelinden RLS Policy ayarlarını yapmanız gerekiyor.");
        } else {
          console.log("🟢 Bağlantı Başarılı! Supabase'den gelen veri:", data);
        }
      } catch (err) {
        console.error("🔴 Beklenmeyen hata:", err);
      }
    };

    testConnection();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {/* 'future' prop'u eklenerek React Router uyarıları çözüldü */}
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Helmet>
            <title>Tıraş Randevum - Berberler için Akıllı Randevu Yönetimi</title>
            <meta name="description" content="Tıraş Randevum ile berber randevularınızı kolayca yönetin." />
          </Helmet>
          
          <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/giris" element={<LoginPage />} />
                <Route path="/kayit" element={<RegisterPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* Barber Routes */}
                <Route path="/berber" element={<BarberDashboard />} />
                <Route path="/berber/profil" element={<BarberProfile />} />
                <Route path="/berber/appointments" element={<BarberAppointmentSystem />} />
                <Route path="/berber/portfolio" element={<BarberPortfolio />} />
                <Route path="/berber/followers" element={<BarberFollowers />} />
                <Route path="/berber/instagram-profile" element={<BarberInstagramProfile />} />
                <Route path="/barber/:publicCode" element={<BarberPublicProfile />} />
                
                {/* Customer Routes */}
                <Route path="/musteri" element={<CustomerDashboard />} />
                <Route path="/find-barber-by-code" element={<FindBarberByCode />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;