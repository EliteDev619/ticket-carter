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
    await getPostData(link, proxy_url);
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
