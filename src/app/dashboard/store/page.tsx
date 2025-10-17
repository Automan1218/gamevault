"use client";

import React, { useState, useEffect } from "react";
import { 
  App, 
  Card, 
  Row, 
  Col, 
  Layout, 
  Empty,
  Skeleton,
  Button,
  Space,
  Tag
} from "antd";
import { Menubar } from "@/components/layout";
import { GameDetailModal } from "@/components/modals/GameDetailModal";
import { useStore } from "@/app/features/store/hooks/useStore";
import { useSearchParams } from "next/navigation";
import type { GameDTO } from "@/lib/api/StoreTypes";
import { getFullImageUrl } from "@/lib/utils/imageUtils";
import "@/components/common/animations.css";

const { Header, Content } = Layout;

export default function ShoppingPage() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') || '';
  const { games, loading: storeLoading, setSearchQuery } = useStore(initialQ);

  const [selectedGame, setSelectedGame] = useState<GameDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 筛选器状态
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // 确保只在客户端渲染动态内容
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCardClick = (game: GameDTO) => {
    setSelectedGame(game);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedGame(null), 300);
  };

  // 获取筛选选项
  const getFilterOptions = () => {
    const years = new Set<string>();
    const platforms = new Set<string>();
    const genres = new Set<string>();

    games.forEach(game => {
      if (game.releaseDate) {
        const year = new Date(game.releaseDate).getFullYear().toString();
        years.add(year);
      }
      if (game.platform) {
        platforms.add(game.platform);
      }
      if (game.genre) {
        genres.add(game.genre);
      }
    });

    return {
      years: Array.from(years).sort((a, b) => b.localeCompare(a)), // 降序排列
      platforms: Array.from(platforms).sort(),
      genres: Array.from(genres).sort()
    };
  };

  // 应用筛选
  const applyFilters = (games: GameDTO[]) => {
    return games.filter(game => {
      const yearMatch = !selectedYear || (game.releaseDate && 
        new Date(game.releaseDate).getFullYear().toString() === selectedYear);
      const platformMatch = !selectedPlatform || game.platform === selectedPlatform;
      const genreMatch = !selectedGenre || game.genre === selectedGenre;
      
      return yearMatch && platformMatch && genreMatch;
    });
  };

  // 获取筛选后的游戏列表（基于后端检索结果）
  const displayGames = applyFilters(games);

  // 当 URL 的 q 变化时，同步触发检索
  useEffect(() => {
    setSearchQuery(initialQ);
  }, [initialQ, setSearchQuery]);

  // 清除所有筛选
  const clearAllFilters = () => {
    setSelectedYear(null);
    setSelectedPlatform(null);
    setSelectedGenre(null);
  };

  const filterOptions = getFilterOptions();

  // 渲染游戏卡片
  const renderGameCard = (game: GameDTO, index: number) => (
    <Card
      className="fade-in-up"
      hoverable
      onClick={() => handleCardClick(game)}
      style={{
        borderRadius: 20,
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        overflow: "hidden",
        animationDelay: `${index * 0.1}s`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-12px) scale(1.02)";
        e.currentTarget.style.boxShadow = `
          0 20px 60px rgba(99, 102, 241, 0.3),
          0 0 0 1px rgba(99, 102, 241, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `;
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = `
          0 8px 32px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `;
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
      }}
      cover={
        <div
          style={{
            height: 220,
            background: `url(${getFullImageUrl(game.imageUrl)}) center/cover no-repeat`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 渐变遮罩 */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
            }}
          />
          
          {/* 折扣标签 */}
          {game.discountPrice && (
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(255, 107, 107, 0.4)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              -{Math.round(((game.price - game.discountPrice) / game.price) * 100)}%
            </div>
          )}
          
          {/* 游戏类型标签 */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {game.genre || "游戏"}
          </div>
        </div>
      }
      styles={{ 
        body: { 
          padding: 24, 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "space-between"
        }
      }}
    >
      <div>
        {/* 游戏标题 */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: "#fff",
            marginBottom: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}
          title={game.title}
        >
          {game.title}
        </div>

        {/* 游戏描述 */}
        <div
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 14,
            lineHeight: 1.4,
            marginBottom: 16,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {game.description || "一款精彩的游戏，等待您的探索..."}
        </div>

        {/* 价格区域 */}
        <div style={{ 
          marginBottom: 16, 
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
          {game.discountPrice ? (
            <>
                <div style={{ 
                  color: "#4ade80", 
                  fontWeight: 700, 
                  fontSize: 24,
                  lineHeight: 1
                }}>
                ￥{game.discountPrice.toFixed(2)}
              </div>
              <div
                style={{
                  textDecoration: "line-through",
                    color: "rgba(255, 255, 255, 0.5)",
                  fontSize: 14,
                    marginTop: 4,
                }}
              >
                ￥{game.price.toFixed(2)}
              </div>
            </>
          ) : (
              <div style={{ 
                color: "#fff", 
                fontWeight: 700, 
                fontSize: 24,
                lineHeight: 1
              }}>
              ￥{game.price.toFixed(2)}
            </div>
          )}
      </div>

          {/* 平台信息 */}
          <div
            style={{
              background: "rgba(99, 102, 241, 0.2)",
              color: "#a5b4fc",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            {game.platform || "PC"}
          </div>
        </div>
      </div>

    </Card>
  );

  // 渲染骨架屏
  const renderSkeleton = () => (
    <Card
      style={{
        borderRadius: 20,
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Skeleton.Image
        active
        style={{ 
          width: "100%", 
          height: 220, 
          marginBottom: 0,
          borderRadius: 0,
        }}
      />
      <div style={{ padding: 24 }}>
      <Skeleton active paragraph={{ rows: 3 }} />
      </div>
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
        
        {/* 星光点缀 - 只在客户端渲染 */}
        {isClient && [...Array(20)].map((_, i) => (
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
        <Menubar currentPath="/dashboard/store" />
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
          {/* 筛选器区域 */}
          <div 
            style={{
              marginBottom: 32,
              padding: "20px 24px",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* 时间筛选 */}
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  marginRight: 12,
                  minWidth: 50,
                  opacity: 0.9,
                }}
              >
                时间
              </div>
              <Space wrap size={[6, 6]}>
                <Button
                  type={selectedYear === null ? "primary" : "default"}
                  size="small"
                  onClick={() => setSelectedYear(null)}
                  style={{
                    background: selectedYear === null 
                      ? "rgba(99, 102, 241, 0.8)" 
                      : "rgba(255, 255, 255, 0.08)",
                    border: selectedYear === null 
                      ? "1px solid rgba(99, 102, 241, 0.6)" 
                      : "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    fontWeight: 500,
                    borderRadius: 8,
                    height: 28,
                    padding: "0 12px",
                    fontSize: 12,
                    transition: "all 0.3s ease",
                  }}
                >
                  全部
                </Button>
                {filterOptions.years.map(year => (
                  <Button
                    key={year}
                    type={selectedYear === year ? "primary" : "default"}
                    size="small"
                    onClick={() => setSelectedYear(year)}
                    style={{
                      background: selectedYear === year 
                        ? "rgba(99, 102, 241, 0.8)" 
                        : "rgba(255, 255, 255, 0.08)",
                      border: selectedYear === year 
                        ? "1px solid rgba(99, 102, 241, 0.6)" 
                        : "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#fff",
                      fontWeight: 500,
                      borderRadius: 8,
                      height: 28,
                      padding: "0 12px",
                      fontSize: 12,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {year}
                  </Button>
                ))}
              </Space>
            </div>

            {/* 平台筛选 */}
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  marginRight: 12,
                  minWidth: 50,
                  opacity: 0.9,
                }}
              >
                平台
              </div>
              <Space wrap size={[6, 6]}>
                <Button
                  type={selectedPlatform === null ? "primary" : "default"}
                  size="small"
                  onClick={() => setSelectedPlatform(null)}
                  style={{
                    background: selectedPlatform === null 
                      ? "rgba(99, 102, 241, 0.8)" 
                      : "rgba(255, 255, 255, 0.08)",
                    border: selectedPlatform === null 
                      ? "1px solid rgba(99, 102, 241, 0.6)" 
                      : "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    fontWeight: 500,
                    borderRadius: 8,
                    height: 28,
                    padding: "0 12px",
                    fontSize: 12,
                    transition: "all 0.3s ease",
                  }}
                >
                  全部
                </Button>
                {filterOptions.platforms.map(platform => (
                  <Button
                    key={platform}
                    type={selectedPlatform === platform ? "primary" : "default"}
                    size="small"
                    onClick={() => setSelectedPlatform(platform)}
                    style={{
                      background: selectedPlatform === platform 
                        ? "rgba(99, 102, 241, 0.8)" 
                        : "rgba(255, 255, 255, 0.08)",
                      border: selectedPlatform === platform 
                        ? "1px solid rgba(99, 102, 241, 0.6)" 
                        : "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#fff",
                      fontWeight: 500,
                      borderRadius: 8,
                      height: 28,
                      padding: "0 12px",
                      fontSize: 12,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {platform}
                  </Button>
                ))}
              </Space>
            </div>

            {/* 类型筛选 */}
            <div style={{ marginBottom: 0, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  marginRight: 12,
                  minWidth: 50,
                  opacity: 0.9,
                }}
              >
                类型
              </div>
              <Space wrap size={[6, 6]}>
                <Button
                  type={selectedGenre === null ? "primary" : "default"}
                  size="small"
                  onClick={() => setSelectedGenre(null)}
                  style={{
                    background: selectedGenre === null 
                      ? "rgba(99, 102, 241, 0.8)" 
                      : "rgba(255, 255, 255, 0.08)",
                    border: selectedGenre === null 
                      ? "1px solid rgba(99, 102, 241, 0.6)" 
                      : "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    fontWeight: 500,
                    borderRadius: 8,
                    height: 28,
                    padding: "0 12px",
                    fontSize: 12,
                    transition: "all 0.3s ease",
                  }}
                >
                  全部
                </Button>
                {filterOptions.genres.map(genre => (
                  <Button
                    key={genre}
                    type={selectedGenre === genre ? "primary" : "default"}
                    size="small"
                    onClick={() => setSelectedGenre(genre)}
                    style={{
                      background: selectedGenre === genre 
                        ? "rgba(99, 102, 241, 0.8)" 
                        : "rgba(255, 255, 255, 0.08)",
                      border: selectedGenre === genre 
                        ? "1px solid rgba(99, 102, 241, 0.6)" 
                        : "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#fff",
                      fontWeight: 500,
                      borderRadius: 8,
                      height: 28,
                      padding: "0 12px",
                      fontSize: 12,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {genre}
                  </Button>
                ))}
              </Space>
            </div>
          </div>

          {/* 内容区域 - 响应式网格 */}
          {storeLoading ? (
            <Row gutter={[32, 32]}>
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
          ) : displayGames.length === 0 ? (
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
                    暂无可购买的游戏
                  </span>
                }
              />
            </div>
          ) : (
            <>
              {/* 结果统计 */}
              <div
                style={{
                  marginBottom: 32,
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: "center",
                  padding: "16px 24px",
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                共找到 <span style={{ color: "#4ade80", fontWeight: 700 }}>{displayGames.length}</span> 款精彩游戏
              </div>

              {/* 游戏卡片网格 */}
              <Row gutter={[32, 32]}>
                {displayGames.map((game: GameDTO, index: number) => (
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