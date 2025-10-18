import React, { useState } from 'react';
import { Modal, List, Button, Empty, Tag, Space, Tabs } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { FriendRequest } from '@/types/friend';

interface FriendRequestsModalProps {
    open: boolean;
    onClose: () => void;
    receivedRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    onHandle: (requestId: number, accept: boolean) => Promise<void>;
    onLoadSentRequests: () => Promise<void>;
}

export default function FriendRequestsModal({
                                                open,
                                                onClose,
                                                receivedRequests,
                                                sentRequests,
                                                onHandle,
                                                onLoadSentRequests,
                                            }: FriendRequestsModalProps) {
    const [handlingId, setHandlingId] = useState<number | null>(null);

    const handleAccept = async (requestId: number) => {
        setHandlingId(requestId);
        try {
            await onHandle(requestId, true);
        } finally {
            setHandlingId(null);
        }
    };

    const handleReject = async (requestId: number) => {
        setHandlingId(requestId);
        try {
            await onHandle(requestId, false);
        } finally {
            setHandlingId(null);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    };

    const ReceivedRequestsList = () => (
        <List
            dataSource={receivedRequests}
            locale={{ emptyText: <Empty description="暂无好友请求" /> }}
            renderItem={(request) => (
                <List.Item
                    actions={[
                        <Space key="actions">
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={handlingId === request.id}
                                onClick={() => handleAccept(request.id)}
                            >
                                接受
                            </Button>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                loading={handlingId === request.id}
                                onClick={() => handleReject(request.id)}
                            >
                                拒绝
                            </Button>
                        </Space>,
                    ]}
                >
                    <List.Item.Meta
                        title={
                            <div>
                                <span style={{ fontWeight: 600 }}>{request.fromUsername}</span>
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                    {request.fromEmail}
                                </Tag>
                            </div>
                        }
                        description={
                            <div>
                                {request.message && (
                                    <div style={{ marginBottom: 4 }}>
                                        留言：{request.message}
                                    </div>
                                )}
                                <div style={{ color: '#999', fontSize: 12 }}>
                                    {formatTime(request.createdAt)}
                                </div>
                            </div>
                        }
                    />
                </List.Item>
            )}
        />
    );

    const SentRequestsList = () => (
        <List
            dataSource={sentRequests}
            locale={{ emptyText: <Empty description="暂无发送的请求" /> }}
            renderItem={(request) => (
                <List.Item>
                    <List.Item.Meta
                        title={
                            <div>
                                <span style={{ fontWeight: 600 }}>{request.toUsername}</span>
                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                    等待确认
                                </Tag>
                            </div>
                        }
                        description={
                            <div>
                                <div style={{ marginBottom: 4 }}>
                                    发送至：{request.toEmail}
                                </div>
                                {request.message && (
                                    <div style={{ marginBottom: 4 }}>
                                        留言：{request.message}
                                    </div>
                                )}
                                <div style={{ color: '#999', fontSize: 12 }}>
                                    {formatTime(request.createdAt)}
                                </div>
                            </div>
                        }
                    />
                </List.Item>
            )}
        />
    );

    return (
        <Modal
            title="好友请求"
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Tabs
                items={[
                    {
                        key: 'received',
                        label: `收到的请求${receivedRequests.length > 0 ? ` (${receivedRequests.length})` : ''}`,
                        children: <ReceivedRequestsList />,
                    },
                    {
                        key: 'sent',
                        label: `发送的请求${sentRequests.length > 0 ? ` (${sentRequests.length})` : ''}`,
                        children: <SentRequestsList />,
                    },
                ]}
                onChange={(key) => {
                    if (key === 'sent') {
                        onLoadSentRequests();
                    }
                }}
            />
        </Modal>
    );
}