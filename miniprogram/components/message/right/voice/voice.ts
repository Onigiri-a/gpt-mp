// components/message/right/voice/voice.ts
var app = getApp()
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    right_item: {
      type: Object,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgs: {
      yyxx: "/icons/sb.png",
    },
    audioSrc: "" // 音频文件路径

  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 播放音频
     */
    playVoice: function (e){
      var that = this;
      this.setData({
        audioSrc: that.data.right_item.voice
      });
      this.setData({
        audioCtx: wx.createInnerAudioContext()
      });
      this.data.audioCtx.src = this.data.audioSrc;
      this.data.audioCtx.play();
    },
  },

})
