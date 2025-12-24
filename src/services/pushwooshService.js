import { pwInstance } from './pushwooshClient';

// 1️⃣ SE EJECUTA EN EL CLICK
export function preRequestPushPermission() {
    if (Notification.permission === 'default') {
        pwInstance.subscribe().catch(() => {
            console.log('Usuario cerró popup');
        });
    }
}

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
        // Use the registerUser method to set the user ID
        pwInstance.push((api) => {
            api.registerUser(user.uid);
            console.log('Pushwoosh userId asociado:', user.uid);
        });
        return;
    }

    setTimeout(async () => {
        const lateToken = await pwInstance.getPushToken();
        if (lateToken) {
            // Use the registerUser method to set the user ID
            pwInstance.push((api) => {
                api.registerUser(user.uid);
                console.log('Pushwoosh userId asociado (tardío):', user.uid);
            });
        }
    }, 5000);
}
