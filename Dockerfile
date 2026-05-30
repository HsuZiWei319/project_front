# --- 階段一：基礎環境 (Base) ---
# 統一使用 Debian-slim 避免 Alpine 的 C 函式庫相容性問題
FROM node:22-slim AS base
WORKDIR /app

# 統一安裝 Python 環境，減少重複代碼
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 建立並使用虛擬環境
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# --- 階段二：建置 (Builder) ---
FROM base AS builder
# 安裝前端依賴
# 使用 npm ci 確保依賴版本一致性
COPY package.json package-lock.json ./
RUN ls -l package*.json # 測試是否成功複製
RUN npm ci --prefer-offline --no-audit --legacy-peer-deps

# 傳入 Vite 參數（打包時會寫入 JS）
ARG VITE_API_URL
ARG VITE_AI_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL

# 複製程式碼並打包
COPY . .
RUN npm run build

# --- 階段三：開發模式 (Dev) ---
FROM base AS dev
WORKDIR /app

# 複製 Node 依賴與程式碼
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# 安裝 Python AI 相關套件
RUN pip install --no-cache-dir -r ai_api/requirements.txt

# 使用專用的 entrypoint.sh (啟動 uvicorn & npm)
RUN chmod +x entrypoint.sh
EXPOSE 5173 8000
CMD ["./entrypoint.sh"]

# --- 階段四：生產模式 (Prod) ---
FROM nginx:stable AS prod
WORKDIR /app

# 複製建置好的前端靜態文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 複製並使用啟動腳本
COPY entrypoint_prod.sh ./
RUN chmod +x entrypoint_prod.sh

EXPOSE 80
CMD ["./entrypoint_prod.sh"]