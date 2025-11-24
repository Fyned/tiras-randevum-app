export const appointmentConfig = {
  services: [
    { name: 'Saç Kesimi', duration: 30, price: 150 },
    { name: 'Sakal Tıraşı', duration: 20, price: 100 },
    { name: 'Cilt Bakımı', duration: 45, price: 200 },
    { name: 'Kombo (Saç + Sakal)', duration: 60, price: 300 },
  ],
  workingHours: {
    start: '09:00',
    end: '18:00',
  },
  breakTimes: [
    { start: '12:00', end: '13:00' },
  ],
  slotDuration: 30, // minutes
  appointmentStatuses: [
    'Pending', // Beklemede
    'Confirmed', // Onaylandı
    'Completed', // Tamamlandı
    'Cancelled', // İptal Edildi
  ],
};