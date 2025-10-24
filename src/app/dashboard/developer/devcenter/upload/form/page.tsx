"use client";

import { Card, Typography, Form, Input, Upload, Button, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { useDevGames, UploadFormValues } from "@/app/features/devgames/hooks/useDevGames";

const { Title } = Typography;

export default function UploadFormPage() {
    const [form] = Form.useForm<UploadFormValues>();
    const { uploadGame } = useDevGames(); // ✅ Get upload logic from Hook

    return (
        <Card style={{ maxWidth: 800, margin: "0 auto" }}>
            <Title level={3}>Upload a New Game</Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => uploadGame(values, () => form.resetFields())} // ✅ Call Hook method
            >
                <Form.Item name="name" label="Game Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item name="releaseDate" label="Release Date">
                    <DatePicker showTime />
                </Form.Item>

                {/* Upload section unified encapsulation */}
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
