#!/bin/bash

echo "🚀 ROX新启航资料库 v2.0 启动脚本"
echo "=================================="

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js >= 16.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ 错误: Node.js版本过低，当前版本: $(node -v)，需要: >= 16.0.0"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到npm"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已存在"
fi

# 启动开发服务器
echo ""
echo "🌟 启动开发服务器..."
echo "📱 访问地址: http://localhost:3000"
echo "🔥 支持热模块替换，代码修改后会自动刷新"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

npm run dev