// pages/customer/detail/detail.js
const app = getApp();

Page({
  data: {
    customer: null,
    customerId: null,
    orders: [],
    showDeleteModal: false
  },

  onLoad: function(options) {
    const customerId = options.id;
    if (customerId) {
      this.setData({ customerId });
      this.loadCustomerDetail(customerId);
      this.loadCustomerOrders(customerId);
    }
  },

  // 加载客户详情
  loadCustomerDetail: function(customerId) {
    const customers = app.globalData.customers;
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
      this.setData({ customer });
      wx.setNavigationBarTitle({
        title: customer.name
      });
    } else {
      wx.showToast({
        title: '客户不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载客户订单
  loadCustomerOrders: function(customerId) {
    const orders = app.globalData.orders.filter(order => order.customerId === customerId);
    this.setData({ orders });
  },

  // 拨打电话
  onCallTap: function() {
    const { customer } = this.data;
    if (customer && customer.phone) {
      wx.makePhoneCall({
        phoneNumber: customer.phone
      });
    }
  },

  // 发送短信
  onMessageTap: function() {
    wx.showToast({
      title: '短信功能开发中',
      icon: 'none'
    });
  },

  // 编辑客户
  onEditTap: function() {
    const { customerId } = this.data;
    wx.navigateTo({
      url: `/pages/customer/edit/edit?id=${customerId}`
    });
  },

  // 显示删除确认
  onDeleteTap: function() {
    this.setData({ showDeleteModal: true });
  },

  // 确认删除
  onConfirmDelete: function() {
    const { customerId } = this.data;
    const customers = app.globalData.customers;
    const index = customers.findIndex(c => c.id === customerId);
    
    if (index !== -1) {
      customers.splice(index, 1);
      app.globalData.customers = customers;
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
    
    this.setData({ showDeleteModal: false });
  },

  // 取消删除
  onCancelDelete: function() {
    this.setData({ showDeleteModal: false });
  },

  // 查看订单详情
  onOrderTap: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    });
  },

  // 新建订单
  onNewOrderTap: function() {
    const { customerId } = this.data;
    wx.navigateTo({
      url: `/pages/order/edit/edit?customerId=${customerId}`
    });
  },

  // 分享客户信息
  onShareAppMessage: function() {
    const { customer } = this.data;
    return {
      title: `${customer.name} - ${customer.company}`,
      path: `/pages/customer/detail/detail?id=${customer.id}`
    };
  }
});