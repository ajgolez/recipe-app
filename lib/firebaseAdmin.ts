import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../firebase/serviceAccountKey.json';

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

export const db = getFirestore();