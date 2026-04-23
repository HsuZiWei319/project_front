# 開發用衣服功能說明

## 功能概述
當後端無法連線或無法載入衣服列表時，前端會自動顯示一個「開發測試」分類，其中包含一件開發用衣服。點擊這件開發衣服即可進入上傳衣服頁面。

## 功能流程

### 1. 後端連線失敗時
- 在 WardrobePage 中，當調用 `/picture/clothes/my` API 失敗時
- 自動顯示"開發測試"分類下的虛擬衣服
- 顯示錯誤提示：❌ 無法載入衣服列表

### 2. 點擊開發衣服
- 開發衣服會加載圖片並轉換為 data URL
- 導航到 UploadClothesPage，傳遞開發圖片
- 開發衣服在顯示時會有半透明效果和"🔧 開發衣服"標籤

### 3. 上傳衣服（開發模式）
- 在 UploadClothesPage 中，會識別出是開發圖片
- 可以輸入衣服尺寸數據（袖長、褲長、肩寬、腰圍）
- 點擊上傳按鈕時，開發模式直接顯示結果，不需要真實的後端上傳
- 點擊確定後回到衣櫃頁面

## 替換開發圖片

### 方案 A：使用 PNG 圖片（推薦）
1. 將你的黑色T恤圖片保存為 PNG 格式
2. 放在 `public/dev-tshirt.png` 路徑
3. 修改 `src/pages/Wardrobe/WardrobePage.jsx` 中的配置：
```javascript
const DEV_CLOTHES = {
    ...
    clothes_image_url: '/dev-tshirt.png', // 改為這個
    ...
};
```

### 方案 B：使用其他圖片格式
1. 將圖片放在 `public/` 文件夾
2. 修改 WardrobePage.jsx 中的 `clothes_image_url` 為你的圖片路徑
3. 例如：`'/my-dev-clothes.jpg'` 或 `'/tshirt.webp'`

### 方案 C：使用在線圖片 URL
修改 WardrobePage.jsx 中的 `clothes_image_url` 為完整的 URL：
```javascript
clothes_image_url: 'https://example.com/tshirt.png',
```

## 文件修改列表

### 修改的文件：
1. **src/pages/Wardrobe/WardrobePage.jsx**
   - 添加 DEV_CLOTHES 常量
   - 修改 fetchUserClothes 函數，API 失敗時顯示開發衣服
   - 修改 handleClotheClick 函數，處理開發衣服點擊
   - 修改渲染邏輯，為開發衣服添加特殊樣式

2. **src/pages/UploadClothes/UploadClothesPage.jsx**
   - 修改 useEffect，記錄開發圖片標記
   - 修改 handleUploadClothes 函數，處理開發圖片上傳

### 創建的文件：
1. **public/dev-tshirt.svg** - 默認的開發衣服 SVG 圖片（佔位符）

## 技術細節

### WardrobePage 的邏輯
```
API 調用失敗 → 設置 error 狀態 → setGroupedClothes 為開發衣服 → 顯示「開發測試」分類
```

### 點擊開發衣服的流程
```
點擊開發衣服 → 加載圖片 → 轉換為 Canvas → data URL → 導航到 UploadClothesPage
```

### UploadClothesPage 的特殊處理
```
isDevImage = true → 跳過後端上傳 → 直接顯示結果 → 可返回衣櫃
```

## 常見問題

### Q: 開發圖片無法加載怎麼辦？
A: 檢查：
1. 圖片文件是否存在於 `public/dev-tshirt.svg` 或你指定的路徑
2. 圖片文件名是否正確
3. 瀏覽器控制台是否有錯誤訊息
4. 嘗試用完整 URL 代替相對路徑

### Q: 如何改回原本的後端邏輯？
A: 修改 `fetchUserClothes` 函數的 catch 塊，刪除自動顯示開發衣服的邏輯：
```javascript
catch (err) {
    console.error('獲取衣服列表失敗:', err);
    setError(err.message || '無法載入衣服列表');
    // 刪除或註釋掉下面這行
    // setGroupedClothes({ [DEV_CLOTHES.clothes_category]: [DEV_CLOTHES] });
}
```

### Q: 可以同時顯示後端衣服和開發衣服嗎？
A: 可以。修改 `fetchUserClothes` 函數，在成功時也添加開發衣服：
```javascript
setGroupedClothes({
    ...grouped,
    [DEV_CLOTHES.clothes_category]: [DEV_CLOTHES]
});
```

## 下一步

1. **替換佔位符圖片**：將 `public/dev-tshirt.svg` 替換為你的黑色T恤圖片
2. **測試功能**：停止後端服務，驗證開發衣服能否正常顯示和操作
3. **後端修復**：修復後端問題後，開發衣服會自動隱藏
