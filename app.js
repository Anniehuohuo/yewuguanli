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
  
  // 获取今日统计数据
  getTodayStatistics: function() {
    const today = this.formatDate();
    
    // 今日新增客户数
    const newCustomers = this.globalData.customers.filter(customer => {
      const createDate = customer.createTime ? customer.createTime.split(' ')[0] : '';
      return createDate === today;
    }).length;
    
    // 今日拜访记录数
    const visits = this.globalData.visits.filter(visit => {
      const visitDate = visit.visitTime ? visit.visitTime.split(' ')[0] : '';
      return visitDate === today;
    }).length;
    
    // 今日打卡次数
    const checkins = this.globalData.checkins.filter(checkin => {
      const checkinDate = checkin.checkinTime ? checkin.checkinTime.split(' ')[0] : '';
      return checkinDate === today;
    }).length;
    
    // 今日拍照数量
    const photos = this.globalData.checkins.reduce((total, checkin) => {
      const checkinDate = checkin.checkinTime ? checkin.checkinTime.split(' ')[0] : '';
      if (checkinDate === today) {
        return total + (checkin.photos ? checkin.photos.length : 0);
      }
      return total;
    }, 0);
    
    return {
      newCustomers,
      visits,
      checkins,
      photos
    };
  },
  
  // 生成模拟数据
  generateMockData: function() {
    const now = new Date();
    const today = this.formatDate(now);
    const yesterday = this.formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const lastWeek = this.formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    
    // 模拟客户数据
    const customers = [
      {
        id: 'customer_001',
        name: '张三建材有限公司',
        contact: '张总',
        phone: '13800138001',
        address: '北京市朝阳区建国路88号',
        latitude: 39.9042,
        longitude: 116.4074,
        createTime: this.formatDateTime(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000))
      },
      {
        id: 'customer_002',
        name: '李四装饰工程',
        contact: '李经理',
        phone: '13800138002',
        address: '上海市浦东新区陆家嘴金融中心',
        latitude: 31.2304,
        longitude: 121.4737,
        createTime: this.formatDateTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000))
      },
      {
        id: 'customer_003',
        name: '王五照明电器',
        contact: '王总',
        phone: '13800138003',
        address: '广州市天河区珠江新城',
        latitude: 23.1291,
        longitude: 113.2644,
        createTime: this.formatDateTime(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))
      },
      {
        id: 'customer_004',
        name: '赵六智能家居',
        contact: '赵经理',
        phone: '13800138004',
        address: '深圳市南山区科技园',
        latitude: 22.5431,
        longitude: 113.9434,
        createTime: this.formatDateTime(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000))
      },
      {
        id: 'customer_005',
        name: '钱七工程设备',
        contact: '钱总',
        phone: '13800138005',
        address: '杭州市西湖区文三路',
        latitude: 30.2741,
        longitude: 120.1551,
        createTime: this.formatDateTime(now)
      },
      {
        id: 'customer_006',
        name: '北京朝阳科技公司',
        contact: '刘经理',
        phone: '13800138006',
        address: '北京市朝阳区国贸中心',
        latitude: 39.9088,
        longitude: 116.4123,
        createTime: this.formatDateTime(now)
      },
      {
        id: 'customer_007',
        name: '朝阳区建材市场',
        contact: '陈总',
        phone: '13800138007',
        address: '北京市朝阳区大望路',
        latitude: 39.9012,
        longitude: 116.4089,
        createTime: this.formatDateTime(now)
      },
      {
        id: 'customer_008',
        name: 'CBD商务中心',
        contact: '林经理',
        phone: '13800138008',
        address: '北京市朝阳区CBD核心区',
        latitude: 39.9065,
        longitude: 116.4102,
        createTime: this.formatDateTime(now)
      }
    ];
    
    // 模拟拜访记录
    const visits = [
      {
        id: 'visit_001',
        customerId: 'customer_001',
        visitTime: `${today} 09:30:00`,
        development: ['city'],
        problem: '客户反映产品质量有待提升',
        solution: '提供技术支持和质量保证方案',
        photos: ['temp_photo_1.jpg', 'temp_photo_2.jpg'],
        developmentMethod: '实地考察',
        order: '意向订单50万',
        case: '成功案例分享',
        inventory: '库存充足',
        shipping: '物流配送方案',
        foundation: '基础设施完善',
        replenishment: '补货及时',
        training: '技术培训',
        wechat: '微信群沟通',
        tools: '专业工具支持',
        feedback: '客户满意度较高'
      },
      {
        id: 'visit_002',
        customerId: 'customer_002',
        visitTime: `${yesterday} 14:20:00`,
        development: ['light'],
        problem: '照明方案需要优化',
        solution: '提供定制化照明解决方案',
        photos: ['temp_photo_3.jpg'],
        developmentMethod: '方案设计',
        order: '确认订单30万',
        case: '类似项目经验',
        inventory: '部分产品需要订货',
        shipping: '分批次配送',
        foundation: '现场条件良好',
        replenishment: '按需补货',
        training: '操作培训',
        wechat: '建立项目群',
        tools: '安装工具齐全',
        feedback: '期待合作'
      },
      {
        id: 'visit_003',
        customerId: 'customer_003',
        visitTime: `${lastWeek} 16:45:00`,
        development: ['city', 'light'],
        problem: '项目进度需要加快',
        solution: '增加人力资源投入',
        photos: [],
        developmentMethod: '项目跟进',
        order: '追加订单20万',
        case: '成功交付案例',
        inventory: '库存紧张',
        shipping: '加急配送',
        foundation: '基础工作完成',
        replenishment: '紧急补货',
        training: '现场指导',
        wechat: '实时沟通',
        tools: '设备升级',
        feedback: '进展顺利'
      }
    ];
    
    // 模拟打卡记录
    const checkins = [
      {
        id: 'checkin_001',
        customerId: 'customer_001',
        checkinTime: `${today} 09:00:00`,
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '北京市朝阳区建国路88号附近'
        },
        photos: ['checkin_photo_1.jpg', 'checkin_photo_2.jpg'],
        remark: '到达客户现场，准备开始拜访'
      },
      {
        id: 'checkin_002',
        customerId: 'customer_002',
        checkinTime: `${yesterday} 14:00:00`,
        location: {
          latitude: 31.2304,
          longitude: 121.4737,
          address: '上海市浦东新区陆家嘴金融中心附近'
        },
        photos: ['checkin_photo_3.jpg'],
        remark: '客户会议室洽谈'
      }
    ];
    
    // 模拟拜访计划数据
    const tomorrow = this.formatDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    const visitPlans = [
      {
        id: 'plan_001',
        customerId: 'customer_001',
        customerName: '张三建材有限公司',
        customerContact: '张总',
        customerPhone: '13800138001',
        customerAddress: '北京市朝阳区建国路88号',
        planDate: tomorrow,
        planTime: '09:00',
        priority: 'high',
        purpose: '产品演示和技术交流',
        status: 'pending',
        routeOrder: 0,
        createTime: this.formatDateTime(now)
      },
      {
        id: 'plan_002',
        customerId: 'customer_002',
        customerName: '李四装饰工程',
        customerContact: '李经理',
        customerPhone: '13800138002',
        customerAddress: '上海市浦东新区陆家嘴金融中心',
        planDate: tomorrow,
        planTime: '14:00',
        priority: 'medium',
        purpose: '项目进度跟进',
        status: 'pending',
        routeOrder: 0,
        createTime: this.formatDateTime(now)
      },
      {
        id: 'plan_003',
        customerId: 'customer_003',
        customerName: '王五照明电器',
        customerContact: '王总',
        customerPhone: '13800138003',
        customerAddress: '广州市天河区珠江新城',
        planDate: tomorrow,
        planTime: '10:30',
        priority: 'high',
        purpose: '合同签署',
        status: 'pending',
        routeOrder: 0,
        createTime: this.formatDateTime(now)
      },
      {
        id: 'plan_004',
        customerId: 'customer_004',
        customerName: '赵六智能家居',
        customerContact: '赵经理',
        customerPhone: '13800138004',
        customerAddress: '深圳市南山区科技园',
        planDate: tomorrow,
        planTime: '16:00',
        priority: 'low',
        purpose: '售后服务',
        status: 'pending',
        routeOrder: 0,
        createTime: this.formatDateTime(now)
      },
      {
        id: 'plan_005',
        customerId: 'customer_005',
        customerName: '钱七工程设备',
        customerContact: '钱总',
        customerPhone: '13800138005',
        customerAddress: '杭州市西湖区文三路',
        planDate: today,
        planTime: '11:00',
        priority: 'medium',
        purpose: '需求调研',
        status: 'completed',
        routeOrder: 0,
        createTime: this.formatDateTime(new Date(now.getTime() - 2 * 60 * 60 * 1000))
      }
    ];

    return { customers, visits, checkins, visitPlans };
  }
});