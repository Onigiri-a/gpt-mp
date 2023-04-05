// components/toolbar/text/text.ts
var app = getApp()
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    disabled:{
      type:Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgs: {
      icon_yy: "/icons/yuyin.png",
      icon_gdgn: "../../icons/more.png",
      icon_send: "../../icons/send.png",
      ht: "../../icons/ht.png",
      sb: "../../icons/sb.png",
      xjp: "/icons/xjp.png",
      yyxx: "../../icons/sb.png",
      voiceCancel: "../../icons/oiceCancel.png",
      sb_c: "../../icons/yy_c.png"
    },
    //输入
    inputVal: '',
    inputBottom: 0,
    keyHeight: 0,
    inputInsideHeight:200,
    inputHeight:200,
    //点击语音
    voice: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    sendClick: function (e) {
      let value = this.data.inputVal;
      if (!value || value.replace(/\s+/g, '').length == 0) {
        wx.showToast({
          title: '发送消息为空！',
          icon: 'none'
        })
        return;
      }
      this.triggerEvent('send', {
        type: 'text',
        msg: value
      })
      this.setData({
        inputVal: ''
      })
    },
    getInputVal: function (e) {
      this.setData({
        inputVal: e.detail.value
      })
    },

    focus(e) {
      let keyHeight = e.detail.height;
      this.setData({
        inputBottom: keyHeight
      })
      this.triggerEvent('heightChange', {
        changeHeight:keyHeight
      })
    },

    blur(e) {
      let keyHeight = 0;
      this.setData({
        inputBottom: keyHeight
      })
      this.triggerEvent('heightChange', {
        changeHeight:keyHeight
      })
    },

    bindline(e) {
        let height = e.detail.height + 10;
        this.setData({
            inputInsideHeight: height
        })
    },
    //点击语音图标
    addSpeakMsg() {
      this.triggerEvent('voices', {
        isVoice:true
      })
      const that = this;
      that.setData({
        camera: false,
        scrollHeight: 'calc(100vh - 60px)',
        inputBottom: 0
      })
    }

  }
})
