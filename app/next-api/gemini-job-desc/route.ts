import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /next-api/gemini-job-desc
 *
 * Accepts raw scraped job/admit-card description text and returns a
 * clean, AI-structured version using Google Gemini 1.5 Flash.
 *
 * Body:    { rawDescription, jobTitle, organizationName, type }
 * Returns: { enriched: string }
 *
 * Falls back gracefully to rawDescription on any error or if no API key.
 */
export async function POST(req: NextRequest) {
  try {
    const { rawDescription, jobTitle, organizationName, type } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || !apiKey.trim()) {
      return NextResponse.json({ enriched: rawDescription ?? '' });
    }

    const isAdmitCard = type === 'admit_card';

    const admitCardPrompt = [
      'You are a professional content formatter for a government exam portal in India.',
      'Exam: ' + jobTitle,
      'Conducting Body: ' + organizationName,
      '',
      'Below is raw scraped text from an official government website about an ADMIT CARD.',
      'Raw text:',
      '"""',
      rawDescription,
      '"""',
      '',
      'Your task:',
      '1. Remove all website navigation text, footers, disclaimers, and scraper artifacts.',
      '2. Write a clean 2-3 paragraph summary. Include: what exam it is, who conducts it, and key info for candidates.',
      '3. Do NOT use markdown, HTML tags, or bullet points. Write clean flowing paragraphs.',
      '4. Keep it concise and professional. Remove ANY mentions of third-party portals, competitors, or scraper sources (like "Sarkari Result", "SarkariResult.com", etc.).',
      '5. If the raw text is mostly garbled, write a brief admit card notice from the exam name and conducting body.',
      '',
      'Return ONLY the cleaned description text with no extra labels or headers.',
    ].join('\n');

    const jobPrompt = [
      'You are a professional job description formatter for a government/public sector jobs portal in India.',
      'Job Title: ' + jobTitle,
      'Organization: ' + organizationName,
      '',
      'Below is raw scraped text from an official government recruitment website.',
      'Raw text:',
      '"""',
      rawDescription,
      '"""',
      '',
      'Your task:',
      '1. Remove all website navigation text, footers, disclaimers, and scraper artifacts.',
      '2. Keep ALL actual recruitment information: vacancies, post names, qualifications, pay scale, dates, age limits.',
      '3. Organize into clean readable paragraphs. No markdown headers, bullet points, or HTML.',
      '4. Professional, neutral tone suitable for a job portal. Remove ANY mentions of third-party portals, competitors, or scraper sources (like "Sarkari Result", "SarkariResult.com", etc.).',
      '5. If the raw text has no real job info, write a brief note from the job title and organization.',
      '',
      'Return ONLY the cleaned job description text with no extra labels or headers.',
    ].join('\n');

    const prompt = isAdmitCard ? admitCardPrompt : jobPrompt;

    const geminiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      console.error('[gemini-job-desc] API error:', response.status);
      return NextResponse.json({ enriched: rawDescription ?? '' });
    }

    const data = await response.json();
    const enriched =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? rawDescription ?? '';

    return NextResponse.json({ enriched });
  } catch (err) {
    console.error('[gemini-job-desc] Unexpected error:', err);
    return NextResponse.json({ enriched: '' });
  }
}
