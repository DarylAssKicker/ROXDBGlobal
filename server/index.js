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
// 获取访问次数（按每日IP去重统计）
app.get('/api/stats/visits', async (req, res) => {
  try {
    const totalVisits = await redisClient.get('ROXDBGlobal:site:visits') || '0';
    const today = new Date().toISOString().split('T')[0];
    const dailyVisits = await redisClient.get(`ROXDBGlobal:daily:visits:${today}`) || '0';
    
    res.json({ 
      totalVisits: parseInt(totalVisits),
      dailyVisits: parseInt(dailyVisits),
      date: today,
      // 为了兼容性保留原字段
      visits: parseInt(totalVisits)
    });
  } catch (error) {
    console.error('Error getting visits:', error);
    res.status(500).json({ error: 'Failed to get visit count' });
  }
});

// 记录访问次数（每次访问都记录，但客户端显示时按每日去重）
app.post('/api/stats/visit', async (req, res) => {
  try {
    // 获取客户端IP地址
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const cleanIP = clientIP.replace(/^::ffff:/, '').replace(/:\d+$/, '');
    const today = new Date().toISOString().split('T')[0];
    const dailyVisitKey = `ROXDBGlobal:daily:ip:${cleanIP}:${today}`;
    const ipStatsKey = `ROXDBGlobal:ip:stats:${cleanIP}`;
    const ipListKey = 'ROXDBGlobal:ip:list';
    const currentTime = new Date().toISOString();
    
    // 检查该IP今天是否已经访问过（用于去重统计）
    const hasVisitedToday = await redisClient.exists(dailyVisitKey);
    let isNewDailyVisit = false;
    
    if (!hasVisitedToday) {
      // 标记该IP今天已访问，设置过期时间到明天凌晨
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const secondsUntilTomorrow = Math.floor((tomorrow.getTime() - Date.now()) / 1000);
      
      await redisClient.setEx(dailyVisitKey, secondsUntilTomorrow, '1');
      
      // 增加总访问量（按每日IP去重）
      await redisClient.incr('ROXDBGlobal:site:visits');
      await redisClient.persist('ROXDBGlobal:site:visits');
      
      // 增加今日访问量（按每日IP去重）
      const dailyKey = `ROXDBGlobal:daily:visits:${today}`;
      await redisClient.incr(dailyKey);
      await redisClient.expire(dailyKey, 604800); // 7天后过期
      
      isNewDailyVisit = true;
    }
    
    // 无论是否是新的每日访问，都要记录IP的访问次数
    const ipStats = await redisClient.hGetAll(ipStatsKey);
    
    if (Object.keys(ipStats).length === 0) {
      // 首次访问该IP - 初始化持久化数据
      await redisClient.hSet(ipStatsKey, {
        ip: cleanIP,
        totalVisits: '1',
        firstVisit: currentTime,
        lastVisit: currentTime
      });
      // 添加到IP列表（持久化）
      await redisClient.sAdd(ipListKey, cleanIP);
    } else {
      // 增加总访问次数，更新最后访问时间（持久化更新）
      // 兼容旧数据：支持 visitCount 字段迁移到 totalVisits
      const currentTotal = parseInt(ipStats.totalVisits || ipStats.visitCount || '0');
      await redisClient.hSet(ipStatsKey, {
        totalVisits: (currentTotal + 1).toString(),
        lastVisit: currentTime
      });
    }
    
    // 记录该IP今日的访问次数（不去重）
    const ipDailyKey = `ROXDBGlobal:ip:daily:${cleanIP}:${today}`;
    await redisClient.incr(ipDailyKey);
    await redisClient.expire(ipDailyKey, 172800); // 48小时后过期
    
    // 确保IP统计数据永不过期（持久化）
    await redisClient.persist(ipStatsKey);
    await redisClient.persist(ipListKey);
    
    // 获取当前统计数据
    const totalVisits = await redisClient.get('ROXDBGlobal:site:visits') || '0';
    const dailyVisits = await redisClient.get(`ROXDBGlobal:daily:visits:${today}`) || '0';
    
    // 获取IP统计，兼容旧字段名
    const updatedIpStats = await redisClient.hGetAll(ipStatsKey);
    const ipTotalVisits = updatedIpStats.totalVisits || updatedIpStats.visitCount || '1';
    const ipDailyVisits = await redisClient.get(ipDailyKey) || '1';
    
    res.json({ 
      totalVisits: parseInt(totalVisits),
      dailyVisits: parseInt(dailyVisits),
      clientIP: cleanIP,
      isNewDailyVisit,
      ipStats: {
        totalVisits: parseInt(ipTotalVisits),
        dailyVisits: parseInt(ipDailyVisits)
      }
    });
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({ error: 'Failed to record visit' });
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
        
        // 兼容旧数据：支持 visitCount 字段迁移到 totalVisits
        const totalVisits = parseInt(stats.totalVisits || stats.visitCount || '0');
        
        ipStats.push({
          ip: stats.ip,
          totalVisits: totalVisits,
          todayVisits: parseInt(todayVisits),
          firstVisit: stats.firstVisit,
          lastVisit: stats.lastVisit
        });
      }
    }
    
    // 按总访问次数降序排序
    ipStats.sort((a, b) => b.totalVisits - a.totalVisits);
    
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
        totalVisits: stats.totalVisits || stats.visitCount || '0'
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