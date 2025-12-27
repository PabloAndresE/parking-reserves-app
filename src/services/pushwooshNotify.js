import { pwInstance } from './pushwooshClient';

/**
 * Registra el UID de Firebase como TAG en Pushwoosh
 * ESTO ES CLAVE PARA PODER ENVIAR PUSH POR USUARIO
 */
export async function registerPushwooshTag(firebaseUid) {
    if (!firebaseUid) return;

    pwInstance.push(['setTags', {
        uid: firebaseUid
    }]);

    console.log('Pushwoosh TAG uid registrado:', firebaseUid);
}

/**
 * Llama a la Cloud Function para enviar notificación
 */
export async function notifyReservationCancelled(userId, date) {
    if (!userId || !date) {
        throw new Error('Faltan parámetros requeridos');
    }

    const response = await fetch(
        'https://us-central1-parking-reservations-aab73.cloudfunctions.net/notifyReservationCancelled',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        console.error('Error backend:', result);
        throw new Error(result.error || 'Error enviando notificación');
    }

    console.log('Notificación enviada correctamente');
    return result;
}
