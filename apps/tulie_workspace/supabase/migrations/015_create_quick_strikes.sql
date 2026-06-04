-- Create quick_strikes table
CREATE TABLE IF NOT EXISTS public.quick_strikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quick_strikes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own quick strikes" 
    ON public.quick_strikes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own quick strikes" 
    ON public.quick_strikes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick strikes"
    ON public.quick_strikes FOR DELETE
    USING (auth.uid() = user_id);
