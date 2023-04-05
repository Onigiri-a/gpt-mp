// components/message/right/sendMessage/sendMessage.ts
var app = getApp()
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    left_item: {
      type:Object
    },
  },


  /**
   * 组件的方法列表
   */
  methods: {
    menuClick(e) {
      const type = e.currentTarget.dataset.type;
      const msg = e.currentTarget.dataset.msg;
      this.triggerEvent('send', {
        type, msg
      })
    }
  },

  ready() {
  }
})
