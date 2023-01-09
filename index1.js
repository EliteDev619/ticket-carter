const axios = require("axios");
const fs = require("fs");
const HttpsProxyAgent = require("https-proxy-agent");
// const { eventNames } = require("process");
const { post } = require("request");

let deliveryOptions = [];
let extraEvents = [];

function getPostURL(param) {
  let temp = param.split("net");
  return temp[0] + "net";
}

async function getPostData(eventUrl, proxy_url) {
  console.log(eventUrl);
  try {
    let tempPostData = {};
    let response = await axios
      .get(eventUrl, {
        httpsAgent: new HttpsProxyAgent(proxy_url),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        },
      })
      .catch((e) => {
        e?.response;
        console.log(e);
        extraEvents.push(eventUrl);
        return;
      });

    if (!response?.data) {
      console.log("no data ------");
      extraEvents.push(eventUrl);
      return;
    }

    const body = response.data;
    console.log("getBody === ");
    let fkey = "function Reservation()";
    let lkey = "document.write('</form>')";
    if (body.includes(fkey)) {
      let subStr = body.split(fkey)[1].split(lkey)[0];
      let domainUrl = getPostURL(eventUrl);
      let postUrl = domainUrl + subStr.split('action="')[1].split('"')[0];
      let keyStr = subStr.split(") ;")[0];
      let keys = keyStr.split('<input type="hidden" name="');
      for (let i = 1; i < keys.length; i++) {
        let dataKeyStr = keys[i].split('" value="');
        let dataKey = dataKeyStr[0];
        let dataValue = dataKeyStr[1].split('">')[0];
        tempPostData[dataKey] = dataValue;
      }

      tempPostData.submitID = "1";
      tempPostData.itemType = "SE";
      tempPostData.bestAvailable = "BA";

      let priceSubStr = body.split("priceList[0] = ")[1].split("</script>")[0];
      let priceStrArr = priceSubStr.split('new makePrice("');
      let priceValFlag = false;
      for (let i = 0; i < priceStrArr.length; i++) {
        let priceCode = priceStrArr[i].split('",')[0];
        if (priceCode == "") continue;

        let priceKey = "qty_" + priceCode;
        if (priceKey in tempPostData) continue;

        if (priceValFlag) {
          tempPostData[priceKey] = "";
        } else {
          tempPostData[priceKey] = "1";
          priceValFlag = true;
        }
      }

      getOptions(
        new URLSearchParams(tempPostData).toString(),
        eventUrl,
        response.headers["set-cookie"],
        postUrl,
        proxy_url
      );
    }
  } catch (error) {
    console.log(error, "getPostData");
  }
}

async function getOptions(
  post_data,
  eventUrl,
  referCookie,
  postUrl,
  proxy_url
) {
  console.log("getOptions === ");
  let cookies = referCookie
    .map((cookie) => {
      return cookie.split("; ")[0];
    })
    .join("; ");

    post_data = "ticketNum=17612336&linkID=unm-arts&maxCartItems=4&submitID=1&areaCode=&eventPLNum=&bestAvailable=BA&baar=1&locPref=&groupCode=&cartNum=&pc=&shopperContext=&comments=&groupSeatCode=&itemType=SE&itemQty=&gcAmt=&seatInfo=&qty_PJ22%3AAD1-AD=1";
  let response = await axios.post(postUrl, post_data, {
    httpsAgent: new HttpsProxyAgent(proxy_url),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "upgrade-insecure-requests": "1",
      Referer: eventUrl,
      "Referrer-Policy": "strict-origin-when-cross-origin",
      Cookie: cookies,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
    method: "POST",
  });

  const body = response.data;
  console.log(body);
  let optionObj = {};
  optionObj.event = eventUrl;
  let key = "new DeliveryItem";
  if (body.includes(key)) {
    let cnt = body.split(key).length;
    let strArr = body.split(key, cnt);
    for (let i = 0; i < cnt; i++) {
      if (i == 0) continue;
      let tmp = strArr[i].split(";", 1)[0];
      tmp = tmp.split(",");
      let tmpObj = {
        type: tmp[0].split("(")[1],
        description: tmp[1],
        price: tmp[2],
        notes: tmp[4].split(")")[0],
      };
      optionObj[i] = tmpObj;
    }
  } else {
    optionObj.data = "no data";
  }

  let jsonData = JSON.stringify(optionObj);
  fs.appendFile("options.json", jsonData, function (err) {
    if (err) throw err;
  });
}

let tLinks = fs.readFileSync("tempurls.txt", "utf8");

async function getEvents() {
  let links = tLinks.split("https");

  for (let k = 1; k < links.length; k++) {
    let sid = Math.floor(Math.random() * 10000000);
    let proxy_url =
      "http://AirForceOne-sub-kamakazeevenuecart-cc-row-sid-" +
      sid +
      ":d7cmO5rk4Tj2@gw-am.ntnt.io:5959";
    let link = "https" + links[k].trim();
    // console.log(link);
    await getTmpData(proxy_url);
    // await getPostData(link, proxy_url);
  }

  // console.log(extraEvents, "====");
  // if (extraEvents.length > 0) {
  //   for (let m = 1; m < extraEvents.length; m++) {
  //     let sid = Math.floor(Math.random() * 10000000);
  //     let proxy_url =
  //       "http://AirForceOne-sub-kamakazeevenuecart-cc-row-sid-" +
  //       sid +
  //       ":d7cmO5rk4Tj2@gw-am.ntnt.io:5959";
  //     let link = extraEvents[m].trim();
  //     console.log(link);
  //     await getPostData(link, proxy_url);
  //   }
  // }
}

getEvents();

async function getTmpData(proxy_url){


    let referData = await axios
      .get("https://bgsufalcons.evenue.net/cgi-bin/ncommerce3/SEGetEventInfo?ticketCode=GS%3aATHLETICS%3aW22%3aW07%3a&linkID=bgsu-athletics", {
        httpsAgent: new HttpsProxyAgent(proxy_url),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        },
      })

    //   cookieJar.myCookies = referData.headers['set-cookie'];
      let myCookies = referData.headers['set-cookie']
      .map((cookie) => {
        return cookie.split("; ")[0];
      })
      .join("; ");

      console.log(myCookies);
    let response = await axios.post(
        "https://bgsufalcons.evenue.net/cgi-bin/ncommerce3/SEAddOrder", 
        // "ticketNum=17612336&linkID=unm-arts&maxCartItems=4&submitID=1&areaCode=&eventPLNum=&bestAvailable=BA&baar=1&locPref=&groupCode=&cartNum=&pc=&shopperContext=&comments=&groupSeatCode=&itemType=SE&itemQty=&gcAmt=&seatInfo=&qty_PJ22%3AAD1-AD=1",
        "ticketNum=17637448&linkID=bgsu-athletics&maxCartItems=10&submitID=1&areaCode=&eventPLNum=&bestAvailable=BA&baar=0&locPref=&groupCode=&cartNum=&pc=&shopperContext=&comments=&groupSeatCode=&itemType=SE&itemQty=&gcAmt=&seatInfo=&qty_W22%3AAS=1",
        {
        httpsAgent: new HttpsProxyAgent(proxy_url),
        timeout: 15000,
        withCredentials: true,
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "content-type": "application/x-www-form-urlencoded",
            "cookie": myCookies,
            // "cookie": "ORA_FPC=id=ae017d76-dc34-4ef6-8a3b-0083a13ab2cd; WTPERSIST=; _gid=GA1.2.728384195.1672711081; SESSION_ID=24400281,fmFyWX6w3G1Fa94NnED5yRkQ2IKdHmXdkOkSUFR+M/OYBmq8JCvSKU6HPLS65sqR; BIGipServerunm-arts=855646124.20480.0000; client_cookie=unm-arts; BIGipServerpx_client_pool=683763095.47873.0000; BIGipServerpac8-web=1996824492.40010.0000; BIGipServerapigateway=419595018.16415.0000; BIGipServerpac8-evcluster1=1929715628.5195.0000; BIGipServerrobots.txt=352395180.20480.0000; pxcts=a7285a14-8ee8-11ed-871b-43545964506a; _pxvid=a7284dcb-8ee8-11ed-871b-43545964506a; _fbp=fb.1.1673136634449.65619504; _gcl_au=1.1.300971467.1673136926; _ga=GA1.2.1077590445.1672377052; _ga_LLXBLNKGX6=GS1.1.1673136113.1.1.1673136990.60.0.0; et.ev_unm-arts.sellerId=3058817; et.ev_unm-arts.poolId=pac8-evcluster1; et.ev_unm-arts.locale=en_US; et.ev_unm-arts.locales=%5B%22en_US%22%5D; et.ev_unm-arts.busOrgVer=8; _pxhd=e0191707d662e24a3e794868f1685958d761750875a2abfa1b77fb2b00d11541:a7284dcb-8ee8-11ed-871b-43545964506a; amp_fc60ef=QxQ57u14IZMGF9_uZXFOhK...1gm86ff07.1gm86fg7g.0.d0.d0; _pxff_cc=U2FtZVNpdGU9TGF4Ow==; _gat=1; _gat_newMaster=1; _gat_PacDev=1; _px2=eyJ1IjoiYTIyMTU1YTAtOGYyYy0xMWVkLThiOTctNTc3NDY2MTNlNzQ5IiwidiI6ImE3Mjg0ZGNiLThlZTgtMTFlZC04NzFiLTQzNTQ1OTY0NTA2YSIsInQiOjE2NzMxNjYwNDQxNDUsImgiOiJhMjFjOTZjMGQyZmRiNWE4Njc0NDE2ZWIxYTVmZWJmMGE5YzFhNmY1YmM3ZDQ2YTc5MjZlNGQxY2I0MDA4YWMyIn0=",
            "Referer": "https://bgsufalcons.evenue.net/cgi-bin/ncommerce3/SEGetEventInfo?ticketCode=GS%3aATHLETICS%3aW22%3aW07%3a&linkID=bgsu-athletics",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
        method: "POST",
      });

//       fetch("https://bgsufalcons.evenue.net/cgi-bin/ncommerce3/SEAddOrder", {
//   "headers": {
//     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//     "accept-language": "en-US,en;q=0.9",
//     "cache-control": "max-age=0",
//     "content-type": "application/x-www-form-urlencoded",
//     "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "same-origin",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1",
//     "cookie": "ORA_FPC=id=ae017d76-dc34-4ef6-8a3b-0083a13ab2cd; WTPERSIST=; _gid=GA1.2.728384195.1672711081; BIGipServerbgsu-athletics=855646124.20480.0000; client_cookie=bgsu-athletics; BIGipServerpac8-web=2584027052.40266.0000; BIGipServerpx_client_pool=683763095.47873.0000; BIGipServerapigateway=419595018.16415.0000; BIGipServerpac8-evcluster1=1963270060.5451.0000; pxcts=a7285a14-8ee8-11ed-871b-43545964506a; _pxvid=a7284dcb-8ee8-11ed-871b-43545964506a; BIGipServerrobots.txt=335617964.20480.0000; _fbp=fb.1.1673136634449.65619504; et.ev_bgsu-athletics.sellerId=3058800; et.ev_bgsu-athletics.poolId=pac8-evcluster1; et.ev_bgsu-athletics.locale=en_US; et.ev_bgsu-athletics.locales=%5B%22en_US%22%5D; et.ev_bgsu-athletics.busOrgVer=8; _gcl_au=1.1.300971467.1673136926; _ga=GA1.2.1077590445.1672377052; _ga_LLXBLNKGX6=GS1.1.1673136113.1.1.1673136990.60.0.0; SESSION_ID=24427202,P8nJzdpxJHT1WjAgzKI3QPI0Wfh/dspwCUrJZvrs59KzF1RRTZYwucC7ZF4U4Jmr; _pxhd=e0191707d662e24a3e794868f1685958d761750875a2abfa1b77fb2b00d11541:a7284dcb-8ee8-11ed-871b-43545964506a; amp_fc60ef=QxQ57u14IZMGF9_uZXFOhK...1gm89ek1v.1gm8ccjl0.0.dk.dk; _px2=eyJ1IjoiNTYzYWI3ZjAtOGYzOS0xMWVkLWExMmMtNmQwNDk5NDkxMjdmIiwidiI6ImE3Mjg0ZGNiLThlZTgtMTFlZC04NzFiLTQzNTQ1OTY0NTA2YSIsInQiOjE2NzMxNzE0OTYzOTQsImgiOiIzODM4YmE0OTVjODgwYzZkODAzZWE4YWUwYjE5NjlhM2MyNTdjMDQ5MzZkNGJiZGI2N2IxNDk5OWJiYjAxOTA4In0=",
//     "Referer": "https://bgsufalcons.evenue.net/cgi-bin/ncommerce3/SEGetEventInfo?ticketCode=GS%3aATHLETICS%3aW22%3aW07%3a&linkID=bgsu-athletics",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": "ticketNum=17637448&linkID=bgsu-athletics&maxCartItems=10&submitID=1&areaCode=&eventPLNum=&bestAvailable=BA&baar=0&locPref=&groupCode=&cartNum=&pc=&shopperContext=&comments=&groupSeatCode=&itemType=SE&itemQty=&gcAmt=&seatInfo=&qty_W22%3AAS=1",
//   "method": "POST"
// });


//    var response = fetch("https://popejoypresents.evenue.net/cgi-bin/ncommerce3/SEAddOrder", {
//   "headers": {
//     "content-type": "application/x-www-form-urlencoded",
//     "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "upgrade-insecure-requests": "1",
//     "Referer": "https://popejoypresents.evenue.net/cgi-bin/ncommerce3/SEGetEventInfo?ticketCode=GS%3aARTS%3aPJ22%3aB5W%3a&linkID=unm-arts",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   httpsAgent: new HttpsProxyAgent(proxy_url),
//   "body": "ticketNum=17612336&linkID=unm-arts&maxCartItems=4&submitID=1&areaCode=&eventPLNum=&bestAvailable=BA&baar=1&locPref=&groupCode=&cartNum=&pc=&shopperContext=&comments=&groupSeatCode=&itemType=SE&itemQty=&gcAmt=&seatInfo=&qty_PJ22%3AAD1-AD=1",
//   "method": "POST"
// });

console.log(response.data);
}