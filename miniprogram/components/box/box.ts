// components/message/box/box.ts
const preResult = [
  require('menu/openMenu'),
  require('menu/num'),
  require('menu/recharge'),
  require('menu/contact'),
  require('menu/helper'),
  require('menu/default'),
];
const request = require('menu/request');
const app = getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
Component({
  /**
   * 组件的初始数据
   */
  data: {
    //下拉加载状态
    triggered: true,
    msgList: [],
    //---高度信息----
    scrollHeight: 'calc(100vh - 120rpx)',
    toView: 'msg_end_line',
    disabled: false,
    preResult,
    icon: 'https://zxk.tooking.cn/logo.png',
    appNickname: '智享客',
    inputFocus: false,
    show: false,
    head_img: "/icons/profiles/avatar.jpg",
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    isVoice:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onRetry(e) {
      let that = this;
      that.setData({
        disabled: true
      })
      that.data.msgList.pop();
      that.result('text', '正在处理中,请稍后...')
      let token = e.detail.token;
      let msg = e.detail.msg;
      request.apply(this, [token, msg])
    },
    onHeightChange(e) {
      const keyHeight = e.detail.changeHeight;
      this.setData({
        scrollHeight: 'calc(100vh - 120rpx - ' + keyHeight + 'px)',
      })
      this.setData({
        toView: 'msg_end_line',
      })
    },
    onSend(e) {
      const detail = e.detail;
      this.send(detail)
    },
    onResult(e) {
      const detail = e.detail;
      this.result(detail.type, detail.msg)
    },
    send(detail) {
      let msg = detail.msg
      let type = detail.type
      console.log('发送消息', type, msg)
      let msgList = this.data.msgList;
      msgList.push({
        jid: 'customer',
        //接收方
        tojid: 'server',
        msg: msg,
        type: type,
        isread: '1',
      })
      this.setData({
        msgList,
      })
      this.setData({
        toView: 'msg_end_line',
      })

      for (var i of preResult) {

        if (i['match'](msg)) {
          i['action'].apply(this, [msg]);
          return
        }
      }
    },
    result(type, msg) {
      let msgList = this.data.msgList;
      msgList.push({
        jid: 'server',
        //接收方
        tojid: 'customer',
        type: type,
        msg: msg,
        isread: '1',
      });
      this.setData({
        msgList,
      })
      this.setData({
        toView: 'msg_end_line',
      })
      this.saveMsg();
    },
    saveMsg() {
      let msgList = this.data.msgList;
      const max = 200;
      if (msgList.length > max) {
        msgList = msgList.splice(0, msgList.length - max);
      }
      wx.setStorageSync('history', this.data.msgList);
    },

    onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.setData({
        defaultAvatarUrl: e.detail.avatarUrl,
        inputFocus: true
      })
    },
    submit(e) {
      let that = this
      var detail = e.detail.value;
      detail.avatarUrl = this.data.defaultAvatarUrl;
      let defaultAvatarUrl = this.data.avatarUrl;
      if (detail.avatarUrl === defaultAvatarUrl || !detail.nickName) {
        wx.showModal({
          title: '授权提醒',
          content: '请填写头像和昵称',
          showCancel: false,
          success(res) {
          }
        })
        return false;
      }
      wx.showLoading({
        title: '上传头像中',
        mask: true
      });
      app.request({
        url: 'userinfo/update',
        file: {
          filePath: detail.avatarUrl,
          name: 'image',
        },
        data: {
          nick: detail.nickName,
          platform: 'mp'
        },
        success: function (res) {
          wx.hideLoading();
          that.setData({
            head_img: res.image,
            nick: res.nick,
            show: false,
          });
        }
      });
    },
    overlay(e) {
      this.setData({
        show: false
      })
    },


    shouquan() {
      this.setData({
        show: true
      });
    },
      onVoices(e) {
          this.setData({
              isVoice: e.detail.isVoice,
          })
      },
      onVoiceMessage(e) {
          let msgList = this.data.msgList;
          msgList.push({
              msgid:e.detail.msgid,
              //发送方
              jid: "customer",
              //接收方
              tojid: 'server',
              timestamp: e.detail.timestamp,
              msg: e.detail.msg,
              voice:e.detail.voice,
              duration: e.detail.duration,
              type: e.detail.type,
              isread: e.detail.isread,
              showTime:  e.detail.showTime
          })
          this.setData({
              msgList,
          })
          this.setData({
              toView: 'msg_end_line',
          })

      },
  },
  lifetimes: {
    ready() {
      let info = wx.getStorageSync('info') || '';
      let that = this;
      if (!info) {
        app.request({
          url: 'user/info',
          method: 'GET',
          success(res) {
            if (res.image) {
              wx.setStorageSync('info', res);
              that.setData({
                head_img: res.image || '/icons/profiles/avatar.jpg',
              });
            }

          }
        });
      }


      let msgList = wx.getStorageSync('history') || []
      this.setData({
        msgList
      });
      if (!this.data.msgList.length) {
        this.result('text', '欢迎来到智享客,您可以在底部文本框输入任何文字并点击发送向我提问');
      }
      this.setData({
        head_img: info.image,
        toView: this.data.toView,
      });
    }
  }
})
