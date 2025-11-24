import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, User, Phone, Mail, FileText } from 'lucide-react';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import { appointmentConfig } from '@/config/appointmentConfig';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from "@/components/ui/use-toast";

const BarberAppointmentSystem = () => {
    const { profile, loading: authLoading } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date('2025-11-18'));
    const [selectedService, setSelectedService] = useState(appointmentConfig.services[0].name);
    const [selectedTime, setSelectedTime] = useState(null);
    const { createAppointment } = useAppointments();
    const { toast } = useToast();

    if (authLoading) {
        return <div className="flex items-center justify-center h-full"><p className="text-[color:var(--tr-text-muted)]">Yükleniyor...</p></div>;
    }
    
    if (!profile || profile.role !== 'berber') {
        return <Navigate to="/giris" replace />;
    }

    const serviceDetails = appointmentConfig.services.find(s => s.name === selectedService);

    const handleCreateAppointment = (e) => {
        e.preventDefault();
        toast({
            title: "🚧 Henüz Hazır Değil!",
            description: "Randevu oluşturma henüz tamamlanmadı. Sonraki isteminizde talep edebilirsiniz! 🚀",
        });
    };

    return (
        <>
            <Helmet>
                <title>Randevu Sistemi - Tıraş Randevum</title>
                <meta name="description" content="Randevularınızı yönetin, yeni randevular oluşturun." />
            </Helmet>
            <div className="p-4 sm:p-6 md:p-8 bg-[color:var(--tr-bg)] min-h-full text-[color:var(--tr-text)]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Calendar and Appointment List */}
                    <div className="lg:col-span-2 space-y-8">
                        <AppointmentCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                        
                        <Card className="bg-[color:var(--tr-bg-soft)] border-[color:var(--tr-border-strong)]">
                            <CardHeader>
                                <CardTitle>Yaklaşan Randevular</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-[color:var(--tr-text-muted)]">Yaklaşan randevular burada listelenecek. Bu özellik geliştirme aşamasındadır.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Create Appointment */}
                    <div className="space-y-6">
                        <Card className="bg-[color:var(--tr-bg-soft)] border-[color:var(--tr-border-strong)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus size={20} /> Yeni Randevu Oluştur
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateAppointment} className="space-y-4">
                                    {/* Service Selection */}
                                    <div>
                                        <Label htmlFor="service">Hizmet Seçimi</Label>
                                        <select id="service" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="mt-1 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--tr-accent)]">
                                            {appointmentConfig.services.map(s => <option key={s.name}>{s.name}</option>)}
                                        </select>
                                        {serviceDetails && (
                                            <div className="text-xs text-[color:var(--tr-text-muted)] mt-2 flex justify-between">
                                                <span>Süre: {serviceDetails.duration} dk</span>
                                                <span>Fiyat: {serviceDetails.price} ₺</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Time Slot Picker */}
                                    <div>
                                        <Label>Uygun Saatler ({selectedDate.toLocaleDateString('tr-TR')})</Label>
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {['09:00', '09:30', '10:00', '11:00', '14:00', '15:30', '16:00'].map(time => (
                                                 <Button key={time} type="button" variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)} className={selectedTime === time ? "bg-[color:var(--tr-accent)]" : "bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)]"}>
                                                    {time}
                                                </Button>
                                            ))}
                                             <div className="text-xs col-span-3 text-center text-[color:var(--tr-text-muted)] p-2 bg-[color:var(--tr-bg-elevated)] rounded-md">12:00 - 13:00 Öğle Arası</div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="border-t border-[color:var(--tr-border-subtle)] pt-4 space-y-4">
                                        <h3 className="text-md font-semibold">Müşteri Bilgileri</h3>
                                        <div><Label htmlFor="customerName" className="flex items-center gap-2"><User size={14}/> Ad Soyad</Label><Input id="customerName" placeholder="Müşteri adı" className="mt-1 bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)]"/></div>
                                        <div><Label htmlFor="customerPhone" className="flex items-center gap-2"><Phone size={14}/> Telefon</Label><Input id="customerPhone" placeholder="05XX XXX XX XX" className="mt-1 bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)]"/></div>
                                        <div><Label htmlFor="customerEmail" className="flex items-center gap-2"><Mail size={14}/> E-posta (Opsiyonel)</Label><Input id="customerEmail" placeholder="musteri@mail.com" className="mt-1 bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)]"/></div>
                                        <div><Label htmlFor="notes" className="flex items-center gap-2"><FileText size={14}/> Notlar</Label><textarea id="notes" rows="2" placeholder="Randevu ile ilgili notlar..." className="mt-1 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] p-2 text-sm"></textarea></div>
                                    </div>

                                    <Button type="submit" className="w-full bg-[color:var(--tr-accent)] hover:bg-[color:var(--tr-accent)]/90 text-white">
                                        Randevu Oluştur
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BarberAppointmentSystem;