import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const generateCustomerCode = functions.firestore
  .document("leads/{leadId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.customerCode) return;

    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, "0");
    const prefix = `SRS-${yy}${mm}`;

    const leadsRef = db.collection("leads");
    const query = leadsRef
      .where("customerCode", ">=", prefix)
      .where("customerCode", "<", `${prefix}z`)
      .orderBy("customerCode", "desc")
      .limit(1);

    const snapshot = await query.get();

    let nextNum = 1;
    if (!snapshot.empty) {
      const lastCode = snapshot.docs[0].data().customerCode;
      const lastNum = parseInt(lastCode.slice(-4), 10);
      nextNum = lastNum + 1;
    }

    const customerCode = `${prefix}${nextNum.toString().padStart(4, "0")}`;
    await snap.ref.update({ customerCode });
  });

export const onLeadStatusChange = functions.firestore
  .document("leads/{leadId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === after.status) return;

    await db.collection("statusUpdates").add({
      leadId: context.params.leadId,
      customerCode: after.customerCode,
      stage: after.status,
      status: "DONE",
      updatedBy: after.updatedBy || "system",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notes: `Status changed from ${before.status} to ${after.status}`,
    });
  });

export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    displayName: user.displayName || user.email?.split("@")[0] || "",
    email: user.email,
    role: "cs",
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
