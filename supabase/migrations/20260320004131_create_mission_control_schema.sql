/*
  # Mission Control Schema

  1. Neue Tabellen
    - `agents` - KI-Agenten im System
      - `id` (uuid, Primaerschluessel)
      - `name` (text) - Agentenname
      - `role` (text) - Rolle/Funktion
      - `status` (text) - Idle/Working/Waiting/Blocked/Offline/Error
      - `capabilities` (text) - Faehigkeiten
      - `current_model` (text) - Aktuelles KI-Modell
      - `workload` (integer) - Aktuelle Auslastung
      - `created_at` / `updated_at` (timestamptz)

    - `quests` - Auftraege/Missionen
      - `id` (uuid, Primaerschluessel)
      - `title` (text) - Titel
      - `goal` (text) - Ziel
      - `scope` (text) - Umfang/Brief
      - `status` (text) - Draft/Ready/In Progress/Waiting/Blocked/In Review/Done/Paused/Archived
      - `priority` (text) - critical/high/medium/low
      - `agent_id` (uuid, FK) - Zugewiesener Agent
      - `current_step` (text) - Aktueller Schritt
      - `next_step` (text) - Naechster Schritt
      - `blocker` (text) - Blocker-Beschreibung
      - `progress` (integer) - Fortschritt 0-100
      - `linked_workflow_id` (uuid) - Verknuepfter Workflow
      - `linked_campaign_id` (uuid) - Verknuepfte Kampagne
      - `notes` (text) - Notizen
      - `created_at` / `updated_at` (timestamptz)

    - `signals` - Operationelle Signale
      - `id` (uuid, Primaerschluessel)
      - `type` (text) - blocker/approval/agent_question/failed_execution/stuck_session/performance_drop/campaign_underperformance/system_warning/proposed_quest
      - `title` (text) - Titel
      - `summary` (text) - Zusammenfassung
      - `severity` (text) - critical/high/medium/low
      - `status` (text) - open/acknowledged/resolved/dismissed
      - `source` (text) - Quelle
      - `linked_quest_id` (uuid, FK)
      - `linked_workflow_id` (uuid, FK)
      - `linked_session_id` (uuid, FK)
      - `linked_campaign_id` (uuid, FK)
      - `created_at` (timestamptz)

    - `workflows` - Automatisierungs-Workflows
      - `id` (uuid, Primaerschluessel)
      - `name` (text) - Name
      - `status` (text) - active/paused/error/inactive
      - `last_run` (timestamptz) - Letzter Lauf
      - `owner_agent_id` (uuid, FK) - Verantwortlicher Agent
      - `related_quest_id` (uuid, FK)
      - `execution_health` (text) - healthy/degraded/failing
      - `created_at` / `updated_at` (timestamptz)

    - `executions` - Workflow-Ausfuehrungen
      - `id` (uuid, Primaerschluessel)
      - `workflow_id` (uuid, FK) - Zugehoeriger Workflow
      - `status` (text) - success/failed/running/cancelled
      - `failure_summary` (text) - Fehlerzusammenfassung
      - `severity` (text) - critical/high/medium/low
      - `retry_count` (integer) - Wiederholungsversuche
      - `linked_quest_id` (uuid, FK)
      - `started_at` / `completed_at` (timestamptz)

    - `sessions` - Agenten-Sitzungen
      - `id` (uuid, Primaerschluessel)
      - `name` (text) - Sitzungsname
      - `agent_id` (uuid, FK) - Agent
      - `current_model` (text) - Modell
      - `current_task` (text) - Aktuelle Aufgabe
      - `health` (text) - healthy/degraded/error
      - `status` (text) - active/paused/completed/error
      - `linked_quest_id` (uuid, FK)
      - `started_at` (timestamptz) - Startzeit
      - `last_message` (text) - Letzte Nachricht
      - `created_at` (timestamptz)

    - `campaigns` - Kampagnen
      - `id` (uuid, Primaerschluessel)
      - `name` (text) - Kampagnenname
      - `platform` (text) - Plattform
      - `status` (text) - active/paused/completed/draft
      - `sent` (integer) - Gesendet
      - `opened` (integer) - Geoeffnet
      - `replied` (integer) - Beantwortet
      - `positive_replies` (integer) - Positive Antworten
      - `bounce_rate` (numeric) - Bounce-Rate
      - `linked_quest_id` (uuid, FK)
      - `last_update` (timestamptz)
      - `created_at` (timestamptz)

    - `messages` - Nachrichten in Quests
      - `id` (uuid, Primaerschluessel)
      - `quest_id` (uuid, FK) - Zugehoerige Quest
      - `sender_type` (text) - operator/agent/system
      - `sender_name` (text) - Absendername
      - `content` (text) - Inhalt
      - `message_type` (text) - message/update/question/event/approval/output
      - `created_at` (timestamptz)

    - `artefacts` - Ergebnisse/Dateien
      - `id` (uuid, Primaerschluessel)
      - `quest_id` (uuid, FK) - Zugehoerige Quest
      - `title` (text) - Titel
      - `type` (text) - file/link/report/summary/doc/log/screenshot/bundle
      - `source` (text) - Quelle
      - `created_by` (text) - Erstellt von
      - `url` (text) - URL/Pfad
      - `created_at` (timestamptz)

    - `events` - Zeitleisten-Events
      - `id` (uuid, Primaerschluessel)
      - `quest_id` (uuid, FK) - Zugehoerige Quest
      - `type` (text) - Event-Typ
      - `description` (text) - Beschreibung
      - `actor` (text) - Ausloeser
      - `created_at` (timestamptz)

    - `services` - System-Dienste
      - `id` (uuid, Primaerschluessel)
      - `name` (text) - Dienstname
      - `status` (text) - online/degraded/offline/error
      - `last_check` (timestamptz) - Letzte Pruefung
      - `response_time_ms` (integer) - Antwortzeit
      - `created_at` (timestamptz)

  2. Sicherheit
    - RLS fuer alle Tabellen aktiviert
    - Policies fuer authentifizierte Benutzer
*/

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'idle',
  capabilities text DEFAULT '',
  current_model text DEFAULT '',
  workload integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Agenten lesen"
  ON agents FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Agenten erstellen"
  ON agents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Agenten aktualisieren"
  ON agents FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Agenten loeschen"
  ON agents FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Campaigns (vor Quests, da FK)
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  sent integer DEFAULT 0,
  opened integer DEFAULT 0,
  replied integer DEFAULT 0,
  positive_replies integer DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  linked_quest_id uuid,
  last_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Kampagnen lesen"
  ON campaigns FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Kampagnen erstellen"
  ON campaigns FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Kampagnen aktualisieren"
  ON campaigns FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Kampagnen loeschen"
  ON campaigns FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Workflows (vor Quests, da FK)
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'inactive',
  last_run timestamptz,
  owner_agent_id uuid REFERENCES agents(id),
  related_quest_id uuid,
  execution_health text DEFAULT 'healthy',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Workflows lesen"
  ON workflows FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Workflows erstellen"
  ON workflows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Workflows aktualisieren"
  ON workflows FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Workflows loeschen"
  ON workflows FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  goal text DEFAULT '',
  scope text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  priority text NOT NULL DEFAULT 'medium',
  agent_id uuid REFERENCES agents(id),
  current_step text DEFAULT '',
  next_step text DEFAULT '',
  blocker text DEFAULT '',
  progress integer DEFAULT 0,
  linked_workflow_id uuid REFERENCES workflows(id),
  linked_campaign_id uuid REFERENCES campaigns(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Quests lesen"
  ON quests FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Quests erstellen"
  ON quests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Quests aktualisieren"
  ON quests FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Quests loeschen"
  ON quests FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- FK fuer campaigns und workflows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'campaigns_linked_quest_id_fkey'
  ) THEN
    ALTER TABLE campaigns ADD CONSTRAINT campaigns_linked_quest_id_fkey
      FOREIGN KEY (linked_quest_id) REFERENCES quests(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'workflows_related_quest_id_fkey'
  ) THEN
    ALTER TABLE workflows ADD CONSTRAINT workflows_related_quest_id_fkey
      FOREIGN KEY (related_quest_id) REFERENCES quests(id);
  END IF;
END $$;

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  agent_id uuid REFERENCES agents(id),
  current_model text DEFAULT '',
  current_task text DEFAULT '',
  health text DEFAULT 'healthy',
  status text NOT NULL DEFAULT 'active',
  linked_quest_id uuid REFERENCES quests(id),
  started_at timestamptz DEFAULT now(),
  last_message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Sitzungen lesen"
  ON sessions FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Sitzungen erstellen"
  ON sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Sitzungen aktualisieren"
  ON sessions FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Sitzungen loeschen"
  ON sessions FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Signals
CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  summary text DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  source text DEFAULT '',
  linked_quest_id uuid REFERENCES quests(id),
  linked_workflow_id uuid REFERENCES workflows(id),
  linked_session_id uuid REFERENCES sessions(id),
  linked_campaign_id uuid REFERENCES campaigns(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Signale lesen"
  ON signals FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Signale erstellen"
  ON signals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Signale aktualisieren"
  ON signals FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Signale loeschen"
  ON signals FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Executions
CREATE TABLE IF NOT EXISTS executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id),
  status text NOT NULL DEFAULT 'running',
  failure_summary text DEFAULT '',
  severity text DEFAULT 'medium',
  retry_count integer DEFAULT 0,
  linked_quest_id uuid REFERENCES quests(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Ausfuehrungen lesen"
  ON executions FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Ausfuehrungen erstellen"
  ON executions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Ausfuehrungen aktualisieren"
  ON executions FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Ausfuehrungen loeschen"
  ON executions FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid REFERENCES quests(id),
  sender_type text NOT NULL DEFAULT 'operator',
  sender_name text DEFAULT '',
  content text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'message',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Nachrichten lesen"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Nachrichten erstellen"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Nachrichten aktualisieren"
  ON messages FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Nachrichten loeschen"
  ON messages FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Artefacts
CREATE TABLE IF NOT EXISTS artefacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid REFERENCES quests(id),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'file',
  source text DEFAULT '',
  created_by text DEFAULT '',
  url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE artefacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Artefakte lesen"
  ON artefacts FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Artefakte erstellen"
  ON artefacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Artefakte aktualisieren"
  ON artefacts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Artefakte loeschen"
  ON artefacts FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid REFERENCES quests(id),
  type text NOT NULL,
  description text DEFAULT '',
  actor text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Events lesen"
  ON events FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Events erstellen"
  ON events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Events aktualisieren"
  ON events FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Events loeschen"
  ON events FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'online',
  last_check timestamptz DEFAULT now(),
  response_time_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Benutzer koennen Dienste lesen"
  ON services FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Dienste erstellen"
  ON services FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Dienste aktualisieren"
  ON services FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authentifizierte Benutzer koennen Dienste loeschen"
  ON services FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_quests_priority ON quests(priority);
CREATE INDEX IF NOT EXISTS idx_quests_agent_id ON quests(agent_id);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_severity ON signals(severity);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_quest_id ON messages(quest_id);
CREATE INDEX IF NOT EXISTS idx_events_quest_id ON events(quest_id);
CREATE INDEX IF NOT EXISTS idx_artefacts_quest_id ON artefacts(quest_id);
