/**
 * Script to create the first admin user
 * 
 * Usage:
 * 1. First, create a user account through the normal registration flow
 * 2. Then run this script with: npx tsx scripts/create-admin.ts <user-email>
 * 
 * Or use the Supabase SQL directly:
 * INSERT INTO user_roles (user_id, role, granted_by, granted_at)
 * SELECT id, 'admin', id, NOW()
 * FROM auth.users
 * WHERE email = 'your-admin@email.com';
 */

import { createAdminClient } from '../lib/supabase/server';

async function createAdmin(email: string) {
  try {
    const adminClient = createAdminClient();

    // Find user by email
    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
    
    if (userError) {
      throw userError;
    }

    const user = userData?.users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User with email ${email} not found. Please register the user first.`);
      process.exit(1);
    }

    // Check if user already has a role
    const { data: existingRole } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingRole) {
      console.log(`⚠️  User ${email} already has role: ${existingRole.role}`);
      console.log('Updating to admin role...');

      const { error: updateError } = await adminClient
        .from('user_roles')
        .update({
          role: 'admin',
          granted_by: user.id,
          granted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Successfully updated ${email} to admin role`);
    } else {
      // Create admin role
      const { error: insertError } = await adminClient
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin',
          granted_by: user.id,
          granted_at: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Successfully granted admin role to ${email}`);
    }

    console.log(`\n📧 Admin access: ${email}`);
    console.log(`🔗 Login at: /cp/login`);
    console.log(`\n⚠️  Keep the admin login URL secure!`);

  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx scripts/create-admin.ts <user-email>');
  process.exit(1);
}

createAdmin(email);

