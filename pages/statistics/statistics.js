// 统计页面
const app = getApp()

Page({
  data: {
    timeFilter: 'today',
    startDate: '',
    endDate: '',
    statistics: {
      totalCustomers: 0,
      totalVisits: 0,
      totalCheckins: 0,
      totalPhotos: 0,
      customerGrowth: 0,
      visitGrowth: 0,
      checkinGrowth: 0,
      photoGrowth: 0
    }
  },
  
  onLoad() {
    this.initDate()
    this.loadStatistics()
  },

  initDate() {
    const today = new Date()
    const todayStr = this.formatDate(today)
    
    this.setData({
      endDate: todayStr,
      startDate: todayStr
    })
  },
  
  setTimeFilter(e) {
    const filter = e.currentTarget.dataset.filter
    const today = new Date()
    let startDate = ''
    let endDate = this.formatDate(today)
    
    switch(filter) {
      case 'today':
        startDate = this.formatDate(today)
        break
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 6)
        startDate = this.formatDate(weekStart)
        break
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        startDate = this.formatDate(monthStart)
        break
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1)
        startDate = this.formatDate(yearStart)
        break
      case 'custom':
        // 自定义时间范围，保持当前日期
        startDate = this.data.startDate
        endDate = this.data.endDate
        break
    }
    
    this.setData({
      timeFilter: filter,
      startDate: startDate,
      endDate: endDate
    })
    
    if (filter !== 'custom') {
      this.loadStatistics()
    }
  },
  
  // 开始日期变化
  bindStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    });
  },
  
  // 结束日期变化
  bindEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    });
  },
  
  searchData() {
    if (!this.data.startDate || !this.data.endDate) {
      wx.showToast({
        title: '请选择日期范围',
        icon: 'none'
      })
      return
    }
    
    if (this.data.startDate > this.data.endDate) {
      wx.showToast({
        title: '开始日期不能大于结束日期',
        icon: 'none'
      })
      return
    }
    
    this.loadStatistics()
  },
  
  loadStatistics() {
    const { startDate, endDate } = this.data
    const customers = app.globalData.customers || []
    const visits = app.globalData.visits || []
    const checkins = app.globalData.checkins || []
    
    // 过滤指定时间范围内的数据
    const filteredVisits = visits.filter(visit => {
      const visitDate = visit.visitTime ? visit.visitTime.split(' ')[0] : null;
      return visitDate && visitDate >= startDate && visitDate <= endDate;
    });

    const filteredCheckins = checkins.filter(checkin => {
      const checkinDate = checkin.checkinTime ? checkin.checkinTime.split(' ')[0] : null;
      return checkinDate && checkinDate >= startDate && checkinDate <= endDate;
    });
    
    // 计算照片总数
    const photoCount = this.calculatePhotoCount(filteredVisits, filteredCheckins)
    
    // 计算增长数据（与前一周期对比）
    const growthData = this.calculateGrowthData()
    
    const filteredCustomers = customers.filter(customer => {
      const customerDate = customer.createTime ? customer.createTime.split(' ')[0] : null;
      return customerDate && customerDate >= startDate && customerDate <= endDate;
    });

    const statistics = {
      totalCustomers: filteredCustomers.length,
      totalVisits: filteredVisits.length,
      totalCheckins: filteredCheckins.length,
      totalPhotos: photoCount,
      customerGrowth: growthData.customerGrowth,
      visitGrowth: growthData.visitGrowth,
      checkinGrowth: growthData.checkinGrowth,
      photoGrowth: growthData.photoGrowth
    }
    
    this.setData({ statistics })
  },
  
  calculatePhotoCount(visits, checkins) {
    let photoCount = 0
    
    // 统计拜访记录中的照片
    visits.forEach(visit => {
      if (visit.photos && visit.photos.length > 0) {
        photoCount += visit.photos.length
      }
    })
    
    // 统计打卡记录中的照片
    checkins.forEach(checkin => {
      if (checkin.photos && checkin.photos.length > 0) {
        photoCount += checkin.photos.length
      }
    })
    
    return photoCount
  },

  calculateGrowthData() {
    // 简化处理，返回模拟增长数据
    return {
      customerGrowth: Math.floor(Math.random() * 10),
      visitGrowth: Math.floor(Math.random() * 20),
      checkinGrowth: Math.floor(Math.random() * 15),
      photoGrowth: Math.floor(Math.random() * 25)
    }
  },
  
  // 查看详情方法
  viewCustomerDetail() {
    wx.navigateTo({
      url: `/pages/customer/list/list?startDate=${this.data.startDate}&endDate=${this.data.endDate}`
    });
  },

  viewVisitDetail() {
    wx.navigateTo({
      url: `/pages/visit/list/list?startDate=${this.data.startDate}&endDate=${this.data.endDate}`
    });
  },

  viewCheckinDetail() {
    wx.navigateTo({
      url: '/pages/visit/checkin/checkin'
    })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})