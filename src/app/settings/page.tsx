"use client";

import React, { useState, useEffect } from "react";
import { App, Card, Tabs, Form, Button, Avatar, Upload, Alert, Row, Col, Divider, Typography, Space, Badge, Tooltip } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, CameraOutlined, ArrowLeftOutlined, ExclamationCircleOutlined, SafetyOutlined, SecurityScanOutlined, KeyOutlined, EditOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { PageContainer, UserMenu } from '@/components/layout';
import { CustomButton, CustomInput, CustomPasswordInput } from '@/components/ui';
import { AuthApi } from '@/lib/api/auth';
import { navigationRoutes } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import '@/components/common/animations.css';

const { Title, Text, Paragraph } = Typography;

interface UserInfo {
  username: string;
  email: string;
  uid: number;
}

export default function SettingsPage() {
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const [changeEmailForm] = Form.useForm();

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await AuthApi.getCurrentUser();
        setUserInfo({
          username: user.username,
          email: user.email || '',
          uid: user.userId
        });
      } catch (error) {
        messageApi.error('获取用户信息失败');
        router.push('/auth/login');
      }
    };

    fetchUserInfo();
  }, [messageApi, router]);

  // 修改密码
  const handleChangePassword = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      await AuthApi.changePassword(values.oldPassword, values.newPassword);
      messageApi.success('密码修改成功，请重新登录');
      changePasswordForm.resetFields();
      
      // 自动登出并跳转到登录页
      await AuthApi.logout();
      router.push('/auth/login?message=password_changed');
      } catch (error: unknown) {
        messageApi.error(error instanceof Error ? error.message : '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 更改邮箱
  const handleChangeEmail = async (values: { password: string; newEmail: string }) => {
    try {
      setLoading(true);
      await AuthApi.changeEmail(values.password, values.newEmail);
      messageApi.success('邮箱修改成功，请重新登录');
      changeEmailForm.resetFields();
      
      // 自动登出并跳转到登录页
      await AuthApi.logout();
      router.push('/auth/login?message=email_changed');
      } catch (error: unknown) {
        messageApi.error(error instanceof Error ? error.message : '邮箱修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 头像上传（暂不实现）
  const handleAvatarUpload = () => {
    messageApi.info('头像上传功能开发中...');
  };

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <UserOutlined style={{ fontSize: '16px' }} />
          个人资料
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          {/* 用户信息卡片 */}
          <Col xs={24} lg={8}>
            <Card
              className="animate-card-hover animate-fade-in-up"
              style={{
                background: 'rgba(31, 41, 55, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 20,
                height: '100%',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                animationDelay: '0.1s',
              }}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div 
                  style={{ 
                    position: 'relative', 
                    display: 'inline-block',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  <div className="avatar-container">
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: '4px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: 24 }}>
                  <Title level={3} style={{ color: '#f9fafb', margin: '0 0 8px 0', fontSize: '24px' }}>
                    {userInfo?.username || 'Unknown'}
                  </Title>
                  <Text style={{ color: '#9ca3af', fontSize: '16px' }}>
                    {userInfo?.email || 'Unknown'}
                  </Text>
                </div>

                <Divider style={{ borderColor: 'rgba(99, 102, 241, 0.2)', margin: '24px 0' }} />

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Tooltip title="点击更换头像">
                    <Upload
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleAvatarUpload}
                    >
                      <CustomButton
                        variant="ghost"
                        size="large"
                        icon={<CameraOutlined />}
                        style={{ 
                          width: '100%',
                          height: 48,
                          fontSize: '16px',
                          fontWeight: 500,
                        }}
                      >
                        更换头像
                      </CustomButton>
                    </Upload>
                  </Tooltip>
                </Space>
              </div>
            </Card>
          </Col>

          {/* 账户统计信息 */}
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card
                  className="animate-card-hover animate-fade-in-up"
                  style={{
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: 16,
                    height: '100%',
                    textAlign: 'center',
                    animationDelay: '0.2s',
                  }}
                >
                  <SecurityScanOutlined style={{ fontSize: '32px', color: '#10b981', marginBottom: 12 }} />
                  <Title level={4} style={{ color: '#f9fafb', margin: '0 0 8px 0' }}>
                    账户安全
                  </Title>
                  <Text style={{ color: '#9ca3af' }}>
                    密码已设置
                  </Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12}>
                <Card
                  className="animate-card-hover animate-fade-in-up"
                  style={{
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: 16,
                    height: '100%',
                    textAlign: 'center',
                    animationDelay: '0.3s',
                  }}
                >
                  <MailOutlined style={{ fontSize: '32px', color: '#6366f1', marginBottom: 12 }} />
                  <Title level={4} style={{ color: '#f9fafb', margin: '0 0 8px 0' }}>
                    邮箱验证
                  </Title>
                  <Text style={{ color: '#9ca3af' }}>
                    已验证
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* 快速操作 */}
            <Card
              className="animate-card-hover animate-fade-in-up"
              style={{
                background: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: 16,
                marginTop: 16,
                animationDelay: '0.4s',
              }}
            >
              <Title level={4} style={{ color: '#f9fafb', marginBottom: 16 }}>
                快速操作
              </Title>
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <CustomButton
                    variant="ghost"
                    size="large"
                    icon={<KeyOutlined />}
                    className="animate-bounce"
                    style={{ width: '100%', height: 48 }}
                    onClick={() => {
                      const passwordTab = document.querySelector('[data-node-key="password"]') as HTMLElement;
                      passwordTab?.click();
                    }}
                  >
                    修改密码
                  </CustomButton>
                </Col>
                <Col xs={24} sm={8}>
                  <CustomButton
                    variant="ghost"
                    size="large"
                    icon={<EditOutlined />}
                    className="animate-bounce"
                    style={{ width: '100%', height: 48 }}
                    onClick={() => {
                      const emailTab = document.querySelector('[data-node-key="email"]') as HTMLElement;
                      emailTab?.click();
                    }}
                  >
                    更改邮箱
                  </CustomButton>
                </Col>
                <Col xs={24} sm={8}>
                  <CustomButton
                    variant="ghost"
                    size="large"
                    icon={<SafetyOutlined />}
                    className="animate-bounce"
                    style={{ width: '100%', height: 48 }}
                    onClick={() => messageApi.info('安全设置功能开发中...')}
                  >
                    安全设置
                  </CustomButton>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'password',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <LockOutlined style={{ fontSize: '16px' }} />
          修改密码
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              className="animate-card-hover animate-fade-in-up"
              style={{
                background: 'rgba(31, 41, 55, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 20,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                animationDelay: '0.1s',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: '#f9fafb', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <KeyOutlined style={{ color: '#6366f1' }} />
                  修改密码
                </Title>
                <Paragraph style={{ color: '#9ca3af', margin: 0 }}>
                  为了您的账户安全，修改密码后需要重新登录
                </Paragraph>
              </div>

              <Alert
                message="安全提示"
                description="修改密码后需要重新登录以确保账户安全"
                type="warning"
                icon={<ExclamationCircleOutlined />}
                style={{
                  marginBottom: 32,
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 12,
                }}
              />

              <Form
                form={changePasswordForm}
                name="changePassword"
                onFinish={handleChangePassword}
                layout="vertical"
                size="large"
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="oldPassword"
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>当前密码</span>}
                      rules={[{ required: true, message: '请输入当前密码' }]}
                    >
                      <CustomPasswordInput
                        prefix={<LockOutlined />}
                        placeholder="请输入当前密码"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="newPassword"
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>新密码</span>}
                      rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 6, message: '密码至少6个字符' }
                      ]}
                    >
                      <CustomPasswordInput
                        prefix={<LockOutlined />}
                        placeholder="请输入新密码"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="confirmPassword"
                  label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>确认新密码</span>}
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <CustomPasswordInput
                    prefix={<LockOutlined />}
                    placeholder="请确认新密码"
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: 32 }}>
                  <CustomButton
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{ height: 56, fontSize: '16px', fontWeight: 600 }}
                  >
                    修改密码
                  </CustomButton>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="animate-card-hover animate-fade-in-up"
              style={{
                background: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: 16,
                height: '100%',
                animationDelay: '0.2s',
              }}
            >
              <Title level={4} style={{ color: '#f9fafb', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <InfoCircleOutlined style={{ color: '#6366f1' }} />
                密码安全提示
              </Title>
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>使用强密码，包含字母、数字和符号</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>避免使用个人信息作为密码</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>定期更换密码，提高安全性</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>不要在多个账户使用相同密码</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'email',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <MailOutlined style={{ fontSize: '16px' }} />
          更改邮箱
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              className="animate-card-hover animate-fade-in-up"
              style={{
                background: 'rgba(31, 41, 55, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 20,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                animationDelay: '0.1s',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: '#f9fafb', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MailOutlined style={{ color: '#6366f1' }} />
                  更改邮箱
                </Title>
                <Paragraph style={{ color: '#9ca3af', margin: 0 }}>
                  更改邮箱地址后需要重新登录以验证新邮箱
                </Paragraph>
              </div>

              <Alert
                message="安全提示"
                description="修改邮箱后需要重新登录以确保账户安全"
                type="warning"
                icon={<ExclamationCircleOutlined />}
                style={{
                  marginBottom: 32,
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 12,
                }}
              />

              <Form
                form={changeEmailForm}
                name="changeEmail"
                onFinish={handleChangeEmail}
                layout="vertical"
                size="large"
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="password"
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>当前密码</span>}
                      rules={[{ required: true, message: '请输入当前密码' }]}
                    >
                      <CustomPasswordInput
                        prefix={<LockOutlined />}
                        placeholder="请输入当前密码"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="newEmail"
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>新邮箱</span>}
                      rules={[
                        { required: true, message: '请输入新邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <CustomInput
                        prefix={<MailOutlined />}
                        placeholder="请输入新邮箱"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginTop: 32 }}>
                  <CustomButton
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{ height: 56, fontSize: '16px', fontWeight: 600 }}
                  >
                    更改邮箱
                  </CustomButton>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="animate-card-hover animate-fade-in-up"
              style={{
                background: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: 16,
                height: '100%',
                animationDelay: '0.2s',
              }}
            >
              <Title level={4} style={{ color: '#f9fafb', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <InfoCircleOutlined style={{ color: '#6366f1' }} />
                邮箱安全提示
              </Title>
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>使用常用邮箱地址，确保能及时接收通知</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>避免使用临时邮箱或一次性邮箱</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>确保邮箱地址拼写正确</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>更改后请及时验证新邮箱</Text>
                </div>
              </Space>

              <Divider style={{ borderColor: 'rgba(99, 102, 241, 0.2)', margin: '24px 0' }} />

              <div style={{ textAlign: 'center' }}>
                <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
                  当前邮箱: <Text style={{ color: '#f9fafb', fontWeight: 500 }}>{userInfo?.email || 'Unknown'}</Text>
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      {/* 返回按钮 - 页面左上角 */}
      <div style={{ 
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 1000,
      }}>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(navigationRoutes.library)}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: 8,
            height: 40,
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }}
        >
          返回游戏库
        </Button>
      </div>

      {/* 用户菜单 - 页面右上角 */}
      <UserMenu username={userInfo?.username || "Unknown"} />

      <PageContainer
        title="账户设置"
        subtitle="管理您的个人信息和安全设置"
        showBackground={true}
        showDecorations={true}
      >
        <Tabs
          defaultActiveKey="profile"
          size="large"
          tabBarStyle={{
            marginBottom: 40,
            borderBottom: '2px solid rgba(99, 102, 241, 0.2)',
            background: 'rgba(31, 41, 55, 0.5)',
            borderRadius: '12px 12px 0 0',
            padding: '0 24px',
            backdropFilter: 'blur(10px)',
          }}
          tabBarGutter={32}
          items={tabItems}
          style={{
            background: 'rgba(31, 41, 55, 0.3)',
            borderRadius: 20,
            padding: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        />
      </PageContainer>
    </>
  );
}
