import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, FileText, Image as ImageIcon, Loader2, CheckCircle, AlertTriangle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BarberImageUpload from '@/components/BarberImageUpload.jsx';
import { useToast } from "@/components/ui/use-toast";

const BarberProfile = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { toast } = useToast();
    
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
            setBio(profile.bio || '');
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);
    
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!user) {
            setError("Kullanıcı oturumu bulunamadı.");
            setLoading(false);
            return;
        }

        try {
            let finalAvatarUrl = avatarUrl;

            if (avatarFile) {
                const filePath = `${user.id}`;
                const { error: uploadError } = await supabase.storage
                    .from('barber-avatars')
                    .upload(filePath, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('barber-avatars')
                    .getPublicUrl(filePath);
                
                finalAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`;
            }

            const updates = {
                full_name: fullName,
                phone,
                bio,
                avatar_url: finalAvatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id);

            if (updateError) throw updateError;
            
            setSuccess("Profil başarıyla güncellendi.");
            setAvatarFile(null); // Reset file after upload
            toast({ title: "Başarılı", description: "Profiliniz güncellendi." });

        } catch (err) {
            console.error("Profile update error:", err);
            setError("Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
            toast({ variant: "destructive", title: "Hata", description: err.message });
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const BarberAvatar = ({ url, name }) => {
        const initial = name?.charAt(0)?.toUpperCase() || '?';
        if (url) {
            return <img src={url} alt={name} className="h-16 w-16 rounded-full object-cover border-2 border-[color:var(--tr-bg-elevated)]" />;
        }
        return (
            <div className="h-16 w-16 rounded-full bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text-muted)] flex items-center justify-center text-2xl font-semibold">
                {initial}
            </div>
        );
    };

    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] flex items-center justify-center">
                <p className="text-sm text-[color:var(--tr-text-muted)]">Profil yükleniyor…</p>
            </div>
        );
    }

    if (!profile) {
        return <Navigate to="/giris" replace />;
    }

    if (profile.role !== 'barber') {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] flex items-center justify-center">
                <p className="text-sm text-[color:var(--tr-text-muted)]">Bu sayfaya sadece berber hesapları erişebilir.</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-[color:var(--tr-text)]">
            <div className="mx-auto max-w-3xl flex-col gap-8 px-4 py-10">
                <header className="flex items-center justify-between gap-6 p-6 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)]">
                    <div className="flex items-center gap-6">
                        <BarberAvatar url={avatarUrl} name={fullName} />
                        <div>
                            <h1 className="text-2xl font-bold text-[color:var(--tr-text)] sm:text-3xl">{fullName}</h1>
                            <p className="max-w-md text-sm text-[color:var(--tr-text-muted)] mt-1 truncate">
                                {bio || 'Profilinize kısa bir bio ekleyin.'}
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] hover:bg-[color:var(--tr-bg-elevated)]/80">
                        <Link to="/berber/instagram-profile">
                            <Instagram size={16} className="mr-2"/> Portföyü Görüntüle
                        </Link>
                    </Button>
                </header>

                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    onSubmit={handleUpdateProfile}
                    className="mt-8 space-y-6 rounded-2xl p-6 bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)]"
                >
                    <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="fullName" className="text-sm font-medium text-[color:var(--tr-text-muted)] flex items-center gap-2"><User size={14}/> Ad Soyad</Label>
                            <Input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)]" />
                        </div>
                        <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-[color:var(--tr-text-muted)] flex items-center gap-2"><Phone size={14}/> Telefon Numarası</Label>
                            <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)]" />
                        </div>
                        <div>
                            <Label htmlFor="bio" className="text-sm font-medium text-[color:var(--tr-text-muted)] flex items-center gap-2"><FileText size={14}/> Bio</Label>
                            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength="500" rows="4" className="mt-1 w-full rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tr-accent)] transition-all" placeholder="Kendinizden veya dükkanınızdan bahsedin..."></textarea>
                        </div>
                         <div>
                            <Label className="text-sm font-medium text-[color:var(--tr-text-muted)] flex items-center gap-2 mb-2"><ImageIcon size={14}/> Profil Fotoğrafı</Label>
                            <BarberImageUpload onFileSelect={setAvatarFile} currentImageUrl={avatarUrl} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                                <AlertTriangle size={14} /> {error}
                            </motion.div>
                        )}
                        {success && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-200">
                                <CheckCircle size={14} /> {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-[color:var(--tr-accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--tr-accent)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...</> : 'Değişiklikleri Kaydet'}
                        </Button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default BarberProfile;