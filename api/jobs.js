// api/jobs.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const authHeader = request.headers['authorization'];
    if (!authHeader) return response.status(401).json({ error: 'Não autorizado.' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) return response.status(401).json({ error: 'Token inválido.' });
    const { data: userData } = await supabaseAdmin.from('users').select('tenantId').eq('id', user.id).single();
    if (!userData) return response.status(404).json({ error: 'Perfil de usuário não encontrado.' });
    const tenantId = userData.tenantId;

    const { id } = request.query;

    // SE um ID for passado, busca uma vaga específica
    if (id) {
      const { data: job, error: jobError } = await supabaseAdmin.from('jobs').select('*').eq('id', id).eq('tenantId', tenantId).single();
      if (jobError || !job) return response.status(404).json({ error: 'Vaga não encontrada.' });
      return response.status(200).json({ job });
    } 
    // SE NENHUM ID for passado, busca todas as vagas
    else {
      const { data: jobs, error: jobsError } = await supabaseAdmin.from('jobs').select(`id, title, status, tenantId, applications ( count )`).eq('tenantId', tenantId);
      if (jobsError) throw jobsError;
      const formattedJobs = jobs.map(job => ({ ...job, candidateCount: job.applications[0] ? job.applications[0].count : 0 }));
      return response.status(200).json({ jobs: formattedJobs });
    }
  } catch (error) {
    console.error("Erro na API de vagas:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.' });
  }
}