// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button,
    Card,
    Checkbox,
    Col,
    ConfigProvider,
    Divider,
    Form,
    Input,
    message,
    Row,
    Space,
    Tabs,
    theme,
    Typography,
} from 'antd';
import {
    GithubOutlined,
    GoogleOutlined,
    LockOutlined,
    MailOutlined,
    QqOutlined,
    UserOutlined,
    WechatOutlined,
} from '@ant-design/icons';
import { AuthApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/api';
import {navigationRoutes} from "@/lib/navigation";

const { Title, Text, Link } = Typography;
const { TabPane } = Tabs;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();

    // 处理登录
    const handleLogin = async (values: LoginRequest) => {
        try {
            setLoading(true);
            const response = await AuthApi.login(values);

            message.success('登录成功！');

            // 跳转到首页或之前的页面
            setTimeout(() => {
                router.push(navigationRoutes.forum);
            }, 500);
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(error.message || '注册失败，请检查输入信息');
            } else {
                message.error('注册失败，请检查输入信息');
            }
        } finally {
            setLoading(false);
        }
    };

    // 处理注册
    const handleRegister = async (values: RegisterRequest) => {
        try {
            setLoading(true);

            const registerData: RegisterRequest = {
                username: values.username,
                password: values.password,
                email: values.email,
                nickname: values.nickname,
            };

            const response = await AuthApi.register(registerData);

            message.success('注册成功！即将跳转到首页...');

            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error) {
            if (error instanceof Error) {
                message.error(error.message || '注册失败，请检查输入信息');
            } else {
                message.error('注册失败，请检查输入信息');
            }
        } finally {
            setLoading(false);
        }
    };

    // 第三方登录（模拟）


    // 忘记密码
    const handleForgotPassword = async () => {
        const email = loginForm.getFieldValue('username');
        if (!email) {
            message.warning('请先输入邮箱地址');
            return;
        }

        try {
            await AuthApi.requestPasswordReset(email);
            message.success('密码重置邮件已发送，请查收');
        } catch (error) {
            message.error('发送失败，请稍后重试');
        }
    };

    const darkTheme = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorPrimary: '#FF6B6B',
            colorBgContainer: '#1a1a1a',
            borderRadius: 8,
        },
    };

    return (
        <ConfigProvider theme={darkTheme}>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}>
                <Card
                    style={{
                        width: '100%',
                        maxWidth: 480,
                        borderRadius: 12,
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
                        <Title level={2} style={{ margin: 0 }}>GameVault</Title>
                        <Text type="secondary">游戏玩家的交流社区</Text>
                    </div>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        centered
                        size="large"
                    >
                        <TabPane tab="登录" key="login">
                            <Form
                                form={loginForm}
                                name="login"
                                onFinish={handleLogin}
                                autoComplete="off"
                                size="large"
                            >
                                <Form.Item
                                    name="username"
                                    rules={[{ required: true, message: '请输入用户名或邮箱' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder="用户名或邮箱"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: '请输入密码' }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="密码"
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Row justify="space-between">
                                        <Col>
                                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                                <Checkbox>记住我</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col>
                                            <Link onClick={handleForgotPassword}>忘记密码？</Link>
                                        </Col>
                                    </Row>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        loading={loading}
                                        style={{
                                            height: 48,
                                            background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                                        }}
                                    >
                                        登录
                                    </Button>
                                </Form.Item>


                            </Form>
                        </TabPane>

                        <TabPane tab="注册" key="register">
                            <Form
                                form={registerForm}
                                name="register"
                                onFinish={handleRegister}
                                autoComplete="off"
                                size="large"
                            >
                                <Form.Item
                                    name="username"
                                    rules={[
                                        { required: true, message: '请输入用户名' },
                                        { min: 3, message: '用户名至少3个字符' },
                                        { max: 20, message: '用户名最多20个字符' },
                                        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder="用户名"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    rules={[
                                        { required: true, message: '请输入邮箱' },
                                        { type: 'email', message: '请输入有效的邮箱地址' },
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined />}
                                        placeholder="邮箱"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="nickname"
                                    rules={[
                                        { max: 30, message: '昵称最多30个字符' },
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder="昵称（选填）"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    rules={[
                                        { required: true, message: '请输入密码' },
                                        { min: 6, message: '密码至少6个字符' },
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="密码"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: '请确认密码' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('两次输入的密码不一致'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="确认密码"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="agreement"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            validator: (_, value) =>
                                                value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意用户协议')),
                                        },
                                    ]}
                                >
                                    <Checkbox>
                                        我已阅读并同意 <Link>用户协议</Link> 和 <Link>隐私政策</Link>
                                    </Checkbox>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        loading={loading}
                                        style={{
                                            height: 48,
                                            background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                                        }}
                                    >
                                        注册
                                    </Button>
                                </Form.Item>
                            </Form>
                        </TabPane>
                    </Tabs>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Button type="link" onClick={() => router.push('/')}>
                            返回首页
                        </Button>
                    </div>
                </Card>
            </div>
        </ConfigProvider>
    );
}