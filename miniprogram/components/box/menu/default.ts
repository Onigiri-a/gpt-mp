const request = require('request');
const app = getApp();

module.exports = {
  key: 'default',
  showInMenu: false,
  match(msg) {
    return true
  },
  action(msg) {
    let that = this;
    that.setData({
      disabled: true
    })
    that.result('text', '正在处理中,请稍后...')
    app.request({
      url: 'message/send',
      data: { msg: msg},
      success(res) {
        request.apply(that, [res.token, msg])
      },
      error(res){
        that.setData({
          disabled: false
        })
        that.data.msgList.pop();
        let data = []
        for (let i of that.data.preResult) {
          if (i.showInMenu) {
            data.push({ type: 'text', msg: i.key });
          }
        }
        that.result('sendMessage', {
          msg: '余额不足，请充值',
          data
        });
      }
    });
  }
}