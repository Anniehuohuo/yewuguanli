-- 客户关系管理系统 MySQL 数据库表结构设计
-- 创建数据库
CREATE DATABASE IF NOT EXISTS crm_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_system;

-- 1. 客户表 (customers)
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY COMMENT '客户ID',
    name VARCHAR(200) NOT NULL COMMENT '客户名称',
    contact VARCHAR(100) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    address TEXT COMMENT '客户地址',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    longitude DECIMAL(10, 7) COMMENT '经度',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    remark TEXT COMMENT '备注信息',
    INDEX idx_name (name),
    INDEX idx_phone (phone),
    INDEX idx_create_time (create_time),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户信息表';

-- 2. 拜访记录表 (visits)
CREATE TABLE visits (
    id VARCHAR(50) PRIMARY KEY COMMENT '拜访记录ID',
    customer_id VARCHAR(50) NOT NULL COMMENT '客户ID',
    visit_time DATETIME NOT NULL COMMENT '拜访时间',
    development JSON COMMENT '开发情况：["city", "light"]',
    development_method TEXT COMMENT '开发方式',
    order_info TEXT COMMENT '开单情况',
    problem TEXT COMMENT '问题描述',
    solution TEXT COMMENT '解决方案',
    case_info TEXT COMMENT '案例信息',
    inventory TEXT COMMENT '库存情况',
    shipping TEXT COMMENT '发货情况',
    foundation TEXT COMMENT '基础情况',
    replenishment TEXT COMMENT '补货情况',
    training TEXT COMMENT '培训情况',
    wechat TEXT COMMENT '微信沟通',
    tools TEXT COMMENT '工具支持',
    feedback TEXT COMMENT '客户反馈',
    photos JSON COMMENT '照片列表：["photo1.jpg", "photo2.jpg"]',
    custom_fields JSON COMMENT '自定义字段',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_visit_time (visit_time),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拜访记录表';

-- 3. 打卡记录表 (checkins)
CREATE TABLE checkins (
    id VARCHAR(50) PRIMARY KEY COMMENT '打卡记录ID',
    customer_id VARCHAR(50) COMMENT '关联客户ID',
    checkin_time DATETIME NOT NULL COMMENT '打卡时间',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    longitude DECIMAL(10, 7) COMMENT '经度',
    address TEXT COMMENT '打卡地址',
    photos JSON COMMENT '打卡照片：["photo1.jpg", "photo2.jpg"]',
    remark TEXT COMMENT '打卡备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_checkin_time (checkin_time),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡记录表';

-- 4. 用户表 (users) - 如果需要多用户支持
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    real_name VARCHAR(100) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role ENUM('admin', 'user') DEFAULT 'user' COMMENT '角色：admin-管理员，user-普通用户',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_time DATETIME COMMENT '最后登录时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    INDEX idx_username (username),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 5. 系统配置表 (system_config)
CREATE TABLE system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(255) COMMENT '配置描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 插入一些初始配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('app_name', 'CRM客户管理系统', '应用名称'),
('version', '1.0.0', '系统版本'),
('max_photo_size', '5242880', '最大照片大小（字节）'),
('photo_formats', '["jpg", "jpeg", "png"]', '支持的照片格式');

-- 创建视图：今日统计
CREATE VIEW today_statistics AS
SELECT 
    (SELECT COUNT(*) FROM customers WHERE DATE(create_time) = CURDATE()) as new_customers,
    (SELECT COUNT(*) FROM visits WHERE DATE(visit_time) = CURDATE()) as today_visits,
    (SELECT COUNT(*) FROM checkins WHERE DATE(checkin_time) = CURDATE()) as today_checkins,
    (SELECT COALESCE(SUM(JSON_LENGTH(photos)), 0) FROM checkins WHERE DATE(checkin_time) = CURDATE() AND photos IS NOT NULL) as today_photos;

-- 创建存储过程：获取客户拜访统计
DELIMITER //
CREATE PROCEDURE GetCustomerVisitStats(IN customer_id VARCHAR(50))
BEGIN
    SELECT 
        c.name as customer_name,
        c.contact,
        c.phone,
        COUNT(v.id) as total_visits,
        MAX(v.visit_time) as last_visit_time,
        COUNT(CASE WHEN DATE(v.visit_time) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as visits_last_30_days
    FROM customers c
    LEFT JOIN visits v ON c.id = v.customer_id AND v.status = 1
    WHERE c.id = customer_id AND c.status = 1
    GROUP BY c.id, c.name, c.contact, c.phone;
END //
DELIMITER ;

-- 创建触发器：更新客户最后拜访时间（如果需要在客户表中冗余存储）
-- ALTER TABLE customers ADD COLUMN last_visit_time DATETIME COMMENT '最后拜访时间';
-- 
-- DELIMITER //
-- CREATE TRIGGER update_customer_last_visit
-- AFTER INSERT ON visits
-- FOR EACH ROW
-- BEGIN
--     UPDATE customers 
--     SET last_visit_time = NEW.visit_time 
--     WHERE id = NEW.customer_id;
-- END //
-- DELIMITER ;