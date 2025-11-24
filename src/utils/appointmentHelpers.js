import { appointmentConfig } from '@/config/appointmentConfig';

/**
 * Generates an array of time slots between a start and end time.
 * @param {string} startTime - e.g., "09:00"
 * @param {string} endTime - e.g., "18:00"
 * @param {number} intervalMinutes - e.g., 30
 * @returns {string[]} - Array of time strings.
 */
export function generateTimeSlots(startTime, endTime, intervalMinutes) {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    while (currentTime < end) {
        slots.push(currentTime.toTimeString().slice(0, 5));
        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }
    return slots;
}

/**
 * Formats a date and time for display.
 * @param {Date|string} date - The date object or string.
 * @param {string} time - The time string, e.g., "14:30"
 * @returns {string} - e.g., "18 Kasım 2025, 14:30"
 */
export function formatAppointmentTime(date, time) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const datePart = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${datePart}, ${time}`;
}

/**
 * Gets the duration for a given service type.
 * @param {string} serviceType - The name of the service.
 * @returns {number} - Duration in minutes.
 */
export function getServiceDuration(serviceType) {
    const service = appointmentConfig.services.find(s => s.name === serviceType);
    return service ? service.duration : 0;
}

/**
 * Gets the price for a given service type.
 * @param {string} serviceType - The name of the service.
 * @returns {number} - Price.
 */
export function getServicePrice(serviceType) {
    const service = appointmentConfig.services.find(s => s.name === serviceType);
    return service ? service.price : 0;
}

// More helper functions will be added here as the implementation progresses.