import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, Lead, QuotationItem } from '@/types/database';

// Format rupiah
export const formatIDR = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);
};

// Cache for base64 logo
let cachedLogoBase64: string | null = null;

export async function getLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch('/logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        cachedLogoBase64 = base64data;
        resolve(base64data);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not load logo for PDF:', err);
    return null;
  }
}

export interface GeneratedPdfResult {
  blob: Blob;
  url: string;
  filename: string;
}

/**
 * GENERATE PURE PDF: OFFICIAL QUOTATION / PENAWARAN WORRIE.ID
 */
export async function generateQuotationPdf(
  quote: Quotation & { lead?: Lead; items?: QuotationItem[] }
): Promise<GeneratedPdfResult> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoData = await getLogoBase64();

  // Top Accent Bar (Worrie Navy & Gold)
  doc.setFillColor(0, 74, 135); // #004a87
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(245, 158, 11); // #f59e0b
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // Header Letterhead
  let currentY = 11.5;

  if (logoData) {
    try {
      // Original logo is 1:1 aspect ratio (198x199 px), maintain perfect square
      doc.addImage(logoData, 'PNG', 14, currentY, 15, 15);
    } catch {
      // Fallback text if image fails
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 74, 135);
      doc.text('WORRIE.ID', 14, currentY + 9);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 74, 135);
    doc.text('WORRIE.ID', 14, currentY + 9);
  }

  // Company Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 74, 135);
  doc.text('PT WORKING REMOTELY INDONESIA', 33, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text('EDUCATION  •  DIGITAL SKILLS  •  CAREER READINESS & B2B SOLUTIONS', 33, currentY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SOHO Capital 19th Fl, Jakarta Barat  |  halo@worrie.id  |  www.worrie.id', 33, currentY + 12.5);

  // Divider Line
  currentY += 18;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // Document Title Banner
  currentY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('SURAT PENAWARAN RESMI', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Official Quotation & Investment Proposal', 14, currentY + 4.5);

  // Document Metadata Box (Right side)
  const metaBoxX = pageWidth - 80;
  const metaBoxY = currentY - 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(metaBoxX, metaBoxY, 66, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 74, 135);
  doc.text(`NO: ${quote.quote_number}`, metaBoxX + 4, metaBoxY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const quoteDate = quote.created_at
    ? new Date(quote.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })
    : new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' });
  doc.text(`Tanggal Terbit: ${quoteDate}`, metaBoxX + 4, metaBoxY + 9.5);

  const validUntilDate = quote.valid_until
    ? new Date(quote.valid_until).toLocaleDateString('id-ID', { dateStyle: 'medium' })
    : '30 Hari';
  doc.text(`Masa Berlaku: s/d ${validUntilDate}`, metaBoxX + 4, metaBoxY + 14);

  // Recipient Box
  currentY += 14;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DITUJUKAN KEPADA:', 18, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.lead?.business_name || 'Mitra Worrie.id', 18, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const leadAddress = quote.lead?.address || 'Indonesia';
  const leadPhone = quote.lead?.phone || quote.lead?.primary_phone || '-';
  doc.text(`Alamat: ${leadAddress}`, 18, currentY + 15);
  doc.text(`Kontak / Telp: ${leadPhone}`, 18, currentY + 19);

  // Program Title
  currentY += 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 74, 135);
  doc.text(`Program: ${quote.title}`, 14, currentY);

  // Items Table
  currentY += 3;
  const items = quote.items && quote.items.length > 0 ? quote.items : [];
  const tableRows = items.map((item, idx) => [
    (idx + 1).toString(),
    item.item_name + (item.description ? `\n${item.description}` : ''),
    item.qty.toString(),
    formatIDR(item.unit_price),
    formatIDR(item.total_price)
  ]);

  if (tableRows.length === 0) {
    tableRows.push(['1', quote.title, '1', formatIDR(quote.subtotal), formatIDR(quote.subtotal)]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['NO', 'DESKRIPSI LAYANAN / PROGRAM', 'QTY', 'HARGA SATUAN', 'TOTAL']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 74, 135],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 36, halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // Calculate final Y after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastAutoTableY = (doc as any).lastAutoTable?.finalY || currentY + 30;
  let summaryY = lastAutoTableY + 4;

  // Check if summary fits on page, else add page
  if (summaryY + 70 > pageHeight) {
    doc.addPage();
    summaryY = 20;
  }

  // Summary Financial Table on Right
  const summaryBoxWidth = 75;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, summaryY, summaryBoxWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryBoxX + 4, summaryY + 5.5);
  doc.text(formatIDR(quote.subtotal), summaryBoxX + summaryBoxWidth - 4, summaryY + 5.5, { align: 'right' });

  if (quote.discount > 0) {
    doc.setTextColor(16, 185, 129); // emerald
    doc.text('Diskon Mitra:', summaryBoxX + 4, summaryY + 10.5);
    doc.text(`- ${formatIDR(quote.discount)}`, summaryBoxX + summaryBoxWidth - 4, summaryY + 10.5, { align: 'right' });
  }

  if (quote.tax > 0) {
    doc.setTextColor(71, 85, 105);
    doc.text('PPN (11%):', summaryBoxX + 4, summaryY + 15.5);
    doc.text(`+ ${formatIDR(quote.tax)}`, summaryBoxX + summaryBoxWidth - 4, summaryY + 15.5, { align: 'right' });
  }

  // Total Kesepakatan Banner
  doc.setFillColor(0, 74, 135);
  doc.roundedRect(summaryBoxX, summaryY + 19, summaryBoxWidth, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL INVESTASI:', summaryBoxX + 4, summaryY + 25);
  doc.text(formatIDR(quote.grand_total), summaryBoxX + summaryBoxWidth - 4, summaryY + 25, { align: 'right' });

  // Terms & Conditions (Left side of summary)
  const termsWidth = summaryBoxX - 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 74, 135);
  doc.text('KETENTUAN PEMBAYARAN & KERJASAMA:', 14, summaryY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const defaultTerms =
    quote.terms_conditions ||
    '1. Pembayaran DP 50% saat penandatanganan kesepakatan dan 50% setelah program selesai.\n2. Pembayaran ditransfer ke rekening resmi: Bank Mandiri 123-00-9876543-2 a.n PT Working Remotely Indonesia.\n3. Dokumen penawaran ini berlaku resmi selama 30 hari kalender sejak tanggal penerbitan.';
  const splitTerms = doc.splitTextToSize(defaultTerms, termsWidth);
  doc.text(splitTerms, 14, summaryY + 8);

  // Signatures Section
  const signatureY = summaryY + 36;
  const colWidth = (pageWidth - 28) / 2;

  // Left Signature: Client
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Pihak Mitra / Klien,', 14 + colWidth / 2, signatureY, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('(Tanda Tangan & Stempel Resmi)', 14 + colWidth / 2, signatureY + 16, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.line(14 + 10, signatureY + 22, 14 + colWidth - 10, signatureY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.lead?.business_name || 'Pimpinan Lembaga', 14 + colWidth / 2, signatureY + 26, { align: 'center' });

  // Right Signature: Worrie.id
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Working Remotely Indonesia,', 14 + colWidth + colWidth / 2, signatureY, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 74, 135);
  doc.text('TIM KEMITRAAN WORRIE.ID', 14 + colWidth + colWidth / 2, signatureY + 16, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.line(14 + colWidth + 10, signatureY + 22, pageWidth - 24, signatureY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Director of Strategic Partnerships', 14 + colWidth + colWidth / 2, signatureY + 26, { align: 'center' });

  // Bottom Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Accent line at bottom
    doc.setFillColor(0, 74, 135);
    doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Dokumen ini sah dan diterbitkan secara digital oleh CRM Worrie.id  •  PT Working Remotely Indonesia',
      14,
      pageHeight - 6
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
  }

  const filename = `Penawaran_Worrie_${quote.quote_number}_${new Date().toISOString().slice(0, 10)}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  return { blob, url, filename };
}

/**
 * GENERATE PURE PDF: EXECUTIVE CRM & SALES BI REPORT WORRIE.ID
 */
export interface ReportPdfData {
  period: string;
  selectedPic: string;
  metrics: {
    totalLeads: number;
    closedRevenue: number;
    pipelineValue: number;
    winRate: number;
    avgDealSize: number;
    avgSalesCycle: number;
  };
  funnelStages: Array<{
    stage: string;
    count: number;
    value?: number;
    percentage?: number;
    conversionFromPrev: number;
  }>;
  attributionChannels: Array<{
    channel: string;
    leads: number;
    deals: number;
    revenue: number;
    winRate: number;
  }>;
  teamLeaderboard: Array<{
    name: string;
    role: string;
    assigned: number;
    closed: number;
    revenue: number;
    winRate: number;
  }>;
}

export async function generateReportPdf(data: ReportPdfData): Promise<GeneratedPdfResult> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoData = await getLogoBase64();

  // Top Accent Bar (Worrie Navy & Gold)
  doc.setFillColor(0, 74, 135); // #004a87
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(245, 158, 11); // #f59e0b
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // Header Letterhead
  let currentY = 11.5;

  if (logoData) {
    try {
      // Original logo is 1:1 aspect ratio (198x199 px), maintain perfect square
      doc.addImage(logoData, 'PNG', 14, currentY, 15, 15);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 74, 135);
      doc.text('WORRIE.ID', 14, currentY + 9);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 74, 135);
    doc.text('WORRIE.ID', 14, currentY + 9);
  }

  // Company Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 74, 135);
  doc.text('PT WORKING REMOTELY INDONESIA', 33, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6);
  doc.text('EXECUTIVE BUSINESS INTELLIGENCE & CRM PERFORMANCE REPORT', 33, currentY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SOHO Capital 19th Fl, Jakarta Barat  |  Laporan Resmi Terintegrasi  |  www.worrie.id', 33, currentY + 12.5);

  // Divider Line
  currentY += 18;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // Document Title & Filter Meta
  currentY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('LAPORAN EKSEKUTIF ANALITIK & SALES CRM', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const nowStr = new Date().toLocaleDateString('id-ID', {
    dateStyle: 'full'
  });
  doc.text(`Waktu Unduh: ${nowStr}  |  Periode: ${data.period.toUpperCase()}  |  PIC: ${data.selectedPic}`, 14, currentY + 4.5);

  // SECTION 1: 5 EXECUTIVE KPI CARDS (Table Grid)
  currentY += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 74, 135);
  doc.text('1. RINGKASAN METRIK KINERJA UTAMA (EXECUTIVE KPI)', 14, currentY);

  currentY += 3;
  const kpiTableData = [
    [
      'Total Prospek / Leads',
      `${data.metrics.totalLeads} Bisnis`,
      'Pipeline Aktif',
      formatIDR(data.metrics.pipelineValue)
    ],
    [
      'Total Omset Closing',
      formatIDR(data.metrics.closedRevenue),
      'Win Rate Konversi',
      `${data.metrics.winRate}%`
    ],
    [
      'Rata-rata Nilai Kontrak',
      formatIDR(data.metrics.avgDealSize),
      'Siklus Rata-rata Closing',
      `${data.metrics.avgSalesCycle} Hari`
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['METRIK', 'NILAI PENCAPAIAN', 'METRIK', 'NILAI PENCAPAIAN']],
    body: kpiTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 74, 135],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 45 },
      1: { fontStyle: 'bold', textColor: [0, 74, 135], cellWidth: 46 },
      2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 45 },
      3: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 46 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // SECTION 2: SALES FUNNEL CONVERSION
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable?.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 74, 135);
  doc.text('2. ANALISIS CORONG KONVERSI (SALES FUNNEL 360°)', 14, currentY);

  currentY += 3;
  const funnelRows = data.funnelStages.map((st) => [
    st.stage,
    `${st.count} Leads`,
    st.value !== undefined ? formatIDR(st.value) : `${st.percentage ?? st.conversionFromPrev}% dari Total`,
    `${st.conversionFromPrev}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['TAHAPAN PIPELINE', 'JUMLAH PROSPEK', 'PERSENTASE / POTENSI', 'RASIO KONVERSI']],
    body: funnelRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center', fontStyle: 'bold', textColor: [0, 74, 135] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // SECTION 3: ATRIBUSI SALURAN PROSPEK
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable?.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 74, 135);
  doc.text('3. ATRIBUSI SUMBER PROSPEK & EFISIENSI CHANNEL', 14, currentY);

  currentY += 3;
  const attributionRows = data.attributionChannels.map((ch) => [
    ch.channel,
    ch.leads.toString(),
    ch.deals.toString(),
    formatIDR(ch.revenue),
    `${ch.winRate}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['SALURAN PEMASARAN', 'LEADS MASUK', 'DEAL WON', 'TOTAL PENDAPATAN', 'WIN RATE']],
    body: attributionRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 74, 135],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // SECTION 4: LEADERBOARD TIM SALES
  // Check if page break needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable?.finalY + 7;
  if (currentY + 50 > pageHeight) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 74, 135);
  doc.text('4. PRODUKTIVITAS & LEADERBOARD TIM SALES', 14, currentY);

  currentY += 3;
  const teamRows = data.teamLeaderboard.map((m) => [
    m.name,
    m.role,
    `${m.assigned} Leads`,
    `${m.closed} Deal`,
    formatIDR(m.revenue),
    `${m.winRate}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['NAMA ANGGOTA', 'ROLE / POSISI', 'ASSIGNED', 'CLOSING', 'TOTAL REVENUE', 'WIN RATE']],
    body: teamRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { textColor: [100, 116, 139] },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right', fontStyle: 'bold', textColor: [0, 74, 135] },
      5: { halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // Bottom Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Accent line at bottom
    doc.setFillColor(0, 74, 135);
    doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Dokumen Rahasia & Hak Cipta © PT Working Remotely Indonesia  •  CRM Worrie.id',
      14,
      pageHeight - 6
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
  }

  const filename = `Laporan_Eksekutif_CRM_Worrie_${new Date().toISOString().slice(0, 10)}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  return { blob, url, filename };
}
