# 家长吐槽墙 (ParentRant)

这是一个基于 Next.js 15 (App Router) + Supabase 的现代简洁风格吐槽墙应用。

## 功能特性

- **现代简洁设计**：使用 Tailwind CSS 构建的清新界面。
- **匿名吐槽**：无需登录即可发布内容。
- **多彩卡片**：支持选择不同颜色的便利贴风格。
- **点赞互动**：简单的点赞功能。
- **响应式布局**：完美支持移动端和桌面端。

## 快速开始

### 1. 配置 Supabase 数据库

1. 登录 [Supabase](https://supabase.com/) 并创建一个新项目。
2. 进入项目的 SQL Editor，运行项目根目录下的 `db_schema.sql` 中的内容，以创建数据表和设置权限。
   - 这将创建 `posts` 表并启用 RLS（行级安全策略），允许公开读写（根据需求可调整）。

### 2. 配置环境变量

1. 将 `.env.local.example` 复制为 `.env.local`：
   ```bash
   cp .env.local.example .env.local
   ```
2. 填入你的 Supabase URL 和 Anon Key：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
   ```

### 3. 运行开发服务器

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

## 技术栈

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Utils**: clsx, tailwind-merge, date-fns
