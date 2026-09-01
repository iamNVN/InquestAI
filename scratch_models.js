import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Unfortunately the Node SDK doesn't expose listModels natively in a simple way in older versions,
  // but we can fetch it via REST if needed.
  // Actually, wait, let's just try to call gemini-1.0-pro and gemini-1.5-flash and gemini-pro.
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
listModels();
