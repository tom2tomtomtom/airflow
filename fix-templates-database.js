const { createClient } = require('@supabase/supabase-js');

/**
 * Fix the templates database issues
 */

async function fixTemplatesDatabase() {
    console.log('🔧 Fixing Templates Database Issues');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdsjlutmfaatslznjxiv.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ0ODc5NSwiZXhwIjoyMDQzMDI0Nzk1fQ.MOfpjQOjIqpD0ysS8BjYqlzGQ5mF1YqZvp6QZt0t1nU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // 1. Check if templates table exists and its structure
        console.log('\n📍 Step 1: Checking templates table...');
        
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'templates');
            
        if (tablesError) {
            console.log('❌ Error checking tables:', tablesError.message);
            return;
        }
        
        if (tables.length === 0) {
            console.log('❌ Templates table does not exist');
            return;
        }
        
        console.log('✅ Templates table exists');
        
        // 2. Check table columns
        console.log('\n📍 Step 2: Checking table structure...');
        
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_schema', 'public')
            .eq('table_name', 'templates');
            
        if (columnsError) {
            console.log('❌ Error checking columns:', columnsError.message);
        } else {
            console.log('📋 Table columns:');
            columns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
        }
        
        // 3. Try to query templates directly
        console.log('\n📍 Step 3: Testing direct query...');
        
        const { data: templatesCount, error: countError } = await supabase
            .from('templates')
            .select('id', { count: 'exact', head: true });
            
        if (countError) {
            console.log('❌ Error counting templates:', countError.message);
            console.log('❌ Full error:', countError);
        } else {
            console.log(`✅ Templates table accessible, count: ${templatesCount}`);
        }
        
        // 4. Try the problematic query
        console.log('\n📍 Step 4: Testing problematic query...');
        
        const { data: templates, error: queryError } = await supabase
            .from('templates')
            .select('*')
            .order('usage_count', { ascending: false })
            .limit(10);
            
        if (queryError) {
            console.log('❌ Error with problematic query:', queryError.message);
            console.log('❌ Full error:', queryError);
            
            // Try without ordering
            console.log('\n📍 Step 4b: Testing without ordering...');
            const { data: templatesNoOrder, error: noOrderError } = await supabase
                .from('templates')
                .select('*')
                .limit(10);
                
            if (noOrderError) {
                console.log('❌ Error even without ordering:', noOrderError.message);
            } else {
                console.log(`✅ Query works without ordering, found ${templatesNoOrder.length} templates`);
            }
        } else {
            console.log(`✅ Problematic query works, found ${templates.length} templates`);
        }
        
        // 5. Check RLS policies
        console.log('\n📍 Step 5: Checking RLS policies...');
        
        const { data: policies, error: policiesError } = await supabase
            .from('pg_policies')
            .select('policyname, tablename, roles, cmd, qual')
            .eq('tablename', 'templates');
            
        if (policiesError) {
            console.log('❌ Error checking RLS policies:', policiesError.message);
        } else {
            console.log(`📋 Found ${policies.length} RLS policies for templates table`);
            policies.forEach(policy => {
                console.log(`  - ${policy.policyname} (${policy.cmd}) for roles: ${policy.roles}`);
            });
        }
        
        // 6. Create sample templates if none exist
        console.log('\n📍 Step 6: Checking for sample data...');
        
        const { data: existingTemplates, error: existingError } = await supabase
            .from('templates')
            .select('id')
            .limit(1);
            
        if (existingError) {
            console.log('❌ Error checking existing templates:', existingError.message);
        } else if (existingTemplates.length === 0) {
            console.log('📦 Creating sample templates...');
            
            const sampleTemplates = [
                {
                    name: 'Instagram Square Post',
                    platform: 'instagram',
                    aspect_ratio: '1:1',
                    dimensions: '1080x1080',
                    description: 'Standard Instagram square post template',
                    category: 'social',
                    content_type: 'post',
                    is_public: true,
                    usage_count: 5
                },
                {
                    name: 'Instagram Story',
                    platform: 'instagram', 
                    aspect_ratio: '9:16',
                    dimensions: '1080x1920',
                    description: 'Instagram story template',
                    category: 'social',
                    content_type: 'story',
                    is_public: true,
                    usage_count: 3
                },
                {
                    name: 'Facebook Post',
                    platform: 'facebook',
                    aspect_ratio: '16:9',
                    dimensions: '1200x630',
                    description: 'Facebook post template',
                    category: 'social',
                    content_type: 'post',
                    is_public: true,
                    usage_count: 2
                }
            ];
            
            const { data: newTemplates, error: insertError } = await supabase
                .from('templates')
                .insert(sampleTemplates)
                .select();
                
            if (insertError) {
                console.log('❌ Error creating sample templates:', insertError.message);
            } else {
                console.log(`✅ Created ${newTemplates.length} sample templates`);
            }
        } else {
            console.log(`✅ Found ${existingTemplates.length} existing templates`);
        }
        
        // 7. Final test
        console.log('\n📍 Step 7: Final test...');
        
        const { data: finalTest, error: finalError } = await supabase
            .from('templates')
            .select('*')
            .order('usage_count', { ascending: false });
            
        if (finalError) {
            console.log('❌ Final test failed:', finalError.message);
            
            // Provide specific recommendations
            console.log('\n💡 Specific Recommendations:');
            if (finalError.message.includes('column') && finalError.message.includes('usage_count')) {
                console.log('1. The usage_count column might be missing or have wrong type');
                console.log('2. Run: ALTER TABLE templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;');
            }
            if (finalError.message.includes('permission') || finalError.message.includes('policy')) {
                console.log('3. Check RLS policies - templates table might not be accessible');
                console.log('4. Consider disabling RLS temporarily: ALTER TABLE templates DISABLE ROW LEVEL SECURITY;');
            }
        } else {
            console.log(`✅ Final test passed! Found ${finalTest.length} templates`);
        }
        
        return {
            tableExists: tables.length > 0,
            queryWorks: !finalError,
            templatesCount: finalTest?.length || 0,
            error: finalError?.message
        };
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return null;
    }
}

// Run the fix
if (require.main === module) {
    fixTemplatesDatabase()
        .then(result => {
            if (result) {
                console.log('\n📋 Summary:');
                console.log(`Table exists: ${result.tableExists ? '✅' : '❌'}`);
                console.log(`Query works: ${result.queryWorks ? '✅' : '❌'}`);
                console.log(`Templates count: ${result.templatesCount}`);
                if (result.error) {
                    console.log(`Error: ${result.error}`);
                }
            }
        })
        .catch(console.error);
}

module.exports = { fixTemplatesDatabase };