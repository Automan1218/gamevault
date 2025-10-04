"use client";

import React, { PropsWithChildren } from "react";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";
import { useServerInsertedHTML } from "next/navigation";

export default function AntdRegistry({ children }: PropsWithChildren) {
  const cache = React.useMemo(() => createCache(), []);
  useServerInsertedHTML(() => (
    <style
      id="antd-cssinjs"
      // 这里把服务端生成的样式注入到 HTML
      dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
    />
  ));
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}