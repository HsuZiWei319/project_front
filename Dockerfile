# --- 階段一：建置 (Builder) ---
FROM node:20-alpine AS builder
WORKDIR /app

# 1. 安裝依賴
COPY package.json package-lock.json ./
RUN npm install

# 1. 宣告有一個參數叫做 VITE_API_URL
ARG VITE_API_URL
# 2. 把這個參數設定成環境變數，這樣 npm run build 才讀得到
ENV VITE_API_URL=$VITE_API_URL

# 2. 複製所有程式碼並打包
COPY . .
RUN npm run build
# (Vite 預設會打包到 /app/dist 資料夾)


# --- 階段二：開發/生產 (Runner) ---
FROM node:20-alpine AS dev
WORKDIR /app

# 1. 宣告有一個參數叫做 VITE_API_URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 2. 安裝依賴
COPY package.json package-lock.json ./
RUN npm install

# 3. 複製程式碼
COPY . .

# 4. 開放 5173 port (Vite dev server 預設埠)
EXPOSE 5173

# 5. 啟動 Vite dev server (預設行為)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

