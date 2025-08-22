// pages/visit/detail/detail.js
Page({
  data: {
    visitId: '',
    visit: {},
    customer: {},
    showMap: false,
    location: {
      latitude: 0,
      longitude: 0
    },
    markers: []
  },
  
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        visitId: options.id
      });
      this.loadVisitData();
    } else {
      wx.showToast({
        title: '拜访ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  onShow: function() {
    // 页面显示时重新加载数据，以便在编辑后刷新
    if (this.data.visitId) {
      this.loadVisitData();
    }
  },
  
  // 加载拜访数据
  loadVisitData: function() {
    const app = getApp();
    const visits = app.globalData.visits || [];
    const visit = visits.find(v => v.id === this.data.visitId);
    
    if (!visit) {
      wx.showToast({
        title: '拜访记录不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 加载客户信息
    const customers = app.globalData.customers || [];
    const customer = customers.find(c => c.id === visit.customerId) || {};
    
    this.setData({
      visit: visit,
      customer: customer
    });
    
    // 如果有位置信息，设置地图标记点
    if (customer.latitude && customer.longitude) {
      this.setData({
        location: {
          latitude: customer.latitude,
          longitude: customer.longitude
        },
        markers: [{
          id: 1,
          latitude: customer.latitude,
          longitude: customer.longitude,
          title: customer.name,
          callout: {
            content: customer.name,
            color: '#000000',
            fontSize: 14,
            borderRadius: 3,
            bgColor: '#ffffff',
            padding: 5,
            display: 'ALWAYS'
          }
        }]
      });
    }
  },
  
  // 拨打电话
  callPhone: function() {
    const phone = this.data.customer.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      });
    } else {
      wx.showToast({
        title: '电话号码不存在',
        icon: 'none'
      });
    }
  },
  
  // 查看位置
  viewLocation: function() {
    if (this.data.customer.latitude && this.data.customer.longitude) {
      this.setData({
        showMap: true
      });
    } else {
      wx.showToast({
        title: '位置信息不存在',
        icon: 'none'
      });
    }
  },
  
  // 关闭地图
  closeMap: function() {
    this.setData({
      showMap: false
    });
  },
  
  // 打开导航
  openLocation: function() {
    const { latitude, longitude } = this.data.location;
    const { name, address } = this.data.customer;
    
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address
    });
  },
  
  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.visit.photos || [];
    
    wx.previewImage({
      current: url,
      urls: urls
    });
  },
  
  // 编辑拜访
  editVisit: function() {
    wx.navigateTo({
      url: `/pages/visit/form/form?id=${this.data.visitId}`
    });
  },
  
  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});