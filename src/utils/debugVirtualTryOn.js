/**
 * 虛擬試穿調試工具
 * 用於診斷 GLB URL 固定不變的問題
 */

export const debugVirtualTryOn = () => {
  console.clear();
  console.log('🔍 虛擬試穿調試工具 - 診斷報告');
  console.log('=' .repeat(50));
  
  // 1. 檢查 localStorage
  console.log('\n📦 LocalStorage 檢查:');
  const resultData = localStorage.getItem('virtualTryOnResult');
  if (resultData) {
    try {
      const parsed = JSON.parse(resultData);
      console.log('   最近的試穿結果:', parsed);
      console.log('   URL:', parsed.url);
      console.log('   文件類型:', parsed.fileType);
      console.log('   時間戳:', parsed.timestamp);
      console.log('   請求時間:', parsed.requestTime);
    } catch (e) {
      console.error('   解析失敗:', e);
    }
  } else {
    console.log('   localStorage 中無虛擬試穿結果');
  }
  
  // 2. 提取 URL 中的時間戳
  if (resultData) {
    try {
      const { url } = JSON.parse(resultData);
      const match = url.match(/try_on_[a-f0-9-]+_(\d+\.\d+)\.glb/);
      if (match) {
        const timestamp = match[1];
        console.log('\n⏰ URL 中的時間戳:');
        console.log('   提取的時間戳:', timestamp);
        console.log('   轉換為日期:', new Date(parseFloat(timestamp) * 1000).toISOString());
      }
    } catch (e) {
      console.error('   提取時間戳失敗:', e);
    }
  }
  
  // 3. 檢查多個試穿記錄
  console.log('\n📋 試穿歷史（檢查 sessionStorage）:');
  const historyKey = 'virtualTryOnHistory';
  const history = sessionStorage.getItem(historyKey);
  if (history) {
    try {
      const parsed = JSON.parse(history);
      console.log('   總記錄數:', parsed.length);
      parsed.forEach((item, idx) => {
        console.log(`   [${idx}] ${item.timestamp} - ${item.url}`);
      });
    } catch (e) {
      console.log('   無記錄');
    }
  } else {
    console.log('   無歷史記錄');
  }
  
  // 4. 建議
  console.log('\n💡 診斷建議:');
  console.log('   1️⃣  檢查瀏覽器開發者工具 Network 標籤');
  console.log('       - 查看 /combine/user/virtual-try-on 的響應');
  console.log('       - 檢查每次請求返回的 model_picture URL 是否不同');
  console.log('');
  console.log('   2️⃣  檢查後端日誌:');
  console.log('       tail -50 /home/mitlab/try-on/backend/logs/django_app.log');
  console.log('       - 查看 "生成的安全文件名" 是否每次都不同');
  console.log('       - 查看時間戳是否遞增');
  console.log('');
  console.log('   3️⃣  如果 URL 時間戳固定:');
  console.log('       - 後端可能沒有生成新文件');
  console.log('       - AI 服務可能返回了相同的 GLB');
  console.log('       - image_bytes 可能為空');
  console.log('');
  console.log('   4️⃣  清除緩存:');
  console.log('       - 前端已添加 bust 參數破壞 useGLTF 緩存');
  console.log('       - 如需清除，執行: localStorage.clear()');
  
  return {
    currentResult: resultData ? JSON.parse(resultData) : null,
    timestamp: new Date().toISOString()
  };
};

// 導出到全局作用域，便於在控制台使用
if (typeof window !== 'undefined') {
  window.debugVirtualTryOn = debugVirtualTryOn;
}
