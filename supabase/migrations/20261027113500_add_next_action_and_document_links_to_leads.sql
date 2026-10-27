-- Migration: 20261027113500_add_next_action_and_document_links_to_leads.sql
-- Description: Menambahkan kolom next_action_at, next_action_notes, dan document_links pada tabel leads

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'next_action_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN next_action_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'next_action_notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN next_action_notes TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'document_links'
  ) THEN
    ALTER TABLE leads ADD COLUMN document_links JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
