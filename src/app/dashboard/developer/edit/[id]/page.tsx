"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { devgamesApi } from "@/app/features/devgames/services/devgamesApi";
import { useDevGames, UploadFormValues } from "@/app/features/devgames/hooks/useDevGames";
import { Button, Input, Form, Upload, message, DatePicker, Card, Typography, Space } from "antd";
import { UploadOutlined, ArrowLeftOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { cardStyle, titleStyle } from "@/components/common/theme";

const { Title, Text } = Typography;

export default function EditDevGamePage() {
    const { id } = useParams();
    const router = useRouter();
    const [form] = Form.useForm<UploadFormValues>();
    const [loading, setLoading] = useState(false);
    const { updateGame } = useDevGames();

    // ✅ Get current game details when page loads
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        devgamesApi
            .getGameById(id as string)
            .then((data: any) => {
                form.setFieldsValue({
                    name: data.name,
                    description: data.description,
                    releaseDate: data.releaseDate ? dayjs(data.releaseDate) : undefined,
                });
            })
            .catch(() => message.error("Failed to load game details"))
            .finally(() => setLoading(false));
    }, [id]);

    // ✅ Submit update logic
    const handleSubmit = async (values: UploadFormValues) => {
        try {
            setLoading(true);
            await updateGame(id as string, values, () => {
                message.success("🎮 Game updated successfully!");
                router.push("/dashboard/developer/mygames");
            });
        } catch (err) {
            console.error(err);
            message.error("Update failed, please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ File size check
    const MAX_SIZE_MB = 200;
    const checkFileSize = (file: File) => {
        const isLtMax = file.size / 1024 / 1024 < MAX_SIZE_MB;
        if (!isLtMax) message.error(`File must be smaller than ${MAX_SIZE_MB}MB!`);
        return isLtMax;
    };

    if (loading && !form.getFieldValue('name')) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "Inter, sans-serif" }}>
            {/* ===== Top Title Bar ===== */}
            <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                            }}
                        >
                            <EditOutlined style={{ fontSize: "28px", color: "white" }} />
                        </div>
                        <div>
                            <Title level={2} style={{ ...titleStyle, margin: 0 }}>
                                Edit Game
                            </Title>
                            <Text style={{ color: "#9ca3af", fontSize: "16px" }}>
                                Update your game information and assets
                            </Text>
                        </div>
                    </div>

                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push("/dashboard/developer/mygames")}
                        style={{
                            height: "48px",
                            padding: "0 24px",
                            borderRadius: "12px",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            color: "#f9fafb",
                        }}
                    >
                        Back to My Games
                    </Button>
                </div>
            </div>

            {/* ===== Edit Form Body ===== */}
            <Card
                style={{
                    ...cardStyle,
                    maxWidth: 800,
                    margin: "0 auto",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={loading}
                    style={{ padding: "8px" }}
                >
                    <Form.Item
                        name="name"
                        label={<Text style={{ color: "#f9fafb", fontWeight: 600 }}>Game Name</Text>}
                        rules={[{ required: true, message: "Please enter the game name" }]}
                    >
                        <Input 
                            placeholder="Enter your game name" 
                            style={{
                                height: "48px",
                                borderRadius: "12px",
                                background: "rgba(15, 23, 42, 0.8)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                color: "#f9fafb",
                            }}
                        />
                    </Form.Item>

                    <Form.Item 
                        name="description" 
                        label={<Text style={{ color: "#f9fafb", fontWeight: 600 }}>Description</Text>}
                    >
                        <Input.TextArea
                            placeholder="Describe your game briefly..."
                            rows={4}
                            maxLength={500}
                            style={{
                                borderRadius: "12px",
                                background: "rgba(15, 23, 42, 0.8)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                color: "#f9fafb",
                            }}
                        />
                    </Form.Item>

                    <Form.Item 
                        name="releaseDate" 
                        label={<Text style={{ color: "#f9fafb", fontWeight: 600 }}>Release Date</Text>}
                    >
                        <DatePicker 
                            showTime 
                            style={{ 
                                width: "100%",
                                height: "48px",
                                borderRadius: "12px",
                                background: "rgba(15, 23, 42, 0.8)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                            }} 
                        />
                    </Form.Item>

                    {/* ✅ Upload images (only allow image/*) */}
                    <Form.Item
                        name="image"
                        label={<Text style={{ color: "#f9fafb", fontWeight: 600 }}>Game Image</Text>}
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
                            <Button 
                                icon={<UploadOutlined />}
                                style={{
                                    height: "48px",
                                    padding: "0 24px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    border: "none",
                                    color: "white",
                                    fontWeight: 600,
                                    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                                }}
                            >
                                Select Image
                            </Button>
                        </Upload>
                    </Form.Item>

                    {/* ✅ Upload videos (only allow video/*) */}
                    <Form.Item
                        name="video"
                        label={<Text style={{ color: "#f9fafb", fontWeight: 600 }}>Game Video</Text>}
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
                            <Button 
                                icon={<UploadOutlined />}
                                style={{
                                    height: "48px",
                                    padding: "0 24px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                                    border: "none",
                                    color: "white",
                                    fontWeight: 600,
                                    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
                                }}
                            >
                                Select Video
                            </Button>
                        </Upload>
                    </Form.Item>

                    {/* ✅ Upload ZIP (only allow .zip) */}
                    <Form.Item
                        name="zip"
                        label={<Text style={{ color: "#f9fafb", fontWeight: 600 }}>Game Package (ZIP)</Text>}
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
                            <Button 
                                icon={<UploadOutlined />}
                                style={{
                                    height: "48px",
                                    padding: "0 24px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                                    border: "none",
                                    color: "white",
                                    fontWeight: 600,
                                    boxShadow: "0 8px 32px rgba(6, 182, 212, 0.3)",
                                }}
                            >
                                Select ZIP File
                            </Button>
                        </Upload>
                    </Form.Item>

                    {/* ===== Submit Button ===== */}
                    <Form.Item>
                        <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: "32px" }}>
                            <Button 
                                onClick={() => router.back()}
                                style={{
                                    height: "48px",
                                    padding: "0 24px",
                                    borderRadius: "12px",
                                    background: "rgba(15, 23, 42, 0.8)",
                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                    color: "#f9fafb",
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={loading}
                                icon={<SaveOutlined />}
                                style={{
                                    height: "48px",
                                    padding: "0 32px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    border: "none",
                                    fontWeight: 600,
                                    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                                }}
                            >
                                Update Game
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}