# Cloudflare Pages Setup cho hehephim

## Build Settings:
- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (hoặc `hehephim` nếu monorepo)
- **Node.js version**: 18 hoặc 20

## Environment Variables cần thiết:
```
NEXT_PUBLIC_SITE_URL=https://hehephim.online
NODE_VERSION=18
```

## Functions Compatibility:
- Bật "Compatibility flags" cho Node.js runtime
- Đảm bảo "nodejs_compat" được bật

## Custom Domain:
- Domain: `hehephim.online`
- CNAME record trỏ về `hehephim.pages.dev`

## Nếu vẫn 404, thử các bước sau:

### 1. Kiểm tra build output:
Build phải tạo thư mục `.next` với:
- `.next/server/`
- `.next/static/`
- `.next/standalone/` (nếu có)

### 2. Thay đổi Framework preset:
Thử chuyển từ "Next.js" sang "None" và:
- Build command: `npm run build`
- Build output directory: `.next`

### 3. Kiểm tra routing:
Thêm file `_routes.json` trong public/ nếu cần:
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
```

### 4. Force rebuild:
- Xóa deployment cũ
- Deploy lại từ đầu

## Troubleshooting 404:
1. Kiểm tra build logs có error không
2. Verify thư mục output có đúng structure
3. Test locally với `npm run build && npm run start`
4. Check Cloudflare Functions compatibility
