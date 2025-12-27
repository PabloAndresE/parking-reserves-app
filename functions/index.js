const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

exports.notifyReservationCancelled = onRequest(
  {
    secrets: ['PUSHWOOSH_API_TOKEN', 'PUSHWOOSH_APPLICATION_CODE'],
    cors: true,
  },
  async (req, res) => {

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, date } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await admin.firestore().collection('cancelledReservations').add({
        userId,
        date,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        cancelledBy: 'admin',
      });

      console.log(
        'PUSHWOOSH_APPLICATION_CODE exists?',
        !!process.env.PUSHWOOSH_APPLICATION_CODE
      );
      console.log(
        'PUSHWOOSH_API_TOKEN prefix:',
        (process.env.PUSHWOOSH_API_TOKEN || '').slice(0, 6)
      );

      const response = await fetch(
        'https://cp.pushwoosh.com/json/1.3/createMessage',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request: {
              application: process.env.PUSHWOOSH_APPLICATION_CODE,
              auth: process.env.PUSHWOOSH_API_TOKEN,
              notifications: [
                {
                  send_date: 'now',
                  content: {
                    es: `Tu reserva para el ${date} ha sido cancelada`,
                  },
                  data: {
                    type: 'reservation_cancelled',
                    date,
                  },
                  conditions: [['uid', 'EQ', userId]],
                },
              ],
            },
          }),
        }
      );

      const result = await response.json();

      if (result.status_code !== 200) {
        console.error('Pushwoosh error:', result);
        return res.status(500).json({ error: 'Pushwoosh failed', result });
      }

      console.log('Push enviado correctamente a:', userId);
      return res.status(200).json({ success: true });

    } catch (err) {
      console.error('notifyReservationCancelled error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
);
