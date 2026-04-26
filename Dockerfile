# --- 階段一：建置 (Builder) ---
FROM node:20-alpine AS builder
WORKDIR /app

# 1. npm 鏡像源
#RUN npm config set registry https://registry.yarnpkg.com/

# 2. 安裝依賴
COPY package.json package-lock.json ./
RUN npm install

# 3. 宣告有一個參數叫做 VITE_API_URL
ARG VITE_API_URL
# 4. 把這個參數設定成環境變數，這樣 npm run build 才讀得到
ENV VITE_API_URL=$VITE_API_URL

# 5. 複製所有程式碼並打包
COPY . .
RUN npm run build
# (Vite 預設會打包到 /app/dist 資料夾)


# --- 階段二：開發/生產 (Runner) ---
FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# --- 階段三：開發模式 (Runner) ---
FROM node:20-alpine AS dev
WORKDIR /app

# 1. 宣告有一個參數叫做 VITE_API_URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 2. 設置鏡像源
#RUN npm config set registry https://registry.yarnpkg.com/

# 3. 安裝依賴
COPY package.json package-lock.json ./
RUN npm install

# 4. 複製程式碼
COPY . .

# 5. 開放 5173 port (Vite dev server 預設埠)
EXPOSE 5173

# 6. 啟動 Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 6. 啟動 Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

