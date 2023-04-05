var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    left_item: {
      type: Object
    },
  },
  data: {
 
  },
  methods: {
    Helper(res) {
      let item = res.currentTarget.dataset.item;
      this.triggerEvent('helper', {
        msg:item.title,
        type: 'text'
      })
    }


  }

})
