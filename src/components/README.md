# Common Component Library

This project has organized all common components under the `src/components` directory, providing unified UI components and style management.

## Directory Structure

```
src/components/
├── common/           # Common styles and theme configuration
│   ├── theme.ts     # Theme configuration and style constants
│   ├── animations.css # Common animation styles
│   └── index.ts     # Export file
├── ui/              # Basic UI components
│   ├── Button.tsx   # Custom button component
│   ├── Input.tsx    # Custom input component
│   ├── Card.tsx     # Custom card component
│   ├── Title.tsx    # Custom title component
│   └── index.ts     # Export file
├── layout/          # Layout components
│   ├── PageContainer.tsx # Page container component
│   ├── GameCard.tsx      # Game card component
│   ├── EmptyState.tsx    # Empty state component
│   └── index.ts          # Export file
├── forms/           # Form components
│   ├── SearchForm.tsx    # Search form component
│   ├── LoginForm.tsx     # Login form component
│   └── index.ts          # Export file
├── modals/          # Modal components
│   ├── ActivationCodesModal.tsx # Activation codes view modal
│   ├── OrderDetailModal.tsx     # Order detail modal
│   └── index.ts                 # Export file
├── index.ts         # Main export file
└── README.md        # Documentation
```

## Usage

### 1. Import Components

```typescript
// Import single component
import { CustomButton } from '@/components/ui';
import { PageContainer } from '@/components/layout';

// Import multiple components
import { CustomButton, CustomInput, CustomCard } from '@/components/ui';
import { PageContainer, GameCard, EmptyState } from '@/components/layout';
import { SearchForm, LoginForm } from '@/components/forms';
import { ActivationCodesModal, OrderDetailModal } from '@/components/modals';
```

### 2. Use Theme Configuration

```typescript
import { darkTheme, inputStyle, cardStyle } from '@/components/common/theme';

// Use in components
<ConfigProvider theme={darkTheme}>
  <Input style={inputStyle} />
  <Card style={cardStyle} />
</ConfigProvider>
```

### 3. Use Animation Styles

```css
/* Import animation styles in components */
import '@/components/common/animations.css';

/* Use animation classes */
<div className="animate-float">Floating animation</div>
<div className="animate-glow">Glow animation</div>
<div className="animate-fade-in-up">Fade in up animation</div>
```

## Component Documentation

### UI Components

#### CustomButton
Custom button component with support for multiple variants and sizes.

```typescript
<CustomButton 
  variant="primary" // primary | secondary | ghost
  size="large"      // small | medium | large
  onClick={handleClick}
>
  Button Text
</CustomButton>
```

#### CustomInput
Custom input component with search variant support.

```typescript
<CustomInput 
  variant="search"  // default | search | password
  placeholder="Enter content"
  prefix={<SearchOutlined />}
/>
```

#### CustomCard
Custom card component with hover effects.

```typescript
<CustomCard 
  variant="elevated" // default | elevated | glass
  hoverable={true}
>
  Card Content
</CustomCard>
```

### Layout Components

#### PageContainer
Page container component providing unified page layout and background.

```typescript
<PageContainer
  title="Page Title"
  subtitle="Page Subtitle"
  showBackground={true}
  showDecorations={true}
  maxWidth={1400}
>
  Page Content
</PageContainer>
```

#### GameCard
Game card component for displaying game information.

```typescript
<GameCard
  gameId={1}
  title="Game Title"
  price={99}
  activationCodesCount={3}
  onViewCodes={() => console.log('View activation codes')}
  index={0}
/>
```

#### EmptyState
Empty state component for displaying no data state.

```typescript
<EmptyState
  icon="🎮"
  title="No Data"
  description="Description"
  subDescription="Additional information"
/>
```

### Form Components

#### SearchForm
Search form component.

```typescript
<SearchForm
  placeholder="Search content"
  onSearch={(value) => console.log(value)}
  onChange={(value) => console.log(value)}
  value={searchValue}
/>
```

#### LoginForm
Login form component with login and registration functionality.

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

### Modal Components

#### ActivationCodesModal
Activation codes view modal.

```typescript
<ActivationCodesModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  gameTitle="Game Title"
  activationCodes={codes}
/>
```

#### OrderDetailModal
Order detail modal.

```typescript
<OrderDetailModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  orderDetail={orderData}
/>
```

## Style Theme

All components use a unified dark theme with the following main colors:

- Primary color: `#6366f1` (Purple)
- Background color: `rgba(15, 23, 42, 0.9)` (Dark blue)
- Text color: `#f9fafb` (Light gray)
- Border color: `rgba(99, 102, 241, 0.2)` (Purple semi-transparent)

## Notes

1. All components support TypeScript type checking
2. Component styles use inline styles for easy dynamic adjustment
3. Animation effects are implemented through CSS classes for performance optimization
4. Component design follows Ant Design design specifications
5. All components support custom style overrides

## Extension Guide

To add new common components:

1. Create component file in the corresponding directory
2. Export component in the directory's `index.ts`
3. Export new component in main `index.ts`
4. Update this README documentation
5. Add TypeScript type definitions





