var Service = require('node-windows').Service;

var svc = new Service({
	name:'TOTVS-RMAPI',
	description: 'Serviço da Customização API RM',
	script: 'C:\\totvs\\rmapi\\index.js'
});
svc.on('install',function(){
	svc.start();
});
svc.install();
