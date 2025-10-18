// api/apply.js (Versão com Limite de 3 Candidatos)
import { createClient } from '@supabase/supabase-js';
import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';

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
    const [fields, files] = await form.parse(request);
    
    const jobId = fields.jobId ? fields.jobId[0] : null;
    if (!jobId) {
      return response.status(400).json({ error: 'ID da vaga é obrigatório.' });
    }

    // --- LÓGICA DE LIMITE ADICIONADA ---
    const { count, error: countError } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('jobId', jobId);

    if (countError) throw countError;

    if (count >= 3) {
      return response.status(403).json({ error: 'Limite de 3 candidaturas para esta vaga foi atingido.' });
    }
    // --- FIM DA LÓGICA DE LIMITE ---

    const { name, email } = fields;
    const resumeFile = files.resume;
    if (!name || !email || !resumeFile) {
      return response.status(400).json({ error: 'Nome, e-mail e currículo são obrigatórios.' });
    }
    
    const fileContent = fs.readFileSync(resumeFile[0].filepath);
    const fileExtension = path.extname(resumeFile[0].originalFilename);
    const fileName = `${email[0].replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}${fileExtension}`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, fileContent, { contentType: resumeFile[0].mimetype, upsert: false });
    if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

    let { data: candidate } = await supabaseAdmin.from('candidates').select('id').eq('email', email[0]).single();

    if (!candidate) {
      const { data: newCandidate, error: newCandidateError } = await supabaseAdmin
        .from('candidates')
        .insert({ name: name[0], email: email[0] })
        .select('id')
        .single();
      if (newCandidateError) throw newCandidateError;
      candidate = newCandidate;
    }
    
    const applicationFields = {};
    for (const key in fields) {
        applicationFields[key] = fields[key][0];
    }

    const { error: applicationError } = await supabaseAdmin
      .from('applications')
      .insert({
        jobId: jobId,
        candidateId: candidate.id,
        resumeUrl: uploadData.path,
        formData: applicationFields,
      });
    if (applicationError) throw applicationError;
    
    return response.status(201).json({ message: 'Candidatura enviada com sucesso!' });

  } catch (error) {
    console.error("Erro na candidatura:", error);
    return response.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
}