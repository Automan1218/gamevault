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
      // Error handling is handled by parent component
    }
  };

  const handleRegister = async (values: RegisterRequest) => {
    try {
      await onRegister(values);
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error) {
      // Error handling is handled by parent component
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: 'Login',
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
            rules={[{ required: true, message: 'Please enter username or email' }]}
          >
            <CustomInput
              prefix={<UserOutlined style={iconStyle} />}
              placeholder="Username or email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <CustomPasswordInput
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="Password"
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Button 
              type="link" 
              onClick={onForgotPassword} 
              style={{ color: '#9ca3af' }}
            >
              Forgot password?
            </Button>
          </div>

          <Form.Item>
            <CustomButton
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Login
            </CustomButton>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: 'Register',
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
              { required: true, message: 'Please enter username' },
              { min: 3, message: 'Username must be at least 3 characters' },
              ...(validateUsername ? [{ validator: validateUsername }] : [])
            ]}
            validateTrigger={['onBlur']}
          >
            <CustomInput
              prefix={<UserOutlined style={iconStyle} />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email address' },
              ...(validateEmail ? [{ validator: validateEmail }] : [])
            ]}
            validateTrigger={['onBlur']}
          >
            <CustomInput
              prefix={<MailOutlined style={iconStyle} />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <CustomPasswordInput
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <CustomPasswordInput
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <CustomButton
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Register
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





