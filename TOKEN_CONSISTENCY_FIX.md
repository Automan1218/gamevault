# Token一致性修复说明

## 问题描述

在实现自动登出功能后，发现游戏库页面出现401未授权错误。经过分析发现是token存储键名不一致导致的问题。

## 问题原因

1. **AuthApi使用 `auth_token`**: 在 `/src/lib/api/auth.ts` 中，所有认证相关的操作都使用 `auth_token` 作为localStorage的键名
2. **其他页面使用 `access_token`**: 在游戏库、订单等页面中，使用的是 `access_token` 作为localStorage的键名
3. **登出时只清除 `auth_token`**: 当用户修改密码/邮箱后，系统只清除了 `auth_token`，但其他页面仍在尝试使用 `access_token`

## 修复方案

统一使用 `auth_token` 作为所有页面的token存储键名，确保整个应用的一致性。

## 修复的文件

### 1. 游戏库页面 (`/src/app/library/page.tsx`)
```typescript
// 修复前
const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

// 修复后
const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
```

### 2. 订单页面 (`/src/app/orders/page.tsx`)
```typescript
// 修复前
const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

// 修复后
const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
```

### 3. 订单详情页面 (`/src/app/orders/[id]/page.tsx`)
```typescript
// 修复前
const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

// 修复后
const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
```

### 4. 主页面 (`/src/app/page.tsx`)
```typescript
// 修复前
const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');

// 修复后
const token = localStorage.getItem('auth_token');
```

```typescript
// 修复前
localStorage.removeItem('access_token');
localStorage.removeItem('token');
localStorage.removeItem('auth_token');

// 修复后
localStorage.removeItem('auth_token');
```

### 5. 旧API文件 (`/src/api/auth.ts`)
```typescript
// 修复前
localStorage.setItem("access_token", result.token);

// 修复后
localStorage.setItem("auth_token", result.token);
```

## 修复后的效果

1. **统一的token管理**: 整个应用现在使用统一的 `auth_token` 键名
2. **正确的登出行为**: 修改密码/邮箱后，所有页面都能正确检测到登出状态
3. **避免401错误**: 游戏库和其他页面现在能正确获取和使用token
4. **一致的用户体验**: 用户修改敏感信息后，所有页面都会正确响应登出状态

## 技术细节

### Token存储策略
- **存储键名**: `auth_token`
- **存储位置**: `localStorage`
- **使用范围**: 所有需要认证的API请求

### 登出处理
- **清除token**: `localStorage.removeItem('auth_token')`
- **跳转逻辑**: 自动跳转到登录页面
- **状态同步**: 所有页面都能正确检测到登出状态

### 认证流程
1. 用户登录 → 存储 `auth_token`
2. API请求 → 使用 `auth_token` 进行认证
3. 修改敏感信息 → 清除 `auth_token` 并登出
4. 重新登录 → 重新存储 `auth_token`

## 测试建议

1. **登录测试**: 确认登录后token正确存储
2. **API请求测试**: 确认所有API请求都能正确使用token
3. **登出测试**: 确认修改密码/邮箱后所有页面都能正确响应
4. **重新登录测试**: 确认重新登录后所有功能正常

## 总结

通过统一token存储键名，解决了自动登出功能导致的401错误问题。现在整个应用的认证机制更加一致和可靠，用户体验也得到了改善。
