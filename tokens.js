require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");

const app = express();
const port = 3000;

const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";
const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Rota para iniciar o processo de autenticação
app.get("/", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  res.send(`
    <h1>Autenticação com Google</h1>
    <p><a href="${authUrl}">Clique aqui para autorizar o app</a></p>
  `);
});

// Rota para receber o código de autorização
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Código de autorização não encontrado.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("\n===== TOKENS GERADOS COM SUCESSO =====");
    console.log("Adicione estes valores ao seu arquivo .env:\n");
    console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\n=======================================");

    res.send("Tokens gerados com sucesso! Verifique o terminal.");
  } catch (error) {
    console.error("Erro ao obter tokens:", error.message);
    res.status(500).send("Erro ao obter tokens.");
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
