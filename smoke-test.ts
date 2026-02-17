/**
 * Supabase Smoke Test
 * 
 * This script tests the connection to Supabase and verifies that
 * the RPC function rpc_create_project is working correctly.
 * 
 * Prerequisites:
 * - Supabase SQL files have been deployed (01-04)
 * - .env file is configured with valid Supabase credentials
 * - An admin user profile exists in the database
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing environment variables')
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file')
    process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runSmokeTest() {
    console.log('🚀 Starting Supabase Smoke Test...\n')

    // Test 1: Connection Test
    console.log('Test 1: Testing connection to Supabase...')
    try {
        const { error } = await supabase.from('profiles').select('count').limit(1)
        if (error) throw error
        console.log('✅ Connection successful\n')
    } catch (error) {
        console.error('❌ Connection failed:', error)
        process.exit(1)
    }

    // Test 2: RPC Function Test
    console.log('Test 2: Testing rpc_create_project...')

    // Minimal project payload
    const projectPayload = {
        title: 'Smoke Test Project',
        description: 'This is a test project created by the smoke test script',
        location: 'Test Location',
        total_budget: 100000,
        currency: 'NGN',
        milestones: [
            {
                title: 'Test Milestone 1',
                description: 'First test milestone',
                sort_order: 1,
                due_date: '2026-03-01',
                budget: 50000
            },
            {
                title: 'Test Milestone 2',
                description: 'Second test milestone',
                sort_order: 2,
                due_date: '2026-04-01',
                budget: 50000
            }
        ]
    }

    try {
        const { data: projectId, error } = await supabase.rpc('rpc_create_project', {
            payload: projectPayload
        })

        if (error) {
            // If error is "Unauthorized", it means RLS is working correctly
            // but we need to be logged in as an admin
            if (error.message.includes('Unauthorized')) {
                console.log('⚠️  RPC function exists but requires admin authentication')
                console.log('   This is expected behavior - RLS is working correctly')
                console.log('   To test fully, you need to:')
                console.log('   1. Sign in as an admin user using Supabase Auth')
                console.log('   2. Run this test again with authenticated session\n')
                console.log('✅ Smoke test passed (partial - RPC exists, RLS working)\n')
                return
            }
            throw error
        }

        console.log('✅ Project created successfully!')
        console.log(`   Project ID: ${projectId}\n`)
        console.log('✅ All smoke tests passed!\n')
    } catch (error) {
        console.error('❌ RPC call failed:', error)
        console.error('\nPossible causes:')
        console.error('- SQL files not deployed in correct order')
        console.error('- Missing required database functions')
        console.error('- RLS policies preventing access (need admin authentication)\n')
        process.exit(1)
    }
}

// Run the test
runSmokeTest()
    .then(() => {
        console.log('🎉 Smoke test completed')
        process.exit(0)
    })
    .catch((error) => {
        console.error('💥 Unexpected error:', error)
        process.exit(1)
    })
