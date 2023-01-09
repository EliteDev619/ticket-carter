// const express = require('express');
// const app = express();

// app.listen(3000, function() {
//   console.log("Server is listening on port 3000...");
// });

// app.get('/', function(req, res) {
//   res.send("Hello world!")
// });

var https = require("https");
var FormData = require("form-data");
var querystring = require("querystring");
var cheerio = require("cheerio");

var HttpsProxyAgent = require("https-proxy-agent");
var proxy =
  "http://AirForceOne-sub-kamakazeevenuecart-cc-row-sid-1:d7cmO5rk4Tj2@gw-am.ntnt.io:5959";
var agent = new HttpsProxyAgent(proxy);

var postData = querystring.stringify({
  ticketNum: 5365314,
  linkID: "tktldr",
  maxCartItems: 4,
  submitID: 1,
  areaCode: "",
  eventPLNum: "",
  bestAvailable: "",
  baar: 0,
  locPref: "",
  groupCode: "",
  cartNum: "",
  pc: "",
  shopperContext: "",
  comments: "",
  groupSeatCode: "",
  itemType: "SE",
  itemQty: "",
  gcAmt: "",
  seatInfo: "U:26:9:16~5~MJ23:FULL|",
  "qty_MJ23:FULL": "",
});

var options = {
  hostname: "ticketleader.evenue.net",
  port: 443,
  path: "/cgi-bin/ncommerce3/SEAddOrder",
  method: "POST",
  agent: agent,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": postData.length,
  },
};

var req = https.request(options, (res, ) => {
  console.log("statusCode:", res.statusCode);
  res.setEncoding('utf8')
  res.on("data", (d) => {
    console.log(d);
    // const $ = cheerio.load(d);
    // console.log($(".error").html());
    // process.stdout.write(d);
  });
});

req.on("error", (e) => {
  console.error("eror --------- ", e);
});

req.write(postData);
req.end();
