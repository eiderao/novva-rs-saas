// api/getPublicJobData.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    // Usamos a chave pública aqui, pois a tabela de vagas pode ser lida publicamente (com RLS)
    // Mas para simplificar, usaremos a chave de admin, pois a RLS para a tabela 'jobs' não está configurada para leitura pública
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { id: jobId } = request.query;
    if (!jobId) {
      return response.status(400).json({ error: 'O ID da vaga é obrigatório.' });
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('title') // Pega apenas o título
      .eq('id', jobId)
      .single();

    if (jobError) throw jobError;

    return response.status(200).json({ job });
  } catch (error) {
    return response.status(500).json({ error: 'Não foi possível buscar os dados da vaga.' });
  }
}