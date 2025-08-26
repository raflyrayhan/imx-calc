import 'dotenv/config';
import { google } from 'googleapis';

async function test() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!email || !keyRaw || !folderId) {
    throw new Error('ENV tidak lengkap. Cek GOOGLE_SERVICE_ACCOUNT_EMAIL / KEY / GOOGLE_DRIVE_FOLDER_ID');
  }

  const key = keyRaw.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    pageSize: 5,
    fields: 'files(id,name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  console.log('OK files:', res.data.files);
}

test().catch(e => {
  console.error('ERR', e.message);
  process.exit(1);
});
