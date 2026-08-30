const admin = require('./functions/node_modules/firebase-admin');
const serviceAccount = require('/Users/fernando.karnagi/Downloads/hag-my-firebase-adminsdk-fbsvc-43af7badef.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PIPELINE_STAGES = [
  'GOOGLE_FORM-INCOMING', 'NO_RESPONSE', 'SITE_VISIT', 'PROPOSAL_QUOTATION',
  'BOOKING_FEE_RECEIVED', 'SESB_SUBMITTED', 'SESB_APPROVED', 'PROFORMA_SENT',
  '50_COLLECTED', 'ECOS_DOCS_COLLECTED', 'PASSED_TO_ISYRAQ', 'ECOS_SUBMITTED',
  'ECOS_APPROVED', 'INVOICE_SENT_40', '40_COLLECTED', 'INSTALLATION_DONE',
  'INVOICE_SENT_10', '10_COLLECTED', 'TC', 'SRATO', 'TURN_ON',
];

async function check() {
  const snap = await db.collection('leads').where('customerCode', '==', 'SRS-26080209').get();
  snap.forEach(doc => {
    const data = doc.data();
    const idx = PIPELINE_STAGES.indexOf(data.status);
    console.log('Status:', data.status);
    console.log('Index:', idx);
    console.log('Match:', idx !== -1);
  });
}
check().then(() => process.exit(0));
