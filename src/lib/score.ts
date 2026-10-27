/**
 * Formula & Helpers for calculating Lead / Prospect Potential Score (%)
 */

export function calculateProspectScore(lead: {
  has_website?: boolean;
  phone?: string | null;
  rating?: number | null;
  reviews_count?: number;
  address?: string | null;
}): number {
  let score = 0;

  // 1. Peluang Kebutuhan Website (Maks 40%)
  // Tanpa website adalah target paling potensial untuk penawaran pembuatan website
  if (!lead.has_website) {
    score += 40;
  } else {
    // Sudah ada website, potensi untuk redesign, SEO, atau iklan
    score += 15;
  }

  // 2. WhatsApp Valid & Siap Kontak (Maks 25%)
  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length >= 10) {
    score += 25;
  }

  // 3. Kredibilitas & Keaktifan Bisnis dari Rating (Maks 15%)
  const rating = Number(lead.rating) || 0;
  if (rating >= 4.7) {
    score += 15;
  } else if (rating >= 4.3) {
    score += 10;
  } else if (rating >= 4.0) {
    score += 5;
  } else if (rating > 0) {
    score += 2;
  }

  // 4. Jumlah Ulasan / Popularitas Bisnis (Maks 10%)
  const reviews = Number(lead.reviews_count) || 0;
  if (reviews >= 100) {
    score += 10;
  } else if (reviews >= 30) {
    score += 7;
  } else if (reviews >= 10) {
    score += 4;
  } else {
    score += 2;
  }

  // 5. Kelengkapan Alamat Fisik Bisnis (Maks 10%)
  if (lead.address && lead.address.length > 5) {
    score += 10;
  }

  // Clamped percentage between 15% and 99%
  return Math.min(Math.max(score, 15), 99);
}

export function getProspectScoreBadge(score: number): {
  label: string;
  badgeClass: string;
  barColor: string;
  textColor: string;
  tag: string;
} {
  if (score >= 85) {
    return {
      label: 'Hot Prospek',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      tag: '🔥 Sangat Hot',
    };
  }
  if (score >= 70) {
    return {
      label: 'Potensial Tinggi',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      barColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      tag: '⭐ Tinggi',
    };
  }
  if (score >= 50) {
    return {
      label: 'Potensial Sedang',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      tag: '⚡ Sedang',
    };
  }
  return {
    label: 'Potensial Rendah',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    barColor: 'bg-slate-400',
    textColor: 'text-slate-600',
    tag: 'Rendah',
  };
}
