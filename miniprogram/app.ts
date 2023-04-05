// app.ts
require("./utils/page")
const globalDataChangeListeners = [];



const serverConfig = {
  env: __wxConfig.envVersion, // develop | trial | release | __wxConfig.envVersion
  develop: {
    url: 'https://vip.chatgpt.com/',
    prefix: 'api/v1/',
    app_id: 'dev_64057db63a0b3',
  },
  trial: {
    url: 'https://chatvip.tooking.cn/',
    prefix: 'api/v1/',
    app_id: 'vip_64058ea5bf932',
  },
  release: {
    url: 'https://zxk.tooking.cn/',
    prefix: 'api/v1/',
    app_id: 'zxk_642245fa6e184',

  },
}
const config = serverConfig[serverConfig.env];

App<IAppOption>({
  globalData: {
    token: '',
    config: config,
  },
  request(args) {
    const request = {};
    request.url = config.url + config.prefix + args.url;
    request.method = args.method || 'POST';
    const data = args.data || {};
    data.app_id = config.app_id;
    request.data = data;
    console.log('发送请求', request);
    const header = args.header || {};
    header['Authorization'] = this.globalData.token;
    request.header = header;
    request.timeout = args.timeout || 60000;
    request.dataType = args.dataType || 'json';
    request.responseType = args.responseType || 'text';
    request.success = (res) => {
      console.log('请求成功', res);
      let data = res.data;
      if (args.file) {
        data = JSON.parse(data)
      }
      if (data.code == 200) {
        if (args.success) args.success(data.data);
      } else if (data.code == 401) {
        this.login(() => {
          this.request(args);
        });
      } else {
        if (args.error) {
          args.error(data);
        } else {
          wx.showToast({
            title: data.msg, icon: 'error', duration: 2000
          })
        }
      }
    }
    request.fail = function (errMsg, errno) {
      console.log('请求失败', errMsg, errno);
      if (args.fail) args.fail(errMsg, errno);
    }
    if (args.file) {
      request.filePath = args.file.filePath
      request.name = args.file.name
      request.formData = request.data
      wx.uploadFile(request);
    } else {
      wx.request(request);
    }
  },
  login(success) {
    wx.login({
      success: res => {
        this.request({
          url: 'mp/auth/login',
          data: { code: res.code },
          success: (data) => {
            this.setToken(data.token);
            if (success) success();
          }
        });
      },
    })
  },
  setToken(token) {
    wx.setStorageSync('token', token);
    this.globalData.token = token;
  },
  openPage(e) {
    let url;
    if (typeof e === 'string') {
      url = e;
    } else {
      url = e.currentTarget.url;
    }
    if (!url) return;

    if (!url.startsWith('http')) {
      // 小程序内
      if (!url.startsWith('/')) {
        url = '/' + url;
      }
      wx.navigateTo({
        url: url,
        fail() {
          // 失败则尝试switchTab
          let tabData = url.split('?');
          wx.setStorageSync('__tabData__', tabData);
          wx.switchTab({
            url: tabData[0],
          });
        }
      });
    } else { // webview
      url = encodeURIComponent(url);
      wx.navigateTo({ url: '/pages/web/web?url=' + url });
    }
  },
  onLaunch() {
    var that = this
    this.update();
    const token = wx.getStorageSync('token');
    if (token) {
      that.globalData.token = token;
    }
    wx.getSystemInfo({
      success(res) {
        that.globalData.platform = res.platform
      }
    });
    this.overShare();
  },
  isMobile() {
    return this.globalData.platform === 'ios' || this.globalData.platform === 'android'
  },
  overShare: function () {
    //监听路由切换
    wx.onAppRoute(function (res) {
      let pages = getCurrentPages(),
        view = pages[pages.length - 1]
      if (view) {
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        })
      }
    })
  },
  update() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) { });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
    updateManager.onUpdateFailed(function () {// 新的版本下载失败
    });
  },
})
