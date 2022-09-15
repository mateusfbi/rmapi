const { Router } = require("express");
const FuncionarioController = require("./controllers/FuncionarioController");
//const CandidatoController = require("./controllers/CandidatoController");

const routes = Router();

routes.get("/",function(req,res){
	 res.sendFile(__dirname + "/html/index.html"); 
	
});
//routes.post("/totvs/v1/candidato", CandidatoController.CadastroCandidato);
//routes.post("/totvs/v1/cadastro", FuncionarioController.AtualizarCadastro);
//routes.post("/totvs/v1/situacao", FuncionarioController.AlteraSituacao);
routes.post("/totvs/v1/funcionario/pesquisar", FuncionarioController.Pesquisar);



module.exports = routes;
