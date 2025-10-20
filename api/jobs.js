// api/jobs.js (Versão que informa o planId e isAdmin)
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const authHeader = request.headers['authorization'];
    if (!authHeader) return response.status(401).json({ error: 'Não autorizado.' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) return response.status(401).json({ error: 'Token inválido.' });
    
    // Busca o perfil do usuário para pegar o tenantId E o status de admin
    const { data: userData } = await supabaseAdmin.from('users').select('tenantId, isAdmin').eq('id', user.id).single();
    if (!userData) return response.status(404).json({ error: 'Perfil de usuário não encontrado.' });
    const tenantId = userData.tenantId;

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('planId')
      .eq('id', tenantId)
      .single();
    if (tenantError) throw tenantError;

    const { id } = request.query;

    if (id) {
      // Lógica para UMA vaga (sem alterações)
      const { data: job, error: jobError } = await supabaseAdmin.from('jobs').select('*').eq('id', Number(id)).eq('tenantId', tenantId).single();
      if (jobError || !job) return response.status(404).json({ error: 'Vaga não encontrada.' });
      return response.status(200).json({ job });
    } 
    else {
      // Lógica para TODAS as vagas (sem alterações)
      const { data: jobs, error: jobsError } = await supabaseAdmin.from('jobs').select(`id, title, status, tenantId, applications ( count )`).eq('tenantId', tenantId);
      if (jobsError) throw jobsError;
      const formattedJobs = jobs.map(job => ({ ...job, candidateCount: job.applications[0] ? job.applications[0].count : 0 }));
      
      // Retorna os dados, agora incluindo o status de admin
      return response.status(200).json({ 
        jobs: formattedJobs,
        planId: tenant.planId,
        isAdmin: userData.isAdmin // ADICIONADO
      });
    }
  } catch (error) {
    console.error("Erro na API de vagas:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.' });
  }
}