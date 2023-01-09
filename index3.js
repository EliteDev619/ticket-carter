var https = require("https");

var options = {
  hostname: 'envapp.netlify.app',
  port: 443,
  path: '',
  method: 'GET',
  headers: {
      'Content-Type': 'text/html',
  }
};

var req = https.request(options, function (res) {
  console.log(res.statusCode);
  res.on("data", function (d) {
    process.stdout.write(d);
  });
});
req.end();

req.on("error", function (e) {
  console.log(`here comes the error ${e}`);
});
