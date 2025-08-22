// index.js
Page({
  data: {
    currentDate: '',
    currentWeek: '',
    todayStats: {
      customers: 0,
      visits: 0,
      checkins: 0,
      photos: 0
    },
    recentVisits: [],
    recentCustomers: []
  },
  
  onLoad: function() {
    this.setCurrentDate();
  },
  
  onShow: function() {
    this.loadData();
  },
  
  // 设置当前日期和星期
  setCurrentDate: function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDay = weekDays[date.getDay()];
    
    this.setData({
      currentDate: `${year}-${month}-${day}`,
      currentWeek: weekDay
    });
  },
  
  // 加载数据
  loadData: function() {
    const app = getApp();
    const today = app.formatDate();
    
    // 获取今日统计数据
    const customers = app.globalData.customers || [];
    const visits = app.globalData.visits || [];
    const checkins = app.globalData.checkins || [];
    
    // 计算今日新增客户数
    const todayCustomers = customers.filter(item => {
      return item.createTime && item.createTime.split(' ')[0] === today;
    }).length;
    
    // 计算今日拜访记录数
    const todayVisits = visits.filter(item => {
      return item.visitTime && item.visitTime.split(' ')[0] === today;
    }).length;
    
    // 计算今日打卡次数
    const todayCheckins = checkins.filter(item => {
      return item.checkinTime && item.checkinTime.split(' ')[0] === today;
    }).length;
    
    // 计算今日拍照数量
    const todayPhotos = checkins.filter(item => {
      return item.checkinTime && item.checkinTime.split(' ')[0] === today && item.photos && item.photos.length > 0;
    }).reduce((total, item) => total + item.photos.length, 0);
    
    // 获取最近拜访记录（按时间倒序排序）
    const sortedVisits = visits.sort((a, b) => {
      const timeA = a.visitTime ? new Date(a.visitTime).getTime() : 0;
      const timeB = b.visitTime ? new Date(b.visitTime).getTime() : 0;
      return timeB - timeA; // 最新的在前面
    });
    
    const recentVisits = sortedVisits.slice(0, 3).map(visit => {
      const customer = customers.find(c => c.id === visit.customerId) || {};
      return {
        id: visit.id,
        customerId: visit.customerId,
        customerName: customer.name || '未知客户',
        visitTime: visit.visitTime || ''
      };
    });
    
    // 获取最近客户（按创建时间倒序排序）
    const sortedCustomers = customers.sort((a, b) => {
      const timeA = a.createTime ? new Date(a.createTime).getTime() : 0;
      const timeB = b.createTime ? new Date(b.createTime).getTime() : 0;
      return timeB - timeA; // 最新的在前面
    });
    
    const recentCustomers = sortedCustomers.slice(0, 3);
    
    this.setData({
      todayStats: {
        customers: todayCustomers,
        visits: todayVisits,
        checkins: todayCheckins,
        photos: todayPhotos
      },
      recentVisits: recentVisits,
      recentCustomers: recentCustomers
    });
  },
  
  // 导航到客户列表
  navigateToCustomers: function() {
    wx.switchTab({
      url: '/pages/customer/list/list'
    });
  },
  
  // 导航到拜访记录
  navigateToVisits: function() {
    wx.navigateTo({
      url: '/pages/visit/list/list?source=today_visits'
    });
  },

  // 点击今日拜访记录查看详情
  viewTodayVisits: function() {
    const app = getApp();
    const today = app.formatDate();
    const visits = app.globalData.visits || [];
    
    // 获取今日拜访记录
    const todayVisits = visits.filter(item => {
      return item.visitTime && item.visitTime.split(' ')[0] === today;
    });
    
    if (todayVisits.length === 0) {
      wx.showToast({
        title: '今日暂无拜访记录',
        icon: 'none'
      });
      return;
    }
    
    // 显示操作选择
    wx.showActionSheet({
      itemList: ['查看今日拜访详情', '导出今日拜访文档'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看详情 - 跳转到拜访列表页面并筛选今日记录
          wx.navigateTo({
            url: '/pages/visit/list/list?source=today_visits'
          });
        } else if (res.tapIndex === 1) {
          // 导出文档
          this.exportTodayVisits();
        }
      }
    });
  },

  // 导出今日拜访文档
  exportTodayVisits: function() {
    const app = getApp();
    const today = app.formatDate();
    const visits = app.globalData.visits || [];
    const customers = app.globalData.customers || [];
    
    // 获取今日拜访记录
    const todayVisits = visits.filter(item => {
      return item.visitTime && item.visitTime.split(' ')[0] === today;
    });
    
    if (todayVisits.length === 0) {
      wx.showToast({
        title: '今日暂无拜访记录',
        icon: 'none'
      });
      return;
    }
    
    // 按拜访时间排序，最早的在前面
    const sortedTodayVisits = [...todayVisits].sort((a, b) => {
      const timeA = new Date(a.visitTime || '1970-01-01').getTime();
      const timeB = new Date(b.visitTime || '1970-01-01').getTime();
      return timeA - timeB;
    });
    
    // 生成文档内容
    let content = `今日拜访记录汇总\n日期：${today}\n\n`;
    
    sortedTodayVisits.forEach((visit, index) => {
      const customer = customers.find(c => c.id === visit.customerId) || {};
      content += `${index + 1}. 客户：${customer.name || '未知客户'}\n`;
      content += `   负责人：${customer.contact || '无'}\n`;
      content += `   联系方式：${customer.phone || '无'}\n`;
      content += `   拜访时间：${visit.visitTime || ''}\n`;
      
      if (visit.listing) {
        content += `   上架：${visit.listing}\n`;
      }
      
      if (visit.development && visit.development.length > 0) {
        content += `   开发：${visit.development.join('')}\n`;
      }
      
      if (visit.developmentMethod) {
        content += `   开发方式：${visit.developmentMethod}\n`;
      }
      
      if (visit.order) {
        content += `   开单情况：${visit.order}\n`;
      }
      
      if (visit.problem) {
        content += `   问题：${visit.problem}\n`;
      }

      if (visit.solution) {
        content += `   解决方案：${visit.solution}\n`;
      }

      if (visit.case) {
        content += `   案例：${visit.case}\n`;
      }
      
      if (visit.inventory) {
        content += `   库存：${visit.inventory}\n`;
      }
      
      if (visit.shipping) {
        content += `   发货：${visit.shipping}\n`;
      }
      
      if (visit.foundation) {
        content += `   铺垫：${visit.foundation}\n`;
      }
      
      if (visit.replenishment) {
        content += `   补货：${visit.replenishment}\n`;
      }
      
      if (visit.training) {
        content += `   培训：${visit.training}\n`;
      }
      
      if (visit.wechat) {
        content += `   微信：${visit.wechat}\n`;
      }
      
      if (visit.tools) {
        content += `   工具：${visit.tools}\n`;
      }
      
      if (visit.feedback) {
        content += `   反馈：${visit.feedback}\n`;
      }
      
      if (visit.photos && visit.photos.length > 0) {
        content += `   照片数量：${visit.photos.length}张\n`;
      }
      
      if (visit.customFields && visit.customFields.length > 0) {
        visit.customFields.forEach(field => {
          if (field.label && field.value) {
            content += `   ${field.label}：${field.value}\n`;
          }
        });
      }
      
      content += '\n';
    });
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '拜访记录已复制到剪贴板',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    });
  },
  
 
  
  // 导航到统计页面
  navigateToStatistics: function() {
    wx.switchTab({
      url: '/pages/statistics/statistics'
    });
  },
  
  // 导航到添加客户页面
  navigateToAddCustomer: function() {
    wx.navigateTo({
      url: '/pages/customer/edit/edit'
    });
  },
  
  // 导航到打卡页面
  navigateToCheckin: function() {
    wx.navigateTo({
      url: '/pages/visit/checkin/checkin'
    });
  },
  
  // 导航到附近客户页面
  navigateToNearbyCustomers: function() {
    wx.navigateTo({
      url: '/pages/customer/nearby/nearby'
    });
  },
  
  // 导航到拜访表单页面
  navigateToVisitForm: function() {
    wx.navigateTo({
      url: '/pages/visit/list/list'
    });
  },
  
  // 导航到拜访计划页面
  navigateToVisitPlan: function() {
    wx.navigateTo({
      url: '/pages/visit/plan/plan'
    });
  },
  
  // 查看拜访详情
  viewVisitDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/visit/form/form?id=${id}`
    });
  },
  
  // 查看客户详情
  viewCustomerDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/customer/detail/detail?id=${id}`
    });
  }
});