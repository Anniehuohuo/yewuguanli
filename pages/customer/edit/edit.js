// pages/customer/edit/edit.js
Page({
  data: {
    id: '',
    isEdit: false,
    customer: {
      name: '',
      contact: '',
      phone: '',
      address: '',
      latitude: '',
      longitude: '',
      remark: ''
    }
  },
  
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        id: options.id,
        isEdit: true
      });
      this.loadCustomerData();
      wx.setNavigationBarTitle({
        title: '编辑客户'
      });
    } else {
      wx.setNavigationBarTitle({
        title: '新增客户'
      });
    }
  },
  
  // 加载客户数据
  loadCustomerData: function() {
    const app = getApp();
    const customers = app.globalData.customers || [];
    
    const customer = customers.find(item => item.id === this.data.id);
    if (customer) {
      this.setData({
        customer: customer
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
  
  // 选择位置
  chooseLocation: function() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'customer.address': res.address,
          'customer.latitude': res.latitude,
          'customer.longitude': res.longitude
        });
      },
      fail: (err) => {
        if (err.errMsg !== 'chooseLocation:fail cancel') {
          wx.showToast({
            title: '选择位置失败',
            icon: 'none'
          });
        }
      }
    });
  },
  
  // 取消编辑
  cancelEdit: function() {
    wx.navigateBack();
  },
  
  // 提交表单
  submitForm: function(e) {
    const formData = e.detail.value;
    
    // 验证表单
    if (!formData.name || formData.name.trim() === '') {
      wx.showToast({
        title: '请输入客户名称',
        icon: 'none'
      });
      return;
    }
    
    const app = getApp();
    const customers = app.globalData.customers || [];
    
    // 构建客户数据
    const customerData = {
      name: formData.name.trim(),
      contact: formData.contact ? formData.contact.trim() : '',
      phone: formData.phone ? formData.phone.trim() : '',
      address: formData.address ? formData.address.trim() : '',
      latitude: this.data.customer.latitude || '',
      longitude: this.data.customer.longitude || '',
      remark: formData.remark ? formData.remark.trim() : ''
    };
    
    if (this.data.isEdit) {
      // 编辑现有客户
      const index = customers.findIndex(item => item.id === this.data.id);
      if (index !== -1) {
        customerData.id = this.data.id;
        customerData.createTime = customers[index].createTime;
        customerData.updateTime = app.formatDateTime();
        
        customers[index] = customerData;
        app.saveCustomers();
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } else {
      // 添加新客户
      customerData.id = app.generateId();
      customerData.createTime = app.formatDateTime();
      customerData.updateTime = customerData.createTime;
      
      customers.push(customerData);
      app.saveCustomers();
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  }
});