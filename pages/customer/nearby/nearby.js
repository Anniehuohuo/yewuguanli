// nearby.js
Page({
  data: {
    locationStatus: 'loading', // loading, success, failed
    currentLocation: null,
    nearbyCustomers: [],
    loading: false
  },

  onLoad: function() {
    this.getLocation();
  },

  // 获取当前位置
  getLocation: function() {
    this.setData({
      locationStatus: 'loading'
    });

    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        this.setData({
          locationStatus: 'success',
          currentLocation: { latitude, longitude }
        });
        this.filterNearbyCustomers(latitude, longitude);
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        this.setData({
          locationStatus: 'failed'
        });
        wx.showModal({
          title: '位置获取失败',
          content: '请检查位置权限设置，或手动刷新重试',
          showCancel: false
        });
      }
    });
  },

  // 筛选附近的客户（2公里内）
  filterNearbyCustomers: function(latitude, longitude) {
    const app = getApp();
    const customers = app.globalData.customers || [];
    const nearbyCustomers = [];
    
    customers.forEach(customer => {
      if (customer.latitude && customer.longitude) {
        const distance = this.calculateDistance(
          latitude, longitude,
          customer.latitude, customer.longitude
        );
        
        // 筛选2公里内的客户
        if (distance <= 2) {
          nearbyCustomers.push({
            ...customer,
            distance: distance.toFixed(1)
          });
        }
      }
    });
    
    // 按距离排序
    nearbyCustomers.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    
    this.setData({
      nearbyCustomers: nearbyCustomers
    });
  },

  // 计算两点间距离（公里）
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  },

  deg2rad: function(deg) {
    return deg * (Math.PI/180);
  },

  // 添加顺访
  addToVisitPlan: function(e) {
    const index = e.currentTarget.dataset.index;
    const customer = this.data.nearbyCustomers[index];
    
    this.setData({
      loading: true
    });

    // 获取今日日期
    const app = getApp();
    const today = app.formatDate();
    
    // 检查是否已经在今日拜访计划中
    const visitPlans = app.globalData.visitPlans || [];
    const existingPlan = visitPlans.find(plan => 
      plan.customerId === customer.id && 
      plan.planDate === today
    );

    if (existingPlan) {
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '该客户已在今日计划中',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 创建新的拜访计划
    const newPlan = {
      id: app.generateId(),
      customerId: customer.id,
      customerName: customer.name,
      planDate: today,
      planTime: '',
      status: 'pending',
      isDropIn: true, // 标记为顺访
      isNearbyVisit: true, // 标记为顺访
      createTime: app.formatDateTime(),
      remark: `顺访客户（距离${customer.distance}km）`
    };

    // 添加到拜访计划
    app.globalData.visitPlans.push(newPlan);
    app.saveVisitPlans();

    this.setData({
      loading: false
    });

    wx.showToast({
      title: '已添加到今日拜访计划',
      icon: 'success',
      duration: 2000
    });

    // 更新客户状态
    this.updateCustomerStatus(index);
  },

  // 更新客户状态
  updateCustomerStatus: function(index) {
    const nearbyCustomers = this.data.nearbyCustomers;
    nearbyCustomers[index].inPlan = true;
    this.setData({
      nearbyCustomers: nearbyCustomers
    });
  },

  // 查看客户详情
  viewCustomerDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const customer = this.data.nearbyCustomers[index];
    wx.navigateTo({
      url: `/pages/customer/detail/detail?id=${customer.id}`
    });
  },

  // 刷新位置
  refreshLocation: function() {
    this.getLocation();
  },

  // 查看拜访计划
  viewVisitPlan: function() {
    wx.navigateTo({
      url: '/pages/visit/plan/plan'
    });
  }
});