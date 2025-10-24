import React, { useState } from 'react';
import { Modal, Typography, List, Tag, Pagination } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

interface ActivationCode {
  activationId: number;
  code: string;
}

interface ActivationCodesModalProps {
  open: boolean;
  onClose: () => void;
  gameTitle?: string;
  activationCodes: ActivationCode[];
}

export const ActivationCodesModal: React.FC<ActivationCodesModalProps> = ({
  open,
  onClose,
  gameTitle,
  activationCodes,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const codesPerPage = 10;

  const paginatedCodes = activationCodes.slice(
    (currentPage - 1) * codesPerPage,
    currentPage * codesPerPage
  );

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
          {gameTitle} - Activation Codes
        </span>
      } 
      width={800}
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
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Typography.Text style={{ color: '#9ca3af', fontSize: '1rem' }}>
            Total {activationCodes.length} activation codes, showing page {currentPage}
          </Typography.Text>
        </div>
        
        <List
          dataSource={paginatedCodes}
          renderItem={(code, index) => (
            <List.Item
              style={{
                background: 'rgba(31, 41, 55, 0.8)',
                marginBottom: 12,
                borderRadius: 12,
                border: '1px solid rgba(75, 85, 99, 0.3)',
                padding: '16px 24px',
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <Typography.Text style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    Activation Code #{(currentPage - 1) * codesPerPage + index + 1}
                  </Typography.Text>
                  <Tag 
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#c7d2fe',
                      borderRadius: 6,
                    }}
                  >
                    ID: {code.activationId}
                  </Tag>
                </div>
                <Typography.Paragraph 
                  copyable={{ text: code.code }} 
                  style={{ 
                    color: '#f9fafb',
                    marginBottom: 0,
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(75, 85, 99, 0.2)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                  }}
                >
                  {code.code}
                </Typography.Paragraph>
              </div>
            </List.Item>
          )}
        />
        
        {activationCodes.length > codesPerPage && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={currentPage}
              pageSize={codesPerPage}
              total={activationCodes.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} activation codes`
              }
              className="custom-pagination"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};





