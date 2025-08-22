// 数据库连接配置文件
// 使用 mysql2 库进行数据库连接

const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: 'localhost',          // 数据库主机地址
  port: 3306,                 // 数据库端口
  user: 'root',               // 数据库用户名
  password: 'your_password',  // 数据库密码
  database: 'crm_system',     // 数据库名称
  charset: 'utf8mb4',         // 字符集
  timezone: '+08:00',         // 时区设置
  acquireTimeout: 60000,      // 连接超时时间
  timeout: 60000,             // 查询超时时间
  reconnect: true,            // 自动重连
  connectionLimit: 10,        // 连接池最大连接数
  queueLimit: 0               // 队列限制
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 数据库操作类
class Database {
  constructor() {
    this.pool = pool;
  }

  // 执行查询
  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('数据库查询错误:', error);
      throw error;
    }
  }

  // 执行事务
  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('事务执行错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // 关闭连接池
  async close() {
    await this.pool.end();
  }
}

// 客户数据操作类
class CustomerDAO {
  constructor(db) {
    this.db = db;
  }

  // 获取所有客户
  async getAllCustomers() {
    const sql = `
      SELECT id, name, contact, phone, address, latitude, longitude, create_time, update_time, remark
      FROM customers 
      WHERE status = 1 
      ORDER BY create_time DESC
    `;
    return await this.db.query(sql);
  }

  // 根据ID获取客户
  async getCustomerById(id) {
    const sql = `
      SELECT id, name, contact, phone, address, latitude, longitude, create_time, update_time, remark
      FROM customers 
      WHERE id = ? AND status = 1
    `;
    const result = await this.db.query(sql, [id]);
    return result[0] || null;
  }

  // 创建客户
  async createCustomer(customerData) {
    const { id, name, contact, phone, address, latitude, longitude, remark } = customerData;
    const sql = `
      INSERT INTO customers (id, name, contact, phone, address, latitude, longitude, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.db.query(sql, [id, name, contact, phone, address, latitude, longitude, remark]);
    return await this.getCustomerById(id);
  }

  // 更新客户
  async updateCustomer(id, customerData) {
    const { name, contact, phone, address, latitude, longitude, remark } = customerData;
    const sql = `
      UPDATE customers 
      SET name = ?, contact = ?, phone = ?, address = ?, latitude = ?, longitude = ?, remark = ?
      WHERE id = ? AND status = 1
    `;
    await this.db.query(sql, [name, contact, phone, address, latitude, longitude, remark, id]);
    return await this.getCustomerById(id);
  }

  // 删除客户（软删除）
  async deleteCustomer(id) {
    const sql = `UPDATE customers SET status = 0 WHERE id = ?`;
    await this.db.query(sql, [id]);
  }

  // 搜索客户
  async searchCustomers(keyword) {
    const sql = `
      SELECT id, name, contact, phone, address, latitude, longitude, create_time, update_time, remark
      FROM customers 
      WHERE status = 1 AND (
        name LIKE ? OR 
        contact LIKE ? OR 
        phone LIKE ? OR 
        address LIKE ?
      )
      ORDER BY create_time DESC
    `;
    const searchTerm = `%${keyword}%`;
    return await this.db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);
  }
}

// 拜访记录数据操作类
class VisitDAO {
  constructor(db) {
    this.db = db;
  }

  // 获取所有拜访记录
  async getAllVisits() {
    const sql = `
      SELECT v.*, c.name as customer_name, c.contact, c.phone
      FROM visits v
      LEFT JOIN customers c ON v.customer_id = c.id
      WHERE v.status = 1
      ORDER BY v.visit_time DESC
    `;
    return await this.db.query(sql);
  }

  // 根据ID获取拜访记录
  async getVisitById(id) {
    const sql = `
      SELECT v.*, c.name as customer_name, c.contact, c.phone
      FROM visits v
      LEFT JOIN customers c ON v.customer_id = c.id
      WHERE v.id = ? AND v.status = 1
    `;
    const result = await this.db.query(sql, [id]);
    return result[0] || null;
  }

  // 创建拜访记录
  async createVisit(visitData) {
    const {
      id, customer_id, visit_time, development, development_method,
      order_info, problem, solution, case_info, inventory, shipping,
      foundation, replenishment, training, wechat, tools, feedback,
      photos, custom_fields
    } = visitData;
    
    const sql = `
      INSERT INTO visits (
        id, customer_id, visit_time, development, development_method,
        order_info, problem, solution, case_info, inventory, shipping,
        foundation, replenishment, training, wechat, tools, feedback,
        photos, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.query(sql, [
      id, customer_id, visit_time, JSON.stringify(development), development_method,
      order_info, problem, solution, case_info, inventory, shipping,
      foundation, replenishment, training, wechat, tools, feedback,
      JSON.stringify(photos), JSON.stringify(custom_fields)
    ]);
    
    return await this.getVisitById(id);
  }

  // 获取今日拜访记录
  async getTodayVisits() {
    const sql = `
      SELECT v.*, c.name as customer_name, c.contact, c.phone
      FROM visits v
      LEFT JOIN customers c ON v.customer_id = c.id
      WHERE v.status = 1 AND DATE(v.visit_time) = CURDATE()
      ORDER BY v.visit_time DESC
    `;
    return await this.db.query(sql);
  }

  // 根据客户ID获取拜访记录
  async getVisitsByCustomerId(customerId) {
    const sql = `
      SELECT * FROM visits
      WHERE customer_id = ? AND status = 1
      ORDER BY visit_time DESC
    `;
    return await this.db.query(sql, [customerId]);
  }
}

// 打卡记录数据操作类
class CheckinDAO {
  constructor(db) {
    this.db = db;
  }

  // 创建打卡记录
  async createCheckin(checkinData) {
    const {
      id, customer_id, checkin_time, latitude, longitude,
      address, photos, remark
    } = checkinData;
    
    const sql = `
      INSERT INTO checkins (
        id, customer_id, checkin_time, latitude, longitude,
        address, photos, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.query(sql, [
      id, customer_id, checkin_time, latitude, longitude,
      address, JSON.stringify(photos), remark
    ]);
  }

  // 获取今日打卡记录
  async getTodayCheckins() {
    const sql = `
      SELECT c.*, cu.name as customer_name
      FROM checkins c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE c.status = 1 AND DATE(c.checkin_time) = CURDATE()
      ORDER BY c.checkin_time DESC
    `;
    return await this.db.query(sql);
  }
}

// 统计数据操作类
class StatisticsDAO {
  constructor(db) {
    this.db = db;
  }

  // 获取今日统计数据
  async getTodayStatistics() {
    const sql = `SELECT * FROM today_statistics`;
    const result = await this.db.query(sql);
    return result[0] || {
      new_customers: 0,
      today_visits: 0,
      today_checkins: 0,
      today_photos: 0
    };
  }

  // 获取客户拜访统计
  async getCustomerVisitStats(customerId) {
    const sql = `CALL GetCustomerVisitStats(?)`;
    const result = await this.db.query(sql, [customerId]);
    return result[0] || null;
  }
}

// 导出数据库实例和DAO类
const db = new Database();
const customerDAO = new CustomerDAO(db);
const visitDAO = new VisitDAO(db);
const checkinDAO = new CheckinDAO(db);
const statisticsDAO = new StatisticsDAO(db);

module.exports = {
  Database,
  db,
  customerDAO,
  visitDAO,
  checkinDAO,
  statisticsDAO,
  dbConfig
};