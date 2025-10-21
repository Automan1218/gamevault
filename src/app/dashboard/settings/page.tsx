"use client";

import React, { useState } from "react";
import { App, Card, Tabs, Form, Button, Avatar, Upload, Alert, Row, Col, Divider, Typography, Space, Badge, Tooltip } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, CameraOutlined, ArrowLeftOutlined, ExclamationCircleOutlined, SafetyOutlined, SecurityScanOutlined, KeyOutlined, EditOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { PageContainer, Menubar } from '@/components/layout';
import { CustomButton, CustomInput, CustomPasswordInput } from '@/components/ui';
import AvatarUpload from '@/components/forms/AvatarUpload';
import { useSettings } from '@/app/features/settings/hooks/useSettings';
import { navigationRoutes } from '@/lib/navigation';
import { avatarEvents, getAvatarUrl } from '@/lib/api/avatar';
import '@/components/common/animations.css';

const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
  const { message: messageApi } = App.useApp();
  const { userInfo, loading, changePassword, changeEmail, updateAvatar } = useSettings();
  const [changePasswordForm] = Form.useForm();
  const [changeEmailForm] = Form.useForm();

  // 修改密码
  const handleChangePassword = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    const result = await changePassword(values.oldPassword, values.newPassword);
    if (result.success) {
      messageApi.success(result.message);
      changePasswordForm.resetFields();
    } else {
      messageApi.error(result.message);
    }
  };

  // 更改邮箱
  const handleChangeEmail = async (values: { password: string; newEmail: string }) => {
    const result = await changeEmail(values.password, values.newEmail);
    if (result.success) {
      messageApi.success(result.message);
      changeEmailForm.resetFields();
    } else {
      messageApi.error(result.message);
    }
  };

  // 头像更新处理
  const handleAvatarChange = (avatarUrl: string | null) => {
    updateAvatar(avatarUrl);
    // 发送头像更新事件，通知其他组件（如UserMenu）刷新
    avatarEvents.emit(avatarUrl);
  };

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <UserOutlined style={{ fontSize: '16px' }} />
          Profile
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
                {/* 头像显示和编辑 */}
                <AvatarUpload
                  currentAvatar={userInfo?.avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  size={120}
                  showEditButton={false}
                />
                
                <div style={{ marginTop: 16 }}>
                  <Title level={3} style={{ color: '#f9fafb', margin: '0 0 8px 0', fontSize: '24px' }}>
                    {userInfo?.username || 'Unknown'}
                  </Title>
                  <Text style={{ color: '#9ca3af', fontSize: '16px' }}>
                    {userInfo?.email || 'Unknown'}
                  </Text>
                </div>

                <Divider style={{ borderColor: 'rgba(99, 102, 241, 0.2)', margin: '24px 0' }} />
                
                {/* 编辑头像按钮 */}
                <AvatarUpload
                  currentAvatar={userInfo?.avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  size={0}
                  showEditButton={true}
                />
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
                    Account Security
                  </Title>
                  <Text style={{ color: '#9ca3af' }}>
                    Password Set
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
                    Email Verified
                  </Title>
                  <Text style={{ color: '#9ca3af' }}>
                    Verified
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
                Quick Actions
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
                    Change Password
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
                    Change Email
                  </CustomButton>
                </Col>
                <Col xs={24} sm={8}>
                  <CustomButton
                    variant="ghost"
                    size="large"
                    icon={<SafetyOutlined />}
                    className="animate-bounce"
                    style={{ width: '100%', height: 48 }}
                    onClick={() => messageApi.info('Security settings feature is under development...')}
                  >
                    Security Settings
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
          Change Password
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
                  Change Password
                </Title>
                <Paragraph style={{ color: '#9ca3af', margin: 0 }}>
                  For your account security, you will need to log in again after changing your password
                </Paragraph>
              </div>

              <Alert
                message="Security Notice"
                description="You will need to log in again after changing your password to ensure account security"
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
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>Current Password</span>}
                      rules={[{ required: true, message: 'Please enter current password' }]}
                    >
                      <CustomPasswordInput
                        prefix={<LockOutlined />}
                        placeholder="Please enter current password"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="newPassword"
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>New Password</span>}
                      rules={[
                        { required: true, message: 'Please enter new password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                      ]}
                    >
                      <CustomPasswordInput
                        prefix={<LockOutlined />}
                        placeholder="Please enter new password"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="confirmPassword"
                  label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>Confirm New Password</span>}
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords that you entered do not match'));
                      },
                    }),
                  ]}
                >
                  <CustomPasswordInput
                    prefix={<LockOutlined />}
                    placeholder="Please confirm new password"
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
                    Change Password
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
                Password Security Tips
              </Title>
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Use strong passwords with letters, numbers and symbols</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Avoid using personal information as passwords</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Change passwords regularly to improve security</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Don't use the same password for multiple accounts</Text>
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
          Change Email
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
                  Change Email
                </Title>
                <Paragraph style={{ color: '#9ca3af', margin: 0 }}>
                  You will need to log in again after changing your email address to verify the new email
                </Paragraph>
              </div>

              <Alert
                message="Security Notice"
                description="You will need to log in again after changing your email to ensure account security"
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
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>Current Password</span>}
                      rules={[{ required: true, message: 'Please enter current password' }]}
                    >
                      <CustomPasswordInput
                        prefix={<LockOutlined />}
                        placeholder="Please enter current password"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="newEmail"
                      label={<span style={{ color: '#f9fafb', fontWeight: 500 }}>New Email</span>}
                      rules={[
                        { required: true, message: 'Please enter new email' },
                        { type: 'email', message: 'Please enter a valid email address' }
                      ]}
                    >
                      <CustomInput
                        prefix={<MailOutlined />}
                        placeholder="Please enter new email"
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
                    Change Email
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
                Email Security Tips
              </Title>
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Use a commonly used email address to ensure timely notifications</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Avoid using temporary or disposable email addresses</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Make sure the email address is spelled correctly</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                  <Text style={{ color: '#9ca3af' }}>Please verify the new email promptly after changing</Text>
                </div>
              </Space>

              <Divider style={{ borderColor: 'rgba(99, 102, 241, 0.2)', margin: '24px 0' }} />

              <div style={{ textAlign: 'center' }}>
                <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
                  Current Email: <Text style={{ color: '#f9fafb', fontWeight: 500 }}>{userInfo?.email || 'Unknown'}</Text>
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
      {/* 顶部导航栏 */}
      <Menubar currentPath="/dashboard/settings" />

      <PageContainer
        title="Account Settings"
        subtitle="Manage your personal information and security settings"
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
