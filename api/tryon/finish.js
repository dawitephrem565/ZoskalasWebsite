import { GoogleGenAI } from '@google/genai';
import { H, ok, fail, rateLimit } from '../../lib/helpers.js';

export const maxDuration = 60;

const CATEGORY_INSTRUCTIONS = {
  ring: (n) => `Place the ${n} ring on the user's finger. The ring should appear naturally fitted with realistic reflections and shadows matching the lighting. Do not alter the user's face, body, or clothing. Keep ring proportions realistic relative to the hand.`,
  necklace: (n) => `Place the ${n} necklace around the user's neck. The necklace should drape naturally with the chain following the collarbone. Add realistic metallic reflections matching ambient lighting. Do not alter the user's face, body, or clothing.`,
  earring: (n) => `Place the ${n} earring on the user's earlobe. The earring should appear properly positioned and sized. Add realistic metallic shine. Do not alter the user's face, body, or clothing.`,
  bracelet: (n) => `Place the ${n} bracelet on the user's wrist. The bracelet should wrap naturally around the wrist. Add realistic metallic reflections matching the lighting. Do not alter the user's face, body, or clothing.`,
};

function buildPrompt(category, name, desc, skinHint, hasJewelryRef, jewelryTitle) {
  const placement = CATEGORY_INSTRUCTIONS[category]?.(name) || CATEGORY_INSTRUCTIONS.ring(name);
  const descNote = desc ? ` Jewelry description: ${desc}.` : '';
  const skinNote = skinHint ? ` The user's skin tone is ${skinHint}.` : '';
  const source = hasJewelryRef
    ? `Image 1 is the person's photo. Image 2 is the exact jewelry piece to apply${jewelryTitle ? ` ("${jewelryTitle}")` : ''} — reproduce its design, stones, metal color and fine details faithfully.`
    : `The user has uploaded a photo and the jewelry is described below.`;
  return `You are a professional jewelry try-on AI.
${source}
${placement}${descNote}${skinNote}

Rules:
- Generate ONLY the modified image, no text response
- The jewelry must look photorealistic, naturally worn, correctly scaled and positioned for the person
- Preserve the person's face, body, skin tone, clothing, background, lighting and image composition exactly
- Add only the jewelry — change nothing else in the photo
- No text, watermarks, or borders`;
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
  const jewelryImage = String(body.jewelryImage || '');
  const jewelryMimeType = String(body.jewelryMimeType || 'image/jpeg');
  const jewelryTitle = String(body.jewelryTitle || '');

  if (!image || image.length > 4_000_000) return fail(res, 400, 'Invalid or too large image');
  if (jewelryImage && jewelryImage.length > 1_500_000) return fail(res, 400, 'Jewelry reference image too large');
  if (!['ring', 'necklace', 'earring', 'bracelet'].includes(category)) {
    return fail(res, 400, 'Invalid category');
  }
  if (!jewelryName) return fail(res, 400, 'jewelryName required');
  if (!process.env.GEMINI_API_KEY) return fail(res, 500, 'GEMINI_API_KEY not configured');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = buildPrompt(category, jewelryName, jewelryDesc, skinHint, !!jewelryImage, jewelryTitle);
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-image';

  const userParts = [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: image } }];
  if (jewelryImage) {
    userParts.push({ inlineData: { mimeType: jewelryMimeType, data: jewelryImage } });
  }

  console.log('[tryon] Gemini call, image chars:', image.length, 'jewelry ref:', jewelryImage.length, 'model:', model);

  const callModel = () => ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: userParts }],
    config: { responseModalities: ['IMAGE'], temperature: 0.4 },
  });

  let response;
  try {
    response = await callModel();
    const hasImage = (r) => (r.candidates?.[0]?.content?.parts || []).some((p) => p.inlineData?.data);
    for (let attempt = 0; attempt < 2 && !hasImage(response); attempt++) {
      console.log('[tryon] no image in response, retry', attempt + 1);
      response = await callModel();
    }
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
