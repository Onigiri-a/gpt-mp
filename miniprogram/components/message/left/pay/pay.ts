// components/message/right/pay/pay.ts
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
    createOrder(e) {
      const that = this;
      const id = e.currentTarget.dataset.id;
      app.request({
        url: 'pay/createOrder',
        data: {
          id: id,
        },
        success(res) {
          app.request({
            url: 'pay/payment/jsapi',
            data: {
              trade_no: res.id,
            },
            success(o) {
              o.success = function () {
                app.request({
                  url: 'pay/success',
                  method: "GET",
                  data: {
                    order_id: res.id,
                  },
                  success(r) {
                    if(r.msg == 'success'){
                      wx.showToast({
                        title: '充值成功', icon: 'success', duration: 2000
                      })
                    }else{
                      wx.showToast({
                        title: '订单异常:'+r.msg, icon: 'error', duration: 2000
                      })
                    }
                  },
                  error(res){
                    wx.showToast({
                      title: res.msg, icon: 'error', duration: 2000
                    })
                  }
                });
              };
              o.fail = function () {
                wx.showToast({
                  title: '充值已取消', icon: 'error', duration: 2000
                })
              };
              wx.requestPayment(o)
            }
          });

        },
        error(res){
          wx.showToast({
            title: res.msg, icon: 'error', duration: 2000
          })
        }
      });
    },
  }
})
