# Endless Knight - React Native

> Claude Code 工作手冊。每次開始前先讀這份文件。

---

## 基本設定

| 設定 | 值 |
|------|---|
| 語言 | **繁體中文**（Claude 回覆一律用繁體中文，程式碼和註解用英文）|
| 版本 | v0.3.0 |
| 框架 | React Native + Expo SDK 52 |
| 狀態管理 | Zustand |
| 存檔 | @react-native-async-storage/async-storage |
| 導航 | expo-router |
| 建置 | EAS Build |
| 目標 | Android (Google Play) |

---

## 遊戲概念

這是一個 Idle Auto-Battler。玩家角色自動往右走、自動打怪、收集金幣升級。

**沒有動畫。** 戰鬥用靜態圖片 + 數字跳動 + 簡單的閃爍/淡入淡出表現。
整個遊戲本質上是一個「有遊戲邏輯的 App」，不是傳統意義的遊戲。

### 核心循環
```
自動移動（進度條）→ 遇到敵人 → 自動戰鬥（數字跳動）→ 敵人死 → 掉金幣
                                                    → 玩家死 → 回上一關
離線時 → 計算離線收益 → 回來時領取
```

---

## 專案結構

```
endless-knight-react/
├── app/                          # Expo Router 頁面
│   ├── _layout.tsx               # 根佈局（SafeAreaView + 底部導航）
│   ├── index.tsx                 # 主畫面：戰鬥 + 升級
│   ├── equipment.tsx             # 裝備/背包
│   └── prestige.tsx              # 轉生
├── src/
│   ├── components/
│   │   ├── battle/
│   │   │   ├── BattleView.tsx    # 戰鬥區域（背景 + 角色 + HP條）
│   │   │   ├── CharacterSprite.tsx # 靜態角色圖（閃爍效果）
│   │   │   ├── HealthBar.tsx     # HP 條元件
│   │   │   ├── DamagePopup.tsx   # 傷害飄字
│   │   │   └── StageProgress.tsx # 關卡進度條
│   │   ├── ui/
│   │   │   ├── UpgradePanel.tsx  # 升級按鈕面板
│   │   │   ├── UpgradeButton.tsx # 單個升級按鈕
│   │   │   ├── StatBar.tsx       # 屬性顯示
│   │   │   ├── GoldDisplay.tsx   # 金幣（有動畫）
│   │   │   └── TopBar.tsx        # 頂部資訊列
│   │   ├── modals/
│   │   │   ├── DeathModal.tsx    # 死亡彈窗
│   │   │   ├── OfflineModal.tsx  # 離線獎勵
│   │   │   └── LootModal.tsx     # 裝備掉落
│   │   └── common/
│   │       ├── PixelText.tsx     # 像素風文字（自訂字體）
│   │       └── PressableScale.tsx # 有縮放回饋的按鈕
│   ├── engine/
│   │   ├── GameEngine.ts         # 主引擎（setInterval 100ms）
│   │   ├── CombatSystem.ts       # 傷害計算
│   │   ├── LootSystem.ts         # 掉落計算
│   │   └── OfflineSystem.ts      # 離線收益
│   ├── store/
│   │   ├── useGameStore.ts       # Zustand 主 store
│   │   └── useSave.ts            # 自動存檔 hook
│   ├── data/
│   │   ├── enemies.ts            # 敵人定義
│   │   ├── equipment.ts          # 裝備資料
│   │   └── stages.ts             # 關卡設定
│   ├── utils/
│   │   ├── format.ts             # formatNumber, formatTime
│   │   └── math.ts               # 共用計算
│   ├── constants/
│   │   ├── game.ts               # 遊戲常數（BASE_HP, SCALING 等）
│   │   └── theme.ts              # 顏色、字體、間距
│   └── types/
│       └── index.ts              # TypeScript 型別
├── assets/
│   ├── images/
│   │   ├── player.png            # 玩家靜態圖（正面/戰鬥姿勢）
│   │   ├── enemies/              # 敵人靜態圖
│   │   └── backgrounds/          # 關卡背景
│   ├── icons/                    # 裝備/技能圖示
│   └── fonts/                    # 像素字體
├── CLAUDE.md                     # 這個文件
├── CHANGELOG.md
├── app.json
├── package.json
└── tsconfig.json
```

---

## 美術規範

### 角色方向
- **玩家（MC）：永遠面向右邊 →**
- **敵人：永遠面向左邊 ←**

這樣玩家和敵人會面對面。從 spritesheet 擷取時，如果方向不對要用 `Image.FLIP_LEFT_RIGHT` 翻轉。

### 圖片尺寸
| 類型 | 原始尺寸 | 顯示尺寸 | 說明 |
|------|---------|---------|------|
| 玩家 | 64x64 | 192x192 | 放大 3x，用 NEAREST |
| 敵人 | 64x64 | 64-128 | 依敵人大小調整 |
| 背景 | 1024x346 | 100% 寬 | cover 模式 |
| 圖示 | 16x16 | 32x32 | 放大 2x |

### 像素藝術縮放
一律用 `Image.NEAREST`（最近鄰插值），保持像素銳利，不要模糊。

---

## 手機優化規範

### 螢幕適配
```typescript
import { Dimensions } from 'react-native';
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// 所有尺寸用比例，不要用固定 px
// 基準設計稿：375 x 812 (iPhone SE/小螢幕)
const scale = (size: number) => (SCREEN_W / 375) * size;

// 使用範例
fontSize: scale(14)
padding: scale(12)
```

### 佈局
```
┌─────────────────────────┐
│ TopBar（固定高度 50）     │  ← SafeAreaView 內
├─────────────────────────┤
│                         │
│   BattleView            │  ← flex: 3（佔 60%）
│   (背景 + 角色 + HP)     │
│                         │
├─────────────────────────┤
│   StageProgress         │  ← 固定高度 30
├─────────────────────────┤
│                         │
│   UpgradePanel          │  ← flex: 2（佔 40%）
│   (ScrollView)          │     可捲動！
│                         │
├─────────────────────────┤
│ BottomNav（固定高度 60）  │  ← 底部導航
└─────────────────────────┘
```

### 效能規則
- **不要在 render 中 new Object** - 所有 style 用 StyleSheet.create
- **不要在 render 中 bind function** - 用 useCallback
- **列表用 FlatList** - 不要用 map + ScrollView
- **圖片用固定尺寸** - 不要讓圖片自適應
- **避免重新渲染** - 用 React.memo 包裝不常變的元件
- **遊戲引擎不觸發整頁重新渲染** - 只更新 Zustand 中變化的 slice

### 觸控規則
- 最小觸控區域：48x48 dp
- 按鈕之間間距至少 8dp
- 升級按鈕要大，方便單手操作
- 底部導航用大圖示

---

## 遊戲數值

### 敵人
```typescript
const getEnemyStats = (stage: number) => ({
  hp: Math.floor(30 * Math.pow(1.15, stage - 1)),
  atk: Math.floor(5 * Math.pow(1.08, stage - 1)),
  goldDrop: Math.floor(10 * Math.pow(1.10, stage - 1)),
});
```

### 升級
```typescript
const getUpgradeCost = (type: string, level: number) =>
  Math.floor(100 * Math.pow(1.5, level));

const UPGRADE_EFFECTS = {
  hp: { perLevel: 15, stat: 'maxHp' },
  atk: { perLevel: 5, stat: 'atk' },
  def: { perLevel: 3, stat: 'def' },
  speed: { perLevel: 0.05, stat: 'attackSpeed' }, // 攻擊頻率
  crit: { perLevel: 0.005, stat: 'critChance' },
};
```

### 離線
```typescript
const MAX_OFFLINE_HOURS = 8;
const OFFLINE_EFFICIENCY = 0.5; // 離線效率 50%
```

---

## 顏色主題

```typescript
export const COLORS = {
  // 背景
  bg: '#0f0f23',
  bgLight: '#1a1a3e',
  panel: '#16213e',
  
  // 文字
  text: '#ffffff',
  textDim: '#8888aa',
  textGold: '#ffd700',
  
  // 血條
  hpFull: '#44ff44',
  hpMid: '#ffff44',
  hpLow: '#ff4444',
  
  // 稀有度
  common: '#ffffff',
  uncommon: '#44ff44',
  rare: '#4488ff',
  epic: '#aa44ff',
  legendary: '#ffaa00',
  
  // 按鈕
  buttonPrimary: '#4466aa',
  buttonDisabled: '#333355',
  buttonSuccess: '#44aa44',
};
```

---

## 戰鬥表現（無動畫版）

### 攻擊表現
```
玩家攻擊敵人：
1. 敵人圖片閃紅 (opacity 0.5 → 1.0, 100ms)
2. 敵人 HP 條縮短（animated width）
3. 傷害數字從敵人位置往上飄 + 淡出
4. 如果暴擊：數字放大 + 黃色

敵人攻擊玩家：
1. 玩家圖片閃紅 (同上)
2. 玩家 HP 條縮短
3. 傷害數字（紅色）

敵人死亡：
1. 敵人圖片淡出 (opacity 1 → 0, 300ms)
2. 金幣 +X 飄字（金色往上飄）
3. 短暫停頓 500ms
4. 新敵人從右邊淡入

玩家死亡：
1. 畫面灰階或紅色閃爍
2. 彈出 DeathModal
```

### 移動表現
```
不是動畫角色在走路。
而是：一個進度條從 0% 到 100%，
到 100% 時出現新敵人。
```

---

## Git 規範

### Commit 訊息格式
```
<type>: <簡短描述>

<詳細說明（可選）>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**類型：**
- `feat`: 新功能
- `fix`: 修復 bug
- `refactor`: 重構
- `style`: 樣式調整
- `docs`: 文件更新
- `chore`: 雜項（設定、依賴等）

### 每次 commit 時必須
1. **給予適當的 commit 名稱** - 清楚描述變更內容
2. **更新 CHANGELOG.md** - 記錄版本歷史和變更項目
3. **更新 CLAUDE.md** - 如果有新功能，更新「進度追蹤」和相關文件
4. **更新版本號** - 重大功能更新時在 CLAUDE.md 基本設定中更新版本

### 版本號規則
- `v0.X.0` - 新增重大功能（如裝備系統、技能系統）
- `v0.X.Y` - 小功能或修復

---

## 進度追蹤

### ✅ 已完成
- [x] 專案初始化 (Expo + TypeScript)
- [x] 基本佈局 (SafeArea + TopBar + BattleView + UpgradePanel)
- [x] 遊戲引擎 (GameEngine.ts + setInterval)
- [x] 戰鬥系統 (CombatSystem.ts)
- [x] 血條 + 傷害飄字
- [x] 升級面板
- [x] 存檔系統 (AsyncStorage)
- [x] 離線獎勵
- [x] 裝備系統 (掉落、背包、裝備欄位)
- [x] 背包升級功能 (50→250 格，10 級)
- [x] 底部導航 (戰鬥/裝備/轉生)

### 🔲 待完成
- [ ] 技能系統
- [ ] 轉生系統
- [ ] 多區域/Boss
- [ ] AdMob 廣告
- [ ] IAP 內購
- [ ] Google Play 上架

---

## 常用指令

```bash
npx expo start            # 開發（手機掃 QR code）
npx expo start --android  # Android 模擬器
eas build --platform android --profile preview  # 建置 APK
eas submit --platform android                   # 上傳 Google Play
```

---

## 注意事項

1. **所有尺寸用 scale() 函數** - 不要寫死 px
2. **遊戲邏輯和 UI 分離** - engine/ 資料夾不 import React
3. **存檔頻率** - 每 30 秒 + 每次重要操作後
4. **記憶體** - 圖片不超過 512x512，用 PNG
5. **TypeScript** - 所有檔案用 .ts/.tsx，不要用 .js
