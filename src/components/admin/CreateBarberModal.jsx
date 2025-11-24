import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { generateUniqueBarberCode } from '@/utils/codeGenerator.js';
import { useToast } from "@/components/ui/use-toast";

const CreateBarberModal = ({ isOpen, onClose, onBarberCreated }) => {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const { toast } = useToast();

  const resetForm = useCallback(() => {
    setForm({ fullName: '', email: '', phone: '', password: '' });
    setError(null);
    setLoading(false);
    setSuccessData(null);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı!",
      description: `${type} panoya kopyalandı.`,
    });
  };
  
  const createBarber = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    if (!form.fullName || !form.email || !form.phone || !form.password) {
        setError("Tüm alanlar zorunludur.");
        setLoading(false);
        return;
    }

    if (form.password.length < 8) {
        setError("Şifre en az 8 karakter olmalıdır.");
        setLoading(false);
        return;
    }

    try {
        const uniqueCode = await generateUniqueBarberCode();

        const barberData = {
            email: form.email.trim(),
            password: form.password,
            full_name: form.fullName.trim(),
            phone: form.phone.trim(),
            public_code: uniqueCode,
        };

        const { data: result, error: functionError } = await supabase.functions.invoke('admin-create-user-and-barber', {
            body: JSON.stringify(barberData),
        });

        if (functionError) {
             const errorMessage = functionError.context?.msg || 'Bilinmeyen bir hata oluştu.';
             if (errorMessage.includes('Auth user creation failed')) {
                throw new Error('Bu e-posta adresi zaten kullanılıyor olabilir.');
             }
             throw new Error(errorMessage);
        }

        setSuccessData({
            public_code: result.public_code,
        });

        onBarberCreated();

    } catch (err) {
        console.error("Barber creation error:", err);
        setError(err.message || 'Berber oluşturulurken bir hata oluştu.');
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="relative w-full max-w-lg rounded-xl border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleClose} className="absolute top-3 right-3 text-[color:var(--tr-text-muted)] hover:text-[color:var(--tr-text)] transition-colors">
            <X size={20} />
          </button>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-[color:var(--tr-text)]">Yeni Berber Ekle</h2>
            <p className="text-sm text-[color:var(--tr-text-muted)] mt-1">Yeni bir berber hesabı ve profili oluşturun.</p>
          </div>

          <div className="px-6 pb-6">
            {successData ? (
                <div className="space-y-4 text-center">
                    <h3 className="text-lg font-semibold text-green-300">Berber Başarıyla Oluşturuldu!</h3>
                    <p className="text-sm text-[color:var(--tr-text-muted)]">Oluşturulan berber kodunu berber ile paylaşabilirsiniz.</p>
                    <div className="space-y-3 rounded-lg border border-[color:var(--tr-border-subtle)] bg-[color:var(--tr-bg-elevated)] p-4 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-[color:var(--tr-text)]">Berber Kodu:</span>
                            <div className="flex items-center gap-2 font-mono text-[color:var(--tr-accent)]">
                                {successData.public_code}
                                <button onClick={() => handleCopy(successData.public_code, 'Berber Kodu')} title="Kodu Kopyala" className="text-[color:var(--tr-text-muted)] hover:text-white"><Copy size={16}/></button>
                            </div>
                        </div>
                    </div>
                     <p className="text-xs text-[color:var(--tr-text-muted)]">Berber, sisteme oluşturulan şifre ile giriş yapabilir.</p>
                    <button onClick={handleClose} className="w-full rounded-lg bg-[color:var(--tr-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--tr-accent)]/90 transition-all">
                        Kapat
                    </button>
                </div>
            ) : (
                <form onSubmit={createBarber} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Ad Soyad</label>
                        <input id="fullName" type="text" required value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="mt-1 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] shadow-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--tr-accent)]" />
                    </div>
                     <div>
                        <label htmlFor="email" className="text-xs font-medium text-[color:var(--tr-text-muted)]">E-posta Adresi</label>
                        <input id="email" type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="mt-1 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] shadow-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--tr-accent)]" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Telefon Numarası</label>
                        <input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="mt-1 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] shadow-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--tr-accent)]" />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Şifre</label>
                        <input id="password" type="password" required minLength="8" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="mt-1 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] shadow-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--tr-accent)]" />
                        <p className="text-xs text-[color:var(--tr-text-muted)] pt-1">En az 8 karakter olmalıdır.</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                            {error}
                        </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-lg bg-[color:var(--tr-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--tr-accent)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Oluşturuluyor...</> : 'Berber Oluştur'}
                        </button>
                    </div>
                </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateBarberModal;