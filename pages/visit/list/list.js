// pages/visit/list/list.js
Page({
  data: {
    visits: [],
    filteredVisits: [],
    customers: [],
    searchKeyword: '',
    showFilter: false,
    timeRange: 'all',
    startDate: '',
    endDate: '',
    // developmentFilters 已移除，只保留"城光"选项
    otherFilters: [],
    activeFilters: [],
    editMode: false,
    selectedVisits: []
  },
  
  onLoad: function(options) {
    this.initDates();
    this.loadData();
    
    // 处理从首页传来的筛选参数
    if (options.source === 'today_visits') {
      this.setData({
        timeRange: 'today'
      });
      this.updateActiveFilters();
      this.filterVisits();
    }
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
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // 计算本周开始日期（周一）
    const dayOfWeek = today.getDay() || 7; // 0 是周日，转换为 7
    const mondayOffset = 1 - dayOfWeek; // 计算周一的偏移量
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const weekStartStr = this.formatDate(monday);
    
    // 计算本月开始日期
    const monthStartStr = `${year}-${month}-01`;
    
    this.setData({
      startDate: todayStr,
      endDate: todayStr,
      weekStartDate: weekStartStr,
      monthStartDate: monthStartStr
    });
  },
  
  // 加载数据
  loadData: function() {
    const app = getApp();
    const visits = app.globalData.visits || [];
    const customers = app.globalData.customers || [];
    
    // 按时间倒序排序
    const sortedVisits = visits.sort((a, b) => {
      const timeA = a.visitTime ? new Date(a.visitTime).getTime() : 0;
      const timeB = b.visitTime ? new Date(b.visitTime).getTime() : 0;
      return timeB - timeA;
    });
    
    // 添加客户信息和照片数量
    const visitsWithInfo = sortedVisits.map(visit => {
      const customer = customers.find(c => c.id === visit.customerId) || {};
      return {
        ...visit,
        customerName: customer.name || '未知客户',
        customerPhone: customer.phone || '',
        photoCount: visit.photos ? visit.photos.length : 0
      };
    });
    
    this.setData({
      visits: visitsWithInfo,
      customers: customers
    });
    
    this.filterVisits();
  },
  
  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterVisits();
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
  
  // 设置时间范围
  setTimeRange: function(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      timeRange: range
    });
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
  

  
  // 开发情况筛选已移除，只保留"城光"选项
  
  // 切换其他筛选
  toggleOtherFilter: function(e) {
    const type = e.currentTarget.dataset.type;
    const otherFilters = [...this.data.otherFilters];
    
    const index = otherFilters.indexOf(type);
    if (index === -1) {
      otherFilters.push(type);
    } else {
      otherFilters.splice(index, 1);
    }
    
    this.setData({
      otherFilters: otherFilters
    });
  },
  
  // 重置筛选
  resetFilters: function() {
    this.setData({
      timeRange: 'all',
      startDate: '',
      endDate: '',
      otherFilters: [],
      activeFilters: []
    });
    this.filterVisits();
  },
  
   // 应用筛选
  applyFilters: function() {
    this.hideFilterModal();
    this.updateActiveFilters();
    this.filterVisits();
  },
  
  // 更新激活的筛选条件
  updateActiveFilters: function() {
    const activeFilters = [];
    
    // 时间范围
    switch (this.data.timeRange) {
      case 'today':
        activeFilters.push('今天');
        break;
      case 'week':
        activeFilters.push('本周');
        break;
      case 'month':
        activeFilters.push('本月');
        break;
      case 'custom':
        if (this.data.startDate && this.data.endDate) {
          activeFilters.push(`${this.data.startDate} 至 ${this.data.endDate}`);
        } else {
          activeFilters.push('自定义时间');
        }
        break;
    }
    
    // 开发情况筛选已移除，只保留"城光"选项
    
    // 其他条件
    this.data.otherFilters.forEach(filter => {
      if (filter === 'hasPhotos') {
        activeFilters.push('有照片');
      } else if (filter === 'hasProblem') {
        activeFilters.push('有问题');
      } else if (filter === 'hasSolution') {
        activeFilters.push('有解决方案');
      }
    });
    
    this.setData({
      activeFilters: activeFilters
    });
  },
  
  // 移除筛选条件
  removeFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    const activeFilters = this.data.activeFilters.filter(f => f !== filter);
    
    // 根据移除的筛选条件更新相应的筛选设置
    if (filter === '今天') {
      this.setData({ timeRange: 'all' });
    } else if (filter === '本周') {
      this.setData({ timeRange: 'all' });
    } else if (filter === '本月') {
      this.setData({ timeRange: 'all' });
    } else if (filter.includes('至')) {
      this.setData({ timeRange: 'all', startDate: '', endDate: '' });
    // 开发情况筛选已移除
    } else if (filter === '有照片') {
      this.setData({ otherFilters: this.data.otherFilters.filter(f => f !== 'hasPhotos') });
    } else if (filter === '有问题') {
      this.setData({ otherFilters: this.data.otherFilters.filter(f => f !== 'hasProblem') });
    } else if (filter === '有解决方案') {
      this.setData({ otherFilters: this.data.otherFilters.filter(f => f !== 'hasSolution') });
    }
    
    this.setData({
      activeFilters: activeFilters
    });
    
    this.filterVisits();
  },
  
  // 清除所有筛选条件
  clearFilters: function() {
    this.setData({
      timeRange: 'all',
      startDate: '',
      endDate: '',
      otherFilters: [],
      activeFilters: []
    });
    
    this.filterVisits();
  },
  
  // 筛选拜访记录
  filterVisits: function() {
    let filtered = [...this.data.visits];
    
    // 关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(visit => {
        return visit.customerName.toLowerCase().includes(keyword);
      });
    }
    
    // 时间范围筛选
    if (this.data.timeRange !== 'all') {
      const { startDate, endDate } = this.getDateRange();
      
      filtered = filtered.filter(visit => {
        if (!visit.visitTime) return false;
        const visitDate = visit.visitTime.split(' ')[0];
        return visitDate >= startDate && visitDate <= endDate;
      });
    }
    
    // 开发情况筛选已移除，只保留"城光"选项
    
    // 其他条件筛选
    if (this.data.otherFilters.length > 0) {
      filtered = filtered.filter(visit => {
        let match = true;
        
        this.data.otherFilters.forEach(filter => {
          if (filter === 'hasPhotos' && (!visit.photos || visit.photos.length === 0)) {
            match = false;
          } else if (filter === 'hasProblem' && (!visit.problem || visit.problem.trim() === '')) {
            match = false;
          } else if (filter === 'hasSolution' && (!visit.solution || visit.solution.trim() === '')) {
            match = false;
          }
        });
        
        return match;
      });
    }
    
    this.setData({
      filteredVisits: filtered
    });
  },
  
  // 获取日期范围
  getDateRange: function() {
    const today = new Date();
    let startDate = '';
    let endDate = '';
    
    switch (this.data.timeRange) {
      case 'today':
        startDate = this.formatDate(today);
        endDate = startDate;
        break;
      case 'week':
        const dayOfWeek = today.getDay() || 7; // 0 是周日，转换为 7
        const mondayOffset = 1 - dayOfWeek; // 计算周一的偏移量
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        startDate = this.formatDate(monday);
        endDate = this.formatDate(today);
        break;
      case 'month':
        startDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-01`;
        endDate = this.formatDate(today);
        break;
      case 'custom':
        startDate = this.data.startDate;
        endDate = this.data.endDate;
        break;
      default:
        startDate = '1970-01-01';
        endDate = '9999-12-31';
    }
    
    return { startDate, endDate };
  },
  
  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 查看拜访详情
  viewVisitDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/visit/detail/detail?id=${id}`
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
  
  // 查看客户详情
  navigateToCustomer: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/customer/detail/detail?id=${id}`
    });
  },
  
  // 添加拜访记录
  addVisit: function() {
    wx.navigateTo({
      url: '/pages/visit/form/form'
    });
  },
  
  // 导出拜访详情文档
  exportVisitDetails: function() {
    if (this.data.filteredVisits.length === 0) {
      wx.showToast({
        title: '暂无数据可导出',
        icon: 'none'
      });
      return;
    }
    
    const app = getApp();
    const customers = app.globalData.customers || [];
    
    // 按拜访时间排序，最早的在前面
    const sortedVisits = [...this.data.filteredVisits].sort((a, b) => {
      const timeA = new Date(a.visitTime || '1970-01-01').getTime();
      const timeB = new Date(b.visitTime || '1970-01-01').getTime();
      return timeA - timeB;
    });
    
    // 生成导出内容
    let exportContent = '拜访详情报告\n\n';
    exportContent += `导出时间：${new Date().toLocaleString()}\n`;
    exportContent += `记录数量：${sortedVisits.length}条\n\n`;
    
    sortedVisits.forEach((visit, index) => {
      const customer = customers.find(c => c.id === visit.customerId) || {};
      exportContent += `${index + 1}. 客户：${visit.customerName || '未知客户'}\n`;
      exportContent += `   负责人：${customer.contact || '无'}\n`;
      exportContent += `   联系方式：${customer.phone || '无'}\n`;
      exportContent += `   拜访时间：${visit.visitTime || ''}\n`;
      
      if (visit.listing) {
        exportContent += `   上架：${visit.listing}\n`;
      }
      
      if (visit.development && visit.development.length > 0) {
        exportContent += `   开发：${visit.development.join('')}\n`;
      }
      
      if (visit.developmentMethod) {
        exportContent += `   开发方式：${visit.developmentMethod}\n`;
      }
      
      if (visit.order) {
        exportContent += `   开单情况：${visit.order}\n`;
      }
      
      if (visit.problem) {
        exportContent += `   问题：${visit.problem}\n`;
      }

      if (visit.solution) {
        exportContent += `   解决方案：${visit.solution}\n`;
      }

      if (visit.case) {
        exportContent += `   案例：${visit.case}\n`;
      }
      
      if (visit.inventory) {
        exportContent += `   库存：${visit.inventory}\n`;
      }
      
      if (visit.shipping) {
        exportContent += `   发货：${visit.shipping}\n`;
      }
      
      if (visit.foundation) {
        exportContent += `   铺垫：${visit.foundation}\n`;
      }
      
      if (visit.replenishment) {
        exportContent += `   补货：${visit.replenishment}\n`;
      }
      
      if (visit.training) {
        exportContent += `   培训：${visit.training}\n`;
      }
      
      if (visit.wechat) {
        exportContent += `   微信：${visit.wechat}\n`;
      }
      
      if (visit.tools) {
        exportContent += `   工具：${visit.tools}\n`;
      }
      
      if (visit.feedback) {
        exportContent += `   反馈：${visit.feedback}\n`;
      }
      
      if (visit.photos && visit.photos.length > 0) {
        exportContent += `   照片数量：${visit.photos.length}张\n`;
      } else if (visit.photoCount > 0) {
        exportContent += `   照片数量：${visit.photoCount}张\n`;
      }
      
      if (visit.customFields && visit.customFields.length > 0) {
        visit.customFields.forEach(field => {
          if (field.label && field.value) {
            exportContent += `   ${field.label}：${field.value}\n`;
          }
        });
      }
      
      exportContent += '\n';
    });
    
    // 显示导出内容
    wx.showModal({
      title: '导出内容预览',
      content: '导出内容已生成，请复制以下内容保存到文档中',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制内容',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: exportContent,
            success: () => {
              wx.showToast({
                title: '内容已复制到剪贴板',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 切换编辑模式
  toggleEditMode: function() {
    this.setData({
      editMode: !this.data.editMode,
      selectedVisits: []
    });
  },

  // 切换选择拜访记录
  toggleSelectVisit: function(e) {
    const id = e.currentTarget.dataset.id;
    const selectedVisits = [...this.data.selectedVisits];
    const index = selectedVisits.indexOf(id);
    
    if (index === -1) {
      selectedVisits.push(id);
    } else {
      selectedVisits.splice(index, 1);
    }
    
    console.log('选中的拜访记录ID列表:', selectedVisits);
    
    this.setData({
      selectedVisits: selectedVisits
    });
  },

  // 全选/取消全选
  toggleSelectAll: function() {
    const allSelected = this.data.selectedVisits.length === this.data.filteredVisits.length;
    if (allSelected) {
      this.setData({
        selectedVisits: []
      });
    } else {
      this.setData({
        selectedVisits: this.data.filteredVisits.map(visit => visit.id)
      });
    }
  },

  // 批量删除拜访记录
  batchDeleteVisits: function() {
    if (this.data.selectedVisits.length === 0) {
      wx.showToast({
        title: '请选择要删除的记录',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${this.data.selectedVisits.length} 条拜访记录吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteSelectedVisits();
        }
      }
    });
  },

  // 删除单个拜访记录
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
            this.loadData();
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },
  
  // 删除选中的拜访记录
  deleteSelectedVisits: function() {
    const app = getApp();
    const selectedIds = this.data.selectedVisits;
    
    // 从全局数据中删除选中的拜访记录
    app.globalData.visits = app.globalData.visits.filter(visit => 
      !selectedIds.includes(visit.id)
    );
    
    // 同时删除相关的打卡记录
    app.globalData.checkIns = app.globalData.checkIns.filter(checkIn => 
      !selectedIds.includes(checkIn.visitId)
    );
    
    // 重新加载数据
    this.loadData();
    
    // 退出编辑模式
    this.setData({
      editMode: false,
      selectedVisits: []
    });
    
    wx.showToast({
      title: `已删除 ${selectedIds.length} 条记录`,
      icon: 'success'
    });
  }
});