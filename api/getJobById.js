// api/getJobById.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Valida o token do usuário (segurança)
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return response.status(401).json({ error: 'Nenhum token de autorização fornecido.' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) {
      return response.status(401).json({ error: 'Token de autenticação inválido.' });
    }
    const userId = user.id;

    // 2. Busca o tenantId do usuário para garantir que ele só acesse suas próprias vagas
    const { data: userData, error: tenantError } = await supabaseAdmin
      .from('users')
      .select('tenantId')
      .eq('id', userId)
      .single();
    if (tenantError || !userData) {
      return response.status(404).json({ error: 'Perfil do usuário não encontrado.' });
    }
    const tenantId = userData.tenantId;

    // 3. Pega o ID da vaga da URL (ex: /api/getJobById?id=1)
    const { id: jobId } = request.query;
    if (!jobId) {
      return response.status(400).json({ error: 'O ID da vaga é obrigatório.' });
    }

    // 4. Busca a vaga específica no banco de dados
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', jobId)          // Onde o ID da vaga bate
      .eq('tenantId', tenantId) // E a vaga pertence ao tenant do usuário
      .single();                 // Esperamos apenas um resultado

    if (jobError) {
      // Se o erro for 'PGRST116', significa que a vaga não foi encontrada, o que é um erro 404
      if (jobError.code === 'PGRST116') {
         return response.status(404).json({ error: 'Vaga não encontrada ou não pertence à sua empresa.' });
      }
      throw jobError;
    }

    // 5. Retorna os detalhes da vaga com sucesso
    return response.status(200).json({ job });

  } catch (error) {
    console.error("Erro na função getJobById:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}