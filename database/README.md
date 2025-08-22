# CRM客户管理系统 - 数据库集成方案

本文档介绍如何将小程序的客户和拜访数据迁移到MySQL数据库，并提供完整的数据库连接和API服务方案。

## 📋 目录

- [数据库表结构设计](#数据库表结构设计)
- [环境准备](#环境准备)
- [数据库部署](#数据库部署)
- [API服务部署](#api服务部署)
- [小程序集成](#小程序集成)
- [数据迁移](#数据迁移)
- [API接口文档](#api接口文档)

## 🗄️ 数据库表结构设计

### 主要数据表

1. **customers** - 客户信息表
   - 存储客户基本信息：姓名、联系人、电话、地址等
   - 支持软删除和时间戳记录

2. **visits** - 拜访记录表
   - 存储详细的拜访信息：开发情况、问题、解决方案等
   - 使用JSON字段存储复杂数据（照片、自定义字段）
   - 外键关联客户表

3. **checkins** - 打卡记录表
   - 存储位置信息和打卡照片
   - 支持地理位置索引

4. **users** - 用户表（可选）
   - 支持多用户系统扩展

5. **system_config** - 系统配置表
   - 存储应用配置信息

### 视图和存储过程

- `today_statistics` - 今日统计数据视图
- `GetCustomerVisitStats` - 客户拜访统计存储过程

## 🛠️ 环境准备

### 1. 安装MySQL数据库

```bash
# Windows (使用MySQL Installer)
# 下载并安装 MySQL Community Server 8.0+
# 设置root密码并启动服务

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation

# macOS (使用Homebrew)
brew install mysql
brew services start mysql
```

### 2. 安装Node.js环境

```bash
# 下载并安装 Node.js 16+ 版本
# 验证安装
node --version
npm --version
```

### 3. 安装项目依赖

```bash
# 在项目根目录执行
npm init -y
npm install express mysql2 cors body-parser multer
```

## 🚀 数据库部署

### 1. 创建数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行建表脚本
source /path/to/mysql_schema.sql
```

### 2. 配置数据库连接

编辑 `database/database_config.js` 文件，修改数据库连接参数：

```javascript
const dbConfig = {
  host: 'localhost',          // 数据库主机
  port: 3306,                 // 端口
  user: 'root',               // 用户名
  password: 'your_password',  // 密码（请修改）
  database: 'crm_system',     // 数据库名
  // ... 其他配置
};
```

### 3. 测试数据库连接

```bash
# 创建测试脚本
node -e "const {db} = require('./database/database_config'); db.query('SELECT 1').then(console.log).catch(console.error);"
```

## 🌐 API服务部署

### 1. 启动API服务器

```bash
# 开发环境
node database/api_server.js

# 生产环境（推荐使用PM2）
npm install -g pm2
pm2 start database/api_server.js --name "crm-api"
```

### 2. 验证API服务

访问健康检查接口：
```
GET http://localhost:3000/api/health
```

### 3. 配置反向代理（生产环境）

使用Nginx配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
    }
}
```

## 📱 小程序集成

### 1. 修改数据存储方式

在小程序中，将原来的本地存储改为API调用：

```javascript
// 原来的本地存储
// wx.setStorageSync('customers', customers);

// 改为API调用
wx.request({
  url: 'https://your-api-domain.com/api/customers',
  method: 'POST',
  data: customerData,
  success: (res) => {
    console.log('客户创建成功', res.data);
  }
});
```

### 2. 封装API调用工具

创建 `utils/api.js`：

```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';

class ApiService {
  static request(url, options = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.data.success) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.message));
          }
        },
        fail: reject
      });
    });
  }
  
  // 客户相关API
  static getCustomers() {
    return this.request('/customers');
  }
  
  static createCustomer(data) {
    return this.request('/customers', {
      method: 'POST',
      data
    });
  }
  
  // 拜访记录相关API
  static getVisits() {
    return this.request('/visits');
  }
  
  static getTodayVisits() {
    return this.request('/visits/today');
  }
  
  static createVisit(data) {
    return this.request('/visits', {
      method: 'POST',
      data
    });
  }
}

module.exports = ApiService;
```

## 📊 数据迁移

### 1. 导出现有数据

在小程序中添加数据导出功能：

```javascript
// 在app.js中添加导出方法
exportData: function() {
  const data = {
    customers: this.globalData.customers,
    visits: this.globalData.visits,
    checkins: this.globalData.checkins
  };
  
  // 复制到剪贴板或发送到服务器
  wx.setClipboardData({
    data: JSON.stringify(data, null, 2),
    success: () => {
      wx.showToast({
        title: '数据已复制到剪贴板',
        icon: 'success'
      });
    }
  });
}
```

### 2. 批量导入数据

创建数据迁移脚本 `database/migrate_data.js`：

```javascript
const { customerDAO, visitDAO, checkinDAO } = require('./database_config');
const fs = require('fs');

async function migrateData() {
  try {
    // 读取导出的数据文件
    const data = JSON.parse(fs.readFileSync('exported_data.json', 'utf8'));
    
    // 迁移客户数据
    for (const customer of data.customers) {
      await customerDAO.createCustomer(customer);
    }
    
    // 迁移拜访记录
    for (const visit of data.visits) {
      await visitDAO.createVisit({
        ...visit,
        order_info: visit.order,
        case_info: visit.case
      });
    }
    
    // 迁移打卡记录
    for (const checkin of data.checkins) {
      await checkinDAO.createCheckin(checkin);
    }
    
    console.log('数据迁移完成');
  } catch (error) {
    console.error('数据迁移失败:', error);
  }
}

migrateData();
```

## 📚 API接口文档

### 客户管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/customers` | 获取所有客户 |
| GET | `/api/customers/:id` | 获取指定客户 |
| POST | `/api/customers` | 创建客户 |
| PUT | `/api/customers/:id` | 更新客户 |
| DELETE | `/api/customers/:id` | 删除客户 |
| GET | `/api/customers/search/:keyword` | 搜索客户 |

### 拜访记录

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/visits` | 获取所有拜访记录 |
| GET | `/api/visits/today` | 获取今日拜访记录 |
| GET | `/api/visits/:id` | 获取指定拜访记录 |
| POST | `/api/visits` | 创建拜访记录 |
| GET | `/api/customers/:customerId/visits` | 获取客户的拜访记录 |

### 打卡记录

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/checkins` | 创建打卡记录 |
| GET | `/api/checkins/today` | 获取今日打卡记录 |

### 统计数据

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/statistics/today` | 获取今日统计 |
| GET | `/api/statistics/customer/:customerId` | 获取客户统计 |

### 文件上传

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/upload/single` | 单文件上传 |
| POST | `/api/upload/multiple` | 多文件上传 |

## 🔧 维护和监控

### 1. 数据库备份

```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
mysqldump -u root -p crm_system > backup_${DATE}.sql

# 设置定时任务
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup_script.sh
```

### 2. 日志监控

```javascript
// 在api_server.js中添加日志记录
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. 性能优化

- 添加数据库索引
- 使用Redis缓存热点数据
- 实现分页查询
- 压缩API响应

## ❓ 常见问题

### Q: 如何处理数据同步问题？
A: 建议实现增量同步机制，记录数据版本号或时间戳。

### Q: 如何保证数据安全？
A: 实现用户认证、API限流、数据加密等安全措施。

### Q: 如何处理离线数据？
A: 在小程序中实现本地缓存，网络恢复时自动同步。

### Q: 如何扩展自定义字段？
A: 使用JSON字段存储，或者创建独立的自定义字段表。

## 📞 技术支持

如有问题，请联系技术支持或查看项目文档。