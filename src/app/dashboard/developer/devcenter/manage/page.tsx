"use client";
import { Table, Button, Space } from "antd";

const data = [
    { key: 1, name: "Cyberpunk 2077", downloads: 500, rating: 4.2 },
    { key: 2, name: "Elden Ring", downloads: 800, rating: 4.9 },
];

export default function DevManagePage() {
    const columns = [
        { title: "Game Name", dataIndex: "name" },
        { title: "Downloads", dataIndex: "downloads" },
        { title: "Rating", dataIndex: "rating" },
        {
            title: "Actions",
            render: () => (
                <Space>
                    <Button type="link">Edit</Button>
                    <Button type="link" danger>Delete</Button>
                </Space>
            ),
        },
    ];

    return <Table columns={columns} dataSource={data} pagination={false} />;
}