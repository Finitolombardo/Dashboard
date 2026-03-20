-- Anon-Read-Policies für agents und quests
-- Dashboard liest ohne Auth über den Anon-Key
CREATE POLICY "Anon kann Agenten lesen"
  ON agents FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon kann Quests lesen"
  ON quests FOR SELECT TO anon
  USING (true);
