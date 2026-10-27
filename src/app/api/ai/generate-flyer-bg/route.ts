import { NextRequest, NextResponse } from 'next/server';

// Curated high-resolution studio photography & 3D backgrounds tailored for Worrie.id themes
const PRESET_STUDIO_IMAGES: Record<string, string> = {
  modern_students:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1080&q=80',
  remote_workspace:
    'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1080&q=80',
  global_partnership:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80',
  seminar_hall:
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1080&q=80'
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      aspectRatio = '1:1',
      style = 'modern_students',
      customSeed
    } = body;

    const width = 1080;
    const height = aspectRatio === '9:16' ? 1920 : 1080;

    // 1. If preset style requested (and not custom prompt), use instant, ultra-high-resolution studio visuals
    // This provides 0ms delay, 100% uptime, zero rate limits, and 0 payment errors
    if (style in PRESET_STUDIO_IMAGES && !prompt) {
      const studioUrl = PRESET_STUDIO_IMAGES[style];
      try {
        const imgRes = await fetch(studioUrl, { cache: 'force-cache' });
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

          return NextResponse.json({
            success: true,
            imageUrl: `data:${contentType};base64,${base64}`,
            source: 'studio_preset',
            style
          });
        }
      } catch (err) {
        console.warn('Failed to load studio preset, falling back to AI generator', err);
      }
    }

    // 2. Custom Prompt or AI generation requested
    const promptText = prompt && typeof prompt === 'string'
      ? `${prompt.trim()}, corporate navy blue theme with subtle amber accents, high quality, professional`
      : 'Modern digital education concept, students with laptops, navy blue corporate background, cinematic 8k';

    const seed = customSeed || Math.floor(Math.random() * 1000000);

    // Call Pollinations AI
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      promptText
    )}?width=${width}&height=${height}&seed=${seed}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const aiRes = await fetch(pollinationsUrl, {
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeout);

      // If Pollinations returns 200 (Success)
      if (aiRes.ok) {
        const buffer = await aiRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const contentType = aiRes.headers.get('content-type') || 'image/jpeg';

        return NextResponse.json({
          success: true,
          imageUrl: `data:${contentType};base64,${base64}`,
          promptUsed: promptText,
          source: 'ai_generated',
          seed
        });
      }

      // If Pollinations returns 402 (Payment/Rate limit) or 500 (Server busy)
      console.warn(`Pollinations returned status ${aiRes.status}, applying graceful studio visual fallback.`);
    } catch (aiErr) {
      console.warn('Pollinations network error, applying graceful fallback:', aiErr);
    }

    // 3. Graceful Fallback: Pick a high-res studio visual so user is never stuck
    const fallbackUrl = PRESET_STUDIO_IMAGES.modern_students;
    const fallbackRes = await fetch(fallbackUrl, { cache: 'force-cache' });
    const buffer = await fallbackRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = fallbackRes.headers.get('content-type') || 'image/jpeg';

    return NextResponse.json({
      success: true,
      imageUrl: `data:${contentType};base64,${base64}`,
      source: 'fallback_studio',
      warning:
        'Server AI publik sedang cooldown (batas gratis 1 gambar per 45 detik). Sistem mengaktifkan visual studio alternatif agar flyer Anda langsung siap diunduh!'
    });
  } catch (error: any) {
    console.error('Error in flyer visual API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memproses visual flyer'
      },
      { status: 500 }
    );
  }
}
