import { Pushwoosh } from 'web-push-notifications'
import { PWSubscriptionButtonWidget } from 'web-push-notifications/widget-subscription-button'

// Create a Pushwoosh instance
const pwInstance = new Pushwoosh()

// Initialize the Pushwoosh instance with configuration
pwInstance.push(['init', {
  applicationCode: import.meta.env.VITE_PUSHWOOSH_APPLICATION_CODE,
  apiToken: import.meta.env.VITE_PUSHWOOSH_API_TOKEN,
  serviceWorkerUrl: '/service-worker.js',
  subscribeWidget: {
    enable: true,
  }
}])

// Register the subscription button widget
pwInstance.push(async () => {
  const widget = new PWSubscriptionButtonWidget(pwInstance)
  await widget.run()
})

/**
 * Hook to access the Pushwoosh instance.
 * @returns {Pushwoosh}
 */
export function usePushwoosh() {
  return pwInstance
}