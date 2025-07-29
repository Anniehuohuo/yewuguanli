// pages/business/list/list.js
const app = getApp();

Page({
  data: {
    businesses: [],
    filteredBusinesses: [],
    searchKeyword: '',
    statusFilter: 'all',
    statusOptions: [
      { value: 'all', label: '全部状态', color: '#666' },
      { value: 'pending', label: '待处理', color: '#ff9500' },
      { value: 'processing', label: '处理中', color: '#007aff' },
      { value: 'completed', label: '已完成', color: '#34c759' },
      { value: 'cancelled', label: '已取消', color: '#ff3b30' }
    ],
    showFilter: false,
    loading: false,
    refreshing: false
  },

  onLoad: function() {
    this.loadBusinessData();
  },

  onShow: function() {
    this.loadBusinessData();
  },

  // 加载业务数据
  loadBusinessData: function() {
    this.setData({ loading: true });
    
    // 模拟从全局数据获取
    const businesses = app.globalData.businesses || [];
    
    this.setData({
      businesses,
      loading: false
    });
    
    this.filterBusinesses();
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterBusinesses();
  },

  // 清空搜索
  onClearSearch: function() {
    this.setData({
      searchKeyword: ''
    });
    this.filterBusinesses();
  },

  // 切换筛选器显示
  toggleFilter: function() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },

  // 选择状态筛选
  onStatusFilter: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      statusFilter: status,
      showFilter: false
    });
    this.filterBusinesses();
  },

  // 筛选业务
  filterBusinesses: function() {
    const { businesses, searchKeyword, statusFilter } = this.data;
    let filtered = [...businesses];
    
    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(business => business.status === statusFilter);
    }
    
    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(business => 
        business.title.toLowerCase().includes(keyword) ||
        business.customerName.toLowerCase().includes(keyword) ||
        business.description.toLowerCase().includes(keyword)
      );
    }
    
    this.setData({
      filteredBusinesses: filtered
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({ refreshing: true });
    this.loadBusinessData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      this.setData({ refreshing: false });
    }, 1000);
  },

  // 查看业务详情
  onViewBusiness: function(e) {
    const businessId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/business/detail/detail?id=${businessId}`
    });
  },

  // 编辑业务
  onEditBusiness: function(e) {
    e.stopPropagation();
    const businessId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/business/edit/edit?id=${businessId}`
    });
  },

  // 删除业务
  onDeleteBusiness: function(e) {
    e.stopPropagation();
    const businessId = e.currentTarget.dataset.id;
    const business = this.data.businesses.find(b => b.id === businessId);
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除业务"${business.title}"吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          this.deleteBusiness(businessId);
        }
      }
    });
  },

  // 执行删除
  deleteBusiness: function(businessId) {
    const businesses = app.globalData.businesses.filter(b => b.id !== businessId);
    app.globalData.businesses = businesses;
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
    
    this.loadBusinessData();
  },

  // 新建业务
  onAddBusiness: function() {
    wx.navigateTo({
      url: '/pages/business/edit/edit'
    });
  },

  // 获取状态显示信息
  getStatusInfo: function(status) {
    const statusMap = {
      'pending': { label: '待处理', color: '#ff9500' },
      'processing': { label: '处理中', color: '#007aff' },
      'completed': { label: '已完成', color: '#34c759' },
      'cancelled': { label: '已取消', color: '#ff3b30' }
    };
    return statusMap[status] || { label: '未知', color: '#666' };
  },

  // 格式化日期
  formatDate: function(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}-${day}`;
    }
  }
});