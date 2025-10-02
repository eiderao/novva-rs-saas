// api/apply.js
import { createClient } from '@supabase/supabase-js';
import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';

// Desativa o 'body parser' padrão da Vercel, pois vamos lidar com o formulário manualmente
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const form = formidable({});

    // O formidable irá processar a requisição (dados e arquivo)
    const [fields, files] = await form.parse(request);

    // 1. Validação dos dados recebidos
    const { jobId, name, email, phone, linkedinProfile, githubProfile, ...otherData } = fields;
    const resumeFile = files.resume;

    if (!jobId || !name || !email || !resumeFile) {
      return response.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // 2. Upload do currículo para o Supabase Storage
    const fileContent = fs.readFileSync(resumeFile[0].filepath);
    const fileExtension = path.extname(resumeFile[0].originalFilename);
    const fileName = `${email[0].replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, fileContent, {
        contentType: resumeFile[0].mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erro no upload do currículo: ${uploadError.message}`);
    }

    // 3. Verifica se o candidato já existe, ou o cria
    let { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidates')
      .select('id')
      .eq('email', email[0])
      .single();

    if (candidateError && candidateError.code !== 'PGRST116') { // PGRST116 = not found, o que é ok
      throw candidateError;
    }

    if (!candidate) {
      // Candidato não existe, vamos criá-lo
      const { data: newCandidate, error: newCandidateError } = await supabaseAdmin
        .from('candidates')
        .insert({ 
          name: name[0], 
          email: email[0],
          phone: phone ? phone[0] : null,
          linkedinProfile: linkedinProfile ? linkedinProfile[0] : null,
          githubProfile: githubProfile ? githubProfile[0] : null,
         })
        .select('id')
        .single();

      if (newCandidateError) throw newCandidateError;
      candidate = newCandidate;
    }

    // 4. Salva a candidatura na tabela 'applications'
    const { error: applicationError } = await supabaseAdmin
      .from('applications')
      .insert({
        jobId: jobId[0],
        candidateId: candidate.id,
        resumeUrl: uploadData.path, // O caminho do arquivo no Storage
        formData: otherData, // O restante dos dados do formulário
      });

    if (applicationError) throw applicationError;

    // 5. Retorna sucesso
    return response.status(201).json({ message: 'Candidatura enviada com sucesso!' });

  } catch (error) {
    console.error("Erro na função de candidatura:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}