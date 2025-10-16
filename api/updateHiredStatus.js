// api/updateHiredStatus.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido.' });
  }

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
    
    const { applicationId, isHired } = request.body;
    if (!applicationId || typeof isHired !== 'boolean') {
      return response.status(400).json({ error: 'applicationId e isHired (booleano) são obrigatórios.' });
    }

    const { data, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ isHired: isHired })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) throw updateError;

    return response.status(200).json({ message: 'Status do candidato atualizado com sucesso!', updatedApplication: data });

  } catch (error) {
    console.error("Erro ao atualizar status de contratação:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}