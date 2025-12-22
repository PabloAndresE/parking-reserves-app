import { Pushwoosh } from 'web-push-notifications';
import { PWSubscriptionButtonWidget } from 'web-push-notifications/widget-subscription-button';

let isReady = false;
// 🔹 Singleton global
export const pwInstance = new Pushwoosh();

// 🔹 Init una sola vez
pwInstance.push(['init', {
  applicationCode: import.meta.env.VITE_PUSHWOOSH_APPLICATION_CODE,
  apiToken: import.meta.env.VITE_PUSHWOOSH_API_TOKEN,
  serviceWorkerUrl: '/service-worker.js',
  logLevel: 'debug',
  subscribeWidget: {
    enable: true,
  }
}]);
pwInstance.push(() => {
  isReady = true;
  console.log('Pushwoosh READY');
});


pwInstance.push(async () => {
  const widget = new PWSubscriptionButtonWidget(pwInstance);
  await widget.run();
});

export function usePushwoosh() {
  return pwInstance;
}

export function isPushwooshReady() {
  return isReady;
}
