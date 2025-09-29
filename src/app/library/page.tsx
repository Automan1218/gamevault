"use client";

import React, { useEffect, useState } from "react";
import { ProTable } from "@ant-design/pro-components";
import { App, Tabs, Badge, Button, Card, Pagination, List } from "antd";
import { PlaySquareOutlined, ShoppingCartOutlined, EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-components";
import { PageContainer, GameCard, EmptyState, UserMenu } from '@/components/layout';
import { SearchForm } from '@/components/forms';
import { ActivationCodesModal, OrderDetailModal } from '@/components/modals';
import { navigationRoutes } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import '@/components/common/animations.css';

// 与数据库结构对齐的前端展示模型
type OwnedGame = {
  gameId: number;       // games.game_id
  title: string;        // games.title
  price?: number;       // games.price 可选
  activationCodes: {    // 该游戏的所有激活码
    activationId: number;
    code: string;
  }[];
};

export default function LibraryPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [games, setGames] = useState<OwnedGame[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>("library");
  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 激活码模态框状态
  const [selectedGame, setSelectedGame] = useState<OwnedGame | null>(null);
  const [codesModalOpen, setCodesModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        const res = await fetch(`/api/library`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "加载失败");
        
        // 将后端返回的数据按游戏ID去重，合并激活码
        const rawItems = data?.items || [];
        const gameMap = new Map<number, OwnedGame>();
        
        rawItems.forEach((item: any) => {
          const gameId = item.gameId;
          if (gameMap.has(gameId)) {
            // 如果游戏已存在，添加激活码
            gameMap.get(gameId)!.activationCodes.push({
              activationId: item.activationId,
              code: item.activationCode
            });
          } else {
            // 创建新游戏记录
            gameMap.set(gameId, {
              gameId: item.gameId,
              title: item.title,
              price: item.price,
              activationCodes: [{
                activationId: item.activationId,
                code: item.activationCode
              }]
            });
          }
        });
        
        setGames(Array.from(gameMap.values()));
      } catch (e: any) {
        message.error(e?.message || "加载失败");
      } finally {
        setLoading(false);
      }
    })();
  }, [message]);

  const filtered = games.filter(g => (g.title || "").toLowerCase().includes(q.toLowerCase()));

  const orderColumns: ProColumns<any>[] = [
    { title: "订单ID", dataIndex: "orderId" },
    { title: "创建时间", dataIndex: "createdAt", valueType: "dateTime" },
    { title: "状态", dataIndex: "status", render: (_, r) => <Badge status={r.status === 'PAID' || r.status === 'COMPLETED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'error'} text={r.status} /> },
    { title: "总额", dataIndex: "total", valueType: "money" },
    { title: "操作", valueType: 'option', render: (_, r) => [
      <Button 
        key="detail" 
        type="link"
        size="small"
        icon={<EyeOutlined />}
        style={{
          color: '#6366f1',
          fontWeight: 500,
        }}
        onClick={async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const res = await fetch(`/api/orders/${r.orderId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const d = await res.json();
      if (res.ok) { setOrderDetail(d); setOrderOpen(true); } else { message.error(d?.message || '获取详情失败'); }
        }}
      >
        详情
      </Button>
    ] },
  ];

  return (
    <>
      {/* 返回商城按钮 - 页面左上角 */}
      <div style={{ 
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 1000,
      }}>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(navigationRoutes.home)}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: 8,
            height: 40,
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }}
        >
          返回商城
        </Button>
      </div>

      {/* 用户菜单 - 页面右上角 */}
      <UserMenu username="DawnZYC" />

      <PageContainer
        title="我的游戏库"
        subtitle="管理您的游戏收藏 • 探索无限可能"
        showBackground={true}
        showDecorations={true}
      >
      <Tabs 
        activeKey={tab} 
        onChange={setTab} 
        size="large"
        tabBarStyle={{
          marginBottom: 32,
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        }}
        items={[
        { key: 'library', label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlaySquareOutlined />
            已拥有的游戏
          </span>
        ), children: (
          <>
            <SearchForm
              placeholder="搜索游戏"
              onSearch={setQ}
              onChange={setQ}
              value={q}
            />
            {loading ? (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", 
                gap: 24 
              }}>
                {[...Array(6)].map((_, index) => (
                  <Card
                    key={index}
                    style={{
                      background: 'rgba(31, 41, 55, 0.8)',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: 16,
                    }}
                    loading={true}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="暂无游戏"
                description="开始您的游戏之旅，探索精彩世界"
                subDescription="购买游戏后，它们将出现在这里"
              />
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", 
                gap: 28,
                padding: '8px 0'
              }}>
                {filtered.map((g, index) => (
                  <GameCard
                    key={g.gameId}
                    gameId={g.gameId}
                    title={g.title}
                    price={g.price}
                    activationCodesCount={g.activationCodes.length}
                    onViewCodes={() => {
                      setSelectedGame(g);
                      setCodesModalOpen(true);
                    }}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        )},
            { key: 'orders', label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCartOutlined />
                购买记录
              </span>
            ), children: (
          <ProTable
            rowKey="orderId"
            columns={orderColumns}
            search={false}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            }}
            request={async (params) => {
              const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
              const res = await fetch(`/api/orders`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
              const d = await res.json();
              if (!res.ok) return { success: false, data: [], total: 0 } as any;
              
              // 对订单数据进行排序：按创建时间降序，时间相同时按订单ID降序
              const sortedData = (d.items || []).sort((a: any, b: any) => {
                const timeA = new Date(a.createdAt).getTime();
                const timeB = new Date(b.createdAt).getTime();
                
                if (timeA !== timeB) {
                  return timeB - timeA; // 时间降序
                }
                return b.orderId - a.orderId; // 订单ID降序
              });
              
              return { 
                success: true, 
                data: sortedData, 
                total: sortedData.length 
              } as any;
            }}
            tableStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderRadius: 12,
            }}
          />
        )}
      ]} />

      {/* 激活码查看模态框 */}
      <ActivationCodesModal
        open={codesModalOpen}
        onClose={() => setCodesModalOpen(false)}
        gameTitle={selectedGame?.title}
        activationCodes={selectedGame?.activationCodes || []}
      />

      {/* 订单详情模态框 */}
      <OrderDetailModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        orderDetail={orderDetail}
      />
      </PageContainer>
    </>
  );
}
