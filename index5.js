const axios = require("axios");
const HttpsProxyAgent = require("https-proxy-agent");

let sid = Math.floor(Math.random()  * 10000000)
let proxy_url = "http://AirForceOne-sub-kamakazeevenuecart-cc-row-sid-"+sid+":d7cmO5rk4Tj2@gw-am.ntnt.io:5959"
let deliveryOptions = [];

console.log(proxy_url, '=========');
async function getOrderPage(post_data) {
  let eventUrl =
    "https://nhra.evenue.net/cgi-bin/ncommerce3/SEGetEventInfo?ticketCode=GS%3aNHRA%3a23GF%3aGF1SU%3a&linkID=nhra";

  let response = await axios
    .get(eventUrl, {
      httpsAgent: new HttpsProxyAgent(
        proxy_url
      ),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
      },
    })
    .catch((e) => e.response);

  let cookies = response.headers["set-cookie"]
    .map((cookie) => {
      return cookie.split("; ")[0];
    })
    .join("; ");

  response = await axios.post(
    "https://nhra.evenue.net/cgi-bin/ncommerce3/SEAddOrder",
    post_data,
    {
      httpsAgent: new HttpsProxyAgent(
        proxy_url
      ),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua":
          '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "upgrade-insecure-requests": "1",
        Referer:
        "https://nhra.evenue.net/cgi-bin/ncommerce3/SEGetEventInfo?ticketCode=GS%3aNHRA%3a23GF%3aGF1SU%3a&linkID=nhra",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        Cookie: cookies,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      },
      method: "POST",
    }
  );

  const body = response.data;

  console.log(body);
  var key = "new DeliveryItem";
  if(body.includes(key)){
    console.log('exist ---');
    var cnt = body.split(key).length;
    var strArr = body.split(key, cnt);
    for(var i=0; i<cnt; i++){
        if(i==0) continue;
        var tmp = strArr[i].split(";", 1)[0];
        tmp = tmp.split(",");
        var tmpObj = {
            type: tmp[0].split("(")[1],
            description: tmp[1],
            price: tmp[2],
            notes : tmp[4].split(")")[0],
        }
        deliveryOptions.push(tmpObj);
    }
    console.log(deliveryOptions);
  } 
}
getOrderPage(new URLSearchParams({
  "ticketNum":"6542263",
  "linkID":"nhra",
  "maxCartItems":"10",
  "submitID":"1",
  "areaCode":"",
  "eventPLNum":"",
  "bestAvailable":"BA",
  "baar":"0",
  "locPref":"",
  "groupCode":"",
  "cartNum":"",
  "pc":"",
  "shopperContext":"",
  "comments":"",
  "groupSeatCode":"",
  "itemType":"SE",
  "itemQty":"",
  "gcAmt":"",
  "seatInfo":"",
  "qty_23GF:A":"1",
  "qty_23GF:JI":"",
}).toString());