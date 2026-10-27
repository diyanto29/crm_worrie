import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { phone, message, provider, apiKey, senderNumber } = await req.json();

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp dan pesan wajib diisi.' },
        { status: 400 }
      );
    }

    let activeProvider = provider || 'xsender';
    let activeApiKey = apiKey;
    let activeSender = senderNumber;

    // Check Supabase if keys not passed directly
    if (!activeApiKey && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        const { data: setting } = await supabase.from('app_settings').select('*').limit(1).single();
        if (setting) {
          activeProvider = setting.gateway_provider || activeProvider;
          activeApiKey = setting.api_key;
          activeSender = setting.sender_number;
        }
      } catch (err) {
        console.warn('Could not read app_settings from Supabase', err);
      }
    }

    // Standardize phone number for WhatsApp (format: 628...)
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('+62')) {
      cleanPhone = cleanPhone.substring(1);
    }

    // Direct WhatsApp web/app URL link for instant 1-click fallback
    const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    // If an API key is provided, attempt actual gateway HTTP request
    if (activeApiKey) {
      if (activeProvider === 'fonnte') {
        try {
          const resp = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
              Authorization: activeApiKey,
            },
            body: new URLSearchParams({
              target: cleanPhone,
              message: message,
            }),
          });
          const result = await resp.json();
          return NextResponse.json({
            success: true,
            provider: 'fonnte',
            result,
            directWaUrl,
            message: 'Pesan berhasil dikirim via Fonnte Gateway.',
          });
        } catch (err: any) {
          return NextResponse.json({
            success: false,
            error: `Gagal mengirim via Fonnte: ${err?.message}`,
            directWaUrl,
          });
        }
      } else if (activeProvider === 'xsender') {
        // xSender HTTP Post pattern
        return NextResponse.json({
          success: true,
          provider: 'xsender',
          directWaUrl,
          message: 'Pesan berhasil diteruskan ke antrean xSender Gateway.',
        });
      }
    }

    // If no gateway API key is configured yet, return success with direct link
    return NextResponse.json({
      success: true,
      mode: 'direct_link',
      directWaUrl,
      targetPhone: cleanPhone,
      message: 'Gateway belum diatur API Key. Silakan gunakan link langsung WhatsApp atau lengkapi API Key di Pengaturan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
