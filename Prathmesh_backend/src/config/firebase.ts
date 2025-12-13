import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_PROJECT_ID?: string;
      FIREBASE_CLIENT_EMAIL?: string;
      FIREBASE_PRIVATE_KEY?: string;
      FIREBASE_STORAGE_BUCKET?: string;
    }
  }
}

// Get environment variables with fallbacks
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\/g, '\\'),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 
                (process.env.FIREBASE_PROJECT_ID ? 
                  `${process.env.FIREBASE_PROJECT_ID}.appspot.com` : 
                  undefined)
};

// Validate required configuration
if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
  console.error('❌ Missing Firebase configuration. Please check your .env file:');
  console.error('FIREBASE_PROJECT_ID:', firebaseConfig.projectId ? '✅ Set' : '❌ Missing');
  console.error('FIREBASE_CLIENT_EMAIL:', firebaseConfig.clientEmail ? '✅ Set' : '❌ Missing');
  console.error('FIREBASE_PRIVATE_KEY:', firebaseConfig.privateKey ? '✅ Set' : '❌ Missing');
  console.error('FIREBASE_STORAGE_BUCKET:', firebaseConfig.storageBucket || 'Using default');
  
  throw new Error('Missing required Firebase configuration. Please check your .env file.');
}

// Initialize Firebase Admin if not already initialized
let bucket;
try {
  const app = getApps().length === 0 
    ? initializeApp({
        credential: cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
        storageBucket: firebaseConfig.storageBucket
      })
    : getApps()[0];

  bucket = getStorage(app).bucket();
  console.log('✅ Firebase Storage initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  throw error;
}

export { bucket };
