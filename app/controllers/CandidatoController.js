const ClientRM = require("../service/clientRM");
const config = require("mikro-config").default;
const convert = require('xml-js');

const codColigada = config.get("cfg.codcoligada");
const usuario = config.get("authrm.user");
const senha = config.get("authrm.passwd");

module.exports = {
    async CadastroCandidato(request, response) {
    const {     
       cpf,
       nome,
       sexo,
       dtnasc,
       naturalidade,
       nacionalidade,
       grauinst,
       email,
       telefone,
       rg,
       ufrg,
       emissorrg,
       dtemissaorg,
       rua,
       numero,
       bairro,
       cidade,
       uf,
       cep,
       pais
    } = request.body;

    const dataServer = 'RhuCandidatosData';
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
        CodPessoa = (JSON.stringify(result.NewDataSet) === '{}'?"":result.NewDataSet.VCandidatos.CODPESSOA._text);
        console.log(codColigada,CodPessoa);
        resHistorico = (CodPessoa != ""?'{"status":"0","descricao":"Pessoa já cadastrada"}':'1');
    })
    .catch(error => (resHistorico = `{"status":"0","descricao":"${error}"}` ));

    if(CodPessoa == ""){  
        await ClientRM.SaveRecord({
            DataServer: dataServer,
            CodColigada: codColigada,
            Xml: `<VCandidatos>
            <CODPESSOA>0</CODPESSOA>
            <NOME>${nome}</NOME>
            <CPF>${cpf}</CPF>
            <SEXO>${sexo}</SEXO>
            <DTNASCIMENTO>${dtnasc}T00:00:00</DTNASCIMENTO> 
            <NATURALIDADE>${naturalidade}</NATURALIDADE>             
            <NACIONALIDADE>${nacionalidade}</NACIONALIDADE>             
            <GRAUINSTRUCAO>${grauinst}</GRAUINSTRUCAO>
            <EMAIL>${email}</EMAIL> 
            <TELEFONE1>${telefone}</TELEFONE1>             
            <CARTIDENTIDADE>${rg}</CARTIDENTIDADE>  
            <UFCARTIDENT>${ufrg}</UFCARTIDENT>  
            <ORGEMISSORIDENT>${emissorrg}</ORGEMISSORIDENT>  
            <DTEMISSAOIDENT>${dtemissaorg}T00:00:00</DTEMISSAOIDENT>  
            <RUA>${rua}</RUA>  
            <NUMERO>${numero}</NUMERO>  
            <BAIRRO>${bairro}</BAIRRO>  
            <CIDADE>${cidade}</CIDADE>
            <ESTADO>${uf}</ESTADO>  
            <CEP>${cep}</CEP>  
            <PAIS>${pais}</PAIS> 
            <DEFICIENTEFISICO>0</DEFICIENTEFISICO>
            <DEFICIENTEAUDITIVO>0</DEFICIENTEAUDITIVO>
            <DEFICIENTEFALA>0</DEFICIENTEFALA>
            <DEFICIENTEVISUAL>0</DEFICIENTEVISUAL>
            <DEFICIENTEMENTAL>0</DEFICIENTEMENTAL>
            <DEFICIENTEINTELECTUAL>0</DEFICIENTEINTELECTUAL>            
            <BRPDH>0</BRPDH>
            <ALUNO>0</ALUNO>
            <PROFESSOR>0</PROFESSOR>
            <FUNCIONARIO>0</FUNCIONARIO>
            <EXFUNCIONARIO>0</EXFUNCIONARIO>
            <USUARIOBIBLIOS>0</USUARIOBIBLIOS>
            <CANDIDATO>1</CANDIDATO>
            </VCandidatos>`,
            CodSistema: 'G',
            Usuario: usuario,
            Senha: senha
        })
        .then(response => {           
            resHistorico = response.SaveRecordResult;
            console.log(resHistorico.indexOf("=") ,resHistorico.substring(0,resHistorico.indexOf("=")));
            resHistorico = resHistorico.indexOf("=") > 0?`{"status":"0","descricao":"${response.SaveRecordResult}"}`:{"status":"1","descricao":"Pessoa incluída com sucesso"};            
        })
        .catch(error => (resHistorico = `{"status":"0","descricao":"${error}"}`));      
    }

    return response.send(resHistorico);

    } 

};


/**
CODINTERNO	DESCRICAO
1	Analfabeto
2	Até o 5º ano incompleto do ensino fundamental
3	5º ano completo do ensino fundamental
4	Do 6º ao 9º ano do ensino fundamental 
5	Ensino fundamental completo
6	Ensino médio incompleto
7	Ensino médio completo
8	Educação superior incompleto
9	Educação superior completo
A	Pós Grad. incompleto
B	Pós Grad. completo
C	Mestrado incompleto
D	Mestrado completo
E	Doutorado incompleto
F	Doutorado completo
G	Pós Dout.incompleto
H	Pós Dout.completo
**/

/**
CODINTERNO	DESCRICAO
10	Brasileira
**/