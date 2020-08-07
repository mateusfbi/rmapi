const ClientRM = require("../service/clientRM");
const config = require("mikro-config").default;
const convert = require('xml-js');
const moment = require('moment');

const codColigada = config.get("cfg.codcoligada");
const usuario = config.get("authrm.user");
const senha = config.get("authrm.passwd");
const hoje = moment().utc().format('Y-M-D H:M:S')


module.exports = {
  async AlteraSituacao(request, response) {
    const {     
      cpf,
      codSituacao
    } = request.body;

    const dataServer = 'FopFuncData';
    let resHistorico = "";
    let chapa = "";
    let motivoMudanca = "";

    await ClientRM.ReadView({
      DataServer: dataServer,
      CodColigada: codColigada,
      Filtro: `CPF='${cpf}'`,
      CodSistema: 'G',
      Usuario: usuario,
      Senha: senha
    })
    .then(response => {
      const result = convert.xml2js(response.ReadViewResult, { compact: true });
      chapa = result.NewDataSet.PFunc.CHAPA._text;
      motivoMudanca = (codSituacao == 'A'?'03':'05');
      resHistorico = true
    })
    .catch(error => (resHistorico = { "status": 0, "Descricção": "CPF não localizado" } ));
   
    if(!chapa==""){
        await ClientRM.SaveRecord({
        DataServer: dataServer,
        CodColigada: codColigada,
        Xml: `<PFunc>
                <CODCOLIGADA>${codColigada}</CODCOLIGADA>
                <CHAPA>${chapa}</CHAPA>
                <CODSITUACAO>${codSituacao}</CODSITUACAO>
                <HSTSIT_MOTIVO>${motivoMudanca}</HSTSIT_MOTIVO>
                <HSTSIT_DATAMUDANCA>${hoje}</HSTSIT_DATAMUDANCA>
              </PFunc>`,
        CodSistema: 'G',
        Usuario: usuario,
        Senha: senha
      })
      .then(response => {
        resHistorico = { "status": 1, "Descricção": "Situação Alterada" };
      })
      .catch(error => (resHistorico = `{"status":"0","descricao":"${error}"}`));
    }  

    return response.send(resHistorico);
    
  },
  async AtualizarCadastro(request, response) {
      const {
        cpf,
        nome,     
        dtnasc,
        ufnatal,
        naturalidade,
        sexo,
        email,
        telefone,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        pais,
      } = request.body;
  
      const dataServer = 'RhuPessoaData';
      let resHistorico = "";
      let CodPessoa = "";
  
      await ClientRM.ReadView({
        DataServer: dataServer,
        CodColigada: codColigada,
        Filtro: `CPF='${cpf}'`,
        CodSistema: 'G',
        Usuario: usuario,
        Senha: senha
      })
      .then(response => {
          const result = convert.xml2js(response.ReadViewResult, { compact: true });
          CodPessoa = (JSON.stringify(result.NewDataSet) === "{}"?"":result.NewDataSet.VCandidatos.CODPESSOA._text);
          resHistorico = (CodPessoa != ""?'':'{"status":"","descricao":"Pessoa não cadastrada"}')
      })
      .catch(error => (resHistorico = error));
  
      if(CodPessoa == ""){  
          await ClientRM.SaveRecord({
              DataServer: dataServer,
              CodColigada: codColigada,
              Xml: `<PPessoa>  
                <CODIGO>${CodPessoa}</CODIGO>  
                <NOME>${nome}</NOME>  
                <DTNASCIMENTO>${dtnasc}T00:00:00</DTNASCIMENTO>  
                <ESTADONATAL>${ufnatal}</ESTADONATAL>  
                <NATURALIDADE>${naturalidade}</NATURALIDADE>  
                <SEXO>${sexo}</SEXO>  
                <EMAIL>${email}</EMAIL>  
                <RUA>${rua}</RUA>  
                <NUMERO>${numero}</NUMERO>  
                <BAIRRO>${bairro}</BAIRRO>  
                <CIDADE>${cidade}/CIDADE>  
                <ESTADO>${estado}</ESTADO>  
                <CEP>${cep}</CEP>  
                <PAIS>${pais}</PAIS>  
                <TELEFONE1>${telefone}</TELEFONE1>  
                <CORRACA>0</CORRACA>  
                <NACIONALIDADE>10</NACIONALIDADE>  
                <CANDIDATO>1</CANDIDATO>  
                <FUNCIONARIO>1</FUNCIONARIO>  
              </PPessoa>`,
              CodSistema: 'G',
              Usuario: usuario,
              Senha: senha
          })
          .then(response => {           
              resHistorico = {"status":"1","descricao":"Alteração Realizada"}
          })
          .catch(error => (resHistorico = `{"status":"0","descricao":"${error}"}`));       
      }
  
      return response.send(resHistorico);
  
      }

};
