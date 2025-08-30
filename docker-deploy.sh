#!/bin/bash

# ROX Database V2 Docker 部署脚本

USAGE=$(cat << 'EOF'
使用方法: $0 [compose|docker] [dev|prod]
  compose: 使用 docker-compose 部署
  docker:  使用 docker 命令部署
  dev:     开发环境模式
  prod:    生产环境模式（默认）

示例:
  $0 compose dev    # 使用 docker-compose 开发环境
  $0 compose        # 使用 docker-compose 生产环境
  $0 docker         # 使用 docker 命令生产环境
EOF
)

DEPLOY_METHOD=${1:-compose}
ENVIRONMENT=${2:-prod}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "$USAGE"
    exit 0
fi

echo "开始构建和部署 ROX Database V2..."
echo "部署方式: $DEPLOY_METHOD"
echo "环境: $ENVIRONMENT"
echo

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker 未运行，请先启动 Docker"
    exit 1
fi

# 拉取最新代码
echo "拉取最新代码..."
# 检查上级目录是否为Git仓库
if [ -d "../.git" ]; then
    echo "检测到上级目录为Git仓库，切换到上级目录拉取代码..."
    cd ..
    git pull
    if [ $? -eq 0 ]; then
        echo "代码更新成功!"
    else
        echo "警告: 代码拉取失败，继续使用当前代码"
    fi
    cd web2
elif git rev-parse --git-dir > /dev/null 2>&1; then
    git pull
    if [ $? -eq 0 ]; then
        echo "代码更新成功!"
    else
        echo "警告: 代码拉取失败，继续使用当前代码"
    fi
else
    echo "警告: 当前目录和上级目录都不是Git仓库，跳过代码拉取"
fi
echo

if [ "$DEPLOY_METHOD" = "compose" ]; then
    # 使用 docker-compose 部署
    if [ "$ENVIRONMENT" = "dev" ]; then
        echo "使用 docker-compose 开发环境部署..."
        COMPOSE_FILE="docker-compose.dev.yml"
        SERVICE_NAME="web2-dev"
        PORT="3000"
    else
        echo "使用 docker-compose 生产环境部署..."
        COMPOSE_FILE="docker-compose.yml"
        SERVICE_NAME="web2"
        PORT="3000"
    fi
    
    # 检查 docker-compose 是否可用
    if ! command -v docker-compose > /dev/null 2>&1; then
        echo "错误: docker-compose 未安装"
        exit 1
    fi
    
    # 构建镜像
    echo "构建镜像..."
    docker-compose -f $COMPOSE_FILE build
    
    if [ $? -eq 0 ]; then
        echo "镜像构建成功!"
    else
        echo "镜像构建失败!"
        exit 1
    fi
    
    # 停止现有服务
    echo "停止现有服务..."
    docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
    
    # 启动服务
    echo "启动服务..."
    docker-compose -f $COMPOSE_FILE up -d
    
    if [ $? -eq 0 ]; then
        echo "部署成功!"
        echo "应用已启动，访问地址: http://localhost:$PORT"
        echo "服务名称: $SERVICE_NAME"
        echo "查看日志: docker-compose -f $COMPOSE_FILE logs -f"
        echo "停止服务: docker-compose -f $COMPOSE_FILE down"
    else
        echo "部署失败!"
        exit 1
    fi
    
else
    # 使用 docker 命令部署
    echo "使用 Docker 命令部署..."
    
    # 设置变量
    if [ "$ENVIRONMENT" = "dev" ]; then
        IMAGE_TAG="rox-web2:dev"
        CONTAINER_NAME="rox-web2-dev"
        PORT_MAPPING="-p 3000:3000 -p 24678:24678"
        ENV_VARS="-e NODE_ENV=development"
    else
        IMAGE_TAG="rox-web2:latest"
        CONTAINER_NAME="rox-web2"
        PORT_MAPPING="-p 3000:80"
        ENV_VARS="-e NODE_ENV=production"
    fi
    
    # 构建镜像
    echo "正在构建 Docker 镜像..."
    if [ "$ENVIRONMENT" = "dev" ]; then
        docker build -f Dockerfile.dev --target development -t $IMAGE_TAG .
    else
        docker build -t $IMAGE_TAG .
    fi
    
    if [ $? -eq 0 ]; then
        echo "镜像构建成功!"
    else
        echo "镜像构建失败!"
        exit 1
    fi
    
    # 停止并删除现有容器（如果存在）
    echo "清理现有容器..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # 运行容器
    echo "启动容器..."
    if [ "$ENVIRONMENT" = "dev" ]; then
        docker run -d \
            --name $CONTAINER_NAME \
            $PORT_MAPPING \
            $ENV_VARS \
            -v "$(pwd):/app" \
            -v "/app/node_modules" \
            --restart unless-stopped \
            $IMAGE_TAG
    else
        docker run -d \
            --name $CONTAINER_NAME \
            $PORT_MAPPING \
            $ENV_VARS \
            --restart unless-stopped \
            $IMAGE_TAG
    fi
    
    if [ $? -eq 0 ]; then
        echo "部署成功!"
        echo "应用已启动，访问地址: http://localhost:3000"
        echo "容器名称: $CONTAINER_NAME"
        echo "查看日志: docker logs -f $CONTAINER_NAME"
    else
        echo "部署失败!"
        exit 1
    fi
fi

echo "部署完成!"