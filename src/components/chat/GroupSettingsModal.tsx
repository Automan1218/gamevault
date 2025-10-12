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
 * 群聊设置弹窗
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

    // 解散群聊
    const handleDissolveGroup = async () => {
        if (!onDissolveGroup) return;

        setDissolving(true);
        try {
            await onDissolveGroup(group.id);
            onClose();
        } catch (error) {
            console.error('解散群聊失败:', error);
        } finally {
            setDissolving(false);
        }
    };

    return (
        <Modal
            title="群聊设置"
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            {/* 群聊信息 */}
            <div style={{ marginBottom: 24 }}>
                <Title level={5}>{group.title}</Title>
                <Text type="secondary">群聊 ID: {group.id}</Text>
            </div>

            <Divider />

            {/* 成员列表 */}
            <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                    成员列表 ({members.length})
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
                                            <CrownOutlined style={{ color: '#faad14' }} title="群主" />
                                        )}
                                        {member.userId === currentUserId && (
                                            <Text type="secondary">(你)</Text>
                                        )}
                                    </Space>
                                }
                                description={`用户 ID: ${member.userId}`}
                            />
                        </List.Item>
                    )}
                />
            </div>

            <Divider />

            {/* 危险操作 */}
            {isOwner && (
                <div>
                    <Title level={5} style={{ marginBottom: 16, color: '#ff4d4f' }}>
                        危险操作
                    </Title>
                    <Popconfirm
                        title="确认解散群聊？"
                        description="解散后所有成员将被移除，此操作不可恢复"
                        onConfirm={handleDissolveGroup}
                        okText="确认解散"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            loading={dissolving}
                            block
                        >
                            解散群聊
                        </Button>
                    </Popconfirm>
                </div>
            )}

            {!isOwner && (
                <Text type="secondary">
                    只有群主可以解散群聊
                </Text>
            )}
        </Modal>
    );
};