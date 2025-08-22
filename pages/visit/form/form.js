// pages/visit/form/form.js
Page({
  data: {
    id: '',
    customerId: '',
    planId: '', // 添加planId字段
    isEdit: false,
    customer: {},
    visitDate: '',
    photos: [],
    visitData: {
      developmentMethod: '',
      order: '',
      problem: '',
      solution: '',
      case: '',
      inventory: '',
      shipping: '',
      foundation: '',
      replenishment: '',
      training: '',
      wechat: '',
      tools: '',
      feedback: ''
    },
    developmentOptions: [
      { label: '城', value: 'city', checked: true },
      { label: '光', value: 'light', checked: true }
    ],

    customFields: [],
    showAddField: false,
    newField: {
      label: '',
      name: '',
      type: 'text',
      value: ''
    }
  },
  
  onLoad: function(options) {
    // 加载输入历史

    // 设置当前日期
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.setData({
      visitDate: `${year}-${month}-${day}`
    });
    
    if (options.id) {
      // 编辑现有拜访记录
      this.setData({
        id: options.id,
        isEdit: true
      });
      wx.setNavigationBarTitle({
        title: '编辑拜访记录'
      });
      this.loadVisitData();
    } else if (options.customerId) {
      // 新增特定客户的拜访记录
      this.setData({
        customerId: options.customerId,
        planId: options.planId || '' // 保存planId参数
      });
      this.loadCustomerData();
    } else {
      // 新增拜访记录，需要选择客户
      wx.setNavigationBarTitle({
        title: '新增拜访记录'
      });
    }
  },
  
  // 加载拜访记录数据
  loadVisitData: function() {
    const app = getApp();
    const visits = app.globalData.visits || [];
    
    const visit = visits.find(item => item.id === this.data.id);
    if (!visit) {
      wx.showToast({
        title: '拜访记录不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 设置客户ID并加载客户数据
    this.setData({
      customerId: visit.customerId
    });
    this.loadCustomerData();
    
    // 设置拜访日期
    if (visit.visitTime) {
      const datePart = visit.visitTime.split(' ')[0];
      this.setData({
        visitDate: datePart
      });
    }
    
    // 设置开发选项的选中状态
    if (visit.development && visit.development.length > 0) {
      const developmentOptions = this.data.developmentOptions.map(option => {
        return {
          ...option,
          checked: visit.development.includes(option.value)
        };
      });
      this.setData({
        developmentOptions: developmentOptions
      });
    }
    
    // 设置照片
    if (visit.photos && visit.photos.length > 0) {
      this.setData({
        photos: visit.photos
      });
    }
    
    // 设置拜访数据
    const visitData = {};
    const standardFields = [
      'developmentMethod', 'order', 'problem', 'solution', 'case',
      'inventory', 'shipping', 'foundation', 'replenishment',
      'training', 'wechat', 'tools', 'feedback'
    ];
    
    standardFields.forEach(field => {
      visitData[field] = visit[field] || '';
    });
    
    this.setData({
      visitData: visitData
    });
    
    // 设置自定义字段
    const customFields = [];
    if (visit.customFields && visit.customFields.length > 0) {
      visit.customFields.forEach(field => {
        customFields.push({
          label: field.label,
          name: field.name,
          type: field.type,
          value: field.value || ''
        });
      });
      this.setData({
        customFields: customFields
      });
    }
  },
  
  // 加载客户数据
  loadCustomerData: function() {
    const app = getApp();
    const customers = app.globalData.customers || [];
    
    const customer = customers.find(item => item.id === this.data.customerId);
    if (customer) {
      this.setData({
        customer: customer
      });
    } else if (this.data.customerId) {
      wx.showToast({
        title: '客户不存在',
        icon: 'none'
      });
    }
  },
  
  // 选择客户
  selectCustomer: function() {
    wx.navigateTo({
      url: '/pages/customer/list/list?select=true'
    });
  },
  
  // 日期选择器变化事件
  bindDateChange: function(e) {
    this.setData({
      visitDate: e.detail.value
    });
  },
  
  // 复选框变化事件
  checkboxChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const values = e.detail.value;
    
    if (field === 'development') {
      const developmentOptions = this.data.developmentOptions.map(option => {
        return {
          ...option,
          checked: values.includes(option.value)
        };
      });
      this.setData({
        developmentOptions: developmentOptions
      });
    }
  },
  
  // 选择图片
  chooseImage: function() {
    const currentCount = this.data.photos.length;
    const remainCount = 9 - currentCount;
    
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多只能上传9张图片',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        const photos = this.data.photos.concat(tempFilePaths);
        this.setData({
          photos: photos
        });
      }
    });
  },
  
  // 删除照片
  deletePhoto: function(e) {
    const index = e.currentTarget.dataset.index;
    const photos = this.data.photos;
    photos.splice(index, 1);
    this.setData({
      photos: photos
    });
  },
  
  // 显示添加字段弹窗
  showAddFieldModal: function() {
    this.setData({
      showAddField: true,
      newField: {
        label: '',
        name: '',
        type: 'text',
        value: ''
      }
    });
  },
  
  // 隐藏添加字段弹窗
  hideAddFieldModal: function() {
    this.setData({
      showAddField: false
    });
  },
  
  // 输入字段名称
  inputFieldName: function(e) {
    const label = e.detail.value;
    const name = label.replace(/\s+/g, '_').toLowerCase();
    this.setData({
      'newField.label': label,
      'newField.name': name
    });
  },
  
  // 选择字段类型
  selectFieldType: function(e) {
    this.setData({
      'newField.type': e.detail.value
    });
  },
  
  // 添加自定义字段
  addCustomField: function() {
    const newField = this.data.newField;
    
    if (!newField.label || !newField.name) {
      wx.showToast({
        title: '请输入字段名称',
        icon: 'none'
      });
      return;
    }
    
    // 检查字段名称是否重复
    const isDuplicate = this.data.customFields.some(field => {
      return field.name === newField.name;
    });
    
    if (isDuplicate) {
      wx.showToast({
        title: '字段名称已存在',
        icon: 'none'
      });
      return;
    }
    
    const customFields = this.data.customFields.concat([{
      label: newField.label,
      name: newField.name,
      type: newField.type,
      value: ''
    }]);
    
    this.setData({
      customFields: customFields,
      showAddField: false
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
    if (!this.data.customer.id) {
      wx.showToast({
        title: '请选择客户',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.visitDate) {
      wx.showToast({
        title: '请选择拜访日期',
        icon: 'none'
      });
      return;
    }
    
    // 检查每日每客户新增限制（仅对新增记录生效）
    if (!this.data.isEdit) {
      const app = getApp();
      const today = app.formatDate();
      const todayCustomerVisits = app.globalData.visits.filter(visit => {
        const visitDate = visit.createTime ? visit.createTime.split(' ')[0] : '';
        return visitDate === today && visit.customerId === this.data.customer.id;
      });
      
      if (todayCustomerVisits.length >= 1) {
        wx.showModal({
          title: '提示',
          content: `您今天已经拜访过客户"${this.data.customer.name}"了，每天每个客户最多只能新增一条拜访记录。如需重新添加，请先删除今天对该客户的拜访记录。`,
          showCancel: false,
          confirmText: '我知道了'
        });
        return;
      }
    }
    
    // 开发选项固定为城光
    const development = ['city', 'light'];
    

    
    const app = getApp();
    const visits = app.globalData.visits || [];
    
    // 构建拜访数据
    const visitData = {
      customerId: this.data.customer.id,
      customerName: this.data.customer.name,
      visitDate: this.data.visitDate,
      development: ['城', '光'], // 导出时显示中文
      photos: this.data.photos,
      listing: formData.listing || '',
      developmentMethod: formData.developmentMethod || '',
      order: formData.order || ',',
      problem: formData.problem || '',
      solution: formData.solution || '',
      case: formData.case || '',
      inventory: formData.inventory || '',
      shipping: formData.shipping || '',
      foundation: formData.foundation || '',
      replenishment: formData.replenishment || '',
      training: formData.training || '',
      wechat: formData.wechat || '',
      tools: formData.tools || '',
      feedback: formData.feedback || ''
    };
    
    // 处理自定义字段
    const customFields = [];
    this.data.customFields.forEach(field => {
      const fieldName = `custom_${field.name}`;
      const value = formData[fieldName] || '';
      customFields.push({
        label: field.label,
        name: field.name,
        type: field.type,
        value: value
      });
    });
    
    visitData.customFields = customFields;
    
    if (this.data.isEdit) {
      // 编辑现有拜访记录
      const index = visits.findIndex(item => item.id === this.data.id);
      if (index !== -1) {
        visitData.id = this.data.id;
        visitData.createTime = visits[index].createTime;
        visitData.updateTime = app.formatDateTime();
        // 编辑时保持原有拜访时间不变
        visitData.visitTime = visits[index].visitTime;
        
        visits[index] = visitData;
        app.saveVisits();
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } else {
      // 添加新拜访记录
      visitData.id = app.generateId();
      visitData.createTime = app.formatDateTime();
      visitData.updateTime = visitData.createTime;
      // 新增时设置当前时间为拜访时间
      visitData.visitTime = app.formatDateTime();
      
      visits.push(visitData);
      app.saveVisits();
      
      // 检查是否有对应的拜访计划需要更新状态
      if (this.data.planId) {
        // 如果有planId，直接更新指定的计划
        this.updateVisitPlanStatusById(this.data.planId);
      } else {
        // 否则按客户ID和日期查找计划
        this.updateVisitPlanStatus(visitData.customerId, visitData.visitDate);
      }
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // 更新拜访计划状态
  updateVisitPlanStatus: function(customerId, visitDate) {
    const app = getApp();
    const visitPlans = app.globalData.visitPlans || [];
    
    // 查找对应的拜访计划
    const planIndex = visitPlans.findIndex(plan => {
      return plan.customerId === customerId && 
             plan.planDate === visitDate && 
             plan.status === 'pending';
    });
    
    if (planIndex !== -1) {
      // 更新计划状态为已完成
      visitPlans[planIndex].status = 'completed';
      visitPlans[planIndex].completedTime = app.formatDateTime();
      
      app.globalData.visitPlans = visitPlans;
      app.saveVisitPlans();
      
      console.log('拜访计划状态已更新为已完成');
    }
  },
  
  // 根据planId更新拜访计划状态
  updateVisitPlanStatusById: function(planId) {
    const app = getApp();
    const visitPlans = app.globalData.visitPlans || [];
    
    // 查找对应的拜访计划
    const planIndex = visitPlans.findIndex(plan => {
      return plan.id === planId && plan.status === 'pending';
    });
    
    if (planIndex !== -1) {
      // 更新计划状态为已完成
      visitPlans[planIndex].status = 'completed';
      visitPlans[planIndex].completedTime = app.formatDateTime();
      
      app.globalData.visitPlans = visitPlans;
      app.saveVisitPlans();
      
      console.log('拜访计划状态已更新为已完成 (通过planId)');
    }
  }
});