// pages/visit/plan/plan.js
Page({
  data: {
    plans: [],
    filteredPlans: [],
    customers: [],
    searchKeyword: '',
    showAddModal: false,
    showSearchModal: false,
    selectedDate: '',
    selectedDateDisplay: '',
    currentDateTab: 'all',
    showDatePicker: false,
    newPlan: {
      customerId: '',
      customerName: '',
      planDate: '',
      planTime: '09:00',
      remark: '',
      priority: 'normal' // high, normal, low
    },
    searchResults: [],
    searchCustomerKeyword: '',
    timeOptions: [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00'
    ],
    priorityOptions: [
      { label: '高优先级', value: 'high', color: '#ff4757' },
      { label: '普通', value: 'normal', color: '#3742fa' },
      { label: '低优先级', value: 'low', color: '#7bed9f' }
    ]
  },

  onLoad: function(options) {
    this.loadData();
    this.initDates();
  },

  onShow: function() {
    this.loadData();
  },

  onPullDownRefresh: function() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  // 初始化日期
  initDates: function() {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = this.formatDate(tomorrow);
    
    this.setData({
      selectedDate: '',
      selectedDateDisplay: '',
      currentDateTab: 'all',
      'newPlan.planDate': tomorrowStr
    });
  },

  // 加载数据
  loadData: function() {
    const app = getApp();
    const plans = app.globalData.visitPlans || [];
    const customers = app.globalData.customers || [];
    
    // 按日期和时间排序
    const sortedPlans = plans.sort((a, b) => {
      const dateTimeA = new Date(`${a.planDate} ${a.planTime}`);
      const dateTimeB = new Date(`${b.planDate} ${b.planTime}`);
      return dateTimeA - dateTimeB;
    });
    
    // 添加客户信息
    const plansWithCustomer = sortedPlans.map(plan => {
      const customer = customers.find(c => c.id === plan.customerId) || {};
      return {
        ...plan,
        customerName: customer.name || '未知客户',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || ''
      };
    });
    
    this.setData({
      plans: plansWithCustomer,
      customers: customers
    }, () => {
      this.applyDateFilter();
    });
  },

  // 搜索计划
  onSearchInput: function(e) {
    const keyword = e.detail.value.toLowerCase();
    this.setData({ searchKeyword: keyword });
    this.applyDateFilter();
  },

  // 显示添加计划弹窗
  showAddPlan: function() {
    this.resetNewPlan(); // 每次打开弹窗时重置表单
    this.setData({ showAddModal: true });
  },

  // 隐藏添加计划弹窗
  hideAddModal: function() {
    this.setData({ 
      showAddModal: false
    });
  },
  
  // 重置新计划数据
  resetNewPlan: function() {
    this.setData({
      newPlan: {
        customerId: '',
        customerName: '',
        planDate: this.data.selectedDate,
        planTime: '09:00',
        remark: '',
        priority: 'normal'
      }
    });
  },

  // 显示客户搜索弹窗
  showCustomerSearch: function() {
    this.setData({ 
      showSearchModal: true,
      searchCustomerKeyword: '',
      searchResults: [] // 初始不显示任何客户，需要搜索
    });
  },

  // 隐藏客户搜索弹窗
  hideSearchModal: function() {
    this.setData({ 
      showSearchModal: false,
      searchCustomerKeyword: '',
      searchResults: []
    });
  },

  // 搜索客户
  onCustomerSearchInput: function(e) {
    const keyword = e.detail.value.toLowerCase();
    this.setData({ searchCustomerKeyword: keyword });
    
    if (!keyword) {
      this.setData({ searchResults: [] });
      return;
    }
    
    const filtered = this.data.customers.filter(customer => {
      return customer.name.toLowerCase().includes(keyword) ||
             customer.contact.toLowerCase().includes(keyword) ||
             customer.phone.includes(keyword) ||
             customer.address.toLowerCase().includes(keyword);
    }).slice(0, 20); // 增加显示数量到20个
    
    this.setData({ searchResults: filtered });
  },

  // 清除搜索关键词
  clearCustomerSearch: function() {
    this.setData({
      searchCustomerKeyword: '',
      searchResults: []
    });
  },

  // 选择客户
  selectCustomer: function(e) {
    const customer = e.currentTarget.dataset.customer;
    this.setData({
      'newPlan.customerId': customer.id,
      'newPlan.customerName': customer.name,
      showSearchModal: false,
      showAddModal: true,
      searchCustomerKeyword: '',
      searchResults: []
    });
  },

  // 新建客户
  createNewCustomer: function() {
    wx.navigateTo({
      url: '/pages/customer/edit/edit?returnPage=plan'
    });
  },

  // 日期选择
  bindDateChange: function(e) {
    this.setData({
      'newPlan.planDate': e.detail.value
    });
  },

  // 时间选择
  bindTimeChange: function(e) {
    const timeIndex = e.detail.value;
    this.setData({
      'newPlan.planTime': this.data.timeOptions[timeIndex]
    });
  },

  // 优先级选择
  bindPriorityChange: function(e) {
    const priorityIndex = e.detail.value;
    this.setData({
      'newPlan.priority': this.data.priorityOptions[priorityIndex].value
    });
  },

  // 备注输入
  onRemarkInput: function(e) {
    this.setData({
      'newPlan.remark': e.detail.value
    });
  },

  // 保存计划
  savePlan: function() {
    const { newPlan } = this.data;
    
    if (!newPlan.customerId) {
      wx.showToast({
        title: '请选择客户',
        icon: 'none'
      });
      return;
    }
    
    if (!newPlan.planDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    
    const app = getApp();
    const existingPlans = app.globalData.visitPlans || [];
    
    // 检查是否已存在相同客户在相同日期和时间的计划
    const duplicatePlan = existingPlans.find(plan => {
      return plan.customerId === newPlan.customerId && 
             plan.planDate === newPlan.planDate && 
             plan.planTime === newPlan.planTime &&
             plan.status === 'pending';
    });
    
    if (duplicatePlan) {
      wx.showToast({
        title: '该客户在此时间已有计划',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const planData = {
      id: 'plan_' + Date.now(),
      customerId: newPlan.customerId,
      planDate: newPlan.planDate,
      planTime: newPlan.planTime,
      remark: newPlan.remark,
      priority: newPlan.priority,
      status: 'pending', // pending, completed, cancelled
      createTime: app.formatDateTime(new Date())
    };
    
    // 保存到全局数据
    if (!app.globalData.visitPlans) {
      app.globalData.visitPlans = [];
    }
    app.globalData.visitPlans.push(planData);
    app.saveVisitPlans();
    
    wx.showToast({
      title: '计划添加成功',
      icon: 'success'
    });
    
    this.hideAddModal();
    this.resetNewPlan(); // 保存成功后重置表单
    this.loadData();
  },

  // 删除计划
  deletePlan: function(e) {
    const planId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个拜访计划吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const plans = app.globalData.visitPlans || [];
          const updatedPlans = plans.filter(plan => plan.id !== planId);
          app.globalData.visitPlans = updatedPlans;
          app.saveVisitPlans();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          
          this.loadData();
        }
      }
    });
  },

  // 标记计划完成
  completePlan: function(e) {
    const planId = e.currentTarget.dataset.id;
    const app = getApp();
    const plans = app.globalData.visitPlans || [];
    
    const planIndex = plans.findIndex(plan => plan.id === planId);
    if (planIndex !== -1) {
      plans[planIndex].status = 'completed';
      plans[planIndex].completeTime = app.formatDateTime(new Date());
      app.globalData.visitPlans = plans;
      app.saveVisitPlans();
      
      wx.showToast({
        title: '已标记完成',
        icon: 'success'
      });
      
      this.loadData();
    }
  },

  // 开始拜访（跳转到拜访表单）
  startVisit: function(e) {
    // 检查每日新增限制
    const app = getApp();
    const today = app.formatDate();
    const todayVisits = app.globalData.visits.filter(visit => {
      const visitDate = visit.createTime ? visit.createTime.split(' ')[0] : '';
      return visitDate === today;
    });
    
    if (todayVisits.length >= 1) {
      wx.showModal({
         title: '提示',
         content: '您今天已经新增过拜访记录了，每天最多只能新增一条拜访记录。如需重新添加，请先删除今天的拜访记录。',
         showCancel: false,
         confirmText: '我知道了'
       });
      return;
    }
    
    const planId = e.currentTarget.dataset.id;
    const plan = this.data.plans.find(p => p.id === planId);
    
    if (plan) {
      wx.navigateTo({
        url: `/pages/visit/form/form?customerId=${plan.customerId}&planId=${planId}`
      });
    }
  },

  // 查看计划详情
  viewPlanDetail: function(e) {
    const planId = e.currentTarget.dataset.id;
    // 这里可以实现计划详情页面，暂时显示操作选项
    const plan = this.data.plans.find(p => p.id === planId);
    
    if (plan.status === 'pending') {
      wx.showActionSheet({
        itemList: ['开始拜访', '标记完成', '删除计划'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.startVisit(e);
          } else if (res.tapIndex === 1) {
            this.completePlan(e);
          } else if (res.tapIndex === 2) {
            this.deletePlan(e);
          }
        }
      });
    } else {
      wx.showActionSheet({
        itemList: ['删除计划'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.deletePlan(e);
          }
        }
      });
    }
  },

  // 拨打电话
  callCustomer: function(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      });
    }
  },

  // 快捷日期选择
  selectQuickDate: function(e) {
    const type = e.currentTarget.dataset.type;
    const today = new Date();
    let selectedDate = '';
    let selectedDateDisplay = '';
    
    switch(type) {
      case 'today':
        selectedDate = this.formatDate(today);
        selectedDateDisplay = '今天';
        break;
      case 'tomorrow':
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        selectedDate = this.formatDate(tomorrow);
        selectedDateDisplay = '明天';
        break;
      case 'week':
        // 本周不设置具体日期，在筛选时处理
        selectedDate = 'week';
        selectedDateDisplay = '本周';
        break;
      case 'all':
      default:
        selectedDate = '';
        selectedDateDisplay = '';
        break;
    }
    
    this.setData({
      selectedDate: selectedDate,
      selectedDateDisplay: selectedDateDisplay,
      currentDateTab: type
    });
    
    this.applyDateFilter();
  },

  // 日期选择器变化处理
  onDatePickerChange: function(e) {
    const selectedDate = e.detail.value;
    const dateObj = new Date(selectedDate);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    let displayText = selectedDate;
    let tabType = 'custom';
    
    // 判断是否为今天或明天
    if (selectedDate === this.formatDate(today)) {
      displayText = '今天';
      tabType = 'today';
    } else if (selectedDate === this.formatDate(tomorrow)) {
      displayText = '明天';
      tabType = 'tomorrow';
    }
    
    this.setData({
      selectedDate: selectedDate,
      selectedDateDisplay: displayText,
      currentDateTab: tabType
    });
    
    this.applyDateFilter();
  },

  // 清除日期筛选
  clearDateFilter: function() {
    this.setData({
      selectedDate: '',
      selectedDateDisplay: '',
      currentDateTab: 'all'
    });
    this.applyDateFilter();
  },

  // 应用日期筛选
  applyDateFilter: function() {
    let filteredPlans = this.data.plans;
    const { selectedDate, searchKeyword } = this.data;
    
    // 日期筛选
    if (selectedDate) {
      if (selectedDate === 'week') {
        // 本周筛选
        const today = new Date();
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 周一为一周开始
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        filteredPlans = filteredPlans.filter(plan => {
          const planDate = new Date(plan.planDate);
          return planDate >= startOfWeek && planDate <= endOfWeek;
        });
      } else {
        // 具体日期筛选
        filteredPlans = filteredPlans.filter(plan => plan.planDate === selectedDate);
      }
    }
    
    // 关键词搜索筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filteredPlans = filteredPlans.filter(plan => {
        return plan.customerName.toLowerCase().includes(keyword) ||
               (plan.remark && plan.remark.toLowerCase().includes(keyword)) ||
               plan.planDate.includes(keyword);
      });
    }
    
    this.setData({
      filteredPlans: filteredPlans
    });
  },

  // 格式化日期
  formatDate: function(date) {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 获取优先级颜色
  getPriorityColor: function(priority) {
    const priorityMap = {
      'high': '#ff4757',
      'normal': '#3742fa',
      'low': '#7bed9f'
    };
    return priorityMap[priority] || '#3742fa';
  },

  // 获取优先级文本
  getPriorityText: function(priority) {
    const priorityMap = {
      'high': '高',
      'normal': '普通',
      'low': '低'
    };
    return priorityMap[priority] || '普通';
  },

  // 智能路径规划
  optimizeRoute: function() {
    const tomorrow = this.getTomorrowDate();
    
    // 直接从app获取最新数据，而不依赖页面的data
    const app = getApp();
    const allPlans = app.globalData.visitPlans || [];
    
    const tomorrowPlans = allPlans.filter(plan => 
      plan.planDate === tomorrow && plan.status === 'pending'
    );
    
    if (tomorrowPlans.length === 0) {
      wx.showModal({
        title: '提示',
        content: `明天(${tomorrow})暂无待办拜访计划\n\n请先添加明天的拜访计划，然后再进行路径规划。`,
        showCancel: false
      });
      return;
    }
    
    wx.showLoading({
      title: '正在规划路径...'
    });
    
    // 获取用户当前位置作为出发点
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const startPoint = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        
        // 执行路径优化
        const optimizedPlans = this.calculateOptimalRoute(startPoint, tomorrowPlans);
        
        // 更新计划顺序
        this.updatePlanOrder(optimizedPlans);
        
        wx.hideLoading();
        wx.showToast({
          title: '路径规划完成',
          icon: 'success'
        });
        
        this.loadData();
      },
      fail: () => {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '无法获取位置信息，请检查定位权限设置',
          showCancel: false
        });
      }
    });
  },

  // 获取明天日期
  getTomorrowDate: function() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDate(tomorrow);
  },

  // 计算两点间距离（使用Haversine公式）
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // 角度转弧度
  toRadians: function(degrees) {
    return degrees * (Math.PI / 180);
  },

  // 计算最优路径（使用贪心算法的最近邻居法）
  calculateOptimalRoute: function(startPoint, plans) {
    const app = getApp();
    const customers = app.globalData.customers || [];
    
    // 为每个计划添加客户坐标信息
    const plansWithCoords = plans.map(plan => {
      const customer = customers.find(c => c.id === plan.customerId);
      return {
        ...plan,
        latitude: customer?.latitude || 0,
        longitude: customer?.longitude || 0,
        customerName: customer?.name || '未知客户'
      };
    }).filter(plan => plan.latitude && plan.longitude); // 过滤掉没有坐标的计划
    
    if (plansWithCoords.length === 0) {
      return plans;
    }
    
    // 使用最近邻居算法优化路径
    const optimizedRoute = [];
    const unvisited = [...plansWithCoords];
    let currentPoint = startPoint;
    
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = this.calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        unvisited[0].latitude,
        unvisited[0].longitude
      );
      
      // 找到最近的未访问点
      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(
          currentPoint.latitude,
          currentPoint.longitude,
          unvisited[i].latitude,
          unvisited[i].longitude
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      // 将最近的点添加到路径中
      const nearestPlan = unvisited.splice(nearestIndex, 1)[0];
      optimizedRoute.push(nearestPlan);
      
      // 更新当前位置
      currentPoint = {
        latitude: nearestPlan.latitude,
        longitude: nearestPlan.longitude
      };
    }
    
    return optimizedRoute;
  },

  // 更新计划顺序
  updatePlanOrder: function(optimizedPlans) {
    const app = getApp();
    const allPlans = app.globalData.visitPlans || [];
    
    // 为优化后的计划分配新的时间顺序
    optimizedPlans.forEach((plan, index) => {
      const planIndex = allPlans.findIndex(p => p.id === plan.id);
      if (planIndex !== -1) {
        // 根据顺序设置时间，从9:00开始，每个计划间隔1小时
        const hour = 9 + index;
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        allPlans[planIndex].planTime = timeStr;
        allPlans[planIndex].routeOrder = index + 1; // 添加路径顺序标识
      }
    });
    
    app.globalData.visitPlans = allPlans;
    app.saveVisitPlans();
  }
});