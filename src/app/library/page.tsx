"use client";

import React, { useEffect, useState } from "react";
import { ProTable } from "@ant-design/pro-components";
import { App, Tabs, Badge, Button, Card, Pagination, List } from "antd";
import { PlaySquareOutlined, ShoppingCartOutlined, EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-components";
import { PageContainer, GameCard, EmptyState, Menubar } from '@/components/layout';
import { SearchForm } from '@/components/forms';
import { ActivationCodesModal, OrderDetailModal } from '@/components/modals';
import { navigationRoutes } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import '@/components/common/animations.css';

// Frontend display model aligned with database structure
type OwnedGame = {
  gameId: number;       // games.game_id
  title: string;        // games.title
  price?: number;       // games.price optional
  activationCodes: {    // All activation codes for this game
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
  
  // Activation codes modal state
  const [selectedGame, setSelectedGame] = useState<OwnedGame | null>(null);
  const [codesModalOpen, setCodesModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(`/api/library`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Loading failed");
        
        // Deduplicate backend data by game ID and merge activation codes
        const rawItems = data?.items || [];
        const gameMap = new Map<number, OwnedGame>();
        
        rawItems.forEach((item: any) => {
          const gameId = item.gameId;
          if (gameMap.has(gameId)) {
            // If game already exists, add activation code
            gameMap.get(gameId)!.activationCodes.push({
              activationId: item.activationId,
              code: item.activationCode
            });
          } else {
            // Create new game record
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
        message.error(e?.message || "Loading failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [message]);

  const filtered = games.filter(g => (g.title || "").toLowerCase().includes(q.toLowerCase()));

  const orderColumns: ProColumns<any>[] = [
    { title: "Order ID", dataIndex: "orderId" },
    { title: "Created Time", dataIndex: "createdAt", valueType: "dateTime" },
    { title: "Status", dataIndex: "status", render: (_, r) => <Badge status={r.status === 'PAID' || r.status === 'COMPLETED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'error'} text={r.status} /> },
    { title: "Total", dataIndex: "total", valueType: "money" },
    { title: "Actions", valueType: 'option', render: (_, r) => [
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
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`/api/orders/${r.orderId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const d = await res.json();
      if (res.ok) { setOrderDetail(d); setOrderOpen(true); } else { message.error(d?.message || 'Failed to get details'); }
        }}
      >
        Details
      </Button>
    ] },
  ];

  return (
    <>
      {/* Top navigation bar */}
      <Menubar currentPath="/library" />

      <PageContainer
        title="My Game Library"
        subtitle="Manage your game collection • Explore infinite possibilities"
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
            Owned Games
          </span>
        ), children: (
          <>
            <SearchForm
              placeholder="Search games"
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
                title="No Games Yet"
                description="Start your gaming journey and explore amazing worlds"
                subDescription="Your purchased games will appear here"
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
                Purchase History
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
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
            }}
            request={async (params) => {
              const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
              const res = await fetch(`/api/orders`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
              const d = await res.json();
              if (!res.ok) return { success: false, data: [], total: 0 } as any;
              
              // Sort order data: by creation time descending, then by order ID descending when time is the same
              const sortedData = (d.items || []).sort((a: any, b: any) => {
                const timeA = new Date(a.createdAt).getTime();
                const timeB = new Date(b.createdAt).getTime();
                
                if (timeA !== timeB) {
                  return timeB - timeA; // Time descending
                }
                return b.orderId - a.orderId; // Order ID descending
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

      {/* Activation codes view modal */}
      <ActivationCodesModal
        open={codesModalOpen}
        onClose={() => setCodesModalOpen(false)}
        gameTitle={selectedGame?.title}
        activationCodes={selectedGame?.activationCodes || []}
      />

      {/* Order details modal */}
      <OrderDetailModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        orderDetail={orderDetail}
      />
      </PageContainer>
    </>
  );
}
