var https = require('https');

https.createServer(function(req, res) {
  res.write("Botunuz Güvenli Bir Şekilde 7/24 Olmuştur");
  res.end();
}).listen(process.env.port);