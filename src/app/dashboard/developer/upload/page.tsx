"use client";

import React from "react";
import { Card, Typography, Form, Input, Upload, Button, DatePicker, message } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useDevGames, UploadFormValues } from "@/app/features/devgames/hooks/useDevGames";

const { Title } = Typography;

export default function UploadGamePage() {
    const [form] = Form.useForm<UploadFormValues>();
    const { uploadGame } = useDevGames();
    const router = useRouter();

    const handleSubmit = async (values: UploadFormValues) => {
        try {
            await uploadGame(values, () => form.resetFields());
            message.success("🎮 Upload successful!");
            router.push("/dashboard/developer/mygames");
        } catch (err) {
            console.error("Upload failed:", err);
            message.error("Upload failed. Please try again.");
        }
    };

    // ✅ 通用大小限制（单位 MB）
    const MAX_SIZE_MB = 1000;
    const checkFileSize = (file: File) => {
        const isLtMax = file.size / 1024 / 1024 < MAX_SIZE_MB;
        if (!isLtMax) message.error(`File must be smaller than ${MAX_SIZE_MB}MB!`);
        return isLtMax;
    };

    return (
        <div
            style={{
                background: "#fff",
                minHeight: "100vh",
                padding: "40px 80px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {/* ===== 顶部标题栏 ===== */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                }}
            >
                <div>
                    <Title level={2} style={{ marginBottom: "8px" }}>
                        Upload New Game
                    </Title>
                    <p style={{ color: "#666", margin: 0 }}>
                        Share your latest creation with the community.
                    </p>
                </div>

                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push("/dashboard/developer/mygames")}
                >
                    Back to My Games
                </Button>
            </div>

            {/* ===== 上传表单主体 ===== */}
            <Card
                style={{
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #f0f0f0",
                    maxWidth: 800,
                    margin: "0 auto",
                    background: "#fafafa",
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ padding: "20px 10px" }}
                >
                    <Form.Item
                        name="name"
                        label="Game Name"
                        rules={[{ required: true, message: "Please enter the game name" }]}
                    >
                        <Input placeholder="Enter your game name" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea
                            placeholder="Describe your game briefly..."
                            rows={4}
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item name="releaseDate" label="Release Date">
                        <DatePicker showTime style={{ width: "100%" }} />
                    </Form.Item>

                    {/* ✅ 上传图片（只允许 image/*） */}
                    <Form.Item
                        name="image"
                        label="Game Image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e?.fileList}
                    >
                        <Upload
                            accept="image/*"
                            beforeUpload={(file) => {
                                const isImage = file.type.startsWith("image/");
                                if (!isImage) {
                                    message.error("Only image files (JPG/PNG/GIF) are allowed!");
                                }
                                return isImage && checkFileSize(file)
                                    ? false
                                    : Upload.LIST_IGNORE;
                            }}
                            maxCount={1}
                            listType="picture"
                        >
                            <Button icon={<UploadOutlined />}>Select Image</Button>
                        </Upload>
                    </Form.Item>

                    {/* ✅ 上传视频（只允许 video/*） */}
                    <Form.Item
                        name="video"
                        label="Game Video"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e?.fileList}
                    >
                        <Upload
                            accept="video/*"
                            beforeUpload={(file) => {
                                const isVideo = file.type.startsWith("video/");
                                if (!isVideo) {
                                    message.error("Only video files (MP4/WebM) are allowed!");
                                }
                                return isVideo && checkFileSize(file)
                                    ? false
                                    : Upload.LIST_IGNORE;
                            }}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Select Video</Button>
                        </Upload>
                    </Form.Item>

                    {/* ✅ 上传ZIP（只允许 .zip） */}
                    <Form.Item
                        name="zip"
                        label="Game Package (ZIP)"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e?.fileList}
                    >
                        <Upload
                            accept=".zip"
                            beforeUpload={(file) => {
                                const isZip =
                                    file.type === "application/zip" ||
                                    file.name.toLowerCase().endsWith(".zip");
                                if (!isZip) {
                                    message.error("Only .zip files are allowed!");
                                }
                                return isZip && checkFileSize(file)
                                    ? false
                                    : Upload.LIST_IGNORE;
                            }}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Select ZIP File</Button>
                        </Upload>
                    </Form.Item>

                    {/* ===== 提交按钮 ===== */}
                    <Form.Item>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                                marginTop: "20px",
                            }}
                        >
                            <Button onClick={() => form.resetFields()}>Reset</Button>
                            <Button type="primary" htmlType="submit">
                                Upload
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
