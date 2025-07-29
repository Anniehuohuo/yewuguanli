// pages/index/index.js
const app = getApp();

Page({
  data: {
    todayStats: {
      visitCount: 0,
      checkinCount: 0,
      customerCount: 0
    },
    recentVisits: [],
    upcomingPlans: [],
    quickActions: [
      {
        icon: '/images/icon/添加客户.png',
        title: '添加客户',
        url: '/pages/customer/edit/edit'
      },
      {
        icon: '/images/icon/拜访记录.png',
        title: '拜访记录',
        url: '/pages/visit/form/form'
      },
      {
        icon: '/images/icon/拜访打卡.png',
        title: '拜访打卡',
        url: '/pages/visit/checkin/checkin'
      },
      {
        icon: '/images/icon/附近客户.png',
        title: '附近客户',
        url: '/pages/customer/nearby/nearby'
      }
    ]
  },

  onLoad: function() {
    this.loadData();
  },

  onShow: function() {
    this.loadData();
  },

  // 加载数据
  loadData: function() {
    this.loadTodayStats();
    this.loadRecentVisits();
    this.loadUpcomingPlans();
  },

  // 加载今日统计
  loadTodayStats: function() {
    const stats = app.getTodayStats();
    this.setData({
      todayStats: stats
    });
  },

  // 加载最近拜访记录
  loadRecentVisits: function() {
    const visits = app.globalData.visits
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
      .slice(0, 3);
    
    this.setData({
      recentVisits: visits
    });
  },

  // 加载即将到来的拜访计划
  loadUpcomingPlans: function() {
    const today = app.formatDate();
    const plans = app.globalData.visitPlans
      .filter(plan => plan.planDate >= today && plan.status === 'pending')
      .sort((a, b) => {
        const dateA = new Date(a.planDate + ' ' + a.planTime);
        const dateB = new Date(b.planDate + ' ' + b.planTime);
        return dateA - dateB;
      })
      .slice(0, 3);
    
    this.setData({
      upcomingPlans: plans
    });
  },

  // 快捷操作点击
  onQuickActionTap: function(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url
      });
    }
  },

  // 查看拜访详情
  onVisitTap: function(e) {
    const visitId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/visit/detail/detail?id=${visitId}`
    });
  },

  // 查看拜访计划详情
  onPlanTap: function(e) {
    const planId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/visit/plan/plan?id=${planId}`
    });
  },

  // 查看更多拜访记录
  onMoreVisitsTap: function() {
    wx.switchTab({
      url: '/pages/visit/list/list'
    });
  },

  // 查看更多拜访计划
  onMorePlansTap: function() {
    wx.navigateTo({
      url: '/pages/visit/plan/plan'
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});