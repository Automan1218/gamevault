"use client";

import React, { useState } from "react";
import { ProTable } from "@ant-design/pro-components";
import { App, Tabs, Badge, Button, Card } from "antd";
import { PlaySquareOutlined, ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-components";
import { PageContainer, GameCard, EmptyState, Menubar } from '@/components/layout';
import { SearchForm } from '@/components/forms';
import { ActivationCodesModal, OrderDetailModal } from '@/components/modals';
import { useLibrary } from '@/app/features/library/hooks/useLibrary';
import { useOrders } from '@/app/features/orders/hooks/useOrders';
import { OwnedGame } from '@/lib/api';
import '@/components/common/animations.css';

export default function LibraryPage() {
  const { message } = App.useApp();
  const [tab, setTab] = useState<string>("library");
  
  // Use Library Hook
  const { 
    filteredGames, 
    loading: libraryLoading, 
    searchQuery, 
    setSearchQuery 
  } = useLibrary();
  
  // Use Orders Hook
  const { 
    selectedOrder, 
    fetchOrders,
    fetchOrderDetail, 
    setSelectedOrder 
  } = useOrders();
  
  // Activation code modal state
  const [selectedGame, setSelectedGame] = useState<OwnedGame | null>(null);
  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

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
          try {
            await fetchOrderDetail(r.orderId);
            setOrderOpen(true);
          } catch (error: any) {
            message.error(error?.message || 'Failed to get details');
          }
        }}
      >
        Details
      </Button>
    ] },
  ];

  return (
    <>
      {/* Top navigation bar */}
      <Menubar currentPath="/dashboard/library" />

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
              onSearch={setSearchQuery}
              onChange={setSearchQuery}
              value={searchQuery}
            />
            {libraryLoading ? (
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
            ) : filteredGames.length === 0 ? (
              <EmptyState
                title="No Games Yet"
                description="Start your gaming journey and explore amazing worlds"
                subDescription="After purchasing games, they will appear here"
              />
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", 
                gap: 28,
                padding: '8px 0'
              }}>
                {filteredGames.map((g, index) => (
                  <GameCard
                    key={g.gameId}
                    gameId={g.gameId}
                    title={g.title}
                    price={g.price}
                    imageUrl={g.imageUrl}
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
              try {
                const currentPage = params.current ? params.current - 1 : 0;
                const pageSize = params.pageSize || 10;
                const response = await fetchOrders(currentPage, pageSize);
                return { 
                  success: true, 
                  data: response.items, 
                  total: response.totalCount 
                } as any;
              } catch (error) {
                return { success: false, data: [], total: 0 } as any;
              }
            }}
            tableStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderRadius: 12,
            }}
          />
        )}
      ]} />

      {/* Activation code view modal */}
      <ActivationCodesModal
        open={codesModalOpen}
        onClose={() => setCodesModalOpen(false)}
        gameTitle={selectedGame?.title}
        activationCodes={selectedGame?.activationCodes || []}
      />

      {/* Order details modal */}
      <OrderDetailModal
        open={orderOpen}
        onClose={() => {
          setOrderOpen(false);
          setSelectedOrder(null);
        }}
        orderDetail={selectedOrder}
      />
      </PageContainer>
    </>
  );
}
