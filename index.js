const express = require("express");
const routes = require("./app/routes");
const config = require("mikro-config").default;

const app = express();

app.use(express.json());
app.use(routes);

app.listen(config.get("server.port"));

console.log(`Servidor rodando na porta ${config.get("server.port")}`);
