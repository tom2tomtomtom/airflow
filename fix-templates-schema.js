const { createClient } = require('@supabase/supabase-js');

/**
 * Fix the templates table schema by adding missing columns
 */

async function fixTemplatesSchema() {
    console.log('🔧 Fixing Templates Table Schema');
    
    const supabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        console.log('\n📍 Step 1: Check current templates schema...');
        
        // Get current column information
        const { data: currentColumns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'templates' });
            
        if (columnsError) {
            console.log('❌ Cannot get column info, trying direct query method...');
            
            // Alternative method - try a select with specific columns
            const testColumns = [
                'id', 'name', 'platform', 'aspect_ratio', 'dimensions', 
                'description', 'thumbnail_url', 'category', 'content_type', 
                'dynamic_fields', 'is_creatomate', 'creatomate_id', 
                'usage_count', 'performance_score', 'created_by', 
                'is_public', 'created_at', 'updated_at'
            ];
            
            console.log('\n📍 Step 2: Testing individual columns...');
            for (const column of testColumns) {
                try {
                    const { error: testError } = await supabase
                        .from('templates')
                        .select(column)
                        .limit(1);
                        
                    if (testError) {
                        console.log(`❌ Column '${column}' missing or inaccessible`);
                    } else {
                        console.log(`✅ Column '${column}' exists`);
                    }
                } catch (e) {
                    console.log(`❌ Column '${column}' test failed`);
                }
            }
        }
        
        console.log('\n📍 Step 3: Create SQL to fix schema...');
        
        // Since we can't execute DDL with the anon key, we'll create the SQL commands
        const fixSqlCommands = [
            '-- Fix templates table schema',
            'ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;',
            'ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS performance_score DECIMAL(3,2) DEFAULT 0.00;',
            '',
            '-- Create campaigns table if missing',
            `CREATE TABLE IF NOT EXISTS public.campaigns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                client_id UUID REFERENCES public.clients(id),
                description TEXT,
                status campaign_status DEFAULT 'draft',
                start_date DATE,
                end_date DATE,
                budget DECIMAL(12,2),
                goals JSONB DEFAULT '[]',
                target_audience JSONB DEFAULT '{}',
                created_by UUID REFERENCES public.profiles(id),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );`,
            '',
            '-- Enable RLS for campaigns',
            'ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;',
            '',
            '-- Create basic RLS policy for campaigns',
            `CREATE POLICY "Users can view campaigns they have access to" ON public.campaigns
                FOR SELECT USING (true);`,
            '',
            '-- Update templates with sample data',
            `INSERT INTO public.templates (name, platform, aspect_ratio, dimensions, description, category, content_type, is_public, usage_count)
            VALUES 
                ('Instagram Square Post', 'instagram', '1:1', '1080x1080', 'Standard Instagram square post template', 'social', 'post', true, 5),
                ('Instagram Story', 'instagram', '9:16', '1080x1920', 'Instagram story template', 'social', 'story', true, 3),
                ('Facebook Post', 'facebook', '16:9', '1200x630', 'Facebook post template', 'social', 'post', true, 2)
            ON CONFLICT (id) DO NOTHING;`
        ];
        
        const sqlScript = fixSqlCommands.join('\n');
        
        console.log('\n📍 Step 4: Generated SQL fix script...');
        console.log('📋 Save this SQL and run it in your Supabase SQL editor:');
        console.log('=' * 60);
        console.log(sqlScript);
        console.log('=' * 60);
        
        // Save to file
        const fs = require('fs');
        fs.writeFileSync('./fix-templates-schema.sql', sqlScript);
        console.log('\n✅ SQL script saved to: ./fix-templates-schema.sql');
        
        console.log('\n📍 Step 5: Test workaround for current app...');
        
        // Create a workaround by modifying the useData hook
        const workaroundCode = `
// TEMPORARY WORKAROUND FOR TEMPLATES API
// Replace the templates query in useData.ts with this:

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      // Use created_at instead of usage_count for ordering
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
`;
        
        console.log('\n📋 Temporary code fix for useData.ts:');
        console.log(workaroundCode);
        
        return {
            sqlScriptGenerated: true,
            workaroundProvided: true,
            mainIssue: 'Missing usage_count column in templates table',
            fixRequired: 'Run the generated SQL script in Supabase'
        };
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return null;
    }
}

// Run the fix
if (require.main === module) {
    fixTemplatesSchema()
        .then(result => {
            if (result) {
                console.log('\n📋 Summary:');
                console.log('✅ SQL fix script generated');
                console.log('✅ Temporary workaround provided');
                console.log('\n💡 Next steps:');
                console.log('1. Run fix-templates-schema.sql in Supabase SQL editor');
                console.log('2. Apply the temporary workaround to useData.ts');
                console.log('3. Test the templates and matrix pages again');
            }
        })
        .catch(console.error);
}

module.exports = { fixTemplatesSchema };