import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating admin user...');
    
    // Tạo admin user
    const { data: authUser, error: signUpError } = await supabase.auth.admin.createUser({
      email: 'admin@johndeus.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'John Deus Admin',
        username: 'admin_johndeus'
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      return new Response(JSON.stringify({ error: signUpError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin user created:', authUser.user?.id);

    // Cấp quyền admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([
        { user_id: authUser.user!.id, role: 'admin' },
        { user_id: authUser.user!.id, role: 'user' }
      ])
      .select();

    if (roleError) {
      console.error('Role assignment error:', roleError);
    }

    return new Response(JSON.stringify({
      success: true,
      credentials: {
        email: 'admin@johndeus.com',
        password: 'Admin123!',
        user_id: authUser.user?.id
      },
      message: 'Admin user created successfully!'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);