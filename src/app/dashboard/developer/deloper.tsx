'use client';
import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Card,
    Button,
    Progress,
    Table,
    Tabs,
    Input,
    Select,
    Upload,
    Tree,
    List,
    Avatar,
    Badge,
    Statistic,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Dropdown,
    Modal,
    Form,
    message,
    Timeline,
    Drawer,
    Switch,
    Slider,
    ColorPicker
} from 'antd';
import {
    FolderOutlined,
    FileOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    BugOutlined,
    SettingOutlined,
    CloudUploadOutlined,
    TeamOutlined,
    BarChartOutlined,
    CodeOutlined,
    PictureOutlined,
    SoundOutlined,
    DatabaseOutlined,
    RocketOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
    DownloadOutlined,
    ShareAltOutlined,
    BellOutlined,
    UserOutlined,
    HomeOutlined,
    AppstoreOutlined,
    ToolOutlined,
    FileTextOutlined,
    VideoCameraOutlined,
    AudioOutlined,
    CameraOutlined,
    GithubOutlined,
    BuildOutlined,
    MonitorOutlined,
    MobileOutlined,
    DesktopOutlined
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const GameDevInterface = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [buildProgress, setBuildProgress] = useState(0);
    const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState('main.js');
    const [notifications, setNotifications] = useState(3);

    // 模拟项目数据
    const [projects] = useState([
        {
            id: 1,
            name: 'Space Adventure',
            type: '2D平台游戏',
            status: '开发中',
            progress: 75,
            lastModified: '2小时前',
            platform: ['PC', 'Mobile'],
            team: 4
        },
        {
            id: 2,
            name: 'Racing Thunder',
            type: '赛车游戏',
            status: '测试中',
            progress: 90,
            lastModified: '1天前',
            platform: ['PC', 'Console'],
            team: 6
        },
        {
            id: 3,
            name: 'Puzzle Quest',
            type: '益智游戏',
            status: '已发布',
            progress: 100,
            lastModified: '1周前',
            platform: ['Mobile'],
            team: 3
        }
    ]);

    // 文件树数据
    const fileTreeData = [
        {
            title: 'src',
            key: 'src',
            icon: <FolderOutlined />,
            children: [
                {
                    title: 'scripts',
                    key: 'scripts',
                    icon: <FolderOutlined />,
                    children: [
                        { title: 'main.js', key: 'main.js', icon: <CodeOutlined /> },
                        { title: 'player.js', key: 'player.js', icon: <CodeOutlined /> },
                        { title: 'enemy.js', key: 'enemy.js', icon: <CodeOutlined /> }
                    ]
                },
                {
                    title: 'assets',
                    key: 'assets',
                    icon: <FolderOutlined />,
                    children: [
                        { title: 'sprites', key: 'sprites', icon: <FolderOutlined /> },
                        { title: 'sounds', key: 'sounds', icon: <FolderOutlined /> },
                        { title: 'music', key: 'music', icon: <FolderOutlined /> }
                    ]
                }
            ]
        }
    ];

    // 资源列表数据
    const assetData = [
        { key: '1', name: 'player_idle.png', type: '精灵图', size: '2.3KB', lastModified: '今天' },
        { key: '2', name: 'background.jpg', type: '背景图', size: '156KB', lastModified: '昨天' },
        { key: '3', name: 'jump_sound.wav', type: '音效', size: '45KB', lastModified: '2天前' },
        { key: '4', name: 'bgm_level1.mp3', type: '背景音乐', size: '2.1MB', lastModified: '3天前' }
    ];

    // 任务数据
    const taskData = [
        { key: '1', task: '修复跳跃动画bug', priority: '高', assignee: '张三', status: '进行中', dueDate: '今天' },
        { key: '2', task: '优化游戏性能', priority: '中', assignee: '李四', status: '待开始', dueDate: '明天' },
        { key: '3', task: '添加新关卡设计', priority: '低', assignee: '王五', status: '已完成', dueDate: '昨天' }
    ];

    // 菜单项
    const menuItems = [
        { key: 'dashboard', icon: <HomeOutlined />, label: '仪表板' },
        { key: 'projects', icon: <AppstoreOutlined />, label: '项目管理' },
        { key: 'code', icon: <CodeOutlined />, label: '代码编辑' },
        { key: 'assets', icon: <PictureOutlined />, label: '资源管理' },
        { key: 'build', icon: <BuildOutlined />, label: '构建部署' },
        { key: 'debug', icon: <BugOutlined />, label: '调试工具' },
        { key: 'team', icon: <TeamOutlined />, label: '团队协作' },
        { key: 'analytics', icon: <BarChartOutlined />, label: '数据分析' },
        { key: 'settings', icon: <SettingOutlined />, label: '设置' }
    ];

    // 模拟构建过程
    const handleBuild = () => {
        setBuildProgress(0);
        const timer = setInterval(() => {
            setBuildProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    message.success('构建完成！');
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    // 渲染仪表板
    const renderDashboard = () => (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="活跃项目"
                            value={2}
                            prefix={<AppstoreOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="今日构建"
                            value={8}
                            prefix={<BuildOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="待修复Bug"
                            value={3}
                            prefix={<BugOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="团队成员"
                            value={12}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="最近项目" extra={<Button type="primary" icon={<PlusOutlined />}>新建项目</Button>}>
                        <List
                            itemLayout="horizontal"
                            dataSource={projects.slice(0, 3)}
                            renderItem={item => (
                                <List.Item
                                    actions={[
                                        <Button key="edit" type="text" icon={<EditOutlined />}>编辑</Button>,
                                        <Button key="play" type="text" icon={<PlayCircleOutlined />}>运行</Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<AppstoreOutlined />} />}
                                        title={
                                            <div className="flex items-center gap-2">
                                                <span>{item.name}</span>
                                                <Tag color={item.status === '开发中' ? 'blue' : item.status === '测试中' ? 'orange' : 'green'}>
                                                    {item.status}
                                                </Tag>
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <div>{item.type} • {item.platform.join(', ')} • {item.team}人团队</div>
                                                <Progress percent={item.progress} size="small" className="mt-2" />
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="最近活动" className="h-96 overflow-auto">
                        <Timeline
                            items={[
                                {
                                    children: '张三提交了代码到Space Adventure项目',
                                    color: 'blue'
                                },
                                {
                                    children: '李四修复了Racing Thunder的性能问题',
                                    color: 'green'
                                },
                                {
                                    children: '系统自动构建完成',
                                    color: 'gray'
                                },
                                {
                                    children: 'QA团队报告了新的bug',
                                    color: 'red'
                                },
                                {
                                    children: '王五上传了新的音效资源',
                                    color: 'blue'
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    // 渲染项目管理
    const renderProjects = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Title level={3}>项目管理</Title>
                <Space>
                    <Button icon={<PlusOutlined />}>新建项目</Button>
                    <Button icon={<DownloadOutlined />}>导入项目</Button>
                </Space>
            </div>

            <Row gutter={[16, 16]}>
                {projects.map(project => (
                    <Col xs={24} md={12} lg={8} key={project.id}>
                        <Card
                            hoverable
                            actions={[
                                <PlayCircleOutlined key="play" />,
                                <EditOutlined key="edit" />,
                                <SettingOutlined key="setting" />
                            ]}
                        >
                            <Card.Meta
                                avatar={<Avatar size={64} icon={<AppstoreOutlined />} />}
                                title={project.name}
                                description={
                                    <div className="space-y-2">
                                        <div>{project.type}</div>
                                        <Tag color={project.status === '开发中' ? 'blue' : project.status === '测试中' ? 'orange' : 'green'}>
                                            {project.status}
                                        </Tag>
                                        <Progress percent={project.progress} size="small" />
                                        <div className="text-sm text-gray-500">
                                            <div>平台: {project.platform.join(', ')}</div>
                                            <div>团队: {project.team}人</div>
                                            <div>更新: {project.lastModified}</div>
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );

    // 渲染代码编辑器
    const renderCodeEditor = () => (
        <div className="h-full">
            <Row gutter={16} className="h-full">
                <Col xs={24} lg={6}>
                    <Card title="文件资源管理器" className="h-full">
                        <Tree
                            showIcon
                            defaultExpandAll
                            treeData={fileTreeData}
                            onSelect={(keys) => keys.length > 0 && setSelectedFile(keys[0])}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={18}>
                    <Card
                        title={
                            <div className="flex justify-between items-center">
                                <span>{selectedFile}</span>
                                <Space>
                                    <Button icon={<SaveOutlined />} type="primary">保存</Button>
                                    <Button icon={<PlayCircleOutlined />}>运行</Button>
                                </Space>
                            </div>
                        }
                        className="h-full"
                    >
                        <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm h-96 overflow-auto">
                            <div className="whitespace-pre-wrap">
                                {`// ${selectedFile}
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.width = 32;
        this.height = 32;
        this.onGround = false;
    }

    update() {
        // 应用重力
        this.velocityY += 0.8;
        
        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 碰撞检测
        this.checkCollisions();
        
        // 限制速度
        this.velocityX *= 0.8;
    }

    jump() {
        if (this.onGround) {
            this.velocityY = -15;
            this.onGround = false;
        }
    }

    moveLeft() {
        this.velocityX = -5;
    }

    moveRight() {
        this.velocityX = 5;
    }
}`}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    // 渲染资源管理
    const renderAssets = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Title level={3}>资源管理</Title>
                <Space>
                    <Upload>
                        <Button icon={<CloudUploadOutlined />}>上传资源</Button>
                    </Upload>
                    <Button icon={<FolderOutlined />}>新建文件夹</Button>
                </Space>
            </div>

            <Tabs
                defaultActiveKey="all"
                items={[
                    {
                        key: 'all',
                        label: '全部资源',
                        children: (
                            <Table
                                dataSource={assetData}
                                columns={[
                                    {
                                        title: '文件名',
                                        dataIndex: 'name',
                                        key: 'name',
                                        render: (text, record) => (
                                            <div className="flex items-center gap-2">
                                                {record.type.includes('图') ? <PictureOutlined /> : <SoundOutlined />}
                                                {text}
                                            </div>
                                        )
                                    },
                                    { title: '类型', dataIndex: 'type', key: 'type' },
                                    { title: '大小', dataIndex: 'size', key: 'size' },
                                    { title: '修改时间', dataIndex: 'lastModified', key: 'lastModified' },
                                    {
                                        title: '操作',
                                        key: 'action',
                                        render: () => (
                                            <Space>
                                                <Button type="text" icon={<EyeOutlined />}>预览</Button>
                                                <Button type="text" icon={<EditOutlined />}>编辑</Button>
                                                <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                                            </Space>
                                        )
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        key: 'images',
                        label: <span><PictureOutlined /> 图像</span>,
                        children: <div>图像资源列表</div>
                    },
                    {
                        key: 'audio',
                        label: <span><SoundOutlined /> 音频</span>,
                        children: <div>音频资源列表</div>
                    }
                ]}
            />
        </div>
    );

    // 渲染构建部署
    const renderBuild = () => (
        <div className="space-y-6">
            <Title level={3}>构建与部署</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="构建配置">
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-medium">目标平台</label>
                                <Select mode="multiple" placeholder="选择目标平台" defaultValue={['pc']} className="w-full">
                                    <Option value="pc"><DesktopOutlined /> PC</Option>
                                    <Option value="mobile"><MobileOutlined /> Mobile</Option>
                                    <Option value="web"><MonitorOutlined /> Web</Option>
                                </Select>
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">构建类型</label>
                                <Select defaultValue="debug" className="w-full">
                                    <Option value="debug">Debug</Option>
                                    <Option value="release">Release</Option>
                                </Select>
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">优化设置</label>
                                <Space direction="vertical" className="w-full">
                                    <div className="flex justify-between">
                                        <span>压缩资源</span>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex justify-between">
                                        <span>代码混淆</span>
                                        <Switch />
                                    </div>
                                </Space>
                            </div>
                            <div>
                                <Button type="primary" icon={<RocketOutlined />} onClick={handleBuild} block>
                                    开始构建
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="构建状态">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span>构建进度</span>
                                    <span>{buildProgress}%</span>
                                </div>
                                <Progress percent={buildProgress} status={buildProgress === 100 ? 'success' : 'active'} />
                            </div>

                            <div className="bg-black text-green-400 p-4 font-mono text-sm h-48 overflow-auto">
                                <div>Starting build process...</div>
                                <div>Compiling scripts...</div>
                                <div>Optimizing assets...</div>
                                <div>Generating build...</div>
                                {buildProgress === 100 && <div className="text-green-300">✓ Build completed successfully!</div>}
                            </div>

                            <div className="space-y-2">
                                <Button icon={<DownloadOutlined />} block>下载构建包</Button>
                                <Button icon={<ShareAltOutlined />} block>发布到商店</Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    // 渲染团队协作
    const renderTeam = () => (
        <div className="space-y-6">
            <Title level={3}>团队协作</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="任务管理">
                        <Table
                            dataSource={taskData}
                            columns={[
                                { title: '任务', dataIndex: 'task', key: 'task' },
                                {
                                    title: '优先级',
                                    dataIndex: 'priority',
                                    key: 'priority',
                                    render: priority => (
                                        <Tag color={priority === '高' ? 'red' : priority === '中' ? 'orange' : 'green'}>
                                            {priority}
                                        </Tag>
                                    )
                                },
                                { title: '负责人', dataIndex: 'assignee', key: 'assignee' },
                                {
                                    title: '状态',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: status => (
                                        <Tag color={status === '进行中' ? 'blue' : status === '待开始' ? 'orange' : 'green'}>
                                            {status}
                                        </Tag>
                                    )
                                },
                                { title: '截止日期', dataIndex: 'dueDate', key: 'dueDate' }
                            ]}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="团队成员">
                        <List
                            dataSource={[
                                { name: '张三', role: '主程序员', status: 'online' },
                                { name: '李四', role: '美术设计师', status: 'offline' },
                                { name: '王五', role: '音效师', status: 'online' },
                                { name: '赵六', role: 'QA工程师', status: 'away' }
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Badge
                                                color={item.status === 'online' ? 'green' : item.status === 'offline' ? 'gray' : 'orange'}
                                                dot
                                            >
                                                <Avatar icon={<UserOutlined />} />
                                            </Badge>
                                        }
                                        title={item.name}
                                        description={item.role}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    // 渲染主内容
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'projects': return renderProjects();
            case 'code': return renderCodeEditor();
            case 'assets': return renderAssets();
            case 'build': return renderBuild();
            case 'team': return renderTeam();
            case 'debug': return <div><Title level={3}>调试工具</Title><p>调试工具界面开发中...</p></div>;
            case 'analytics': return <div><Title level={3}>数据分析</Title><p>数据分析界面开发中...</p></div>;
            case 'settings': return <div><Title level={3}>设置</Title><p>设置界面开发中...</p></div>;
            default: return renderDashboard();
        }
    };

    return (
        <Layout className="min-h-screen">
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                theme="dark"
                width={240}
            >
                <div className="p-4 text-center">
                    <Title level={4} className="text-white m-0">
                        {collapsed ? 'GD' : 'Game Dev Studio'}
                    </Title>
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[activeSection]}
                    onClick={({ key }) => setActiveSection(key)}
                    items={menuItems}
                />
            </Sider>

            <Layout>
                <Header className="bg-white shadow-sm flex justify-between items-center px-6">
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            onClick={() => setIsGameRunning(!isGameRunning)}
                            icon={isGameRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            className="flex items-center"
                        >
                            {isGameRunning ? '暂停游戏' : '运行游戏'}
                        </Button>
                        <Select defaultValue="Space Adventure" className="w-48">
                            {projects.map(p => (
                                <Option key={p.id} value={p.name}>{p.name}</Option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge count={notifications}>
                            <Button type="text" icon={<BellOutlined />} />
                        </Badge>
                        <Avatar icon={<UserOutlined />} />
                    </div>
                </Header>

                <Content className="p-6 bg-gray-50">
                    {renderContent()}
                </Content>

                <Footer className="text-center bg-white border-t">
                    Game Development Studio ©2024 - 构建高质量游戏的专业平台
                </Footer>
            </Layout>
        </Layout>
    );
};

export default GameDevInterface;