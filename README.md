# 基于可视化积木编程的深度学习教学平台

项目改进自开源项目[ENNUI](https://github.com/martinjm97/ENNUI)，它允许用户：

1. 使用拖放界面构建神经网络架构。
2. 循序渐进地学习神经网络搭建方法。
3. 在浏览器中训练这些网络。
4. 可视化训练过程。
5. 导出至Python。

## 项目结构

```
bbvdle/
├── dist/
├── resources/
├── src/
    ├──ui/              # 前端组件
                        样式、按钮逻辑以及可拖动的组件
                        （例如层和激活函数）    
    ├──model/           #后端组件
                        支持构建神经网络、
                        代码生成以及在浏览器中保存状态的核心功能
└── README.md           # 项目说明文件
```

## 1. 安装Nodejs及其他必要包

### Windows

直接运行安装 node-v13.14.0-x64.msi 文件

### Linux安装
项目部署在AWS EC2上，使用系统为Amazon Linux 2 AMI。

```cmd
sudo yum update -y
sudo yum install git -y
//// 安装Nodejs
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm use --install-if-missing 13
```

## 2. 克隆仓库

```cmd
git clone --recursive https://github.com/sunyia123/bbvdle.git
```

## 3. 构建应用程序

```cmd
npm install
```

## 4. 启动项目

```cmd
npm run build
```

## 5. 部署项目

```cmd
// 安装Apache
sudo yum install -y httpd
// 复制文件至根目录
sudo cp -r /home/ec2-user/bbvdle/* /var/www/html/
// 配置Apache
sudo systemctl reload httpd
// 启动Apache
sudo systemctl start httpd
// 设置开机自启
sudo systemctl enable httpd
```
