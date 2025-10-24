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
  releaseDate: any; // Ant Design DatePicker return type
  imageUrl?: string;
  isActive: boolean;
}
export const dynamic = 'force-dynamic';
export default function CreateGamePage() {
  const { message: antdMessage } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Game genre options
  const genreOptions = [
    { value: "RPG", label: "Role-Playing Game (RPG)" },
    { value: "Action", label: "Action Game" },
    { value: "Adventure", label: "Adventure Game" },
    { value: "Strategy", label: "Strategy Game" },
    { value: "Simulation", label: "Simulation Game" },
    { value: "Sports", label: "Sports Game" },
    { value: "Racing", label: "Racing Game" },
    { value: "Fighting", label: "Fighting Game" },
    { value: "Puzzle", label: "Puzzle Game" },
    { value: "Horror", label: "Horror Game" },
    { value: "Shooter", label: "Shooter Game" },
    { value: "Platformer", label: "Platform Game" },
    { value: "MMORPG", label: "Massively Multiplayer Online Role-Playing Game" },
    { value: "Indie", label: "Indie Game" },
    { value: "Casual", label: "Casual Game" },
  ];

  // Platform options
  const platformOptions = [
    { value: "PC", label: "PC (Windows)" },
    { value: "Mac", label: "Mac" },
    { value: "Linux", label: "Linux" },
    { value: "PlayStation", label: "PlayStation" },
    { value: "Xbox", label: "Xbox" },
    { value: "Nintendo Switch", label: "Nintendo Switch" },
    { value: "Mobile", label: "Mobile Device" },
    { value: "VR", label: "VR Device" },
    { value: "Multi-Platform", label: "Multi-Platform" },
  ];

  // Handle image selection - preview only, don't create game
  const handleImageUpload = (file: File) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      antdMessage.error("Image size cannot exceed 5MB, please select a smaller image");
      return false;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      antdMessage.error("Only JPG, PNG, GIF, WEBP format images are supported");
      return false;
    }

    // Save file reference
    setSelectedFile(file);
    
    // Create local preview URL
    const imageUrl = URL.createObjectURL(file);
    form.setFieldsValue({ imageUrl });
    antdMessage.success("Image selected successfully, will be uploaded when creating the game");
    
    // Return false to prevent default upload behavior
    return false;
  };

  // Handle form submission
  const handleSubmit = async (values: CreateGameFormData) => {
    setLoading(true);
    let createdGameId: number | null = null;
    
    try {
      // Format date
      const releaseDate = values.releaseDate 
        ? (values.releaseDate instanceof Date 
            ? values.releaseDate.toISOString().split('T')[0]
            : values.releaseDate.format('YYYY-MM-DD'))
        : undefined;

      // Create game first (without image)
      const gameData = {
        title: values.title,
        developer: values.developer,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice || undefined,
        genre: values.genre,
        platform: values.platform,
        releaseDate: releaseDate,
        imageUrl: undefined, // Don't set image first
        isActive: values.isActive,
      };

      // Create game
      const createdGame = await gameApi.createGame(gameData);
      createdGameId = createdGame.gameId;
      
      // If there's a selected image file, upload it
      if (selectedFile) {
        try {
          // Upload image
          const uploadResult = await gameApi.uploadGameImage(createdGame.gameId, selectedFile);
          
          if (uploadResult.success && uploadResult.imageUrl) {
            // Update game information, add image URL
            await gameApi.updateGame(createdGame.gameId, {
              ...gameData,
              imageUrl: uploadResult.imageUrl
            });
          } else {
            throw new Error(uploadResult.message || "Image upload failed");
          }
        } catch (uploadError: any) {
          // Image upload failed, delete the created game
          console.error("Image upload failed, rolling back game creation:", uploadError);
          try {
            await gameApi.deleteGame(createdGame.gameId);
          } catch (deleteError) {
            console.error("Failed to delete game:", deleteError);
          }
          throw new Error(`Image upload failed: ${uploadError.message || "Unknown error"}. Game not created.`);
        }
      }
      
      antdMessage.success("Game created successfully!");
      
      // Delay redirect to let user see success message
      setTimeout(() => {
        router.push("/dashboard/store");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create game:", error);
      antdMessage.error(error?.message || "Failed to create game, please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle return
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
      {/* Dynamic background decoration */}
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
        {/* Grid background */}
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

        {/* Floating light balls */}
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

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      {/* Fixed top navigation bar */}
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

      {/* Main page content */}
      <Content
        style={{
          marginTop: 64,
          padding: "32px 24px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Page title and back button */}
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
                Create New Game
              </div>
              <div style={{ color: "#9ca3af", fontSize: 16 }}>
                Add new games to the store for players to discover more exciting content
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
              Back to Store
            </Button>
          </div>

          {/* Create game form */}
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
                {/* Left side: Basic information */}
                <Col xs={24} lg={16}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    {/* Game title */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          Game Title *
                        </span>
                      }
                      name="title"
                      rules={[
                        { required: true, message: "Please enter game title" },
                        { max: 255, message: "Title cannot exceed 255 characters" },
                      ]}
                    >
                      <Input
                        placeholder="Enter game title"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* Developer */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          Developer *
                        </span>
                      }
                      name="developer"
                      rules={[
                        { required: true, message: "Please enter developer name" },
                        { max: 255, message: "Developer name cannot exceed 255 characters" },
                      ]}
                    >
                      <Input
                        placeholder="Enter developer name"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* Game description */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          Game Description *
                        </span>
                      }
                      name="description"
                      rules={[
                        { required: true, message: "Please enter game description" },
                        { min: 10, message: "Description must be at least 10 characters" },
                      ]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="Describe game content, features, gameplay, etc. in detail..."
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* Price and discount */}
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                              Price (¥) *
                            </span>
                          }
                          name="price"
                          rules={[
                            { required: true, message: "Please enter game price" },
                            { type: "number", min: 0, message: "Price cannot be negative" },
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
                              Discount Price (¥)
                            </span>
                          }
                          name="discountPrice"
                          rules={[
                            { type: "number", min: 0, message: "Discount price cannot be negative" },
                          ]}
                        >
                          <InputNumber
                            placeholder="Optional"
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

                    {/* Type and platform */}
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                              Game Type *
                            </span>
                          }
                          name="genre"
                          rules={[{ required: true, message: "Please select game type" }]}
                        >
                          <Select
                            placeholder="Select game type"
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
                              Supported Platform *
                            </span>
                          }
                          name="platform"
                          rules={[{ required: true, message: "Please select supported platform" }]}
                        >
                          <Select
                            placeholder="Select supported platform"
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

                    {/* Release date */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          Release Date *
                        </span>
                      }
                      name="releaseDate"
                      rules={[{ required: true, message: "Please select release date" }]}
                    >
                      <DatePicker
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                        placeholder="Select release date"
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>

                    {/* Image URL */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          Game Image URL
                        </span>
                      }
                      name="imageUrl"
                    >
                      <Input
                        placeholder="Enter game image URL address"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                        }}
                      />
                    </Form.Item>

                    {/* Image upload */}
                    <Form.Item
                      label={
                        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                          Or upload image
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
                            Select Image
                          </Button>
                        </Upload>
                        
                        {/* Image preview */}
                        {selectedFile && (
                          <div style={{ marginTop: 16 }}>
                            <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
                              Current image preview:
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

                {/* Right side: Settings and preview */}
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    {/* Game status */}
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
                        Game Settings
                      </div>
                      <Form.Item
                        name="isActive"
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ color: "#9ca3af" }}>List immediately</span>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Card>

                    {/* Preview information */}
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
                        Preview Information
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: 14 }}>
                        After filling out the form, the game will be displayed in the store according to your settings.
                      </div>
                    </Card>
                  </Space>
                </Col>
              </Row>

              <Divider style={{ borderColor: "rgba(255, 255, 255, 0.1)", margin: "32px 0" }} />

              {/* Submit buttons */}
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
                    Cancel
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
                    {loading ? "Creating..." : "Create Game"}
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
