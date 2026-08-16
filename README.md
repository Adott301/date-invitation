# Valentine's Proposal Game Template

A "spy-themed" interactive web experience for a Valentine's Day proposal or date night invitation. Players must solve 3 puzzles to "decrypt" the final mission: asking them to be your Valentine.

## 🕵️‍♂️ Mission Briefing

The user acts as an agent trying to unlock a classified file. They must complete 3 mini-games:
1. **Conspiracy Board**: Find the connections between items.
2. **Bomb Defusal**: Cut the correct wires based on personal trivia logic.
3. **Satellite Recon**: Locate special places in your relationship on a map.

Once completed, they unlock the "Finale" which displays your proposal message.

## 🚀 Getting Started

1. **Clone the repo**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000)**

## 🛠️ Customization Guide

### 1. Update Personal Details
Search for `[NAME]` or `[AGENT NAME]` in the codebase to find where to put your names.
- **`components/MissionBriefing.tsx`**: Update the introductory text.
- **`components/Dashboard.tsx`**: Update the Operation Name.
- **`components/Finale.tsx`**: Update the final letter, ticket details, and your specific "Auth Code".

### 2. Configure Puzzles
**Case A: Conspiracy (`components/puzzles/ConspiracyPuzzle.tsx`)**
- Edit `PUZZLE_DATA` to include 4 groups of 4 related items (e.g., Favorite Foods, Inside Jokes).
- Add images for each item in `public/` and update the `getImagePath` function if you want specific images.

**Case B: Defusal (`components/puzzles/DefusePuzzle.tsx`)**
- Edit the "Manual" text to reflect your partner's traits (e.g., "If Agent loves cats, cut blue").
- Note: The logic for valid cuts is in the `handleCut` function.

**Case C: Visual (`components/puzzles/VisualPuzzle.tsx`)**
- Update `STAGES` with coordinates of special places.
- You can find coordinates by hovering over the map image in the game (dev mode logs or trial and error).

### 3. Add Your Images
- Replace `public/placeholder.jpg` with your own photos.
- Add specific images for the Conspiracy puzzle if desired.
- **Note:** The `public` folder currently contains a placeholder. You should add your own assets.

## 🎵 Audio
The game includes sound effects and ambience. You can adjust or replace files in `public/` if needed. The `hooks/useSpySound.ts` file manages the audio assets.

## 📦 Deployment
Deploy easily to Vercel:
1. Push your customized code to GitHub.
2. Import the project in Vercel.
3. Deploy!

---
*Good luck, Agent.*
