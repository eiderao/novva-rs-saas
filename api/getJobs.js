// api/getJobs.js (Teste "Olá, Mundo")

export default function handler(request, response) {
  // A única coisa que esta função faz é registrar um log e responder.
  console.log("--- FUNÇÃO 'Olá, Mundo' FOI CHAMADA! ---");
  response.status(200).json({ message: "Olá, Mundo! A função foi executada." });
}
