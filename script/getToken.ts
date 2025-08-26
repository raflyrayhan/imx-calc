import 'dotenv/config';
import readline from 'node:readline';
import { google } from 'googleapis';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q:string)=>new Promise<string>(r=>rl.question(q, a=>{ rl.close(); r(a); }));

(async () => {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    'http://localhost' // cukup localhost
  );
  const SCOPES = ['https://www.googleapis.com/auth/drive'];
  const url = oauth2.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
  console.log('Open & authorize:\n', url);
  const code = await ask('\nPaste code here: ');
  const { tokens } = await oauth2.getToken(code);
  require('fs').writeFileSync('./token.json', JSON.stringify(tokens, null, 2));
  console.log('Saved token.json ✅');
})();
