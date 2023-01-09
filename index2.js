// var url = require('url');
// var https = require('https');
// var HttpsProxyAgent = require('https-proxy-agent');

// // HTTP/HTTPS proxy to connect to
// var proxy = 'http://gw-am.ntnt.io:5959';

// var endpoint = 'https://envapp.netlify.app:443';
// var opts = url.parse(endpoint);

// var agent = new HttpsProxyAgent(proxy);
// opts.agent = agent;

// https.get(opts, function (res) {
//   console.log('"response" event!', res.headers);
//   res.pipe(process.stdout);
// });

// console.log(url.parse("http://AirForceOne-sub-kamakazeevenuecart-cc-row:d7cmO5rk4Tj2@gw-am.ntnt.io:5959"));
// npm config set proxy http://username:password@proxy_name:port
// http://AirForceOne-sub-kamakazeevenuecart-cc-row:d7cmO5rk4Tj2@gw-am.ntnt.io:5959
// npm config set http-proxy http://username:password@proxy_name:port

var https = require("https");
var HttpsProxyAgent = require("https-proxy-agent");
var proxy = "http://AirForceOne-sub-kamakazeevenuecart-cc-row-sid-1:d7cmO5rk4Tj2@gw-am.ntnt.io:5959";
var agent = new HttpsProxyAgent(proxy);

var options = {
  hostname: "envapp.netlify.app",
  port: 443,
  path: "",
  method: "GET",
  agent: agent,
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
