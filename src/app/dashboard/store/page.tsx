"use client";

import React, { useState } from "react";
import { 
  App, 
  Card, 
  InputNumber, 
  Button, 
  Row, 
  Col, 
  Layout, 
  Empty,
  Skeleton 
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Menubar } from "@/components/layout";
import { SearchForm } from "@/components/forms";
import { GameDetailModal } from "@/components/modals/GameDetailModal";
import { useStore } from "@/app/features/store/hooks/useStore";
import { useCart } from "@/app/features/cart/hooks/useCart";
import type { GameDTO } from "@/lib/api/StoreTypes";
import "@/components/common/animations.css";

const { Header, Content } = Layout;

export default function ShoppingPage() {
  const { message } = App.useApp();
  const { filteredGames, loading: storeLoading, searchQuery, setSearchQuery } = useStore();
  const { addToCart } = useCart();

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedGame, setSelectedGame] = useState<GameDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleQuantityChange = (gameId: number, value: number | null) => {
    setQuantities((prev) => ({ ...prev, [gameId]: value ?? 1 }));
  };

  const handleAddToCart = async (game: GameDTO, event?: React.MouseEvent) => {
    // 阻止事件冒泡，防止触发卡片点击
    if (event) {
      event.stopPropagation();
    }
    
    const quantity = quantities[game.gameId] || 1;
    try {
      await addToCart(game.gameId, quantity);
      message.success(`已将 ${game.title} ×${quantity} 加入购物车`);
    } catch {
      message.error("加入购物车失败");
    }
  };

  const handleCardClick = (game: GameDTO) => {
    setSelectedGame(game);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedGame(null), 300);
  };

  // 渲染游戏卡片
  const renderGameCard = (game: GameDTO, index: number) => (
    <Card
      className="fade-in-up"
      hoverable
      onClick={() => handleCardClick(game)}
      style={{
        borderRadius: 16,
        background: "linear-gradient(145deg, rgba(31, 41, 55, 0.9) 0%, rgba(31, 41, 55, 0.85) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
        animationDelay: `${index * 0.05}s`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
      }}
      cover={
        <div
          style={{
            height: 200,
            background: `url(${game.imageUrl || "/placeholder-game.jpg"}) center/cover no-repeat`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {game.discountPrice && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
              }}
            >
              -{Math.round(((game.price - game.discountPrice) / game.price) * 100)}%
            </div>
          )}
        </div>
      }
      bodyStyle={{ 
        padding: 20, 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>
        {/* 游戏标题 */}
        <div
          style={{
            fontWeight: 600,
            fontSize: 17,
            color: "#fff",
            marginBottom: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={game.title}
        >
          {game.title}
        </div>

        {/* 价格 */}
        <div style={{ marginBottom: 16, minHeight: 32 }}>
          {game.discountPrice ? (
            <>
              <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 22 }}>
                ￥{game.discountPrice.toFixed(2)}
              </div>
              <div
                style={{
                  textDecoration: "line-through",
                  color: "#6b7280",
                  fontSize: 14,
                  marginTop: 2,
                }}
              >
                ￥{game.price.toFixed(2)}
              </div>
            </>
          ) : (
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>
              ￥{game.price.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* 操作区域 */}
      <div onClick={(e) => e.stopPropagation()}>
        <Row gutter={10} align="middle">
          <Col flex="90px">
            <InputNumber
              min={1}
              max={10}
              value={quantities[game.gameId] || 1}
              onChange={(val) => handleQuantityChange(game.gameId, val)}
              style={{ width: "100%" }}
              size="large"
            />
          </Col>
          <Col flex="auto">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={(e) => handleAddToCart(game, e)}
              size="large"
              block
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                fontWeight: 600,
                height: 40,
              }}
            >
              加入购物车
            </Button>
          </Col>
        </Row>
      </div>
    </Card>
  );

  // 渲染骨架屏
  const renderSkeleton = () => (
    <Card
      style={{
        borderRadius: 12,
        background: "rgba(31, 41, 55, 0.8)",
        border: "1px solid rgba(75, 85, 99, 0.3)",
        height: "100%",
      }}
    >
      <Skeleton.Image
        active
        style={{ width: "100%", height: 200, marginBottom: 16 }}
      />
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          linear-gradient(225deg, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
          linear-gradient(180deg, #0f172a 0%, #020617 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 动态背景装饰元素 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* 网格背景 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            opacity: 0.4,
          }}
        />
        
        {/* 浮动光球 1 */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        
        {/* 浮动光球 2 */}
        <div
          style={{
            position: "absolute",
            top: "60%",
            right: "10%",
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "float 25s ease-in-out infinite reverse",
          }}
        />
        
        {/* 浮动光球 3 */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "50%",
            width: 350,
            height: 350,
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(70px)",
            animation: "float 30s ease-in-out infinite",
          }}
        />
        
        {/* 星光点缀 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: "rgba(255, 255, 255, 0.6)",
              borderRadius: "50%",
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>

      {/* 固定顶部导航栏 */}
      <Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: 0,
          height: "auto",
          lineHeight: "normal",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(99, 102, 241, 0.3)",
          boxShadow: "0 4px 24px rgba(99, 102, 241, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Menubar currentPath="/dashboard/shopping" />
      </Header>

      {/* 页面主体内容 */}
      <Content
        style={{
          marginTop: 64,
          padding: "32px 24px 64px",
        }}
      >
        {/* 使用 Ant Design Pro 风格的容器 */}
        <div
          style={{
            maxWidth: 1600,
            margin: "0 auto",
          }}
        >
          {/* 搜索区域 */}
          <div 
            style={{ 
              marginBottom: 32,
              background: "linear-gradient(135deg, rgba(31, 41, 55, 0.6) 0%, rgba(31, 41, 55, 0.4) 100%)",
              padding: "28px",
              borderRadius: 16,
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 搜索框装饰光效 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)",
              }}
            />
            <SearchForm
              placeholder="搜索游戏标题、类型或关键词"
              onSearch={setSearchQuery}
              onChange={setSearchQuery}
              value={searchQuery}
            />
          </div>

          {/* 内容区域 - 响应式网格 */}
          {storeLoading ? (
            <Row gutter={[24, 24]}>
              {[...Array(8)].map((_, i) => (
                <Col
                  key={i}
                  xs={24}  // 手机: 1列
                  sm={12}  // 平板竖屏: 2列
                  md={12}  // 平板横屏: 2列
                  lg={8}   // 小桌面: 3列
                  xl={6}   // 大桌面: 4列
                  xxl={6}  // 超大桌面: 4列
                >
                  {renderSkeleton()}
                </Col>
              ))}
            </Row>
          ) : filteredGames.length === 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
                background: "rgba(31, 41, 55, 0.3)",
                borderRadius: 12,
                border: "1px solid rgba(99, 102, 241, 0.15)",
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: "#9ca3af", fontSize: 16 }}>
                    {searchQuery ? `未找到包含 "${searchQuery}" 的游戏` : "暂无可购买的游戏"}
                  </span>
                }
              />
            </div>
          ) : (
            <>
              {/* 结果统计 */}
              <div
                style={{
                  marginBottom: 20,
                  color: "#9ca3af",
                  fontSize: 14,
                }}
              >
                共找到 <span style={{ color: "#6366f1", fontWeight: 600 }}>{filteredGames.length}</span> 款游戏
              </div>

              {/* 游戏卡片网格 */}
              <Row gutter={[24, 24]}>
                {filteredGames.map((game: GameDTO, index: number) => (
                  <Col
                    key={game.gameId}
                    xs={24}  // 手机: 1列
                    sm={12}  // 平板竖屏: 2列
                    md={12}  // 平板横屏: 2列
                    lg={8}   // 小桌面: 3列
                    xl={6}   // 大桌面: 4列
                    xxl={6}  // 超大桌面: 4列
                  >
                    {renderGameCard(game, index)}
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      </Content>

      {/* 游戏详情弹窗 */}
      <GameDetailModal
        game={selectedGame}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </Layout>
  );
}