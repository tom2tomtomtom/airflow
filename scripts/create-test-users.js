/**
 * Script to create test users in Supabase
 *
 * Run with: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test users to create
const testUsers = [
  {
    email: 'admin@airwave.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    permissions: ['user:read', 'user:write', 'client:read', 'client:write'],
  },
  {
    email: 'editor@airwave.com',
    password: 'password123',
    firstName: 'Editor',
    lastName: 'User',
    role: 'editor',
    permissions: ['client:read', 'asset:read', 'asset:write'],
  },
  {
    email: 'viewer@airwave.com',
    password: 'password123',
    firstName: 'Viewer',
    lastName: 'User',
    role: 'viewer',
    permissions: ['client:read', 'asset:read'],
  },
];

// Test clients to create
const testClients = [
  {
    name: 'Acme Corporation',
    industry: 'Technology',
    description: 'A leading technology company',
    logo_url: 'https://via.placeholder.com/150',
  },
  {
    name: 'Global Media',
    industry: 'Media & Entertainment',
    description: 'A global media and entertainment company',
    logo_url: 'https://via.placeholder.com/150',
  },
  {
    name: 'Eco Solutions',
    industry: 'Environmental',
    description: 'Sustainable solutions for a better planet',
    logo_url: 'https://via.placeholder.com/150',
  },
];

// User-client relationships to create
const userClientRelationships = [
  { userEmail: 'editor@airwave.com', clientName: 'Acme Corporation' },
  { userEmail: 'editor@airwave.com', clientName: 'Global Media' },
  { userEmail: 'viewer@airwave.com', clientName: 'Global Media' },
];

// Create a test user
async function createTestUser(user) {
  try {
    // Check if user already exists in auth.users
    const { data: existingAuthUsers, error: authCheckError } = await supabase.auth.admin.listUsers();

    if (authCheckError) {
      console.error(`Error checking if user ${user.email} exists:`, authCheckError);
      return null;
    }

    const existingUser = existingAuthUsers.users.find(u => u.email === user.email);

    if (existingUser) {
      console.log(`User ${user.email} already exists, skipping...`);
      return existingUser.id;
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName,
      },
    });

    if (authError) {
      console.error(`Error creating user ${user.email}:`, authError);
      return null;
    }

    console.log(`Created user ${user.email} with ID ${authData.user.id}`);

    // Update profile with role and permissions
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        permissions: JSON.stringify(user.permissions),
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error(`Error updating profile for user ${user.email}:`, profileError);
    } else {
      console.log(`Updated profile for user ${user.email}`);
    }

    return authData.user.id;
  } catch (error) {
    console.error(`Error creating user ${user.email}:`, error);
    return null;
  }
}

// Create a test client
async function createTestClient(client) {
  try {
    // Check if client already exists
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('name', client.name);

    if (checkError) {
      console.error(`Error checking if client ${client.name} exists:`, checkError);
      return null;
    }

    if (existingClients && existingClients.length > 0) {
      console.log(`Client ${client.name} already exists, skipping...`);
      return existingClients[0].id;
    }

    // Create client
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (error) {
      console.error(`Error creating client ${client.name}:`, error);
      return null;
    }

    console.log(`Created client ${client.name} with ID ${data.id}`);
    return data.id;
  } catch (error) {
    console.error(`Error creating client ${client.name}:`, error);
    return null;
  }
}

// Create a user-client relationship
async function createUserClientRelationship(userId, clientId) {
  try {
    // Check if relationship already exists
    const { data: existingRelationships, error: checkError } = await supabase
      .from('user_clients')
      .select('id')
      .eq('user_id', userId)
      .eq('client_id', clientId);

    if (checkError) {
      console.error(`Error checking if relationship exists:`, checkError);
      return;
    }

    if (existingRelationships && existingRelationships.length > 0) {
      console.log(`Relationship already exists, skipping...`);
      return;
    }

    // Create relationship
    const { error } = await supabase
      .from('user_clients')
      .insert({
        user_id: userId,
        client_id: clientId,
      });

    if (error) {
      console.error(`Error creating user-client relationship:`, error);
    } else {
      console.log(`Created user-client relationship`);
    }
  } catch (error) {
    console.error(`Error creating user-client relationship:`, error);
  }
}

// Main function
async function main() {
  console.log('Creating test users and clients...');

  // Create users
  const userIds = {};
  for (const user of testUsers) {
    const userId = await createTestUser(user);
    if (userId) {
      userIds[user.email] = userId;
    }
  }

  // Create clients
  const clientIds = {};
  for (const client of testClients) {
    const clientId = await createTestClient(client);
    if (clientId) {
      clientIds[client.name] = clientId;
    }
  }

  // Create user-client relationships
  for (const relationship of userClientRelationships) {
    const userId = userIds[relationship.userEmail];
    const clientId = clientIds[relationship.clientName];

    if (userId && clientId) {
      await createUserClientRelationship(userId, clientId);
    } else {
      console.error(`Could not create relationship: user or client not found`);
    }
  }

  console.log('Done!');
}

// Run the script
main().catch(console.error);
