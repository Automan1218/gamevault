import React, { useState } from 'react';
import { Modal, Input, List, Button, Empty, Spin, Tag, Space } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import type { UserSearchResult } from '@/types/friend';

interface SearchUserModalProps {
    open: boolean;
    onClose: () => void;
    onSearch: (keyword: string) => Promise<UserSearchResult[]>;
    onSendRequest: (userId: number, message?: string) => Promise<void>;
}

export default function SearchUserModal({
                                            open,
                                            onClose,
                                            onSearch,
                                            onSendRequest,
                                        }: SearchUserModalProps) {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [sendingTo, setSendingTo] = useState<number | null>(null);

    const handleSearch = async () => {
        if (!keyword.trim()) {
            return;
        }

        setSearching(true);
        try {
            const results = await onSearch(keyword.trim());
            setSearchResults(results);
        } finally {
            setSearching(false);
        }
    };

    const handleSendRequest = async (user: UserSearchResult) => {
        setSendingTo(user.userId);
        try {
            await onSendRequest(user.userId, `你好，我想加你为好友`);
            // 更新本地状态
            setSearchResults(prev =>
                prev.map(u => u.userId === user.userId ? { ...u, hasPending: true } : u)
            );
        } finally {
            setSendingTo(null);
        }
    };

    const handleClose = () => {
        setKeyword('');
        setSearchResults([]);
        onClose();
    };

    return (
        <Modal
            title="添加好友"
            open={open}
            onCancel={handleClose}
            footer={null}
            width={600}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Input.Search
                    placeholder="输入邮箱或用户名搜索"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onSearch={handleSearch}
                    enterButton={<SearchOutlined />}
                    size="large"
                    loading={searching}
                />

                {searching ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin tip="搜索中..." />
                    </div>
                ) : searchResults.length > 0 ? (
                    <List
                        dataSource={searchResults}
                        renderItem={(user) => (
                            <List.Item
                                actions={[
                                    user.isFriend ? (
                                        <Tag color="green">已是好友</Tag>
                                    ) : user.hasPending ? (
                                        <Tag color="orange">已发送请求</Tag>
                                    ) : (
                                        <Button
                                            type="primary"
                                            icon={<UserAddOutlined />}
                                            loading={sendingTo === user.userId}
                                            onClick={() => handleSendRequest(user)}
                                        >
                                            添加好友
                                        </Button>
                                    ),
                                ]}
                            >
                                <List.Item.Meta
                                    title={user.username}
                                    description={user.email}
                                />
                            </List.Item>
                        )}
                    />
                ) : keyword && !searching ? (
                    <Empty description="未找到相关用户" />
                ) : null}
            </Space>
        </Modal>
    );
}