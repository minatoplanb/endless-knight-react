# Endless Knight - React Native

> Claude Code 工作手冊。每次開始前先讀這份文件。

---

## 基本設定

| 設定 | 值 |
|------|---|
| 語言 | **繁體中文**（Claude 回覆一律用繁體中文，程式碼和註解用英文）|
| 版本 | v1.1.0 |
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

## 設計哲學

### 核心理念：不要只是堆疊數字

這款遊戲的目標不是讓玩家看到越來越大的數字。
**進步 = 解鎖新的可能性，而非單純的數值膨脹。**

#### 反面教材
- ❌ Stage 100 敵人有 1,000,000 HP
- ❌ 玩家傷害從 10 變成 10,000,000
- ❌ 唯一的「策略」是等數字變大

#### 正確方向
- ✅ 數字保持在人類可理解的範圍（HP < 2000）
- ✅ 進入新區域需要「更好的裝備」，不是「更大的數字」
- ✅ 舊裝備在新區域變弱，但不是完全沒用
- ✅ 玩家需要「換 build」而非「等升級」

---

### 設計原則

#### 1. 牆 = 謎題，不是時間檢查點

玩家卡關時，應該想：
- 「我需要什麼裝備/詞條來解這關？」
- 「我的 build 哪裡不對？」

而不是：
- 「我需要再掛 2 小時」

#### 2. 每個數字都要有意義

學習 Into the Breach：
- 1 點防禦的差距應該是可感知的
- 不要讓數字大到玩家無法比較
- HP 上限 2000，傷害通常在 10-200 之間

#### 3. 區域等級決定效率，不是傷害倍率

```
有效攻擊力 = 基礎攻擊 × (裝備等級 / (裝備等級 + 區域要求))
```

- 裝備等級 50 進入要求 50 的區域 → 50% 效率
- 裝備等級 100 進入要求 50 的區域 → 67% 效率
- 裝備等級 50 進入要求 100 的區域 → 33% 效率

這樣舊裝備永遠有用，只是效率較低。

#### 4. 裝備是「解法」，不是「數值」

好的裝備詞條：
- ✅ 破甲：無視敵人 30% 防禦
- ✅ 背水一戰：HP < 30% 時攻速 +40%
- ✅ 穩定打擊：攻速越高，命中越高

壞的裝備詞條：
- ❌ 攻擊力 +500
- ❌ 傷害 +50%

#### 5. 後台成長 = 長期黏性

學習 Melvor Idle：
- 玩家就算沒在打怪，也覺得「有東西在進步」
- 後台技能準備的是「工具」，不是「數值」

---

### 參考遊戲

| 遊戲 | 學習重點 |
|------|---------|
| Melvor Idle | 多技能互相服務、Safe Idling、區域難度設計 |
| Soda Dungeon | 永遠有東西可升級、公平 F2P、Custom AI |
| Into the Breach | 每個數字都重要、多重目標、效果 > 數值 |

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

### 敵人圖片規則
- **一律使用 Sprite（全身像素圖）** - 不要使用 Portrait（頭像/半身像）
- 敵人圖片應該是完整的角色造型，不是只有臉部
- 所有敵人圖片放在 `assets/images/enemies/` 資料夾
- 命名格式：`enemy_type.png`（如 `slime_green.png`、`skeleton.png`）

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

### 傷害公式

```typescript
const calculateDamage = (
  playerAtk: number,
  playerGearLevel: number,
  areaRequiredLevel: number,
  enemyDef: number
) => {
  // 區域效率（收益遞減）
  const areaEfficiency = playerGearLevel / (playerGearLevel + areaRequiredLevel)

  // 有效攻擊力
  const effectiveAtk = playerAtk * areaEfficiency

  // 減傷（收益遞減）: DEF 100 = 50% 減傷
  const damageReduction = enemyDef / (enemyDef + 100)

  // 最終傷害（最少 1）
  return Math.max(1, Math.floor(effectiveAtk * (1 - damageReduction)))
}
```

### 敵人數值範圍

| 區域 | HP | ATK | DEF | 要求等級 |
|------|-----|-----|-----|---------|
| 新手平原 | 30-100 | 5-15 | 0-10 | 10 |
| 石壁高地 | 80-200 | 12-25 | 20-40 | 30 |
| 迅捷荒原 | 100-300 | 20-40 | 10-20 | 50 |
| 深層遺跡 | 200-500 | 30-60 | 40-80 | 80 |
| 禁區 | 400-800 | 50-100 | 60-120 | 120 |

**注意**：數字保持在 1000 以下，透過「區域係數」創造難度差異。

### DEF 減傷參考

| DEF | 減傷率 |
|-----|-------|
| 0 | 0% |
| 50 | 33% |
| 100 | 50% |
| 200 | 67% |

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
- [x] 底部導航 (戰鬥/採集/裝備)
- [x] 區域系統 (5 個區域、敵人池、區域選擇器)
- [x] 採集系統 (4 工人、4 資源、背景採集、離線獎勵)
- [x] 戰鬥風格系統 (近戰/遠程/魔法 三角形)
- [x] 製作系統 (鍛造/製箭/烹飪/煉金)
- [x] 消耗品系統 (食物/藥水/Buff)
- [x] 轉生系統 (轉生點數、永久升級)
- [x] Boss 戰 (5 區域 Boss、特殊 UI、保證掉落)
- [x] 技能系統 (6 技能、冷卻、技能點、升級)
- [x] 統計系統 (擊殺、傷害、金幣、連殺等追蹤)
- [x] 平衡調整 (100 關卡/區域、Boss 強化、掉落率降低)

### 🔲 待完成
- [ ] 統計頁面 UI
- [ ] 成就系統
- [ ] 每日獎勵
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
