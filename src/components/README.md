# 通用组件库

本项目已将所有通用组件整理到 `src/components` 目录下，提供统一的UI组件和样式管理。

## 目录结构

```
src/components/
├── common/           # 通用样式和主题配置
│   ├── theme.ts     # 主题配置和样式常量
│   ├── animations.css # 通用动画样式
│   └── index.ts     # 导出文件
├── ui/              # 基础UI组件
│   ├── Button.tsx   # 自定义按钮组件
│   ├── Input.tsx    # 自定义输入框组件
│   ├── Card.tsx     # 自定义卡片组件
│   ├── Title.tsx    # 自定义标题组件
│   └── index.ts     # 导出文件
├── layout/          # 布局组件
│   ├── PageContainer.tsx # 页面容器组件
│   ├── GameCard.tsx      # 游戏卡片组件
│   ├── EmptyState.tsx    # 空状态组件
│   └── index.ts          # 导出文件
├── forms/           # 表单组件
│   ├── SearchForm.tsx    # 搜索表单组件
│   ├── LoginForm.tsx     # 登录表单组件
│   └── index.ts          # 导出文件
├── modals/          # 模态框组件
│   ├── ActivationCodesModal.tsx # 激活码查看模态框
│   ├── OrderDetailModal.tsx     # 订单详情模态框
│   └── index.ts                 # 导出文件
├── index.ts         # 主导出文件
└── README.md        # 说明文档
```

## 使用方法

### 1. 导入组件

```typescript
// 导入单个组件
import { CustomButton } from '@/components/ui';
import { PageContainer } from '@/components/layout';

// 导入多个组件
import { CustomButton, CustomInput, CustomCard } from '@/components/ui';
import { PageContainer, GameCard, EmptyState } from '@/components/layout';
import { SearchForm, LoginForm } from '@/components/forms';
import { ActivationCodesModal, OrderDetailModal } from '@/components/modals';
```

### 2. 使用主题配置

```typescript
import { darkTheme, inputStyle, cardStyle } from '@/components/common/theme';

// 在组件中使用
<ConfigProvider theme={darkTheme}>
  <Input style={inputStyle} />
  <Card style={cardStyle} />
</ConfigProvider>
```

### 3. 使用动画样式

```css
/* 在组件中引入动画样式 */
import '@/components/common/animations.css';

/* 使用动画类 */
<div className="animate-float">浮动动画</div>
<div className="animate-glow">发光动画</div>
<div className="animate-fade-in-up">淡入上移动画</div>
```

## 组件说明

### UI组件

#### CustomButton
自定义按钮组件，支持多种变体和尺寸。

```typescript
<CustomButton 
  variant="primary" // primary | secondary | ghost
  size="large"      // small | medium | large
  onClick={handleClick}
>
  按钮文本
</CustomButton>
```

#### CustomInput
自定义输入框组件，支持搜索变体。

```typescript
<CustomInput 
  variant="search"  // default | search | password
  placeholder="请输入内容"
  prefix={<SearchOutlined />}
/>
```

#### CustomCard
自定义卡片组件，支持悬停效果。

```typescript
<CustomCard 
  variant="elevated" // default | elevated | glass
  hoverable={true}
>
  卡片内容
</CustomCard>
```

### 布局组件

#### PageContainer
页面容器组件，提供统一的页面布局和背景。

```typescript
<PageContainer
  title="页面标题"
  subtitle="页面副标题"
  showBackground={true}
  showDecorations={true}
  maxWidth={1400}
>
  页面内容
</PageContainer>
```

#### GameCard
游戏卡片组件，用于展示游戏信息。

```typescript
<GameCard
  gameId={1}
  title="游戏标题"
  price={99}
  activationCodesCount={3}
  onViewCodes={() => console.log('查看激活码')}
  index={0}
/>
```

#### EmptyState
空状态组件，用于展示无数据状态。

```typescript
<EmptyState
  icon="🎮"
  title="暂无数据"
  description="描述信息"
  subDescription="补充说明"
/>
```

### 表单组件

#### SearchForm
搜索表单组件。

```typescript
<SearchForm
  placeholder="搜索内容"
  onSearch={(value) => console.log(value)}
  onChange={(value) => console.log(value)}
  value={searchValue}
/>
```

#### LoginForm
登录表单组件，包含登录和注册功能。

```typescript
<LoginForm
  onLogin={handleLogin}
  onRegister={handleRegister}
  loading={isLoading}
  onForgotPassword={handleForgotPassword}
  validateEmail={validateEmail}
  validateUsername={validateUsername}
/>
```

### 模态框组件

#### ActivationCodesModal
激活码查看模态框。

```typescript
<ActivationCodesModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  gameTitle="游戏标题"
  activationCodes={codes}
/>
```

#### OrderDetailModal
订单详情模态框。

```typescript
<OrderDetailModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  orderDetail={orderData}
/>
```

## 样式主题

所有组件都使用统一的深色主题，主要颜色包括：

- 主色调：`#6366f1` (紫色)
- 背景色：`rgba(15, 23, 42, 0.9)` (深蓝)
- 文字色：`#f9fafb` (浅灰)
- 边框色：`rgba(99, 102, 241, 0.2)` (紫色半透明)

## 注意事项

1. 所有组件都支持TypeScript类型检查
2. 组件样式使用内联样式，便于动态调整
3. 动画效果通过CSS类实现，性能优化
4. 组件设计遵循Ant Design的设计规范
5. 所有组件都支持自定义样式覆盖

## 扩展指南

如需添加新的通用组件：

1. 在对应目录下创建组件文件
2. 在目录的 `index.ts` 中导出组件
3. 在主 `index.ts` 中导出新组件
4. 更新此README文档
5. 添加TypeScript类型定义





