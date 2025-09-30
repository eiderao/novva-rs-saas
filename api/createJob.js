// api/createJob.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  // Garante que estamos recebendo um método POST
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: `Método ${request.method} não permitido.` });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Valida o token do usuário
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

    // 2. Busca o tenantId do usuário
    const { data: userData, error: tenantError } = await supabaseAdmin
      .from('users')
      .select('tenantId')
      .eq('id', userId)
      .single();

    if (tenantError || !userData) {
      return response.status(404).json({ error: 'Perfil do usuário não encontrado.' });
    }
    const tenantId = userData.tenantId;

    // 3. Pega o título da nova vaga do corpo da requisição
    const { title } = request.body;
    if (!title) {
      return response.status(400).json({ error: 'O título da vaga é obrigatório.' });
    }

    // 4. Insere a nova vaga no banco de dados
    const { data: newJob, error: insertError } = await supabaseAdmin
      .from('jobs')
      .insert({
        title: title,
        tenantId: tenantId,
        status: 'active' // Status padrão para novas vagas
      })
      .select() // Pede ao Supabase para retornar a linha recém-criada
      .single();

    if (insertError) {
      throw insertError;
    }

    // 5. Retorna a vaga recém-criada com o status 201 (Created)
    return response.status(201).json({ newJob });

  } catch (error) {
    console.error("Erro na função createJob:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}