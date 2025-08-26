import 'dotenv/config';
import { Readable } from 'node:stream';
import { getDrive } from '../lib/googleDrive';

(async () => {
  const drive = await getDrive();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const res = await drive.files.create({
    requestBody: { name: 'hello.txt', parents: [folderId], mimeType: 'text/plain' },
    media: { mimeType: 'text/plain', body: Readable.from(['Hello from OAuth!']) },
    fields: 'id, name, webViewLink'
  });
  console.log('Uploaded:', res.data);
})();
