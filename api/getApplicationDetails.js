// api/getApplicationDetails.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Valida o token do usuário de RH (segurança)
    const authHeader = request.headers['authorization'];
    if (!authHeader) return response.status(401).json({ error: 'Não autorizado.' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) return response.status(401).json({ error: 'Token inválido.' });

    // 2. Busca o tenantId do usuário de RH
    const { data: userData } = await supabaseAdmin.from('users').select('tenantId').eq('id', user.id).single();
    if (!userData) return response.status(404).json({ error: 'Perfil de usuário não encontrado.' });
    const tenantId = userData.tenantId;

    // 3. Pega o ID da candidatura da URL
    const { applicationId } = request.query;
    if (!applicationId) {
      return response.status(400).json({ error: 'O ID da candidatura é obrigatório.' });
    }

    // 4. Busca todos os dados relacionados em uma única consulta poderosa
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        created_at,
        formData,
        resumeUrl,
        candidate:candidates ( * ),
        job:jobs ( title, parameters, tenantId )
      `)
      .eq('id', Number(applicationId))
      .single();

    if (applicationError) {
      if (applicationError.code === 'PGRST116') {
         return response.status(404).json({ error: 'Candidatura não encontrada.' });
      }
      throw applicationError;
    }

    // 5. VERIFICAÇÃO DE SEGURANÇA FINAL:
    // Confirma que a vaga desta candidatura pertence ao tenant do usuário logado.
    if (application.job.tenantId !== tenantId) {
      return response.status(403).json({ error: 'Você não tem permissão para ver esta candidatura.' });
    }

    // 6. Retorna o objeto completo com todos os dados
    return response.status(200).json({ application });

  } catch (error) {
    console.error("Erro na função getApplicationDetails:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}