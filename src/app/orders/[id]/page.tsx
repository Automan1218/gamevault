"use client";

import React, { useEffect, useState } from "react";
import { PageContainer, ProDescriptions } from "@ant-design/pro-components";
import { App, Tag } from "antd";
import { useParams } from "next/navigation";

type OrderItem = { gameId: number; unitPrice: number; discountPrice?: number; activationCode?: string };
type OrderDetail = {
  orderItemId: number; // 以订单项为详情主键
  orderId: number;
  userId: number;
  gameId: number;
  orderDate: string;
  orderStatus: string;
  unitPrice: number;
  discountPrice?: number;
  // 扩展：后端可联表带出激活码
  activationCodes?: string[];
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        const res = await fetch(`/api/orders/${params.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const d = await res.json();
        if (!res.ok) throw new Error(d?.message || "加载失败");
        setDetail(d);
      } catch (e: any) { message.error(e?.message || "加载失败"); }
    })();
  }, [params.id, message]);

  return (
    <PageContainer header={{ title: `订单详情` }}>
      {detail && (
        <>
          <ProDescriptions column={2} dataSource={detail} columns={[
            { title: "订单项ID", dataIndex: "orderItemId" },
            { title: "订单ID", dataIndex: "orderId" },
            { title: "用户ID", dataIndex: "userId" },
            { title: "游戏ID", dataIndex: "gameId" },
            { title: "下单时间", dataIndex: "orderDate", valueType: "dateTime" },
            { title: "状态", dataIndex: "orderStatus", render: (_, r) => <Tag>{r.orderStatus}</Tag> },
            { title: "单价", dataIndex: "unitPrice", valueType: "money" },
            { title: "折后价", dataIndex: "discountPrice", valueType: "money" },
          ]} />
          {detail.activationCodes && detail.activationCodes.length > 0 && (
            <>
              <ProDescriptions title="激活码" dataSource={{}} columns={[] as any} />
              <ul style={{ marginTop: 12 }}>
                {detail.activationCodes.map((code, idx) => (
                  <li key={idx} style={{ padding: 8, borderBottom: "1px solid #222" }}>{code}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}


