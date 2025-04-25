-- SQL script for creating tables in Supabase
-- Run this in the Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users
CREATE POLICY "Users are viewable by everyone" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for sessions
CREATE POLICY "Sessions are viewable by owner" ON public.sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sessions can be inserted by owner" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sessions can be updated by owner" ON public.sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sessions can be deleted by owner" ON public.sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Entities table
CREATE TABLE IF NOT EXISTS public.entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- Create policy for entities
CREATE POLICY "Entities are viewable by owner" ON public.entities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Entities can be inserted by owner" ON public.entities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Entities can be updated by owner" ON public.entities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Entities can be deleted by owner" ON public.entities
    FOR DELETE USING (auth.uid() = user_id);

-- Relations table
CREATE TABLE IF NOT EXISTS public.relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}',
    from_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
    to_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.relations ENABLE ROW LEVEL SECURITY;

-- Create policy for relations
CREATE POLICY "Relations are viewable by owner" ON public.relations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Relations can be inserted by owner" ON public.relations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Relations can be updated by owner" ON public.relations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Relations can be deleted by owner" ON public.relations
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON public.entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON public.entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_name ON public.entities(name);
CREATE INDEX IF NOT EXISTS idx_relations_user_id ON public.relations(user_id);
CREATE INDEX IF NOT EXISTS idx_relations_from_entity_id ON public.relations(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_relations_to_entity_id ON public.relations(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_relations_type ON public.relations(type);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at
BEFORE UPDATE ON public.entities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relations_updated_at
BEFORE UPDATE ON public.relations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
