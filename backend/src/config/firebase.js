const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 */

let initialized = false;

function initializeFirebase() {
  if (initialized) {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error('Firebase credentials not configured. Check your .env file.');
  }

  // Initialize Firebase Admin (Firestore ONLY - no Realtime DB!)
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      clientEmail
    })
  });

  initialized = true;
  console.log('Firebase Admin SDK initialized (Firestore only)');
}

module.exports = {
  initializeFirebase
};
