// api/getJobs.js (Corrigido)
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // A CORREÇÃO ESTÁ AQUI
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return response.status(401).json({ error: 'Nenhum token de autorização fornecido.' });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) {
      return response.status(401).json({ error: 'Token inválido ou expirado.', details: userError.message });
    }

    const userId = user.id;

    const { data: userData, error: tenantError } = await supabaseAdmin
      .from('users')
      .select('tenantId')
      .eq('id', userId)
      .single();

    if (tenantError || !userData) {
      return response.status(404).json({ error: 'Perfil do usuário não encontrado no banco de dados para buscar o tenantId.' });
    }

    const tenantId = userData.tenantId;

    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('tenantId', tenantId);

    if (jobsError) {
      throw jobsError;
    }

    return response.status(200).json({ jobs });

  } catch (error) {
    console.error("Erro na função getJobs:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}