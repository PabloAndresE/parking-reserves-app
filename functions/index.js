const { onRequest } = require('firebase-functions/v2/https');
const fetch = require('node-fetch');

exports.notifyReservationCancelled = onRequest(async (req, res) => {
  try {
    const { userId, date } = req.body;

    if (!userId || !date) {
      res.status(400).json({ error: 'Missing userId or date' });
      return;
    }

    const appCode = process.env.PUSHWOOSH_APP_CODE || 
      require('firebase-functions').config().pushwoosh.app_code;

    const serverApiToken = process.env.PUSHWOOSH_SERVER_API_TOKEN || 
      require('firebase-functions').config().pushwoosh.server_api_token;

    const response = await fetch(
      'https://cp.pushwoosh.com/json/1.3/createMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application: appCode,
          auth: serverApiToken,
          notifications: [
            {
              send_date: 'now',
              content: {
                es: `Tu reserva de parking para el día ${date} fue cancelada por el supervisor.`
              },
              users: [userId],
              data: {
                type: 'RESERVATION_CANCELLED',
                date
              }
            }
          ]
        })
      }
    );

    const result = await response.json();
    res.status(200).json(result);

  } catch (err) {
    console.error('Error sending push:', err);
    res.status(500).json({ error: 'Internal error sending push' });
  }
});
