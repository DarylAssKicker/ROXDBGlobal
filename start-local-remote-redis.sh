#!/bin/bash

echo "===================================="
echo "ROX Database 本地开发环境启动脚本"
echo "(使用远程 Redis)"
echo "===================================="
echo

echo "检查环境配置..."
if [ ! -f "server/.env" ]; then
    echo "[警告] 未找到 server/.env 文件！"
    echo
    echo "请按照以下步骤配置:"
    echo "1. 复制 server/.env.example 为 server/.env"
    echo "2. 编辑 server/.env 文件，填入你的远程 Redis 连接信息:"
    echo "   REDIS_HOST=your-redis-host.com"
    echo "   REDIS_PORT=6379"
    echo "   REDIS_PASSWORD=your-redis-password"
    echo
    echo "正在为你创建默认配置文件..."
    cp "server/.env.example" "server/.env"
    echo "[✓] 已创建 server/.env 文件，请编辑后重新运行此脚本"
    echo
    read -p "按回车键继续..."
    exit 1
fi

echo "[✓] 环境配置文件存在"
echo

echo "安装后端依赖..."
cd server
npm install > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[错误] 后端依赖安装失败！"
    read -p "按回车键继续..."
    exit 1
fi
cd ..
echo "[✓] 后端依赖安装完成"

echo
echo "安装前端依赖..."
npm install > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[错误] 前端依赖安装失败！"
    read -p "按回车键继续..."
    exit 1
fi
echo "[✓] 前端依赖安装完成"

echo
echo "启动后端 API 服务器..."
gnome-terminal --title="ROX API Server (Remote Redis)" -- bash -c "cd server && npm run dev; exec bash" 2>/dev/null || \
xterm -title "ROX API Server (Remote Redis)" -e "cd server && npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/server && npm run dev"' 2>/dev/null || \
(cd server && npm run dev &)

echo "等待后端服务器启动..."
sleep 3

echo
echo "启动前端开发服务器..."
gnome-terminal --title="ROX Frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "ROX Frontend" -e "npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm run dev"' 2>/dev/null || \
(npm run dev &)

echo
echo "===================================="
echo "服务启动完成！"
echo "===================================="
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:3001"
echo "API健康检查: http://localhost:3001/health"
echo "===================================="
echo
echo "注意: 请确保你的远程 Redis 服务器可以正常连接"
echo "如果连接失败，请检查 server/.env 文件中的配置"
echo
echo "按回车键关闭..."
read