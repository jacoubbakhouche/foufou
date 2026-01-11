-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_message TEXT
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    cleared_history_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- 'text', 'image'
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. Policies for conversations
-- Users can view conversations they are participants in (and not deleted? No, need to see metadata to un-delete)
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
        AND is_deleted = false 
    )
);

-- 2. Policies for conversation_participants
CREATE POLICY "Users can view their own participation"
ON public.conversation_participants
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants
FOR SELECT
USING (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
);

-- 3. Policies for messages
-- Users can see messages if they are participants AND message is new enough
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
        AND (cleared_history_at IS NULL OR messages.created_at > cleared_history_at)
    )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = conversation_id
        AND user_id = auth.uid()
    )
);


-- FUNCTION: Soft Delete Conversation
CREATE OR REPLACE FUNCTION public.soft_delete_conversation(conversation_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    all_deleted BOOLEAN;
BEGIN
    -- 1. Mark as deleted for the current user and update cleared_history_at
    UPDATE public.conversation_participants
    SET is_deleted = true,
        cleared_history_at = now()
    WHERE conversation_id = conversation_id_param
    AND user_id = auth.uid();

    -- 2. Check if all participants have deleted this conversation
    SELECT BOOL_AND(is_deleted) INTO all_deleted
    FROM public.conversation_participants
    WHERE conversation_id = conversation_id_param;

    -- 3. If everyone deleted it, HARD DELETE the conversation
    IF all_deleted THEN
        DELETE FROM public.conversations
        WHERE id = conversation_id_param;
    END IF;
END;
$$;


-- FUNCTION: Send Message Secure (Resurrects chat if needed)
CREATE OR REPLACE FUNCTION public.send_message_secure(
    conversation_id_param UUID,
    content_param TEXT,
    type_param TEXT DEFAULT 'text'
)
RETURNS JSONB -- Returns the new message
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_message_id UUID;
    new_message_record RECORD;
BEGIN
    -- 1. Insert the message
    INSERT INTO public.messages (conversation_id, sender_id, content, type)
    VALUES (conversation_id_param, auth.uid(), content_param, type_param)
    RETURNING * INTO new_message_record;

    -- 2. Update conversation updated_at
    UPDATE public.conversations
    SET updated_at = now(),
        last_message = CASE WHEN type_param = 'image' THEN 'صورة' ELSE content_param END
    WHERE id = conversation_id_param;

    -- 3. Resurrect chat for other participants (set is_deleted = false)
    -- IMPORTANT: Do NOT reset cleared_history_at, so they don't see old history, only this new message + future ones.
    UPDATE public.conversation_participants
    SET is_deleted = false
    WHERE conversation_id = conversation_id_param
    AND is_deleted = true;

    RETURN to_jsonb(new_message_record);
END;
$$;


-- FUNCTION: Create or Get Conversation (One-on-One)
CREATE OR REPLACE FUNCTION public.create_or_get_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conv_id UUID;
BEGIN
    -- Check if a 1-on-1 conversation exists
    SELECT c.id INTO conv_id
    FROM public.conversations c
    JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid()
    AND cp2.user_id = other_user_id
    GROUP BY c.id
    HAVING COUNT(*) = 2
    LIMIT 1;

    -- If exists, make sure I am not deleted (resurrect for myself if I am initiating)
    IF conv_id IS NOT NULL THEN
        UPDATE public.conversation_participants
        SET is_deleted = false
        WHERE conversation_id = conv_id AND user_id = auth.uid();
        RETURN conv_id;
    END IF;

    -- Create new conversation
    INSERT INTO public.conversations (created_at)
    VALUES (now())
    RETURNING id INTO conv_id;

    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
        (conv_id, auth.uid()),
        (conv_id, other_user_id);

    RETURN conv_id;
END;
$$;
