import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export interface SearchFormProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onChange?: (value: string) => void;
  value?: string;
  style?: React.CSSProperties;
  allowClear?: boolean;
  className?: string;
}
export const dynamic = 'force-dynamic';
export default function SearchForm({
  placeholder = 'Search games',
  onSearch,
  onChange,
  value,
  style,
  allowClear = true,
  className,
}: SearchFormProps) {
  return (
    <div className={`zy-search-wrap ${className ?? ''}`} style={style}>
      <div className="zy-search-shell">
        <Input
          prefix={<SearchOutlined />}
          placeholder={placeholder}
          allowClear={allowClear}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onPressEnter={(e) => onSearch((e.target as HTMLInputElement).value)}
          className="zy-search"
        />
      </div>

      {/* IMPORTANT: styled-jsx scoped. Antd internals styled via :global but nested under .zy-search only. */}
      <style jsx>{`
        .zy-search-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0 12px;
          margin-bottom: 28px;
        }
        .zy-search-shell {
          position: relative;
          width: 100%;
          max-width: 640px;
          border-radius: 16px;
          isolation: isolate;
        }
        /* Outer subtle glow (no layout shift) */
        .zy-search-shell::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(99,102,241,0.22), rgba(99,102,241,0.06));
          filter: blur(16px);
          opacity: 0.55;
          z-index: -1;
          transition: opacity 200ms ease;
        }
        .zy-search-shell::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: rgba(31,41,55,0.66);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
          border: 1px solid rgba(99,102,241,0.22);
          z-index: -1;
        }

        /* ---------- Antd input normalization (scoped) ---------- */
        .zy-search :global(.ant-input-affix-wrapper) {
          height: 48px;
          line-height: 48px;
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          background: rgba(31,41,55,0.92);
          border: 2px solid rgba(99,102,241,0.28);
          box-shadow: 0 4px 20px rgba(99,102,241,0.10);
          transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
        }
        .zy-search :global(.ant-input-affix-wrapper:hover) {
          border-color: rgba(99,102,241,0.55);
          transform: translateY(-1px);
        }
        .zy-search :global(.ant-input-affix-wrapper-focused) {
          border-color: #6366f1;
          box-shadow: 0 0 0 6px rgba(99,102,241,0.20), 0 4px 20px rgba(99,102,241,0.10);
        }
        .zy-search :global(.ant-input-prefix) {
          margin-right: 8px;
          display: flex;
          align-items: center;
          color: #8b90ff;
        }
        .zy-search :global(input.ant-input) {
          color: #e5e7eb;
          background: transparent;
        }
        .zy-search :global(input.ant-input::placeholder) {
          color: rgba(203,213,225,0.85);
        }
        .zy-search :global(.ant-input-clear-icon) {
          color: rgba(203,213,225,0.9);
        }
        /* Remove default borders/shadows that create the stray box */
        .zy-search :global(.ant-input-affix-wrapper),
        .zy-search :global(.ant-input),
        .zy-search :global(.ant-input:focus) {
          box-shadow: none;
        }

        /* Compact on small screens */
        @media (max-width: 420px) {
          .zy-search :global(.ant-input-affix-wrapper) {
            height: 44px;
            line-height: 44px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
}
