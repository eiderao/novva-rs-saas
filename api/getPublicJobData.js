// api/getPublicJobData.js (Versão com Contagem de Candidatos)
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { id: jobId } = request.query;
    if (!jobId) {
      return response.status(400).json({ error: 'O ID da vaga é obrigatório.' });
    }

    // A CONSULTA AGORA TAMBÉM BUSCA A CONTAGEM DE 'applications'
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        title,
        applications ( count )
      `)
      .eq('id', jobId)
      .single();

    if (jobError) throw jobError;
    
    const formattedJob = {
      title: job.title,
      candidateCount: job.applications[0] ? job.applications[0].count : 0
    };

    return response.status(200).json({ job: formattedJob });
  } catch (error) {
    console.error("Erro ao buscar dados públicos da vaga:", error);
    return response.status(500).json({ error: 'Não foi possível buscar os dados da vaga.' });
  }
}