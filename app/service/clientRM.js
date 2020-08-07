const soap = require("soap");

const url = "http://brandaowin:8051/wsDataServer/MEX?wsdl";

const ClientRM = {
  SaveRecord(pDadosRequisicao) {
    return new Promise((resolve, reject) => {
      const {
        DataServer,
        CodColigada,
        Xml,
        CodSistema,
        Usuario,
        Senha
      } = pDadosRequisicao;

      soap.createClient(url, function(err, client) {
        if (err) reject(err);

        client.setSecurity(new soap.BasicAuthSecurity(Usuario, Senha));

        const args = {};
        args.DataServerName = DataServer;
        args.XML = Xml;
        args.Contexto = `CODSISTEMA=${CodSistema};CODCOLIGADA=${CodColigada};CODUSUARIO=${Usuario}`;

        client.SaveRecord(args, function(err, result) {
          if (err) reject(err);

          resolve(result);
        });
      });
    })
  },
  ReadView(pDadosRequisicao){
    return new Promise((resolve, reject) => {
      const {
        DataServer,
        CodColigada,
        Filtro,
        CodSistema,
        Usuario,
        Senha
      } = pDadosRequisicao;

      soap.createClient(url, function(err, client) {
        if (err) reject(err);

        client.setSecurity(new soap.BasicAuthSecurity(Usuario, Senha));

        const args = {};
        args.DataServerName = DataServer;
        args.Filtro = Filtro;
        args.Contexto = `CODSISTEMA=${CodSistema};CODCOLIGADA=${CodColigada};CODUSUARIO=${Usuario}`;

        client.ReadView(args, function(err, result) {
          if (err) reject(err);

          resolve(result);
        });
      });
    })
  }
};

module.exports = ClientRM;
