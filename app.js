// app.js
App({
  globalData: {
    userInfo: null,
    customers: [],
    visits: [],
    checkins: [],
    visitPlans: []
  },
  onLaunch: function() {
    // 获取本地存储的数据
    let customers = wx.getStorageSync('customers') || [];
    let visits = wx.getStorageSync('visits') || [];
    let checkins = wx.getStorageSync('checkins') || [];
    let visitPlans = wx.getStorageSync('visitPlans') || [];
    
    // 如果没有数据，添加模拟数据
    if (customers.length === 0) {
      customers = this.generateMockData().customers;
      wx.setStorageSync('customers', customers);
    }
    
    if (visits.length === 0) {
      visits = this.generateMockData().visits;
      wx.setStorageSync('visits', visits);
    }
    
    if (checkins.length === 0) {
      checkins = this.generateMockData().checkins;
      wx.setStorageSync('checkins', checkins);
    }
    
    if (visitPlans.length === 0) {
      visitPlans = this.generateMockData().visitPlans;
      wx.setStorageSync('visitPlans', visitPlans);
    }
    
    this.globalData.customers = customers;
    this.globalData.visits = visits;
    this.globalData.checkins = checkins;
    this.globalData.visitPlans = visitPlans;
    
    // 检查更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          
          updateManager.onUpdateFailed(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本下载失败，请检查网络后重试'
            });
          });
        }
      });
    }
  },
  
  // 保存客户数据到本地存储
  saveCustomers: function() {
    wx.setStorageSync('customers', this.globalData.customers);
  },
  
  // 保存拜访记录到本地存储
  saveVisits: function() {
    wx.setStorageSync('visits', this.globalData.visits);
  },
  
  // 保存打卡记录到本地存储
  saveCheckins: function() {
    wx.setStorageSync('checkins', this.globalData.checkins);
  },
  
  // 保存拜访计划到本地存储
  saveVisitPlans: function() {
    wx.setStorageSync('visitPlans', this.globalData.visitPlans);
  },
  
  // 生成唯一ID
  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },
  
  // 格式化日期时间
  formatDateTime: function(date) {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    const second = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },
  
  // 格式化日期
  formatDate: function(date) {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 获取今日统计
  getTodayStats: function() {
    const today = this.formatDate();
    const todayVisits = this.globalData.visits.filter(visit => 
      visit.visitDate && visit.visitDate.startsWith(today)
    );
    const todayCheckins = this.globalData.checkins.filter(checkin => 
      checkin.checkinTime && checkin.checkinTime.startsWith(today)
    );
    
    return {
      visitCount: todayVisits.length,
      checkinCount: todayCheckins.length,
      customerCount: this.globalData.customers.length
    };
  },
  
  // 生成模拟数据
  generateMockData: function() {
    const customers = [
      {
        id: this.generateId(),
        name: '张三',
        company: '北京科技有限公司',
        position: '采购经理',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        address: '北京市朝阳区建国路88号',
        industry: '科技',
        level: 'A',
        source: '电话营销',
        createTime: this.formatDateTime(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        lastVisitTime: this.formatDateTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        visitCount: 3,
        notes: '重要客户，有合作意向',
        latitude: 39.9042,
        longitude: 116.4074
      },
      {
        id: this.generateId(),
        name: '李四',
        company: '上海贸易集团',
        position: '总经理',
        phone: '13800138002',
        email: 'lisi@example.com',
        address: '上海市浦东新区陆家嘴金融中心',
        industry: '贸易',
        level: 'B',
        source: '展会',
        createTime: this.formatDateTime(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
        lastVisitTime: this.formatDateTime(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        visitCount: 2,
        notes: '需要进一步跟进',
        latitude: 31.2304,
        longitude: 121.4737
      },
      {
        id: this.generateId(),
        name: '王五',
        company: '广州制造有限公司',
        position: '副总经理',
        phone: '13800138003',
        email: 'wangwu@example.com',
        address: '广州市天河区珠江新城',
        industry: '制造业',
        level: 'A',
        source: '老客户推荐',
        createTime: this.formatDateTime(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        lastVisitTime: this.formatDateTime(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        visitCount: 5,
        notes: '长期合作伙伴',
        latitude: 23.1291,
        longitude: 113.2644
      }
    ];
    
    const visits = [
      {
        id: this.generateId(),
        customerId: customers[0].id,
        customerName: customers[0].name,
        visitDate: this.formatDateTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        purpose: '产品介绍',
        result: '客户表示有兴趣，需要进一步报价',
        nextPlan: '下周提供详细报价方案',
        photos: [],
        location: '北京市朝阳区建国路88号',
        latitude: 39.9042,
        longitude: 116.4074
      },
      {
        id: this.generateId(),
        customerId: customers[1].id,
        customerName: customers[1].name,
        visitDate: this.formatDateTime(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        purpose: '合同洽谈',
        result: '价格需要再商议',
        nextPlan: '准备新的报价方案',
        photos: [],
        location: '上海市浦东新区陆家嘴金融中心',
        latitude: 31.2304,
        longitude: 121.4737
      },
      {
        id: this.generateId(),
        customerId: customers[2].id,
        customerName: customers[2].name,
        visitDate: this.formatDateTime(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        purpose: '售后服务',
        result: '客户满意，续约意向强烈',
        nextPlan: '准备续约合同',
        photos: [],
        location: '广州市天河区珠江新城',
        latitude: 23.1291,
        longitude: 113.2644
      }
    ];
    
    const checkins = [
      {
        id: this.generateId(),
        customerId: customers[0].id,
        customerName: customers[0].name,
        checkinTime: this.formatDateTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        location: '北京市朝阳区建国路88号',
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市朝阳区建国路88号',
        notes: '准时到达客户公司'
      },
      {
        id: this.generateId(),
        customerId: customers[2].id,
        customerName: customers[2].name,
        checkinTime: this.formatDateTime(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        location: '广州市天河区珠江新城',
        latitude: 23.1291,
        longitude: 113.2644,
        address: '广州市天河区珠江新城',
        notes: '客户会议室会谈'
      }
    ];
    
    const visitPlans = [
      {
        id: this.generateId(),
        customerId: customers[0].id,
        customerName: customers[0].name,
        planDate: this.formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
        planTime: '14:00',
        purpose: '提供详细报价方案',
        notes: '准备产品样品和报价单',
        status: 'pending',
        createTime: this.formatDateTime()
      },
      {
        id: this.generateId(),
        customerId: customers[1].id,
        customerName: customers[1].name,
        planDate: this.formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        planTime: '10:00',
        purpose: '新报价方案讨论',
        notes: '重新制定价格策略',
        status: 'pending',
        createTime: this.formatDateTime()
      }
    ];
    
    return {
      customers,
      visits,
      checkins,
      visitPlans
    };
  }
});