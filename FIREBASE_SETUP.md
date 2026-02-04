# Firebase 設定指南

## 前置步驟

### 1. 創建 Firebase 專案
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」或使用現有專案
3. 輸入專案名稱（例如：`endless-knight`）
4. 依照提示完成設定

### 2. 添加 Android 應用程式
1. 在 Firebase Console 中，點擊「新增應用程式」
2. 選擇 Android 圖示
3. 填寫以下資訊：
   - **Android 套件名稱**: `com.endlessknight.game`
   - **應用程式暱稱**: `Endless Knight`
   - **偵錯簽署憑證 SHA-1**: （可選，後續可添加）
4. 點擊「註冊應用程式」

### 3. 下載設定檔案
1. 下載 `google-services.json` 檔案
2. 將檔案放置在專案根目錄：
   ```
   endless-knight-react/
   ├── google-services.json  <-- 放這裡
   ├── app.json
   └── ...
   ```

### 4. 啟用 Firebase 服務

#### Authentication（必要）
1. 在 Firebase Console 中，進入「Authentication」
2. 點擊「開始使用」
3. 在「登入方式」標籤中，啟用「匿名」登入

#### Firestore Database（必要）
1. 在 Firebase Console 中，進入「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「正式模式」或「測試模式」
4. 選擇資料庫位置（建議選擇離用戶最近的區域）
5. 設定安全規則（見下方）

#### Analytics（自動啟用）
Analytics 會在添加 google-services.json 後自動啟用。

---

## Firestore 安全規則

在 Firebase Console 的 Firestore 中，設定以下安全規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 存檔資料：只有擁有者可以讀寫
    match /saves/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

這個規則確保：
- 用戶必須登入才能讀寫資料
- 用戶只能讀寫自己的存檔

---

## 建置與測試

### 1. 清除快取並重新建置
```bash
# 清除 Expo 快取
npx expo start --clear

# 或者重新建置
eas build --platform android --profile development
```

### 2. 測試雲端存檔
1. 啟動遊戲
2. 進行一些遊戲操作
3. 在設定頁面查看「雲端存檔」狀態
4. 在 Firebase Console 的 Firestore 中確認資料已同步

---

## 故障排除

### 常見問題

#### 1. 「Firebase app not initialized」錯誤
- 確認 `google-services.json` 放在正確位置
- 執行 `npx expo prebuild --clean` 重新產生原生專案

#### 2. 「Permission denied」錯誤
- 確認 Firestore 安全規則已正確設定
- 確認用戶已經登入（匿名登入）

#### 3. 建置失敗
- 確認所有 Firebase 套件版本相容
- 執行 `npm install` 確保依賴項已安裝

---

## 檔案結構

```
endless-knight-react/
├── google-services.json          # Firebase 設定（需要下載）
├── src/
│   ├── services/
│   │   └── firebase.ts           # Firebase 服務模組
│   └── hooks/
│       └── useFirebase.ts        # Firebase React Hook
└── app.json                      # 已更新 Firebase 插件
```

---

## 功能說明

### 匿名登入
- 遊戲啟動時自動匿名登入
- 用戶無需任何操作
- 存檔會與匿名帳戶綁定

### 雲端存檔
- 自動同步到 Firestore
- 同時保留本地存檔作為備份
- 可在設定頁面查看同步狀態

### Analytics
- 追蹤關鍵遊戲事件（Boss 擊殺、轉生、成就等）
- 可在 Firebase Console 查看分析報告
