// src/components/friend/AddMembersModal.tsx

import React, { useState } from 'react';
import { Modal, List, Button, Empty, Avatar, Checkbox, Space, message } from 'antd';
import { UserOutlined, UserAddOutlined } from '@ant-design/icons';
import type { Friend } from '@/types/friend';

interface AddMembersModalProps {
    open: boolean;
    conversationId: number;
    friends: Friend[];
    onClose: () => void;
    onSubmit: (conversationId: number, userIds: number[]) => Promise<void>;
    onSuccess?: () => void;
}

export default function AddMembersModal({
                                            open,
                                            conversationId,
                                            friends,
                                            onClose,
                                            onSubmit,
                                            onSuccess,
                                        }: AddMembersModalProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const handleToggle = (friendId: number) => {
        setSelectedIds((prev) =>
            prev.includes(friendId)
                ? prev.filter((id) => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) {
            message.warning('请选择要添加的好友');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(conversationId, selectedIds);
            message.success(`成功添加 ${selectedIds.length} 位成员`);
            setSelectedIds([]);
            onSuccess?.();
            onClose();
        } catch (error) {
            message.error(error.message || '添加成员失败');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedIds([]);
        onClose();
    };

    return (
        <Modal
            title="添加成员"
            open={open}
            onCancel={handleClose}
            width={600}
            footer={[
                <Button key="cancel" onClick={handleClose}>
                    取消
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<UserAddOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={selectedIds.length === 0}
                >
                    添加 {selectedIds.length > 0 && `(${selectedIds.length})`}
                </Button>,
            ]}
        >
            <div style={{ marginBottom: 16, color: '#666' }}>
                从好友列表中选择要添加的成员（只能添加好友）
            </div>

            {friends.length > 0 ? (
                <List
                    dataSource={friends}
                    renderItem={(friend) => {
                        const isSelected = selectedIds.includes(friend.uid);

                        return (
                            <List.Item
                                style={{
                                    cursor: 'pointer',
                                    background: isSelected ? '#e6f7ff' : 'transparent',
                                    padding: '12px',
                                    borderRadius: 8,
                                }}
                                onClick={() => handleToggle(friend.uid)}
                            >
                                <Space>
                                    <Checkbox checked={isSelected} />
                                    <Avatar icon={<UserOutlined />} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>
                                            {friend.remark || friend.username}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#999' }}>
                                            {friend.email}
                                        </div>
                                    </div>
                                </Space>
                            </List.Item>
                        );
                    }}
                />
            ) : (
                <Empty description="暂无好友可添加" />
            )}
        </Modal>
    );
}