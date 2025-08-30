const express = require('express');
const cors = require('cors');
const redis = require('redis');
require('dotenv').config(); // 加载环境变量
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 信任代理，用于获取真实IP地址
app.set('trust proxy', true);

// Redis 客户端配置
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD || undefined
});

// Redis 连接处理
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// 连接到 Redis
redisClient.connect().catch(console.error);

// 访问统计 API
// 获取访问次数
app.get('/api/stats/visits', async (req, res) => {
  try {
    const visits = await redisClient.get('ROXDBGlobal:site:visits') || '0';
    const today = new Date().toISOString().split('T')[0];
    const dailyVisits = await redisClient.get(`ROXDBGlobal:daily:visits:${today}`) || '0';
    
    res.json({ 
      visits: parseInt(visits),
      dailyVisits: parseInt(dailyVisits),
      date: today
    });
  } catch (error) {
    console.error('Error getting visits:', error);
    res.status(500).json({ error: 'Failed to get visit count' });
  }
});

// 增加访问次数（基于IP去重）
app.post('/api/stats/visit', async (req, res) => {
  try {
    // 获取客户端IP地址
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const cleanIP = clientIP.replace(/^::ffff:/, '').replace(/:\d+$/, '');
    const visitKey = `ROXDBGlobal:visit:${cleanIP}`;
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `ROXDBGlobal:daily:visits:${today}`;
    const ipStatsKey = `ROXDBGlobal:ip:stats:${cleanIP}`;
    const ipListKey = 'ROXDBGlobal:ip:list';
    const ipDailyKey = `ROXDBGlobal:ip:daily:${cleanIP}:${today}`;
    
    // 检查该IP今天是否已经访问过
    const hasVisited = await redisClient.exists(visitKey);
    
    if (!hasVisited) {
      // 设置IP访问标记，24小时过期
      await redisClient.setEx(visitKey, 86400, '1');
      // 增加总访问量（持久化）
      const visits = await redisClient.incr('ROXDBGlobal:site:visits');
      // 确保总访问量永不过期
      await redisClient.persist('ROXDBGlobal:site:visits');
      
      // 增加今日访问量
      await redisClient.incr(dailyKey);
      // 设置今日访问量过期时间（7天后过期，用于统计）
      await redisClient.expire(dailyKey, 604800);
      
      // 增加该IP的今日访问次数
      await redisClient.incr(ipDailyKey);
      // 设置IP今日访问量过期时间（48小时后过期）
      await redisClient.expire(ipDailyKey, 172800);
      
      // 记录IP访问统计（持久化存储）
      const currentTime = new Date().toISOString();
      const ipStats = await redisClient.hGetAll(ipStatsKey);
      
      if (Object.keys(ipStats).length === 0) {
        // 首次访问该IP - 初始化持久化数据
        await redisClient.hSet(ipStatsKey, {
          ip: cleanIP,
          visitCount: '1',
          firstVisit: currentTime,
          lastVisit: currentTime
        });
        // 添加到IP列表（持久化）
        await redisClient.sAdd(ipListKey, cleanIP);
      } else {
        // 增加访问次数，更新最后访问时间（持久化更新）
        await redisClient.hSet(ipStatsKey, {
          visitCount: (parseInt(ipStats.visitCount) + 1).toString(),
          lastVisit: currentTime
        });
      }
      
      // 确保IP统计数据永不过期（持久化）
      await redisClient.persist(ipStatsKey);
      await redisClient.persist(ipListKey);
      
      res.json({ visits, newVisit: true, clientIP: cleanIP });
    } else {
      // 获取当前访问量但不增加
      const visits = await redisClient.get('ROXDBGlobal:site:visits') || '0';
      res.json({ visits: parseInt(visits), newVisit: false, clientIP: cleanIP });
    }
  } catch (error) {
    console.error('Error incrementing visits:', error);
    res.status(500).json({ error: 'Failed to increment visit count' });
  }
});

// 获取IP访问统计
app.get('/api/stats/ip-visits', async (req, res) => {
  try {
    const ipListKey = 'ROXDBGlobal:ip:list';
    const ipList = await redisClient.sMembers(ipListKey);
    const today = new Date().toISOString().split('T')[0];
    
    const ipStats = [];
    for (const ip of ipList) {
      const ipStatsKey = `ROXDBGlobal:ip:stats:${ip}`;
      const dailyVisitKey = `ROXDBGlobal:ip:daily:${ip}:${today}`;
      const stats = await redisClient.hGetAll(ipStatsKey);
      
      if (Object.keys(stats).length > 0) {
        // 获取今日访问次数
        const todayVisits = await redisClient.get(dailyVisitKey) || '0';
        
        ipStats.push({
          ip: stats.ip,
          visitCount: parseInt(stats.visitCount),
          todayVisits: parseInt(todayVisits),
          firstVisit: stats.firstVisit,
          lastVisit: stats.lastVisit
        });
      }
    }
    
    // 按总访问次数降序排序
    ipStats.sort((a, b) => b.visitCount - a.visitCount);
    
    res.json({ 
      totalIPs: ipStats.length,
      date: today,
      ipStats: ipStats
    });
  } catch (error) {
    console.error('Error getting IP visits:', error);
    res.status(500).json({ error: 'Failed to get IP visit statistics' });
  }
});

// 数据持久化状态检查
app.get('/api/stats/persistence-status', async (req, res) => {
  try {
    const siteVisitsKey = 'ROXDBGlobal:site:visits';
    const ipListKey = 'ROXDBGlobal:ip:list';
    
    // 检查关键数据的TTL
    const siteVisitsTTL = await redisClient.ttl(siteVisitsKey);
    const ipListTTL = await redisClient.ttl(ipListKey);
    
    // 获取IP列表并检查每个IP的数据持久化状态
    const ipList = await redisClient.sMembers(ipListKey);
    const ipPersistenceStatus = [];
    
    for (const ip of ipList) {
      const ipStatsKey = `ROXDBGlobal:ip:stats:${ip}`;
      const ttl = await redisClient.ttl(ipStatsKey);
      const stats = await redisClient.hGetAll(ipStatsKey);
      
      ipPersistenceStatus.push({
        ip,
        isPersistent: ttl === -1,
        ttl: ttl,
        visitCount: stats.visitCount || '0'
      });
    }
    
    res.json({
      siteVisits: {
        key: siteVisitsKey,
        isPersistent: siteVisitsTTL === -1,
        ttl: siteVisitsTTL,
        value: await redisClient.get(siteVisitsKey) || '0'
      },
      ipList: {
        key: ipListKey,
        isPersistent: ipListTTL === -1,
        ttl: ipListTTL,
        count: ipList.length
      },
      ipStats: ipPersistenceStatus
    });
  } catch (error) {
    console.error('Error checking persistence status:', error);
    res.status(500).json({ error: 'Failed to check persistence status' });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});