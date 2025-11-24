import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Image as ImageIcon, Heart, MessageCircle, Loader2, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import BarberPostCard from '@/components/BarberPostCard.jsx';
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

const BarberInstagramProfile = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [barberData, setBarberData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isBioModalOpen, setBioModalOpen] = useState(false);

    const fetchBarberData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const { data: barber, error: barberError } = await supabase
                .from('barbers')
                .select('id, user_profile:user_profiles(*)')
                .eq('user_id', user.id)
                .single();

            if (barberError) throw barberError;
            setBarberData(barber);

            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .eq('barber_id', barber.id)
                .order('created_at', { ascending: false });

            if (postError) throw postError;
            setPosts(postData);

        } catch (err) {
            console.error("Error fetching barber portfolio:", err);
            setError("Portföy verileri yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBarberData();
    }, [fetchBarberData]);

    if (authLoading) {
        return <div className="flex items-center justify-center h-full"><p className="text-[color:var(--tr-text-muted)]">Yükleniyor...</p></div>;
    }
    
    if (!profile || profile.role !== 'barber') {
        return <Navigate to="/giris" replace />;
    }

    const stats = [
        { label: 'Post', value: posts.length },
        { label: 'Takipçi', value: '1.2k' }, // Mock
        { label: 'Takip', value: 150 }, // Mock
    ];

    return (
        <>
            <Helmet>
                <title>Portföyüm - Tıraş Randevum</title>
                <meta name="description" content="Çalışmalarınızı sergileyin, yeni postlar ekleyin ve takipçilerinizle etkileşimde bulunun." />
            </Helmet>

            <AnimatePresence>
                {isUploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} barberId={barberData?.id} onUploadSuccess={fetchBarberData} />}
                {isBioModalOpen && <BioModal onClose={() => setBioModalOpen(false)} currentBio={barberData?.user_profile?.bio} onUpdateSuccess={fetchBarberData} />}
            </AnimatePresence>

            <div className="p-4 sm:p-6 md:p-8 bg-[color:var(--tr-bg)] text-[color:var(--tr-text)]">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20"><Loader2 className="mx-auto h-10 w-10 animate-spin text-[color:var(--tr-accent)]" /></div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400">{error}</div>
                    ) : barberData && (
                        <>
                            <header className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mb-8">
                                <AvatarUploader currentAvatar={barberData.user_profile.avatar_url} onUploadSuccess={fetchBarberData} />
                                <div className="text-center sm:text-left flex-1">
                                    <h1 className="text-3xl font-bold">{barberData.user_profile.full_name || 'İsimsiz Berber'}</h1>
                                    <p className="text-[color:var(--tr-text-muted)] mt-2 max-w-md whitespace-pre-wrap">
                                        {barberData.user_profile.bio || 'Modern ve klasik saç kesimlerinde uzman. Randevu için profili ziyaret edin.'}
                                    </p>
                                    <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                                        <Button variant="outline" className="border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)]" onClick={() => setBioModalOpen(true)}><Edit size={16} className="mr-2"/>Bio'yu Düzenle</Button>
                                        <Button className="bg-[color:var(--tr-accent)] hover:bg-[color:var(--tr-accent)]/90 text-white" onClick={() => setUploadModalOpen(true)}><Plus size={16} className="mr-2"/>Yeni Post</Button>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-subtle)] mb-8">
                                {stats.map(stat => (
                                    <div key={stat.label}>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-[color:var(--tr-text-muted)]">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <main>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon size={20}/> Postlarım</h2>
                                {posts.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                                        {posts.map(post => <BarberPostCard key={post.id} post={post} />)}
                                    </div>
                                ) : (
                                    <div className="text-center p-12 rounded-xl bg-[color:var(--tr-bg-soft)] border-2 border-dashed border-[color:var(--tr-border-strong)]">
                                        <ImageIcon className="mx-auto h-12 w-12 text-[color:var(--tr-text-muted)]" />
                                        <h3 className="mt-4 text-lg font-semibold">Henüz Post Yok</h3>
                                        <p className="mt-1 text-sm text-[color:var(--tr-text-muted)]">Portföyünüzü oluşturmak için ilk postunuzu ekleyin.</p>
                                        <Button className="mt-6 bg-[color:var(--tr-accent)]" onClick={() => setUploadModalOpen(true)}><Plus size={16} className="mr-2"/>İlk Postu Ekle</Button>
                                    </div>
                                )}
                            </main>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const AvatarUploader = ({ currentAvatar, onUploadSuccess }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const filePath = `${user.id}`;
            const { error: uploadError } = await supabase.storage
                .from('barber-avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('barber-avatars')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('user_profiles')
                .update({ avatar_url: `${publicUrl}?t=${new Date().getTime()}` })
                .eq('id', user.id);

            if (dbError) throw dbError;

            toast({ title: "Başarılı", description: "Profil fotoğrafınız güncellendi." });
            onUploadSuccess();
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast({ variant: "destructive", title: "Hata", description: "Fotoğraf yüklenirken bir hata oluştu." });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group">
            <img
                alt="Barber avatar"
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-[color:var(--tr-accent-soft)]"
                src={currentAvatar || `https://ui-avatars.com/api/?name=${user?.email}&background=191d26&color=e1e7f2&size=128`}
            />
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-70"
            >
                {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
            </button>
        </div>
    );
};

const UploadModal = ({ onClose, barberId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file || !barberId) return;
        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('barber-posts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('barber-posts')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('posts')
                .insert({ barber_id: barberId, image_url: publicUrl, caption });

            if (dbError) throw dbError;

            toast({ title: "Başarılı", description: "Post başarıyla yayınlandı." });
            onUploadSuccess();
            onClose();
        } catch (error) {
            console.error("Post upload error:", error);
            toast({ variant: "destructive", title: "Hata", description: "Post yayınlanırken bir hata oluştu." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="bg-[color:var(--tr-bg-soft)] p-6 rounded-lg w-full max-w-lg border border-[color:var(--tr-border-strong)]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">Yeni Post Ekle</h2>
                <div className="space-y-4">
                    {preview ? (
                        <img src={preview} alt="Önizleme" className="w-full max-h-80 object-contain rounded-lg" />
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-[color:var(--tr-border-strong)] hover:border-[color:var(--tr-accent)]">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Camera className="w-10 h-10 mb-3 text-[color:var(--tr-text-muted)]" />
                                <p>Resim seçmek için tıkla</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                    )}
                    <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Açıklama ekle..." rows="3" className="w-full rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--tr-accent)]"></textarea>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>İptal</Button>
                    <Button className="bg-[color:var(--tr-accent)]" onClick={handleUpload} disabled={loading || !file}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Yayınla
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

const BioModal = ({ onClose, currentBio, onUpdateSuccess }) => {
    const { user } = useAuth();
    const [bio, setBio] = useState(currentBio || '');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ bio })
                .eq('id', user.id);
            if (error) throw error;
            toast({ title: "Başarılı", description: "Bio güncellendi." });
            onUpdateSuccess();
            onClose();
        } catch (error) {
            toast({ variant: "destructive", title: "Hata", description: "Bio güncellenirken bir hata oluştu." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="bg-[color:var(--tr-bg-soft)] p-6 rounded-lg w-full max-w-md border border-[color:var(--tr-border-strong)]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">Bio'yu Düzenle</h2>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Kendinizden bahsedin..." rows="5" className="w-full rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--tr-accent)]"></textarea>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>İptal</Button>
                    <Button className="bg-[color:var(--tr-accent)]" onClick={handleUpdate} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Kaydet
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default BarberInstagramProfile;