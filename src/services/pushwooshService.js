import { usePushwoosh } from '../hooks/usePushwoosh';

export async function requestPushOnLogin(user) {
  // 1. Si ya concedió permiso, no molestamos
  const pwInstance = usePushwoosh();
  if (Notification.permission === 'granted') {
    pwInstance.setUserId(user.uid);
    return;
  }

  // 2. Si lo negó antes, NO insistimos
  if (Notification.permission === 'denied') {
    console.log('Notificaciones previamente bloqueadas');
    return;
  }

  // 3. Caso normal: pedir permiso
  try {
    await pwInstance.subscribe();   // muestra popup
    pwInstance.setUserId(user.uid); // asocia usuario
    console.log('Push activado al login');
  } catch (err) {
    console.log('Usuario no aceptó notificaciones');
  }
}
