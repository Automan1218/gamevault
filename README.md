# GameVault - 游戏库管理平台

一个现代化的游戏库管理平台，集成了游戏收藏、订单管理、社区论坛和实时聊天等功能。

## 🎮 项目简介

GameVault 是一个全栈游戏库管理平台，为用户提供：
- 🎯 **游戏库管理** - 管理已购买的游戏和激活码
- 🛒 **订单系统** - 完整的购买流程和订单管理
- 💬 **社区论坛** - 游戏讨论和用户交流
- 💭 **实时聊天** - 用户间实时沟通
- 👨‍💻 **开发者工具** - 开发者专用功能模块

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 15.5.2 (App Router)
- **语言**: TypeScript 5
- **UI 组件**: Ant Design 5.27.2
- **专业组件**: Ant Design Pro Components
- **状态管理**: React Hooks + Context API
- **样式**: CSS Modules + 自定义主题
- **HTTP 客户端**: 自定义 API Client

### 后端技术
- **框架**: Spring Boot
- **数据库**: PostgreSQL
- **缓存**: Redis
- **认证**: JWT
- **容器化**: Docker

## 📂 项目架构

### 前端架构 (Next.js App Router)

```
src/
├── app/                          # Next.js App Router 页面
│   ├── api/                      # Next.js API 路由
│   │   └── auth/                  # 认证相关 API 路由
│   ├── auth/                     # 认证页面
│   │   ├── login/                # 登录页面
│   │   └── register/             # 注册页面
│   ├── dashboard/                # 仪表板页面
│   │   ├── chat/                 # 聊天页面
│   │   ├── developer/            # 开发者工具
│   │   ├── forum/                # 论坛页面
│   │   ├── library/              # 游戏库页面
│   │   ├── orders/               # 订单管理页面
│   │   └── settings/             # 设置页面
│   └── features/                 # 功能模块
│       └── forum/                # 论坛功能模块
│           ├── hooks/            # React Hooks
│           ├── services/        # 业务逻辑服务
│           ├── types/           # 类型定义
│           └── utils/            # 工具函数
├── components/                   # 通用组件
│   ├── auth/                     # 认证相关组件
│   ├── common/                   # 通用组件
│   ├── forms/                    # 表单组件
│   ├── layout/                   # 布局组件
│   ├── modals/                   # 模态框组件
│   └── ui/                       # UI 基础组件
├── config/                       # 配置文件
├── contexts/                     # React Context
├── lib/                          # 工具库
│   ├── api/                      # API 调用封装
│   │   ├── auth.ts               # 认证 API
│   │   ├── client.ts             # HTTP 客户端
│   │   ├── library.ts            # 游戏库 API
│   │   ├── orders.ts             # 订单 API
│   │   ├── posts.ts              # 帖子 API
│   │   ├── users.ts              # 用户 API
│   │   └── index.ts              # 统一导出
│   └── navigation.ts              # 导航工具
└── types/                        # TypeScript 类型定义
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Java 17+
- PostgreSQL 13+
- Redis 6+

### 前端启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 后端启动

```bash
# 使用 Docker Compose 启动数据库
docker-compose up -d

# 启动 Spring Boot 应用
./mvnw spring-boot:run
```

## 🔧 核心功能

### 1. 认证系统
- 用户注册/登录
- JWT 令牌认证
- 密码修改/邮箱修改
- 自动登录状态管理

### 2. 游戏库管理
- 已购买游戏展示
- 激活码管理
- 游戏搜索和筛选
- 游戏详情查看

### 3. 订单系统
- 订单历史查看
- 订单详情展示
- 订单状态跟踪
- 购买记录管理

### 4. 社区论坛
- 帖子发布和管理
- 分类和标签系统
- 搜索功能
- 用户互动

### 5. 实时聊天
- 用户间实时消息
- 聊天室功能
- 消息历史记录

## 📱 页面结构

### 认证页面
- `/auth/login` - 用户登录
- `/auth/register` - 用户注册

### 仪表板页面
- `/dashboard/library` - 游戏库管理
- `/dashboard/orders` - 订单管理
- `/dashboard/forum` - 社区论坛
- `/dashboard/chat` - 实时聊天
- `/dashboard/developer` - 开发者工具
- `/dashboard/settings` - 用户设置

## 🎨 UI/UX 设计

### 设计系统
- **主题**: 深色主题为主，支持浅色模式
- **色彩**: 蓝紫色系 (#6366f1) 作为主色调
- **组件**: 基于 Ant Design 的自定义组件
- **动画**: 流畅的过渡动画和交互效果

### 响应式设计
- 移动端优先设计
- 自适应布局
- 触摸友好的交互

## 🔌 API 架构

### 统一 API 封装
```typescript
// 使用示例
import { AuthApi, LibraryApi, OrdersApi } from '@/lib/api';

// 认证
const user = await AuthApi.getCurrentUser();

// 游戏库
const games = await LibraryApi.getLibrary();

// 订单
const orders = await OrdersApi.getOrders();
```

### API 分类
- **认证 API** (`/api/auth/*`) - 用户认证相关
- **游戏库 API** (`/api/library`) - 游戏库管理
- **订单 API** (`/api/orders/*`) - 订单管理
- **论坛 API** (`/api/forum/*`) - 社区功能

## 🧪 开发规范

### 代码规范
- TypeScript 严格模式
- ESLint 代码检查
- 统一的命名规范
- 组件化开发

### Git 工作流
- 功能分支开发
- 代码审查
- 自动化测试

## 📦 部署

### 前端部署
```bash
# 构建生产版本
npm run build

# 部署到 Vercel/Netlify
vercel deploy
```

### 后端部署
```bash
# 构建 Docker 镜像
docker build -t gamevault-backend .

# 运行容器
docker run -p 8080:8080 gamevault-backend
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Spring Boot](https://spring.io/projects/spring-boot) - 后端框架
- [PostgreSQL](https://www.postgresql.org/) - 数据库

---

**GameVault** - 让游戏收藏更简单，让社区交流更便捷 🎮