# Store Assets for Google Play

## Feature Graphic
- **使用版本：** `feature-graphic-1024x500.png`（由 Gemini 圖縮放而來）
- **尺寸：** 1024×500（Google Play 要求）
- **若需重新縮放 Gemini 圖：**
  1. 將 Gemini 產生的圖放到 `store-assets/gemini-feature-raw.png`
  2. 執行：`npm run resize-feature-graphic`
  3. 或指定路徑：`node scripts/resize-feature-graphic.js 路徑/到/圖.png`
- **備用版本：** `feature-graphic.png`、`feature-graphic-gemini.png`、`feature-graphic-gpt.png`

## 選擇理由
Gemini 版本提供了：
- 更好的視覺平衡（敵人 vs 騎士 + 寶箱）
- 更強的 RPG 氛圍（地城背景）
- 豐富的收集元素（寶箱、金幣、裝備）
- 符合 Idle Auto-Battler 的核心玩法（戰鬥 + 尋寶）

## 下一步
1. ✅ Feature Graphic 完成
2. ✅ 截取遊戲畫面（已提供 7 張，見下方）
3. ⏳ 確認 App Icon (512x512)
4. ⏳ 調整尺寸（如需要）

## 截圖（Screenshots）

你已提供 7 張截圖，建議上傳到 Google Play 時使用以下順序與說明：

| 順序 | 建議檔名 | 畫面內容 | 用途 |
|------|----------|----------|------|
| 1 | 01-battle.png | 戰鬥（戰士 vs 巨鼠、升級區） | 主玩法 |
| 2 | 02-gathering.png | 採集（礦工/樵夫/漁夫/採集者、資源倉庫） | 後台成長 |
| 3 | 03-crafting.png | 製作（烹飪：烤魚/魚湯/豪華大餐） | 製作系統 |
| 4 | 04-equipment.png | 裝備（6 格裝備 + 背包格） | 裝備/背包 |
| 5 | 05-skills.png | 技能（強力一擊/治療術/護盾/狂暴） | 技能系統 |
| 6 | 06-quests.png | 任務（每日任務、戰鬥達人、領取獎勵） | 任務系統 |
| 7 | 07-prestige.png | 轉生（轉生點數、條件、轉生升級） | 長期目標 |

- **現有檔案：** `screenshots/` 下已有 01-battle ~ 04-equipment，可依需要替換為你剛截的圖。
- **新增：** 若要使用全部 7 張，請將技能/任務/轉生三張另存為 `05-skills.png`、`06-quests.png`、`07-prestige.png` 放到 `store-assets/screenshots/`。
- **Play 要求：** 至少 2 張，建議 4–8 張；尺寸 1080×1920 或手機實際比例即可。
