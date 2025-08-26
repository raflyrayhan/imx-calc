// lib/googleDrive.ts
import { google } from "googleapis";
import fs from "node:fs";
import path from "node:path";

export async function getDrive() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const redirectUri = "http://localhost";
  const tokenPath = path.resolve(process.cwd(), "token.json");
  if (!fs.existsSync(tokenPath)) throw new Error("token.json not found");
  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2.setCredentials(tokens);
  oauth2.on("tokens", (t) => {
    const merged = { ...tokens, ...t };
    fs.writeFileSync(tokenPath, JSON.stringify(merged, null, 2));
  });
  return google.drive({ version: "v3", auth: oauth2 });
}


export async function getDriveWithAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const redirectUri = "http://localhost";
  const tokenPath = path.resolve(process.cwd(), "token.json");
  if (!fs.existsSync(tokenPath)) throw new Error("token.json not found");
  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2.setCredentials(tokens);
  oauth2.on("tokens", (t) => {
    const merged = { ...tokens, ...t };
    fs.writeFileSync(tokenPath, JSON.stringify(merged, null, 2));
  });
  const drive = google.drive({ version: "v3", auth: oauth2 });
  return { drive, auth: oauth2 };
}
