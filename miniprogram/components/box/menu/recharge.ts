const app = getApp();

module.exports = {
  key: '充值',
  icon:'/icons/pay.png',
  showInMenu: true,
  match(msg) {
    return msg === this.key
  },
  action(msg) {
    const that = this;
    app.request({
      url: 'pay/products',
      method: "GET",
      success(res) {
        that.result('pay', res);
      }
    });
  }
}