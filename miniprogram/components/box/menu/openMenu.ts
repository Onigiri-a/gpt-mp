module.exports = {
  key: '打开菜单',
  icon:'/icons/menu.png',
  showInMenu: true,
  match(msg) {
    return msg === this.key
  },
  action(msg) {
    let data = []
    for (let i of this.data.preResult) {
      if (i.showInMenu) {
        data.push({ type: 'text', msg: i.key, icon: i.icon });
      }
    }
    this.result('sendMessage', {
      msg: '',
      data
    });
  }
}