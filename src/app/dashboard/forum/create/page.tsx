// src/app/dashboard/forum/create/page.tsx
'use client';

import React, { useState, useEffect,useMemo  } from 'react';
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
    Space,
    Tag,
    Typography,
} from 'antd';
import {
    ArrowLeftOutlined,
    SendOutlined,
    EyeOutlined,
    EditOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { PostsApi, CreatePostRequest } from '@/lib/api/posts';
import { AuthApi } from '@/lib/api/auth';
import Divider from 'antd/es/divider';
import { getLoginRedirectUrl, navigationRoutes } from "@/lib/navigation";
import { darkTheme, cardStyle } from '@/components/common/theme';
import '@/components/common/animations.css';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div style={{
        height: '400px',
        background: 'rgba(31, 41, 55, 0.5)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af'
    }}>Loading editor...</div>
});

// Dynamically import styles


const { Title, Text } = Typography;
const { TextArea } = Input;

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


    // Check login status
    useEffect(() => {
        if (mounted && !AuthApi.isAuthenticated()) {
            message.warning('Please login first');
            router.push(getLoginRedirectUrl(navigationRoutes.postCreate));
        }
    }, [mounted, router]);


    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ],
    }), []);

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'color', 'background',
        'link', 'image'
    ];

    // Submit post
    const handleSubmit = async (values: CreatePostPageProps) => {
        // Validate content is not empty
        const strippedContent = content.replace(/<[^>]*>/g, '').trim();
        if (!strippedContent) {
            message.error('Please enter post content');
            return;
        }

        try {
            setLoading(true);

            const postData: CreatePostRequest = {
                title: values.title,
                body: content,
            };

            await PostsApi.createPost(postData);
            message.success('Published successfully!');

            // Navigate to forum homepage
            setTimeout(() => {
                router.push(navigationRoutes.forum);
            }, 500);
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(error.message || 'Publish failed');
            } else {
                message.error('Publish failed, please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    // Insert formatted text
    const insertFormat = (format: string) => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        let newText = '';

        switch (format) {
            case 'bold':
                newText = `**${selectedText || 'Bold text'}**`;
                break;
            case 'italic':
                newText = `*${selectedText || 'Italic text'}*`;
                break;
            case 'link':
                newText = `[${selectedText || 'Link text'}](URL)`;
                break;
            case 'image':
                newText = `![${selectedText || 'Image description'}](Image URL)`;
                break;
            case 'ul':
                newText = `\n- ${selectedText || 'List item'}\n`;
                break;
            case 'ol':
                newText = `\n1. ${selectedText || 'List item'}\n`;
                break;
            default:
                newText = selectedText;
        }

        const newContent = content.substring(0, start) + newText + content.substring(end);
        setContent(newContent);
        form.setFieldValue('content', newContent);
    };




    if (!mounted) {
        return null;
    }

    return (
        <ConfigProvider theme={darkTheme}>
            {/* Top navigation bar */}
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
                    {/* Page title */}
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
                                    Back
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
                                        ✍️ Send a new Post
                                    </Title>
                                    <Text style={{ color: '#9ca3af', fontSize: '14px', display: 'block', marginTop: '4px' }}>
                                        Share your gaming insights and experiences
                                    </Text>
                                </div>
                            </Space>
                        </div>
                    </Card>

                    {/* Main form */}
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
                                    {/* Title input */}
                                    <Form.Item
                                        label={
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                📝 Post Title
                                            </span>
                                        }
                                        name="title"
                                        rules={[
                                            { required: true, message: 'Please enter a title' },
                                            { min: 5, message: 'Title must be at least 5 characters long' },
                                            { max: 100, message: 'Title: Maximum 100 characters' },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Give your post an eye-catching title!..."
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

                                    <Divider style={{ margin: '24px 0', borderColor: 'rgba(99, 102, 241, 0.2)' }} />

                                    {/* React Quill editor */}
                                    <div style={{ marginTop: '24px' }}>
                                        <Text
                                            style={{
                                                display: 'block',
                                                marginBottom: '12px',
                                                color: '#d1d5db',
                                                fontSize: '14px',
                                                fontWeight: 500
                                            }}
                                        >
                                            Post Content <span style={{ color: '#ef4444' }}>*</span>
                                        </Text>

                                        <ReactQuill
                                            theme="snow"
                                            value={content}
                                            onChange={setContent}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            placeholder="Share your thoughts!"
                                            style={{
                                                height: '400px',
                                                marginBottom: '60px',
                                            }}
                                            className="custom-quill-editor"
                                        />
                                    </div>

                                    {/*/!* Markdown toolbar *!/*/}
                                    {/*<div style={{ marginBottom: '12px' }}>*/}
                                    {/*    <Space size="small" wrap>*/}
                                    {/*        <Tooltip title="Bold (Ctrl/Cmd + B)">*/}
                                    {/*            <Button*/}
                                    {/*                type="text"*/}
                                    {/*                icon={<BoldOutlined />}*/}
                                    {/*                onClick={() => insertFormat('bold')}*/}
                                    {/*                style={{*/}
                                    {/*                    color: '#9ca3af',*/}
                                    {/*                    borderRadius: '8px',*/}
                                    {/*                    background: 'rgba(31, 41, 55, 0.5)',*/}
                                    {/*                }}*/}
                                    {/*            />*/}
                                    {/*        </Tooltip>*/}
                                    {/*        <Tooltip title="Italic (Ctrl/Cmd + I)">*/}
                                    {/*            <Button*/}
                                    {/*                type="text"*/}
                                    {/*                icon={<ItalicOutlined />}*/}
                                    {/*                onClick={() => insertFormat('italic')}*/}
                                    {/*                style={{*/}
                                    {/*                    color: '#9ca3af',*/}
                                    {/*                    borderRadius: '8px',*/}
                                    {/*                    background: 'rgba(31, 41, 55, 0.5)',*/}
                                    {/*                }}*/}
                                    {/*            />*/}
                                    {/*        </Tooltip>*/}
                                    {/*        <Tooltip title="Insert link">*/}
                                    {/*            <Button*/}
                                    {/*                type="text"*/}
                                    {/*                icon={<LinkOutlined />}*/}
                                    {/*                onClick={() => insertFormat('link')}*/}
                                    {/*                style={{*/}
                                    {/*                    color: '#9ca3af',*/}
                                    {/*                    borderRadius: '8px',*/}
                                    {/*                    background: 'rgba(31, 41, 55, 0.5)',*/}
                                    {/*                }}*/}
                                    {/*            />*/}
                                    {/*        </Tooltip>*/}
                                    {/*        <Tooltip title="Insert image">*/}
                                    {/*            <Button*/}
                                    {/*                type="text"*/}
                                    {/*                icon={<PictureOutlined />}*/}
                                    {/*                onClick={() => insertFormat('image')}*/}
                                    {/*                style={{*/}
                                    {/*                    color: '#9ca3af',*/}
                                    {/*                    borderRadius: '8px',*/}
                                    {/*                    background: 'rgba(31, 41, 55, 0.5)',*/}
                                    {/*                }}*/}
                                    {/*            />*/}
                                    {/*        </Tooltip>*/}
                                    {/*        <Tooltip title="Unordered list">*/}
                                    {/*            <Button*/}
                                    {/*                type="text"*/}
                                    {/*                icon={<UnorderedListOutlined />}*/}
                                    {/*                onClick={() => insertFormat('ul')}*/}
                                    {/*                style={{*/}
                                    {/*                    color: '#9ca3af',*/}
                                    {/*                    borderRadius: '8px',*/}
                                    {/*                    background: 'rgba(31, 41, 55, 0.5)',*/}
                                    {/*                }}*/}
                                    {/*            />*/}
                                    {/*        </Tooltip>*/}
                                    {/*        <Tooltip title="Ordered list">*/}
                                    {/*            <Button*/}
                                    {/*                type="text"*/}
                                    {/*                icon={<OrderedListOutlined />}*/}
                                    {/*                onClick={() => insertFormat('ol')}*/}
                                    {/*                style={{*/}
                                    {/*                    color: '#9ca3af',*/}
                                    {/*                    borderRadius: '8px',*/}
                                    {/*                    background: 'rgba(31, 41, 55, 0.5)',*/}
                                    {/*                }}*/}
                                    {/*            />*/}
                                    {/*        </Tooltip>*/}
                                    {/*    </Space>*/}
                                    {/*</div>*/}

                                    {/* Content input */}
                                    {/*<Form.Item*/}
                                    {/*    label={*/}
                                    {/*        <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>*/}
                                    {/*            📄 Post content*/}
                                    {/*        </span>*/}
                                    {/*    }*/}
                                    {/*    name="content"*/}
                                    {/*    rules={[*/}
                                    {/*        { required: true, message: 'Please enter content' },*/}
                                    {/*        { min: 20, message: 'Content must be at least 20 characters.' },*/}
                                    {/*    ]}*/}
                                    {/*>*/}
                                    {/*    <TextArea*/}
                                    {/*        value={content}*/}
                                    {/*        onChange={(e) => setContent(e.target.value)}*/}
                                    {/*        placeholder="Share your gaming experiences, strategy tips, review thoughts... Supports Markdown formatting"*/}
                                    {/*        rows={16}*/}
                                    {/*        showCount*/}
                                    {/*        maxLength={10000}*/}
                                    {/*        style={{*/}
                                    {/*            fontSize: '15px',*/}
                                    {/*            borderRadius: '12px',*/}
                                    {/*            background: 'rgba(31, 41, 55, 0.5)',*/}
                                    {/*            border: '1px solid rgba(75, 85, 99, 0.3)',*/}
                                    {/*            color: '#f9fafb',*/}
                                    {/*            lineHeight: 1.6,*/}
                                    {/*        }}*/}
                                    {/*    />*/}
                                    {/*</Form.Item>*/}
                                </Card>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card
                                    className="animate-card-hover"
                                    title={
                                        <Space>
                                            <InfoCircleOutlined style={{ color: '#06b6d4' }} />
                                            <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: 600 }}>
                                                Posting Guidelines
                                            </span>
                                        </Space>
                                    }
                                    style={cardStyle}
                                    styles={{ body: { padding: '20px' } }}
                                >
                                    <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 2 }}>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>Please adhere to community guidelines and engage in civil and friendly communication.</span>
                                        </p>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>Do not publish illegal, non-compliant, or harmful content.</span>
                                        </p>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>Prohibited: Malicious spamming, advertising, and spam messages.</span>
                                        </p>
                                        <p style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ color: '#6366f1', marginRight: '8px' }}>•</span>
                                            <span>Please credit the original author and source when reposting content.</span>
                                        </p>

                                    </div>
                                </Card>

                                {/* Action buttons */}
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
                                            {previewMode ? 'Edit Mode' : 'Preview Mode'}
                                        </Button>

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
                                            Send a Post
                                        </Button>
                                    </Space>
                                </Card>

                                {/* Post guidelines */}

                            </Col>
                        </Row>
                    </Form>

                    {/* Preview mode */}
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
                                        Content Preview
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
                                    {form.getFieldValue('title') || 'Title Preview'}
                                </Title>
                                
                                <div style={{
                                    color: '#d1d5db',
                                    fontSize: '15px',
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}>
                                    {content || 'Content preview...'}
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
