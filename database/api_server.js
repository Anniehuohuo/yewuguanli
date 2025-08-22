// API服务器示例 - 使用Express.js框架
// 安装依赖: npm install express mysql2 cors body-parser multer

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 导入数据库配置
const { customerDAO, visitDAO, checkinDAO, statisticsDAO } = require('./database_config');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads')); // 静态文件服务

// 创建上传目录
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('API错误:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// 成功响应格式化
const successResponse = (data, message = '操作成功') => {
  return {
    success: true,
    message,
    data
  };
};

// ==================== 客户相关API ====================

// 获取所有客户
app.get('/api/customers', async (req, res, next) => {
  try {
    const customers = await customerDAO.getAllCustomers();
    res.json(successResponse(customers, '获取客户列表成功'));
  } catch (error) {
    next(error);
  }
});

// 根据ID获取客户
app.get('/api/customers/:id', async (req, res, next) => {
  try {
    const customer = await customerDAO.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    res.json(successResponse(customer, '获取客户信息成功'));
  } catch (error) {
    next(error);
  }
});

// 创建客户
app.post('/api/customers', async (req, res, next) => {
  try {
    const customerData = {
      id: 'customer_' + Date.now(),
      ...req.body
    };
    const customer = await customerDAO.createCustomer(customerData);
    res.status(201).json(successResponse(customer, '创建客户成功'));
  } catch (error) {
    next(error);
  }
});

// 更新客户
app.put('/api/customers/:id', async (req, res, next) => {
  try {
    const customer = await customerDAO.updateCustomer(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '客户不存在'
      });
    }
    res.json(successResponse(customer, '更新客户成功'));
  } catch (error) {
    next(error);
  }
});

// 删除客户
app.delete('/api/customers/:id', async (req, res, next) => {
  try {
    await customerDAO.deleteCustomer(req.params.id);
    res.json(successResponse(null, '删除客户成功'));
  } catch (error) {
    next(error);
  }
});

// 搜索客户
app.get('/api/customers/search/:keyword', async (req, res, next) => {
  try {
    const customers = await customerDAO.searchCustomers(req.params.keyword);
    res.json(successResponse(customers, '搜索客户成功'));
  } catch (error) {
    next(error);
  }
});

// ==================== 拜访记录相关API ====================

// 获取所有拜访记录
app.get('/api/visits', async (req, res, next) => {
  try {
    const visits = await visitDAO.getAllVisits();
    // 解析JSON字段
    const processedVisits = visits.map(visit => ({
      ...visit,
      development: visit.development ? JSON.parse(visit.development) : [],
      photos: visit.photos ? JSON.parse(visit.photos) : [],
      custom_fields: visit.custom_fields ? JSON.parse(visit.custom_fields) : []
    }));
    res.json(successResponse(processedVisits, '获取拜访记录成功'));
  } catch (error) {
    next(error);
  }
});

// 获取今日拜访记录
app.get('/api/visits/today', async (req, res, next) => {
  try {
    const visits = await visitDAO.getTodayVisits();
    const processedVisits = visits.map(visit => ({
      ...visit,
      development: visit.development ? JSON.parse(visit.development) : [],
      photos: visit.photos ? JSON.parse(visit.photos) : [],
      custom_fields: visit.custom_fields ? JSON.parse(visit.custom_fields) : []
    }));
    res.json(successResponse(processedVisits, '获取今日拜访记录成功'));
  } catch (error) {
    next(error);
  }
});

// 根据ID获取拜访记录
app.get('/api/visits/:id', async (req, res, next) => {
  try {
    const visit = await visitDAO.getVisitById(req.params.id);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: '拜访记录不存在'
      });
    }
    // 解析JSON字段
    const processedVisit = {
      ...visit,
      development: visit.development ? JSON.parse(visit.development) : [],
      photos: visit.photos ? JSON.parse(visit.photos) : [],
      custom_fields: visit.custom_fields ? JSON.parse(visit.custom_fields) : []
    };
    res.json(successResponse(processedVisit, '获取拜访记录成功'));
  } catch (error) {
    next(error);
  }
});

// 创建拜访记录
app.post('/api/visits', async (req, res, next) => {
  try {
    const visitData = {
      id: 'visit_' + Date.now(),
      ...req.body
    };
    const visit = await visitDAO.createVisit(visitData);
    res.status(201).json(successResponse(visit, '创建拜访记录成功'));
  } catch (error) {
    next(error);
  }
});

// 根据客户ID获取拜访记录
app.get('/api/customers/:customerId/visits', async (req, res, next) => {
  try {
    const visits = await visitDAO.getVisitsByCustomerId(req.params.customerId);
    const processedVisits = visits.map(visit => ({
      ...visit,
      development: visit.development ? JSON.parse(visit.development) : [],
      photos: visit.photos ? JSON.parse(visit.photos) : [],
      custom_fields: visit.custom_fields ? JSON.parse(visit.custom_fields) : []
    }));
    res.json(successResponse(processedVisits, '获取客户拜访记录成功'));
  } catch (error) {
    next(error);
  }
});

// ==================== 打卡记录相关API ====================

// 创建打卡记录
app.post('/api/checkins', async (req, res, next) => {
  try {
    const checkinData = {
      id: 'checkin_' + Date.now(),
      ...req.body
    };
    await checkinDAO.createCheckin(checkinData);
    res.status(201).json(successResponse(null, '打卡成功'));
  } catch (error) {
    next(error);
  }
});

// 获取今日打卡记录
app.get('/api/checkins/today', async (req, res, next) => {
  try {
    const checkins = await checkinDAO.getTodayCheckins();
    const processedCheckins = checkins.map(checkin => ({
      ...checkin,
      photos: checkin.photos ? JSON.parse(checkin.photos) : []
    }));
    res.json(successResponse(processedCheckins, '获取今日打卡记录成功'));
  } catch (error) {
    next(error);
  }
});

// ==================== 统计相关API ====================

// 获取今日统计数据
app.get('/api/statistics/today', async (req, res, next) => {
  try {
    const statistics = await statisticsDAO.getTodayStatistics();
    res.json(successResponse(statistics, '获取今日统计成功'));
  } catch (error) {
    next(error);
  }
});

// 获取客户拜访统计
app.get('/api/statistics/customer/:customerId', async (req, res, next) => {
  try {
    const stats = await statisticsDAO.getCustomerVisitStats(req.params.customerId);
    res.json(successResponse(stats, '获取客户统计成功'));
  } catch (error) {
    next(error);
  }
});

// ==================== 文件上传API ====================

// 单文件上传
app.post('/api/upload/single', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json(successResponse({
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      url: fileUrl
    }, '文件上传成功'));
  } catch (error) {
    next(error);
  }
});

// 多文件上传
app.post('/api/upload/multiple', upload.array('files', 10), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));
    
    res.json(successResponse(files, '文件上传成功'));
  } catch (error) {
    next(error);
  }
});

// ==================== 健康检查API ====================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API接口不存在'
  });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务器已启动，端口: ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
  console.log(`API文档: http://localhost:${PORT}/api`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('正在关闭服务器...');
  // 这里可以添加数据库连接关闭等清理工作
  process.exit(0);
});

module.exports = app;