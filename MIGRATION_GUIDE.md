# 迁移指南：删除 app/api 代理层

## ✅ 已完成的更改

### 1. 删除了 Next.js API 路由代理
- ❌ 删除 `src/app/api/auth/` 目录
- ❌ 删除 `src/app/api/library/` 目录
- ❌ 删除 `src/app/api/orders/` 目录
- ✅ 前端现在直接调用后端 API

### 2. 保持的配置
- ✅ `lib/api/client.ts` 已配置直接调用后端
- ✅ 后端 CORS 已正确配置
- ✅ `ENV.FORUM_API_URL` 指向 `http://localhost:8080/api`

## 🔄 API 调用流程变化

### **之前的架构：**
```
前端组件 → lib/api → app/api (代理) → 后端 Spring Boot
```

### **现在的架构：**
```
前端组件 → lib/api → 后端 Spring Boot
```

## 📝 测试清单

### **1. 启动后端**
```bash
cd /Users/zyc/IdeaProjects/gamevaultbackend
./mvnw spring-boot:run
```

确认后端运行在 `http://localhost:8080`

### **2. 启动前端**
```bash
cd /Users/zyc/IdeaProjects/gamevault
npm run dev
```

确认前端运行在 `http://localhost:3000`

### **3. 测试认证功能**

#### ✅ 用户注册
1. 访问 `http://localhost:3000/auth/login`
2. 切换到注册模式
3. 填写表单：
   - 邮箱：test@example.com
   - 用户名：testuser
   - 密码：Test123!
4. 点击注册
5. **预期结果**：注册成功，自动跳转到游戏库

#### ✅ 用户登录
1. 使用刚注册的账号登录
2. **预期结果**：登录成功，跳转到游戏库

#### ✅ 邮箱验证
1. 在注册表单中输入已存在的邮箱
2. **预期结果**：显示"该邮箱已被注册"

#### ✅ 用户名验证
1. 在注册表单中输入已存在的用户名
2. **预期结果**：显示"该用户名已被使用"

### **4. 测试其他功能**

#### ✅ 游戏库
1. 访问 `http://localhost:3000/dashboard/library`
2. **预期结果**：显示已购买的游戏

#### ✅ 订单记录
1. 切换到"购买记录"标签
2. **预期结果**：显示订单列表

#### ✅ 论坛
1. 访问 `http://localhost:3000/dashboard/forum`
2. **预期结果**：显示论坛帖子列表

## 🐛 常见问题排查

### **问题 1：CORS 错误**
```
Access to fetch at 'http://localhost:8080/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**解决方案**：
检查后端 `SecurityConfig.java` 中的 CORS 配置：
```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:3000",
    "http://127.0.0.1:3000"
));
```

### **问题 2：401 未授权**
```
Failed to fetch: 401 Unauthorized
```

**解决方案**：
1. 检查 localStorage 中是否有 `auth_token`
2. 检查 token 是否过期
3. 重新登录获取新 token

### **问题 3：网络错误**
```
Failed to fetch: TypeError: Failed to fetch
```

**解决方案**：
1. 确认后端服务是否运行
2. 确认后端端口是 8080
3. 检查防火墙设置

## 📊 网络请求验证

打开浏览器开发者工具 (F12) → Network 标签，检查请求：

### **登录请求**
```
Request URL: http://localhost:8080/api/auth/login
Request Method: POST
Status Code: 200 OK
Request Headers:
  Content-Type: application/json
Request Body:
  {
    "username": "testuser",
    "password": "Test123!"
  }
Response:
  {
    "token": "eyJhbGciOiJSUzI1NiJ9...",
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
```

### **获取游戏库请求**
```
Request URL: http://localhost:8080/api/library
Request Method: GET
Status Code: 200 OK
Request Headers:
  Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Response:
  {
    "items": [...]
  }
```

## ✨ 优势

迁移后的架构优势：

1. **更简单** - 减少一层代理，架构更清晰
2. **更快** - 直接调用后端，减少请求延迟
3. **更易维护** - 不需要维护代理层代码
4. **更标准** - 符合前后端分离的标准架构

## 🔄 回滚方案

如果遇到问题需要回滚，可以：

1. 恢复 `src/app/api/` 目录
2. 修改 `lib/api/client.ts` 的 baseURL 指向 `/api`
3. 通过 Next.js API 路由代理请求

## 📞 支持

如有问题，请检查：
1. 浏览器控制台错误信息
2. 后端日志 `backend.log`
3. 网络请求详情 (开发者工具 → Network)

---

**最后更新**: 2025-09-30
**状态**: ✅ 迁移完成
