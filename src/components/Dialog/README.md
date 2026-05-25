# 照片上传流程集成说明

## 概述

已成功在前端集成了完整的照片上传流程，包含三个选择阶段：
1. **选择照片来源** - 用户可以选择从照片库选择或直接拍照
2. **拍照** - 如果用户选择直接拍照，可以使用设备摄像头
3. **图像裁切** - 拍照后可以裁切图像到理想大小

## 新创建的组件

### 1. PhotoSourceModal (`/src/components/Dialog/PhotoSourceModal.jsx`)
**功能**: 显示照片源选择模态框
**特点**:
- 两个选项按钮：从照片库选择、直接拍照
- 支持加载状态
- 响应式设计

**使用方式**:
```jsx
<PhotoSourceModal
  isOpen={showPhotoSourceModal}
  onClose={() => setShowPhotoSourceModal(false)}
  onSelectFromLibrary={handleSelectFromLibrary}
  onSelectCamera={handleSelectCamera}
/>
```

### 2. CameraCapture (`/src/components/Dialog/CameraCapture.jsx`)
**功能**: 实现实时相机拍照
**特点**:
- 使用浏览器 MediaStream API 访问设备摄像头
- 支持前置/后置摄像头切换
- 实时预览
- 拍照后生成 File 对象

**使用方式**:
```jsx
<CameraCapture
  isOpen={showCamera}
  onClose={() => setShowCamera(false)}
  onCapture={handleCameraCapture}
/>
```

### 3. ImageCropper (`/src/components/Dialog/ImageCropper.jsx`)
**功能**: 提供图像裁切功能
**特点**:
- 拖动裁切框移动和调整大小
- 缩放功能（+/- 按钮）
- 支持自定义纵横比
- 拖拽完整的裁切框进行移动
- 裁切完成后生成 File 对象

**使用方式**:
```jsx
<ImageCropper
  isOpen={showCropper}
  imageSrc={capturedImage}
  onClose={() => {
    setShowCropper(false);
    setCapturedImage(null);
  }}
  onCropComplete={handleCropComplete}
  aspectRatio={1}
/>
```

## 集成位置

### ProfilePage (`/src/pages/Profile/ProfilePage.jsx`)
- profile-picture 点击时显示照片源选择模态框
- 从照片库选择：打开文件选择器（原有逻辑）
- 直接拍照：打开相机，拍照后自动进入裁切
- 裁切完成后自动上传模特照片

**流程**:
1. 用户点击 profile-picture
2. 显示照片源选择模态框
3. 选择"从照片库" → 打开文件选择器
4. 或选择"直接拍照" → 打开相机 → 拍照 → 裁切 → 上传

### BottomNavigation (`/src/components/Navigation/BottomNavigation.jsx`)
- add-button-container 点击时显示照片源选择模态框
- 从照片库选择：打开文件选择器，然后传递给 onFileSelected 回调
- 直接拍照：打开相机，拍照后进入裁切，裁切完成后传递给 onFileSelected 回调

**流程**:
1. 用户点击 add-button-container
2. 显示照片源选择模态框
3. 选择"从照片库" → 打开文件选择器 → 传递文件给父组件
4. 或选择"直接拍照" → 打开相机 → 拍照 → 裁切 → 传递文件给父组件

## 样式文件

- `PhotoSourceModal.css` - 照片源选择模态框样式
- `CameraCapture.css` - 相机拍照组件样式
- `ImageCropper.css` - 图像裁切组件样式

所有样式都支持响应式设计，在手机上也能正常显示。

## 浏览器兼容性

- **CameraCapture**: 需要浏览器支持 MediaStream API（大多数现代浏览器）
- **ImageCropper**: 需要浏览器支持 Canvas API（所有现代浏览器）
- **PhotoSourceModal**: 所有浏览器

## 权限要求

- **拍照功能**: 需要用户授予相机访问权限
- 如果用户拒绝权限，会显示错误提示："无法访问相机。请检查浏览器权限或设备是否有相机。"

## 后续处理

所有组件最终生成的都是 `File` 对象，可以直接上传到后端或进行其他处理。

对于模特照片上传：
- 将 File 对象传递给 `handleFileSelectedForModelUpload()` 函数
- 该函数会调用后端 API 上传并进行去背处理

对于衣服照片上传：
- 将 File 对象传递给父组件的 `onFileSelected()` 回调
- 父组件负责后续处理和上传

## 测试建议

1. **从照片库选择**: 
   - 点击 profile-picture 或 add-button-container
   - 选择"从照片库选择照片"
   - 确认文件选择器正常打开

2. **直接拍照**: 
   - 点击 profile-picture 或 add-button-container
   - 选择"直接拍照"
   - 确认相机正常启动
   - 拍照后确认裁切界面出现
   - 调整裁切框并确认裁切

3. **响应式测试**:
   - 在不同屏幕尺寸下测试
   - 确保模态框和控件正常显示

## 已知限制

1. ImageCropper 当前采用简单的矩形裁切，不支持自由形状裁切
2. 裁切框的四角处理器仅用于视觉提示，目前不支持通过拖动角来调整大小（支持整体拖动）
3. 为了简化，裁切纵横比固定为 1:1（正方形），如需改变可修改组件中的 `aspectRatio` 属性
