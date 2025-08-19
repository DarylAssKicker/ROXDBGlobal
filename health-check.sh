#!/bin/bash

# ROX Database V2 健康检查脚本

CONTAINER_NAME="rox-web2"
HEALTH_URL="http://localhost:3000"

echo "=== ROX Database V2 健康检查 ==="
echo "时间: $(date)"
echo

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行"
    exit 1
fi

# 检查容器是否存在
if ! docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ 容器 ${CONTAINER_NAME} 不存在"
    echo "请先运行部署脚本: ./docker-deploy.sh"
    exit 1
fi

# 检查容器是否运行
if ! docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ 容器 ${CONTAINER_NAME} 未运行"
    echo "尝试启动容器..."
    docker start ${CONTAINER_NAME}
    sleep 5
fi

# 检查容器状态
CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' ${CONTAINER_NAME} 2>/dev/null)
echo "📦 容器状态: ${CONTAINER_STATUS}"

if [ "$CONTAINER_STATUS" != "running" ]; then
    echo "❌ 容器未正常运行"
    echo "查看容器日志:"
    docker logs --tail 20 ${CONTAINER_NAME}
    exit 1
fi

# 检查端口是否监听
if command -v netstat > /dev/null; then
    if netstat -tuln | grep -q ":3000 "; then
        echo "✅ 端口 3000 正在监听"
    else
        echo "⚠️  端口 3000 未监听"
    fi
fi

# 检查HTTP响应
echo "🌐 检查HTTP响应..."
if command -v curl > /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${HEALTH_URL} --connect-timeout 10)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ HTTP响应正常 (${HTTP_CODE})"
    else
        echo "❌ HTTP响应异常 (${HTTP_CODE})"
        exit 1
    fi
elif command -v wget > /dev/null; then
    if wget --spider --timeout=10 ${HEALTH_URL} > /dev/null 2>&1; then
        echo "✅ HTTP响应正常"
    else
        echo "❌ HTTP响应异常"
        exit 1
    fi
else
    echo "⚠️  无法检查HTTP响应 (缺少curl或wget)"
fi

# 显示容器资源使用情况
echo
echo "📊 资源使用情况:"
docker stats ${CONTAINER_NAME} --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo
echo "✅ 健康检查完成"
echo "🌍 访问地址: ${HEALTH_URL}"
echo "📋 容器管理: docker logs ${CONTAINER_NAME}"