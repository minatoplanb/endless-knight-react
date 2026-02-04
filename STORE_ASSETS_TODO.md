# Google Play Store 資產製作清單

## 📋 需要的圖片

### 1. ✅ App Icon (已有)
- **檔案：** `assets/icon.png`
- **需要：** 檢查是否為 512x512（Google Play 要求高解析度版本）
- **狀態：** 待確認尺寸

---

### 2. ⚠️ Feature Graphic（必需！）
- **尺寸：** 1024 x 500 像素
- **格式：** PNG 或 JPG
- **用途：** Play Store 列表頂部的橫幅圖
- **風格：** 像素風格，深色背景，展示遊戲主題

#### 🤖 AI 生成提示（GPT/Gemini）

**推薦使用：DALL-E 3 (GPT-4) 或 Gemini 2.0**

```
Create a feature graphic banner for a pixel art mobile game called "Endless Knight".

Specifications:
- Dimensions: 1024x500 pixels, horizontal banner format
- Art Style: Retro pixel art, similar to classic 16-bit RPGs
- Color Scheme: Dark fantasy theme with deep blues (#0f0f23, #1a1a3e) and vibrant accent colors
- Content: A pixel art knight character (facing right) wielding a sword, surrounded by fantasy monsters (slime, skeleton, goblin), with gold coins and epic equipment (swords, shields, helmets) floating around
- Atmosphere: Action-packed but not overwhelming, clear silhouettes, high contrast
- Text: Game title "Endless Knight" in bold pixel font at the top or center
- Background: Dark dungeon or forest with subtle depth

Key Elements:
- Main character: Armored knight sprite (64x64 style enlarged)
- 2-3 enemy sprites on the left
- Floating UI elements suggesting auto-battle mechanics
- Warm lighting suggesting treasure/reward
- Professional game banner composition

Style Reference: Think Soda Dungeon meets Realm Grinder, with clear readable pixel art
```

**簡化版（中文，給 Gemini）：**

```
製作一個像素風格的手機遊戲橫幅圖，尺寸 1024x500

內容：
- 像素藝術風格（16 位元復古 RPG）
- 一個騎士角色（朝右）拿著劍
- 周圍有怪物（史萊姆、骷髏）
- 金幣和裝備漂浮
- 深色背景（暗藍色 #0f0f23）
- 遊戲名稱「Endless Knight」用像素字體

氣氛：動作感、尋寶感、史詩感
風格參考：經典像素 RPG 遊戲，清晰高對比
```

---

### 3. 📱 遊戲截圖（最少 2 張，建議 4-8 張）
- **尺寸：** 1080 x 1920 像素（或手機實際解析度）
- **格式：** PNG 或 JPG
- **來源：** 真實遊戲截圖（不用 AI 生成）

#### 需要截取的畫面：

1. **主戰鬥畫面**（必需）
   - 顯示角色 vs 敵人
   - HP 條、傷害數字
   - 升級按鈕面板
   - 金幣顯示

2. **裝備/背包畫面**（必需）
   - 背包格子滿滿的裝備
   - 不同稀有度（綠、藍、紫、橙色框）
   - 裝備詳情面板

3. **技能畫面**（建議）
   - 6 種技能圖示
   - 技能等級和冷卻時間

4. **轉生畫面**（建議）
   - 轉生點數
   - 永久升級選項

5. **統計/成就畫面**（可選）
   - 展示遊戲深度

#### 📸 如何截圖：

**方法 A：Android 模擬器（推薦）**
```bash
npx expo start --android
# 等待載入後，用模擬器右側的相機圖示截圖
```

**方法 B：手機實測 + 傳輸**
- 手機上運行遊戲
- Power + Volume Down 截圖
- 用 USB 傳到電腦

**方法 C：Expo Go 預覽**
```bash
npx expo start
# 掃描 QR code 在手機上打開
# 手機截圖後傳到電腦
```

---

### 4. 🎨 可選：宣傳圖（Promo Graphic）
- **尺寸：** 180 x 120 像素
- **用途：** 某些 Play Store 版面
- **狀態：** 可選，不急

---

## 🎯 製作順序建議

1. **先做 Feature Graphic**（用 AI 生成）
   - 這是最顯眼的視覺元素
   - 可以用 GPT-4 或 Gemini 2.0
   - 生成後用 Photoshop/Figma/Canva 調整尺寸

2. **再截遊戲畫面**（真實截圖）
   - 運行遊戲到有一些裝備的狀態
   - 截取 4-6 張不同畫面
   - 可選：用 Canva 添加說明文字

3. **確認 App Icon**（檢查現有檔案）
   - 確保是 512x512
   - 如果不是，用 AI 重新生成或放大

---

## 📂 儲存位置

建議創建資料夾：
```
endless-knight-react/
└── store-assets/
    ├── feature-graphic.png (1024x500)
    ├── icon-512.png (512x512)
    └── screenshots/
        ├── 01-battle.png
        ├── 02-equipment.png
        ├── 03-skills.png
        └── 04-prestige.png
```

---

## ✅ 下一步

1. 用 AI 生成 Feature Graphic
2. 運行遊戲並截圖
3. 整理檔案到 `store-assets/` 資料夾
4. 檢查所有圖片符合尺寸要求
