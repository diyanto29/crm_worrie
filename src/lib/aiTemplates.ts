/**
 * AI Copywriting & Template Recommendation Engine for WhatsApp Lead Outreach
 * Dedicated to Worrie.id (Working Remotely Indonesia) & Educational Institution Programs
 */

export interface TemplateRecommendation {
  id: string;
  category: 
    | 'after_school' 
    | 'school_partnership' 
    | 'website_ppdb' 
    | 'attendance_hris' 
    | 'bundling' 
    | 'followup' 
    | 'app_offer'
    | 'noweb' 
    | 'redesign' 
    | 'promo' 
    | 'niche';
  categoryLabel: string;
  title: string;
  badge: string;
  body: string;
  description: string;
}

export const RECOMMENDED_TEMPLATES: TemplateRecommendation[] = [
  // =========================================================================
  // 1. AFTER SCHOOL PROGRAM (WORRIE.ID) - EKSTRAKURIKULER DIGITAL & REMOTE WORK
  // =========================================================================
  {
    id: 'rec-as-1',
    category: 'after_school',
    categoryLabel: 'After School & Ekskul Worrie',
    title: 'Audiensi Kemitraan Ekskul ke Kepala Sekolah (Rasio 1:5 & Biaya Rp 0)',
    badge: '⭐ Rekomendasi Utama',
    description: 'Paling efektif untuk mengajukan kemitraan resmi pembukaan kelas ekstrakurikuler remote work ke Kepala Sekolah / Waka Kurikulum tanpa membebani anggaran sekolah.',
    body: `Selamat siang Bapak/Ibu Pimpinan di *{business_name}*, salam hormat dari tim Worrie.id (Working Remotely Indonesia). 🙏

Kami melihat reputasi dan prestasi {business_name} sangat membanggakan dengan rating *{rating} ⭐* ({reviews_count} ulasan) di {address}.

Perkenalkan, kami dari *Worrie.id*, platform akselerasi karir dan skill remote work internasional. Kami ingin mengajukan program kemitraan ekstrakurikuler unggulan untuk siswa:

🚀 *AFTER SCHOOL: REMOTE WORK CAREER ACCELERATOR*
Program intensif yang mempersiapkan generasi muda menguasai keahlian digital masa depan (AI Tools, Global Portofolio, Desain, & Remote Freelancing global) sejak bangku sekolah.

✨ *Keunggulan Program untuk {business_name}:*
1. *Rasio Emas 1:5* — 1 Mentor industri hanya membimbing maksimal 5 siswa untuk pendampingan intensif.
2. *100% Praktik Nyata* — Bukan teori membosankan. Setiap sesi siswa pulang membawa 1 project portofolio nyata.
3. *Biaya Setup Rp 0 untuk Sekolah* — Pihak sekolah tidak dikenakan biaya investasi awal sama sekali.
4. *Skema Bagi Hasil Kas Sekolah* — Kemitraan resmi dengan sharing 10% - 15% untuk kas sekolah / guru pembina.
5. *Showcase Karya Akhir Term* — Pameran hasil karya siswa di hadapan pihak yayasan & orang tua yang meningkatkan daya tarik PPDB sekolah.

Apakah kami diperkenankan mengirimkan dokumen proposal resmi atau menjadwalkan audiensi singkat via Zoom / tatap muka selama 15 menit?

Terima kasih banyak atas perhatian Bapak/Ibu. Sukses selalu untuk *{business_name}*! 🌟`,
  },
  {
    id: 'rec-as-2',
    category: 'after_school',
    categoryLabel: 'After School & Ekskul Worrie',
    title: 'Penawaran Kolaborasi ke Guru BK / Pembina Kesiswaan',
    badge: '🎯 Guru BK / Kesiswaan',
    description: 'Pendekatan persuasif ke Guru Bimbingan Konseling (BK) dan Koordinator Kesiswaan berfokus pada kesiapan masa depan dan kemandirian finansial siswa.',
    body: `Halo Bapak/Ibu Guru BK & Kesiswaan di *{business_name}*, salam kenal dari tim Worrie.id! 👋

Kami sangat mengapresiasi dedikasi Bapak/Ibu dalam mendidik siswa-siswi {business_name} di {address}.

Sebagai pendidik, tentu kita sering mendapati siswa yang bingung: *"Setelah lulus sekolah, skill apa yang benar-benar dicari industri dan bisa menghasilkan?"*

Untuk menjawab tantangan tersebut, Worrie.id membuka program ekstrakurikuler praktis:
💼 *After School Remote Work Accelerator (1 Term / 3 Bulan)*

Program ini membekali siswa dengan:
✅ Skill AI Tools & Produktivitas Digital
✅ Pembuatan Portofolio Online Standar Internasional
✅ Mindset & Simulasi Bekerja Remote Secara Global
✅ Bimbingan Intensif Rasio 1:5 (1 Mentor Praktisi : 5 Siswa)
✅ Output Pasti: Setiap pertemuan menghasilkan 1 project karya nyata!

Investasi sangat terjangkau bagi wali murid: *Rp 110.000 / anak / pertemuan* (sistem pembayaran per term 3 bulan / 12 sesi = Rp 1.320.000).

Boleh izin kami kirimkan silabus lengkap dan contoh karya portofolio siswa kami Bapak/Ibu? Terima kasih banyak! 😊`,
  },
  {
    id: 'rec-as-3',
    category: 'after_school',
    categoryLabel: 'After School & Ekskul Worrie',
    title: 'Format Penawaran ke Komite Sekolah & Wali Murid (Formula Rp 110rb/sesi)',
    badge: '👨‍👩‍👧 Komite & Wali Murid',
    description: 'Formula bahasa yang menyentuh hati orang tua: investasi terjangkau setara uang jajan, anak produktif di depan laptop, dan pulang membawa hasil karya.',
    body: `Kepada Bapak/Ibu Orang Tua & Wali Murid *{business_name}* yang terhormat, salam hangat dari tim Worrie.id. 👨‍👩‍👧✨

Apakah Bapak/Ibu ingin anak-anak tidak sekadar menghabiskan waktu bermain gadget tanpa arah, melainkan belajar keahlian bernilai tinggi yang siap dipakai berkarir global?

Worrie.id bekerjasama dengan {business_name} menghadirkan:
🚀 *Kelas Ekstrakurikuler After School: Remote Work & AI Skill Accelerator*

💡 *Kenapa Orang Tua Sangat Merekomendasikan Program Ini?*
• *Bukan Les Teori Biasa:* 100% praktik langsung. Setiap kali pulang kelas, anak membawa 1 hasil karya/project nyata yang bisa dipamerkan!
• *Kelas Kecil & Personal:* Maksimal 5 anak per 1 guru mentor (Rasio 1:5), memastikan setiap anak dibimbing sampai bisa.
• *Investasi Terjangkau:* Hanya *Rp 110.000 / pertemuan* (setara uang jajan harian anak).
• *Sistem Pembayaran 1 Term (3 Bulan / 12 Pertemuan):* *Rp 1.320.000 / anak* untuk komitmen tuntas 12 karya portofolio + pameran showcase akhir semester.

Pendaftaran kelas perdana dibatasi hanya untuk 3 kelompok (15 siswa pertama).

Apakah Bapak/Ibu berminat mengamankan slot kelas untuk ananda tercinta? Silakan balas pesan ini untuk info pendaftaran ya. Terima kasih! 🙏`,
  },
  {
    id: 'rec-as-4',
    category: 'after_school',
    categoryLabel: 'After School & Ekskul Worrie',
    title: 'Undangan Free Trial Session / Workshop 90 Menit di Lab Sekolah',
    badge: '🎁 Free Trial Workshop',
    description: 'Menawarkan workshop gratis 1 sesi di lab komputer sekolah sebagai pintu masuk pembuktian kualitas sebelum membuka pendaftaran reguler.',
    body: `Yth. Bapak/Ibu Pimpinan & Tim Kesiswaan *{business_name}*, salam hormat. 🙏

Sebagai perkenalan dan bukti nyata metode pembelajaran kami, Worrie.id ingin memberikan:
🎁 *Sesi Workshop Perdana Gratis (Free Trial Session - 90 Menit)*
Tema: *"Menghasilkan Karya Digital Pertama Menggunakan AI & Persiapan Karir Remote"*

Fasilitas gratis untuk {business_name}:
1. Mentor praktisi industri hadir langsung memandu siswa
2. Praktik langsung di lab komputer sekolah (90-120 menit)
3. Setiap siswa langsung memproduksi 1 karya digital nyata pada hari itu juga
4. Tanpa biaya operasional sepeserpun untuk pihak sekolah

Melalui sesi gratis ini, Bapak/Ibu guru dan siswa dapat melihat langsung bagaimana antusiasme siswa saat dibimbing dengan rasio 1:5.

Apakah memungkinkan kami jadwalkan sesi workshop perkenalan ini di sekolah {business_name} pada minggu depan? Terima kasih banyak Bapak/Ibu! 🚀`,
  },
  {
    id: 'rec-as-5',
    category: 'after_school',
    categoryLabel: 'After School & Ekskul Worrie',
    title: 'Penawaran Holiday Remote Camp (Camp Liburan 5 Hari - 5 Karya)',
    badge: '🏖️ Camp Liburan Produktif',
    description: 'Cocok ditawarkan menjelang libur semester agar waktu luang siswa diisi kegiatan produktif membuat 5 karya portofolio digital.',
    body: `Halo Bapak/Ibu di *{business_name}*, izin menyampaikan info program liburan bermanfaat! 🏖️🎉

Liburan semester seringkali membuat anak bosan atau terlalu banyak scrolling media sosial dan main game seharian.

Worrie.id menghadirkan program khusus libur sekolah:
⭐ *HOLIDAY REMOTE CAMP (5 Hari Intensif - 5 Karya Digital Nyata)*

🗓️ Jadwal: Senin s/d Jumat (2 jam/hari)
🎯 Target: Siswa SMP / SMA / SMK
💡 Rasio: 1 Mentor Praktisi Industri : 5 Siswa

Dalam 5 hari, siswa akan menciptakan 5 project nyata:
• Hari 1: Desain Grafis & Branding dengan AI Tools
• Hari 2: Pembuatan Website Portofolio Pribadi
• Hari 3: Video Editing & Storytelling Konten Digital
• Hari 4: Otomasi AI & Chatbot Interaktif
• Hari 5: Presentasi & Pameran Karya Akhir

💰 Biaya Investasi: *Rp 650.000 / anak* (sudah termasuk software kit, e-certificate resmi, dan 5 portofolio siap kerja).

Slot sangat terbatas karena 1 kelas hanya diisi 5 anak. Tertarik kami kirimkan brosur pendaftarannya kak? Terima kasih! 😊`,
  },
  {
    id: 'rec-as-6',
    category: 'after_school',
    categoryLabel: 'After School & Ekskul Worrie',
    title: 'Jalur Karir 1 Tahun Penuh (Full Year Career Pathway - 4 Terms)',
    badge: '🚀 Jalur Karir Unggulan',
    description: 'Menawarkan komitmen jangka panjang 1 tahun ajaran (48 pertemuan) dengan diskon khusus dan jaminan bimbingan karir freelance internasional.',
    body: `Selamat siang Bapak/Ibu di *{business_name}*, salam kenal dari tim Worrie.id. 🌟

Bagi siswa yang ingin benar-benar mandiri dan memiliki persiapan matang menembus pasar kerja global sebelum lulus sekolah, kami menyediakan program komprehensif:

🎓 *AFTER SCHOOL FULL YEAR CAREER PATHWAY (4 Terms / 1 Tahun)*

Program 48 pertemuan intensif (1 tahun ajaran) dengan kurikulum terpadu:
1. *Term 1:* Fondasi Digital & Penguasaan AI Tools Modern
2. *Term 2:* UI/UX Design & Web Builder Siap Kerja
3. *Term 3:* Manajemen Proyek Digital & Portofolio Internasional
4. *Term 4:* Simulasi Bekerja Remote di Pasar Global (Upwork, Fiverr & Komunitas Remote)

✨ *Benefit Eksklusif Paket 1 Tahun:*
• Rasio Emas 1 Mentor : 5 Siswa
• Menghasilkan total *48 Karya Portofolio Nyata*
• Website Portofolio Pribadi siswa aktif 1 tahun penuh
• 4x Pameran Showcase Karya per Kuartal
• Hemat investasi: *Rp 4.750.000 / tahun* (Hemat Rp 530.000 dibanding ambil per term)

Apakah kami boleh mengirimkan rincian kurikulum lengkap 1 tahun ini ke Bapak/Ibu? Terima kasih banyak! 🙏`,
  },

  // =========================================================================
  // 2. KEMITRAAN B2B SEKOLAH & AUDIENSI PIMPINAN (SCHOOL PARTNERSHIP)
  // =========================================================================
  {
    id: 'rec-part-1',
    category: 'school_partnership',
    categoryLabel: 'Kemitraan Kepala Sekolah & Komite',
    title: 'Surat Pengantar Pengiriman Proposal Kerjasama Digital Sekolah',
    badge: '📄 Pengantar Proposal',
    description: 'Pesan resmi dan sopan yang mendampingi pengiriman file PDF Proposal Kerjasama Kemitraan ke pihak sekolah.',
    body: `Yth. Bapak/Ibu Pimpinan & Tim Tata Usaha *{business_name}*, di tempat. 🙏

Semoga pesan ini menjumpai Bapak/Ibu dalam keadaan sehat dan penuh berkah.

Bersama pesan ini, izinkan kami dari *Worrie.id & Mudahkan.online* menyampaikan dokumen resmi:
📑 *Proposal Kerjasama Kemitraan Transformasi Digital & Ekstrakurikuler Sekolah*

Proposal ini mencakup opsi solusi modern yang dapat disesuaikan dengan kebutuhan {business_name}:
1. Program Ekstrakurikuler Persiapan Karir Remote Work (After School)
2. Pembuatan / Peremajaan Website Resmi & Sistem PPDB Online Terpadu
3. Aplikasi Absensi Guru & Staf Mobile (Geofencing GPS + Foto Selfie Validasi)
4. Paket Bundling Sekolah Digital dengan efisiensi investasi terbaik

Dokumen proposal resmi dalam format PDF telah kami siapkan. Apakah kami diperkenankan mengirimkan filenya ke nomor WhatsApp ini atau via email resmi sekolah?

Besar harapan kami dapat berkolaborasi memajukan ekosistem digital di *{business_name}*. Terima kasih banyak. 🌟`,
  },
  {
    id: 'rec-part-2',
    category: 'school_partnership',
    categoryLabel: 'Kemitraan Kepala Sekolah & Komite',
    title: 'Permohonan Jadwal Audiensi Singkat 15 Menit (Tatap Muka / Zoom)',
    badge: '🗓️ Jadwal Audiensi',
    description: 'Memohon izin waktu luang 15 menit pimpinan sekolah untuk berdiskusi santai mendengarkan kebutuhan digital sekolah.',
    body: `Selamat pagi/siang Bapak/Ibu Pimpinan *{business_name}*, salam hormat. 🙏

Melanjutkan komunikasi kami terkait program akselerasi digital dan kesiapan karir siswa di {business_name}, izinkan kami memohon waktu luang Bapak/Ibu sekitar 15 menit.

Kami sangat ingin bersilaturahmi sekaligus mempresentasikan secara singkat:
• Bagaimana program After School Worrie.id dapat dijalankan dengan *Biaya Setup Rp 0 bagi sekolah*
• Sistem bagi hasil kemitraan untuk kas sekolah / pembina
• Pratinjau sistem absensi mobile guru dan website PPDB terintegrasi

Kira-kira di antara hari Kamis atau Jumat ini, waktu manakah yang paling nyaman bagi Bapak/Ibu untuk kami jadwalkan audiensi (bisa tatap muka langsung di sekolah atau via Zoom singkat)?

Terima kasih banyak atas waktu dan kesempatan yang diberikan. Sukses selalu untuk *{business_name}*! 😊`,
  },
  {
    id: 'rec-part-3',
    category: 'school_partnership',
    categoryLabel: 'Kemitraan Kepala Sekolah & Komite',
    title: 'Undangan Menghadiri Pameran Karya Siswa (Showcase Day)',
    badge: '🏆 Showcase & Pameran',
    description: 'Mengundang pimpinan sekolah atau guru kesiswaan melihat karya nyata siswa agar semakin yakin dengan kualitas program.',
    body: `Kabar gembira untuk Bapak/Ibu di *{business_name}*! 🌟

Kami mengundang Bapak/Ibu Pimpinan dan perwakilan guru {business_name} untuk hadir dalam acara:
🎨 *Worrie.id Student Digital Showcase Day*

Dalam acara ini, Bapak/Ibu dapat menyaksikan langsung:
• Presentasi karya portofolio digital hasil karya siswa SMP & SMA
• Demonstrasi implementasi AI tools untuk kebutuhan kerja remote
• Testimoni langsung dari orang tua siswa dan guru pendamping sekolah

Acara ini diselenggarakan secara online/hybrid dan *Gratis* bagi perwakilan institusi pendidikan.

Bolehkah kami kirimkan e-invitation dan tautan akses acaranya untuk Bapak/Ibu? Semoga dapat memberikan inspirasi pengembangan siswa di *{business_name}*. Terima kasih! 🙏`,
  },

  // =========================================================================
  // 3. WEBSITE SEKOLAH & PPDB ONLINE (WEBSITE_PPDB)
  // =========================================================================
  {
    id: 'rec-web-1',
    category: 'website_ppdb',
    categoryLabel: 'Website & PPDB Online',
    title: 'Penawaran Website Sekolah Modern & Formulir PPDB Online Terpadu',
    badge: '🌐 Website & PPDB',
    description: 'Sangat cocok untuk sekolah yang belum memiliki website resmi berdomain .sch.id atau sistem pendaftaran siswa barunya masih manual via formulir kertas.',
    body: `Yth. Bapak/Ibu Pimpinan & Pengelola *{business_name}*, salam sejahtera. 🙏

Melihat reputasi {business_name} yang sangat baik di {address} ({rating} ⭐ dari {reviews_count} ulasan di Google), kehadiran portal online resmi yang profesional tentu akan semakin memperkuat kepercayaan calon wali murid.

Kami menyediakan layanan pembuatan *Website Sekolah Resmi & Sistem PPDB Online Terpadu*:
✅ Tampilan modern, elegan, dan cepat dibuka di smartphone
✅ Gratis Domain resmi (.sch.id / .com) & Cloud Hosting tahun pertama
✅ Sistem Formulir PPDB Online dengan upload berkas mandiri oleh orang tua
✅ Notifikasi pendaftaran langsung terhubung ke WhatsApp panitia PPDB
✅ Modul profil sekolah, berita kegiatan, guru, dan galeri prestasi

Biaya paket mulai dari *Rp 3.000.000 (Paket Basic)* hingga *Rp 5.500.000 (Paket Silver PPDB Online)*.

Apakah kami boleh kirimkan beberapa contoh website sekolah yang sudah kami kembangkan sebagai referensi? Terima kasih banyak Bapak/Ibu! 🏫✨`,
  },
  {
    id: 'rec-web-2',
    category: 'website_ppdb',
    categoryLabel: 'Website & PPDB Online',
    title: 'Solusi Upgrade & Peremajaan Website Sekolah yang Lambat / Jadul',
    badge: '⚡ Redesain Website',
    description: 'Pendekatan santun untuk sekolah yang sudah memiliki website lama namun tampilannya jadul, belum ramah HP, atau lambat dibuka.',
    body: `Selamat siang tim pengelola web & humas di *{business_name}*, salam kenal! ✨

Kami melihat profil {business_name} di Google Maps dan sempat mengunjungi website sekolah yang ada saat ini. Sekolah Bapak/Ibu memiliki reputasi yang sangat terpercaya di {address}.

Izin memberikan masukan teknis secara santun, kami melihat website sekolah saat ini memiliki potensi besar untuk di-upgrade:
• Desain diperbarui agar lebih modern dan ramah dibuka di smartphone para wali murid
• Kecepatan akses ditingkatkan agar tidak lemot saat musim pendaftaran PPDB
• Ditambahkan integrasi chat WhatsApp langsung ke admin pendaftaran

Kebetulan kami memiliki paket *Redesain Portal Sekolah Modern* dengan proses pengerjaan cepat dan pendampingan input data sampai tuntas.

Boleh izin kami kirimkan laporan audit performa singkat website sekolah secara gratis kak? Semoga bermanfaat untuk *{business_name}*! 😊`,
  },

  // =========================================================================
  // 4. ATTENDANCE & HRIS GURU MOBILE (ATTENDANCE_HRIS)
  // =========================================================================
  {
    id: 'rec-att-1',
    category: 'attendance_hris',
    categoryLabel: 'Absensi Guru & HRIS Mobile',
    title: 'Aplikasi Absensi Guru & Staf Berbasis Radius GPS & Foto Selfie',
    badge: '📱 Absensi Mobile Guru',
    description: 'Solusi modern menggantikan fingerprint kotor atau absensi manual, dengan validasi geofencing radius sekolah dan foto selfie hemat kuota.',
    body: `Yth. Bapak/Ibu Pimpinan Sekolah & Yayasan *{business_name}*, salam sukses selalu. 🙏

Apakah selama ini sekolah masih menggunakan mesin fingerprint yang sering error, antre panjang, atau rekap kehadiran bulanan guru dan staf masih dilakukan manual di Excel?

Kami menghadirkan solusi cerdas:
📲 *Teacher & Staff Attendance Mobile App + Web HRIS Panel*

Keunggulan sistem untuk *{business_name}*:
1. *Validasi Radius GPS (Geofencing):* Guru hanya bisa absen jika benar-benar berada di dalam area lingkungan sekolah.
2. *Validasi Foto Selfie Terkompresi:* Dilengkapi foto selfie otomatis yang sangat hemat kuota dan tidak membebani memori HP.
3. *Database Mandiri & Terisolasi:* Data kehadiran sekolah Bapak/Ibu tersimpan privat di server cloud mandiri.
4. *Rekap Otomatis Bulanan:* Laporan kehadiran, keterlambatan, dan jam kerja langsung ter-generate rapi dalam hitungan detik (format PDF / Excel).

Tersedia mulai dari Paket Basic (Rp 6.000.000) hingga Silver dengan Modul Cuti Online (Rp 10.000.000).

Bolehkah kami mendemokan aplikasi ini di HP Bapak/Ibu dalam waktu 5 menit? Terima kasih banyak. 🌟`,
  },
  {
    id: 'rec-att-2',
    category: 'attendance_hris',
    categoryLabel: 'Absensi Guru & HRIS Mobile',
    title: 'Manajemen Cuti & Izin Guru Online untuk Pimpinan Yayasan',
    badge: '📊 HRIS & Approval Cuti',
    description: 'Menawarkan modul pengajuan cuti, sakit, dan tugas luar sekolah secara digital langsung di smartphone kepala sekolah/yayasan.',
    body: `Selamat siang Bapak/Ibu Kepala Sekolah / Yayasan di *{business_name}*, salam hormat. 🙏

Pengelolaan izin dan cuti guru yang masih menggunakan lembaran kertas formulir seringkali tercecer dan sulit dipantau rekapitulasinya saat evaluasi bulanan.

Dengan modul *HRIS & Approval Cuti Online* dari sistem kami:
✅ Guru dapat mengajukan izin/cuti/sakit langsung dari aplikasi HP disertai foto surat dokter
✅ Kepala Sekolah menerima notifikasi instan dan dapat menyetujui (Approve / Reject) dengan 1 klik
✅ Sisa kuota cuti guru terhitung otomatis tanpa perlu hitung manual
✅ Riwayat terarsip aman dan dapat diekspor kapan saja untuk kebutuhan akreditasi

Fitur ini sudah terintegrasi langsung dengan absensi GPS guru.

Apakah Bapak/Ibu berkenan kami kirimkan video simulasi alur approval cutinya? Terima kasih atas kesempatannya. 😊`,
  },

  // =========================================================================
  // 5. PAKET BUNDLING SEKOLAH DIGITAL (BUNDLING)
  // =========================================================================
  {
    id: 'rec-bun-1',
    category: 'bundling',
    categoryLabel: 'Paket Bundling Digital',
    title: 'Paket Bundling Hemat Transformasi Sekolah Digital (Hemat s/d 2 Juta)',
    badge: '✨ Solusi Terpadu Hemat',
    description: 'Solusi all-in-one menggabungkan Website Resmi + PPDB Online + Aplikasi Absensi Mobile Guru dengan potongan investasi khusus.',
    body: `Yth. Bapak/Ibu Pengurus Yayasan & Kepala Sekolah *{business_name}*, di tempat. 🙏

Menghadapi era digitalisasi pendidikan 2026, sekolah yang memiliki ekosistem online terpadu akan memiliki daya saing jauh lebih tinggi di mata calon wali murid.

Kami menawarkan paket efisiensi investasi pendidikan:
📦 *PAKET BUNDLING SEKOLAH DIGITAL (Website + PPDB + Absensi Guru Mobile)*

Pilihan Paket Bundling Unggulan:
🌟 *Sekolah Digital Starter (Rp 8.500.000 - Hemat Rp 500rb)*
• Website Profil Sekolah Responsif + Domain & Hosting 1 Thn
• Aplikasi Absensi Mobile Guru (Check-in/out & Rekap Excel)

🔥 *Sekolah Digital Plus (Rp 14.500.000 - Hemat Rp 1.000.000) [Paling Diminati]*
• Website Silver (Sistem PPDB Online & Berita Sekolah)
• Mobile App Absensi Guru GPS Geofencing + Foto Selfie
• Modul Pengajuan & Approval Cuti / Izin Online
• Pelatihan intensif operator & guru sekolah

Satu vendor terpercaya, satu tagihan praktis, dan dukungan teknis prioritas sepanjang tahun.

Apakah berkenan kami kirimkan rincian perbandingan paket bundling ini untuk pertimbangan rapat yayasan? Terima kasih banyak Bapak/Ibu! 🏫🚀`,
  },

  // =========================================================================
  // 6. FOLLOW UP & FINALISASI AUDIENSI / MOU (FOLLOWUP)
  // =========================================================================
  {
    id: 'rec-fol-1',
    category: 'followup',
    categoryLabel: 'Follow Up & Audiensi',
    title: 'Follow-up Ramah Menanyakan Kelanjutan Review Proposal',
    badge: '🤝 Follow-Up Proposal',
    description: 'Pesan follow up yang sopan setelah proposal dikirimkan ke sekolah beberapa hari sebelumnya tanpa kesan mendesak.',
    body: `Halo Bapak/Ibu di *{business_name}*, salam hangat kembali dari tim Worrie.id. 🌟

Izin menyapa sebentar, semoga aktivitas di sekolah berjalan lancar hari ini.

Kami ingin menanyakan apakah dokumen proposal kemitraan yang kami kirimkan beberapa waktu lalu sudah sempat dipelajari oleh pimpinan atau tim yayasan {business_name}?

Kira-kira apakah ada poin yang membutuhkan penjelasan lebih mendalam atau simulasi khusus yang perlu kami sesuaikan dengan kebutuhan sekolah?

Bila ada pertanyaan atau butuh penyesuaian isi paket, kami sangat terbuka untuk berdiskusi. Terima kasih banyak Bapak/Ibu! 🙏`,
  },
  {
    id: 'rec-fol-2',
    category: 'followup',
    categoryLabel: 'Follow Up & Audiensi',
    title: 'Konfirmasi Penandatanganan Kerjasama Kemitraan (Draft MoU)',
    badge: '✍️ Konfirmasi MoU',
    description: 'Untuk prospek sekolah yang sudah memasuki tahap quotation / closing dan siap membuat kesepakatan kerjasama.',
    body: `Selamat siang Bapak/Ibu Pimpinan *{business_name}*, salam hormat. 🙏

Menindaklanjuti hasil diskusi positif kita sebelumnya mengenai program kerjasama kemitraan dengan Worrie.id, bersama ini kami sampaikan bahwa draft Surat Perjanjian Kerjasama (MoU) telah selesai kami siapkan.

Dalam dokumen MoU tersebut sudah tertera:
✅ Ruang lingkup pelaksanaan program & jadwal kelas
✅ Hak dan kewajiban masing-masing pihak secara transparan
✅ Skema pendampingan berkala dan laporan hasil belajar siswa

Kira-kira kapan waktu yang paling tepat bagi Bapak/Ibu untuk kami kirimkan dokumen finalnya agar dapat ditandatangani bersama?

Kami sangat antusias menyambut kolaborasi bersama *{business_name}*. Terima kasih banyak! 🤝✨`,
  },
  {
    id: 'rec-fol-3',
    category: 'followup',
    categoryLabel: 'Follow Up & Audiensi',
    title: 'Follow Up Cepat: Menanyakan Waktu Luang Singkat Telepon / Chat',
    badge: '⚡ Respon Cepat',
    description: 'Pesan singkat to-the-point jika kontak sekolah sibuk atau chat sebelumnya belum sempat dibalas.',
    body: `Halo Bapak/Ibu di *{business_name}*, salam santun. 🙏

Izin konfirmasi singkat, apakah hari ini Bapak/Ibu ada waktu senggang sekitar 3-5 menit untuk berdiskusi santai lewat WhatsApp atau telepon?

Kami ingin memastikan informasi terkait program kemitraan After School & transformasi digital sekolah sudah sampai dengan baik ke pimpinan {business_name}.

Jika sedang padat jadwal, mohon dikabari waktu yang pas ya Bapak/Ibu. Terima kasih banyak! 😊`,
  },
];

// =========================================================================
// AI GENERATOR ENGINE (CUSTOMIZABLE GENERATOR)
// =========================================================================
export interface AIGeneratorOptions {
  category: 
    | 'after_school' 
    | 'school_partnership' 
    | 'website_ppdb' 
    | 'attendance_hris' 
    | 'bundling' 
    | 'followup';
  tone: 'friendly' | 'professional' | 'direct' | 'urgent';
  industry: 'school' | 'vocational' | 'course' | 'general';
}

export function generateAITemplate(opts: AIGeneratorOptions): { title: string; body: string } {
  const { category, tone, industry } = opts;

  let title = 'Penawaran Program Sekolah - Worrie.id';
  let greeting = 'Halo Bapak/Ibu Pimpinan di *{business_name}*, salam kenal dari tim Worrie.id! 👋';
  let compliment = 'Kami sangat terkesan melihat dedikasi dan reputasi positif {business_name} dengan rating *{rating} ⭐* ({reviews_count} ulasan) di {address}.';
  let hook = 'Di era digital saat ini, memiliki program unggulan dan sistem digital yang rapi adalah kunci daya tarik sekolah.';
  let offer = 'Kami siap mendampingi sekolah dengan program siap kerja dan solusi digital terpadu.';
  let cta = 'Boleh izin kami kirimkan proposal lengkapnya untuk {business_name} Bapak/Ibu?';

  // Customize based on Tone
  if (tone === 'professional') {
    greeting = 'Yth. Bapak/Ibu Pimpinan & Pengelola *{business_name}*, salam hormat dari tim Worrie.id & Mudahkan.online.';
    compliment = 'Berdasarkan peninjauan kami, {business_name} memiliki track record pendidikan yang sangat kredibel dengan rating {rating} ⭐ di area {address}.';
    cta = 'Apakah kami dapat menjadwalkan audiensi singkat selama 15 menit via Zoom atau tatap muka pada waktu luang Bapak/Ibu?';
  } else if (tone === 'direct') {
    greeting = 'Halo Bapak/Ibu di *{business_name}*, izin to the point ya. 🙏';
    compliment = 'Prestasi dan ulasan sekolah Bapak/Ibu di {address} sangat luar biasa ({rating} ⭐ dari {reviews_count} ulasan).';
    cta = 'Jika berkenan, kami kirimkan rincian paket programnya ke chat ini. Terima kasih!';
  } else if (tone === 'urgent') {
    greeting = 'Kabar gembira khusus untuk civitas *{business_name}*! 🎉';
    compliment = 'Sebagai bentuk apresiasi atas reputasi unggul {business_name} ({rating} ⭐ di Google Maps), kami membuka kuota kemitraan khusus bulan ini.';
    cta = 'Kuota kemitraan perdana ini terbatas hanya untuk 3 sekolah di area {address}. Berminat amankan kuotanya sekarang Bapak/Ibu?';
  }

  // Customize based on Category
  if (category === 'after_school') {
    title = 'Penawaran After School Remote Work Accelerator';
    hook = 'Banyak siswa dan orang tua saat ini mencari kegiatan ekstrakurikuler yang langsung menghasilkan keahlian nyata dan bernilai global.';
    offer = 'Kami menghadirkan kelas *After School: Remote Work Accelerator* dengan rasio 1 mentor : 5 siswa. Setiap sesi siswa pulang membawa karya portofolio nyata, biaya terjangkau Rp 110.000/pertemuan, dan sistem bagi hasil untuk kas sekolah!';
  } else if (category === 'school_partnership') {
    title = 'Permohonan Kemitraan Resmi Institusi Pendidikan';
    hook = 'Kami ingin menjalin kerjasama resmi untuk membuka program ekstrakurikuler dan digitalisasi terpadu di sekolah Bapak/Ibu.';
    offer = 'Kemitraan ini tanpa biaya setup bagi sekolah (Rp 0), sekolah memfasilitasi lab komputer, sedangkan kurikulum industri, instruktur, dan showcase ditangani penuh oleh Worrie.id.';
  } else if (category === 'website_ppdb') {
    title = 'Website Sekolah Resmi & Sistem PPDB Online';
    hook = 'Website resmi yang modern dan sistem PPDB online yang terintegrasi WhatsApp akan mempermudah calon orang tua mendaftarkan anaknya.';
    offer = 'Kami buatkan Website Sekolah Resmi (.sch.id) berkecepatan tinggi dengan modul pendaftaran PPDB online, upload berkas mandiri, dan integrasi pengumuman digital.';
  } else if (category === 'attendance_hris') {
    title = 'Aplikasi Absensi Guru & HRIS Geofencing';
    hook = 'Pencatatan kehadiran guru dan staf yang masih manual atau mengandalkan fingerprint seringkali rawan manipulasi dan sulit direkap.';
    offer = 'Aplikasi mobile kami memvalidasi absensi berdasarkan radius GPS sekolah dan foto selfie otomatis hemat storage, lengkap dengan web approval cuti/izin online untuk kepala sekolah.';
  } else if (category === 'bundling') {
    title = 'Paket Bundling Transformasi Sekolah Digital';
    hook = 'Mendapatkan seluruh solusi digital dalam satu paket akan menghemat anggaran investasi yayasan secara signifikan.';
    offer = 'Paket bundling kami menggabungkan Website Portal PPDB + Aplikasi Mobile Absensi Guru dengan diskon hemat hingga Rp 2.000.000.';
  } else if (category === 'followup') {
    title = 'Follow Up Proposal & Jadwal Diskusi';
    hook = 'Izin menindaklanjuti dokumen proposal kemitraan yang telah kami sampaikan sebelumnya ke pihak {business_name}.';
    offer = 'Kami siap memaparkan konsep pelaksanaan atau menyesuaikan modul pembelajaran sesuai visi kurikulum sekolah Bapak/Ibu.';
    cta = 'Kira-kira kapan waktu yang paling luang bagi Bapak/Ibu untuk berdiskusi santai sejenak?';
  }

  const generatedBody = `${greeting}

${compliment}

${hook}

${offer}

${cta}

Terima kasih banyak atas perhatiannya dan sukses selalu untuk *{business_name}*!`;

  return {
    title,
    body: generatedBody,
  };
}
