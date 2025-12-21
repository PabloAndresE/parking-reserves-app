import { usePushwoosh } from '../hooks/usePushwoosh';

/**
 * Envía notificación al usuario cuando su reserva es cancelada
 */
export async function notifyReservationCancelled(userId, date) {
    if (!userId || !date) return;

    try {
        await fetch(
            'https://us-central1-parking-reservations-aab73.cloudfunctions.net/notifyReservationCancelled',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, date })
            }
        );
    } catch (err) {
        console.error('Error notificando cancelación', err);
    }
}
