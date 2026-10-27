'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Share2,
  X,
  MessageSquare,
  FileImage,
  Layers,
  Palette,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Building2,
  Send,
  Loader2,
  RefreshCw,
  Wand2,
  ImageIcon
} from 'lucide-react';
import { Lead } from '@/types/database';
import { getLogoBase64 } from '@/lib/pdfGenerator';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface PromotionalKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

type ProgramPreset = 'bootcamp' | 'seminar' | 'internship' | 'portfolio';
type AspectRatio = '1:1' | '9:16';
type ChannelTab = 'whatsapp' | 'instagram' | 'linkedin' | 'reels';
type ToneType = 'formal' | 'inspirational' | 'casual';

export default function PromotionalKitModal({
  isOpen,
  onClose,
  lead
}: PromotionalKitModalProps) {
  const [selectedProgram, setSelectedProgram] = useState<ProgramPreset>('bootcamp');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [activeChannel, setActiveChannel] = useState<ChannelTab>('whatsapp');
  const [activeTone, setActiveTone] = useState<ToneType>('inspirational');
  const [copied, setCopied] = useState(false);
  const [downloadingFlyer, setDownloadingFlyer] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // AI Visual Background State (100% Free Pollinations FLUX Engine)
  const [aiStyle, setAiStyle] = useState<string>('none');
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showCustomPromptInput, setShowCustomPromptInput] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      getLogoBase64().then((b64) => setLogoBase64(b64));
    }
  }, [isOpen]);

  // Program presets definition
  const presets = useMemo(() => {
    const schoolName = lead?.business_name || 'Mitra Institusi Pendidikan';

    return {
      bootcamp: {
        title: 'Bootcamp Kesiapan Kerja Remote & Digital Skills 2026',
        subtitle: 'Pelatihan Intensif Portofolio Global, Upwork & Freelance Internasional',
        tagline: 'EXCLUSIVE PARTNERSHIP PROGRAM',
        bullets: [
          'Kurikulum Karir Remote Work Terstandarisasi',
          'Optimasi Profil LinkedIn & Upwork Terverifikasi',
          'Sertifikat Kemitraan Industri Resmi Worrie.id',
          'Mentoring Praktisi Praktis & Portofolio Nyata'
        ],
        dates: 'Pendaftaran Angkatan Khusus Telah Dibuka',
        captionWA: {
          formal: `*UNDANGAN KEMITRAAN EDUKASI RESMI — WORRIE.ID*\n\nKepada Yth. Pimpinan & Bapak/Ibu Guru/Dosen *${schoolName}*,\n\nSalam hormat dari PT Working Remotely Indonesia (Worrie.id).\n\nSebagai bagian dari program akselerasi daya saing lulusan di era digital global, kami dengan bangga menghadirkan kolaborasi:\n\n*🚀 Program: Bootcamp Kesiapan Kerja Remote & Digital Skills 2026*\n\nProgram ini dirancang khusus untuk membekali siswa/mahasiswa ${schoolName} agar mampu menembus peluang karir internasional (remote work) dari rumah dengan standar industri global.\n\n*Keunggulan Program:*\n✅ Pembuatan portofolio digital siap kerja\n✅ Panduan akun platform internasional (Upwork/Fiverr)\n✅ Pendampingan langsung oleh mentor praktisi\n✅ Sertifikat kemitraan industri resmi\n\n📌 Terlampir kami sertakan flyer pengumuman resmi. Apakah berkenan kami jadwalkan sesi audiensi virtual 15 menit via Zoom minggu ini?\n\nTerima kasih atas perhatian dan dukungannya.\n\nSalam hangat,\n*Tim Kemitraan Strategis Worrie.id*\nWebsite: www.worrie.id | Email: halo@worrie.id`,
          inspirational: `*KABAR GEMBIRA UNTUK TALENTA MUDA ${schoolName.toUpperCase()}!* 🌟\n\nSiapa bilang kerja di perusahaan global harus merantau ke luar negeri? Sekarang saatnya generasi muda berkarya dari mana saja (Work from Anywhere)!\n\nWorrie.id berkolaborasi dengan *${schoolName}* mempersembahkan:\n🎯 *Bootcamp Kesiapan Kerja Remote & Digital Skills 2026*\n\n*Apa saja yang akan didapatkan?*\n✨ Cara mendapatkan penghasilan dollar pertama dari rumah\n✨ Trik membangun portofolio digital yang dilirik klien luar negeri\n✨ Rahasia optimasi profil LinkedIn & Upwork standar internasional\n✨ Sertifikat resmi pengakuan kompetensi industri\n\nYuk persiapkan karir masa depanmu dari sekarang! Flyer resmi terlampir yaa.\n\nInfo & Pendaftaran Kemitraan:\n📲 WhatsApp: 0812-3456-7890\n🌐 Website: www.worrie.id\n\n#WorrieID #RemoteWork #SMKBisa #KampusMerdeka #KarirGlobal`,
          casual: `Halo rekan-rekan di *${schoolName}*! 👋\n\nMau tahu rahasia lulus langsung bisa dapet gaji standar luar negeri tanpa harus keluar rumah? 🚀\n\nWorrie.id x ${schoolName} bakal ngadain:\n🔥 *Bootcamp Kesiapan Kerja Remote & Digital Skills!*\n\nDi sini kamu bakal belajar langsung cara:\n- Bangun portofolio digital profesional\n- Bikin profil Upwork & LinkedIn yang dilirik recruiter luar negeri\n- Mengasah skill digital freelance yang paling dicari tahun ini\n\nCek flyer terlampir buat info lengkapnya ya! Jangan sampai ketinggalan kuotanya 💻✨`
        },
        captionIG: `🚀 **OFFICIAL COLLABORATION: WORRIE.ID x ${schoolName.toUpperCase()}**\n\nMempersiapkan talenta muda Indonesia agar siap bersaing di kancah industri global! 🌏✨\n\nBersama ${schoolName}, Worrie.id mempersembahkan program akselerasi:\n📌 **Bootcamp Kesiapan Kerja Remote & Digital Skills 2026**\n\nMelalui program intensif ini, para siswa & mahasiswa akan dibimbing langkah demi langkah menguasai keahlian digital masa depan, membangun portofolio standar global, hingga membuka peluang karir remote internasional dari rumah.\n\nYuk raih impian karir tanpa batas geografis bersama Worrie.id!\n\nInformasi kemitraan & pendaftaran institusi:\n🌐 www.worrie.id\n📧 halo@worrie.id\n\n---\n#WorrieID #WorkingRemotely #KemitraanSekolah #SMKHebat #KampusMerdeka #DigitalSkills #RemoteWorkIndonesia #PendidikanVokasi #GenerasiEmas`,
        captionLinkedIn: `Kami dengan bangga mengumumkan inisiasi kolaborasi strategis antara PT Working Remotely Indonesia (Worrie.id) bersama ${schoolName}.\n\nDalam era ekonomi digital global, penguasaan remote work readiness bukan lagi sekadar alternatif, melainkan kompetensi esensial bagi lulusan pendidikan vokasi dan perguruan tinggi.\n\nMelalui program "Bootcamp Kesiapan Kerja Remote & Digital Skills 2026", kami menghadirkan kurikulum berbasis industri untuk menjembatani kesenjangan antara dunia pendidikan dengan kebutuhan pasar kerja remote internasional.\n\nApresiasi kami kepada segenap pimpinan dan civitas akademika ${schoolName} atas komitmen bersama memajukan talenta digital Indonesia.\n\n#EducationPartnership #FutureOfWork #RemoteWork #WorrieID #VocationalEducation #HigherEducation #DigitalReadiness`,
        captionReels: `[HOOK 0-3s]\n"Siswa & mahasiswa di ${schoolName} sekarang bisa kerja remote bergaji dollar dari rumah?!" 🤯\n\n[BODY 3-20s]\nYes, bener banget! Worrie.id resmi berkolaborasi bareng ${schoolName} buat ngadain Bootcamp Kesiapan Kerja Remote 2026! Di sini kamu bakal belajar langsung cara bikin portofolio digital, optimasi akun Upwork & LinkedIn, sampai tips interview klien luar negeri!\n\n[CTA 20-30s]\nSiap jadi talenta global berikutnya? Cek info lengkapnya di akun resmi sekolah atau klik link di bio Worrie.id sekarang! 🚀`
      },
      seminar: {
        title: 'Seminar Inspiratif: Peluang Karir Internasional dari Rumah',
        subtitle: 'Stadium General & Wawasan Peluang Kerja Remote untuk Generasi Muda',
        tagline: 'STADIUM GENERAL & MOTIVATIONAL TALK',
        bullets: [
          'Memahami Lanskap Pekerjaan Masa Depan (Future of Work)',
          'Peluang Penghasilan Valuta Asing Tanpa Pindah Kota',
          'Etika Kerja Remote, Manajemen Waktu, & Komunikasi Global',
          'Sesi Tanya Jawab Langsung Bersama Remote Worker Sukses'
        ],
        dates: 'Sesi Khusus 150+ Peserta',
        captionWA: {
          formal: `*UNDANGAN SEMINAR INSPIRATIF WORRIE.ID x ${schoolName.toUpperCase()}*\n\nBapak/Ibu Pimpinan & Tim Kesiswaan/Kemahasiswaan ${schoolName},\n\nSalam hangat dari Worrie.id.\n\nSebagai pengenalan awal wawasan kerja global, kami menawarkan sesi seminar inspiratif:\n\n*💡 "Peluang Karir Internasional dari Rumah: Langkah Awal Menjadi Remote Worker"* \n\nSesi ini berdurasi 2 jam (online/offline) yang sangat cocok untuk menginspirasi siswa/mahasiswa mengenai potensi karir digital di masa depan.\n\nFlyer terlampir. Kami siap berdiskusi untuk penyesuaian jadwal yang paling tepat bagi institusi Bapak/Ibu.\n\nTerima kasih,\nTim Kemitraan Worrie.id`,
          inspirational: `*Waktunya Buka Wawasan Karir Global! 🌍✨*\n\nWorrie.id hadir di ${schoolName} membawakan Seminar Inspiratif: *"Peluang Karir Internasional dari Rumah"*. Pelajari bagaimana talenta muda Indonesia bisa mendapatkan penghasilan dollar tanpa harus merantau! Flyer resmi terlampir ya.`,
          casual: `Siapa yang mau kerja santai di rumah tapi dapet gaji luar negeri? 💻✨ Ikuti Seminar Inspiratif bareng Worrie.id x ${schoolName}! Cek flyer terlampir yuk!`
        },
        captionIG: `✨ **SEMINAR INSPIRATIF: MEMBUKA GERBANG KARIR GLOBAL DARI RUMAH!** ✨\n\nWorrie.id hadir di ${schoolName} untuk berbagi wawasan dan peluang nyata di dunia kerja remote internasional!\n\nYuk ikuti sesi eksklusif ini dan jadilah bagian dari generasi digital Indonesia yang berdaya saing global.\n\n#WorrieID #SeminarKarir #FutureOfWork #RemoteJobs`,
        captionLinkedIn: `Mempersiapkan mindset generasi muda untuk berani melangkah ke ranah global. PT Working Remotely Indonesia bangga dapat menghadirkan Seminar Inspiratif bersama ${schoolName}.\n\n#CareerDevelopment #YouthEmpowerment #RemoteWork #WorrieID`,
        captionReels: `[HOOK]\n"Gimana caranya anak muda Indonesia bisa dapet klien luar negeri dari kamar tidur?"\n\n[BODY]\nTemukan jawabannya di Seminar Inspiratif Worrie.id x ${schoolName}!\n\n[CTA]\nTag teman satu kampusmu yang pengen kerja remote!`
      },
      internship: {
        title: 'Program Penyaluran Magang Virtual & Kemitraan Industri',
        subtitle: 'Praktik Kerja Lapangan (PKL) Digital Berstandar Standar Industri Modern',
        tagline: 'OFFICIAL INTERNSHIP & MOU PARTNERSHIP',
        bullets: [
          'Pengalaman Kerja Proyek Riil Lintas Industri',
          'Sertifikasi Magang Industri Resmi Terakreditasi',
          'Laporan Penilaian Kinerja Komprehensif untuk Sekolah/Kampus',
          'Peluang Rekrutmen Langsung untuk Talenta Terbaik'
        ],
        dates: 'Penyaluran Magang Semester Gasal/Genap',
        captionWA: {
          formal: `*PENAWARAN PROGRAM KEMITRAAN MAGANG (PKL) INDUSTRI WORRIE.ID*\n\nKepada Yth. Pimpinan BKK / Hubin / Career Center *${schoolName}*,\n\nWorrie.id membuka kuota kemitraan resmi untuk program Penyaluran Magang Virtual & Hybrid bagi siswa/mahasiswa Anda.\n\nInformasi rincian program terlampir pada flyer resmi. Kami siap menandatangani MoU kemitraan bersama.\n\nSalam,\nTim Kemitraan Worrie.id`,
          inspirational: `*KEMITRAAN RESMI MAGANG INDUSTRI: WORRIE.ID x ${schoolName.toUpperCase()}* 🚀\n\nPengalaman magang riil dengan standar industri digital modern kini hadir untuk siswa/mahasiswa ${schoolName}!`,
          casual: `Mau magang seru dengan proyek digital nyata bareng Worrie.id? Program Magang Resmi x ${schoolName} sudah dibuka!`
        },
        captionIG: `🤝 **PROGRAM KEMITRAAN MAGANG & PKL INDUSTRI: WORRIE.ID x ${schoolName.toUpperCase()}**\n\nMenghubungkan ruang kelas dengan dunia kerja nyata melalui magang digital berstandar industri modern.\n\n#MagangMerdeka #PKLVokasi #WorrieID`,
        captionLinkedIn: `Menjembatani dunia vokasi dan industri digital melalui Program Magang Terstruktur Worrie.id bersama ${schoolName}.\n\n#LinkAndMatch #VocationalEducation #Internship #WorrieID`,
        captionReels: `[HOOK]\n"Magang gak cuma fotokopi dokumen? Di sini tempatnya!"\n\n[BODY]\nProgram Magang Worrie.id x ${schoolName} kasih kamu pengalaman ngerjain proyek digital beneran!\n\n[CTA]\nKonsultasikan kebutuhan magang sekolahmu sekarang!`
      },
      portfolio: {
        title: 'Masterclass: Optimasi Profil LinkedIn & Upwork Global',
        subtitle: 'Workshop Praktikal Membangun Reputasi Digital yang Memikat Rekruter Internasional',
        tagline: 'HANDS-ON WORKSHOP & PORTFOLIO LAB',
        bullets: [
          'Review & Bedah Portofolio Digital Langsung',
          'Optimasi Algoritma Pencarian LinkedIn Recruiter',
          'Panduan Menulis Proposal Penawaran (Cover Letter) Bahasa Inggris',
          'Simulasi Negosiasi Rate Dollar dengan Klien Luar Negeri'
        ],
        dates: 'Hands-on Interactive Lab',
        captionWA: {
          formal: `*WORKSHOP EKSEKUTIF PORTOFOLIO DIGITAL WORRIE.ID x ${schoolName.toUpperCase()}*\n\nProgram pelatihan intensif optimasi reputasi digital siswa/mahasiswa agar siap dilirik rekruter global. Terlampir materi promosi resmi.`,
          inspirational: `*UBAH PROFIL DIGITALMU JADI MAGNET DOLLAR! 💼✨*\n\nMasterclass Portofolio LinkedIn & Upwork bareng Worrie.id x ${schoolName} siap dimulai!`,
          casual: `Bikin profil LinkedIn kamu diliat rekruter internasional yuk bareng Worrie.id x ${schoolName}!`
        },
        captionIG: `💼 **MASTERCLASS: OPTIMASI PROFIL DIGITAL STANDAR GLOBAL!**\n\nWorrie.id x ${schoolName} menghadirkan workshop praktikal bedah portofolio untuk karir internasional!\n\n#LinkedInTips #UpworkFreelancer #WorrieID`,
        captionLinkedIn: `Mempersiapkan portofolio digital yang kompetitif di pasar global bersama ${schoolName}.\n\n#PersonalBranding #LinkedInOptimization #WorrieID`,
        captionReels: `[HOOK]\n"Profil LinkedIn kamu masih sepi dilirik rekruter luar negeri?"\n\n[BODY]\nIkuti Masterclass Worrie.id x ${schoolName} buat bedah rahasia algoritma LinkedIn Recruiter!`
      }
    };
  }, [lead]);

  const currentPreset = presets[selectedProgram];
  const displayTitle = customTitle.trim() || currentPreset.title;
  const currentSchoolName = lead?.business_name || 'Mitra Institusi Pendidikan';

  // Get current active caption based on channel & tone
  const activeCaptionText = useMemo(() => {
    if (activeChannel === 'whatsapp') {
      return currentPreset.captionWA[activeTone];
    }
    if (activeChannel === 'instagram') {
      return currentPreset.captionIG;
    }
    if (activeChannel === 'linkedin') {
      return currentPreset.captionLinkedIn;
    }
    return currentPreset.captionReels;
  }, [currentPreset, activeChannel, activeTone]);

  // Handle Copy Caption
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(activeCaptionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Gagal menyalin teks ke clipboard.');
    }
  };

  // Handle Generate AI Background (100% Free Pollinations FLUX Engine)
  const handleGenerateAiBackground = async (styleKey: string, promptOverride?: string) => {
    if (styleKey === 'none') {
      setAiStyle('none');
      setAiImageUrl(null);
      setAiError(null);
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);
    setAiStyle(styleKey);

    try {
      const res = await fetch('/api/ai/generate-flyer-bg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          style: styleKey,
          prompt: promptOverride || customPrompt,
          aspectRatio,
          customSeed: Math.floor(Math.random() * 1000000)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghasilkan gambar');
      }

      setAiImageUrl(data.imageUrl);
      if (data.warning) {
        setAiError(data.warning);
      } else {
        setAiError(null);
      }
    } catch (err: any) {
      console.error('Error generating AI background:', err);
      setAiError(err.message || 'Koneksi ke AI generator gagal. Silakan coba lagi.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle Download Flyer via HTML5 Canvas
  const handleDownloadFlyer = async () => {
    setDownloadingFlyer(true);

    try {
      const canvas = hiddenCanvasRef.current;
      if (!canvas) return;

      const isSquare = aspectRatio === '1:1';
      const width = isSquare ? 1080 : 1080;
      const height = isSquare ? 1080 : 1920;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background Visual: Draw AI Image if active, or default Worrie gradient
      if (aiImageUrl) {
        const aiImg = new Image();
        aiImg.src = aiImageUrl;
        await new Promise((res) => {
          aiImg.onload = res;
          aiImg.onerror = res;
        });

        if (aiImg.complete && aiImg.naturalWidth > 0) {
          ctx.drawImage(aiImg, 0, 0, width, height);
        }

        // Apply dark navy gradient overlay so branding & typography pop out 100% crisp
        const overlay = ctx.createLinearGradient(0, 0, 0, height);
        overlay.addColorStop(0, 'rgba(0, 31, 59, 0.82)');
        overlay.addColorStop(0.35, 'rgba(0, 51, 94, 0.88)');
        overlay.addColorStop(1, 'rgba(0, 31, 59, 0.95)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Default Gradient (Worrie Navy to Dark Navy)
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#004a87');
        grad.addColorStop(0.65, '#00335e');
        grad.addColorStop(1, '#001f3b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle Background Grid Circles / Accents
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath();
        ctx.arc(width * 0.85, height * 0.15, 260, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(width * 0.1, height * 0.8, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Decorative Top Accent Line (Gold)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, width, 14);

      // 4. Logo Worrie.id (Top Left)
      const logoImg = new Image();
      if (logoBase64) {
        logoImg.src = logoBase64;
        await new Promise((res) => {
          logoImg.onload = res;
          logoImg.onerror = res;
        });
      }

      const logoX = 70;
      const logoY = 60;
      const logoSize = 100;

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } else {
        // Fallback logo circle
        ctx.fillStyle = '#004a87';
        ctx.beginPath();
        ctx.arc(logoX + 50, logoY + 50, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('WORRIE', logoX + 12, logoY + 58);
      }

      // Brand Title next to logo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('WORRIE.ID', logoX + logoSize + 25, logoY + 45);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('EDUCATION • DIGITAL SKILLS • CAREER READINESS', logoX + logoSize + 25, logoY + 75);

      // 5. Badge: "PARTNERSHIP COLLABORATION"
      const badgeY = logoY + 140;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(logoX, badgeY, 440, 42, 21);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`✨ ${currentPreset.tagline}`, logoX + 24, badgeY + 27);

      // 6. Partnership Line: Worrie.id X [School Name]
      const titleStartY = badgeY + 80;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px sans-serif';
      ctx.fillText('KOLABORASI RESMI BERSAMA:', logoX, titleStartY);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px sans-serif';
      // Truncate school name if too long
      const displaySchool = currentSchoolName.length > 36 ? currentSchoolName.slice(0, 36) + '...' : currentSchoolName;
      ctx.fillText(displaySchool, logoX, titleStartY + 55);

      // Separator Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(logoX, titleStartY + 80);
      ctx.lineTo(width - logoX, titleStartY + 80);
      ctx.stroke();

      // 7. Main Program Title
      const progTitleY = titleStartY + 135;
      ctx.fillStyle = '#facc15'; // bright gold
      ctx.font = '900 44px sans-serif';

      // Split title into 2 lines
      const words = displayTitle.split(' ');
      let line1 = '';
      let line2 = '';
      for (const w of words) {
        if ((line1 + w).length < 28) line1 += w + ' ';
        else line2 += w + ' ';
      }

      ctx.fillText(line1.trim(), logoX, progTitleY);
      if (line2.trim()) {
        ctx.fillText(line2.trim(), logoX, progTitleY + 54);
      }

      // Subtitle
      const subY = progTitleY + (line2.trim() ? 105 : 60);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 22px sans-serif';
      ctx.fillText(currentPreset.subtitle.slice(0, 68), logoX, subY);

      // 8. Key Highlights Box (Bullets)
      const boxY = subY + 45;
      const boxHeight = isSquare ? 230 : 380;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(logoX, boxY, width - logoX * 2, boxHeight, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('POIN KEUNGGULAN PROGRAM:', logoX + 30, boxY + 45);

      let bulletY = boxY + 85;
      currentPreset.bullets.forEach((bullet) => {
        // Gold Checkmark icon circle
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(logoX + 42, bulletY - 6, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('✓', logoX + 37, bulletY - 1);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 20px sans-serif';
        ctx.fillText(bullet, logoX + 70, bulletY);
        bulletY += isSquare ? 38 : 55;
      });

      // 9. Bottom Footer Bar (Call to Action & Contacts)
      const footerY = height - 120;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, footerY, width, 120);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, footerY, width, 4);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('PT WORKING REMOTELY INDONESIA', logoX, footerY + 50);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 18px sans-serif';
      ctx.fillText('🌐 www.worrie.id  •  📧 halo@worrie.id  •  📱 WhatsApp Kemitraan: 0812-3456-7890', logoX, footerY + 85);

      // Right side badge on footer
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('RESMI & TERSTANDARISASI', width - logoX, footerY + 68);
      ctx.textAlign = 'left';

      // 10. Generate Download Link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Flyer_Worrie_${currentSchoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedProgram}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating flyer image:', err);
      alert('Gagal membuat gambar flyer. Silakan coba kembali.');
    } finally {
      setDownloadingFlyer(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                  Marketing Kit &amp; Flyer Generator AI
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#004a87] text-[10px] font-extrabold">
                  Siap Share
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-lg mt-0.5">
                {lead.business_name} &bull; Materi Promosi Resmi PT Working Remotely Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns Grid) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* ========================================================= */}
          {/* LEFT COLUMN: FLYER PREVIEW & CONTROLS (7 Cols)             */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 p-5 sm:p-6 space-y-5 bg-slate-50/50 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Program Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#004a87]" />
                  Pilih Format Program Kemitraan
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProgram('bootcamp');
                      setCustomTitle('');
                    }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${selectedProgram === 'bootcamp'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    🚀 Bootcamp Remote Work
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProgram('seminar');
                      setCustomTitle('');
                    }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${selectedProgram === 'seminar'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    💡 Seminar Karir Global
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProgram('internship');
                      setCustomTitle('');
                    }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${selectedProgram === 'internship'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    🤝 Magang &amp; MoU Industri
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProgram('portfolio');
                      setCustomTitle('');
                    }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${selectedProgram === 'portfolio'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    💼 Masterclass LinkedIn/Upwork
                  </button>
                </div>
              </div>

              {/* Aspect Ratio Switcher */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  Rasio Flyer:
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-200 border border-slate-300/80">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${aspectRatio === '1:1' ? 'bg-[#004a87] text-white shadow-2xs' : 'text-slate-600'
                      }`}
                  >
                    1:1 Square (Feed &amp; WA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${aspectRatio === '9:16' ? 'bg-[#004a87] text-white shadow-2xs' : 'text-slate-600'
                      }`}
                  >
                    9:16 Story (IG &amp; WA Status)
                  </button>
                </div>
              </div>

              {/* ── AI Visual Background Studio (100% Free FLUX Engine) ── */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Latar Visual AI (Free FLUX Engine)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    100% Free
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleGenerateAiBackground('none')}
                    disabled={isGeneratingAi}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${aiStyle === 'none'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <span>🎨</span>
                    <span>Biru Polos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiBackground('modern_students')}
                    disabled={isGeneratingAi}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${aiStyle === 'modern_students'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <span>🎓</span>
                    <span>Siswa &amp; Laptop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiBackground('remote_workspace')}
                    disabled={isGeneratingAi}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${aiStyle === 'remote_workspace'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <span>💻</span>
                    <span>Workspace 3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiBackground('global_partnership')}
                    disabled={isGeneratingAi}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${aiStyle === 'global_partnership'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <span>🌐</span>
                    <span>Global Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiBackground('seminar_hall')}
                    disabled={isGeneratingAi}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${aiStyle === 'seminar_hall'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <span>🏛️</span>
                    <span>Panggung Karir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAiStyle('custom');
                      setShowCustomPromptInput(true);
                    }}
                    disabled={isGeneratingAi}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${aiStyle === 'custom'
                      ? 'bg-[#004a87] text-white border-[#004a87] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <span>✍️</span>
                    <span>Prompt Sendiri</span>
                  </button>
                </div>

                {/* Custom Prompt Input if chosen */}
                {aiStyle === 'custom' && (
                  <div className="pt-1 space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Contoh: futuristic vocational classroom with high tech hologram"
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerateAiBackground('custom', customPrompt)}
                        disabled={isGeneratingAi || !customPrompt.trim()}
                        className="px-3 py-2 rounded-xl bg-[#004a87] text-white font-bold text-xs hover:bg-[#003866] transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isGeneratingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        <span>Buat</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Controls when AI image is active */}
                {aiImageUrl && (
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px]">
                    <span className="text-amber-900 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                      Visual AI Berhasil Terpasang!
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiBackground(aiStyle)}
                      disabled={isGeneratingAi}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 text-amber-700 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                      <span>Acak Variasi Baru</span>
                    </button>
                  </div>
                )}

                {/* Error message if any */}
                {aiError && (
                  <p className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded-xl border border-red-200">
                    ⚠️ {aiError}
                  </p>
                )}
              </div>

              {/* Live Flyer Visual Card Preview */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-gradient-to-br from-[#004a87] via-[#00335e] to-[#001f3b] text-white p-6 space-y-4">
                {/* AI Visual Background Image (if active) */}
                {aiImageUrl && (
                  <img
                    src={aiImageUrl}
                    alt="AI Visual Background"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  />
                )}

                {/* Dark Navy Gradient Scrim Overlay for 100% Crisp Typography */}
                <div
                  className={`absolute inset-0 transition-colors duration-300 ${aiImageUrl
                    ? 'bg-gradient-to-t from-[#001f3b]/95 via-[#00335e]/85 to-[#004a87]/80'
                    : ''
                    }`}
                />

                {/* Loading Spinner Overlay when generating AI */}
                {isGeneratingAi && (
                  <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 animate-in fade-in duration-200">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <div>
                      <p className="text-xs font-black text-white tracking-tight">
                        Merender Gambar AI FLUX (Free)...
                      </p>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        Membuat komposisi visual 3D beresolusi tinggi untuk sekolah mitra.
                      </p>
                    </div>
                  </div>
                )}

                {/* Gold Top Accent */}
                <div className="relative z-10 -mx-6 -mt-6 mb-4 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

                {/* Top Header Letterhead in flyer */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo.png"
                      alt="Worrie Logo"
                      className="w-9 h-9 object-contain rounded-full bg-white/10 p-0.5 border border-white/20"
                    />
                    <div>
                      <span className="font-black text-sm tracking-tight block">WORRIE.ID</span>
                      <span className="text-[8px] font-bold text-amber-400 block tracking-wider">
                        EDUCATION &bull; DIGITAL SKILLS
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                    {currentPreset.tagline}
                  </span>
                </div>

                {/* School Name & Collaboration Callout */}
                <div className="relative z-10 space-y-0.5 pt-1 border-t border-white/10">
                  <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider block">
                    KOLABORASI RESMI BERSAMA:
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
                    {currentSchoolName}
                  </h4>
                </div>

                {/* Program Title Banner */}
                <div className="relative z-10 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1 shadow-inner">
                  <span className="text-sm sm:text-base font-black text-amber-300 block leading-tight drop-shadow-xs">
                    {displayTitle}
                  </span>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {currentPreset.subtitle}
                  </p>
                </div>

                {/* Highlights Bullets */}
                <div className="relative z-10 space-y-1.5 text-xs text-slate-100">
                  {currentPreset.bullets.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs">
                        ✓
                      </span>
                      <span className="font-medium text-slate-200 drop-shadow-xs">{b}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Footer inside flyer */}
                <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-300">
                  <span>PT Working Remotely Indonesia</span>
                  <span className="font-bold text-amber-400">www.worrie.id &bull; halo@worrie.id</span>
                </div>
              </div>
            </div>

            {/* Flyer Action Buttons */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleDownloadFlyer}
                disabled={downloadingFlyer}
                className="w-full py-3 px-4 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingFlyer ? 'Merender Gambar Resolusi Tinggi...' : 'Unduh Gambar Flyer (.PNG 1080px)'}
                </span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1.5 font-medium">
                Gambar resolusi tajam (1080px) siap dibagikan ke Instagram Feed, Story, &amp; WhatsApp Status.
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: SOCIAL MEDIA CAPTIONS GENERATOR (6 Cols)    */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 p-5 sm:p-6 space-y-4 flex flex-col justify-between overflow-y-auto bg-white">
            <div className="space-y-4">
              {/* Channel Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  Pilih Saluran Sosial Media
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveChannel('whatsapp')}
                    className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeChannel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannel('instagram')}
                    className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeChannel === 'instagram'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannel('linkedin')}
                    className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeChannel === 'linkedin'
                      ? 'bg-[#0077b5] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannel('reels')}
                    className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeChannel === 'reels'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    <span>Reels / TikTok</span>
                  </button>
                </div>
              </div>

              {/* Tone Switcher (For WhatsApp) */}
              {activeChannel === 'whatsapp' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-slate-600">Gaya Bahasa (Tone):</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTone('inspirational')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${activeTone === 'inspirational'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      🌟 Inspiratif
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTone('formal')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${activeTone === 'formal'
                        ? 'bg-blue-100 text-[#004a87] border border-blue-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      👔 Formal &amp; MoU
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTone('casual')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${activeTone === 'casual'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      👋 Santai / Siswa
                    </button>
                  </div>
                </div>
              )}

              {/* Editable Text Area for Caption */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Draft Teks Materi Promosi (Bisa Diedit):
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {activeCaptionText.length} karakter
                  </span>
                </div>
                <textarea
                  rows={13}
                  value={activeCaptionText}
                  readOnly
                  className="w-full text-xs p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] text-slate-800 leading-relaxed font-sans shadow-inner selection:bg-blue-100"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyCaption}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex-1 ${copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Salin Caption Teks</span>
                  </>
                )}
              </button>

              {lead.phone ? (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    activeCaptionText
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 flex-1 text-center"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim via WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200 cursor-not-allowed flex-1"
                >
                  <span>Nomor WA Belum Diisi</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Canvas for High-Resolution Flyer Rendering */}
        <canvas ref={hiddenCanvasRef} className="hidden" />
      </div>
    </div>
  );
}
