const { Router } = require("express");
const FuncionarioController = require("./controllers/FuncionarioController");
const CandidatoController = require("./controllers/CandidatoController");

const routes = Router();

routes.post("/totvs/v1/candidato", CandidatoController.CadastroCandidato);
routes.post("/totvs/v1/atualizar-cadastro", FuncionarioController.AtualizarCadastro);
routes.post("/totvs/v1/atualizar-situacao", FuncionarioController.AlteraSituacao);

module.exports = routes;
