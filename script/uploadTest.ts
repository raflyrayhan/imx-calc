import 'dotenv/config';
import { google } from 'googleapis';
import { Readable } from 'node:stream';

async function upload() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth });

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const content = 'Hello from Service Account!';

  const res = await drive.files.create({
    requestBody: {
      name: 'hello.txt',
      parents: [folderId],
      mimeType: 'text/plain',
    },
    media: {
      mimeType: 'text/plain',
      body: Readable.from([content]), // <-- penting: stream, bukan Buffer
    },
    fields: 'id, name, webViewLink',
    supportsAllDrives: true,
  });

  console.log('Uploaded file:', res.data);
}

upload().catch(err => {
  console.error('ERR:', err?.message || err);
  process.exit(1);
});
