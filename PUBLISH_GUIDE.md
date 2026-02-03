# 🚀 發布指南 - Endless Knight

> 完整的 Google Play 發布流程

---

## 📋 發布前檢查清單

### ✅ 已完成

- [x] 隱私政策撰寫完成（`PRIVACY_POLICY.md` + `privacy-policy.html`）
- [x] 商店資訊準備完成（`STORE_LISTING.md`）
- [x] 版本號更新為 1.0.0
- [x] 無佔位符文字
- [x] TypeScript 編譯通過
- [x] EAS 配置完成（`eas.json`）

### ⚠️ 待完成（需要你操作）

- [ ] 上傳隱私政策到公開網址
- [ ] 製作 Feature Graphic (1024x500px)
- [ ] 截取遊戲截圖（至少 2 張）
- [ ] 完整測試遊戲
- [ ] 建置 APK/AAB

---

## 🌐 步驟 1：上傳隱私政策

### 選項 A：GitHub Pages（推薦，免費）

1. **創建 GitHub Repository**
   ```bash
   # 在 GitHub 創建新 repo（可以是 public）
   # 例如：endless-knight-privacy
   ```

2. **上傳 HTML 檔案**
   ```bash
   cd endless-knight-privacy
   cp ../endless-knight-react/privacy-policy.html index.html
   git add index.html
   git commit -m "Add privacy policy"
   git push origin main
   ```

3. **啟用 GitHub Pages**
   - 進入 repo Settings
   - 找到 "Pages"
   - Source 選擇 "main branch"
   - 保存

4. **獲取 URL**
   - 格式：`https://your-username.github.io/endless-knight-privacy/`
   - 這個 URL 就是你的隱私政策連結

### 選項 B：Netlify（更簡單）

1. 註冊 [netlify.com](https://netlify.com)
2. 拖曳 `privacy-policy.html` 到 Netlify Drop
3. 獲得免費 URL（例如：`https://endless-knight-privacy.netlify.app`）

### 選項 C：自己的網站

如果你有自己的網站，直接上傳 `privacy-policy.html`。

---

## 🎨 步驟 2：製作 Feature Graphic

### 方法 1：使用 Canva（最簡單）

1. **前往 Canva**
   - 網址：[canva.com](https://canva.com)
   - 註冊免費帳號

2. **創建自訂尺寸**
   - 點擊「建立設計」
   - 選擇「自訂尺寸」
   - 輸入：1024 x 500 像素

3. **設計你的 Graphic**
   
   **參考設計：**
   ```
   ┌────────────────────────────────────────────┐
   │  背景：深藍黑色 (#0f0f23)                    │
   │                                            │
   │  🗡️  ENDLESS KNIGHT  ⚔️                     │
   │      放置型 RPG 冒險                         │
   │                                            │
   │  [截圖：騎士戰鬥畫面]  [截圖：裝備]          │
   │                                            │
   │  ✨ 自動戰鬥  💎 收集裝備  🔄 無限轉生        │
   └────────────────────────────────────────────┘
   ```

   **設計要素：**
   - 背景色：深色（#0f0f23 或類似）
   - 標題：ENDLESS KNIGHT（金色 #ffd700，大字體）
   - 副標題：放置型 RPG 冒險（白色，中字體）
   - 添加 1-2 張遊戲截圖
   - 添加 icon 或特色說明

4. **下載**
   - 格式：PNG
   - 品質：高品質
   - 尺寸：確認是 1024x500

### 方法 2：使用遊戲截圖拼貼

**快速方案：**
1. 截取一張主畫面截圖
2. 使用任何圖片編輯器調整為 1024x500
3. 添加文字「ENDLESS KNIGHT」
4. 完成！

---

## 📸 步驟 3：截取遊戲截圖

### 準備截圖

**最少 2 張，建議 4 張：**

1. **主戰鬥畫面**（必需）
   - 顯示戰鬥、HP 條、升級面板
   - 讓玩家看到核心玩法

2. **裝備/背包畫面**（必需）
   - 顯示不同稀有度的裝備
   - 展示收集要素

3. **技能畫面**（建議）
   - 展示 6 種技能
   - 讓玩家看到策略深度

4. **轉生畫面**（建議）
   - 展示永久升級
   - 突出長期玩法

### 如何截圖

**方法 1：使用 Android 模擬器**

```bash
# 啟動遊戲
npx expo start --android

# 等待模擬器載入遊戲
# 使用模擬器的截圖功能（通常在右側工具列）
# 或按 Ctrl + S (Windows) / Cmd + S (Mac)
```

**方法 2：使用真實裝置**

1. 在實體手機上運行遊戲
2. 導航到想要截圖的畫面
3. 按 Power + Volume Down（大部分 Android 手機）
4. 傳輸截圖到電腦

### 尺寸要求

- **推薦：** 1080 x 1920 像素（9:16）
- **最小：** 320 x 640 像素
- **格式：** PNG 或 JPG

### 可選：添加文字說明

使用任何圖片編輯器在截圖上添加文字：
- "自動戰鬥！輕鬆遊玩"
- "收集史詩裝備"
- "掌握強大技能"
- "轉生變得更強"

---

## 🧪 步驟 4：完整測試

### 測試項目

1. **基本功能**
   - [ ] 遊戲啟動正常
   - [ ] 戰鬥系統運作
   - [ ] 升級功能正常
   - [ ] 裝備系統正常
   - [ ] 技能施放正常

2. **存檔系統**
   - [ ] 關閉 App 後重開，進度保留
   - [ ] 離線獎勵計算正確
   - [ ] 手動存檔功能正常

3. **UI/UX**
   - [ ] 所有按鈕可點擊
   - [ ] 文字清晰可讀
   - [ ] 沒有重疊或遮擋
   - [ ] 導航流暢

4. **效能**
   - [ ] 啟動時間 < 5 秒
   - [ ] 沒有明顯卡頓
   - [ ] 記憶體使用正常

5. **長時間測試**
   - [ ] 玩至少 1 小時不崩潰
   - [ ] 測試離線 8 小時後的獎勵
   - [ ] 嘗試轉生功能

---

## 🏗️ 步驟 5：建置 APK/AAB

### 初次設定

1. **安裝 EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **登入 Expo 帳號**
   ```bash
   eas login
   ```
   
   如果沒有帳號：
   ```bash
   eas register
   ```

3. **配置專案**
   ```bash
   eas build:configure
   ```
   
   選擇：
   - Platform: Android
   - 其他選項可以使用預設值

### 建置生產版本

```bash
# 建置 AAB（用於 Google Play）
eas build --platform android --profile production
```

這個過程會：
- 上傳你的程式碼到 Expo 伺服器
- 在雲端建置 AAB 檔案
- 大約需要 10-20 分鐘

建置完成後，你會得到一個下載連結。

### 測試版本（可選）

建議先建置測試版本：

```bash
# 建置 APK（可直接安裝到手機測試）
eas build --platform android --profile preview
```

下載 APK 並安裝到手機測試。

---

## 📤 步驟 6：上傳到 Google Play Console

### 6.1 創建 Google Play Console 帳號

1. 前往 [Google Play Console](https://play.google.com/console)
2. 支付一次性費用 $25 USD
3. 完成開發者資訊

### 6.2 創建新應用程式

1. 點擊「建立應用程式」
2. 填寫資訊：
   - **名稱：** Endless Knight
   - **預設語言：** 繁體中文
   - **應用程式類型：** 遊戲
   - **免費/付費：** 免費

### 6.3 填寫商店資訊

#### 主要商店資訊

1. **應用程式名稱：** Endless Knight
2. **簡短說明：**
   ```
   放置型 RPG！自動戰鬥、收集裝備、轉生變強！離線也能賺取獎勵
   ```

3. **完整說明：**
   - 複製 `STORE_LISTING.md` 中的完整描述

4. **應用程式圖示：**
   - 上傳 `assets/icon.png`（512x512px）

5. **Feature Graphic：**
   - 上傳你製作的 1024x500px 圖片

6. **截圖：**
   - 手機截圖：上傳至少 2 張
   - 7 吋平板：可選
   - 10 吋平板：可選

#### 分類

- **應用程式類別：** 遊戲
- **類型：** 角色扮演
- **標籤：** 放置遊戲、RPG

#### 聯絡資訊

- **電子郵件：** minato.planb@gmail.com
- **網站：** （可選）
- **電話：** （可選）

#### 隱私政策

- **隱私政策 URL：** `https://your-username.github.io/endless-knight-privacy/`
  （步驟 1 中獲得的 URL）

### 6.4 內容分級

填寫問卷（大約 5 分鐘）：

**暴力內容：**
- 是否有暴力？**是**（卡通暴力）
- 是否有血腥或殘酷畫面？**否**
- 結果：**PEGI 7+**

**其他問題：**
- 賭博：否
- 用戶互動：否
- 位置分享：否
- 個人資訊：否

提交後會得到內容分級（通常是 PEGI 7+ 或 E10+）。

### 6.5 目標受眾與內容

- **目標年齡：** 7 歲以上
- **兒童導向：** 否（混合受眾）

### 6.6 發布管理

#### 國家/地區

選擇：
- ✅ 所有國家/地區

或手動選擇：
- ✅ 台灣
- ✅ 香港
- ✅ 新加坡
- ✅ 馬來西亞
- ✅ 美國、加拿大、澳洲等

#### 內部測試（建議）

1. 創建內部測試軌道
2. 上傳 AAB 檔案
3. 添加測試者電子郵件
4. 測試 1-2 天

#### 正式發布

1. 創建正式版本
2. 上傳 AAB 檔案
3. 填寫版本資訊：
   ```
   首次發布！
   
   功能：
   - 500+ 關卡
   - 裝備收集與強化
   - 技能系統
   - 轉生系統
   - 離線獎勵
   ```
4. 提交審核

---

## ⏱️ 步驟 7：等待審核

### 審核時間

- **首次審核：** 通常 1-7 天
- **後續更新：** 通常 1-3 天

### 審核狀態

在 Google Play Console 可以查看：
- 待審核
- 審核中
- 已發布
- 被拒絕（如果有問題）

### 常見拒絕原因

1. **缺少隱私政策** → 確保 URL 有效
2. **截圖不符** → 截圖必須來自真實遊戲
3. **內容分級錯誤** → 重新檢查問卷

---

## 🎉 步驟 8：發布成功！

### 發布後

- 分享連結給朋友測試
- 監控崩潰報告
- 收集用戶反饋
- 準備第一次更新

### Google Play 商店連結

格式：`https://play.google.com/store/apps/details?id=com.endlessknight.game`

---

## 🔄 之後的更新流程

### OTA 更新（推薦，快速）

適用於：UI 改進、數值調整、Bug 修復

```bash
# 更新程式碼後
eas update --branch production --message "修復 bug 和平衡調整"
```

玩家下次啟動 App 時自動更新，**無需審核**！

### 完整更新（較慢）

適用於：添加原生模組、新權限

```bash
# 1. 更新 app.json 中的版本號
# version: "1.0.0" -> "1.1.0"

# 2. 建置新版本
eas build --platform android --profile production

# 3. 上傳到 Google Play
# 手動在 Console 上傳新 AAB
# 或使用 eas submit
```

審核時間：1-3 天

---

## 🆘 遇到問題？

### 常見問題

**Q: 建置失敗怎麼辦？**
A: 檢查錯誤訊息，通常是依賴問題。運行：
```bash
npm install
npx expo-doctor
```

**Q: 隱私政策 URL 無法訪問？**
A: 確保 GitHub Pages 已啟用，等待 5-10 分鐘生效。

**Q: 審核被拒絕？**
A: 查看 Google Play Console 的拒絕原因，修正後重新提交。

**Q: 截圖尺寸不對？**
A: 使用線上工具調整：[iloveimg.com](https://iloveimg.com/resize-image)

---

## 📊 發布時間表

**預估總時間：2-3 週**

| 階段 | 時間 | 狀態 |
|------|------|------|
| 準備資產 | 1-2 天 | ⚠️ 進行中 |
| 測試遊戲 | 1-2 天 | ⚠️ 待完成 |
| 建置 AAB | 1 小時 | ⚠️ 待完成 |
| 填寫 Console | 2-3 小時 | ⚠️ 待完成 |
| Google 審核 | 1-7 天 | ⚠️ 待完成 |
| **總計** | **~2 週** | |

---

## ✅ 快速檢查清單

發布前確認：

- [ ] 隱私政策已上傳並可訪問
- [ ] Feature Graphic 已製作（1024x500px）
- [ ] 截圖已準備（至少 2 張）
- [ ] 遊戲已完整測試
- [ ] 版本號為 1.0.0
- [ ] Expo 帳號已註冊
- [ ] Google Play Console 帳號已註冊（$25）
- [ ] AAB 檔案已建置
- [ ] 商店資訊已填寫
- [ ] 內容分級已完成
- [ ] 提交審核

---

**準備好了嗎？讓我們開始吧！** 🚀

有任何問題隨時告訴 Claude！
