const { gerarImagemComentario } = require("./gerarThumb");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "models/gemini-1.5-pro-002";

async function moderarComentario(texto) {
  const prompt = `
Você é um moderador de comentários do YouTube.

Regras:
- Censure apenas palavrões ou ofensas reais.
- Substitua por "*", mesmo número de letras.
- Preserve risadas, links, emojis e elogios.
- Remova tags HTML e troque '/n' por '<br>'.
- Responda apenas com o comentário censurado, sem explicações.

Comentário: "${texto}"
`.trim();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await res.json();
    const censurado = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return censurado;
  } catch (err) {
    console.error("❌ Erro na moderação:", err.message);
    return texto;
  }
}

async function processarComentario(comentario) {
  comentario.textoComentario = await moderarComentario(
    comentario.textoComentario
  );
  await gerarImagemComentario(comentario);

  return comentario;
}

module.exports = { processarComentario };
