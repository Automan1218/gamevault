// =======================
// 游戏类型
// =======================
export interface GameDTO {
    gameId: number;
    title: string;
    developer: string;
    description: string;
    price: number;
    discountPrice: number;
    imageUrl: string;
    genre: string;
    platform: string;
    releaseDate: string;  // ISO 日期
    isActive: boolean;
}

// 游戏列表响应
export interface GameListResponse {
    games: GameDTO[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// 游戏搜索请求
export interface SearchGamesRequest {
    keyword: string;
    genre?: string;
    platform?: string;
    page?: number;
    size?: number;
}

// =======================
// 购物车类型
// =======================
export interface CartItemDTO {
    cartItemId: number;
    game: GameDTO;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface CartDTO {
    cartId: number;
    userId: number;
    cartItems: CartItemDTO[];
    status: string; // ACTIVE / CHECKED_OUT / CANCELLED
    createdDate: string;
    lastModifiedDate: string;
    paymentMethod?: string; // CREDIT_CARD / PAYPAL / WALLET
    discountAmount: number;
    finalAmount: number;
}


// =======================
// 订单类型
// =======================
export interface OrderItemDTO {
  orderItemId: number;
  orderId: number;
  userId: number;
  orderDate: string;
  orderStatus: string;
  gameId: number;
  unitPrice: number;
  activationCode?: string | null;
  gameTitle: string;
  imageUrl?: string;
}


export interface OrderDTO {
    orderId: number;
    userId: number;
    orderItems: OrderItemDTO[];
    orderStatus: string; // PENDING / PAID / FAILED / CANCELLED / COMPLETED
    orderDate: string;
    completedDate?: string;
    finalAmount: number;
    paymentMethod: string;
}

// =======================
// 请求类型
// =======================
export interface AddToCartRequest {
    userId: number;
    gameId: number;
    quantity?: number;
}

export interface RemoveFromCartRequest {
    userId: number;
    gameId: number;
}

export interface CheckoutRequest {
    userId: number;
    paymentMethod: string;
}

// =======================
// 组件 Props 类型
// =======================
export interface GameCardProps {
    game: GameDTO;
    onClick?: (game: GameDTO) => void;
    onAddToCart?: (game: GameDTO) => void;
    onWishlist?: (game: GameDTO) => void;
}

export interface CartItemProps {
    item: CartItemDTO;
    onRemove?: (itemId: number) => void;
    onQuantityChange?: (itemId: number, qty: number) => void;
}

export interface OrderSummaryProps {
    order: OrderDTO;
    onPay?: (orderId: number) => void;
}

// =======================
// 常量枚举
// =======================
export const CART_STATUS = {
    ACTIVE: 'ACTIVE',
    CHECKED_OUT: 'CHECKED_OUT',
    CANCELLED: 'CANCELLED',
} as const;

export const ORDER_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
} as const;

export const PAYMENT_METHODS = {
    CREDIT_CARD: 'CREDIT_CARD',
    DEBIT_CARD: 'DEBIT_CARD',
    PAYPAL: 'PAYPAL',
    WALLET: 'WALLET',
    OTHER: 'OTHER',
} as const;

// 工具类型
export type CartStatus = typeof CART_STATUS[keyof typeof CART_STATUS];
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
