import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";

const isProductionEnvironment = process.env.NEXT_PUBLIC_APP_ENV === "prod";

function parseEmulatorHost(value: string | undefined, variableName: string) {
  if (!value) throw new Error(`${variableName} must be configured when using Firebase emulators`);
  const normalized = value.replace(/^https?:\/\//, "");
  const [host, port] = normalized.split(":");
  return { host, port: Number(port) };
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
};

export function isFirebaseClientConfigured(): boolean {
  if (!isProductionEnvironment) return true;

  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function initClientApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export const app: FirebaseApp = initClientApp();
export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
// export const functions = getFunctions(app);

if (!isProductionEnvironment) {
  const authEmulator = parseEmulatorHost(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST, "NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST");
  const firestoreEmulator = parseEmulatorHost(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST, "NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST");
  const storageEmulator = parseEmulatorHost(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST, "NEXT_PUBLIC_STORAGE_EMULATOR_HOST");

  connectAuthEmulator(auth, `http://${authEmulator.host}:${authEmulator.port}`);
  // connectAuthEmulator(auth, `http://${authEmulator.host}:${authEmulator.port}`, { disableWarnings: true });

  connectFirestoreEmulator(firestore, firestoreEmulator.host, firestoreEmulator.port);
  connectStorageEmulator(storage, storageEmulator.host, storageEmulator.port);
}
