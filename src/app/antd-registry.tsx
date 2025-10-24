"use client";

import React, { PropsWithChildren } from "react";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";
import { useServerInsertedHTML } from "next/navigation";

export default function AntdRegistry({ children }: PropsWithChildren) {
  const cache = React.useMemo(() => createCache(), []);
  useServerInsertedHTML(() => (
    <style
      id="antd-cssinjs"
      // Inject server-generated styles into HTML
      dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
    />
  ));
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}