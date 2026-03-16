import { createClient } from '@supabase/supabase-js';

// These environment variables will need to be set in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Entity = {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Relation = {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  from_entity_id: string;
  to_entity_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
};

export type Session = {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
};

// Knowledge graph service
export const knowledgeGraphService = {
  // Get all entities for a user
  async getEntities(userId: string): Promise<Entity[]> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching entities:', error);
      return [];
    }

    return data || [];
  },

  // Get all relations for a user
  async getRelations(userId: string): Promise<Relation[]> {
    const { data, error } = await supabase
      .from('relations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching relations:', error);
      return [];
    }

    return data || [];
  },

  // Get the complete knowledge graph for a user
  async getKnowledgeGraph(userId: string): Promise<{ entities: Entity[], relations: Relation[] }> {
    const [entities, relations] = await Promise.all([
      this.getEntities(userId),
      this.getRelations(userId)
    ]);

    return { entities, relations };
  },

  // Create a new entity
  async createEntity(name: string, type: string, properties: Record<string, unknown>, userId: string): Promise<Entity | null> {
    const { data, error } = await supabase
      .from('entities')
      .insert([
        { name, type, properties, user_id: userId }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating entity:', error);
      return null;
    }

    return data;
  },

  // Create a new relation
  async createRelation(type: string, fromEntityId: string, toEntityId: string, properties: Record<string, unknown>, userId: string): Promise<Relation | null> {
    const { data, error } = await supabase
      .from('relations')
      .insert([
        {
          type,
          from_entity_id: fromEntityId,
          to_entity_id: toEntityId,
          properties,
          user_id: userId
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating relation:', error);
      return null;
    }

    return data;
  },

  // Search entities by query
  async searchEntities(query: string, entityType: string | null = null, limit: number = 10, userId: string): Promise<Entity[]> {
    let queryBuilder = supabase
      .from('entities')
      .select('*')
      .eq('user_id', userId);

    // Apply type filter if specified
    if (entityType) {
      queryBuilder = queryBuilder.eq('type', entityType);
    }

    // Apply search filter
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,properties.ilike.%${query}%`);

    // Apply limit
    queryBuilder = queryBuilder.limit(limit);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching entities:', error);
      return [];
    }

    return data || [];
  },

  // Get entity by ID
  async getEntity(entityId: string): Promise<Entity | null> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', entityId)
      .single();

    if (error) {
      console.error('Error fetching entity:', error);
      return null;
    }

    return data;
  }
};

// Default user ID for testing (in a real app, this would come from authentication)
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

// Initialize the default user if it doesn't exist
export async function initializeDefaultUser() {
  // Check if default user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', DEFAULT_USER_ID)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
    console.error('Error checking for default user:', fetchError);
    return;
  }

  // If user doesn't exist, create it
  if (!existingUser) {
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: DEFAULT_USER_ID,
          email: 'default@example.com',
          name: 'Default User'
        }
      ]);

    if (insertError) {
      console.error('Error creating default user:', insertError);
    } else {
      console.log('Created default user');
    }
  }
}
