"use client";

import React, { useState, useEffect } from "react";
import { App, Card, Tabs, Form, Button, Avatar, Upload, Alert } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, CameraOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { PageContainer, UserMenu } from '@/components/layout';
import { CustomButton, CustomInput, CustomPasswordInput } from '@/components/ui';
import { AuthApi } from '@/lib/api/auth';
import { navigationRoutes } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import '@/components/common/animations.css';

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
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          个人资料
        </span>
      ),
      children: (
        <Card
          style={{
            background: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: 16,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                marginBottom: 16,
              }}
            />
            <div>
              <h3 style={{ color: '#f9fafb', margin: '8px 0 4px 0' }}>
                {userInfo?.username || 'Unknown'}
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                {userInfo?.email || 'Unknown'}
              </p>
            </div>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarUpload}
            >
              <CustomButton
                variant="ghost"
                size="small"
                icon={<CameraOutlined />}
                style={{ marginTop: 16 }}
              >
                更换头像
              </CustomButton>
            </Upload>
          </div>
        </Card>
      ),
    },
    {
      key: 'password',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockOutlined />
          修改密码
        </span>
      ),
      children: (
        <Card
          style={{
            background: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: 16,
          }}
        >
          <Alert
            message="安全提示"
            description="修改密码后需要重新登录以确保账户安全"
            type="warning"
            icon={<ExclamationCircleOutlined />}
            style={{
              marginBottom: 24,
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 8,
            }}
          />
          <Form
            form={changePasswordForm}
            name="changePassword"
            onFinish={handleChangePassword}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <CustomPasswordInput
                prefix={<LockOutlined />}
                placeholder="请输入当前密码"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
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

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
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

            <Form.Item>
              <CustomButton
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                修改密码
              </CustomButton>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'email',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MailOutlined />
          更改邮箱
        </span>
      ),
      children: (
        <Card
          style={{
            background: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: 16,
          }}
        >
          <Alert
            message="安全提示"
            description="修改邮箱后需要重新登录以确保账户安全"
            type="warning"
            icon={<ExclamationCircleOutlined />}
            style={{
              marginBottom: 24,
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 8,
            }}
          />
          <Form
            form={changeEmailForm}
            name="changeEmail"
            onFinish={handleChangeEmail}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="password"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <CustomPasswordInput
                prefix={<LockOutlined />}
                placeholder="请输入当前密码"
              />
            </Form.Item>

            <Form.Item
              name="newEmail"
              label="新邮箱"
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

            <Form.Item>
              <CustomButton
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                更改邮箱
              </CustomButton>
            </Form.Item>
          </Form>
        </Card>
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
            marginBottom: 32,
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          }}
          items={tabItems}
        />
      </PageContainer>
    </>
  );
}
