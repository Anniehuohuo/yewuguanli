// pages/business/manage/manage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    businesses: [],
    loading: true,
    searchKeyword: '',
    showAddModal: false,
    newBusiness: {
      name: '',
      category: '',
      address: '',
      phone: '',
      description: ''
    },
    categories: ['中餐', '西餐', '快餐', '咖啡厅', '甜品店', '其他']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadBusinessList();
  },

  /**
   * 加载商家列表
   */
  loadBusinessList: function() {
    wx.showLoading({
      title: '加载中...'
    });

    // 模拟API调用
    setTimeout(() => {
      const businesses = [
        {
          id: 1,
          name: '美味餐厅',
          category: '中餐',
          rating: 4.5,
          address: '北京市朝阳区某某街道123号',
          phone: '010-12345678',
          status: 'active'
        },
        {
          id: 2,
          name: '咖啡时光',
          category: '咖啡厅',
          rating: 4.2,
          address: '北京市海淀区某某路456号',
          phone: '010-87654321',
          status: 'active'
        },
        {
          id: 3,
          name: '快乐汉堡',
          category: '快餐',
          rating: 3.8,
          address: '北京市西城区某某大街789号',
          phone: '010-11111111',
          status: 'inactive'
        }
      ];

      this.setData({
        businesses: businesses,
        loading: false
      });

      wx.hideLoading();
    }, 1000);
  },

  /**
   * 搜索商家
   */
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 执行搜索
   */
  performSearch: function() {
    const keyword = this.data.searchKeyword.toLowerCase();
    if (!keyword) {
      this.loadBusinessList();
      return;
    }

    const filteredBusinesses = this.data.businesses.filter(business => 
      business.name.toLowerCase().includes(keyword) ||
      business.category.toLowerCase().includes(keyword) ||
      business.address.toLowerCase().includes(keyword)
    );

    this.setData({
      businesses: filteredBusinesses
    });
  },

  /**
   * 查看商家详情
   */
  viewBusiness: function(e) {
    const businessId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/business/detail/detail?id=${businessId}`
    });
  },

  /**
   * 编辑商家
   */
  editBusiness: function(e) {
    const businessId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/business/edit/edit?id=${businessId}`
    });
  },

  /**
   * 删除商家
   */
  deleteBusiness: function(e) {
    const businessId = e.currentTarget.dataset.id;
    const businessName = e.currentTarget.dataset.name;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除商家"${businessName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performDelete(businessId);
        }
      }
    });
  },

  /**
   * 执行删除操作
   */
  performDelete: function(businessId) {
    wx.showLoading({
      title: '删除中...'
    });

    // 模拟API调用
    setTimeout(() => {
      const businesses = this.data.businesses.filter(business => business.id !== businessId);
      this.setData({
        businesses: businesses
      });

      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 显示添加商家模态框
   */
  showAddModal: function() {
    this.setData({
      showAddModal: true,
      newBusiness: {
        name: '',
        category: '',
        address: '',
        phone: '',
        description: ''
      }
    });
  },

  /**
   * 隐藏添加商家模态框
   */
  hideAddModal: function() {
    this.setData({
      showAddModal: false
    });
  },

  /**
   * 新商家信息输入
   */
  onNewBusinessInput: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`newBusiness.${field}`]: value
    });
  },

  /**
   * 选择商家类别
   */
  onCategoryChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'newBusiness.category': this.data.categories[index]
    });
  },

  /**
   * 提交新商家
   */
  submitNewBusiness: function() {
    const newBusiness = this.data.newBusiness;
    
    // 验证必填字段
    if (!newBusiness.name || !newBusiness.category || !newBusiness.address || !newBusiness.phone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '添加中...'
    });

    // 模拟API调用
    setTimeout(() => {
      const businesses = this.data.businesses;
      const newId = Math.max(...businesses.map(b => b.id)) + 1;
      
      businesses.unshift({
        id: newId,
        name: newBusiness.name,
        category: newBusiness.category,
        rating: 0,
        address: newBusiness.address,
        phone: newBusiness.phone,
        status: 'active'
      });

      this.setData({
        businesses: businesses,
        showAddModal: false
      });

      wx.hideLoading();
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 切换商家状态
   */
  toggleBusinessStatus: function(e) {
    const businessId = e.currentTarget.dataset.id;
    const businesses = this.data.businesses.map(business => {
      if (business.id === businessId) {
        business.status = business.status === 'active' ? 'inactive' : 'active';
      }
      return business;
    });

    this.setData({
      businesses: businesses
    });

    wx.showToast({
      title: '状态已更新',
      icon: 'success'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadBusinessList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})