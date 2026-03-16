-- SQL script for updating existing tables in Supabase
-- Run this in the Supabase SQL Editor to ensure all required columns exist

-- Check and update users table
DO $$
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email') THEN
            ALTER TABLE public.users ADD COLUMN email VARCHAR(255) UNIQUE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
            ALTER TABLE public.users ADD COLUMN name VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at') THEN
            ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
            ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    ELSE
        -- Create users table if it doesn't exist
        CREATE TABLE public.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Enable Row Level Security if not already enabled
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users are viewable by everyone') THEN
        CREATE POLICY "Users are viewable by everyone" ON public.users
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert their own data') THEN
        CREATE POLICY "Users can insert their own data" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own data') THEN
        CREATE POLICY "Users can update their own data" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Check and update entities table
DO $$
BEGIN
    -- Check if entities table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'entities') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'name') THEN
            ALTER TABLE public.entities ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Entity';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'type') THEN
            ALTER TABLE public.entities ADD COLUMN type VARCHAR(255) NOT NULL DEFAULT 'unknown';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'properties') THEN
            ALTER TABLE public.entities ADD COLUMN properties JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'created_at') THEN
            ALTER TABLE public.entities ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'updated_at') THEN
            ALTER TABLE public.entities ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entities' AND column_name = 'user_id') THEN
            ALTER TABLE public.entities ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
    ELSE
        -- Create entities table if it doesn't exist
        CREATE TABLE public.entities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL,
            properties JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
        );
    END IF;
    
    -- Enable Row Level Security if not already enabled
    ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Entities are viewable by owner') THEN
        CREATE POLICY "Entities are viewable by owner" ON public.entities
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Entities can be inserted by owner') THEN
        CREATE POLICY "Entities can be inserted by owner" ON public.entities
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Entities can be updated by owner') THEN
        CREATE POLICY "Entities can be updated by owner" ON public.entities
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Entities can be deleted by owner') THEN
        CREATE POLICY "Entities can be deleted by owner" ON public.entities
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Check and update relations table
DO $$
BEGIN
    -- Check if relations table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'relations') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'relations' AND column_name = 'type') THEN
            ALTER TABLE public.relations ADD COLUMN type VARCHAR(255) NOT NULL DEFAULT 'related_to';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'relations' AND column_name = 'properties') THEN
            ALTER TABLE public.relations ADD COLUMN properties JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'relations' AND column_name = 'from_entity_id') THEN
            ALTER TABLE public.relations ADD COLUMN from_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'relations' AND column_name = 'to_entity_id') THEN
            ALTER TABLE public.relations ADD COLUMN to_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'relations' AND column_name = 'created_at') THEN
            ALTER TABLE public.relations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'relations' AND column_name = 'updated_at') THEN
            ALTER TABLE public.relations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'relations' AND column_name = 'user_id') THEN
            ALTER TABLE public.relations ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
    ELSE
        -- Create relations table if it doesn't exist
        CREATE TABLE public.relations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type VARCHAR(255) NOT NULL,
            properties JSONB DEFAULT '{}',
            from_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
            to_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
        );
    END IF;
    
    -- Enable Row Level Security if not already enabled
    ALTER TABLE public.relations ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'relations' AND policyname = 'Relations are viewable by owner') THEN
        CREATE POLICY "Relations are viewable by owner" ON public.relations
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'relations' AND policyname = 'Relations can be inserted by owner') THEN
        CREATE POLICY "Relations can be inserted by owner" ON public.relations
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'relations' AND policyname = 'Relations can be updated by owner') THEN
        CREATE POLICY "Relations can be updated by owner" ON public.relations
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'relations' AND policyname = 'Relations can be deleted by owner') THEN
        CREATE POLICY "Relations can be deleted by owner" ON public.relations
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Check and update sessions table
DO $$
BEGIN
    -- Check if sessions table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sessions') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'user_id') THEN
            ALTER TABLE public.sessions ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'expires_at') THEN
            ALTER TABLE public.sessions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days');
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'created_at') THEN
            ALTER TABLE public.sessions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    ELSE
        -- Create sessions table if it doesn't exist
        CREATE TABLE public.sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Enable Row Level Security if not already enabled
    ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Sessions are viewable by owner') THEN
        CREATE POLICY "Sessions are viewable by owner" ON public.sessions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Sessions can be inserted by owner') THEN
        CREATE POLICY "Sessions can be inserted by owner" ON public.sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Sessions can be updated by owner') THEN
        CREATE POLICY "Sessions can be updated by owner" ON public.sessions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Sessions can be deleted by owner') THEN
        CREATE POLICY "Sessions can be deleted by owner" ON public.sessions
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes for better performance if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_entities_user_id') THEN
        CREATE INDEX idx_entities_user_id ON public.entities(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_entities_type') THEN
        CREATE INDEX idx_entities_type ON public.entities(type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_entities_name') THEN
        CREATE INDEX idx_entities_name ON public.entities(name);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_relations_user_id') THEN
        CREATE INDEX idx_relations_user_id ON public.relations(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_relations_from_entity_id') THEN
        CREATE INDEX idx_relations_from_entity_id ON public.relations(from_entity_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_relations_to_entity_id') THEN
        CREATE INDEX idx_relations_to_entity_id ON public.relations(to_entity_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_relations_type') THEN
        CREATE INDEX idx_relations_type ON public.relations(type);
    END IF;
END $$;

-- Create a function to update the updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_entities_updated_at') THEN
        CREATE TRIGGER update_entities_updated_at
        BEFORE UPDATE ON public.entities
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_relations_updated_at') THEN
        CREATE TRIGGER update_relations_updated_at
        BEFORE UPDATE ON public.relations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
