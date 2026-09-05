import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
process.env.NEXTAUTH_URL = 'https://system.vsbojarlogistic.pl';

import { sendPasswordResetEmail } from './lib/mailer.js';

async function test() {
  console.log("Testing sendPasswordResetEmail to szymexpl924@gmail.com...");
  const resetLink = 'https://system.vsbojarlogistic.pl/reset-password?token=test_szymex_123';
  const res = await sendPasswordResetEmail('szymexpl924@gmail.com', resetLink, 'Szymex');
  console.log("Result:", res);
}

test();
