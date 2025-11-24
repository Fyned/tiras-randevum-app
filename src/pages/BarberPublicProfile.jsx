import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Phone, Mail, Tag, Calendar, User, Info, Image as ImageIcon, Heart, MessageCircle, Loader2 } from 'lucide-react';
import BarberPostCard from '@/components/BarberPostCard.jsx';
import { Button } from '@/components/ui/button'; // Import Button component

const BarberPublicProfile = () => {
    const { publicCode } = useParams();
    const { user, loading: authLoading } = useAuth();
    const [barberData, setBarberData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBarberData = useCallback(async () => {
        if (!publicCode) {
            setError("Berber kodu bulunamadı.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const normalizedCode = publicCode.toUpperCase();

        try {
            const { data: barber, error: barberError } = await supabase
                .from('barbers')
                .select('id, public_code, is_public, is_active, user_profile: user_profiles(*)')
                .eq('public_code', normalizedCode)
                .single();

            if (barberError || !barber || !barber.is_public || !barber.is_active) {
                throw new Error("Bu berberin profili şu anda görüntülenemiyor.");
            }
            setBarberData(barber);

            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .eq('barber_id', barber.id)
                .order('created_at', { ascending: false });

            if (postError) throw postError;
            setPosts(postData);

        } catch (err) {
            console.error("Fetch barber profile error:", err);
            setError(err.message || "Profil yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [publicCode]);

    useEffect(() => {
        fetchBarberData();
    }, [fetchBarberData]);

    if (authLoading) {
        return <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] flex items-center justify-center"><p className="text-sm text-[color:var(--tr-text-muted)]">Oturum kontrol ediliyor...</p></div>;
    }
    
    if (!user) {
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
                <title>{barberData ? barberData.user_profile.full_name : 'Berber Profili'} - Tıraş Randevum</title>
                <meta name="description" content="Berberin profilini ve çalışmalarını görüntüleyin." />
            </Helmet>
            <div className="p-4 sm:p-6 md:p-8 bg-[color:var(--tr-bg)] text-[color:var(--tr-text)] min-h-[calc(100vh-4rem)]">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20"><Loader2 className="mx-auto h-10 w-10 animate-spin text-[color:var(--tr-accent)]" /></div>
                    ) : error ? (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)] text-center">
                            <h1 className="text-xl font-bold text-[color:var(--tr-text)]">Profil Görüntülenemiyor</h1>
                            <p className="text-[color:var(--tr-text-muted)] mt-2">{error}</p>
                        </motion.div>
                    ) : barberData && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <header className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mb-8">
                                <img
                                    alt="Barber avatar"
                                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-[color:var(--tr-accent-soft)]"
                                    src={barberData.user_profile.avatar_url || `https://ui-avatars.com/api/?name=${barberData.user_profile.full_name}&background=191d26&color=e1e7f2&size=128`}
                                />
                                <div className="text-center sm:text-left flex-1">
                                    <h1 className="text-3xl font-bold">{barberData.user_profile.full_name}</h1>
                                    <p className="text-[color:var(--tr-text-muted)] mt-2 max-w-md whitespace-pre-wrap">
                                        {barberData.user_profile.bio || 'Bu berber henüz bir bio eklememiş.'}
                                    </p>
                                    <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                                        <Button className="bg-[color:var(--tr-accent)] hover:bg-[color:var(--tr-accent)]/90 text-white"><Calendar size={16} className="mr-2"/>Randevu Al</Button>
                                        <Button variant="outline" className="border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)]"><User size={16} className="mr-2"/>Takip Et</Button>
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
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon size={20}/> Postlar</h2>
                                {posts.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                                        {posts.map(post => <BarberPostCard key={post.id} post={post} />)}
                                    </div>
                                ) : (
                                    <div className="text-center p-12 rounded-xl bg-[color:var(--tr-bg-soft)] border-2 border-dashed border-[color:var(--tr-border-strong)]">
                                        <ImageIcon className="mx-auto h-12 w-12 text-[color:var(--tr-text-muted)]" />
                                        <h3 className="mt-4 text-lg font-semibold">Henüz Post Yok</h3>
                                        <p className="mt-1 text-sm text-[color:var(--tr-text-muted)]">Bu berber henüz portföyüne bir şey eklememiş.</p>
                                    </div>
                                )}
                            </main>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BarberPublicProfile;