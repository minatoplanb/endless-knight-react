# 🚀 現在就發布 - 步驟清單

**版本：** 1.0.0  
**狀態：** 已具備發布條件，依序執行以下步驟即可。

---

## ✅ 已就緒

- 隱私政策：https://minatoplanb.github.io/endless-knight-react/
- Feature Graphic：`store-assets/feature-graphic-1024x500.png`
- 截圖：`store-assets/screenshots/`（01-battle ~ 04-equipment，至少 2 張符合 Play 要求）
- 商店描述：`STORE_LISTING.md`
- EAS 配置：`eas.json`
- TypeScript：編譯通過

---

## 步驟 1：建置 AAB（約 15–30 分鐘）

```bash
# 1. 安裝 EAS CLI（若尚未安裝）
npm install -g eas-cli

# 2. 登入 Expo 帳號（請用發布用信箱：minato.planb@gmail.com）
eas login

# 確認目前帳號（應顯示 minatoplanb / minato.planb@gmail.com）
eas whoami

# 若顯示舊信箱，先登出再登入：eas logout → eas login

# 3. 建置 Android 正式版（產出 .aab）
eas build --platform android --profile production
```

- 建置完成後，在 [expo.dev](https://expo.dev) 專案頁下載 **.aab** 檔案。

---

## 步驟 2：Google Play Console 設定

1. **登入** [Google Play Console](https://play.google.com/console)（需開發者帳號 $25）。
2. **建立應用程式**（若尚未建立）→ 輸入應用名稱「Endless Knight」。
3. **填寫商店資訊**（依 `STORE_LISTING.md`）：
   - 短描述（80 字內）
   - 完整描述（4000 字內）
   - **隱私政策 URL：** `https://minatoplanb.github.io/endless-knight-react/`
4. **上傳資產**：
   - **Feature Graphic：** 上傳 `store-assets/feature-graphic-1024x500.png`（1024×500）
   - **截圖：** 上傳 `store-assets/screenshots/` 中至少 2 張（建議 01-battle、04-equipment）
5. **內容分級**：完成問卷（暴力：卡通 → 選對應選項；無賭博、無內購等如實填寫）。
6. **定價與發行**：選「免費」、勾選要上架的國家/地區。

---

## 步驟 3：提交 AAB

**方式 A：在 Play Console 手動上傳**

- 進入「發布」→「正式版」或「內部測試」→「建立新版本」→ 上傳 .aab。

**方式 B：用 EAS Submit（需先準備服務帳戶金鑰）**

- 將 Google Play 的服務帳戶金鑰存成專案根目錄的 `google-play-service-account.json`（勿 commit）。
- 執行：
  ```bash
  eas submit --platform android --latest
  ```

---

## 步驟 4：送審

- 在 Play Console 中提交審核。
- 審核通常 1–7 天；首次可能較久。

---

## 若建置失敗

- 執行：`npx expo-doctor`
- 確認 `app.json` 中 `version`、`android.package` 正確。
- 詳細流程與疑難排解見 `PUBLISH_GUIDE.md`。

---

**完成以上步驟即完成上架。** 🎮
