// api/getJobs.js
import { createClient } from '@supabase/supabase-js';

// O handler padrão para Funções Serverless da Vercel
export default async function handler(request, response) {
  try {
    // Inicializa o cliente Supabase com as chaves de administrador que salvamos na Vercel.
    // Isso dá à nossa função poder total sobre o banco de dados.
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Pega o token de autenticação enviado pelo frontend
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return response.status(401).json({ error: 'Nenhum token de autorização fornecido.' });
    }
    const token = authHeader.replace('Bearer ', '');

    // 2. Valida o token e obtém os dados do usuário
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) {
      return response.status(401).json({ error: 'Token de autenticação inválido.' });
    }

    const userId = user.id;

    // 3. Busca o tenantId do usuário na nossa tabela 'users'
    // (Esta tabela ainda não existe, vamos criá-la no Passo 3)
    const { data: userData, error: tenantError } = await supabaseAdmin
      .from('users')
      .select('tenantId')
      .eq('id', userId) // Onde a coluna 'id' da tabela 'users' é igual ao UID do usuário
      .single(); // Esperamos apenas um resultado

    if (tenantError || !userData) {
      return response.status(404).json({ error: 'Perfil do usuário não encontrado no banco de dados.' });
    }

    const tenantId = userData.tenantId;

    // 4. Busca na tabela 'jobs' todas as vagas que pertencem àquele tenantId
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select('*') // Seleciona todas as colunas
      .eq('tenantId', tenantId);

    if (jobsError) {
      throw jobsError; // Lança o erro para ser pego pelo bloco catch
    }

    // 5. Retorna a lista de vagas com sucesso
    return response.status(200).json({ jobs });

  } catch (error) {
    // Se qualquer coisa der errado, retorna um erro genérico
    console.error("Erro na função getJobs:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}