import * as admin from "firebase-admin";

const isProductionEnvironment = process.env.APP_ENV === "prod";


function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}


function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = formatPrivateKey(rawKey);

  if (isProductionEnvironment && projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    });
  }

  // In non-production, the Admin SDK reads emulator hosts from the environment.
  return admin.initializeApp({
    projectId: projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  });
}

export const adminApp = initAdmin();
export const adminAuth = adminApp.auth();
export const adminFirestore = adminApp.firestore();
export const adminStorage = adminApp.storage();

export default adminApp;
