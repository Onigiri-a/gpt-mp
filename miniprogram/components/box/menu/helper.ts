const app = getApp();
module.exports = {
  key: '帮助',
  icon:'/icons/help.png',
  showInMenu: true,
  match(msg) {
    return msg === this.key
  },
  action(msg) {
    const that = this;
    app.request({
      url: 'helper/getHelper',
      method: "POST",
      success(res) {
        that.result('helper', res);
      }
    })


  }
}