const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const readmePath = path.join(__dirname, "README.md");
async function atualizarReadme() {
  try {
    let readmeContent = await fs.readFile(readmePath, "utf8");

    const imageTag = `![Latest Thumbnail](./thumbnail.png)`;

    const secaoPattern = /## 🎴 Last Thumb\s*\n\s*([\s\S]*?)(?=\s*##|$)/;

    if (secaoPattern.test(readmeContent)) {
      readmeContent = readmeContent.replace(
        secaoPattern,
        `## 🎴 Last Thumb\n\n${imageTag}`
      );
    } else {
      readmeContent = readmeContent.replace(
        /# 🎬 Youtube Thumbnail\s*\n/,
        `# 🎬 Youtube Thumbnail\n\n## 🎴 Last Thumb\n\n${imageTag}\n\n`
      );
    }

    await fs.writeFile(readmePath, readmeContent, "utf8");
    console.log("README atualizado com sucesso.");

    await commitParaGithub();
  } catch (error) {
    console.error("Erro ao atualizar o README:", error);
    throw error;
  }
}

/**
 * Executa os comandos git para fazer commit e push das alterações
 */
async function commitParaGithub() {
  try {
    const dataHora = new Date().toISOString();
    await execPromise("git add README.md");
    await execPromise(
      `git commit -m "Atualização automática da thumbnail - ${dataHora}"`
    );
    await execPromise("git push");
    console.log("Alterações enviadas para o GitHub com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer commit para o GitHub:", error);
    throw error;
  }
}

module.exports = { atualizarReadme };
