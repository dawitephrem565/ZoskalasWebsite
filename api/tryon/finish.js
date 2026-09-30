import { GoogleGenAI } from '@google/genai';
import { H, ok, fail, rateLimit } from '../../lib/helpers.js';

export const maxDuration = 60;

const CATEGORY_INSTRUCTIONS = {
  ring: (n) => `Place the ${n} ring on the user's finger. The ring should appear naturally fitted with realistic reflections and shadows matching the lighting. Do not alter the user's face, body, or clothing. Keep ring proportions realistic relative to the hand.`,
  necklace: (n) => `Place the ${n} necklace around the user's neck. The necklace should drape naturally with the chain following the collarbone. Add realistic metallic reflections matching ambient lighting. Do not alter the user's face, body, or clothing.`,
  earring: (n) => `Place the ${n} earring on the user's earlobe. The earring should appear properly positioned and sized. Add realistic metallic shine. Do not alter the user's face, body, or clothing.`,
  bracelet: (n) => `Place the ${n} bracelet on the user's wrist. The bracelet should wrap naturally around the wrist. Add realistic metallic reflections matching the lighting. Do not alter the user's face, body, or clothing.`,
};

function buildPrompt(category, name, desc, skinHint) {
  const base = `You are a professional jewelry try-on AI. The user has uploaded a photo. `;
  const descNote = desc ? ` Jewelry description: ${desc}.` : '';
  const skinNote = skinHint ? ` The user's skin tone is ${skinHint}.` : '';
  return `${base}${CATEGORY_INSTRUCTIONS[category]?.(name) || CATEGORY_INSTRUCTIONS.ring(name)}${descNote}${skinNote}

Rules:
- Generate ONLY the modified image, no text response
- The jewelry must look photorealistic and naturally placed
- Preserve the original image quality, lighting, and composition
- Do not add any text, watermarks, or borders`;
}

export default H(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!rateLimit(req, 10)) return fail(res, 429, 'Too many requests. Please try again later.');

  const body = req.body || {};
  const image = String(body.image || '');
  const category = String(body.category || 'ring');
  const jewelryName = String(body.jewelryName || '');
  const jewelryDesc = String(body.jewelryDesc || '');
  const skinHint = String(body.skinHint || '');

  if (!image || image.length > 4_000_000) return fail(res, 400, 'Invalid or too large image');
  if (!['ring', 'necklace', 'earring', 'bracelet'].includes(category)) {
    return fail(res, 400, 'Invalid category');
  }
  if (!jewelryName) return fail(res, 400, 'jewelryName required');
  if (!process.env.GEMINI_API_KEY) return fail(res, 500, 'GEMINI_API_KEY not configured');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = buildPrompt(category, jewelryName, jewelryDesc, skinHint);
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-image';

  console.log('[tryon] Gemini call, image chars:', image.length, 'model:', model);

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: image } }],
        },
      ],
      config: { responseModalities: ['IMAGE'], temperature: 0.4 },
    });
  } catch (apiErr) {
    console.error('[tryon] Gemini API error:', apiErr.message);
    const msg = String(apiErr.message || '');
    if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      return fail(res, 429, 'AI image generation quota reached for this API key. Enable billing on the Google AI Studio project (or use a key with image quota) to enable Virtual Try-On.');
    }
    if (msg.includes('404')) {
      return fail(res, 502, 'Image model not available for this API key. Check GEMINI_MODEL.');
    }
    return fail(res, 502, 'Gemini API call failed: ' + apiErr.message);
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) {
    console.error('[tryon] No image in response:', JSON.stringify(response).slice(0, 400));
    return fail(res, 500, 'Gemini did not return an image');
  }

  return ok(res, {
    ok: true,
    image: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  });
});
