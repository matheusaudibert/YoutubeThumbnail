const { gerarImagemComentario } = require("./gerarThumb");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "models/gemini-1.5-pro-002";

async function moderarComentarioComIA(texto) {
  console.log("Moderando comentário:", texto);
  try {
    const prompt = `
Você é um moderador inteligente de comentários do YouTube.

Objetivo:
- Censurar apenas palavras ou expressões claramente ofensivas, de baixo calão, sexuais explícitas ou violentas.
- Seja moderado: não censure palavras comuns ou elogios.
- Não censure variações inofensivas ou gírias que não sejam ofensivas de verdade.

Regras:
1. Substitua palavras ofensivas por asteriscos (*) com o mesmo número de letras. Ex: "caralho" -> "*******"
2. Não remova risadas como "kkkk", "KKKK", "haha", "HAHA", etc.
3. Mantenha todos os links no comentário.
4. Remova apenas tags HTML como <br>, <p>, etc.
5. Substitua '/n' por '<br>'.
6. Preserve o restante do texto, pontuação, emojis e formatação original.
7. **Não censure palavras neutras ou elogiosas como "muito bom", "massa", "legal", "top", etc.**

Comentário a moderar:
"${texto}"

Retorne apenas o comentário censurado, sem explicações ou observações adicionais.
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log(data);

    const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (output) {
      return limparResposta(output);
    }

    return texto;
  } catch (error) {
    console.error("Erro na moderação:", error.message);
    return texto;
  }
}

function limparResposta(texto) {
  return texto
    .trim()
    .replace(/^(comentário censurado:|comentário:|aqui está:)/i, "")
    .replace(/^["“”\s]+/, "")
    .replace(/["“”\s]+$/, "")
    .trim();
}

async function processarComentario(comentario) {
  try {
    const textoModerado = await moderarComentarioComIA(
      comentario.textoComentario
    );
    const comentarioProcessado = {
      ...comentario,
      textoComentario: textoModerado,
    };

    console.log("Gerando imagem do comentário...");
    await gerarImagemComentario(comentarioProcessado);
    return comentarioProcessado;
  } catch (error) {
    console.error("Erro no processamento:", error.message);
    throw error;
  }
}

module.exports = { processarComentario };
