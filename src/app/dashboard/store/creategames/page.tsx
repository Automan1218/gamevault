"use client";

import React, { useState } from "react";
import {
  App,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  Layout,
  Space,
  Divider,
  Switch,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Menubar } from "@/components/layout";
import { useRouter } from "next/navigation";
import { cardStyle, primaryButtonStyle } from "@/components/common/theme";
import type { GameDTO } from "@/lib/api/StoreTypes";
import { gameApi } from "@/app/features/store/services/gameApi";
import "@/components/common/animations.css";

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

interface CreateGameFormData {
  title: string;
  developer: string;
  description: string;
  price: number;
  discountPrice?: number;
  genre: string;
  platform: string;
  releaseDate: any; // Ant Design DatePicker 返回的类型
  imageUrl?: string;
  isActive: boolean;
}

export default function CreateGamePage() {
  const { message: antdMessage } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 游戏类型选项
  const genreOptions = [
    { value: "RPG", label: "角色扮演 (RPG)" },
    { value: "Action", label: "动作游戏" },
    { value: "Adventure", label: "冒险游戏" },
    { value: "Strategy", label: "策略游戏" },
    { value: "Simulation", label: "模拟游戏" },
    { value: "Sports", label: "体育游戏" },
    { value: "Racing", label: "竞速游戏" },
    { value: "Fighting", label: "格斗游戏" },
    { value: "Puzzle", label: "益智游戏" },
    { value: "Horror", label: "恐怖游戏" },
    { value: "Shooter", label: "射击游戏" },
    { value: "Platformer", label: "平台游戏" },
    { value: "MMORPG", label: "大型多人在线角色扮演" },
    { value: "Indie", label: "独立游戏" },
    { value: "Casual", label: "休闲游戏" },
  ];

  // 平台选项
  const platformOptions = [
    { value: "PC", label: "PC (Windows)" },
    { value: "Mac", label: "Mac" },
    { value: "Linux", label: "Linux" },
    { value: "PlayStation", label: "PlayStation" },
    { value: "Xbox", label: "Xbox" },
    { value: "Nintendo Switch", label: "Nintendo Switch" },
    { value: "Mobile", label: "移动设备" },
    { value: "VR", label: "VR设备" },
    { value: "Multi-Platform", label: "多平台" },
  ];

  // 处理图片选择 - 只做预览，不创建游戏
  const handleImageUpload = (file: File) => {
    // 验证文件大小（最大5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      antdMessage.error("图片大小不能超过5MB，请选择较小的图片");
      return false;
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      antdMessage.error("只支持 JPG、PNG、GIF、WEBP 格式的图片");
      return false;
    }

    // 保存文件引用
    setSelectedFile(file);
    
    // 创建本地预览URL
    const imageUrl = URL.createObjectURL(file);
    form.setFieldsValue({ imageUrl });
    antdMessage.success("图片选择成功，将在创建游戏时上传");
    
    // 返回 false 阻止默认上传行为
    return false;
  };

  // 处理表单提交
  const handleSubmit = async (values: CreateGameFormData) => {
    setLoading(true);
    let createdGameId: number | null = null;
    
    try {
      // 格式化日期
      const releaseDate = values.releaseDate 
        ? (values.releaseDate instanceof Date 
            ? values.releaseDate.toISOString().split('T')[0]
            : values.releaseDate.format('YYYY-MM-DD'))
        : undefined;

      // 先创建游戏（不包含图片）
      const gameData = {
        title: values.title,
        developer: values.developer,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice || undefined,
        genre: values.genre,
        platform: values.platform,
        releaseDate: releaseDate,
        imageUrl: undefined, // 先不设置图片
        isActive: values.isActive,
      };

      // 创建游戏
      const createdGame = await gameApi.createGame(gameData);
      createdGameId = createdGame.gameId;
      
      // 如果有选择的图片文件，上传图片
      if (selectedFile) {
        try {
          // 上传图片
          const uploadResult = await gameApi.uploadGameImage(createdGame.gameId, selectedFile);
          
          if (uploadResult.success && uploadResult.imageUrl) {
            // 更新游戏信息，添加图片URL
            await gameApi.updateGame(createdGame.gameId, {
              ...gameData,
              imageUrl: uploadResult.imageUrl
            });
          } else {
            throw new Error(uploadResult.message || "图片上传失败");
          }
        } catch (uploadError: any) {
          // 图片上传失败，删除已创建的游戏
          console.error("图片上传失败，正在回滚游戏创建:", uploadError);
          try {
            await gameApi.deleteGame(createdGame.gameId);
          } catch (deleteError) {
            console.error("删除游戏失败:", deleteError);
          }
          throw new Error(`图片上传失败: ${uploadError.message || "未知错误"}。游戏未创建。`);
        }
      }
      
      antdMessage.success("游戏创建成功！");
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push("/dashboard/store");
      }, 1500);
    } catch (error: any) {
      console.error("创建游戏失败:", error);
      antdMessage.error(error?.message || "创建游戏失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理返回
  const handleBack = () => {
    router.push("/dashboard/store");
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
          linear-gradient(225deg, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.12) 0%, transparent 50%),
          linear-gradient(180deg, #0f172a 0%, #020617 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 动态背景装饰 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* 网格背景 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            opacity: 0.4,
          }}
        />

        {/* 浮动光球 */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            right: "10%",
            width: 350,
            height: 350,
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(50px)",
            animation: "float 25s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "30%",
            width: 200,
            height: 200,
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(30px)",
            animation: "float 15s ease-in-out infinite",
          }}
        />
      </div>

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      {/* 固定顶部导航栏 */}
      <Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: 0,
          height: "auto",
          lineHeight: "normal",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(99, 102, 241, 0.3)",
          boxShadow: "0 4px 24px rgba(99, 102, 241, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Menubar currentPath="/dashboard/store" />
      </Header>

      {/* 页面主体内容 */}
      <Content
        style={{
          marginTop: 64,
          padding: "32px 24px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* 页面标题和返回按钮 */}
          <div
            className="fade-in-up"
            style={{
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 8,
                }}
              >
                <PlusOutlined style={{ marginRight: 12 }} />
                创建新游戏
              </div>
              <div style={{ color: "#9ca3af", fontSize: 16 }}>
                添加新游戏到商店，让玩家发现更多精彩内容
              </div>
            </div>
            <Button
              type="default"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{
                height: 44,
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
              }}
            >
              返回商店
            </Button>
          </div>

          {/* 创建游戏表单 */}
          <Card
            className="fade-in-up"
            style={{
              ...cardStyle,
              borderRadius: 20,
              animationDelay: "0.1s",
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
            styles={{ body: { padding: 40 } }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                isActive: true,
                price: 0,
              }}
              size="large"
            >
              <Row gutter={24}>
                {/* 左侧：基本信息 */}
                <Col xs={24} lg={16}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    {/* 游戏标题 */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          游戏标题 *
                        </span>
                      }
                      name="title"
                      rules={[
                        { required: true, message: "请输入游戏标题" },
                        { max: 255, message: "标题不能超过255个字符" },
                      ]}
                    >
                      <Input
                        placeholder="输入游戏标题"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* 开发者 */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          开发者 *
                        </span>
                      }
                      name="developer"
                      rules={[
                        { required: true, message: "请输入开发者名称" },
                        { max: 255, message: "开发者名称不能超过255个字符" },
                      ]}
                    >
                      <Input
                        placeholder="输入开发者名称"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* 游戏描述 */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          游戏描述 *
                        </span>
                      }
                      name="description"
                      rules={[
                        { required: true, message: "请输入游戏描述" },
                        { min: 10, message: "描述至少需要10个字符" },
                      ]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="详细描述游戏内容、特色、玩法等..."
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* 价格和折扣 */}
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                              价格 (￥) *
                            </span>
                          }
                          name="price"
                          rules={[
                            { required: true, message: "请输入游戏价格" },
                            { type: "number", min: 0, message: "价格不能为负数" },
                          ]}
                        >
                          <InputNumber
                            placeholder="0.00"
                            min={0}
                            step={0.01}
                            precision={2}
                            style={{
                              width: "100%",
                              background: "rgba(255, 255, 255, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                            }}
                            controls={false}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                              折扣价 (￥)
                            </span>
                          }
                          name="discountPrice"
                          rules={[
                            { type: "number", min: 0, message: "折扣价不能为负数" },
                          ]}
                        >
                          <InputNumber
                            placeholder="可选"
                            min={0}
                            step={0.01}
                            precision={2}
                            style={{
                              width: "100%",
                              background: "rgba(255, 255, 255, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                            }}
                            controls={false}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* 类型和平台 */}
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                              游戏类型 *
                            </span>
                          }
                          name="genre"
                          rules={[{ required: true, message: "请选择游戏类型" }]}
                        >
                          <Select
                            placeholder="选择游戏类型"
                            style={{
                              background: "rgba(255, 255, 255, 0.1)",
                            }}
                            dropdownStyle={{
                              background: "rgba(15, 23, 42, 0.95)",
                              backdropFilter: "blur(20px)",
                            }}
                          >
                            {genreOptions.map((option) => (
                              <Option key={option.value} value={option.value}>
                                {option.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                              支持平台 *
                            </span>
                          }
                          name="platform"
                          rules={[{ required: true, message: "请选择支持平台" }]}
                        >
                          <Select
                            placeholder="选择支持平台"
                            style={{
                              background: "rgba(255, 255, 255, 0.1)",
                            }}
                            dropdownStyle={{
                              background: "rgba(15, 23, 42, 0.95)",
                              backdropFilter: "blur(20px)",
                            }}
                          >
                            {platformOptions.map((option) => (
                              <Option key={option.value} value={option.value}>
                                {option.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* 发布日期 */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          发布日期 *
                        </span>
                      }
                      name="releaseDate"
                      rules={[{ required: true, message: "请选择发布日期" }]}
                    >
                      <DatePicker
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                        placeholder="选择发布日期"
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>

                    {/* 图片URL */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          游戏图片URL
                        </span>
                      }
                      name="imageUrl"
                    >
                      <Input
                        placeholder="输入游戏图片的URL地址"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* 图片上传 */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          或上传图片
                        </span>
                      }
                    >
                      <div>
                        <Upload
                          beforeUpload={handleImageUpload}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button
                            icon={<UploadOutlined />}
                            style={{
                              background: "rgba(255, 255, 255, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              color: "#fff",
                            }}
                          >
                            选择图片
                          </Button>
                        </Upload>
                        
                        {/* 图片预览 */}
                        {selectedFile && (
                          <div style={{ marginTop: 16 }}>
                            <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                              当前图片预览：
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: 200,
                                background: `url(${URL.createObjectURL(selectedFile)}) center/cover no-repeat`,
                                borderRadius: 12,
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: "40%",
                                  background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  background: "rgba(0, 0, 0, 0.6)",
                                  color: "#fff",
                                  padding: "4px 8px",
                                  borderRadius: 4,
                                  fontSize: 12,
                                }}
                              >
                                {selectedFile.name}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Form.Item>
                  </Space>
                </Col>

                {/* 右侧：设置和预览 */}
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    {/* 游戏状态 */}
                    <Card
                      style={{
                        background: "rgba(31, 41, 55, 0.6)",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        backdropFilter: "blur(10px)",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                        游戏设置
                      </div>
                      <Form.Item
                        name="isActive"
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ color: "#9ca3af" }}>立即上架</span>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Card>

                    {/* 预览信息 */}
                    <Card
                      style={{
                        background: "rgba(31, 41, 55, 0.6)",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        backdropFilter: "blur(10px)",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                        预览信息
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: 14 }}>
                        填写完表单后，游戏将按照您设置的信息在商店中展示。
                      </div>
                    </Card>
                  </Space>
                </Col>
              </Row>

              <Divider style={{ borderColor: "rgba(255, 255, 255, 0.1)", margin: "32px 0" }} />

              {/* 提交按钮 */}
              <div style={{ textAlign: "center" }}>
                <Space size="large">
                  <Button
                    type="default"
                    size="large"
                    onClick={handleBack}
                    style={{
                      height: 48,
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#fff",
                      minWidth: 120,
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    icon={<SaveOutlined />}
                    style={{
                      ...primaryButtonStyle,
                      height: 48,
                      borderRadius: 12,
                      minWidth: 120,
                    }}
                  >
                    {loading ? "创建中..." : "创建游戏"}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
