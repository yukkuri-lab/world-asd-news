import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages用のリポジトリ名を設定（画像参照：/world-asd-news/配下に配置されるため）
  basePath: process.env.NODE_ENV === 'production' ? '/world-asd-news' : '',
  // static exportに伴う画像の最適化OFF（場合によるが今回は安全のため）
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
