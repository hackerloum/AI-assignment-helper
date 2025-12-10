/**
 * Script to verify if a user has admin role
 * 
 * Usage: npx tsx scripts/verify-admin.ts <user-email>
 */

import { createAdminClient } from '../lib/supabase/server';

async function verifyAdmin(email: string) {
  try {
    const adminClient = createAdminClient();

    // Find user by email
    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
    
    if (userError) {
      throw userError;
    }

    const user = userData?.users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User with email ${email} not found.`);
      process.exit(1);
    }

    console.log(`\n👤 User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);

    // Check role
    const { data: role, error: roleError } = await adminClient
      .from('user_roles')
      .select('role, granted_at, granted_by')
      .eq('user_id', user.id)
      .single();

    if (roleError || !role) {
      console.log(`\n❌ No role found for this user.`);
      console.log(`   User has default 'user' role (no entry in user_roles table)`);
      console.log(`\n💡 To grant admin role, run:`);
      console.log(`   npx tsx scripts/create-admin.ts ${email}`);
      process.exit(1);
    }

    console.log(`\n✅ Role found:`);
    console.log(`   Role: ${role.role}`);
    console.log(`   Granted at: ${role.granted_at}`);
    
    if (role.role === 'admin') {
      console.log(`\n🎉 User has ADMIN access!`);
      console.log(`   Login at: /cp/login`);
    } else {
      console.log(`\n⚠️  User has role: ${role.role}`);
      console.log(`   To grant admin access, run:`);
      console.log(`   npx tsx scripts/create-admin.ts ${email}`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx scripts/verify-admin.ts <user-email>');
  process.exit(1);
}

verifyAdmin(email);

