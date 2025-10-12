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
  
  // 使用 Library Hook
  const { 
    filteredGames, 
    loading: libraryLoading, 
    searchQuery, 
    setSearchQuery 
  } = useLibrary();
  
  // 使用 Orders Hook
  const { 
    selectedOrder, 
    fetchOrders,
    fetchOrderDetail, 
    setSelectedOrder 
  } = useOrders();
  
  // 激活码模态框状态
  const [selectedGame, setSelectedGame] = useState<OwnedGame | null>(null);
  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

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
          try {
            await fetchOrderDetail(r.orderId);
            setOrderOpen(true);
          } catch (error: any) {
            message.error(error?.message || '获取详情失败');
          }
        }}
      >
        详情
      </Button>
    ] },
  ];

  return (
    <>
      {/* 顶部导航栏 */}
      <Menubar currentPath="/dashboard/library" />

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
