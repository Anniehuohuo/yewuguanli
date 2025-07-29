// pages/customer/edit/edit.js
const app = getApp();

Page({
  data: {
    customerId: null,
    isEdit: false,
    formData: {
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      category: 'A',
      remark: ''
    },
    categoryOptions: [
      { value: 'A', label: 'A类客户', color: '#ff3b30' },
      { value: 'B', label: 'B类客户', color: '#ff9500' },
      { value: 'C', label: 'C客户', color: '#34c759' }
    ]
  },

  onLoad: function(options) {
    const customerId = options.id;
    if (customerId) {
      this.setData({ 
        customerId,
        isEdit: true 
      });
      this.loadCustomerData(customerId);
      wx.setNavigationBarTitle({
        title: '编辑客户'
      });
    } else {
      wx.setNavigationBarTitle({
        title: '新建客户'
      });
    }
  },

  // 加载客户数据
  loadCustomerData: function(customerId) {
    const customers = app.globalData.customers;
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
      this.setData({
        formData: {
          name: customer.name,
          company: customer.company,
          phone: customer.phone,
          email: customer.email || '',
          address: customer.address || '',
          category: customer.category,
          remark: customer.remark || ''
        }
      });
    }
  },

  // 输入框变化
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 选择客户类别
  onCategoryChange: function(e) {
    const index = e.detail.value;
    const category = this.data.categoryOptions[index].value;
    
    this.setData({
      'formData.category': category
    });
  },

  // 表单验证
  validateForm: function() {
    const { formData } = this.data;
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入客户姓名',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.company.trim()) {
      wx.showToast({
        title: '请输入公司名称',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.phone.trim()) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return false;
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return false;
    }
    
    // 验证邮箱格式（如果填写了）
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        wx.showToast({
          title: '请输入正确的邮箱地址',
          icon: 'none'
        });
        return false;
      }
    }
    
    return true;
  },

  // 保存客户
  onSave: function() {
    if (!this.validateForm()) {
      return;
    }
    
    const { formData, customerId, isEdit } = this.data;
    const customers = app.globalData.customers;
    
    if (isEdit) {
      // 编辑模式
      const index = customers.findIndex(c => c.id === customerId);
      if (index !== -1) {
        customers[index] = {
          ...customers[index],
          ...formData,
          updateTime: this.formatDate(new Date())
        };
      }
    } else {
      // 新建模式
      const newCustomer = {
        id: this.generateId(),
        ...formData,
        createTime: this.formatDate(new Date()),
        updateTime: this.formatDate(new Date())
      };
      customers.unshift(newCustomer);
    }
    
    app.globalData.customers = customers;
    
    wx.showToast({
      title: isEdit ? '保存成功' : '创建成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 生成ID
  generateId: function() {
    return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 取消编辑
  onCancel: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消编辑吗？未保存的内容将丢失。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});