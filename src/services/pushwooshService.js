import { pwInstance } from './pushwooshClient';

// 1️⃣ SE EJECUTA EN EL CLICK
export function preRequestPushPermission() {
    if (Notification.permission === 'default') {
        pwInstance.subscribe().catch(() => {
            console.log('Usuario cerró popup');
        });
    }
}

// 2️⃣ SE EJECUTA DESPUÉS DEL LOGIN
export async function requestPushAfterLogin(user) {
    if (!user?.uid) return;

    let token = null;
    let attempts = 0;

    while (!token && attempts < 5) {
        token = await pwInstance.getPushToken();
        console.log('Pushwoosh token:', token);
        if (!token) {
            await new Promise(r => setTimeout(r, 1000));
        }
        attempts++;
    }

    if (token) {
        pwInstance.push((api) => {
            api.setTags({ uid: user.uid });
            console.log('Pushwoosh TAG uid asociado:', user.uid);
        });
        return;
    }

    // 🔁 Reintento tardío (MISMO CÓDIGO, MISMA API)
    setTimeout(async () => {
        const lateToken = await pwInstance.getPushToken();
        if (lateToken) {
            pwInstance.push((api) => {
                api.setTags({ uid: user.uid });
                console.log('Pushwoosh TAG uid asociado (tardío):', user.uid);
            });
        }
    }, 5000);
}
