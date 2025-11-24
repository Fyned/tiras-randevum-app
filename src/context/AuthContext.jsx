import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Oturum kontrolü
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Auth durum değişikliğini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Profil verisini çeken yardımcı fonksiyon
  const fetchProfile = async (currentUser) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.warn('Profil bulunamadı, SQL tetikleyicilerini kontrol edin.', error);
      } else {
        setProfile(userProfile);
        setIsAdmin(userProfile?.role === 'admin');
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Profil yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  // EKSİK OLAN LOGIN FONKSİYONU
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Giriş başarılıysa profili manuel çekip döndürelim (Login sayfası için)
    if (data.user) {
        const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
        return { user: data.user, profile: userProfile };
    }
    return data;
  };

  // EKSİK OLAN SIGNUP (KAYIT) FONKSİYONU
  const signup = async (email, password, metaData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData, // Ad soyad vb. buraya gider
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  // Value objesine login ve signup eklendi
  const value = {
    user,
    profile,
    isAdmin,
    loading,
    login, 
    signup,
    signOut,
    refreshProfile: () => user && fetchProfile(user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};