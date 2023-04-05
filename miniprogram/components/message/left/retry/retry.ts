// components/message/left/retry/retry.ts
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
    retry() {
      this.triggerEvent('retry', {
        token: this.data.left_item.msg.token,
        msg: this.data.left_item.msg.msg
      })
    }
  }
})
