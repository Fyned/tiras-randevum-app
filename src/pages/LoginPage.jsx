import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label.jsx';
import { useAuth } from '@/context/AuthContext';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getRedirectPath = () => {
    if (!profile) return null;
    switch (profile.role) {
      case 'admin': return '/admin';
      case 'barber': return '/berber';
      case 'customer': return '/musteri';
      default: return null;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { user: loggedInUser, profile: userProfile } = await login(data.email, data.password);
      if (loggedInUser && userProfile) {
        toast({
          title: "Giriş Başarılı",
          description: `Hoş geldiniz, ${userProfile.full_name || loggedInUser.email}! Panele yönlendiriliyorsunuz.`,
        });
        
        let path = '/';
        if (userProfile.role === 'admin') {
          path = '/admin';
        } else if (userProfile.role === 'barber') {
          path = '/berber';
        } else if (userProfile.role === 'customer') {
          path = '/musteri';
        }
        navigate(path, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Giriş Başarısız",
        description: error.message || "E-posta veya şifre hatalı.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[color:var(--tr-bg)]">
        <div className="text-xl text-[color:var(--tr-text-muted)]">Yükleniyor...</div>
      </div>
    );
  }

  if (user && profile) {
    const target = getRedirectPath();
    if (target) {
      return <Navigate to={target} replace />;
    }
  }

  return (
    <>
      <Helmet>
        <title>Giriş Yap - Tıraş Randevum</title>
        <meta name="description" content="Tıraş Randevum hesabınıza giriş yapın ve randevularınızı yönetmeye başlayın." />
      </Helmet>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[color:var(--tr-bg)]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="panel-surface rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[color:var(--tr-text)]">Giriş Yap</h1>
              <p className="text-[color:var(--tr-text-muted)] mt-2">Hesabınıza erişim sağlayın.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[color:var(--tr-text-muted)]">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  {...register("email", { required: "E-posta adresi zorunludur." })}
                  className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)] ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[color:var(--tr-text-muted)]">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Şifre zorunludur." })}
                  className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)] ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
              
              <Button type="submit" className="w-full bg-[color:var(--tr-accent)] hover:brightness-110 text-white flex items-center gap-2" disabled={loading}>
                <LogIn className="w-4 h-4"/>
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[color:var(--tr-text-muted)]">
                Hesabın yok mu?{' '}
                <Link to="/kayit" className="font-medium text-[color:var(--tr-accent)] hover:underline">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;