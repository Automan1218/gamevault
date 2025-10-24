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
            message.warning('Please select friends to add');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(conversationId, selectedIds);
            message.success(`Successfully added ${selectedIds.length} members`);
            setSelectedIds([]);
            onSuccess?.();
            onClose();
        } catch (error) {
            message.error(error.message || 'Failed to add members');
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
            title="Add Members"
            open={open}
            onCancel={handleClose}
            width={600}
            footer={[
                <Button key="cancel" onClick={handleClose}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<UserAddOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={selectedIds.length === 0}
                >
                    Add {selectedIds.length > 0 && `(${selectedIds.length})`}
                </Button>,
            ]}
        >
            <div style={{ marginBottom: 16, color: '#666' }}>
                Select members to add from your friends list (can only add friends)
            </div>

            {friends.length > 0 ? (
                <List
                    dataSource={friends}
                    renderItem={(friend) => {
                        const isSelected = selectedIds.includes(friend.userId);

                        return (
                            <List.Item
                                style={{
                                    cursor: 'pointer',
                                    background: isSelected ? '#e6f7ff' : 'transparent',
                                    padding: '12px',
                                    borderRadius: 8,
                                }}
                                onClick={() => handleToggle(friend.userId)}
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
                <Empty description="No friends available to add" />
            )}
        </Modal>
    );
}