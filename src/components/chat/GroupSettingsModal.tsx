// src/components/chat/GroupSettingsModal.tsx
import React, { useState } from 'react';
import { Modal, List, Avatar, Button, Popconfirm, Typography, Space, Divider } from 'antd';
import {
    UserOutlined,
    CrownOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { GroupMember, GroupChat } from '@/types/chat';

const { Text, Title } = Typography;

interface GroupSettingsModalProps {
    open: boolean;
    group: GroupChat | null;
    members: GroupMember[];
    currentUserId: number;
    onClose: () => void;
    onDissolveGroup?: (conversationId: number) => void;
}

/**
 * Group chat settings modal
 */
export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
                                                                          open,
                                                                          group,
                                                                          members,
                                                                          currentUserId,
                                                                          onClose,
                                                                          onDissolveGroup,
                                                                      }) => {
    const [dissolving, setDissolving] = useState(false);

    if (!group) return null;

    const isOwner = group.ownerId
        ? Number(group.ownerId) === currentUserId
        : false;

    // Dissolve group chat
    const handleDissolveGroup = async () => {
        if (!onDissolveGroup) return;

        setDissolving(true);
        try {
            await onDissolveGroup(group.id);
            onClose();
        } catch (error) {
            console.error('Failed to dissolve group chat:', error);
        } finally {
            setDissolving(false);
        }
    };

    return (
        <Modal
            title="Group Chat Settings"
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            {/* Group chat information */}
            <div style={{ marginBottom: 24 }}>
                <Title level={5}>{group.title}</Title>
                <Text type="secondary">Group ID: {group.id}</Text>
            </div>

            <Divider />

            {/* Member list */}
            <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                    Member List ({members.length})
                </Title>
                <List
                    dataSource={members}
                    renderItem={(member) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar style={{ background: '#87d068' }}>
                                        <UserOutlined />
                                    </Avatar>
                                }
                                title={
                                    <Space>
                                        <span>{member.nickname || member.username}</span>
                                        {member.role === 'owner' && (
                                            <CrownOutlined style={{ color: '#faad14' }} title="Owner" />
                                        )}
                                        {member.userId === currentUserId && (
                                            <Text type="secondary">(You)</Text>
                                        )}
                                    </Space>
                                }
                                description={`User ID: ${member.userId}`}
                            />
                        </List.Item>
                    )}
                />
            </div>

            <Divider />

            {/* Dangerous operations */}
            {isOwner && (
                <div>
                    <Title level={5} style={{ marginBottom: 16, color: '#ff4d4f' }}>
                        Dangerous Operations
                    </Title>
                    <Popconfirm
                        title="Confirm to dissolve group chat?"
                        description="All members will be removed after dissolution, this action is irreversible"
                        onConfirm={handleDissolveGroup}
                        okText="Confirm Dissolution"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            loading={dissolving}
                            block
                        >
                            Dissolve Group Chat
                        </Button>
                    </Popconfirm>
                </div>
            )}

            {!isOwner && (
                <Text type="secondary">
                    Only the group owner can dissolve the group chat
                </Text>
            )}
        </Modal>
    );
};