"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { devgamesApi } from "@/app/features/devgames/services/devgamesApi";
import { useDevGames, UploadFormValues } from "@/app/features/devgames/hooks/useDevGames";
import { Button, Input, Form, Upload, message, DatePicker, Card } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function EditDevGamePage() {
    const { id } = useParams();
    const router = useRouter();
    const [form] = Form.useForm<UploadFormValues>();
    const [loading, setLoading] = useState(false);
    const { updateGame } = useDevGames();

    // ✅ 页面加载时获取当前游戏详情
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        devgamesApi
            .getGameById(id as string)
            .then((data) => {
                form.setFieldsValue({
                    name: data.name,
                    description: data.description,
                    releaseDate: data.releaseDate ? dayjs(data.releaseDate) : undefined,
                });
            })
            .catch(() => message.error("Failed to load game details"))
            .finally(() => setLoading(false));
    }, [id]);

    // ✅ 提交更新逻辑
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

    // ✅ 文件大小检查
    const MAX_SIZE_MB = 200;
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
                <h2>Edit Game</h2>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push("/dashboard/developer/mygames")}
                >
                    Back
                </Button>
            </div>

            {/* ===== 编辑表单主体 ===== */}
            <Card
                style={{
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #f0f0f0",
                    maxWidth: 800,
                    margin: "0 auto",
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={loading}
                    style={{ padding: "10px 0" }}
                >
                    <Form.Item
                        label="Game Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter the game name" }]}
                    >
                        <Input placeholder="Enter game name" />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={4} placeholder="Enter game description" />
                    </Form.Item>

                    <Form.Item label="Release Date" name="releaseDate">
                        <DatePicker showTime style={{ width: "100%" }} />
                    </Form.Item>

                    {/* ✅ 上传新图片（image/*） */}
                    <Form.Item
                        label="Replace Image"
                        name="image"
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
                            listType="picture"
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Select Image</Button>
                        </Upload>
                    </Form.Item>

                    {/* ✅ 上传新视频（video/*） */}
                    <Form.Item
                        label="Replace Video"
                        name="video"
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

                    {/* ✅ 上传新ZIP（.zip） */}
                    <Form.Item
                        label="Replace ZIP File"
                        name="zip"
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
                            <Button icon={<UploadOutlined />}>Select ZIP</Button>
                        </Upload>
                    </Form.Item>

                    {/* ===== 提交按钮 ===== */}
                    <Form.Item>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                            }}
                        >
                            <Button onClick={() => router.back()}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Update Game
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
