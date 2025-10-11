// src/app/dashboard/forum/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menubar } from '@/components/layout';
import {
    Button,
    Card,
    Col,
    ConfigProvider,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    Upload,
    Tooltip,
} from 'antd';
import {
    ArrowLeftOutlined,
    BoldOutlined,
    ItalicOutlined,
    LinkOutlined,
    OrderedListOutlined,
    PictureOutlined,
    UnorderedListOutlined,
    UploadOutlined,
    SendOutlined,
    SaveOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { PostsApi, CreatePostRequest } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import Divider from 'antd/es/divider';
import { getLoginRedirectUrl, navigationRoutes } from "@/lib/navigation";
import { darkTheme, cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CreatePostPageProps {
    title: string;
    body: string;
    content: string;
}

export default function CreatePostPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 检查登录状态
    useEffect(() => {
        if (mounted && !AuthApi.isAuthenticated()) {
            message.warning('请先登录');
            router.push(getLoginRedirectUrl(navigationRoutes.postCreate));
        }
    }, [mounted, router]);

    // 游戏分类
    const categories = [
        { value: '游戏讨论', icon: '💬', color: '#6366f1' },
        { value: '攻略分享', icon: '📖', color: '#8b5cf6' },
        { value: '游戏评测', icon: '⭐', color: '#06b6d4' },
        { value: '寻找队友', icon: '👥', color: '#10b981' },
        { value: '技术交流', icon: '⚙️', color: '#f59e0b' },
        { value: '游戏资讯', icon: '📰', color: '#ef4444' },
        { value: '其他', icon: '📦', color: '#6b7280' },
    ];

    // 热门标签
    const popularTags = [
        '原神', '王者荣耀', '英雄联盟', 'CS2', 'APEX',
        '永劫无间', '博德之门3', '黑神话悟空', '艾尔登法环',
        'Steam', 'Epic', '独立游戏', '3A大作', 'RPG',
        'FPS', 'MOBA', '开放世界', '恐怖游戏', '生存游戏',
    ];

    // 提交帖子
    const handleSubmit = async (values: CreatePostPageProps) => {
        try {
            setLoading(true);

            const postData: CreatePostRequest = {
                title: values.title,
                body: content || values.content,
            };

            await PostsApi.createPost(postData);

            message.success('发布成功！');

            // 跳转到论坛首页
            setTimeout(() => {
                router.push(navigationRoutes.forum);
            }, 500);
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(error.message || '发布失败');
            } else {
                message.error('发布失败，请重试');
            }
        } finally {
            setLoading(false);
        }
    };

    // 保存草稿
    const handleSaveDraft = () => {
        const values = form.getFieldsValue();
        localStorage.setItem('post_draft', JSON.stringify({
            ...values,
            content,
            tags: selectedTags,
            savedAt: new Date().toISOString(),
        }));
        message.success('草稿已保存');
    };

    // 加载草稿
    const loadDraft = () => {
        const draft = localStorage.getItem('post_draft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                form.setFieldsValue(draftData);
                setContent(draftData.content || '');
                setSelectedTags(draftData.tags || []);
                message.info(`已加载 ${new Date(draftData.savedAt).toLocaleString()} 的草稿`);
            } catch (error) {
                message.error('草稿加载失败');
            }
        } else {
            message.info('暂无草稿');
        }
    };

    // 清除草稿
    const clearDraft = () => {
        localStorage.removeItem('post_draft');
        form.resetFields();
        setContent('');
        setSelectedTags([]);
        message.success('草稿已清除');
    };

    // 插入格式化文本
    const insertFormat = (format: string) => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        let newText = '';

        switch (format) {
            case 'bold':
                newText = `**${selectedText || '粗体文本'}**`;
                break;
            case 'italic':
                newText = `*${selectedText || '斜体文本'}*`;
                break;
            case 'link':
                newText = `[${selectedText || '链接文本'}](URL)`;
                break;
            case 'image':
                newText = `![${selectedText || '图片描述'}](图片URL)`;
                break;
            case 'ul':
                newText = `\n- ${selectedText || '列表项'}\n`;
                break;
            case 'ol':
                newText = `\n1. ${selectedText || '列表项'}\n`;
                break;
            default:
                newText = selectedText;
        }

        const newContent = content.substring(0, start) + newText + content.substring(end);
        setContent(newContent);
        form.setFieldValue('content', newContent);
    };

    // 标签选择
    const handleTagSelect = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else if (selectedTags.length < 5) {
            setSelectedTags([...selectedTags, tag]);
        } else {
            message.warning('最多只能选择5个标签');
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <ConfigProvider theme={darkTheme}>
            {/* 顶部导航栏 */}
            <Menubar currentPath="/dashboard/forum/create" />
            
            <div 
                className="animate-fade-in-up"
                style={{
                    minHeight: '100vh',
                    background: `
                        radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                        radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                        radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                        linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
                    `,
                    paddingTop: '88px',
                    paddingBottom: '40px',
                }}
            >
                <div style={{ 
                    maxWidth: 1200, 
                    margin: '0 auto', 
                    padding: '0 24px',
                }}>
                    {/* 页面标题 */}
                    <Card 
                        className="animate-card-hover"
                        style={{ 
                            marginBottom: 24,
                            ...cardStyle,
                        }}
                        styles={{ body: { padding: '24px' } }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space size="large">
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.back()}
                                    size="large"
                                    style={{
                                        background: 'rgba(31, 41, 55, 0.8)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        color: '#d1d5db',
                                        borderRadius: '12px',
                                        height: '48px',
                                        fontWeight: 600,
                                    }}
                                >
                                    返回
                                </Button>
                                <div>
                                    <Title 
                                        level={2} 
                                        style={{ 
                                            margin: 0,
                                            color: '#f9fafb',
                                            fontSize: '32px',
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        ✍️ 发布新帖
                                    </Title>
                                    <Text style={{ color: '#9ca3af', fontSize: '14px', display: 'block', marginTop: '4px' }}>
                                        分享你的游戏见解与体验
                                    </Text>
                                </div>
                            </Space>
                        </div>
                    </Card>

                    {/* 主表单 */}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                    >
                        <Row gutter={24}>
                            <Col xs={24} lg={16}>
                                <Card 
                                    className="animate-card-hover"
                                    style={{
                                        marginBottom: 24,
                                        ...cardStyle,
                                    }}
                                    styles={{ body: { padding: '32px' } }}
                                >
                                    {/* 标题输入 */}
                                    <Form.Item
                                        label={
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                📝 帖子标题
                                            </span>
                                        }
                                        name="title"
                                        rules={[
                                            { required: true, message: '请输入标题' },
                                            { min: 5, message: '标题至少5个字符' },
                                            { max: 100, message: '标题最多100个字符' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="给你的帖子起个吸引人的标题吧..."
                                            size="large"
                                            showCount
                                            maxLength={100}
                                            style={{
                                                height: '56px',
                                                fontSize: '16px',
                                                borderRadius: '12px',
                                                background: 'rgba(31, 41, 55, 0.5)',
                                                border: '1px solid rgba(75, 85, 99, 0.3)',
                                                color: '#f9fafb',
                                            }}
                                        />
                                    </Form.Item>

                                    {/* Markdown 工具栏 */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <Space size="small" wrap>
                                            <Tooltip title="粗体 (Ctrl/Cmd + B)">
                                                <Button
                                                    type="text"
                                                    icon={<BoldOutlined />}
                                                    onClick={() => insertFormat('bold')}
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '8px',
                                                        background: 'rgba(31, 41, 55, 0.5)',
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="斜体 (Ctrl/Cmd + I)">
                                                <Button
                                                    type="text"
                                                    icon={<ItalicOutlined />}
                                                    onClick={() => insertFormat('italic')}
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '8px',
                                                        background: 'rgba(31, 41, 55, 0.5)',
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="插入链接">
                                                <Button
                                                    type="text"
                                                    icon={<LinkOutlined />}
                                                    onClick={() => insertFormat('link')}
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '8px',
                                                        background: 'rgba(31, 41, 55, 0.5)',
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="插入图片">
                                                <Button
                                                    type="text"
                                                    icon={<PictureOutlined />}
                                                    onClick={() => insertFormat('image')}
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '8px',
                                                        background: 'rgba(31, 41, 55, 0.5)',
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="无序列表">
                                                <Button
                                                    type="text"
                                                    icon={<UnorderedListOutlined />}
                                                    onClick={() => insertFormat('ul')}
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '8px',
                                                        background: 'rgba(31, 41, 55, 0.5)',
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="有序列表">
                                                <Button
                                                    type="text"
                                                    icon={<OrderedListOutlined />}
                                                    onClick={() => insertFormat('ol')}
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '8px',
                                                        background: 'rgba(31, 41, 55, 0.5)',
                                                    }}
                                                />
                                            </Tooltip>
                                        </Space>
                                    </div>

                                    {/* 内容输入 */}
                                    <Form.Item
                                        label={
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                📄 帖子内容
                                            </span>
                                        }
                                        name="content"
                                        rules={[
                                            { required: true, message: '请输入内容' },
                                            { min: 20, message: '内容至少20个字符' },
                                        ]}
                                    >
                                        <TextArea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="分享你的游戏体验、攻略心得、评测想法... 支持 Markdown 格式"
                                            rows={16}
                                            showCount
                                            maxLength={10000}
                                            style={{
                                                fontSize: '15px',
                                                borderRadius: '12px',
                                                background: 'rgba(31, 41, 55, 0.5)',
                                                border: '1px solid rgba(75, 85, 99, 0.3)',
                                                color: '#f9fafb',
                                                lineHeight: 1.6,
                                            }}
                                        />
                                    </Form.Item>

                                    {/* 图片上传 */}
                                    <Form.Item 
                                        label={
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                🖼️ 上传图片 (可选)
                                            </span>
                                        }
                                    >
                                        <Upload
                                            listType="picture-card"
                                            maxCount={9}
                                            beforeUpload={() => false}
                                            style={{
                                                background: 'rgba(31, 41, 55, 0.5)',
                                            }}
                                        >
                                            <div style={{ color: '#9ca3af' }}>
                                                <UploadOutlined style={{ fontSize: '24px' }} />
                                                <div style={{ marginTop: 8 }}>上传图片</div>
                                            </div>
                                        </Upload>
                                        <Text type="secondary" style={{ color: '#9ca3af', fontSize: '13px' }}>
                                            最多上传9张图片，单张不超过5MB
                                        </Text>
                                    </Form.Item>
                                </Card>
                            </Col>

                            <Col xs={24} lg={8}>
                                {/* 分类选择 */}
                                <Card 
                                    className="animate-card-hover"
                                    style={{ 
                                        marginBottom: 20,
                                        ...cardStyle,
                                    }}
                                    styles={{ body: { padding: '24px' } }}
                                >
                                    <Form.Item
                                        label={
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                🏷️ 帖子分类
                                            </span>
                                        }
                                        name="category"
                                        rules={[{ required: true, message: '请选择分类' }]}
                                    >
                                        <Select 
                                            placeholder="选择一个分类" 
                                            size="large"
                                            style={{
                                                borderRadius: '12px',
                                            }}
                                        >
                                            {categories.map(cat => (
                                                <Option key={cat.value} value={cat.value}>
                                                    <Space>
                                                        <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                                                        <span>{cat.value}</span>
                                                    </Space>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    {/* 标签选择 */}
                                    <Form.Item 
                                        label={
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                🔖 添加标签
                                            </span>
                                        }
                                    >
                                        <div style={{ marginBottom: 12 }}>
                                            <Text style={{ color: '#9ca3af', fontSize: '13px' }}>
                                                已选择 {selectedTags.length}/5 个标签
                                            </Text>
                                        </div>
                                        {selectedTags.length > 0 && (
                                            <Space wrap style={{ marginBottom: 12 }}>
                                                {selectedTags.map(tag => (
                                                    <Tag
                                                        key={tag}
                                                        closable
                                                        onClose={() => handleTagSelect(tag)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                            border: 'none',
                                                            color: '#fff',
                                                            padding: '4px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        )}
                                        <div>
                                            <Text type="secondary" style={{ color: '#9ca3af', fontSize: '13px' }}>
                                                热门标签：
                                            </Text>
                                            <div style={{ marginTop: 8 }}>
                                                <Space wrap size={[8, 8]}>
                                                    {popularTags.map(tag => (
                                                        <Tag
                                                            key={tag}
                                                            style={{ 
                                                                cursor: 'pointer',
                                                                background: selectedTags.includes(tag) 
                                                                    ? 'rgba(99, 102, 241, 0.2)'
                                                                    : 'rgba(31, 41, 55, 0.5)',
                                                                border: selectedTags.includes(tag)
                                                                    ? '1px solid rgba(99, 102, 241, 0.5)'
                                                                    : '1px solid rgba(75, 85, 99, 0.3)',
                                                                color: selectedTags.includes(tag) ? '#818cf8' : '#9ca3af',
                                                                borderRadius: '8px',
                                                                padding: '4px 10px',
                                                                fontSize: '12px',
                                                                transition: 'all 0.3s ease',
                                                            }}
                                                            onClick={() => handleTagSelect(tag)}
                                                        >
                                                            {tag}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                            </div>
                                        </div>
                                    </Form.Item>
                                </Card>

                                {/* 操作按钮 */}
                                <Card 
                                    className="animate-card-hover"
                                    style={{ 
                                        marginBottom: 20,
                                        ...cardStyle,
                                    }}
                                    styles={{ body: { padding: '24px' } }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            size="large"
                                            loading={loading}
                                            icon={<SendOutlined />}
                                            style={{
                                                height: '56px',
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                                                transition: 'all 0.3s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.3)';
                                            }}
                                        >
                                            发布帖子
                                        </Button>

                                        <Button
                                            block
                                            size="large"
                                            icon={<SaveOutlined />}
                                            onClick={handleSaveDraft}
                                            style={{
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(31, 41, 55, 0.8)',
                                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                                color: '#d1d5db',
                                                fontWeight: 600,
                                            }}
                                        >
                                            保存草稿
                                        </Button>

                                        <Button
                                            block
                                            size="large"
                                            icon={previewMode ? <EditOutlined /> : <EyeOutlined />}
                                            onClick={() => setPreviewMode(!previewMode)}
                                            style={{
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(31, 41, 55, 0.8)',
                                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                                color: '#d1d5db',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {previewMode ? '编辑模式' : '预览模式'}
                                        </Button>

                                        <Divider style={{ margin: '12px 0', borderColor: 'rgba(99, 102, 241, 0.2)' }} />

                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Button 
                                                type="link" 
                                                icon={<ReloadOutlined />}
                                                onClick={loadDraft}
                                                style={{ 
                                                    color: '#818cf8',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                加载草稿
                                            </Button>
                                            <Button 
                                                type="link" 
                                                danger 
                                                icon={<DeleteOutlined />}
                                                onClick={clearDraft}
                                                style={{ 
                                                    fontWeight: 500,
                                                }}
                                            >
                                                清除草稿
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>

                                {/* 发帖须知 */}
                                <Card 
                                    className="animate-card-hover"
                                    title={
                                        <Space>
                                            <InfoCircleOutlined style={{ color: '#06b6d4' }} />
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                发帖须知
                                            </span>
                                        </Space>
                                    }
                                    style={cardStyle}
                                    styles={{ body: { padding: '20px' } }}
                                >
                                    <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 2 }}>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>请遵守社区规范，文明友善交流</span>
                                        </p>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>不得发布违法违规或不良内容</span>
                                        </p>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>禁止恶意刷屏、广告及垃圾信息</span>
                                        </p>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>转载内容请注明原作者和出处</span>
                                        </p>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>内容支持 Markdown 格式排版</span>
                                        </p>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Form>

                    {/* 预览模式 */}
                    {previewMode && (
                        <Card 
                            className="animate-fade-in-up"
                            style={{ 
                                marginTop: 24,
                                ...cardStyle,
                            }}
                            styles={{ body: { padding: '40px' } }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="large">
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    paddingBottom: '20px',
                                    borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                                }}>
                                    <EyeOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
                                    <Title level={3} style={{ margin: 0, color: '#f9fafb' }}>
                                        内容预览
                                    </Title>
                                </div>
                                
                                <Title 
                                    level={2} 
                                    style={{ 
                                        margin: 0,
                                        color: '#f9fafb',
                                        fontSize: '28px',
                                        fontWeight: 600,
                                    }}
                                >
                                    {form.getFieldValue('title') || '标题预览'}
                                </Title>
                                
                                <div style={{
                                    color: '#d1d5db',
                                    fontSize: '15px',
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}>
                                    {content || '内容预览...'}
                                </div>

                                {selectedTags.length > 0 && (
                                    <div>
                                        <Divider style={{ margin: '20px 0', borderColor: 'rgba(99, 102, 241, 0.2)' }} />
                                        <Space wrap>
                                            {selectedTags.map(tag => (
                                                <Tag
                                                    key={tag}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                        border: 'none',
                                                        color: '#fff',
                                                        padding: '4px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    {tag}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}
