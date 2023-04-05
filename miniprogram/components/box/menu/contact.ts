module.exports = {
  key: '客服',
  icon:'/icons/customer.png',
  showInMenu: true,
  match(msg) {
    return msg === this.key
  },
  action(msg) {
    this.result('contact',);
  }
}