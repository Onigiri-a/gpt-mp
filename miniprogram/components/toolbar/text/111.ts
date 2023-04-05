const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //图标路径
    imgs: {
      icon_yy: "../../icons/yuyin.png",
      icon_gdgn: "../../icons/more.png",
      icon_send: "../../icons/send.png",
      ht: "../../icons/ht.png",
      sb: "../../icons/sb.png",
      xjp: "../../icons/xjp.png",
      yyxx: "../../icons/sb.png",
      voiceCancel: "../../icons/oiceCancel.png",
      sb_c: "../../icons/yy_c.png"
    },
    //对方头像，可从上个页面获取过来
    head_img: "../../icons/profiles/avatar.jpg",
    //输入
    inputVal: '',
    //下拉加载状态
    triggered: true,
    //记录前一条信息的时间戳-用于时间转换
    prevFirst: '',
    //记录当前信息列表的第一条信息的时间戳，用于下次查询
    curTopTimeStamp: '',

    //一次查询几条信息
    pagenum: 10,
    //触发上拉操作+1
    index: 0,

    msgList: [],

    //---高度信息----
    scrollHeight: 'calc(100vh - 60px)',
    inputBottom: 0,
    keyHeight: 0,
    windowHeight: 0,
    windowWidth: 0,
    //功能框高度
    featureHeight: 0,

    toView: '',

    //点击加号
    camera: false,
    //点击语音
    voice: false,
    //是否正在说话
    isSpeaking: false,
    recorderManager: null, //manager
    innerAudioContext: null, //音频播放manager
    sendtip: '松 开 发 送', // 录音过程中提示
    //播放语音中
    isPlaying: false,
    palyingMsgData: null, //记录正在播放的音频对象
    //遮罩层
    mask: false,
    //定义录音是否发送
    isClock: true,
    //需要取消（但是还没有取消）
    needCancel: false,

    //记录“取消发送”图标坐标位置，用于判断是否想要取消发送
    top: '',
    left: '',
    right: '',
    bottom: '',

    //
    sendicon: false,

    // 功能 -图标集合
    feature: [
      { src: '../../icons/xc.png', name: '相册' }

    ],
    disabled: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    that.setData({
      windowWidth: wx.getSystemInfoSync().windowWidth,
      windowHeight: wx.getSystemInfoSync().windowHeight,
      msgList: wx.getStorageSync('history') || [],
      //对方账号
      tojid: 'server',
      //该页导航栏标题从上一页传递过来
      name: decodeURIComponent(options.name),
      //对方头像从上一页传递过来
      head_img: decodeURIComponent(options.head_img),
    }, (res) => {
      //页面切换，更换页面标题
      wx.setNavigationBarTitle({
        title: '慧悟互动'
      });
      that.setData({
        toView: 'msg_end_line',
      });


      //初始化音频相关
      that.initVoiceConfig();
    })
  },

  //处理信息并保存渲染
  dealMsg(msgList) {
    const that = this;
    //需要对信息集合进行处理-时间的显示与否
    for (var i = 0; i < msgList.length; i++) {
      let list = msgList[i];
      let showTime = this.msgTimeFormat(list.timestamp, i);
      list['showTime'] = showTime;
    }
    that.setData({
      msgList: msgList,
      toView: 'msg_end_line',
    })
  },

  //上拉触发事件
  loadMore() {
    //根据实际业务写上拉触发的时间
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  },

  //获取聚焦
  focus(e) {
    const that = this;
    let keyHeight = e.detail.height;
    that.setData({
      camera: false,
      scrollHeight: (that.data.windowHeight - keyHeight - 60) + 'px',
      keyHeight: keyHeight,
      sendicon: true
    });
    that.setData({
      toView: 'msg_end_line',
      inputBottom: keyHeight
    })
  },

  //失去聚焦(软键盘消失)
  blur(e) {
    const that = this;
    that.setData({
      scrollHeight: 'calc(100vh - 60px)',
      inputBottom: 0,
      sendicon: false
    })
    that.setData({
      toView: 'msg_end_line'
    })
  },

  //获取输入内容
  getInputVal: function (e) {
    this.setData({
      inputVal: e.detail.value
    })
  },

  //发送点击监听
  sendClick: function (e) {
    const that = this;
    let value = that.data.inputVal;
    let msgList = that.data.msgList;
    if (value && !value.replace(/\s+/g, '').length == 0) {
      //限制输入，为空或空格时不发送
      // 塞时间
      let timestamp = Date.parse(new Date());
      let showTime = this.msgTimeFormat(timestamp, that.data.msgList.length)
      msgList.push(
          {
            //发送方
            jid: 'customer',
            //接收方
            tojid: 'server',
            msg: value,
            type: '1',
            isread: '1',
          }
      )
      msgList.push(
          {
            //发送方
            jid: 'server',
            //接收方
            tojid: 'customer',
            msg: '正在处理中,请稍后...',
            type: '1',
            isread: '1',
          }
      )

    } else {
      //提示
      wx.showToast({
        title: '发送消息为空！',
        icon: 'none'
      })
      return;
    }
    that.setData({
      msgList: msgList,
      inputVal: '',
      toView: 'msg_end_line',
    });
    this.sendMsg(value);
  },


  copy: function (e) {
    var that = this;
    var text = e.currentTarget.dataset.text;
    console.log(e);
    wx.setClipboardData({
      data: text,success: function (res) {
        wx.hideToast();
        //打开可不显示提示框
        wx.getClipboardData({success (res) {
            console.log(res.data) // data

          }})}});
  },

  /**
   * 聊天时间 格式化
   * 规则：
   *  1. 每五分钟为一个跨度
   *  2. 今天显示，小时:分钟，例如：11:12
   *  3. 昨天显示，昨天 小时:分钟 例如：昨天 11:12
   *  4. 日期差大于一天显示，年月日 小时:分钟 例如：2021年9月30日 11:12
   * @param timestamp,index
   * @returns {string|null}
   */
  msgTimeFormat(timestamp, index) {
    const that = this;
    //时间戳转变为时间
    let date = timestamp.toString().length == 13 ? new Date(parseInt(timestamp)) : new Date(parseInt(timestamp * 1000));
    let time = '';
    //第一条消息
    if (0 == index) {
      that.setData({
        prevFirst: timestamp
      })
      let prev = new Date(date);
      let next = new Date();
      let day = next.getDate() - prev.getDate();
      day = day >= 0 ? day : -(day);
      if (day > 1) {
        //时间间隔大于一天，显示YYYY年MM月DD日 HH：mm
        time = this.dateFormatChina(new Date(that.data.prevFirst.toString().length == 13 ? new Date(parseInt(that.data.prevFirst)) : new Date(parseInt(that.data.prevFirst * 1000))));
      } else if (day === 1) {
        time = '昨天 ' + prev.getHours() + ":" + this.timeAppendZero(prev);
      } else {
        time = prev.getHours() + ":" + this.timeAppendZero(prev);
      }
      return time;
    }

    let prev = new Date(that.data.prevFirst.toString().length == 13 ? new Date(parseInt(that.data.prevFirst)) : new Date(parseInt(that.data.prevFirst * 1000)));
    let next = new Date(date);

    let day = Math.floor((next - prev) / (24 * 60 * 60 * 1000));
    let minutes = Math.floor((next - prev) / (1000 * 60));
    let dayT = new Date().getDate() - next.getDate();
    let yesterdayFlag = dayT === 1 || dayT === -1;
    let todayFlag = dayT === 0;

    /*
      下标越界标志
      未越界且分钟差大于5，将当前消息日期作为比较值并替换prevFirst，并根据规则格式化
      越界则表示下标走到了最后一位，将其作为要显示的日期赋值给prev，并根据规则格式化
     */
    let indexOutFlag = that.data.msgList.length !== (index + 1);
    if (indexOutFlag && minutes > 5) {
      that.setData({
        prevFirst: timestamp
      })
      if (!todayFlag && !yesterdayFlag) {
        return this.dateFormatChina(next);
      } else {
        prev = new Date(date);
        if (yesterdayFlag) {
          return '昨天 ' + prev.getHours() + ":" + this.timeAppendZero(prev);
        }
      }
    } else {
      prev = new Date(date);
    }

    if (yesterdayFlag && minutes >= 5) {
      return '昨天 ' + prev.getHours() + ":" + this.timeAppendZero(prev);
    } else if (todayFlag && minutes >= 5) {
      return prev.getHours() + ":" + this.timeAppendZero(prev);
    }
    return null;
  },
  dateFormatChina(date) {
    return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + this.timeAppendZero(date);
  },
  timeAppendZero(time) {
    return time.getMinutes().toString().length === 1 ? '0' + time.getMinutes() : time.getMinutes();
  },

  //点击加号
  addOtherFormatMsg() {
    const that = this;
    that.setData({
      camera: !that.data.camera,
      voice: false,
      isSpeaking: false
    })
    that.setData({
      inputBottom: that.data.camera == true ? that.data.inputBottom + 100 : 0,
      scrollHeight: that.data.camera == true ? 'calc(100vh - 160px)' : 'calc(100vh - 60px)',
    })
    that.setData({
      toView: 'msg_end_line',
    })
  },


  /**
   * 初始化语音录制和播放的配置数据
   */
  initVoiceConfig() {
    const recorderManager = wx.getRecorderManager(); // 录音manager
    var msgList = this.data.msgList;
    recorderManager.onStart(() => {
      // console.log('start')
    })
    recorderManager.onPause(() => {
      // console.log('pause')
    })
    recorderManager.onStop((res) => {
      // console.log('stop')
      // 录音时间小于一秒钟，提示录音时间过短
      if (res.duration < 1000) {
        wx.showToast({
          title: '说话时间太短',
          icon: 'error'
        });
        return;
      }
      // 防止出现录音结束了，录音弹框没有消失的问题
      clearInterval(this.timer);
      this.setData({
        isSpeaking: false,
        sendtip: '松 开 发 送'
      });

      var that = this;
      //封装消息
      if (that.data.isClock) {
        //时间戳转换为时间
        // 判断时间戳是否为13位数，如果不是则*1000，时间戳只有13位数(带毫秒)和10(不带毫秒)位数的
        let timeTamp = Date.parse((new Date()));
        let showTime = that.msgTimeFormat(timeTamp, msgList.length);
        wx.uploadFile({
          url: "http://server.com/upload/record/",
          filePath: res.tempFilePath,
          name: 'file',
          success: function (res) {
          },
          fail: function (res) {
          }
        })


        msgList.push(
            {
              msgid: "00" + Math.random(),
              //发送方
              jid: "customer",
              //接收方
              tojid: 'server',
              timestamp: timeTamp,
              msg: res.tempFilePath,
              duration: res.duration,
              type: '3',
              isread: '0',
              showTime: showTime
            }
        );

        that.setData({
          msgList: msgList,
          toView: 'msg_end_line'
        })
      }

      //在此，语音的路径先使用微信临时文件，后续需要上传至服务器

    });
    recorderManager.onFrameRecorded((res) => {
      const {
        frameBuffer
      } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    });
    this.data.recorderManager = recorderManager;

    // //音频播放manager
    // const innerAudioContext = wx.createInnerAudioContext();
    // innerAudioContext.onPlay(() => {
    //   console.log('开始播放');
    // });
    //
    // innerAudioContext.onEnded(() => {
    //   console.log('音频自然播放结束');
    //   this.setData({
    //     palyingMsgData: null
    //   });
    // });
    //
    // innerAudioContext.onStop((res) => {
    //   console.log("音频播放停止");
    // });
    //
    // innerAudioContext.onError((res) => {
    //   console.log("音频播放失败" + res.errCode + "---errMsg=" + res.errMsg);
    //   this.setData({
    //     palyingMsgData: null
    //   });
    //   wx.showToast({
    //     title: '音频播放失败',
    //     icon: 'error'
    //   });
    // });
    // this.data.innerAudioContext = innerAudioContext;
  },

  //点击语音图标
  addSpeakMsg() {
    const that = this;
    that.setData({
      camera: false,
      voice: !that.data.voice,
      scrollHeight: 'calc(100vh - 60px)',
      inputBottom: 0
    })
    that.setData({
      toView: 'msg_end_line'
    })

  },

  //按下说话
  touchdown: function (e) {
    console.log("手指按下")
    const query = wx.createSelectorQuery();

    var that = this;
    that.setData({
      isSpeaking: true,
      mask: true
    }, (res) => {
      //记录“取消发送”元素位置
      if (that.data.mask) {
        query.select('.close-icon').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
          that.setData({
            top: res[0].top,
            left: res[0].left,
            right: res[0].right,
            bottom: res[0].bottom,
          })
        })
      }
      that.startVoice();
      speaking.call(that);
    });
  },

  /**
   * 录音：手指滑动，录音不发送
   */
  touchmove: function (e) {
    const that = this;
    let needCancel = false;
    let sendtip = '松 开 发 送';
    //判断当前触摸位置是否处于“取消发送”元素内
    if (e.touches[0].pageX >= that.data.left && e.touches[0].pageX <= that.data.right && e.touches[0].pageY >= that.data.top && e.touches[0].pageY <= that.data.bottom) {
      needCancel = true;
      sendtip = '松 开 取 消';
    }
    that.setData({
      needCancel: needCancel,
      sendtip: sendtip
    })
  },

  /**
   * 录音：手指抬起，录音结束
   */
  touchup: function (e) {
    console.log("手指抬起");
    const that = this;
    this.setData({
      isSpeaking: false,
      isClock: !that.data.needCancel,
      mask: false,
    }, (res) => {
      this.handleStopVoice(this);
    })
  },

  //开始录音
  startVoice: function () {
    console.log("startVoice----");
    // 如果此时正在播放语音，则停止
    this.handleStopPlayVoice(this);
    const options = {
      duration: 61000, //默认最长播放时长60秒
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    };

    if (this.data.isSpeaking) {
      this.data.recorderManager.start(options);
    } else {
      wx.showToast({
        title: '说话时间太短',
        icon: 'error'
      });
      return;
    }
  },

  /**
   * 结束录音以及处理相关逻辑
   */
  handleStopVoice: function (that) {
    that.stopVoice();
    clearInterval(that.timer);
    that.setData({
      needCancel: false
    });
  },

  /**
   * 结束录音
   */
  stopVoice: function () {
    console.log("stopVoice----");
    this.data.recorderManager.stop();
  },

  /**
   * 播放音频
   */
  playVoice: function (e) {
    var that = this;
    var mData = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    // 如果点击的是正在播放的语音，则停止语音播放
    if (that.data.palyingMsgData != null && that.data.palyingMsgData == mData.msg) {
      that.handleStopPlayVoice(that);
      return false;
    }
    //  如果点击的是未在播放的语音，播放之前先停掉别的语音播放
    that.stopPlayVoice();
    that.setData({
      palyingMsgData: mData.msg
    });
    //播放
    var voiceUrl = mData.msg;
    that.data.innerAudioContext.src = voiceUrl;
    that.data.innerAudioContext.play();
  },

  /**
   * 停止音频播放
   */
  stopPlayVoice: function () {
    console.log('stopPlayVoice----');
    this.data.innerAudioContext.stop();
  },

  /**
   * 停止语音播放以及处理相关逻辑
   */
  handleStopPlayVoice: function (that) {
    if (that.data.palyingMsgData != null) {
      // 停止语音播放
      that.stopPlayVoice();
    }
  },

  //检查授权-麦克风权限
  checkDeviceAuthorize: function () {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          let auth = res.authSetting['scope.record']
          if (auth === true) { // 用户已经同意授权
            resolve()
          }
          else if (auth === undefined) {// 首次发起授权
            wx.authorize({
              scope: 'scope.record',
              success() {
                resolve()
              },
              fail(res) {
              }
            })
          }
          else if (auth === false) { // 非首次发起授权，用户拒绝过 => 弹出提示对话框
            wx.showModal({
              title: '授权提示',
              content: '请前往设置页打开麦克风',
              success: (tipRes) => {
                if (tipRes.confirm) {
                  wx.openSetting({
                    success: (settingRes) => {
                      if (settingRes.authSetting['scope.record']) {
                        resolve()
                      }
                    },
                  })
                }
              }
            })
          }
        },
      })
    })
  },

  // 页面从前台变为后台时执行
  onHide: function () {
    // app.pageunBindOpEvent();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    const that = this;
    // app.pageunBindOpEvent();
    that.data.innerAudioContext.destroy();//销毁这个实例
  },

  sendMsg(msg) {

    let response = new Uint8Array();
    let allText = '';
    let message = '';
    let finished = false;
    let that = this;
    that.setData({
      disabled: true,
    });
    let msgList = this.data.msgList;
    const timer = setInterval(() => {
      if (finished && message.length >= allText.length) {
        msgList.pop()
        msgList.push(
            {
              //发送方
              jid: 'server',
              //接收方
              tojid: 'customer',
              msg: allText,
              type: '1',
              isread: '1',
            }
        )
        wx.setStorageSync('history', msgList);
        that.setData({
          msgList: msgList,
          inputVal: '',
          toView: 'msg_end_line',
          disabled: false,
        });
        return clearInterval(timer);
      }
      if (message.length >= allText.length) return;
      message += allText[message.length];
      msgList.pop();
      msgList.push({
        //发送方
        jid: 'server',
        //接收方
        tojid: 'customer',
        msg: message,
        type: '1',
        isread: '1',
      });
      that.setData({
        msgList: msgList,
        inputVal: '',
        toView: 'msg_end_line',
      });
    }, 50);
    app.request({
      url: 'message/send',
      data: { msg: msg },
      success(res) {
        const request = wx.request({
          method: "GET",
          url: app.globalData.config.url + "stream",
          data: { 'token': res.token },
          enableChunked: true,
          success() {
            finished = true;
          }
        })
        request.onChunkReceived((res) => {
          var mergedArray = new Uint8Array(response.length + new Uint8Array(res.data).length);
          mergedArray.set(response);
          mergedArray.set(new Uint8Array(res.data), response.length);
          response = mergedArray;
          allText = that.decodeUtf8(response)
        });
      }
    });
  },
  decodeUtf8(arrayBuffer) {
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
  },

})

/**
 * 麦克风帧动画
 */
function speaking() {
  var that = this;
  var delayTime = 1000;
  var MAX_DURATION = 60000;
  var COUNTDOWN_DURATION = 50000;
  //话筒帧动画
  var duration = 0;
  that.timer = setInterval(function () {
    duration = duration + delayTime;
    console.log("duration==" + duration);
    //倒计时提示-10秒
    if (duration > COUNTDOWN_DURATION) {
      var djs = parseInt((MAX_DURATION - duration) / 1000);
      that.setData({
        sendtip: '录音倒计时：' + djs + 's'
      });
    }
    if (duration >= MAX_DURATION) {
      that.handleStopVoice(that);
    }
  }, delayTime);
}
