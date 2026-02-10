-- Add content length constraints via validation triggers

-- Validate comments content length
CREATE OR REPLACE FUNCTION public.validate_comment_content()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.content) < 1 OR length(NEW.content) > 5000 THEN
    RAISE EXCEPTION 'Comment content must be between 1 and 5000 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_comment_content_trigger
BEFORE INSERT OR UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.validate_comment_content();

-- Validate watch party messages content length
CREATE OR REPLACE FUNCTION public.validate_watch_party_message()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.content) < 1 OR length(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Message content must be between 1 and 2000 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_watch_party_message_trigger
BEFORE INSERT OR UPDATE ON public.watch_party_messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_watch_party_message();

-- Validate chat messages content length
CREATE OR REPLACE FUNCTION public.validate_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.content) < 1 OR length(NEW.content) > 5000 THEN
    RAISE EXCEPTION 'Chat message must be between 1 and 5000 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_chat_message_trigger
BEFORE INSERT OR UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_chat_message();