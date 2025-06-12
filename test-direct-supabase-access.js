const { createClient } = require('@supabase/supabase-js');

/**
 * Test direct Supabase access to debug the 400 errors
 */

async function testDirectSupabaseAccess() {
    console.log('🔍 Testing Direct Supabase Access');
    
    const supabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        console.log('\n📍 Step 1: Testing basic connectivity...');
        
        // Test 1: Basic auth state
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log(`User authenticated: ${!!user} (${user?.email || 'none'})`);
        if (authError) console.log('Auth error:', authError.message);
        
        console.log('\n📍 Step 2: Testing table existence...');
        
        // Test 2: List all tables (if we have access)
        try {
            const { data: tables, error: tablesError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
                
            if (tablesError) {
                console.log('❌ Cannot access information_schema:', tablesError.message);
            } else {
                console.log('✅ Available tables:', tables.map(t => t.table_name).join(', '));
            }
        } catch (e) {
            console.log('❌ Information schema access failed');
        }
        
        console.log('\n📍 Step 3: Testing assets (working API)...');
        
        // Test 3: Assets API (we know this works)
        const { data: assets, error: assetsError } = await supabase
            .from('assets')
            .select('id')
            .limit(1);
            
        if (assetsError) {
            console.log('❌ Assets query failed:', assetsError.message);
        } else {
            console.log(`✅ Assets accessible, found ${assets.length} records`);
        }
        
        console.log('\n📍 Step 4: Testing templates (failing API)...');
        
        // Test 4: Templates API (the one that's failing)
        const { data: templates, error: templatesError } = await supabase
            .from('templates')
            .select('*')
            .limit(1);
            
        if (templatesError) {
            console.log('❌ Templates query failed:', templatesError.message);
            console.log('❌ Error details:', JSON.stringify(templatesError, null, 2));
        } else {
            console.log(`✅ Templates accessible, found ${templates.length} records`);
        }
        
        console.log('\n📍 Step 5: Testing with specific ordering...');
        
        // Test 5: Templates with ordering (the exact failing query)
        const { data: templatesOrdered, error: orderedError } = await supabase
            .from('templates')
            .select('*')
            .order('usage_count', { ascending: false });
            
        if (orderedError) {
            console.log('❌ Templates with ordering failed:', orderedError.message);
            console.log('❌ Error details:', JSON.stringify(orderedError, null, 2));
            
            // Try without the problematic column
            console.log('\n📍 Step 5b: Testing without usage_count ordering...');
            const { data: templatesNoUsage, error: noUsageError } = await supabase
                .from('templates')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (noUsageError) {
                console.log('❌ Templates without usage_count failed:', noUsageError.message);
            } else {
                console.log(`✅ Templates without usage_count works, found ${templatesNoUsage.length} records`);
            }
        } else {
            console.log(`✅ Templates with ordering works, found ${templatesOrdered.length} records`);
        }
        
        console.log('\n📍 Step 6: Testing campaigns (401 API)...');
        
        // Test 6: Check if we can access any data without auth
        try {
            const { data: campaigns, error: campaignsError } = await supabase
                .from('campaigns')
                .select('id')
                .limit(1);
                
            if (campaignsError) {
                console.log('❌ Campaigns query failed:', campaignsError.message);
                if (campaignsError.message.includes('row-level security')) {
                    console.log('💡 This is expected - campaigns require authentication');
                }
            } else {
                console.log(`✅ Campaigns accessible, found ${campaigns.length} records`);
            }
        } catch (e) {
            console.log('❌ Campaigns access failed with exception');
        }
        
        return {
            userAuthenticated: !!user,
            assetsWorking: !assetsError,
            templatesWorking: !templatesError,
            templatesOrderingWorking: !orderedError,
            mainIssue: templatesError?.message || orderedError?.message || 'Unknown'
        };
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return null;
    }
}

// Run the test
if (require.main === module) {
    testDirectSupabaseAccess()
        .then(result => {
            if (result) {
                console.log('\n📋 Summary:');
                console.log(`User authenticated: ${result.userAuthenticated ? '✅' : '❌'}`);
                console.log(`Assets working: ${result.assetsWorking ? '✅' : '❌'}`);
                console.log(`Templates working: ${result.templatesWorking ? '✅' : '❌'}`);
                console.log(`Templates ordering working: ${result.templatesOrderingWorking ? '✅' : '❌'}`);
                if (result.mainIssue !== 'Unknown') {
                    console.log(`Main issue: ${result.mainIssue}`);
                }
            }
        })
        .catch(console.error);
}

module.exports = { testDirectSupabaseAccess };