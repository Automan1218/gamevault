// src/components/chat/CreateGroupModal.tsx
import React from 'react';
import { Modal, Form, Input, message } from 'antd';

const { TextArea } = Input;

interface CreateGroupModalProps {
    open: boolean;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: (title: string) => void;
}

/**
 * 创建群聊弹窗
 */
export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
                                                                      open,
                                                                      loading = false,
                                                                      onCancel,
                                                                      onConfirm,
                                                                  }) => {
    const [form] = Form.useForm();

    // 提交表单
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onConfirm(values.title);
            form.resetFields();
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    // 取消
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="创建群聊"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="创建"
            cancelText="取消"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 24 }}
            >
                <Form.Item
                    name="title"
                    label="群聊名称"
                    rules={[
                        { required: true, message: '请输入群聊名称' },
                        { min: 2, message: '群聊名称至少2个字符' },
                        { max: 50, message: '群聊名称最多50个字符' },
                    ]}
                >
                    <Input placeholder="输入群聊名称" maxLength={50} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="群聊描述（可选）"
                >
                    <TextArea
                        rows={3}
                        placeholder="输入群聊描述"
                        maxLength={200}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};