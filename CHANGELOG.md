# Changelog

所有專案的重要變更都會記錄在這個檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)。

---

## [Unreleased]

### 新增
- **新區域：迷霧沼澤（Misty Swamp）**
  - 25 關卡，5 種敵人
  - Boss：沼澤之王
  - 使用 forest_winter 背景

- **新區域：烈焰地獄（Flame Hell）**
  - 30 關卡，5 種敵人
  - Boss：煉獄魔王（掉落傳說裝備）
  - 使用 hell 背景

- **技能系統（Skills System）**
  - 6 種主動技能：強力一擊、治療術、護盾、狂暴、鷹眼、黃金時刻
  - 技能有冷卻時間（10-30秒）
  - 技能可升級，最高 5-10 級
  - 擊敗 Boss 獲得技能點
  - 技能效果：
    - 即時傷害（強力一擊）
    - 即時治療（治療術）
    - 防禦 buff（護盾）
    - 攻速 buff（狂暴）
    - 暴擊 buff（鷹眼）
    - 金幣 buff（黃金時刻）
  - 技能欄顯示在戰鬥畫面
  - 技能頁面可升級/解鎖技能

- **戰鬥風格系統（Combat Style Triangle）**
  - 三種戰鬥風格：近戰、遠程、魔法
  - 剋制關係：近戰 > 遠程 > 魔法 > 近戰
  - 剋制時造成/受到 150% 傷害
  - 戰鬥風格選擇器顯示與當前敵人的相剋關係
  - 每個敵人都有預設的戰鬥風格

- **製作系統（Crafting System）**
  - 4 種製作類型：鍛造、製箭、烹飪、煉金
  - 使用採集資源製作物品
  - 配方包含：武器、防具、食物、藥水
  - 製作頁面（`/crafting`）

- **消耗品系統（Consumables System）**
  - 食物：恢復 HP（烤魚、魚湯、豪華大餐）
  - 藥水：提供增益效果（力量/防禦/速度藥水）
  - Buff 系統：增益效果有持續時間
  - 自動過期的 buff 追蹤

- **轉生系統（Prestige System）**
  - 消耗進度換取轉生點數
  - 8 種永久升級：攻擊/防禦/生命/暴擊/速度/金幣/起始金/離線效率
  - 轉生點數計算基於：累計金幣、最高關卡、通關區域
  - 轉生重置：金幣、升級、裝備、區域進度、採集資源
  - 轉生保留：轉生點數、永久升級

- **Boss 戰系統**
  - 每個區域最終關卡出現 Boss
  - 3 個區域 Boss：史萊姆王、哥布林酋長、骷髏領主
  - Boss 有更高的 HP/ATK/DEF（5-8 倍）
  - Boss 保證掉落裝備（最低稀有度根據區域）
  - Boss 專屬 UI：金色血條、放大顯示、稱號顯示

### 修復
- **敵人圖片修復（Portrait → Sprite）**
  - 將所有敵人圖片從頭像改為全身像素圖
  - 修復的敵人：skeleton, skeleton_red, skeleton_gold, goblin, zombie, orc, bat, mushroom, rat, mimic
  - 所有敵人現在面向左邊（符合 CLAUDE.md 美術規範）

---

## [v0.5.0] - 2026-02-02

### 新增
- **採集系統**
  - 4 種工人：礦工、樵夫、漁夫、採集者
  - 4 種資源：礦石、木材、魚獲、草藥
  - 工人在背景自動採集（即使在其他分頁）
  - 工人升級功能（5 級，採集速度加快）
  - 資源倉庫（每種資源上限 500）
- **採集頁面** (`app/gathering.tsx`)
  - 工人卡片顯示等級、採集進度、升級按鈕
  - 資源倉庫面板顯示當前存量
- **離線採集收益**
  - 離線時工人繼續採集
  - 返回時顯示離線採集獎勵

### 變更
- 存檔版本升級至 `0.5.0`
- `useGameStore` 新增採集系統狀態和方法
- `types/index.ts` 新增 ResourceType、WorkerType、Worker、GatheringState 型別
- `OfflineModal` 現在顯示離線採集獎勵
- 底部導航新增「採集」分頁

### 新增檔案
- `src/data/resources.ts` — 資源類型定義
- `src/data/gathering.ts` — 工人和升級表定義
- `src/components/gathering/WorkerCard.tsx` — 工人卡片元件
- `src/components/gathering/ResourceBar.tsx` — 資源顯示元件
- `app/gathering.tsx` — 採集頁面

---

## [v0.4.0] - 2026-02-02

### 新增
- **區域系統**
  - 3 個初始區域：新手平原、陰暗森林、石壁高地
  - 每個區域有獨特的敵人池（3-5 種敵人）
  - 每個區域有專屬背景圖
  - 區域內關卡數：10/15/20 關
  - 敵人根據區域和關卡動態生成
- **區域選擇器** (`AreaSelector.tsx`)
  - 橫向滾動的區域按鈕列
  - 顯示區域進度和完成狀態
  - 未解鎖區域顯示鎖定圖示
- **區域解鎖機制**
  - 通關區域自動解鎖下一個區域
  - 區域進度獨立儲存
- **TopBar 更新**
  - 顯示區域名稱
  - 顯示「第 X/Y 關」格式
  - 完成區域顯示 ✓ 標記

### 變更
- 存檔版本升級至 `0.4.0`
- `useGameStore` 新增區域相關狀態和方法
- `types/index.ts` 新增 Area、AreaEnemy、AreaProgress 型別
- `BattleView` 改用區域資料決定背景和敵人
- 敵人現在有基於區域的名稱和數值

### 新增檔案
- `src/data/areas.ts` — 區域和敵人定義
- `src/components/ui/AreaSelector.tsx` — 區域選擇元件

### 文件
- **CLAUDE.md 新增「設計哲學」章節**
  - 核心理念：不要只是堆疊數字
  - 設計原則 5 條（牆=謎題、每個數字都重要、區域效率公式、裝備是解法、後台成長）
  - 參考遊戲研究：Melvor Idle、Soda Dungeon、Into the Breach
- **更新「遊戲數值」章節**
  - 新增區域係數傷害公式（future-proof DEF 系統）
  - 新增敵人數值範圍表（5 個區域）
  - 新增 DEF 減傷參考表

---

## [v0.3.0] - 2026-02-02

### 新增
- **裝備系統**
  - 6 種裝備欄位：武器、頭盔、盔甲、盾牌、戒指、護符
  - 5 種稀有度：普通、優良、稀有、史詩、傳說
  - 敵人掉落機制（一般敵人 8-25%，Boss 100%）
  - 自動裝備升級功能
- **背包系統**
  - 初始容量 50 格
  - 背包升級功能（每級 +20 格，最高 10 級 / 250 格）
  - 物品詳情面板（裝備/丟棄/比較）
- **裝備頁面** (`app/equipment.tsx`)
  - 裝備欄位面板
  - 背包升級面板
  - 背包物品格
- **底部導航** (`BottomNav.tsx`)
  - 戰鬥 / 裝備 / 轉生 三個分頁
- **掉落通知** (`LootModal.tsx`)
  - 裝備掉落時顯示 Toast 通知

### 變更
- 存檔版本升級至 `0.3.0`
- `useGameStore` 新增裝備和背包相關狀態與方法
- `types/index.ts` 新增裝備相關型別定義

---

## [v0.2.0] - 2026-01-xx

### 新增
- 玩家角色精靈圖（戰士）
- 自動復活機制（死亡後 1 秒自動回到上一關）
- 美術方向文件

### 變更
- 玩家名稱改為「戰士」

---

## [v0.1.0] - 2026-01-xx

### 新增
- 專案初始化 (Expo + TypeScript + Zustand)
- 基本佈局 (SafeAreaView + TopBar + BattleView + UpgradePanel)
- 遊戲引擎 (100ms tick interval)
- 戰鬥系統 (自動攻擊、傷害計算、暴擊)
- 血條 + 傷害飄字
- 升級面板 (HP/ATK/DEF/SPEED/CRIT)
- 存檔系統 (AsyncStorage)
- 離線獎勵計算
- Netlify 部署設定
