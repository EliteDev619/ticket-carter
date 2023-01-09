const axios = require("axios");
const fs = require("fs");
const HttpsProxyAgent = require("https-proxy-agent");
const { post } = require("request");
// const { eventNames } = require("process");

let deliveryOptions = [];
let extraEvents = [];

function getPostURL(param) {
  let temp = param.split("net");
  return temp[0] + "net";
}

async function getPostData(eventUrl, proxy_url, trials = 0) {
  console.log(eventUrl);
  try {
    let tempPostData = {};
    let response = await axios.get(eventUrl, {
      httpsAgent: new HttpsProxyAgent(proxy_url),
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
      },
    });

    const body = response.data;
    // console.log(body);
    let fkey = "function Reservation()";
    let lkey = "document.write('</form>')";
    let postUrl = "";
    if (body.includes(fkey)) {
      let subStr = body.split(fkey)[1].split(lkey)[0];
      let domainUrl = getPostURL(eventUrl);
      postUrl = domainUrl + subStr.split('action="')[1].split('"')[0];
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
      tempPostData.baar = "1";
      // if(trials != 0){
      //   tempPostData.baar = trials.toString();
      // }

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

      console.log(tempPostData);
      let cookies = response.headers["set-cookie"]
        .map((cookie) => {
          return cookie.split("; ")[0];
        })
        .join("; ");

      let postres = await axios.request(
        {
          url : postUrl,
          data : new URLSearchParams(tempPostData).toString(),
          method: "post",
          withCredentials: true,
          timeout: 15000,
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
        }
        // new URLSearchParams(tempPostData).toString(),
        // {
        //   withCredentials: true,
        //   timeout: 15000,
        //   httpsAgent: new HttpsProxyAgent(proxy_url),
        //   headers: {
        //     "content-type": "application/x-www-form-urlencoded",
        //     "sec-ch-ua":
        //       '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        //     "sec-ch-ua-mobile": "?0",
        //     "sec-ch-ua-platform": '"Windows"',
        //     "upgrade-insecure-requests": "1",
        //     Referer: eventUrl,
        //     "Referrer-Policy": "strict-origin-when-cross-origin",
        //     Cookie: cookies,
        //     "User-Agent":
        //       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        //   },
        //   method: "POST",
        // }
      )
      // .catch(e => {
      //   console.log(e?.response?.data || e?.message);
      // })

      const postBody = postres.data;
      let optionObj = {};
      optionObj.event = eventUrl;
      let key = "new DeliveryItem";
      if (postBody.includes(key)) {
        let cnt = postBody.split(key).length;
        let strArr = postBody.split(key, cnt);
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
  } catch (error) {
    // if (trials < 3) {
    //   return await getPostData(eventUrl, proxy_url, trials + 1);
    // }

    console.log("ERROR in getPostData function", error.message);
    console.log("ERROR in ", eventUrl);
    extraEvents.push(eventUrl);
  }
}

let tLinks = fs.readFileSync("tempurls.txt", "utf8");
// let tLinks = fs.readFileSync("testEvents.txt", "utf8");

let concurrency = 25;
let runningCarts = 0;
let finished = 0;
async function getEvents() {
  let links = tLinks.split("https");

  // const finishInterval = setInterval(() => {
  //   console.log("Finished: ", finished);
  // }, 1000);

  for (let k = 1; k < links.length; k++) {
    runningCarts++;
    let sid = Math.floor(Math.random() * 10000000);

    // Without sid-${sid} // it rotates automatically.
    let proxy_url =
      "http://AirForceOne-sub-kamakazeevenuecart-cc-row:d7cmO5rk4Tj2@gw.ntnt.io:5959";

    // With sid-${sid} //it sticks. like that. IP will be sticky based on the sid.
    // I used the above one because I added logic for multiple trials in getPostData and I want to use diff proxy for every request.
    // another way to do it, is to move the proxy url into the getPostData function, so every run it gets new session.
    proxy_url = `http://AirForceOne-sub-kamakazeevenuecart-cc-us-sid-${sid}:d7cmO5rk4Tj2@gw.ntnt.io:5959`;

    let link = "https" + links[k].trim();

    await getPostData(link, proxy_url).then(() => {
      runningCarts--;
      finished++;
    });

    // await new Promise((resolve) => setTimeout(resolve, 50));
    // while (runningCarts > concurrency) {
    //   await new Promise((resolve) => setTimeout(resolve, 50));
    // }
  }

  // clearInterval(finishInterval);
  // setTimeout(() => {
  //   console.log(extraEvents, "====");
  // }, 500000);
  // if (extraEvents.length > 0) {
  //   getExtraEvents();
  // }
}

async function getExtraEvents() {

  setInterval(() => {
    console.log("Finished: ", finished);
    console.log(extraEvents.length);
  }, 1000);

  let promises = []
  for (let k = 1; k < extraEvents.length; k++) {
    runningCarts++;
    let sid = Math.floor(Math.random() * 10000000);
    let proxy_url = `http://AirForceOne-sub-kamakazeevenuecart-cc-row-sid-${sid}:d7cmO5rk4Tj2@gw.ntnt.io:5959`;

    promises.push(getPostData(extraEvents[k], proxy_url).then(() => {
      runningCarts--;
      finished++;
      var index = extraEvents.indexOf(extraEvents[k]);
      if (index !== -1) {
        extraEvents.splice(index, 1);
      }
    }))

    await new Promise((resolve) => setTimeout(resolve, 50));
    while (runningCarts > concurrency) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  await Promise.all(promises)

  console.log(extraEvents, "====");
  if (extraEvents.length > 0) {
    getExtraEvents();
  }
}

getEvents();
