@echo off
chcp 65001 >nul
echo ROX Database V2 Docker 部署脚本
echo.

set DEPLOY_METHOD=%1
set ENVIRONMENT=%2

if "%DEPLOY_METHOD%"=="" set DEPLOY_METHOD=compose
if "%ENVIRONMENT%"=="" set ENVIRONMENT=prod

if "%1"=="-h" goto :usage
if "%1"=="--help" goto :usage
if "%1"=="/?" goto :usage

echo 开始构建和部署 ROX Database V2...
echo 部署方式: %DEPLOY_METHOD%
echo 环境: %ENVIRONMENT%
echo.
goto :main

:usage
echo 使用方法: %0 [compose^|docker] [dev^|prod]
echo   compose: 使用 docker-compose 部署
echo   docker:  使用 docker 命令部署
echo   dev:     开发环境模式
echo   prod:    生产环境模式（默认）
echo.
echo 示例:
echo   %0 compose dev    # 使用 docker-compose 开发环境
echo   %0 compose        # 使用 docker-compose 生产环境
echo   %0 docker         # 使用 docker 命令生产环境
pause
exit /b 0

:main

REM 检查Docker是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo 错误: Docker 未运行，请先启动 Docker
    pause
    exit /b 1
)

REM 拉取最新代码
echo 拉取最新代码...
REM 检查上级目录是否为Git仓库
if exist "../.git" (
    echo 检测到上级目录为Git仓库，切换到上级目录拉取代码...
    cd ..
    git pull
    if errorlevel 1 (
        echo 警告: 代码拉取失败，继续使用当前代码
    ) else (
        echo 代码更新成功!
    )
    cd web2
) else (
    git rev-parse --git-dir >nul 2>&1
    if errorlevel 1 (
        echo 警告: 当前目录和上级目录都不是Git仓库，跳过代码拉取
    ) else (
        git pull
        if errorlevel 1 (
            echo 警告: 代码拉取失败，继续使用当前代码
        ) else (
            echo 代码更新成功!
        )
    )
)
echo.

if "%DEPLOY_METHOD%"=="compose" (
    REM 使用 docker-compose 部署
    if "%ENVIRONMENT%"=="dev" (
        echo 使用 docker-compose 开发环境部署...
        set COMPOSE_FILE=docker-compose.dev.yml
        set SERVICE_NAME=web2-dev
        set PORT=3000
    ) else (
        echo 使用 docker-compose 生产环境部署...
        set COMPOSE_FILE=docker-compose.yml
        set SERVICE_NAME=web2
        set PORT=3000
    )
    
    REM 检查 docker-compose 是否可用
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo 错误: docker-compose 未安装
        pause
        exit /b 1
    )
    
    REM 停止现有服务
    echo 停止现有服务...
    docker-compose -f %COMPOSE_FILE% down 2>nul
    
    REM 构建并启动服务
    echo 构建并启动服务...
    docker-compose -f %COMPOSE_FILE% up -d --build
    
    if errorlevel 1 (
        echo 部署失败!
        pause
        exit /b 1
    ) else (
        echo 部署成功!
        echo 应用已启动，访问地址: http://localhost:%PORT%
        echo 服务名称: %SERVICE_NAME%
        echo 查看日志: docker-compose -f %COMPOSE_FILE% logs -f
        echo 停止服务: docker-compose -f %COMPOSE_FILE% down
    )
    
) else (
    REM 使用 docker 命令部署
    echo 使用 Docker 命令部署...
    
    REM 构建镜像
    echo 正在构建 Docker 镜像...
    if "%ENVIRONMENT%"=="dev" (
        docker build -f Dockerfile.dev --target development -t rox-web2:dev .
        set IMAGE_TAG=rox-web2:dev
        set CONTAINER_NAME=rox-web2-dev
        set PORT_MAPPING=-p 3000:3000 -p 24678:24678
        set ENV_VARS=-e NODE_ENV=development
    ) else (
        docker build -t rox-web2:latest .
        set IMAGE_TAG=rox-web2:latest
        set CONTAINER_NAME=rox-web2
        set PORT_MAPPING=-p 3000:80
        set ENV_VARS=-e NODE_ENV=production
    )
    
    if errorlevel 1 (
        echo 镜像构建失败!
        pause
        exit /b 1
    ) else (
        echo 镜像构建成功!
    )
    
    REM 停止并删除现有容器（如果存在）
    echo 清理现有容器...
    docker stop %CONTAINER_NAME% 2>nul
    docker rm %CONTAINER_NAME% 2>nul
    
    REM 运行容器
    echo 启动容器...
    if "%ENVIRONMENT%"=="dev" (
        docker run -d --name %CONTAINER_NAME% %PORT_MAPPING% %ENV_VARS% -v "%cd%:/app" -v "/app/node_modules" --restart unless-stopped %IMAGE_TAG%
    ) else (
        docker run -d --name %CONTAINER_NAME% %PORT_MAPPING% %ENV_VARS% --restart unless-stopped %IMAGE_TAG%
    )
    
    if errorlevel 1 (
        echo 部署失败!
        pause
        exit /b 1
    ) else (
        echo 部署成功!
        echo 应用已启动，访问地址: http://localhost:3000
        echo 容器名称: %CONTAINER_NAME%
        echo 查看日志: docker logs -f %CONTAINER_NAME%
    )
)

echo.
echo 部署完成!
pause