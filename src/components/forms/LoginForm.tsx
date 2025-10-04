import React, { useState } from 'react';
import { Form, Button, Tabs, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { CustomInput, CustomPasswordInput, CustomButton } from '../ui';
import { iconStyle } from '../common/theme';
import { LoginRequest, RegisterRequest } from '@/types/api';

const { Title } = Typography;

interface LoginFormProps {
  onLogin: (values: LoginRequest) => Promise<void>;
  onRegister: (values: RegisterRequest) => Promise<void>;
  loading?: boolean;
  onForgotPassword?: () => void;
  validateEmail?: (rule: any, value: string) => Promise<void>;
  validateUsername?: (rule: any, value: string) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onRegister,
  loading = false,
  onForgotPassword,
  validateEmail,
  validateUsername,
}) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values: LoginRequest) => {
    try {
      await onLogin(values);
    } catch (error) {
      // 错误处理由父组件负责
    }
  };

  const handleRegister = async (values: RegisterRequest) => {
    try {
      await onRegister(values);
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error) {
      // 错误处理由父组件负责
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          form={loginForm}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
          style={{ marginBottom: 0 }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <CustomInput
              prefix={<UserOutlined style={iconStyle} />}
              placeholder="用户名或邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <CustomPasswordInput
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="密码"
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Button 
              type="link" 
              onClick={onForgotPassword} 
              style={{ color: '#9ca3af' }}
            >
              忘记密码？
            </Button>
          </div>

          <Form.Item>
            <CustomButton
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </CustomButton>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          form={registerForm}
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          size="large"
          style={{ marginBottom: 0 }}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              ...(validateUsername ? [{ validator: validateUsername }] : [])
            ]}
            validateTrigger={['onBlur']}
          >
            <CustomInput
              prefix={<UserOutlined style={iconStyle} />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
              ...(validateEmail ? [{ validator: validateEmail }] : [])
            ]}
            validateTrigger={['onBlur']}
          >
            <CustomInput
              prefix={<MailOutlined style={iconStyle} />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <CustomPasswordInput
              prefix={<LockOutlined style={iconStyle} />}
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
            <CustomPasswordInput
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="确认密码"
            />
          </Form.Item>

          <Form.Item>
            <CustomButton
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              注册
            </CustomButton>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        size="large"
        items={tabItems}
        style={{ marginBottom: 0 }}
        tabBarStyle={{
          marginBottom: 32,
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      />
    </div>
  );
};





