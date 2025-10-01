"use client";

import { App, Card, Typography, Form, Input, Upload, Button, DatePicker, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { devgamesApi } from "@/app/features/devgames/services/devgamesApi";

const { Title } = Typography;

// 定义表单值类型
interface UploadFormValues {
    name: string;
    description?: string;
    releaseDate?: Dayjs;
    image?: { originFileObj: File }[];
    video?: { originFileObj: File }[];
    zip?: { originFileObj: File }[];
}

export default function UploadFormPage() {
    const [form] = Form.useForm<UploadFormValues>();
    const { message } = App.useApp(); // ✅ 获取 message 实例


    const handleSubmit = async (values: UploadFormValues) => {
        try {
            const request = {
                developerId: "dev-profile-001",//yao xiu gai
                name: values.name,
                description: values.description ?? "",
                releaseDate: values.releaseDate
                    ? values.releaseDate.toISOString()
                    : new Date().toISOString(),
                image: values.image?.[0]?.originFileObj as File,
                video: values.video?.[0]?.originFileObj as File | undefined,
                zip: values.zip?.[0]?.originFileObj as File,
            };

            await devgamesApi.upload(request);
            void message.success("Uploaded 🚀");
            form.resetFields();
        } catch (e) {
            if (e instanceof Error) {
                void message.error(e.message);
            } else {
                void message.error("Upload failed");
            }
        }
    };

    return (
        <Card style={{ maxWidth: 800, margin: "0 auto" }}>
            <Title level={3}>Upload a New Game</Title>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="Game Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item name="releaseDate" label="Release Date">
                    <DatePicker showTime />
                </Form.Item>

                {/* Upload 统一：阻止自动上传 + 通知表单拿 fileList */}
                <Form.Item
                    name="image"
                    label="Game Image"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}
                >
                    <Upload beforeUpload={() => false} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                    </Upload>
                </Form.Item>
                <Form.Item
                    name="video"
                    label="Game Video"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}
                >
                    <Upload beforeUpload={() => false} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Upload Video</Button>
                    </Upload>
                </Form.Item>
                <Form.Item
                    name="zip"
                    label="Game Package (ZIP)"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}
                >
                    <Upload beforeUpload={() => false} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Upload ZIP</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}
