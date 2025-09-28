// src/app/post/create/post_page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    theme,
    Typography,
    Upload,
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
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { PostsApi, CreatePostRequest } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import Divider from 'antd/es/divider';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function CreatePostPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [previewMode, setPreviewMode] = useState(false);

    // 检查登录状态
    useEffect(() => {
        if (!AuthApi.isAuthenticated()) {
            message.warning('请先登录');
            router.push('/login');
        }
    }, []);

    // 游戏分类
    const categories = [
        '游戏讨论',
        '攻略分享',
        '游戏评测',
        '寻找队友',
        '技术交流',
        '游戏资讯',
        '其他',
    ];

    // 热门标签
    const popularTags = [
        '原神', '王者荣耀', '英雄联盟', 'CS2', 'APEX',
        '永劫无间', '博德之门3', '黑神话悟空', '艾尔登法环',
        'Steam', 'Epic', '独立游戏', '3A大作', 'RPG',
        'FPS', 'MOBA', '开放世界', '恐怖游戏', '生存游戏',
    ];

    // 提交帖子
    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const postData: CreatePostRequest = {
                title: values.title,
                body: content || values.content,
            };

            const newPost = await PostsApi.createPost(postData);

            message.success('发布成功！');

            // 跳转到帖子详情页
            setTimeout(() => {
                router.push(`/post/${newPost.postId}`);
            }, 500);
        } catch (error: any) {
            message.error(error.message || '发布失败，请稍后重试');
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

    const darkTheme = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorPrimary: '#FF6B6B',
            colorBgContainer: '#1a1a1a',
            colorBgElevated: '#262626',
            colorBgLayout: '#0d0d0d',
        },
    };

    return (
        <ConfigProvider theme={darkMode ? darkTheme : undefined}>
            <ProLayout
                title="GameVault"
                logo="🎮"
                layout="top"
                contentWidth="Fixed"
                fixedHeader
                navTheme={darkMode ? "realDark" : "light"}

            >
                <div style={{
                    minHeight: '100vh',
                    background: darkMode ? '#0d0d0d' : '#f0f2f5',
                    padding: '24px',
                }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        {/* 页面标题 */}
                        <Card style={{ marginBottom: 24 }}>
                            <Space>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.back()}
                                >
                                    返回
                                </Button>
                                <Title level={3} style={{ margin: 0 }}>发布新帖</Title>
                            </Space>
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
                                    <Card>
                                        <Form.Item
                                            label="标题"
                                            name="title"
                                            rules={[
                                                { required: true, message: '请输入标题' },
                                                { min: 5, message: '标题至少5个字符' },
                                                { max: 100, message: '标题最多100个字符' },
                                            ]}
                                        >
                                            <Input
                                                placeholder="请输入帖子标题"
                                                size="large"
                                                showCount
                                                maxLength={100}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={
                                                <Space>
                                                    <span>内容</span>
                                                    <Space size="small">
                                                        <Button
                                                            type="text"
                                                            icon={<BoldOutlined />}
                                                            onClick={() => insertFormat('bold')}
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<ItalicOutlined />}
                                                            onClick={() => insertFormat('italic')}
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<LinkOutlined />}
                                                            onClick={() => insertFormat('link')}
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<PictureOutlined />}
                                                            onClick={() => insertFormat('image')}
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<UnorderedListOutlined />}
                                                            onClick={() => insertFormat('ul')}
                                                        />
                                                        <Button
                                                            type="text"
                                                            icon={<OrderedListOutlined />}
                                                            onClick={() => insertFormat('ol')}
                                                        />
                                                    </Space>
                                                </Space>
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
                                                placeholder="请输入帖子内容，支持 Markdown 格式"
                                                rows={12}
                                                showCount
                                                maxLength={10000}
                                            />
                                        </Form.Item>

                                        <Form.Item label="上传图片">
                                            <Upload
                                                listType="picture-card"
                                                maxCount={9}
                                                beforeUpload={() => false}
                                            >
                                                <div>
                                                    <UploadOutlined />
                                                    <div style={{ marginTop: 8 }}>上传图片</div>
                                                </div>
                                            </Upload>
                                            <Text type="secondary">最多上传9张图片，单张不超过5MB</Text>
                                        </Form.Item>
                                    </Card>
                                </Col>

                                <Col xs={24} lg={8}>
                                    {/* 分类和标签 */}
                                    <Card style={{ marginBottom: 16 }}>
                                        <Form.Item
                                            label="分类"
                                            name="category"
                                            rules={[{ required: true, message: '请选择分类' }]}
                                        >
                                            <Select placeholder="请选择分类" size="large">
                                                {categories.map(cat => (
                                                    <Option key={cat} value={cat}>{cat}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item label="标签">
                                            <div style={{ marginBottom: 8 }}>
                                                <Text type="secondary">已选择 {selectedTags.length}/5 个标签</Text>
                                            </div>
                                            <Space wrap>
                                                {selectedTags.map(tag => (
                                                    <Tag
                                                        key={tag}
                                                        color="blue"
                                                        closable
                                                        onClose={() => handleTagSelect(tag)}
                                                    >
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </Space>
                                            <div style={{ marginTop: 12 }}>
                                                <Text type="secondary">热门标签：</Text>
                                                <div style={{ marginTop: 8 }}>
                                                    <Space wrap size={[0, 8]}>
                                                        {popularTags.map(tag => (
                                                            <Tag
                                                                key={tag}
                                                                style={{ cursor: 'pointer' }}
                                                                color={selectedTags.includes(tag) ? 'blue' : 'default'}
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
                                    <Card>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                block
                                                size="large"
                                                loading={loading}
                                                style={{
                                                    background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                                                }}
                                            >
                                                发布帖子
                                            </Button>

                                            <Button
                                                block
                                                size="large"
                                                onClick={handleSaveDraft}
                                            >
                                                保存草稿
                                            </Button>

                                            <Button
                                                block
                                                onClick={() => setPreviewMode(!previewMode)}
                                            >
                                                {previewMode ? '编辑' : '预览'}
                                            </Button>

                                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <Button type="link" onClick={loadDraft}>
                                                    加载草稿
                                                </Button>
                                                <Button type="link" danger onClick={clearDraft}>
                                                    清除草稿
                                                </Button>
                                            </Space>
                                        </Space>
                                    </Card>

                                    {/* 发帖提示 */}
                                    <Card style={{ marginTop: 16 }}>
                                        <Title level={5}>发帖须知</Title>
                                        <Paragraph type="secondary">
                                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                                                <li>请遵守社区规范，文明发言</li>
                                                <li>不得发布违法违规内容</li>
                                                <li>不得发布广告或垃圾信息</li>
                                                <li>尊重他人，友善交流</li>
                                                <li>内容支持 Markdown 格式</li>
                                            </ul>
                                        </Paragraph>
                                    </Card>
                                </Col>
                            </Row>
                        </Form>

                        {/* 预览模式 */}
                        {previewMode && (
                            <Card style={{ marginTop: 24 }}>
                                <Title level={4}>预览</Title>
                                <Divider />
                                <Title level={3}>{form.getFieldValue('title') || '标题预览'}</Title>
                                <Paragraph>
                                    {content || '内容预览...'}
                                </Paragraph>
                            </Card>
                        )}
                    </div>
                </div>
            </ProLayout>
        </ConfigProvider>
    );
}