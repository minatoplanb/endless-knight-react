# Changelog

所有專案的重要變更都會記錄在這個檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)。

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
