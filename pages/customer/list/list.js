// pages/customer/list/list.js
const app = getApp();

Page({
  data: {
    customers: [],
    filteredCustomers: [],
    searchKeyword: '',
    selectedCategory: 'all',
    categories: [
      { value: 'all', label: '全部' },
      { value: 'A', label: 'A类客户' },
      { value: 'B', label: 'B类客户' },
      { value: 'C', label: 'C类客户' }
    ],
    showFilter: false
  },

  onLoad: function() {
    this.loadCustomers();
  },

  onShow: function() {
    this.loadCustomers();
  },

  // 加载客户列表
  loadCustomers: function() {
    const customers = app.globalData.customers;
    this.setData({
      customers: customers,
      filteredCustomers: customers
    });
    this.filterCustomers();
  },

  // 搜索客户
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterCustomers();
  },

  // 筛选客户
  filterCustomers: function() {
    const { customers, searchKeyword, selectedCategory } = this.data;
    let filtered = customers;

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(customer => 
        customer.name.includes(searchKeyword) ||
        customer.company.includes(searchKeyword) ||
        customer.phone.includes(searchKeyword)
      );
    }

    // 按类别筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(customer => customer.category === selectedCategory);
    }

    this.setData({
      filteredCustomers: filtered
    });
  },

  // 显示/隐藏筛选
  toggleFilter: function() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },

  // 选择类别
  onCategorySelect: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category,
      showFilter: false
    });
    this.filterCustomers();
  },

  // 查看客户详情
  onCustomerTap: function(e) {
    const customerId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/customer/detail/detail?id=${customerId}`
    });
  },

  // 添加客户
  onAddCustomer: function() {
    wx.navigateTo({
      url: '/pages/customer/edit/edit'
    });
  },

  // 拨打电话
  onCallTap: function(e) {
    e.stopPropagation();
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadCustomers();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});