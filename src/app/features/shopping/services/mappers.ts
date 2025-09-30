import type { GameDTO, CartDTO, CartItemDTO, OrderDTO, OrderItemDTO } from '../types/storeTypes';

// 游戏 Mapper
export const mapGameToUI = (game: GameDTO) => {
  const finalPrice = game.discountPrice ?? game.price;
  const discountPercent =
    game.price > 0 && game.discountPrice < game.price
      ? Math.round(((game.price - game.discountPrice) / game.price) * 100)
      : 0;

  return {
    id: game.gameId,
    title: game.title,
    developer: game.developer,
    description: game.description,
    cover: game.imageUrl,
    genre: game.genre,
    platform: game.platform,
    releaseDate: new Date(game.releaseDate).toLocaleDateString(),
    price: game.price,
    finalPrice,
    discountPercent,
    isActive: game.isActive,
  };
};

// 购物车条目 Mapper
export const mapCartItemToUI = (item: CartItemDTO) => {
  const mappedGame = mapGameToUI(item.game);

  return {
    id: item.cartItemId,
    game: mappedGame,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal,
  };
};

// 购物车 Mapper
export const mapCartToUI = (cart: CartDTO) => {
  return {
    id: cart.cartId,
    userId: cart.userId,
    items: cart.cartItems.map(mapCartItemToUI),
    status: cart.status,
    createdDate: new Date(cart.createdDate).toLocaleString(),
    lastModifiedDate: new Date(cart.lastModifiedDate).toLocaleString(),
    discountAmount: cart.discountAmount,
    finalAmount: cart.finalAmount,
  };
};

// 订单条目 Mapper
export const mapOrderItemToUI = (item: OrderItemDTO) => {
  return {
    id: item.orderItemId,
    game: mapGameToUI(item.game),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal,
  };
};

// 订单 Mapper
export const mapOrderToUI = (order: OrderDTO) => {
  return {
    id: order.orderId,
    userId: order.userId,
    items: order.orderItems.map(mapOrderItemToUI),
    status: order.orderStatus,
    date: new Date(order.orderDate).toLocaleString(),
    completedDate: order.completedDate ? new Date(order.completedDate).toLocaleString() : null,
    finalAmount: order.finalAmount,
    paymentMethod: order.paymentMethod,
  };
};
