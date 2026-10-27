'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight,
  Save, 
  Trash2, 
  MessageSquare, 
  Globe, 
  MapPin, 
  Phone, 
  ExternalLink, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Send, 
  Loader2, 
  Sparkles,
  Flame,
  Users,
  UserPlus,
  Plus,
  Calendar,
  Clock,
  PhoneCall,
  Video,
  FileSpreadsheet,
  Check,
  X,
  Edit2,
  Mail,
  ShieldCheck,
  CheckSquare,
  Square,
  Briefcase,
  Link2,
  UserCheck,
  AlertCircle,
  CalendarClock,
  FolderOpen
} from 'lucide-react';
import { DataStore } from '@/lib/dataStore';
import { 
  Lead, 
  LeadStatus, 
  LeadContact, 
  Quotation, 
  QuotationItem, 
  LeadActivity, 
  LeadTask, 
  MessageTemplate,
  ContactRole,
  QuotationStatus,
  UserProfile
} from '@/types/database';
import { calculateProspectScore, getProspectScoreBadge } from '@/lib/score';
import { useAuth } from '@/lib/authContext';
import { SearchablePicSelect } from '@/components/SearchableSelect';
import PdfPreviewModal from '@/components/PdfPreviewModal';
import { generateQuotationPdf } from '@/lib/pdfGenerator';
import PromotionalKitModal from '@/components/PromotionalKitModal';

function LeadDetailContent() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { profile } = useAuth();
  const actorName = profile?.full_name || 'Tim Worrie';

  const [lead, setLead] = useState<Lead | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active main tab
  const [mainTab, setMainTab] = useState<'timeline' | 'contacts' | 'quotations' | 'details'>('timeline');

  const [status, setStatus] = useState<LeadStatus>('Belum dihubungi');
  const [dealValue, setDealValue] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // 1. Sales Assignment (PIC Marketing)
  const [assignedTo, setAssignedTo] = useState<string>('');

  // 2. Lost Reason (Alasan Ditolak)
  const [lostReason, setLostReason] = useState<string>('');
  const [isLostReasonModalOpen, setIsLostReasonModalOpen] = useState(false);
  const [selectedLostReason, setSelectedLostReason] = useState('Kemahalan / Anggaran Tidak Tersedia');
  const [customLostReason, setCustomLostReason] = useState('');

  // 3. Next Action & Reminder Follow-Up
  const [nextActionAt, setNextActionAt] = useState<string>('');
  const [nextActionNotes, setNextActionNotes] = useState<string>('');
  const [isNextActionModalOpen, setIsNextActionModalOpen] = useState(false);
  const [tempNextDate, setTempNextDate] = useState('');
  const [tempNextNotes, setTempNextNotes] = useState('');

  // 4. Dokumen & Proposal Links
  const [documentLinks, setDocumentLinks] = useState<Array<{ id: string; title: string; url: string; category?: string }>>([]);
  const [isDocLinkModalOpen, setIsDocLinkModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docCategory, setDocCategory] = useState('Google Drive MoU');

  // 5. Promotional Kit & Flyer Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Timeline Quick Log Form
  const [logType, setLogType] = useState<'note' | 'call' | 'meeting' | 'whatsapp'>('note');
  const [logTitle, setLogTitle] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // Add Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState<ContactRole>('Owner');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);
  const [contactNotes, setContactNotes] = useState('');

  // Add Quotation Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState('Paket Kemitraan Seminar & Workshop Karir Remote Work 2026');
  const [quoteValidUntil, setQuoteValidUntil] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );
  const [quoteTerms, setQuoteTerms] = useState(
    'DP 50% setelah penandatanganan MOU kemitraan, sisa 50% H-3 pelaksanaan workshop.'
  );
  const [quoteNotes, setQuoteNotes] = useState(
    'Termasuk sertifikat resmi Worrie.id, modul materi PDF, dan akses LMS 6 bulan untuk seluruh peserta.'
  );
  const [quoteItems, setQuoteItems] = useState<Array<{ item_name: string; description: string; qty: number; unit_price: number }>>([
    {
      item_name: 'Workshop Intensive: Remote Work Readiness for Vocational Students',
      description: 'Pelatihan 2 hari offline/hybrid: LinkedIn profile, Upwork/Fiverr setup, portfolio digital',
      qty: 1,
      unit_price: 5000000,
    },
    {
      item_name: 'Seminar Inspiratif: Peluang Kerja Global dari Rumah',
      description: 'Sesi stadium general untuk 150 siswa & orang tua murid',
      qty: 1,
      unit_price: 3500000,
    },
  ]);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(1000000);

  // Pure PDF Preview State
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    isOpen: boolean;
    url: string | null;
    filename: string;
    title: string;
    subtitle: string;
    loading: boolean;
  }>({
    isOpen: false,
    url: null,
    filename: '',
    title: '',
    subtitle: '',
    loading: false
  });

  const handleOpenPdfPreview = async (quote: Quotation) => {
    setPdfPreviewData({
      isOpen: true,
      url: null,
      filename: `Penawaran_Worrie_${quote.quote_number}.pdf`,
      title: `Surat Penawaran Resmi - ${quote.quote_number}`,
      subtitle: `${lead?.business_name || 'Mitra Worrie.id'} • ${quote.title}`,
      loading: true
    });

    try {
      const res = await generateQuotationPdf({
        ...quote,
        lead: lead || undefined
      });
      setPdfPreviewData({
        isOpen: true,
        url: res.url,
        filename: res.filename,
        title: `Surat Penawaran Resmi - ${quote.quote_number}`,
        subtitle: `${lead?.business_name || 'Mitra Worrie.id'} • ${quote.title}`,
        loading: false
      });
    } catch (err) {
      console.error('Failed to generate pure PDF quotation:', err);
      setPdfPreviewData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleClosePdfPreview = () => {
    if (pdfPreviewData.url) {
      URL.revokeObjectURL(pdfPreviewData.url);
    }
    setPdfPreviewData({
      isOpen: false,
      url: null,
      filename: '',
      title: '',
      subtitle: '',
      loading: false
    });
  };

  // Add Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );

  // WhatsApp Message Composer
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sendingGateway, setSendingGateway] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [leadData, contactsData, quotesData, actsData, tasksData, tmplsData, membersData] = await Promise.all([
          DataStore.getLeadById(leadId),
          DataStore.getLeadContacts(leadId),
          DataStore.getQuotations(leadId),
          DataStore.getLeadActivities(leadId),
          DataStore.getLeadTasks(leadId),
          DataStore.getTemplates(),
          DataStore.getTeamMembers(),
        ]);

        if (leadData) {
          setLead(leadData);
          setStatus(leadData.status);
          setDealValue(Number(leadData.deal_value) || 0);
          setNotes(leadData.notes || '');
          setAssignedTo(leadData.assigned_to || '');
          setLostReason(leadData.lost_reason || '');
          setNextActionAt(leadData.next_action_at || '');
          setNextActionNotes(leadData.next_action_notes || '');
          setDocumentLinks(leadData.document_links || []);

          if (tmplsData.length > 0) {
            setTemplates(tmplsData);
            setSelectedTemplateId(tmplsData[0].id);
            const generated = tmplsData[0].body
              .replace(/{business_name}/g, leadData.business_name)
              .replace(/{rating}/g, String(leadData.rating || ''))
              .replace(/{reviews_count}/g, String(leadData.reviews_count || ''))
              .replace(/{address}/g, leadData.address || '');
            setCustomMessage(generated);
          }
        }
        setContacts(contactsData);
        setQuotations(quotesData);
        setActivities(actsData);
        setTasks(tasksData);
        setTeamMembers(membersData);
      } catch (err) {
        console.error('Failed to load lead details', err);
      } finally {
        setLoading(false);
      }
    }
    if (leadId) {
      loadData();
    }
  }, [leadId]);

  const reloadLeadData = async () => {
    const [leadData, contactsData, quotesData, actsData, tasksData, membersData] = await Promise.all([
      DataStore.getLeadById(leadId),
      DataStore.getLeadContacts(leadId),
      DataStore.getQuotations(leadId),
      DataStore.getLeadActivities(leadId),
      DataStore.getLeadTasks(leadId),
      DataStore.getTeamMembers(),
    ]);
    if (leadData) {
      setLead(leadData);
      setStatus(leadData.status);
      setDealValue(Number(leadData.deal_value) || 0);
      setNotes(leadData.notes || '');
      setAssignedTo(leadData.assigned_to || '');
      setLostReason(leadData.lost_reason || '');
      setNextActionAt(leadData.next_action_at || '');
      setNextActionNotes(leadData.next_action_notes || '');
      setDocumentLinks(leadData.document_links || []);
    }
    setContacts(contactsData);
    setQuotations(quotesData);
    setActivities(actsData);
    setTasks(tasksData);
    setTeamMembers(membersData);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl && lead) {
      const generated = tmpl.body
        .replace(/{business_name}/g, lead.business_name)
        .replace(/{rating}/g, String(lead.rating || ''))
        .replace(/{reviews_count}/g, String(lead.reviews_count || ''))
        .replace(/{address}/g, lead.address || '');
      setCustomMessage(generated);
    }
  };

  // Save Lead Status & Deal Value
  const handleSaveLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lead) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const isStatusChanged = status !== lead.status;
      const isDealChanged = Number(dealValue) !== Number(lead.deal_value);

      const updated = await DataStore.updateLead(lead.id, {
        status,
        deal_value: Number(dealValue),
        notes,
      });

      if (updated) {
        setLead(updated);
        setSaveSuccess(true);

        if (isStatusChanged) {
          await DataStore.createLeadActivity({
            lead_id: lead.id,
            activity_type: 'stage_changed',
            title: `Tahap Pipeline Berubah: ${lead.status} → ${status}`,
            description: `Status deal institusi berhasil dialihkan ke ${status}.`,
            actor_name: actorName,
          });
        }

        if (isDealChanged) {
          await DataStore.createLeadActivity({
            lead_id: lead.id,
            activity_type: 'deal_value_changed',
            title: `Nilai Deal Diperbarui: Rp ${Number(dealValue).toLocaleString('id-ID')}`,
            description: `Estimasi nilai kemitraan diperbarui oleh ${actorName}.`,
            actor_name: actorName,
          });
        }

        await reloadLeadData();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Gagal menyimpan perubahan prospek.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    if (confirm(`Yakin ingin menghapus prospek "${lead.business_name}"?`)) {
      await DataStore.deleteLead(lead.id);
      router.push('/crm');
    }
  };

  // Submit Quick Timeline Log
  const handleCreateActivityLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !logTitle.trim()) return;
    setIsSubmittingLog(true);

    try {
      let actType: any = 'note_created';
      if (logType === 'call') actType = 'phone_call';
      if (logType === 'meeting') actType = 'meeting';
      if (logType === 'whatsapp') actType = 'whatsapp_sent';

      await DataStore.createLeadActivity({
        lead_id: lead.id,
        activity_type: actType,
        title: logTitle.trim(),
        description: logDescription.trim() || null,
        actor_name: actorName,
      });

      setLogTitle('');
      setLogDescription('');
      await reloadLeadData();
    } catch (err) {
      alert('Gagal mencatat aktivitas.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Handle PIC Assignment
  const handleUpdateAssignee = async (newPic: string) => {
    if (!lead) return;
    setAssignedTo(newPic);
    await DataStore.updateLead(lead.id, { assigned_to: newPic });
    await DataStore.createLeadActivity({
      lead_id: lead.id,
      activity_type: 'note_created',
      title: `Penugasan PIC: ${newPic || 'Belum Ditugaskan'}`,
      description: `Prospek kemitraan ini ditugaskan kepada ${newPic || 'belum ada PIC'}.`,
      actor_name: actorName,
    });
    await reloadLeadData();
  };

  // Handle Lost Reason
  const handleConfirmLostReason = async () => {
    if (!lead) return;
    const finalReason = selectedLostReason === 'Lainnya' && customLostReason.trim()
      ? customLostReason.trim()
      : selectedLostReason;

    setStatus('Ditolak');
    setLostReason(finalReason);
    await DataStore.updateLead(lead.id, {
      status: 'Ditolak',
      lost_reason: finalReason,
    });
    await DataStore.createLeadActivity({
      lead_id: lead.id,
      activity_type: 'stage_changed',
      title: 'Status Dialihkan: Ditolak / Batal',
      description: `Alasan penolakan: ${finalReason}`,
      actor_name: actorName,
    });
    setIsLostReasonModalOpen(false);
    setCustomLostReason('');
    await reloadLeadData();
  };

  // Handle Next Action / Follow-Up Appointment
  const handleSaveNextAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !tempNextDate) return;

    setNextActionAt(tempNextDate);
    setNextActionNotes(tempNextNotes);
    await DataStore.updateLead(lead.id, {
      next_action_at: tempNextDate,
      next_action_notes: tempNextNotes,
    });

    await DataStore.createLeadTask({
      lead_id: lead.id,
      title: tempNextNotes.trim() || `Janji Follow-Up dengan ${lead.business_name}`,
      due_date: tempNextDate,
      is_completed: false,
    }, actorName);

    setIsNextActionModalOpen(false);
    setTempNextNotes('');
    await reloadLeadData();
  };

  // Handle Document Link Addition
  const handleAddDocLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !docTitle.trim() || !docUrl.trim()) return;

    let validUrl = docUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const newLink = {
      id: 'doc-' + Date.now(),
      title: docTitle.trim(),
      url: validUrl,
      category: docCategory,
    };

    const updated = [...documentLinks, newLink];
    setDocumentLinks(updated);
    await DataStore.updateLead(lead.id, { document_links: updated });

    await DataStore.createLeadActivity({
      lead_id: lead.id,
      activity_type: 'note_created',
      title: `Tautan Dokumen Ditambahkan: ${docTitle}`,
      description: `Kategori: ${docCategory} (${validUrl})`,
      actor_name: actorName,
    });

    setDocTitle('');
    setDocUrl('');
    setIsDocLinkModalOpen(false);
    await reloadLeadData();
  };

  // Handle Document Link Delete
  const handleDeleteDocLink = async (linkId: string) => {
    if (!lead || !confirm('Hapus tautan dokumen ini?')) return;
    const updated = documentLinks.filter(d => d.id !== linkId);
    setDocumentLinks(updated);
    await DataStore.updateLead(lead.id, { document_links: updated });
    await reloadLeadData();
  };

  // Submit New Contact
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !contactName.trim() || !contactPhone.trim()) {
      alert('Nama kontak dan nomor telepon wajib diisi.');
      return;
    }

    try {
      await DataStore.createLeadContact({
        lead_id: lead.id,
        name: contactName.trim(),
        role: contactRole,
        phone: contactPhone.trim(),
        email: contactEmail.trim() || null,
        is_primary: contactIsPrimary,
        notes: contactNotes.trim() || null,
      }, actorName);

      setIsContactModalOpen(false);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactNotes('');
      setContactIsPrimary(false);
      await reloadLeadData();
    } catch (err) {
      alert('Gagal menambahkan kontak baru.');
    }
  };

  // Delete Contact
  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Yakin ingin menghapus kontak ini?')) {
      await DataStore.deleteLeadContact(contactId);
      await reloadLeadData();
    }
  };

  // Create Quotation
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !quoteTitle.trim() || quoteItems.length === 0) {
      alert('Judul quotation dan minimal 1 rincian item wajib diisi.');
      return;
    }

    const subtotal = quoteItems.reduce((acc, curr) => acc + (curr.qty * curr.unit_price), 0);
    const discount = Number(quoteDiscount) || 0;
    const grand_total = Math.max(0, subtotal - discount);

    try {
      await DataStore.createQuotation(
        {
          lead_id: lead.id,
          title: quoteTitle.trim(),
          status: 'sent',
          subtotal,
          discount,
          tax: 0,
          grand_total,
          valid_until: quoteValidUntil,
          terms_conditions: quoteTerms,
          notes: quoteNotes,
          quote_number: '',
        },
        quoteItems.map((item) => ({
          ...item,
          total_price: item.qty * item.unit_price,
        })),
        actorName
      );

      setIsQuoteModalOpen(false);
      await reloadLeadData();
    } catch (err) {
      alert('Gagal menerbitkan quotation.');
    }
  };

  // Update Quotation Status
  const handleQuotationStatusChange = async (quoteId: string, newStatus: QuotationStatus) => {
    await DataStore.updateQuotationStatus(quoteId, newStatus, actorName);
    await reloadLeadData();
  };

  // Delete Quotation
  const handleDeleteQuotation = async (quoteId: string) => {
    if (confirm('Yakin ingin menghapus dokumen penawaran ini?')) {
      await DataStore.deleteQuotation(quoteId);
      await reloadLeadData();
    }
  };

  // Task Actions
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newTaskTitle.trim()) return;

    await DataStore.createLeadTask({
      lead_id: lead.id,
      title: newTaskTitle.trim(),
      due_date: newTaskDueDate,
      is_completed: false,
    }, actorName);

    setNewTaskTitle('');
    await reloadLeadData();
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    await DataStore.toggleLeadTask(taskId, isCompleted, actorName);
    await reloadLeadData();
  };

  const handleDeleteTask = async (taskId: string) => {
    await DataStore.deleteLeadTask(taskId);
    await reloadLeadData();
  };

  // Send WhatsApp via API Gateway
  const handleSendViaGateway = async () => {
    const targetPhone = contacts.find((c) => c.is_primary)?.phone || lead?.phone;
    if (!targetPhone) {
      alert('Nomor telepon prospek tidak tersedia.');
      return;
    }
    setSendingGateway(true);
    setGatewayResult(null);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          message: customMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGatewayResult({
          success: true,
          message: data.message || 'Pesan berhasil diproses oleh gateway!',
        });
        if (status === 'Belum dihubungi') {
          setStatus('Dihubungi');
          await DataStore.updateLead(lead!.id, { status: 'Dihubungi' });
        }
        await DataStore.createLeadActivity({
          lead_id: lead!.id,
          activity_type: 'whatsapp_sent',
          title: 'Pesan WhatsApp Terkirim via Gateway',
          description: `Pesan dikirim ke ${targetPhone}: "${customMessage.slice(0, 100)}..."`,
          actor_name: actorName,
        });
        await reloadLeadData();
      } else {
        setGatewayResult({
          success: false,
          message: data.error || 'Gagal mengirim pesan melalui gateway.',
        });
      }
    } catch (err: any) {
      setGatewayResult({
        success: false,
        message: err?.message || 'Koneksi ke gateway gagal.',
      });
    } finally {
      setSendingGateway(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Memuat detail prospek 360°...</div>;
  }

  if (!lead) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-slate-500">Prospek tidak ditemukan atau telah dihapus.</p>
        <Link href="/crm" className="text-[#004a87] hover:underline text-sm inline-block font-semibold">
          &larr; Kembali ke Pipeline CRM
        </Link>
      </div>
    );
  }

  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];
  const activePhone = primaryContact?.phone || lead.phone || '';
  const cleanPhone = activePhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const directWaUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(customMessage)}`;

  const score = typeof lead.prospect_score === 'number' ? lead.prospect_score : calculateProspectScore(lead);
  const scoreBadge = getProspectScoreBadge(score);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ================================================================= */}
      {/* STICKY COMMAND BAR — Linear/Notion style                          */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-30 -mx-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-xs">

        {/* ── Row 1 : Breadcrumb + Identity + Score ── */}
        <div className="flex items-center gap-3 px-5 pt-3.5 pb-2.5">
          {/* Back */}
          <Link
            href="/crm"
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Kembali ke Pipeline CRM"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Divider */}
          <span className="text-slate-200 select-none">|</span>

          {/* Breadcrumb trail */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <span>Pipeline CRM</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-slate-600 font-medium">Detail Lead</span>
          </div>

          {/* Divider */}
          <span className="text-slate-200 select-none hidden sm:inline">|</span>

          {/* Lead name — truncates gracefully */}
          <h1 className="hidden sm:block text-sm font-extrabold text-slate-900 truncate max-w-[340px] leading-tight">
            {lead.business_name}
          </h1>

          {/* Status pill */}
          <span className={`shrink-0 hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
            status === 'Closing'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : status === 'Ditolak'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : status === 'Quotation'
              ? 'bg-violet-50 text-violet-700 border-violet-200'
              : status === 'Follow Up'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : status === 'Dihubungi'
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {status}
          </span>

          {/* Score badge */}
          <span className={`shrink-0 hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scoreBadge.badgeClass}`}>
            {scoreBadge.tag} {score}%
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Mobile lead name fallback */}
          <span className="sm:hidden text-xs font-bold text-slate-900 truncate max-w-[160px]">
            {lead.business_name}
          </span>
        </div>

        {/* ── Row 2 : Action Toolbar ── */}
        {/* Note: overflow-visible penting agar dropdown PIC tidak terpotong */}
        <div className="flex items-center gap-2 px-5 pb-3 flex-wrap">

          {/* GROUP A: PIC Assignment */}
          <div className="flex items-center gap-1.5 shrink-0 pr-2.5 border-r border-slate-200/80">
            <SearchablePicSelect
              value={assignedTo}
              onChange={handleUpdateAssignee}
              teamMembers={teamMembers}
              compact={true}
              placeholder="Assign PIC"
              dropdownAlign="left"
            />
          </div>

          {/* GROUP B: Follow-Up */}
          <button
            onClick={() => {
              setTempNextDate(nextActionAt || new Date(Date.now() + 86400000).toISOString().slice(0, 16));
              setTempNextNotes(nextActionNotes || '');
              setIsNextActionModalOpen(true);
            }}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              nextActionAt
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Atur Jadwal Follow-Up Berikutnya"
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {nextActionAt
                ? new Date(nextActionAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                : 'Follow-Up'}
            </span>
          </button>

          {/* GROUP C: Promo Kit */}
          <button
            type="button"
            onClick={() => setIsPromoModalOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Studio Promosi — Buat Flyer & Caption Sosmed"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Promo Kit</span>
          </button>

          {/* Spacer */}
          <div className="flex-1 min-w-2" />

          {/* GROUP D: Stage Selector */}
          <select
            value={status}
            onChange={(e) => {
              const newSt = e.target.value as LeadStatus;
              if (newSt === 'Ditolak') {
                setIsLostReasonModalOpen(true);
                return;
              }
              setStatus(newSt);
              DataStore.updateLead(lead.id, { status: newSt });
              DataStore.createLeadActivity({
                lead_id: lead.id,
                activity_type: 'stage_changed',
                title: `Tahap Dialihkan: ${status} → ${newSt}`,
                description: `Perubahan tahap pipeline diperbarui.`,
                actor_name: actorName,
              });
              reloadLeadData();
            }}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004a87]/20 focus:border-[#004a87] cursor-pointer transition-colors"
          >
            <option value="Belum dihubungi">Belum dihubungi</option>
            <option value="Dihubungi">Dihubungi</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Quotation">Quotation</option>
            <option value="Closing">Closing Won ✓</option>
            <option value="Ditolak">Ditolak / Batal</option>
          </select>

          {/* GROUP E: Delete */}
          <button
            onClick={handleDeleteLead}
            className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            title="Hapus Prospek"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lost Reason Notification Banner if Rejected */}
      {status === 'Ditolak' && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-extrabold text-rose-950">Alasan Penolakan: </span>
              <span>{lostReason || 'Belum ada catatan spesifik.'}</span>
            </div>
          </div>
          <button
            onClick={() => setIsLostReasonModalOpen(true)}
            className="text-xs font-bold text-rose-700 hover:underline cursor-pointer ml-3 shrink-0"
          >
            Ubah Alasan
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2-COLUMN 360° LAYOUT                                      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================================================= */}
        {/* LEFT COLUMN: Main Tabs (Timeline, Contacts, Quotes, Info)*/}
        {/* ======================================================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Modern Underline Tab Bar ── */}
          <div className="flex items-end gap-0 border-b-2 border-slate-200 overflow-x-auto scrollbar-hide">
            {[
              { id: 'timeline' as const, label: 'Timeline 360°', icon: Clock, count: activities.length },
              { id: 'contacts' as const, label: 'Kontak', icon: Users, count: contacts.length },
              { id: 'quotations' as const, label: 'Penawaran', icon: FileSpreadsheet, count: quotations.length },
              { id: 'details' as const, label: 'Info & Catatan', icon: FileText, count: null },
            ].map((tab) => {
              const isActive = mainTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMainTab(tab.id)}
                  className={`group relative shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap border-b-2 -mb-[2px] ${
                    isActive
                      ? 'text-[#004a87] border-[#004a87]'
                      : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-[#004a87]' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold transition-colors ${
                      isActive
                        ? 'bg-[#004a87] text-white'
                        : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: TIMELINE & QUICK LOG COMPOSER */}
          {mainTab === 'timeline' && (
            <div className="space-y-6">
              {/* Quick Input Composer */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                    Catat Interaksi Cepat (Audit Trail)
                  </span>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'note', label: 'Catatan', icon: FileText },
                        { id: 'call', label: 'Telepon', icon: PhoneCall },
                        { id: 'meeting', label: 'Meeting / Zoom', icon: Video },
                        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                      ] as const
                    ).map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setLogType(t.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            logType === t.id
                              ? 'bg-blue-50 text-[#004a87] border border-blue-200'
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleCreateActivityLog} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder={
                      logType === 'call'
                        ? 'Judul panggilan, misal: Telepon PIC Bu Ratna terkait konfirmasi jadwal seminar'
                        : logType === 'meeting'
                        ? 'Judul rapat, misal: Presentasi Zoom proposal kemitraan Worrie.id'
                        : logType === 'whatsapp'
                        ? 'Ringkasan WA, misal: Konfirmasi penerimaan surat penawaran'
                        : 'Ringkasan catatan interaksi...'
                    }
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] font-medium"
                    required
                  />

                  <textarea
                    rows={2}
                    placeholder="Rincian hasil pembicaraan, respon klien, atau poin kesepakatan..."
                    value={logDescription}
                    onChange={(e) => setLogDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] resize-none"
                  />

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmittingLog || !logTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isSubmittingLog ? 'Menyimpan...' : 'Simpan ke Timeline'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Time-Series Activity List */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#004a87]" />
                  Riwayat Aktivitas & Perjalanan Kemitraan ({activities.length})
                </h3>

                {activities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    Belum ada aktivitas tercatat untuk institusi ini.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {activities.map((act) => {
                      let badgeBg = 'bg-blue-100 text-[#004a87]';
                      let IconComponent = FileText;

                      if (act.activity_type === 'converted_from_draft') {
                        badgeBg = 'bg-emerald-100 text-emerald-800';
                        IconComponent = CheckCircle2;
                      } else if (act.activity_type === 'contact_added' || act.activity_type === 'contact_updated') {
                        badgeBg = 'bg-indigo-100 text-indigo-800';
                        IconComponent = Users;
                      } else if (act.activity_type === 'stage_changed') {
                        badgeBg = 'bg-purple-100 text-purple-800';
                        IconComponent = ArrowRight;
                      } else if (act.activity_type === 'whatsapp_sent') {
                        badgeBg = 'bg-emerald-100 text-emerald-800';
                        IconComponent = MessageSquare;
                      } else if (act.activity_type === 'phone_call') {
                        badgeBg = 'bg-amber-100 text-amber-800';
                        IconComponent = PhoneCall;
                      } else if (act.activity_type === 'meeting') {
                        badgeBg = 'bg-rose-100 text-rose-800';
                        IconComponent = Video;
                      } else if (act.activity_type === 'quotation_created' || act.activity_type === 'quotation_sent') {
                        badgeBg = 'bg-teal-100 text-teal-800';
                        IconComponent = FileSpreadsheet;
                      }

                      return (
                        <div key={act.id} className="relative group">
                          {/* Node Icon */}
                          <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${badgeBg}`}>
                            <IconComponent className="w-3 h-3" />
                          </div>

                          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-1 hover:border-slate-300 transition-colors">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">
                                {act.title}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {new Date(act.created_at).toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {act.description && (
                              <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {act.description}
                              </p>
                            )}

                            <div className="pt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span>Oleh:</span>
                              <span className="font-semibold text-slate-600">{act.actor_name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-CONTACT MANAGEMENT */}
          {mainTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Daftar Kontak Person Institusi ({contacts.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola kontak A (Kepala Sekolah), B (Guru BK), C (Humas/Hubin) untuk tindak lanjut kemitraan.
                  </p>
                </div>

                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  + Tambah Kontak
                </button>
              </div>

              {contacts.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada kontak terdaftar</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tambahkan kontak pertama (misal: Kepala Sekolah, Guru BK, atau Humas) dengan tombol di atas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-5 rounded-2xl bg-white border transition-all shadow-xs space-y-3 ${
                        contact.is_primary ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{contact.name}</h4>
                            {contact.is_primary && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#004a87]">
                                Kontak Utama
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-[#004a87] bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block border border-blue-200">
                            {contact.role}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus kontak ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-semibold">{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.notes && (
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                            {contact.notes}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <a
                          href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Halo Bapak/Ibu ${contact.name}, salam hormat dari tim Working Remotely Indonesia (Worrie.id).`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          Chat WhatsApp
                        </a>

                        {!contact.is_primary && (
                          <button
                            onClick={async () => {
                              await DataStore.updateLeadContact(contact.id, { is_primary: true }, actorName);
                              await reloadLeadData();
                            }}
                            className="text-xs text-slate-500 hover:text-[#004a87] font-semibold cursor-pointer"
                          >
                            Jadikan Utama
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUOTATIONS / SURAT PENAWARAN */}
          {mainTab === 'quotations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Daftar Surat Penawaran & Proposal Kemitraan ({quotations.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Terbitkan proposal seminar, workshop persiapan kerja remote, dan bootcamp kemitraan.
                  </p>
                </div>

                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Terbitkan Penawaran
                </button>
              </div>

              {quotations.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada quotation diterbitkan</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan tombol di atas untuk membuat surat penawaran harga resmi dengan nomor surat otomatis.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.map((quote) => (
                    <div
                      key={quote.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#004a87] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {quote.quote_number}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{quote.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Berlaku hingga: {new Date(quote.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>

                        {/* Status Changer */}
                        <div className="flex items-center gap-2">
                          <select
                            value={quote.status}
                            onChange={(e) => handleQuotationStatusChange(quote.id, e.target.value as QuotationStatus)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Terkirim (Sent)</option>
                            <option value="accepted">Diterima (Accepted)</option>
                            <option value="rejected">Ditolak (Rejected)</option>
                          </select>

                          <button
                            onClick={() => handleOpenPdfPreview(quote)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-[#004a87] hover:bg-blue-100 text-xs font-bold border border-blue-200 cursor-pointer"
                            title="Preview & Cetak Dokumen PDF Murni"
                          >
                            Preview PDF
                          </button>

                          <button
                            onClick={() => handleDeleteQuotation(quote.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus quotation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 text-[11px]">
                            <tr>
                              <th className="py-2 px-3">Item Layanan / Paket</th>
                              <th className="py-2 px-3 text-center">Qty</th>
                              <th className="py-2 px-3 text-right">Harga Satuan</th>
                              <th className="py-2 px-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {quote.items?.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3">
                                  <p className="font-bold text-slate-900">{item.item_name}</p>
                                  {item.description && (
                                    <p className="text-[11px] text-slate-500">{item.description}</p>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center font-mono">{item.qty}</td>
                                <td className="py-2 px-3 text-right font-mono">
                                  Rp {Number(item.unit_price).toLocaleString('id-ID')}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold">
                                  Rp {Number(item.total_price).toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Financial Totals */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                        <div className="space-y-0.5 text-slate-500 text-[11px]">
                          <p><strong>Syarat & Ketentuan:</strong> {quote.terms_conditions || '-'}</p>
                          <p><strong>Catatan:</strong> {quote.notes || '-'}</p>
                        </div>

                        <div className="space-y-1 text-right font-mono shrink-0">
                          <p className="text-slate-500">
                            Subtotal: Rp {Number(quote.subtotal).toLocaleString('id-ID')}
                          </p>
                          {quote.discount > 0 && (
                            <p className="text-emerald-700 font-semibold">
                              Diskon Kemitraan: -Rp {Number(quote.discount).toLocaleString('id-ID')}
                            </p>
                          )}
                          <p className="text-sm font-extrabold text-[#004a87] pt-1 border-t border-slate-200">
                            Grand Total: Rp {Number(quote.grand_total).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BUSINESS DETAILS & NOTES */}
          {mainTab === 'details' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveLead} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-[#004a87]" />
                    Edit Info Kemitraan & Catatan CRM
                  </h3>
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> Tersimpan!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tahap Pipeline CRM
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as LeadStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#004a87]"
                    >
                      <option value="Belum dihubungi">Belum dihubungi</option>
                      <option value="Dihubungi">Dihubungi</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Quotation">Quotation</option>
                      <option value="Closing">Closing</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Estimasi Nilai Deal (Rp)
                    </label>
                    <input
                      type="number"
                      value={dealValue}
                      onChange={(e) => setDealValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#004a87]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Catatan Internal Tim
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan catatan internal mengenai institusi ini..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: Sidebar Widgets (Score, WhatsApp, Tasks)   */}
        {/* ======================================================= */}
        <div className="space-y-6">
          {/* Widget 1: Score & Metadata Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Skor Potensi Kemitraan
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${scoreBadge.badgeClass}`}>
                {scoreBadge.tag}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{score}%</span>
              <span className="text-xs text-slate-400">skor kesiapan kemitraan</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreBadge.barColor}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{lead.address || 'Alamat tidak terdeteksi'}</span>
              </div>

              {lead.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">★ {lead.rating}</span>
                  <span className="text-[11px] text-slate-400">({lead.reviews_count || 0} ulasan Google)</span>
                </div>
              )}

              {lead.gmaps_url && (
                <div>
                  <a
                    href={lead.gmaps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#004a87] hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Buka Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: WhatsApp Quick Chat Box */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Kirim Pesan WhatsApp
              </h3>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {activePhone || 'No phone'}
              </span>
            </div>

            {/* Template Selector */}
            {templates.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pilih Template Pesan:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-[#004a87]"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] resize-none"
              placeholder="Tulis pesan WhatsApp..."
            />

            {/* Feedback result */}
            {gatewayResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  gatewayResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {gatewayResult.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>{gatewayResult.message}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <a
                href={directWaUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                WhatsApp Web
              </a>

              <button
                type="button"
                onClick={handleSendViaGateway}
                disabled={sendingGateway || !activePhone}
                className="py-2.5 px-4 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {sendingGateway ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Gateway
              </button>
            </div>
          </div>

          {/* Widget 3: Follow-Up Tasks & Reminders */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#004a87]" />
                Pengingat & Agenda Follow-Up
              </h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                {tasks.filter((t) => !t.is_completed).length} aktif
              </span>
            </div>

            <form onSubmit={handleAddTask} className="space-y-2">
              <input
                type="text"
                placeholder="+ Tambah tugas follow-up..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#004a87] text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Simpan
                </button>
              </div>
            </form>

            <div className="space-y-2 pt-2 divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center italic">
                  Belum ada pengingat follow-up.
                </p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="pt-2 flex items-start justify-between gap-2 text-xs">
                    <label className="flex items-start gap-2 cursor-pointer flex-1 select-none">
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#004a87] focus:ring-[#004a87]"
                      />
                      <div>
                        <p className={`font-semibold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Tenggat: {task.due_date}
                        </span>
                      </div>
                    </label>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-300 hover:text-rose-500 cursor-pointer"
                      title="Hapus tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 4: Tautan Dokumen Pendukung (Google Drive, MoU, Portfolio, Invoice DP) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#004a87]" />
                Dokumen &amp; Proposal Links
              </h3>
              <button
                type="button"
                onClick={() => setIsDocLinkModalOpen(true)}
                className="text-xs font-bold text-[#004a87] hover:underline cursor-pointer"
              >
                + Tambah Link
              </button>
            </div>

            {documentLinks.length === 0 ? (
              <div className="text-center py-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <FolderOpen className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Belum ada tautan dokumen disimpan.</p>
                <button
                  type="button"
                  onClick={() => setIsDocLinkModalOpen(true)}
                  className="mt-2 text-[11px] font-bold text-[#004a87] hover:underline cursor-pointer"
                >
                  + Simpan Google Drive / MoU
                </button>
              </div>
            ) : (
              <div className="space-y-2 divide-y divide-slate-100">
                {documentLinks.map((doc) => (
                  <div key={doc.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-800 hover:text-[#004a87] flex items-center gap-1.5 truncate"
                        title={doc.title}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#004a87] shrink-0" />
                        <span className="truncate">{doc.title}</span>
                      </a>
                      {doc.category && (
                        <span className="text-[10px] text-slate-400 block ml-5">
                          {doc.category}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocLink(doc.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Hapus tautan dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: TAMBAH KONTAK BARU                                 */}
      {/* ========================================================= */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#004a87]" />
                Tambah Kontak Person Institusi
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Kontak *
                </label>
                <input
                  type="text"
                  placeholder="Misal: Dr. H. Bambang Sutrisno, M.Pd"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peran / Jabatan Institusi *
                </label>
                <select
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value as ContactRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#004a87]"
                >
                  <option value="Owner">Owner / Kepala Sekolah (Pembuat Keputusan)</option>
                  <option value="Direktur">Direktur / Yayasan</option>
                  <option value="Manajer Marketing">Humas / Manajer Kemitraan</option>
                  <option value="Staff Operasional">Guru BK / Koordinator Program</option>
                  <option value="Admin">Staff Tata Usaha / Admin</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp *
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#004a87]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="kontak@sekolah.sch.id"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Pribadi
                </label>
                <input
                  type="text"
                  placeholder="Misal: Lebih nyaman dihubungi via WA pagi hari"
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={contactIsPrimary}
                    onChange={(e) => setContactIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#004a87] focus:ring-[#004a87]"
                  />
                  <span className="font-semibold text-slate-700">Jadikan Kontak Utama</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold cursor-pointer"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TERBITKAN QUOTATION / PENAWARAN HARGA              */}
      {/* ========================================================= */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#004a87]" />
                Terbitkan Dokumen Penawaran Resmi (Quotation)
              </h3>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Proposal / Penawaran *
                </label>
                <input
                  type="text"
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Berlaku Hingga
                  </label>
                  <input
                    type="date"
                    value={quoteValidUntil}
                    onChange={(e) => setQuoteValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Diskon Kemitraan (Rp)
                  </label>
                  <input
                    type="number"
                    value={quoteDiscount}
                    onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Items Line Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700">Rincian Paket & Layanan</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuoteItems((prev) => [
                        ...prev,
                        { item_name: 'Layanan Tambahan', description: '', qty: 1, unit_price: 1000000 },
                      ])
                    }
                    className="text-xs font-bold text-[#004a87] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Tambah Item
                  </button>
                </div>

                <div className="space-y-2">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nama Paket / Layanan"
                          value={item.item_name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, item_name: val } : it))
                            );
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                          required
                        />

                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.qty}
                          min={1}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQuoteItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, qty: val } : it))
                            );
                          }}
                          className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-center bg-white"
                        />

                        <input
                          type="number"
                          placeholder="Harga Satuan (Rp)"
                          value={item.unit_price}
                          step={100000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQuoteItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, unit_price: val } : it))
                            );
                          }}
                          className="w-32 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white text-right"
                        />

                        {quoteItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuoteItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Deskripsi rincian kurikulum / silabus..."
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuoteItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, description: val } : it))
                          );
                        }}
                        className="w-full px-3 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Syarat & Ketentuan Pembayaran
                </label>
                <textarea
                  rows={2}
                  value={quoteTerms}
                  onChange={(e) => setQuoteTerms(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-right font-mono">
                  <span className="text-slate-400 text-[11px]">Estimasi Total: </span>
                  <span className="font-extrabold text-[#004a87] text-sm">
                    Rp{' '}
                    {Math.max(
                      0,
                      quoteItems.reduce((acc, c) => acc + c.qty * c.unit_price, 0) -
                        Number(quoteDiscount || 0)
                    ).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold cursor-pointer"
                  >
                    Terbitkan Proposal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pure PDF Preview Modal Resmi Worrie.id */}
      <PdfPreviewModal
        isOpen={pdfPreviewData.isOpen}
        onClose={handleClosePdfPreview}
        pdfUrl={pdfPreviewData.url}
        filename={pdfPreviewData.filename}
        title={pdfPreviewData.title}
        subtitle={pdfPreviewData.subtitle}
        loading={pdfPreviewData.loading}
      />

      {/* ========================================================= */}
      {/* MODAL: LOST REASON (ALASAN DITOLAK)                       */}
      {/* ========================================================= */}
      {isLostReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-rose-950 text-sm">
                  Alasan Penolakan Prospek (Lost Reason)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLostReasonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Pilih alasan utama mengapa {lead.business_name} menolak atau membatalkan penawaran. Data ini digunakan untuk evaluasi tim marketing.
              </p>

              <div className="space-y-2">
                {[
                  'Kemahalan / Anggaran Tidak Tersedia',
                  'Sudah Ada Vendor / Mitra Pelatihan Lain',
                  'Belum Butuh Program Remote Work Saat Ini',
                  'Nomor Tidak Aktif / Salah Sambung',
                  'Lainnya',
                ].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedLostReason === opt
                        ? 'bg-rose-50/80 border-rose-300 text-rose-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lost_reason"
                      value={opt}
                      checked={selectedLostReason === opt}
                      onChange={(e) => setSelectedLostReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              {selectedLostReason === 'Lainnya' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tuliskan Alasan Khusus:
                  </label>
                  <textarea
                    rows={2}
                    value={customLostReason}
                    onChange={(e) => setCustomLostReason(e.target.value)}
                    placeholder="Contoh: Sudah menandatangani MoU eksklusif dengan kampus lain..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-xs resize-none"
                    required
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLostReasonModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLostReason}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Status Ditolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NEXT ACTION & JANJI FOLLOW-UP                      */}
      {/* ========================================================= */}
      {isNextActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-amber-950 text-sm">
                  Atur Janji &amp; Next Action Follow-Up
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNextActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNextAction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Tanggal &amp; Waktu Janji Follow-Up *
                </label>
                <input
                  type="datetime-local"
                  value={tempNextDate}
                  onChange={(e) => setTempNextDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Catatan Rencana / Agenda Tindak Lanjut
                </label>
                <textarea
                  rows={2}
                  value={tempNextNotes}
                  onChange={(e) => setTempNextNotes(e.target.value)}
                  placeholder="Misal: Hubungi kembali Bu Ratna via telepon jam 14.00 untuk follow up hasil review proposal MoU..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNextActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Janji Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH TAUTAN DOKUMEN & PROPOSAL                   */}
      {/* ========================================================= */}
      {isDocLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#004a87]" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Tambah Dokumen / Link Pendukung
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDocLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocLink} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Dokumen *
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#004a87]"
                >
                  <option value="Google Drive MoU">Google Drive Folder MoU</option>
                  <option value="Draft Kontrak Kemitraan">Draft Kontrak Kemitraan</option>
                  <option value="Portofolio Program Worrie">Portofolio Program Worrie.id</option>
                  <option value="Invoice / Bukti DP">Invoice / Bukti Transfer DP</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Dokumen / Nama File *
                </label>
                <input
                  type="text"
                  placeholder="Misal: MoU Kemitraan SMK 2026 Final"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#004a87]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tautan URL Lengkap (Google Drive, Dropbox, PDF) *
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#004a87]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDocLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#004a87] hover:bg-[#003866] text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Tautan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotional Kit & Flyer Modal */}
      {lead && (
        <PromotionalKitModal
          isOpen={isPromoModalOpen}
          onClose={() => setIsPromoModalOpen(false)}
          lead={lead}
        />
      )}
    </div>
  );
}

export default function LeadDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Memuat detail prospek...</div>}>
      <LeadDetailContent />
    </Suspense>
  );
}
