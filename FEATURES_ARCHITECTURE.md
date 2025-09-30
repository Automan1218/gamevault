# Features 架构统一指南

## 📁 最终架构

```
src/app/features/
├── auth/
│   └── hooks/
│       └── useAuth.ts           # 认证相关的 hook
├── library/
│   └── hooks/
│       └── useLibrary.ts        # 游戏库相关的 hook
├── orders/
│   └── hooks/
│       └── useOrders.ts         # 订单相关的 hook
├── settings/
│   └── hooks/
│       └── useSettings.ts       # 设置相关的 hook
└── forum/
    ├── hooks/                   # 论坛相关的 hooks
    ├── services/                # 论坛业务逻辑服务
    ├── types/                   # 论坛类型定义
    └── utils/                   # 论坛工具函数
```

## 🎯 设计原则

### 1. **统一的 Hooks 管理**
每个功能模块都有自己的 hooks 目录，用于管理：
- 状态管理
- 业务逻辑
- API 调用封装

### 2. **关注点分离**
- **`lib/api/`** - 基础 API 调用（HTTP 请求）
- **`features/*/hooks/`** - 业务逻辑和状态管理
- **`dashboard/*/`** - UI 页面组件

### 3. **代码复用**
通过 hooks 实现逻辑复用，多个页面可以共享同一个 hook。

## 📚 各模块功能说明

### **features/auth/hooks/useAuth.ts**

**功能：**
- 用户登录
- 用户注册
- 用户登出
- 检查邮箱/用户名是否存在
- 获取当前用户信息

**使用示例：**
```typescript
import { useAuth } from '@/app/features/auth/hooks/useAuth';

const { login, register, logout, loading } = useAuth();

// 登录
const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
        // 登录成功
    }
};
```

### **features/library/hooks/useLibrary.ts**

**功能：**
- 获取游戏库列表
- 搜索游戏
- 刷新游戏库

**使用示例：**
```typescript
import { useLibrary } from '@/app/features/library/hooks/useLibrary';

const { 
    filteredGames, 
    loading, 
    searchQuery, 
    setSearchQuery 
} = useLibrary();
```

### **features/orders/hooks/useOrders.ts**

**功能：**
- 获取订单列表
- 获取订单详情
- 取消订单
- 刷新订单列表

**使用示例：**
```typescript
import { useOrders } from '@/app/features/orders/hooks/useOrders';

const { 
    orders, 
    fetchOrders, 
    fetchOrderDetail, 
    loading 
} = useOrders();
```

### **features/settings/hooks/useSettings.ts**

**功能：**
- 获取用户信息
- 修改密码
- 修改邮箱
- 刷新用户信息

**使用示例：**
```typescript
import { useSettings } from '@/app/features/settings/hooks/useSettings';

const { 
    userInfo, 
    changePassword, 
    changeEmail, 
    loading 
} = useSettings();
```

### **features/forum/（完整的功能模块）**

**结构：**
- `hooks/` - React hooks（useForum, useForumPost, etc.）
- `services/` - 业务逻辑服务（ForumApi）
- `types/` - TypeScript 类型定义
- `utils/` - 工具函数

## 🔄 数据流向

```
┌─────────────────┐
│   UI 页面组件    │  (dashboard/*/page.tsx)
└────────┬────────┘
         │ 使用 hook
┌────────▼────────┐
│  Features Hooks │  (features/*/hooks/use*.ts)
│  - 状态管理      │
│  - 业务逻辑      │
└────────┬────────┘
         │ 调用 API
┌────────▼────────┐
│    lib/api/     │  (lib/api/*.ts)
│  - HTTP 请求    │
│  - 数据转换      │
└────────┬────────┘
         │ 请求
┌────────▼────────┐
│  Spring Boot    │  后端服务
│  localhost:8080 │
└─────────────────┘
```

## 📝 使用指南

### **创建新的功能模块**

1. **创建目录结构：**
```bash
mkdir -p src/app/features/your-feature/hooks
```

2. **创建 hook 文件：**
```typescript
// features/your-feature/hooks/useYourFeature.ts
import { useState, useCallback } from 'react';
import { YourApi } from '@/lib/api';

export const useYourFeature = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await YourApi.getData();
            setData(result);
        } finally {
            setLoading(false);
        }
    }, []);
    
    return { data, loading, fetchData };
};
```

3. **在页面中使用：**
```typescript
// dashboard/your-feature/page.tsx
import { useYourFeature } from '@/app/features/your-feature/hooks/useYourFeature';

export default function YourFeaturePage() {
    const { data, loading, fetchData } = useYourFeature();
    
    // 使用数据渲染 UI
}
```

## ✅ 优势

1. **架构一致性** - 所有功能模块遵循相同的组织方式
2. **代码复用** - 通过 hooks 实现逻辑共享
3. **易于维护** - 清晰的职责分离
4. **易于测试** - hooks 可以独立测试
5. **团队协作** - 统一的代码风格和结构

## 🔧 迁移检查清单

- ✅ features/auth/hooks/useAuth.ts
- ✅ features/library/hooks/useLibrary.ts
- ✅ features/orders/hooks/useOrders.ts
- ✅ features/settings/hooks/useSettings.ts
- ✅ features/forum/（已存在）
- ✅ 更新 login 页面使用 useAuth
- ✅ 更新 library 页面使用 useLibrary 和 useOrders
- ✅ 更新 settings 页面使用 useSettings

## 📊 对比：迁移前后

### **迁移前：**
```typescript
// 页面中直接调用 API
const [data, setData] = useState([]);
useEffect(() => {
    const fetchData = async () => {
        const result = await Api.getData();
        setData(result);
    };
    fetchData();
}, []);
```

### **迁移后：**
```typescript
// 页面中使用 hook
const { data, loading, fetchData } = useFeature();
```

**优势：**
- 代码更简洁
- 逻辑可复用
- 易于测试和维护

---

**最后更新**: 2025-09-30
**状态**: ✅ 架构统一完成
