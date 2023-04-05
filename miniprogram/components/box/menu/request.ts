const app = getApp();

function decodeUtf8(arrayBuffer) {
  var result = "";
  var i = 0;
  var c = 0;
  var c1 = 0;
  var c2 = 0;
  var c3 = 0;

  var data = new Uint8Array(arrayBuffer);

  // If we have a BOM skip it
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
    i = 3;
  }

  while (i < data.length) {
    c = data[i];

    if (c < 128) {
      result += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      if (i + 1 >= data.length) {
        throw "UTF-8 Decode failed. Two byte character was truncated.";
      }
      c2 = data[i + 1];
      result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      if (i + 2 >= data.length) {
        throw "UTF-8 Decode failed. Multi byte character was truncated.";
      }
      c2 = data[i + 1];
      c3 = data[i + 2];
      result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return result;
}

module.exports = function (token, msg) {
  let that = this;
  if (app.isMobile()) {
    let response = new Uint8Array();
    let allText = '';
    let message = '';
    let finished = false;
    const timer = setInterval(() => {
      if (finished && message.length >= allText.length) {
        let msgList = that.data.msgList;
        msgList.pop()
        if (allText.trim().length > 0){
          that.result('text', allText);
        }else{
          that.result('retry');
        }
        that.setData({
          disabled: false
        })
        return clearInterval(timer);
      }
      if (message.length >= allText.length) return;
      message += allText[message.length];
      let msgList = that.data.msgList;
      msgList.pop();
      msgList.push({
        jid: 'server',
        //接收方
        tojid: 'customer',
        type: 'text',
        msg: message,
        isread: '1',
      });
      that.setData({
        msgList,
      })
      that.setData({
        toView: 'msg_end_line',
      })
    }, 30);
    const request = wx.request({
      method: "GET",
      url: app.globalData.config.url + "stream",
      data: { token },
      enableChunked: true,
      success() {
        finished = true;
      }, fail() {
        clearInterval(timer);
        that.setData({
          disabled: false
        })
        that.data.msgList.pop();
        that.result('retry', { token, msg });
      }
    })
    request.onChunkReceived((res) => {
      var mergedArray = new Uint8Array(response.length + new Uint8Array(res.data).length);
      mergedArray.set(response);
      mergedArray.set(new Uint8Array(res.data), response.length);
      response = mergedArray;
      allText = decodeUtf8(response)
    });
  } else {
    wx.request({
      method: "GET",
      url: app.globalData.config.url + "stream",
      timeout:300000,
      data: { token },
      success(res) {
        that.data.msgList.pop();
        that.result('text', res.data);
        that.setData({
          disabled: false
        })
      }, 
      fail() {
        that.setData({
          disabled: false
        })
        that.data.msgList.pop();
        that.result('retry', { token, msg });
      }
    })
  }
}