const ClientRM = require("../service/clientRM");
const config = require("mikro-config").default;
const convert = require('xml-js');
const moment = require('moment');

const codColigada = config.get("cfg.codColigada");
const usuario = config.get("authrm.user");
const senha = config.get("authrm.passwd");
const hoje = moment().format().substring(0,19);

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
        let CodPessoa = "0";

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
            CodPessoa = (JSON.stringify(result.NewDataSet) === '{}'?"0":result.NewDataSet.VCandidatos.CODPESSOA._text);
            console.log(codColigada,CodPessoa);
            resHistorico = (CodPessoa != ""?'{"codigo":"0","descricao":"Pessoa já cadastrada, Dados Atualizados"}':'1');
        })
        .catch(error => (resHistorico = `{"codigo":"0","descricao":"${error}"}` ));
        
        let xml = `<RhuCandidatos><VCandidatos>
        <CODPESSOA>${CodPessoa}</CODPESSOA>
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
        <CANDIDATO>1</CANDIDATO>
        <DATACADASTRAMENTO>${hoje}</DATACADASTRAMENTO>
        <DATAAPROVACAOCURR>${hoje}</DATAAPROVACAOCURR>
        </VCandidatos></RhuCandidatos>`;

        await ClientRM.SaveRecord({
            DataServer: dataServer,
            CodColigada: codColigada,
            Xml: xml,
            CodSistema: 'V',
            Usuario: usuario,
            Senha: senha
        })
        .then(response => {           
            resHistorico = response.SaveRecordResult;
            resHistorico = resHistorico.indexOf("=") > 0?`{"codigo":"0","descricao":"${resHistorico.substring(0,resHistorico.indexOf("="))}"}`:`{"codigo":"1","descricao":"Pessoa incluída com sucesso (${resHistorico})"}`;            
        })
        .catch(error => (resHistorico = `{"codigo":"0","descricao":"${error}"}`));      

        return response.send(resHistorico);
        
    }  
};
