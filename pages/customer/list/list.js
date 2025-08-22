// pages/customer/list/list.js
Page({
  data: {
    customers: [],
    filteredCustomers: [],
    searchKeyword: '',
    selectMode: false, // 是否为选择模式
    showFilter: false,
    region: ['','',''], // 省、市、区
    editMode: false, // 批量编辑模式
    selectedCustomers: [] // 选中的客户ID列表
  },
  
  onLoad: function(options) {
    // 检查是否为选择模式
    if (options.select === 'true') {
      this.setData({
        selectMode: true
      });
      wx.setNavigationBarTitle({
        title: '选择客户'
      });
    }
    this.loadCustomers();
  },
  
  onShow: function() {
  // 恢复筛选状态
  const savedFilters = wx.getStorageSync('customer_filters') || {};
  this.setData({
    searchKeyword: savedFilters.searchKeyword || '',
    region: savedFilters.region || ['', '', '']
  });
  // ✅ 重新加载客户数据
  this.loadCustomers();

  // ✅ 加载完后立即重新应用筛选
  this.filterCustomers();
},
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadCustomers();
    wx.stopPullDownRefresh();
  },
  
  // 加载客户数据
  loadCustomers: function() {
    const app = getApp();
    const customers = app.globalData.customers || [];
    const visits = app.globalData.visits || [];
    
    // 为每个客户计算拜访倒计时
     const customersWithCountdown = customers.map(customer => {
       const customerVisits = visits.filter(visit => visit.customerId === customer.id);
       const lastVisit = customerVisits.length > 0 ? 
         customerVisits.sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime))[0] : null;
       
       let visitCountdown = null;
       if (lastVisit) {
         const lastVisitDate = new Date(lastVisit.visitTime);
         const nextVisitDate = new Date(lastVisitDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天后
         const today = new Date();
         today.setHours(0, 0, 0, 0); // 设置为当天0点，便于计算天数
         nextVisitDate.setHours(0, 0, 0, 0);
         const diffTime = nextVisitDate - today;
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         visitCountdown = diffDays > 0 ? diffDays : 0;
       } else {
         // 如果没有拜访记录，从客户创建时间开始计算
         const createDate = new Date(customer.createTime);
         const nextVisitDate = new Date(createDate.getTime() + 30 * 24 * 60 * 60 * 1000);
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         nextVisitDate.setHours(0, 0, 0, 0);
         const diffTime = nextVisitDate - today;
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         visitCountdown = diffDays > 0 ? diffDays : 0;
       }
       
       return {
         ...customer,
         visitCountdown: visitCountdown
       };
     });
    
    // 按创建时间倒序排列
    customersWithCountdown.sort((a, b) => {
      return new Date(b.createTime) - new Date(a.createTime);
    });
    
    this.setData({
      customers: customersWithCountdown,
      filteredCustomers: customersWithCountdown
    });
    
    // 检查是否有需要提醒的客户
    this.checkVisitReminders(customersWithCountdown);
    
    // 如果有搜索关键词，则过滤客户列表
    if (this.data.searchKeyword) {
      this.filterCustomers();
    }
  },
  
  // 搜索输入事件
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterCustomers();
    this.saveFilterState();
  },
  
  // 过滤客户列表
  filterCustomers: function() {
    const keyword = this.data.searchKeyword.toLowerCase();
    const region = this.data.region;
    const hasRegionFilter = region[0] || region[1] || region[2];
    
    let filtered = this.data.customers;
    
    // 关键词过滤
    if (keyword) {
      filtered = filtered.filter(item => {
        return (
          (item.name && item.name.toLowerCase().indexOf(keyword) !== -1) ||
          (item.contact && item.contact.toLowerCase().indexOf(keyword) !== -1) ||
          (item.phone && item.phone.indexOf(keyword) !== -1) ||
          (item.address && item.address.toLowerCase().indexOf(keyword) !== -1)
        );
      });
    }
    
    // 地址过滤
    if (hasRegionFilter) {
      filtered = filtered.filter(item => {
        if (!item.address) return false;
        
        const address = item.address;
        // 检查省份
        if (region[0] && !address.includes(region[0])) {
          return false;
        }
        // 检查城市
        if (region[1] && !address.includes(region[1])) {
          return false;
        }
        // 检查区县
        if (region[2] && !address.includes(region[2])) {
          return false;
        }
        return true;
      });
    }
    
    this.setData({
      filteredCustomers: filtered
    });
  },
  
  // 查看客户详情或选择客户
  viewCustomerDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    
    if (this.data.selectMode) {
      // 选择模式：返回选中的客户
      const customer = this.data.customers.find(c => c.id === id);
      if (customer) {
        // 获取上一页面的页面栈
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        
        if (prevPage) {
          // 设置选中的客户数据
          prevPage.setData({
            customerId: customer.id,
            customer: customer
          });
        }
        
        wx.navigateBack();
      }
    } else {
      // 普通模式：查看详情
      wx.navigateTo({
        url: `/pages/customer/detail/detail?id=${id}`
      });
    }
  },
  
  // 添加客户
  addCustomer: function() {
    wx.navigateTo({
      url: '/pages/customer/edit/edit'
    });
  },
  
  // 拨打客户电话
  callCustomer: function(e) {
    const phone = e.currentTarget.dataset.phone;
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
  
  // 拜访客户
  visitCustomer: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/visit/form/form?customerId=${id}`
    });
  },

  // 显示筛选弹窗
  showFilterModal: function() {
    this.setData({
      showFilter: true
    });
  },

  // 隐藏筛选弹窗
  hideFilterModal: function() {
    this.setData({
      showFilter: false
    });
  },

  // 地区选择变化
  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    });
  },

  // 重置筛选
  resetFilters: function() {
    this.setData({
      region: ['','','']
    });
    this.filterCustomers();
    this.hideFilterModal();
  },

  // 应用筛选
  applyFilters: function() {
    this.filterCustomers();
    this.hideFilterModal();
    this.saveFilterState();
  },

  // 保存筛选状态
  saveFilterState: function() {
    wx.setStorageSync('customer_filters', {
      searchKeyword: this.data.searchKeyword,
      region: this.data.region
    });
  },

  // 切换批量编辑模式
  toggleEditMode: function() {
    this.setData({
      editMode: !this.data.editMode,
      selectedCustomers: []
    });
  },

  // 选择/取消选择客户
  toggleSelectCustomer: function(e) {
    const customerId = e.currentTarget.dataset.id;
    const selectedCustomers = [...this.data.selectedCustomers];
    const index = selectedCustomers.indexOf(customerId);
    
    if (index > -1) {
      selectedCustomers.splice(index, 1);
    } else {
      selectedCustomers.push(customerId);
    }
    
    console.log('选中的客户ID列表:', selectedCustomers);
    
    this.setData({
      selectedCustomers: selectedCustomers
    });
  },

  // 全选/取消全选
  toggleSelectAll: function() {
    const allSelected = this.data.selectedCustomers.length === this.data.filteredCustomers.length;
    if (allSelected) {
      this.setData({
        selectedCustomers: []
      });
    } else {
      this.setData({
        selectedCustomers: this.data.filteredCustomers.map(customer => customer.id)
      });
    }
  },

  // 批量删除客户
  batchDeleteCustomers: function() {
    if (this.data.selectedCustomers.length === 0) {
      wx.showToast({
        title: '请选择要删除的客户',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的${this.data.selectedCustomers.length}个客户吗？删除后相关的拜访记录也会被删除。`,
      success: (res) => {
        if (res.confirm) {
          this.deleteSelectedCustomers();
        }
      }
    });
  },

  // 执行删除选中的客户
  deleteSelectedCustomers: function() {
    const app = getApp();
    const selectedIds = this.data.selectedCustomers;
    
    // 删除客户
    app.globalData.customers = app.globalData.customers.filter(customer => 
      !selectedIds.includes(customer.id)
    );
    
    // 删除相关的拜访记录
    app.globalData.visits = app.globalData.visits.filter(visit => 
      !selectedIds.includes(visit.customerId)
    );
    
    // 删除相关的打卡记录
    app.globalData.checkins = app.globalData.checkins.filter(checkin => 
      !selectedIds.includes(checkin.customerId)
    );
    
    // 删除相关的拜访计划
    app.globalData.visitPlans = app.globalData.visitPlans.filter(plan => 
      !selectedIds.includes(plan.customerId)
    );
    
    // 保存数据
    app.saveCustomers();
    app.saveVisits();
    app.saveCheckins();
    app.saveVisitPlans();
    
    // 退出编辑模式并刷新列表
    this.setData({
      editMode: false,
      selectedCustomers: []
    });
    
    this.loadCustomers();
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  // 检查拜访提醒
  checkVisitReminders: function(customers) {
    const remindCustomers = customers.filter(customer => {
      return customer.visitCountdown !== null && customer.visitCountdown <= 7 && customer.visitCountdown > 0;
    });
    
    if (remindCustomers.length > 0) {
      // 获取本地存储的提醒记录，避免重复提醒
      const today = new Date().toDateString();
      const reminderKey = `visit_reminder_${today}`;
      const todayReminded = wx.getStorageSync(reminderKey) || [];
      
      const needRemindCustomers = remindCustomers.filter(customer => {
        return !todayReminded.includes(customer.id);
      });
      
      if (needRemindCustomers.length > 0) {
        const customerNames = needRemindCustomers.map(c => `${c.name}(${c.visitCountdown}天)`).join('、');
        
        wx.showModal({
          title: '拜访提醒',
          content: `以下客户需要安排拜访：\n${customerNames}`,
          confirmText: '知道了',
          showCancel: false,
          success: () => {
            // 记录今日已提醒的客户
            const newReminded = [...todayReminded, ...needRemindCustomers.map(c => c.id)];
            wx.setStorageSync(reminderKey, newReminded);
          }
        });
      }
    }
  }
});