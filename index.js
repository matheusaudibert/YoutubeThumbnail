require("dotenv").config();
const { obterUltimoComentario } = require("./src/obterComentario");
const { processarComentario } = require("./src/processarComentario");
const { setThumbnail } = require("./src/setarThumb");

async function pegarComentario() {
  try {
    console.log("Buscando o último comentário...");
    const comentario = await obterUltimoComentario();
    if (comentario) {
      console.log("✅ Comentário encontrado:", comentario.textoComentario);
      return comentario;
    } else {
      console.log("❌ Nenhum comentário encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao pegar o comentário:", error.message);
    throw error;
  }
}

async function moderarComentario(comentario) {
  try {
    const comentarioProcessado = await processarComentario(comentario);
    console.log(
      "✅ Comentário censurado com sucesso:",
      comentarioProcessado.textoComentario
    );
    return comentarioProcessado;
  } catch (error) {
    console.error("❌ Erro ao moderar o comentário:", error.message);
    throw error;
  }
}

async function gerarThumbnail(comentarioModerado) {
  try {
    await setThumbnail(comentarioModerado);
    console.log("✅ Thumbnail definida com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao definir a thumbnail:", error.message);
    throw error;
  }
}

async function main() {
  try {
    const comentario = await pegarComentario();

    if (comentario) {
      const comentarioModerado = await moderarComentario(comentario);
      await gerarThumbnail(comentarioModerado);
    }
  } catch (error) {
    console.error("❌ Erro no fluxo principal:", error.message);
  }
}

function iniciarTimerExecucao() {
  const INTERVALO_MINUTOS = 8;
  const INTERVALO_MS = INTERVALO_MINUTOS * 60 * 1000;

  main();

  setInterval(() => {
    console.log(`\n[${new Date().toLocaleString()}]`);
    main();
  }, INTERVALO_MS);
}

if (require.main === module) {
  iniciarTimerExecucao();
}

module.exports = { main, iniciarTimerExecucao };
