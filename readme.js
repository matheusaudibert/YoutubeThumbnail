const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const readmePath = path.join(__dirname, "README.md");
const thumbnailPath = path.join(__dirname, "thumbnail.png");

async function atualizarReadme() {
  try {
    let readmeContent = await fs.readFile(readmePath, "utf8");

    const timestamp = new Date().getTime();
    const imageTag = `![Latest Thumbnail](./thumbnail.png?t=${timestamp})`;

    const secaoPattern = /## 🎴 Last Thumb\s*\n\s*([\s\S]*?)(?=\s*##|$)/;

    if (secaoPattern.test(readmeContent)) {
      readmeContent = readmeContent.replace(
        secaoPattern,
        `## 🎴 Last Thumb\n\n${imageTag}\n\n`
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

async function commitParaGithub() {
  try {
    const dataHora = new Date().toISOString();

    await execPromise("git add README.md thumbnail.png");

    try {
      await execPromise("git add readme.js");
    } catch (e) {
      console.log("Nota: readme.js não foi alterado ou não existe");
    }

    await execPromise(
      `git commit -m "Atualização automática da thumbnail - ${dataHora}"`
    );
    await execPromise("git push");
    console.log("Alterações enviadas para o GitHub com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer commit para o GitHub:", error);

    try {
      const { stdout } = await execPromise("git status");
      console.log("Status atual do Git:", stdout);
    } catch (statusError) {
      console.error("Erro ao verificar status do Git:", statusError);
    }

    throw error;
  }
}

module.exports = { atualizarReadme };
