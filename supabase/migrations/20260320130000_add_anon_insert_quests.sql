-- Anon darf neue Quests erstellen (Dashboard ohne Auth)
CREATE POLICY "Anon kann Quests erstellen"
  ON quests FOR INSERT TO anon
  WITH CHECK (true);
