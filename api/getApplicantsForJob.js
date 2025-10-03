// api/getApplicantsForJob.js (Versão Final e Corrigida)
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Valida o token do usuário de RH
    const authHeader = request.headers['authorization'];
    if (!authHeader) return response.status(401).json({ error: 'Não autorizado.' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) return response.status(401).json({ error: 'Token inválido.' });

    // 2. Busca o tenantId do usuário de RH (para segurança)
    const { data: userData } = await supabaseAdmin.from('users').select('tenantId').eq('id', user.id).single();
    if (!userData) return response.status(404).json({ error: 'Perfil de usuário não encontrado.' });
    const tenantId = userData.tenantId;

    // 3. Pega o ID da vaga da URL
    const { jobId } = request.query;
    if (!jobId) return response.status(400).json({ error: 'O ID da vaga é obrigatório.' });

    // 4. VERIFICAÇÃO DE SEGURANÇA: Confirma que a vaga solicitada pertence ao tenant do usuário
    const { data: jobData, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .eq('id', Number(jobId))
      .eq('tenantId', tenantId)
      .single();

    if (jobError || !jobData) {
      return response.status(404).json({ error: 'Vaga não encontrada ou não pertence à sua empresa.' });
    }

    // 5. Busca as candidaturas (applications) e os dados dos candidatos (candidates) para a vaga
    const { data: applications, error: applicationsError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        created_at,
        candidateId,
        candidates ( id, name, email )
      `)
      .eq('jobId', Number(jobId)); // Usa o ID da vaga convertido para número

    if (applicationsError) throw applicationsError;

    // 6. Retorna a lista de candidaturas
    return response.status(200).json({ applications });

  } catch (error) {
    console.error("Erro na função getApplicantsForJob:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}