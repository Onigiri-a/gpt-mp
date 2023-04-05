// components/toolbar/voice/voice.ts
var app = getApp()
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    disabledResss:{
      type:Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgs: {
      icon_yy: "/icons/yuyin.png",
      icon_gdgn: "/icons/more.png",
      icon_send: "/icons/send.png",
      ht: "/icons/ht.png",
      sb: "/icons/sb.png",
      xjp: "/icons/xjp.png",
      yyxx: "/icons/sb.png",
      voiceCancel: "/icons/oiceCancel.png",
      sb_c: "/icons/yy_c.png"
    },
    //点击加号
    camera: false,
    //点击语音
    voice: false,
    //是否正在说话
    isSpeaking: false,
    recorderManager: null, //manager
    innerAudioContext: null, //音频播放manager
    sendtip: '松 开 发 送', // 录音过程中提示
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
    tempFilePath:"",
    duration:"",
    message:null,
    messageresult:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击语音图标
    addSpeakMsg() {
      this.triggerEvent('voices', {
        isVoice:false
      })

      const that = this;
      that.setData({
        camera: false,
        scrollHeight: 'calc(100vh - 60px)',
        inputBottom: 0
      })
      that.setData({
        toView: 'msg_end_line'
      })
    },


    //点击语音图标
    abcres() {

        console.log(11111111111111)
        this.triggerEvent('voiceMessage', {
          msgid: "00" + Math.random(),
          //发送方
          jid: "customer",
          //接收方
          tojid: 'server',
          timestamp: Date.parse((new Date())),
          msg: this.data.message[0] ,
          voice: this.data.tempFilePath,
          duration: this.data.duration,
          type: 'voice',
          isread: '0',
        })
        this.setData({
          toView: 'msg_end_line'
        })
      console.log(this.data)

    },
    /**
     * 初始化语音录制和播放的配置数据
     */
    initVoiceConfig() {
      const recorderManager = wx.getRecorderManager(); // 录音manager
      recorderManager.onStart(() => {
        // console.log('start')
      })
      recorderManager.onPause(() => {
        // console.log('pause')
      })
      recorderManager.onStop((res) => {
        // console.log('stop')

        console.log('stop录音结束')
        console.log(res)

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
        console.log(that.data.isClock)
        if (that.data.isClock) {

          let message="";
          let filesize=0;
          let tempFilePath="";
          wx.uploadFile({
            url: "http://server.com/upload/record/",
            filePath: res.tempFilePath,
            name: 'file',
            success: function (res) {
            },
            fail: function (res) {
            }
          });

          wx.getFileSystemManager().getFileInfo({
            filePath:res.tempFilePath,
            success:function (result) {

              filesize=result.size;
              tempFilePath=res.tempFilePath;

              wx.getFileSystemManager().readFile({

                filePath:tempFilePath,
                encoding:"base64",
                success:function (res) {
                  wx.request({
                    url:'http://vop.baidu.com/server_api',
                    data: {
                      token: "24.ec0e5f002958391ff73d902753b7f7d9.2592000.1683309049.282335-32042625",
                      format: 'pcm',
                      cuid: 'baidu_workshop',
                      channel: 1,
                      rate: 16000,
                      speech: res.data,
                      len: filesize
                    },
                    header:{
                      'Content-Type':'application/json'

                    },
                    method:"POST",
                    success:function (res) {
                      console.log("语音接口返回")
                      console.log(res)
                      message=res.data.result;
                      that.setData({
                        message: message,
                        tempFilePath: tempFilePath,
                        filesize: filesize,
                        messageresult: true,
                      })
                    },
                      fail: function (res) {
                          console.log("语音返回")
                          console.log(res)
                          message=res.data.result;
                      }
                  })
                }
              })
            }
          });

          // msgList.push(
          //     {
          //       msgid: "00" + Math.random(),
          //       //发送方
          //       jid: "customer",
          //       //接收方
          //       tojid: 'server',
          //       timestamp: timeTamp,
          //       msg: res.tempFilePath,
          //       duration: res.duration,
          //       type: '3',
          //       isread: '0',
          //     }
          // );




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

    },


    //按下说话
    touchdown: function (e) {
      console.log("手指按下")
      const query = wx.createSelectorQuery().in(this);

      var that = this;
      that.setData({
        isSpeaking: true,
        mask: true
      }, (res) => {
        //记录“取消发送”元素位置
        if (that.data.mask) {
          query.select('.close-icon').boundingClientRect()
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
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: 'pcm',
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
     * 停止语音播放以及处理相关逻辑
     */
    handleStopPlayVoice: function (that) {
      if (that.data.palyingMsgData != null) {
        // 停止语音播放
        that.stopPlayVoice();
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
  },
  observers: { // 数据监听数据

    'messageresult': function (newN1) { // 监听 n1 和 n2 的数据变化
      console.log("监听 n1 和 n2 的数据变化")
      if(newN1){
        console.log("监听 n1 和 n2 的数据变化")
        this.abcres()
      }

    }
    },

  lifetimes: {
    attached(){
      const that = this;
      //初始化音频相关
      that.initVoiceConfig();
    }
  }
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
