import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export async function initDB() {
  try {
    const db = await open({
      filename: './data/db.db',
      driver: sqlite3.Database
    })

    // 创建users表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        permission TEXT DEFAULT 'user',
        points INTEGER DEFAULT 1,
        invite_code TEXT,
        invited_by INTEGER,
        last_sign TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS points_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        points INTEGER,
        reason TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS exchange_codes (
        code TEXT PRIMARY KEY,        -- 兑换码
        points INTEGER,               -- 积分数
        used INTEGER DEFAULT 0,       -- 是否已使用，0表示未使用，1表示已使用
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 创建时间
      );
    `)

    logger.info('数据库初始化完成')
    return db
  } catch (err) {
    logger.error('数据库初始化失败:', err)
    throw err
  }
}
