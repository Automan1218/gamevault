import React from 'react';
import { Modal, Descriptions, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

interface OrderItem {
  gameId: number;
  unitPrice: number;
  discountPrice?: number;
  activationCodes?: string[];
}

interface OrderDetail {
  orderId: number;
  createdAt: string;
  status: string;
  total: number;
  items?: OrderItem[];
}

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderDetail: OrderDetail | null;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  onClose,
  orderDetail,
}) => {
  return (
    <Modal 
      open={open} 
      onCancel={onClose} 
      onOk={onClose} 
      title={
        <span style={{ 
          color: '#f9fafb', 
          fontSize: '1.3rem', 
          fontWeight: 600,
          background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          <EyeOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          订单详情
        </span>
      } 
      width={720}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        content: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 16,
        }
      }}
    >
      {orderDetail && (
        <>
          <Descriptions 
            column={2} 
            bordered 
            size="small" 
            items={[
              { key: 'orderId', label: '订单ID', children: orderDetail.orderId },
              { key: 'createdAt', label: '下单时间', children: new Date(orderDetail.createdAt).toLocaleString() },
              { key: 'status', label: '状态', children: orderDetail.status },
              { key: 'total', label: '总额', children: `¥${orderDetail.total}` },
            ]} 
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderRadius: 12,
            }}
          />
          
          {orderDetail.items && orderDetail.items.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Typography.Title 
                level={5} 
                style={{ 
                  color: '#f9fafb',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                订单明细
              </Typography.Title>
              {orderDetail.items.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: 16, 
                    border: '1px solid rgba(75, 85, 99, 0.3)', 
                    borderRadius: 12, 
                    marginBottom: 12, 
                    background: 'rgba(31, 41, 55, 0.8)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography.Text style={{ color: '#f9fafb', fontSize: '1rem', fontWeight: 500 }}>
                        游戏ID: {item.gameId}
                      </Typography.Text>
                      <div style={{ marginTop: 6 }}>
                        <Typography.Text style={{ color: '#9ca3af' }}>单价: ¥{item.unitPrice}</Typography.Text>
                        {item.discountPrice != null && item.discountPrice !== item.unitPrice && (
                          <Typography.Text style={{ color: '#06b6d4', marginLeft: 12, fontWeight: 500 }}>
                            {item.discountPrice === 0 ? '折后价: 免费' : `折后价: ¥${item.discountPrice}`}
                          </Typography.Text>
                        )}
                      </div>
                    </div>
                    <div>
                      <Typography.Text style={{ 
                        color: item.discountPrice === 0 ? '#10b981' : '#06b6d4', 
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}>
                        {item.discountPrice === 0 ? '免费' : `¥${item.discountPrice || item.unitPrice}`}
                      </Typography.Text>
                    </div>
                  </div>
                  {item.activationCodes && item.activationCodes.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(75, 85, 99, 0.2)' }}>
                      <Typography.Text style={{ color: '#9ca3af', fontSize: '0.9rem' }}>激活码:</Typography.Text>
                      {item.activationCodes.map((code, codeIdx) => (
                        <Typography.Paragraph 
                          key={codeIdx} 
                          copyable={{ text: code }} 
                          style={{ 
                            color: '#d1d5db', 
                            marginBottom: 6, 
                            marginTop: 6,
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(75, 85, 99, 0.2)',
                            padding: '4px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {code}
                        </Typography.Paragraph>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};





