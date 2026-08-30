const admin = require('./functions/node_modules/firebase-admin');
const serviceAccount = require('/Users/fernando.karnagi/Downloads/hag-my-firebase-adminsdk-fbsvc-43af7badef.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkLead() {
  const snapshot = await db.collection('leads').where('customerCode', '==', 'SRS-26080209').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('Customer Code:', data.customerCode);
    console.log('Status:', JSON.stringify(data.status));
    console.log('Status length:', data.status?.length);
    console.log('Status chars:', [...(data.status || '')].map(c => c.charCodeAt(0)));
  });
}

checkLead().then(() => process.exit(0));
