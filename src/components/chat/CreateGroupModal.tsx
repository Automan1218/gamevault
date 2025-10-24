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
 * Create group chat modal
 */
export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
                                                                      open,
                                                                      loading = false,
                                                                      onCancel,
                                                                      onConfirm,
                                                                  }) => {
    const [form] = Form.useForm();

    // Submit form
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onConfirm(values.title);
            form.resetFields();
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    // Cancel
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Create Group Chat"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Create"
            cancelText="Cancel"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 24 }}
            >
                <Form.Item
                    name="title"
                    label="Group Name"
                    rules={[
                        { required: true, message: 'Please enter group name' },
                        { min: 2, message: 'Group name must be at least 2 characters' },
                        { max: 50, message: 'Group name cannot exceed 50 characters' },
                    ]}
                >
                    <Input placeholder="Enter group name" maxLength={50} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Group Description (Optional)"
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter group description"
                        maxLength={200}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};