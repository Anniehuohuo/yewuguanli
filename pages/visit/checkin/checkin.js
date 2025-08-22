// pages/visit/checkin/checkin.js
Page({
  data: {
    customerId: null,
    customer: {},
    locationStatus: 'none', // none, loading, success, error
    locationStatusText: '点击获取位置',
    latitude: null,
    longitude: null,
    address: '',
    markers: [],
    photos: [],
    remark: '',
    canSubmit: false,
    nearbyCustomers: [], // 附近的客户列表
    showCustomerSelector: false // 是否显示客户选择器
  },
  
  onLoad: function(options) {
    if (options.customerId) {
      this.setData({
        customerId: options.customerId
      });
      this.loadCustomerData();
    } else {
      // 如果没有指定客户，自动获取位置并筛选附近客户
      this.getLocation();
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
      this.checkCanSubmit();
    }
  },
  
  // 选择客户
  selectCustomer: function() {
    // 如果位置获取成功且有附近的客户，显示选择弹窗
    if (this.data.locationStatus === 'success' && this.data.nearbyCustomers && this.data.nearbyCustomers.length > 0) {
      this.setData({
        showCustomerSelector: true
      });
    } else {
      // 直接跳转到客户列表
      wx.navigateTo({
        url: '/pages/customer/list/list?select=true'
      });
    }
  },
  
  // 根据位置筛选附近的客户
  filterNearbyCustomers: function(latitude, longitude) {
    const app = getApp();
    const customers = app.globalData.customers || [];
    const nearbyCustomers = [];
    
    // 筛选距离当前位置2公里内的客户
    customers.forEach(customer => {
      if (customer.latitude && customer.longitude) {
        const distance = this.calculateDistance(
          latitude, longitude,
          customer.latitude, customer.longitude
        );
        
        if (distance <= 2) { // 2公里内
          nearbyCustomers.push({
            ...customer,
            distance: distance
          });
        }
      }
    });
    
    // 按距离排序
    nearbyCustomers.sort((a, b) => a.distance - b.distance);
    
    this.setData({
      nearbyCustomers: nearbyCustomers
    });
    
    // 如果只有一个附近的客户，自动选择
    if (nearbyCustomers.length === 1) {
      this.selectNearbyCustomer(0);
    }
  },
  
  // 计算两点间距离（公里）
  calculateDistance: function(lat1, lng1, lat2, lng2) {
    const radLat1 = lat1 * Math.PI / 180.0;
    const radLat2 = lat2 * Math.PI / 180.0;
    const a = radLat1 - radLat2;
    const b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // 地球半径
    s = Math.round(s * 10000) / 10000;
    return s;
  },
  
  // 选择附近的客户
  selectNearbyCustomer: function(e) {
    const index = e.currentTarget.dataset.index;
    const customer = this.data.nearbyCustomers[index];
    
    // 设置选中的客户
    this.setData({
      customerId: customer.id,
      customer: customer,
      showCustomerSelector: false
    });
    
    wx.showToast({
      title: '已选择客户',
      icon: 'success',
      duration: 1500
    });
    
    this.checkCanSubmit();
  },
  
  // 关闭客户选择器
  closeCustomerSelector: function() {
    this.setData({
      showCustomerSelector: false
    });
  },
  

  
  // 获取位置信息
  getLocation: function() {
    this.setData({
      locationStatus: 'loading',
      locationStatusText: '正在获取位置...'
    });
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        
        // 设置地图标记点
        const markers = [{
          id: 1,
          latitude: latitude,
          longitude: longitude,
          callout: {
            content: '当前位置',
            color: '#333',
            fontSize: 14,
            borderRadius: 4,
            padding: 8,
            display: 'ALWAYS'
          }
        }];
        
        this.setData({
          locationStatus: 'success',
          locationStatusText: '位置获取成功',
          latitude: latitude,
          longitude: longitude,
          markers: markers
        });
        
        // 获取位置的详细地址
        this.getAddress(latitude, longitude);
        
        // 根据位置筛选附近的客户
        this.filterNearbyCustomers(latitude, longitude);
        
        this.checkCanSubmit();
      },
      fail: (err) => {
        console.error('获取位置失败', err);
        this.setData({
          locationStatus: 'error',
          locationStatusText: '获取位置失败，请检查定位权限'
        });
      }
    });
  },
  
  // 获取地址信息
  getAddress: function(latitude, longitude) {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latitude},${longitude}`,
        key: 'YOUR_MAP_KEY', // 需要替换为实际的腾讯地图API密钥
        get_poi: 0
      },
      success: (res) => {
        if (res.data && res.data.status === 0) {
          const address = res.data.result.address;
          this.setData({
            address: address
          });
        }
      },
      fail: (err) => {
        console.error('获取地址失败', err);
      }
    });
  },
  
  // 刷新位置
  refreshLocation: function() {
    this.getLocation();
  },
  
  // 拍照
  takePhoto: function() {
    const currentCount = this.data.photos.length;
    const remainCount = 9 - currentCount;
    
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多只能上传9张照片',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        const photos = this.data.photos.concat(tempFilePaths);
        this.setData({
          photos: photos
        });
        this.checkCanSubmit();
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
    this.checkCanSubmit();
  },
  
  // 输入备注
  inputRemark: function(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  
  // 检查是否可以提交
  checkCanSubmit: function() {
    const canSubmit = this.data.customer.id && 
                      this.data.locationStatus === 'success' && 
                      this.data.photos.length > 0;
    
    this.setData({
      canSubmit: canSubmit
    });
  },
  
  // 取消打卡
  cancelCheckin: function() {
    wx.navigateBack();
  },
  
  // 提交打卡
  submitCheckin: function() {
    if (!this.data.canSubmit) {
      return;
    }
    
    const app = getApp();
    const checkins = app.globalData.checkins || [];
    
    // 构建打卡数据
    const checkinData = {
      id: app.generateId(),
      customerId: this.data.customer.id,
      customerName: this.data.customer.name,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      address: this.data.address,
      photos: this.data.photos,
      remark: this.data.remark,
      checkinTime: app.formatDateTime(),
      createTime: app.formatDateTime()
    };
    
    checkins.push(checkinData);
    app.saveCheckins();
    
    wx.showToast({
      title: '打卡成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});