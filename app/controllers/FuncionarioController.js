const ClientRM = require("../service/clientRM");
const config = require("mikro-config").default;
const convert = require('xml-js');
const moment = require('moment');

const codColigada = config.get("cfg.codColigada");
const usuario = config.get("authrm.user");
const senha = config.get("authrm.passwd");
const hoje = moment().format("Y-MM-D");

module.exports = {
  async AlteraSituacao(request, response) {
      const { 
        cpf, 
        situacao 
      } = request.body;

      const dataServer = 'FopFuncData';
      let resHistorico = "";
      let chapa = "";
      let motivoMudanca = "";

      await ClientRM.ReadView({
        DataServer: dataServer,
        CodColigada: codColigada,
        Filtro: `CPF='${cpf}' AND DATADEMISSAO IS NULL`,
        CodSistema: 'G',
        Usuario: usuario,
        Senha: senha
      })
      .then(response => {
	if(situacao=="A" || situacao=="D"){
	   const result = convert.xml2js(response.ReadViewResult, { compact: true });
	   console.log(result);
	   chapa = result.NewDataSet.PFunc.CHAPA._text;	
		   motivoMudanca = (situacao == 'A'?'01':'03');
	   console.log(`${chapa} - ${motivoMudanca} - ${situacao}`);
	   resHistorico = true
	}else{
	   resHistorico = `{ "codigo": 0, "Descricao": "Situacao diferente de "A" ou "D"" }`
	}
      })
      .catch(error => (resHistorico = `{ "codigo": 0, "Descricção": "CPF não localizado - ${error}" }` ));
    
      if(!chapa==""){
          await ClientRM.SaveRecord({
          DataServer: dataServer,
          CodColigada: codColigada,
          Xml: `<FopFunc><PFunc>
                  <CODCOLIGADA>${codColigada}</CODCOLIGADA>
                  <CHAPA>${chapa}</CHAPA>
                  <CODSITUACAO>${situacao}</CODSITUACAO>
                  <HSTSIT_MOTIVO>${motivoMudanca}</HSTSIT_MOTIVO>
                  <HSTSIT_DATAMUDANCA>${hoje}</HSTSIT_DATAMUDANCA>
                </FopFunc></PFunc>`,
          CodSistema: 'G',
          Usuario: usuario,
          Senha: senha
        })
        .then(response => {
          resHistorico = response.SaveRecordResult;
          resHistorico = resHistorico.indexOf("=") > 0?`{"codigo":"0","descricao":"${resHistorico.substring(0,resHistorico.indexOf("="))}"}`:`{"codigo":"1","descricao":"Situação Alterada (${resHistorico})"}`; 
        })
        .catch(error => (resHistorico = `{"codigo":"0","descricao":"${error}"}`));
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
        pais
      } = request.body;
  
      const dataServer = 'RhuPessoaData';
      let resHistorico = "";
      let CodPessoa = "";
  
      await ClientRM.ReadView({
        DataServer: dataServer,
        CodColigada: codColigada,
        Filtro: `CPF='${cpf}'`,
        CodSistema: 'V',
        Usuario: usuario,
        Senha: senha
      })
      .then(response => {
          const result = convert.xml2js(response.ReadViewResult, { compact: true });
          CodPessoa = (JSON.stringify(result.NewDataSet) === "{}"?"":result.NewDataSet.PPESSOA.CODIGO._text);
          resHistorico = (CodPessoa != ""?'':'{"codigo":"","descricao":"Pessoa não cadastrada"}')
      })
      .catch(error => (resHistorico = error));

      let xml = `<RhuPessoa><PPessoa><CODIGO>${CodPessoa}</CODIGO>`; 
          xml += nome != ""?`<NOME>${nome}</NOME>`:"";
          xml += dtnasc != ""?`<DTNASCIMENTO>${dtnasc}T00:00:00</DTNASCIMENTO>`:"";
          xml += ufnatal != ""?`<ESTADONATAL>${ufnatal}</ESTADONATAL>`:"";
          xml += naturalidade != ""?`<NATURALIDADE>${naturalidade}</NATURALIDADE>`:"";
          xml += sexo != ""?`<SEXO>${sexo}</SEXO>`:"";
          xml += email != ""?`<EMAIL>${email}</EMAIL>`:"";
          xml += telefone != ""?`<TELEFONE1>${telefone}</TELEFONE1>`:"";
          xml += rua != ""?`<RUA>${rua}</RUA>`:"";
          xml += numero != ""?`<NUMERO>${numero}</NUMERO> `:"";
          xml += bairro != ""?`<BAIRRO>${bairro}</BAIRRO>`:"";
          xml += cidade != ""?`<CIDADE>${cidade}/CIDADE>`:"";
          xml += estado != ""?`<ESTADO>${estado}</ESTADO>`:"";
          xml += cep != ""?`<CEP>${cep}</CEP>`:"";
          xml += pais != ""?`<PAIS>${pais}</PAIS> `:"";
          xml += "</PPessoa></RhuPessoa>";
          console.log(xml);

      if(CodPessoa != ""){  
          await ClientRM.SaveRecord({
              DataServer: dataServer,
              CodColigada: codColigada,
              Xml: xml,
              CodSistema: 'G',
              Usuario: usuario,
              Senha: senha
          })
          .then(response => {           
            resHistorico = response.SaveRecordResult;
            resHistorico = resHistorico.indexOf("=") > 0?`{"codigo":"0","descricao":"${resHistorico.substring(0,resHistorico.indexOf("="))}"}`:`{"codigo":"1","descricao":"Dados Atualizados (${resHistorico})"}`; 
          })
          .catch(error => (resHistorico = `{"codigo":"0","descricao":"${error}"}`));       
      }
  
      return response.send(resHistorico);
  
  },
  async Pesquisar(request, response) {

    const cpf = request.body.CPF;

    const dataServer = 'FopFuncData';
    let resHistorico = "";
    let chapa = "";
  
    await ClientRM.ReadView({
        DataServer: dataServer,
        CodColigada: '1',
        Filtro: `CPF='${cpf}'`,
        CodSistema: 'P',
        Usuario: usuario,
        Senha: senha
      })
      .then(response => {
        const result = convert.xml2js(response.ReadViewResult, { compact: true });
        //chapa = result.NewDataSet.PFunc.CHAPA._text;
        //situacao = result.NewDataSet.PFunc.CODSITUACAO._text;	
        const ret = result.NewDataSet.PFunc;
        const qtd = ret.length;
        console.log(qtd);
        i = 0
        if(qtd == undefined){
            resHistorico = `{ "NOME": "${ret.NOME._text}", "SITUACAO": "${ret.CODSITUACAO._text}" }`
        }else{
          let dataB = new Date();
          
          ret.forEach(element => {
              let dataAdm = element.DATAADMISSAO._text.split("T");              
              let dataA = new Date(dataAdm[0]);	
              console.log(`DATA A: ${dataA} - DATA B ${dataB}`);
              if (dataB > dataA){ 
                resHistorico = `{ "NOME": "${element.NOME._text}", "SITUACAO": "${element.CODSITUACAO._text}" }`
              }else{
                resHistorico = `{ "NOME": "${element.NOME._text}", "SITUACAO": "${element.CODSITUACAO._text}" }`
              }
              dataB = dataA  
          });
        }
        //resHistorico = result.NewDataSet.PFunc;

      })
      .catch(error => (resHistorico = `{ "codigo": 0, "Descricao": "CPF nao localizado - ${error}" }` ));


    return response.send(resHistorico);
  
  }


};
