const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAuditLogs() {
  try {
    const snapshot = await db.collection('auditLogs').limit(5).get();
    console.log('Audit logs count:', snapshot.size);
    snapshot.forEach(doc => {
      console.log('Log:', doc.id, doc.data());
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAuditLogs().then(() => process.exit(0));
