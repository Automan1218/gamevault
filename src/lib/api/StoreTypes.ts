// Corresponds to backend com.sg.nusiss.gamevaultbackend.dto.shopping.*
// Ensure field names, case, and nested relationships are completely consistent

export interface GameDTO {
  gameId: number;
  title: string;
  developer: string;
  description: string;
  price: number;                 // BigDecimal → number
  discountPrice?: number;        // Optional field
  imageUrl?: string;
  genre?: string;
  platform?: string;
  releaseDate?: string;          // LocalDateTime → ISO string
  isActive?: boolean;
}

export interface CartItemDTO {
  cartItemId: number;
  game: GameDTO;                 // Nested GameDTO
  unitPrice: number;             // BigDecimal → number
  quantity: number;
  subtotal: number;
}

export interface CartDTO {
  cartId: number;
  userId: number;
  cartItems: CartItemDTO[];
  status: string;                // ACTIVE / CHECKED_OUT etc.
  createdDate: string;           // LocalDateTime → string
  lastModifiedDate: string;
  paymentMethod: string;
  discountAmount: number;
  finalAmount: number;
}

// Corresponds to backend com.sg.nusiss.gamevaultbackend.dto.library.OrderDTO and OrderItemDTO

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
  orderItems: OrderItemDTO[];  // Nested list
}
