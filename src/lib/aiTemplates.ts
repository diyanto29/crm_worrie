/**
 * AI Copywriting & Template Recommendation Engine for WhatsApp Lead Outreach
 */

export interface TemplateRecommendation {
  id: string;
  category: 'noweb' | 'redesign' | 'followup' | 'promo' | 'niche' | 'app_offer';
  categoryLabel: string;
  title: string;
  badge: string;
  body: string;
  description: string;
}

export const RECOMMENDED_TEMPLATES: TemplateRecommendation[] = [
  {
    id: 'rec-app-1',
    category: 'app_offer',
    categoryLabel: 'Aplikasi Kita',
    title: 'Penawaran Akses Aplikasi Gratis (Free Trial) + CS Bantuan',
    badge: '🚀 Coba Gratis',
    description: 'Template penawaran menggunakan aplikasi/software kita secara gratis. Dilengkapi nomor bantuan bila ada kendala penggunaan.',
    body: `Halo kak di *{business_name}*, salam sukses selalu! 👋

Kami melihat reputasi bisnis kakak di Google Maps sangat bagus dengan rating *{rating} ⭐* ({reviews_count} ulasan) di {address}.

Perkenalkan, kami mengembangkan aplikasi cerdas khusus untuk mempermudah operasional dan otomatisasi leads bisnis seperti *{business_name}*. 

Kabar baiknya, kakak bisa langsung mencoba aplikasinya secara *GRATIS (Free Trial)* tanpa biaya sepeserpun di link ini:
🔗 *{app_url}*

Apabila saat mencoba kakak menemui kendala, bingung cara pakainya, atau butuh bantuan aktivasi, jangan sungkan untuk langsung hubungi WhatsApp Support kami di:
📞 *{contact_phone}* (atau cukup balas chat ini ya kak)

Tim kami siap memandu sampai lancar. Semoga bermanfaat untuk kemajuan *{business_name}*! 😊`,
  },
  {
    id: 'rec-app-2',
    category: 'app_offer',
    categoryLabel: 'Aplikasi Kita',
    title: 'Aplikasi CRM & Otomasi Pelanggan (Free Akun + Bantuan Kendala)',
    badge: '🔥 Paling Diminati',
    description: 'Menawarkan aplikasi CRM dan follow up otomatis untuk meningkatkan konversi. Siap support jika ada kendala sistem.',
    body: `Selamat siang pemilik *{business_name}*, izin menyapa sebentar. 🙏

Apakah selama ini kakak sering kewalahan mengelola database pelanggan, membalas chat satu per satu, atau mencatat prospek bisnis di {address}?

Kami ingin mengenalkan aplikasi sistem otomatisasi & CRM yang dirancang agar kakak bisa:
✅ Mengelola database pelanggan lebih rapi
✅ Follow-up prospek secara otomatis via WhatsApp
✅ Menghindari chat pelanggan terlewat

Kakak bisa langsung daftar dan aktivasi akun *GRATIS* di:
👉 *{app_url}*

Bila ada kendala saat setup atau ingin kami pandu langkah demi langkah, silakan langsung hubungi nomor WhatsApp kami:
📱 *{contact_phone}*

Apakah kakak tertarik untuk kami bantu siapkan akun perdananya? Terima kasih kak!`,
  },
  {
    id: 'rec-app-3',
    category: 'app_offer',
    categoryLabel: 'Aplikasi Kita',
    title: 'Undangan Pengguna Perdana Aplikasi (100% Free + Nomor Bantuan)',
    badge: '🎁 Akses Spesial',
    description: 'Undangan eksklusif mencoba aplikasi baru tanpa biaya dengan pendampingan teknis gratis bila ada kendala.',
    body: `Kabar gembira untuk tim *{business_name}*! 🎉

Melihat ulasan positif bisnis kakak ({rating} ⭐ di Google Maps), kami mengundang {business_name} untuk menjadi mitra terpilih yang mendapatkan *Akses Gratis 100%* ke aplikasi bisnis terbaru kami.

Aplikasi ini dapat membantu mempercepat pertumbuhan bisnis kakak di daerah {address} secara efisien.

Silakan akses aplikasinya gratis di tautan ini:
👉 *{app_url}*

💡 *Catatan:* Jika ada kendala sistem, pertanyaan seputar fitur, atau butuh panduan langsung, jangan ragu untuk kontak nomor WhatsApp support kami di:
📞 *{contact_phone}*

Kami siap mendampingi kakak kapan saja. Sukses terus untuk *{business_name}*! 🚀`,
  },
  {
    id: 'rec-app-4',
    category: 'app_offer',
    categoryLabel: 'Aplikasi Kita',
    title: 'Follow Up Coba Aplikasi & Solusi Kendala Teknis',
    badge: '🤝 Support CS',
    description: 'Pesan follow up ramah menanyakan apakah sudah mencoba aplikasi dan siap membantu menyelesaikan kendala.',
    body: `Halo kak di *{business_name}*, salam kenal kembali! 🌟

Izin menanyakan apakah kakak sudah sempat mencoba aplikasi kami kemarin di *{app_url}*?

Kira-kira apakah ada kendala, error, atau bagian alur yang membingungkan kak? Kami ingin memastikan kakak mendapatkan pengalaman terbaik.

Jika ada kendala apapun saat penggunaan atau ingin bantuan panduan langsung, silakan hubungi kami di nomor ini:
📲 *{contact_phone}* (atau langsung balas pesan ini)

Tim kami siap membantu menyelesaikan kendala kakak secepatnya. Terima kasih banyak kak! 🙏`,
  },
  {
    id: 'rec-1',
    category: 'noweb',
    categoryLabel: 'Bisnis Tanpa Web',
    title: 'Pujian Rating Google Maps & Tawaran Web Baru',
    badge: '🔥 Paling Laris',
    description: 'Pendekatan soft-selling dengan memuji reputasi Google Maps mereka terlebih dahulu sebelum menawarkan website.',
    body: `Halo kak, salam kenal dari tim Web Agency! 👋

Kami melihat *{business_name}* memiliki reputasi yang sangat bagus di Google Maps dengan rating *{rating} ⭐* dari *{reviews_count} ulasan* di daerah {address}.

Namun kami perhatikan {business_name} belum memiliki website resmi untuk menerima pesanan atau informasi profil bisnis. Padahal banyak calon pelanggan mencari info menu/layanan lewat Google sebelum berkunjung.

Boleh izin kami buatkan pratinjau demo website gratis untuk *{business_name}* kak? Tidak ada komitmen beli apa-apa, sekadar referensi untuk bisnis kakak. 😊`,
  },
  {
    id: 'rec-2',
    category: 'noweb',
    categoryLabel: 'Bisnis Tanpa Web',
    title: 'Penawaran Solutif Singkat (Direct & To The Point)',
    badge: '⚡ Konversi Cepat',
    description: 'Cocok untuk pemilik bisnis sibuk yang menyukai pesan to the point dan penawaran langsung.',
    body: `Halo pemilik *{business_name}*, izin menyapa sebentar. 🙏

Kami sedang melakukan kurasi UMKM berprestasi di {address} dan menemukan rating bisnis kakak sangat tinggi ({rating} ⭐).

Kabar baiknya, kami sedang ada program pembuatan *Website Bisnis Siap Pakai* yang langsung terhubung ke WhatsApp kakak, sudah termasuk:
✅ Domain bisnis resmi (.com)
✅ Tampilan modern ramah HP
✅ Tombol WhatsApp langsung chat
✅ Waktu pengerjaan kilat 2-3 hari

Apakah kakak tertarik melihat contoh website sejenis yang sudah kami buatkan? Terima kasih kak!`,
  },
  {
    id: 'rec-3',
    category: 'followup',
    categoryLabel: 'Follow Up',
    title: 'Follow Up Santai (Menanyakan Waktu Diskusi)',
    badge: '🤝 Ramah',
    description: 'Pesan tindak lanjut yang sopan setelah penawaran pertama agar tidak terkesan memaksa.',
    body: `Halo kak di *{business_name}*, salam sukses selalu! 🌟

Izin menindaklanjuti pesan kami sebelumnya terkait pembuatan website untuk {business_name}. 

Apakah minggu ini ada waktu luang sekitar 5 menit kak untuk kami kirimkan demo desainnya lewat WhatsApp? Kami sudah siapkan konsep awal yang cocok dengan karakter bisnis kakak di {address}.

Jika kakak sedang sibuk, kabar-kabari waktu senggangnya ya kak. Terima kasih banyak!`,
  },
  {
    id: 'rec-4',
    category: 'promo',
    categoryLabel: 'Promo & Urgensi',
    title: 'Promo Diskon Terbatas (Slot Kuota Khusus)',
    badge: '⏳ Urgensi Tinggi',
    description: 'Menciptakan urgensi (FOMO) dengan memberikan kuota diskon khusus dalam jangka waktu terbatas.',
    body: `Kabar gembira khusus untuk *{business_name}*! 🎉

Melihat ulasan positif bisnis kakak ({rating} ⭐ dari {reviews_count} pelanggan di Google Maps), kami ingin menawarkan *Subsidi Pembuatan Website 50%* khusus untuk 3 bisnis terpilih di area {address} minggu ini.

Fasilitas yang didapat:
1. Website profesional + optimasi Google Maps
2. Desain eksklusif (bukan template gratisan)
3. Tombol pesan WhatsApp otomatis
4. Garansi maintenance gratis 6 bulan

Kuota promo ini tersisa 1 slot lagi untuk area kakak. Apakah berminat kami kirimkan rincian paketnya kak?`,
  },
  {
    id: 'rec-5',
    category: 'redesign',
    categoryLabel: 'Redesain & Fitur Baru',
    title: 'Tawaran Upgrade Website & Mobile Friendly',
    badge: '🚀 Tingkatkan Omset',
    description: 'Untuk bisnis yang sudah memiliki website lama yang lambat, belum mobile-friendly, atau butuh tombol WhatsApp.',
    body: `Halo tim *{business_name}*, salam kenal! ✨

Kami melihat profil {business_name} di Google Maps dan mencoba mengunjungi websitenya. Bisnis kakak sangat prospektif dengan rating tinggi {rating} ⭐.

Izin memberi masukan kak, kami melihat websitenya bisa dioptimalkan agar lebih cepat dibuka di HP dan ditambahkan fitur formulir pemesanan WhatsApp otomatis agar omset naik signifikan.

Kebetulan kami spesialis peremajaan (redesign) website bisnis. Boleh kami kirimkan analisis singkat audit performa websitenya secara gratis kak?`,
  },
  {
    id: 'rec-6',
    category: 'niche',
    categoryLabel: 'F&B & Resto',
    title: 'Khusus Kuliner: Menu Digital & Order WhatsApp',
    badge: '🍔 Kuliner / Kafe',
    description: 'Formula khusus untuk rumah makan, resto, dan cafe yang membutuhkan katalog menu online yang langsung pesan via WhatsApp.',
    body: `Halo kak di *{business_name}*! Salam hangat dari tim kami. 🍽️

Kami melihat ulasan kuliner {business_name} di Google Maps sangat ramai ({reviews_count} ulasan, rating {rating} ⭐)!

Banyak pelanggan saat ini lebih suka melihat daftar menu & foto makanan secara online sebelum datang. Kami bisa bantu buatkan *Website Buku Menu Digital* untuk {business_name} yang bisa langsung pesan antar via WhatsApp tanpa potongan komisi aplikasi ojek online (untung 100% milik kakak).

Apakah boleh kami kirimkan contoh demo menu digitalnya ke nomor ini kak? Terima kasih!`,
  },
  {
    id: 'rec-7',
    category: 'niche',
    categoryLabel: 'Klinik & Salon / Jasa',
    title: 'Khusus Layanan Jasa: Booking Jadwal Online',
    badge: '💆 Jasa / Klinik',
    description: 'Formula khusus untuk klinik, dokter gigi, salon kecantikan, barbershop, bengkel, atau studio foto.',
    body: `Selamat siang kak di *{business_name}*. Salam kenal dari tim agency kami. 🩺✨

Kami kagum melihat ulasan {business_name} di Google Maps di {address} yang sangat terpercaya ({rating} ⭐ dari {reviews_count} pasien/pelanggan).

Untuk mempermudah pelanggan membuat janji temu (appointment/booking), kami menyediakan sistem *Website Booking Online* yang otomatis mencatat jadwal dan mengirim konfirmasi via WhatsApp. Pelanggan tidak perlu antre lama lagi dan staf kakak lebih efisien.

Boleh kami tunjukkan demo sistem reservasinya sebentar kak? Semoga bermanfaat untuk {business_name}!`,
  },
];

export interface AIGeneratorOptions {
  category: 'new_web' | 'redesign' | 'followup' | 'promo' | 'consultation' | 'app_offer';
  tone: 'friendly' | 'professional' | 'direct' | 'urgent';
  industry: 'general' | 'fnb' | 'health' | 'service' | 'property';
}

export function generateAITemplate(opts: AIGeneratorOptions): { title: string; body: string } {
  const { category, tone, industry } = opts;

  let title = 'Penawaran Website Otomatis AI';
  let greeting = 'Halo kak di *{business_name}*, salam kenal! 👋';
  let compliment = 'Kami sangat terkesan melihat reputasi {business_name} di Google Maps dengan rating *{rating} ⭐* ({reviews_count} ulasan) di {address}.';
  let hook = 'Namun kami perhatikan bisnis yang bagus ini belum memiliki website resmi untuk menjangkau lebih banyak pelanggan.';
  let offer = 'Kami bisa bantu buatkan website modern ramah HP yang langsung terhubung ke WhatsApp ini dalam 2-3 hari kerja.';
  let cta = 'Boleh izin kami kirimkan contoh pratinjau desainnya gratis untuk {business_name} kak?';

  // Customize based on Tone
  if (tone === 'professional') {
    greeting = 'Selamat siang Bapak/Ibu pimpinan *{business_name}*, salam hormat dari tim konsultan digital kami.';
    compliment = 'Berdasarkan peninjauan kami di Google Maps, {business_name} memiliki track record yang sangat kredibel dengan rating {rating} ⭐ di area {address}.';
    cta = 'Apakah kami dapat menjadwalkan presentasi portofolio singkat selama 5 menit via WhatsApp pada waktu luang Anda?';
  } else if (tone === 'direct') {
    greeting = 'Halo pemilik *{business_name}*, izin to the point ya kak. 🙏';
    compliment = 'Bisnis kakak di {address} ulasannya sangat positif ({rating} ⭐ dari {reviews_count} pelanggan).';
    cta = 'Tertarik kami bantu buatkan website resmi kak? Jika berminat, kami kirimkan rincian paketnya.';
  } else if (tone === 'urgent') {
    greeting = 'Kabar gembira spesial untuk *{business_name}*! 🎉';
    compliment = 'Sebagai bentuk apresiasi atas tingginya rating Google Maps {business_name} ({rating} ⭐), kami membuka kuota promo khusus minggu ini.';
    cta = 'Kuota promo ini terbatas hanya untuk 2 bisnis di area {address}. Berminat amankan slotnya sekarang kak?';
  }

  // Customize based on Industry
  if (industry === 'fnb') {
    title = 'Penawaran Website Menu Digital F&B';
    hook = 'Banyak pelanggan kuliner ingin melihat foto menu dan harga sebelum datang atau ingin pesan delivery tanpa potongan komisi aplikasi.';
    offer = 'Kami buatkan Website Buku Menu Digital interaktif yang bisa langsung klik pesan via WhatsApp kakak.';
  } else if (industry === 'health') {
    title = 'Website Klinik / Dental Janji Temu Online';
    hook = 'Untuk meningkatkan kenyamanan pasien, website dengan sistem janji temu online dan info dokter akan meningkatkan kepercayaan masyarakat.';
    offer = 'Kami siapkan landing page klinik profesional + tombol reservasi jadwal otomatis via WhatsApp.';
  } else if (industry === 'service') {
    title = 'Website Portofolio Layanan Jasa & Booking';
    hook = 'Calon klien membutuhkan portofolio hasil kerja dan daftar harga layanan yang jelas sebelum menghubungi kakak.';
    offer = 'Kami siap buatkan website portofolio elegan yang menampilkan testimoni dan kemudahan konsultasi via chat.';
  } else if (industry === 'property') {
    title = 'Website Galeri Kos / Properti & Reservasi';
    hook = 'Pencari kos dan properti sangat membutuhkan galeri foto kamar lengkap, fasilitas, dan ketersediaan kamar yang transparan.';
    offer = 'Kami bantu buatkan landing page properti dengan virtual tour foto kamar dan tombol tanya ketersediaan via WA.';
  }

  // Customize based on Category Goal
  if (category === 'app_offer') {
    title = 'Penawaran Aplikasi Bisnis Kita (Free Trial)';
    hook = 'Kami mengembangkan aplikasi sistem tools otomatisasi & manajemen pelanggan untuk mempermudah operasional dan menaikkan omset *{business_name}*.';
    offer = `Kakak bisa langsung mencoba aplikasinya secara *GRATIS (Free Trial)* di tautan berikut:
🔗 *{app_url}*`;
    cta = `Apabila ada kendala, pertanyaan seputar fitur, atau butuh bantuan saat mencoba, silakan langsung hubungi WhatsApp kami di nomor ini ya kak:
📞 *{contact_phone}*`;
  } else if (category === 'followup') {
    title = 'Follow Up Prospek (Menanyakan Kelanjutan)';
    hook = 'Izin menindaklanjuti pesan kami sebelumnya terkait optimasi online {business_name}.';
    offer = 'Kami sudah menyiapkan draf konsep tampilan yang sangat cocok dengan target pasar kakak di {address}.';
    cta = 'Apakah besok ada waktu luang sebentar untuk kami perlihatkan demonya kak?';
  } else if (category === 'promo') {
    title = 'Promo Diskon Spesial & Bonus Tambahan';
    offer = 'Minggu ini kami sedang ada paket promo website bisnis kilat: diskon 40% + gratis domain resmi .com + gratis Google Maps SEO.';
  } else if (category === 'redesign') {
    title = 'Tawaran Redesain & Peningkatan Kecepatan Web';
    hook = 'Kami melihat website {business_name} saat ini memiliki potensi besar untuk di-upgrade agar lebih cepat dibuka di HP dan lebih memikat pelanggan.';
    offer = 'Kami bisa bantu redesain total agar tampilan terlihat jauh lebih premium dan langsung terintegrasi WhatsApp.';
  } else if (category === 'consultation') {
    title = 'Undangan Konsultasi & Audit Gratis';
    hook = 'Kami membuat laporan audit singkat terkait visibilitas digital {business_name} di Google Maps.';
    offer = 'Ada beberapa peluang kata kunci lokal yang bisa membuat {business_name} menjaring lebih banyak pelanggan baru.';
    cta = 'Boleh kami kirimkan file laporannya secara gratis ke chat ini kak?';
  }

  const generatedBody = `${greeting}

${compliment}

${hook} ${offer}

${cta} Terima kasih dan sukses selalu untuk *{business_name}*!`;

  return {
    title,
    body: generatedBody,
  };
}
