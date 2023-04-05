// components/message/right/text/text.ts
var app = getApp()
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    left_item: {
      type: Object
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    copy(e) {
      var text = e.currentTarget.dataset.text;
      wx.setClipboardData({
        data: text,
        success() {
          wx.showToast({
            title: '已复制到剪切板'
          })
        }
      });
    }
  }
})
