-- Clean up empty or null content messages
-- These cause errors when sent to Gemini API

DELETE FROM messages 
WHERE content IS NULL 
   OR content = '' 
   OR TRIM(content) = '';

-- Add a constraint to prevent future empty messages
ALTER TABLE messages 
ADD CONSTRAINT messages_content_not_empty 
CHECK (content IS NOT NULL AND TRIM(content) != '');

