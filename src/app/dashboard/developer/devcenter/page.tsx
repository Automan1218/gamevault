"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function DevCenterPage() {
    const router = useRouter();

    return (
        <Card
            title={<Title level={3}>My Developer Center</Title>}
            style={{ maxWidth: 800, margin: "0 auto" }}
        >
            <Paragraph>
                Manage your uploaded games and create new ones 🚀
            </Paragraph>

            <Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push("/dashboard/developer/devcenter/upload")}
                >
                    Upload New Game
                </Button>
            </Space>
        </Card>
    );
}
