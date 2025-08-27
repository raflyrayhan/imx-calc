// lib/firebase/admin.ts
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

type ServiceAccountEnv = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function loadServiceAccountFromEnv(): ServiceAccountEnv | null {

  const json = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const data = JSON.parse(json);
      let pk = data.private_key as string | undefined;
      if (pk?.includes("\\n")) pk = pk.replace(/\\n/g, "\n");
      return {
        projectId: data.project_id as string | undefined,
        clientEmail: data.client_email as string | undefined,
        privateKey: pk,
      };
    } catch {
      
    }
  }

  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey?.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

let _auth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (_auth) return _auth;

  if (!getApps().length) {
    const sa = loadServiceAccountFromEnv();

    if (sa?.projectId && sa.clientEmail && sa.privateKey) {
     
      initializeApp({
        credential: cert({
          projectId: sa.projectId,
          clientEmail: sa.clientEmail,
          privateKey: sa.privateKey,
        }),
      });
    } else {

      initializeApp({ credential: applicationDefault() });
    }
  }

  _auth = getAuth();
  return _auth;
}


export const adminAuth = getAdminAuth();
