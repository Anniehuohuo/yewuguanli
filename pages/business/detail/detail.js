// pages/business/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    business: {},
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const businessId = options.id;
    if (businessId) {
      this.loadBusinessDetail(businessId);
    }
  },

  /**
   * 加载商家详情
   */
  loadBusinessDetail: function(id) {
    wx.showLoading({
      title: '加载中...'
    });

    // 模拟API调用
    setTimeout(() => {
      const business = {
        id: id,
        name: '美味餐厅',
        category: '中餐',
        rating: 4.5,
        address: '北京市朝阳区某某街道123号',
        phone: '010-12345678',
        hours: '09:00-22:00',
        description: '这是一家提供正宗中式料理的餐厅，环境优雅，服务周到。',
        images: [
          '/images/restaurant1.jpg',
          '/images/restaurant2.jpg',
          '/images/restaurant3.jpg'
        ],
        menu: [
          { name: '宫保鸡丁', price: 28, description: '经典川菜' },
          { name: '麻婆豆腐', price: 22, description: '香辣可口' },
          { name: '红烧肉', price: 35, description: '肥而不腻' }
        ]
      };

      this.setData({
        business: business,
        loading: false
      });

      wx.hideLoading();
    }, 1000);
  },

  /**
   * 拨打电话
   */
  makeCall: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.business.phone
    });
  },

  /**
   * 查看位置
   */
  viewLocation: function() {
    wx.openLocation({
      latitude: 39.9042,
      longitude: 116.4074,
      name: this.data.business.name,
      address: this.data.business.address
    });
  },

  /**
   * 预览图片
   */
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current,
      urls: this.data.business.images
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