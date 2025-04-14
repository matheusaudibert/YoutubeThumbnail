require("dotenv").config();
const { obterUltimoComentario } = require("./src/obterComentario");
const { processarComentario } = require("./src/processarComentario");
const { setThumbnail } = require("./src/setarThumb");

async function pegarComentario() {
  try {
    console.log("Buscando o último comentário...");
    const comentario = await obterUltimoComentario();
    if (comentario) {
      console.log("Comentário obtido:", comentario.textoComentario);
      return comentario;
    } else {
      console.log("Nenhum comentário encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao pegar o comentário:", error.message);
    throw error;
  }
}

async function moderarComentario(comentario) {
  try {
    console.log("Moderando comentário...");
    const comentarioProcessado = await processarComentario(comentario);
    console.log("Comentário moderado com sucesso.");
    return comentarioProcessado;
  } catch (error) {
    console.error("Erro ao moderar o comentário:", error.message);
    throw error;
  }
}

async function gerarThumbnail(comentarioModerado) {
  try {
    console.log("Definindo a thumbnail...");
    await setThumbnail(comentarioModerado);
    console.log("Thumbnail definida com sucesso.");
  } catch (error) {
    console.error("Erro ao definir a thumbnail:", error.message);
    throw error;
  }
}

async function main() {
  try {
    const comentario = await pegarComentario();

    if (comentario) {
      const comentarioModerado = await moderarComentario(comentario);

      console.log("Gerando thumbnail...");
      await gerarThumbnail(comentarioModerado); // Passar o comentário moderado
    }
  } catch (error) {
    console.error("Erro no fluxo principal:", error.message);
  }
}

// Função que executa o código periodicamente
function iniciarTimerExecucao() {
  const INTERVALO_MINUTOS = 8;
  const INTERVALO_MS = INTERVALO_MINUTOS * 60 * 1000;

  console.log(
    `Iniciando timer. O código será executado a cada ${INTERVALO_MINUTOS} minutos.`
  );

  // Executa imediatamente na primeira vez
  main();

  // Configura o timer para execuções subsequentes
  setInterval(() => {
    console.log(
      `\n[${new Date().toLocaleString()}] Executando verificação programada...`
    );
    main();
  }, INTERVALO_MS);
}

if (require.main === module) {
  iniciarTimerExecucao();
}

module.exports = { main, iniciarTimerExecucao };
