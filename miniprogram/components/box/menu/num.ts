const app = getApp();
module.exports = {
  key: '余额查询',
  icon:'/icons/vacancies.png',
  showInMenu: true,
  match(msg) {
    return msg === this.key
  },
  action(msg) {
    const that = this;
    app.request({
      url: 'pay/balanceQuery',
      method: 'GET',
      success(res) {
        if (res.type == 1){
          that.result('text', res.message);

        }else{
          let data = []
          for (let i of that.data.preResult) {
            if (i.showInMenu) {
              data.push({ type: 'text', msg: i.key });
            }
          }
          that.result('sendMessage', {
            msg: res.message,
            data
          });
        }
      }
    });
  }
}