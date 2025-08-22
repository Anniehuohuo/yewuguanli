// pages/customer/detail/detail.js
Page({
  data: {
    id: '',
    customer: {},
    visits: [],
    checkins: [],
    currentTab: 'visit', // 当前选中的标签页
    showMap: false,
    markers: []
  },
  
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        id: options.id
      });
      this.loadCustomerData();
    } else {
      wx.showToast({
        title: '客户ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  onShow: function() {
    if (this.data.id) {
      this.loadCustomerData();
    }
  },
  
  // 加载客户数据
  loadCustomerData: function() {
    const app = getApp();
    const customers = app.globalData.customers || [];
    const visits = app.globalData.visits || [];
    const checkins = app.globalData.checkins || [];
    
    // 查找客户信息
    const customer = customers.find(item => item.id === this.data.id);
    if (!customer) {
      wx.showToast({
        title: '客户不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 查找该客户的拜访记录
    const customerVisits = visits.filter(item => item.customerId === this.data.id);
    // 按拜访时间倒序排列
    customerVisits.sort((a, b) => {
      return new Date(b.visitTime) - new Date(a.visitTime);
    });
    
    // 查找该客户的打卡记录
    const customerCheckins = checkins.filter(item => item.customerId === this.data.id);
    // 按打卡时间倒序排列
    customerCheckins.sort((a, b) => {
      return new Date(b.checkinTime) - new Date(a.checkinTime);
    });
    
    // 设置地图标记点
    const markers = [];
    if (customer.latitude && customer.longitude) {
      markers.push({
        id: 1,
        latitude: customer.latitude,
        longitude: customer.longitude,
        title: customer.name,
        callout: {
          content: customer.name,
          color: '#333',
          fontSize: 14,
          borderRadius: 4,
          padding: 8,
          display: 'ALWAYS'
        }
      });
    }
    
    this.setData({
      customer: customer,
      visits: customerVisits,
      checkins: customerCheckins,
      markers: markers
    });
  },
  
  // 编辑客户信息
  editCustomer: function() {
    wx.navigateTo({
      url: `/pages/customer/edit/edit?id=${this.data.id}`
    });
  },
  
  // 删除客户
  deleteCustomer: function() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该客户吗？删除后相关的拜访记录也会被删除，无法恢复。',
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const customerId = this.data.id;
          
          // 删除客户
          const customers = app.globalData.customers || [];
          const index = customers.findIndex(item => item.id === customerId);
          
          if (index !== -1) {
            customers.splice(index, 1);
            
            // 删除相关的拜访记录
            app.globalData.visits = app.globalData.visits.filter(visit => 
              visit.customerId !== customerId
            );
            
            // 删除相关的打卡记录
            app.globalData.checkins = app.globalData.checkins.filter(checkin => 
              checkin.customerId !== customerId
            );
            
            // 删除相关的拜访计划
            app.globalData.visitPlans = app.globalData.visitPlans.filter(plan => 
              plan.customerId !== customerId
            );
            
            // 保存所有数据
            app.saveCustomers();
            app.saveVisits();
            app.saveCheckins();
            app.saveVisitPlans();
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        }
      }
    });
  },
  
  // 拨打电话
  callPhone: function() {
    const phone = this.data.customer.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
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
    const customer = this.data.customer;
    if (customer.latitude && customer.longitude) {
      wx.openLocation({
        latitude: customer.latitude,
        longitude: customer.longitude,
        name: customer.name,
        address: customer.address
      });
    }
  },
  
  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
  },

  // 新增拜访
  addVisit: function() {
    // 检查每日每客户新增限制
    const app = getApp();
    const today = app.formatDate();
    const todayCustomerVisits = app.globalData.visits.filter(visit => {
      const visitDate = visit.createTime ? visit.createTime.split(' ')[0] : '';
      return visitDate === today && visit.customerId === this.data.id;
    });
    
    if (todayCustomerVisits.length >= 1) {
      wx.showModal({
         title: '提示',
         content: `您今天已经拜访过客户"${this.data.customer.name}"了，每天每个客户最多只能新增一条拜访记录。如需重新添加，请先删除今天对该客户的拜访记录。`,
         showCancel: false,
         confirmText: '我知道了'
       });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/visit/form/form?customerId=${this.data.id}`
    });
  },

  // 打卡拍照
  addCheckin: function() {
    wx.navigateTo({
      url: `/pages/visit/checkin/checkin?customerId=${this.data.id}`
    });
  },
  
  // 查看拜访详情
  viewVisitDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/visit/form/form?id=${id}`
    });
  },
  
  // 删除拜访记录
  deleteVisit: function(e) {
    const visitId = e.currentTarget.dataset.id;
    const app = getApp();
    const visits = app.globalData.visits || [];
    const visit = visits.find(item => item.id === visitId);
    
    if (!visit) {
      wx.showToast({
        title: '拜访记录不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除${visit.customerName || '该客户'}的拜访记录吗？`,
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          // 从全局数据中删除拜访记录
          const index = visits.findIndex(item => item.id === visitId);
          if (index !== -1) {
            visits.splice(index, 1);
            app.saveVisits();
            
            // 同时删除相关的打卡记录
            const checkins = app.globalData.checkins || [];
            const checkinIndex = checkins.findIndex(item => item.visitId === visitId);
            if (checkinIndex !== -1) {
              checkins.splice(checkinIndex, 1);
              app.saveCheckins();
            }
            
            // 重新加载数据
            this.loadCustomerData();
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },
  
  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls;
    
    wx.previewImage({
      current: current,
      urls: urls
    });
  }
});