// 与后端 com.sg.nusiss.gamevaultbackend.dto.shopping.* 对应
// 确保字段名、大小写、嵌套关系完全一致

export interface GameDTO {
  gameId: number;
  title: string;
  developer: string;
  description: string;
  price: number;                 // BigDecimal → number
  discountPrice?: number;        // 可选字段
  imageUrl?: string;
  genre?: string;
  platform?: string;
  releaseDate?: string;          // LocalDateTime → ISO 字符串
  isActive?: boolean;
}

export interface CartItemDTO {
  cartItemId: number;
  game: GameDTO;                 // 嵌套 GameDTO
  unitPrice: number;             // BigDecimal → number
  quantity: number;
  subtotal: number;
}

export interface CartDTO {
  cartId: number;
  userId: number;
  cartItems: CartItemDTO[];
  status: string;                // ACTIVE / CHECKED_OUT 等
  createdDate: string;           // LocalDateTime → string
  lastModifiedDate: string;
  paymentMethod: string;
  discountAmount: number;
  finalAmount: number;
}

// 对应后端 com.sg.nusiss.gamevaultbackend.dto.library.OrderDTO 与 OrderItemDTO

export interface OrderItemDTO {
  orderItemId: number;
  orderId: number;
  userId: number;
  gameId: number;
  unitPrice: number;           // BigDecimal → number
  discountPrice: number;       // BigDecimal → number
  orderDate: string;           // LocalDateTime → ISO string
  orderStatus: string;         // SAME FIELD NAME AS BACKEND
  activationCode: string;
  gameTitle: string;
  imageUrl: string;
}

export interface OrderDTO {
  orderId: number;
  userId: number;
  orderDate: string;           // LocalDateTime → ISO string
  status: string;
  paymentMethod: string;
  finalAmount: number;         // BigDecimal → number
  orderItems: OrderItemDTO[];  // 嵌套列表
}
