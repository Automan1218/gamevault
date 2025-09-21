# 社区论坛平台

一个功能丰富的现代化社区论坛平台，集成了论坛讨论、实时聊天、开发者工具和购物等多种功能模块。


## 🛠️ 技术栈

- **前端框架**: Next.js + React
- **UI 组件库**: Ant Design
- **状态管理**: React Hooks
- **路由管理**: Next.js App Router
- **样式**: CSS Modules / Tailwind CSS
- **类型检查**: TypeScript

## 📂 项目结构

```
src/
├── components/           # 共用组件
│   ├── layout/          # 布局组件
│   │   └── AppHeader.tsx
│   └── ...
├── features/            # 功能模块
│   ├── forum/          # 论坛相关
│   │   └── types/
│   ├── chat/           # 聊天功能
│   ├── developer/      # 开发者工具
│   └── shopping/       # 购物功能
├── lib/                # 工具库
│   ├── api/            # API 接口
│   │   ├── auth.ts
│   │   ├── posts.ts
│   │   └── users.ts
│   └── navigation.ts   # 路由配置
├── config/             # 配置文件
└── app/               # Next.js 页面路由
    ├── dashboard/     # 主要功能页面
    │   ├── forum/
    │   ├── chat/
    │   ├── developer/
    │   └── shopping/
    └── ...

```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install

```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev

```

打开 [http://localhost:3000](http://localhost:3000/) 查看应用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build

```

## 📱 主要页面

| 页面 | 路径 | 描述 |
| --- | --- | --- |
| 首页 | `/` | 项目主页 |
| 登录 | `/login` | 用户登录/注册 |
| 论坛主页 | `/dashboard/forum` | 论坛帖子列表 |
| 发布帖子 | `/dashboard/forum/create` | 创建新帖子 |
| 聊天室 | `/dashboard/chat` | 聊天功能入口 |
| 开发者 | `/dashboard/developer` | 开发者工具 |
| 购物中心 | `/dashboard/shopping` | 购物功能 |
| 个人中心 | `/profile/{id}` | 用户资料页 |

## 🔧 API 接口

### 认证相关

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

### 帖子相关

- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/{id}` - 获取帖子详情
- `POST /api/posts` - 创建新帖子
- `PUT /api/posts/{id}` - 更新帖子
- `DELETE /api/posts/{id}` - 删除帖子

### 用户相关

- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

## 🎨 UI 组件

项目使用 Ant Design 作为主要 UI 组件库，包含：

- 导航栏 (`AppHeader`)
- 论坛帖子卡片 (`ForumPostCard`)
- 分类展示卡片 (`ForumCategoryCard`)
- 帖子编辑器 (`ForumPostEditor`)
- 统计信息卡片 (`ForumStatsCard`)

## 🔐 权限管理

- 游客：浏览公开内容
- 注册用户：发帖、评论、点赞、收藏
- 管理员：内容管理、用户管理

## 📝 开发指南

### 添加新功能模块

1. 在 `src/features/` 下创建模块文件夹
2. 定义相关类型和接口
3. 实现 API 接口
4. 创建相关组件
5. 配置路由

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 配置的代码规范
- 组件采用函数式组件 + Hooks
- API 调用统一使用 async/await

## 🐛 常见问题

### Q: 如何添加新的论坛分类？

A: 在 `forumTypes.ts` 中的 `ForumCategory` 接口定义新分类，并在相关组件中处理。

### Q: 如何自定义主题样式？

A: 修改 Ant Design 的主题配置或添加自定义 CSS 样式。

### Q: 如何部署到生产环境？

A: 运行 `npm run build` 构建项目，然后部署 `.next` 文件夹到服务器。

## 📝 新增页面开发指南

### 步骤 1: 项目规划和设计

在开始编码之前，明确以下内容：

- 确定页面功能和用途
- 设计页面 URL 路径结构
- 规划页面所需的数据结构
- 确定是否需要新的 API 接口

**示例场景：创建"活动管理"功能模块**

- 功能：展示和管理用户活动
- 路径：`/dashboard/activities`
- 数据结构：活动列表、活动详情、参与统计

### 步骤 2: 配置路由系统

打开 `src/lib/navigation.ts` 文件，按以下步骤添加新路由配置：

**添加路由定义：**

```tsx
export const navigationRoutes = {
    // ... 现有路由配置

    // Activities相关路由 - 新增
    activities: '/dashboard/activities',
    activitiesCreate: '/dashboard/activities/create',
    activitiesDetail: (id: number) => `/dashboard/activities/${id}`,
    activitiesEdit: (id: number) => `/dashboard/activities/${id}/edit`,
    activitiesJoin: (id: number) => `/dashboard/activities/${id}/join`,
};

```

**更新面包屑配置：**

```tsx
export const breadcrumbConfig = {
    // ... 现有配置
    '/dashboard/activities': '活动管理',
    '/dashboard/activities/create': '创建活动',
};

```

**更新导航菜单（如需在侧边栏显示）：**

```tsx
export const dashboardMenuItems = [
    // ... 现有菜单项
    {
        key: 'activities',
        label: '活动管理',
        path: navigationRoutes.activities,
        icon: '🎪'
    }
];

```

### 步骤 3: 定义数据类型

创建新的类型定义文件 `src/features/activities/types/activitiesTypes.ts`：

```tsx
// 活动基础类型定义
export interface Activity {
    activityId: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location?: string;
    maxParticipants?: number;
    currentParticipants: number;
    creatorId: number;
    creatorName?: string;
    status: 'draft' | 'active' | 'ended' | 'cancelled';
    createdDate: string;
    updatedDate: string;
}

// API 响应类型
export interface ActivityListResponse {
    activities: Activity[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// 请求类型
export interface CreateActivityRequest {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location?: string;
    maxParticipants?: number;
}

```

### 步骤 4: 创建 API 接口层

创建 API 文件 `src/lib/api/activities.ts`：

```tsx
import { apiClient } from './client';
import { ENV } from '@/config/env';
import { Activity, ActivityListResponse, CreateActivityRequest } from '@/features/activities/types/activitiesTypes';

export class ActivitiesApi {
    // 获取活动列表
    static async getActivities(
        page: number = 0,
        size: number = ENV.DEFAULT_PAGE_SIZE
    ): Promise<ActivityListResponse> {
        try {
            return await apiClient.get<ActivityListResponse>('/activities', {
                page,
                size: Math.min(size, ENV.MAX_PAGE_SIZE)
            });
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            throw new Error('获取活动列表失败');
        }
    }

    // 获取单个活动详情
    static async getActivityById(id: number): Promise<Activity> {
        try {
            const response = await apiClient.get<{ activity: Activity }>(`/activities/${id}`);
            return response.activity;
        } catch (error) {
            console.error(`Failed to fetch activity ${id}:`, error);
            throw new Error('获取活动详情失败');
        }
    }

    // 创建新活动
    static async createActivity(data: CreateActivityRequest): Promise<Activity> {
        try {
            const response = await apiClient.post<{ activity: Activity }>('/activities', data);
            return response.activity;
        } catch (error) {
            console.error('Failed to create activity:', error);
            throw new Error('创建活动失败');
        }
    }
}

```

### 步骤 5: 创建主页面组件

创建目录和文件 `src/app/dashboard/activities/page.tsx`：

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button,
    Card,
    Col,
    List,
    Row,
    Space,
    Spin,
    Typography,
    message,
} from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import { ActivitiesApi } from '@/lib/api/activities';
import { Activity } from '@/features/activities/types/activitiesTypes';

const { Title } = Typography;

export default function ActivitiesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const loadActivities = async (page: number = 0) => {
        setLoading(true);
        try {
            const response = await ActivitiesApi.getActivities(page, pagination.pageSize);
            setActivities(response.activities);
            setPagination(prev => ({
                ...prev,
                current: response.currentPage + 1,
                total: response.totalCount,
            }));
        } catch (error) {
            message.error('加载活动失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, []);

    const handleCreateActivity = () => {
        router.push('/dashboard/activities/create');
    };

    return (
        <div style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Title level={2}>活动管理</Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateActivity}
                    >
                        创建活动
                    </Button>
                </Col>
            </Row>

            <Spin spinning={loading}>
                <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={activities}
                    pagination={{
                        ...pagination,
                        onChange: (page) => loadActivities(page - 1),
                    }}
                    renderItem={(activity) => (
                        <List.Item>
                            <Card
                                hoverable
                                actions={[
                                    <CalendarOutlined key="calendar" />,
                                    '查看详情',
                                ]}
                                onClick={() => router.push(`/dashboard/activities/${activity.activityId}`)}
                            >
                                <Card.Meta
                                    title={activity.title}
                                    description={activity.description}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            </Spin>
        </div>
    );
}

```

### 步骤 6: 创建详情页面

创建文件 `src/app/dashboard/activities/[id]/page.tsx`：

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, Descriptions, Spin, message } from 'antd';
import { ActivitiesApi } from '@/lib/api/activities';
import { Activity } from '@/features/activities/types/activitiesTypes';

export default function ActivityDetailPage() {
    const params = useParams();
    const activityId = Number(params.id);
    const [loading, setLoading] = useState(false);
    const [activity, setActivity] = useState<Activity | null>(null);

    useEffect(() => {
        if (activityId) {
            loadActivity();
        }
    }, [activityId]);

    const loadActivity = async () => {
        setLoading(true);
        try {
            const response = await ActivitiesApi.getActivityById(activityId);
            setActivity(response);
        } catch (error) {
            message.error('加载活动详情失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Spin spinning={loading}>
                {activity && (
                    <Card title={activity.title}>
                        <Descriptions column={2}>
                            <Descriptions.Item label="活动描述">
                                {activity.description}
                            </Descriptions.Item>
                            <Descriptions.Item label="开始时间">
                                {activity.startDate}
                            </Descriptions.Item>
                            <Descriptions.Item label="结束时间">
                                {activity.endDate}
                            </Descriptions.Item>
                            <Descriptions.Item label="当前参与人数">
                                {activity.currentParticipants}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}
            </Spin>
        </div>
    );
}

```

### 步骤 7: 创建表单页面

创建文件 `src/app/dashboard/activities/create/page.tsx`：

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button,
    Card,
    Form,
    Input,
    DatePicker,
    InputNumber,
    message,
    Space,
} from 'antd';
import { ActivitiesApi } from '@/lib/api/activities';
import { CreateActivityRequest } from '@/features/activities/types/activitiesTypes';

export default function CreateActivityPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const activityData: CreateActivityRequest = {
                title: values.title,
                description: values.description,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                location: values.location,
                maxParticipants: values.maxParticipants,
            };

            await ActivitiesApi.createActivity(activityData);
            message.success('活动创建成功');
            router.push('/dashboard/activities');
        } catch (error) {
            message.error('创建活动失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card title="创建新活动">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="活动标题"
                        rules={[{ required: true, message: '请输入活动标题' }]}
                    >
                        <Input placeholder="请输入活动标题" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="活动描述"
                        rules={[{ required: true, message: '请输入活动描述' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入活动描述" />
                    </Form.Item>

                    <Form.Item
                        name="startDate"
                        label="开始时间"
                        rules={[{ required: true, message: '请选择开始时间' }]}
                    >
                        <DatePicker showTime />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label="结束时间"
                        rules={[{ required: true, message: '请选择结束时间' }]}
                    >
                        <DatePicker showTime />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                创建活动
                            </Button>
                            <Button onClick={() => router.back()}>
                                取消
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

```

### 步骤 8: 创建布局文件（可选）

如果需要为整个模块添加公共布局，创建文件 `src/app/dashboard/activities/layout.tsx`：

```tsx
import React from 'react';

export default function ActivitiesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            {/* 在此处添加活动模块的公共布局元素，如侧边栏、头部等 */}
            {children}
        </div>
    );
}

```

### 步骤 9: 功能测试验证

按以下顺序进行测试：

1. 启动开发服务器：`npm run dev`
2. 访问主页面：`http://localhost:3000/dashboard/activities`
3. 验证页面路由正常跳转
4. 测试 API 接口调用（需要后端支持）
5. 验证数据正常显示
6. 测试表单提交功能
7. 检查错误处理机制
8. 验证加载状态显示