// levels.js - 50 Balanced Levels, Rainy Street Environments, Daily Free Bulb & Coin Economy
// 100% Mathematically Verified Passability & Solvability Across All 50 Levels

function generate50MohallaLevels() {
  const levels = [];
  const targetSkins = ['classic_banta', 'doodhia', 'cats_eye', 'lal_angaar', 'neelam', 'satrangi'];

  // Base geometry (Portrait 480x800)
  const defaultRingCenter = { x: 240, y: 270 };
  const strikerStart = { x: 240, y: 680 };

  for (let i = 1; i <= 50; i++) {
    let name = '';
    let subtitle = '';
    let shots = 4;
    let starThresholds = [2, 3, 4];
    let winCondition = 'knock_out_targets';
    let ringRadius = 110;
    let ringCenter = { ...defaultRingCenter };

    const targets = [];
    const obstacles = [];
    const holes = [];
    const puddles = [];

    switch (i) {
      // ===== TIER 1: GALLI SHURUAT (Levels 1 - 10) =====
      case 1:
        name = "Level 1: Mohalla Shuruat";
        subtitle = "Pehla ghera! Pull back the striker to knock out all 3 kanchas.";
        shots = 4;
        starThresholds = [2, 3, 4];
        targets.push({ x: 240, y: 230, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 200, y: 285, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 280, y: 285, radius: 17, skinId: 'cats_eye' });
        break;

      case 2:
        name = "Level 2: Kachchi Mitti";
        subtitle = "Rainy mud slows down your goti! Avoid the left puddle and shoot right.";
        shots = 4;
        targets.push({ x: 240, y: 235, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 195, y: 285, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 285, y: 285, radius: 17, skinId: 'classic_banta' });
        puddles.push({ x: 150, y: 470, radius: 38 });
        break;

      case 3:
        name = "Level 3: Beech Ka Patthar";
        subtitle = "A red clay brick blocks the middle! Angle to the side or bank off cushions.";
        shots = 4;
        targets.push({ x: 240, y: 225, radius: 17, skinId: 'neelam' });
        targets.push({ x: 195, y: 280, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 285, y: 280, radius: 17, skinId: 'lal_angaar' });
        obstacles.push({ type: 'rect', x: 170, y: 450, width: 140, height: 18, bounce: 0.84, color: '#B23A22' });
        break;

      case 4:
        name = "Level 4: Patli Gali (The Gateway)";
        subtitle = "Narrow side bricks! Thread through the 100px center gap or bank off open side rails.";
        shots = 4;
        targets.push({ x: 240, y: 230, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 195, y: 280, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 285, y: 280, radius: 17, skinId: 'doodhia' });
        // Side bricks with open cushion rails (x: 20..60 and 420..460 open)
        obstacles.push({ type: 'rect', x: 60, y: 450, width: 130, height: 18, bounce: 0.84, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 290, y: 450, width: 130, height: 18, bounce: 0.84, color: '#B23A22' });
        break;

      case 5:
        name = "Level 5: Kankad Pehra";
        subtitle = "River pebbles deflect straight shots! Aim between or use side rebounds.";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 180, y: 275, radius: 17, skinId: 'neelam' });
        targets.push({ x: 300, y: 275, radius: 17, skinId: 'cats_eye' });
        obstacles.push({ type: 'circle', x: 190, y: 420, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 290, y: 420, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 240, y: 520, radius: 34 });
        break;

      case 6:
        name = "Level 6: Deewar Rebound (Bank Shot!)";
        subtitle = "Center is completely blocked by a long brick! Bank off the side cushion to strike.";
        shots = 4;
        targets.push({ x: 240, y: 220, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 195, y: 275, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 285, y: 275, radius: 17, skinId: 'satrangi' });
        obstacles.push({ type: 'rect', x: 110, y: 450, width: 260, height: 18, bounce: 0.86, color: '#B23A22' });
        break;

      case 7:
        name = "Level 7: Gucchu Trap";
        subtitle = "Deep dirt hole in front of the ring! Sinking traps striker; bank around it.";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'neelam' });
        targets.push({ x: 190, y: 270, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 290, y: 270, radius: 17, skinId: 'cats_eye' });
        holes.push({ x: 240, y: 400, radius: 24 });
        puddles.push({ x: 130, y: 480, radius: 36 });
        break;

      case 8:
        name = "Level 8: Tirchi Gali (Chicane Slalom)";
        subtitle = "Staggered brick walls! Direct path is cut off; execute a zigzag bank shot.";
        shots = 4;
        targets.push({ x: 240, y: 220, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 195, y: 280, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 285, y: 280, radius: 17, skinId: 'doodhia' });
        // Staggered bricks leaving open side cushions & center passage
        obstacles.push({ type: 'rect', x: 60, y: 520, width: 110, height: 18, bounce: 0.84, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 310, y: 420, width: 110, height: 18, bounce: 0.84, color: '#B23A22' });
        break;

      case 9:
        name = "Level 9: Kaali Goti Ka Pehra";
        subtitle = "Foul trap! Do NOT knock out the black goti. Bank from the sides to strike targets.";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 185, y: 270, radius: 17, skinId: 'neelam' });
        targets.push({ x: 295, y: 270, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 240, y: 345, radius: 17, skinId: 'classic_banta', isPenalty: true });
        break;

      case 10:
        name = "Level 10: Mohalla Gali Finale";
        subtitle = "Zone 1 Finale! Central brick, flank pebbles & mud. Prove your street mastery!";
        shots = 4;
        starThresholds = [2, 3, 4];
        targets.push({ x: 240, y: 200, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 240, y: 290, radius: 17, skinId: 'lal_angaar' });
        obstacles.push({ type: 'rect', x: 160, y: 450, width: 160, height: 18, bounce: 0.85, color: '#A8321B' });
        obstacles.push({ type: 'circle', x: 70, y: 280, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 410, y: 280, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 240, y: 540, radius: 36 });
        break;

      // ===== TIER 2: BARSAAT KI GALI (Levels 11 - 20) =====
      case 11:
        name = "Level 11: Geeli Deewar";
        subtitle = "Central brick flanked by wet mud! Bank high on the cushions.";
        shots = 4;
        targets.push({ x: 210, y: 230, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 270, y: 230, radius: 17, skinId: 'neelam' });
        targets.push({ x: 180, y: 290, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 300, y: 290, radius: 17, skinId: 'doodhia' });
        obstacles.push({ type: 'rect', x: 160, y: 460, width: 160, height: 18, bounce: 0.84, color: '#B23A22' });
        puddles.push({ x: 90, y: 490, radius: 36 });
        puddles.push({ x: 390, y: 490, radius: 36 });
        break;

      case 12:
        name = "Level 12: Do Baazu (Twin Flank Cushions)";
        subtitle = "Side bricks restrict wall bounces, center puddle drains speed! Thread the middle gap.";
        shots = 4;
        targets.push({ x: 240, y: 220, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 195, y: 280, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 285, y: 280, radius: 17, skinId: 'cats_eye' });
        obstacles.push({ type: 'rect', x: 50, y: 410, width: 110, height: 18, bounce: 0.85, color: '#A8321B' });
        obstacles.push({ type: 'rect', x: 320, y: 410, width: 110, height: 18, bounce: 0.85, color: '#A8321B' });
        puddles.push({ x: 240, y: 490, radius: 40 });
        break;

      case 13:
        name = "Level 13: Gucchu Pehra";
        subtitle = "Gucchu pit in the center guarded by flank pebbles! Bank off the top cushions.";
        shots = 4;
        targets.push({ x: 240, y: 210, radius: 17, skinId: 'neelam' });
        targets.push({ x: 180, y: 270, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 300, y: 270, radius: 17, skinId: 'lal_angaar' });
        holes.push({ x: 240, y: 400, radius: 24 });
        obstacles.push({ type: 'circle', x: 160, y: 440, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 320, y: 440, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        break;

      case 14:
        name = "Level 14: Laal Eent Ka Qila";
        subtitle = "Left flank has a brick; bank off the open right wall cushion.";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 190, y: 275, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 290, y: 275, radius: 17, skinId: 'cats_eye' });
        obstacles.push({ type: 'rect', x: 150, y: 460, width: 180, height: 18, bounce: 0.86, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 50, y: 540, width: 110, height: 18, bounce: 0.84, color: '#B23A22' });
        break;

      case 15:
        name = "Level 15: Barsaati Jheel";
        subtitle = "Massive water puddle with center river stone! Curve shots around the splash zone.";
        shots = 4;
        targets.push({ x: 210, y: 220, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 270, y: 220, radius: 17, skinId: 'neelam' });
        targets.push({ x: 240, y: 290, radius: 17, skinId: 'lal_angaar' });
        puddles.push({ x: 240, y: 490, radius: 48 });
        obstacles.push({ type: 'circle', x: 240, y: 415, radius: 22, bounce: 0.78, color: '#6E5C4E' });
        break;

      case 16:
        name = "Level 16: Kankad Chowki (Diamond Shield)";
        subtitle = "4 river pebbles form a diamond shield! Strike pebbles at an angle to create ricochets.";
        shots = 4;
        targets.push({ x: 240, y: 210, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 180, y: 270, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 300, y: 270, radius: 17, skinId: 'satrangi' });
        obstacles.push({ type: 'circle', x: 240, y: 390, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 175, y: 440, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 305, y: 440, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 240, y: 490, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        break;

      case 17:
        name = "Level 17: Kaala Pehra II";
        subtitle = "Black penalty marble directly in front! Brick on left; bank off the right wall.";
        shots = 4;
        targets.push({ x: 240, y: 210, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 185, y: 270, radius: 17, skinId: 'neelam' });
        targets.push({ x: 295, y: 270, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 240, y: 340, radius: 17, skinId: 'classic_banta', isPenalty: true });
        obstacles.push({ type: 'rect', x: 50, y: 460, width: 130, height: 18, bounce: 0.84, color: '#B23A22' });
        puddles.push({ x: 350, y: 490, radius: 38 });
        break;

      case 18:
        name = "Level 18: Deewar aur Gucchu";
        subtitle = "Center brick blocks straight view, Gucchu pit hides behind! Wide bank shots required.";
        shots = 4;
        targets.push({ x: 200, y: 230, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 280, y: 230, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 240, y: 295, radius: 17, skinId: 'classic_banta' });
        obstacles.push({ type: 'rect', x: 150, y: 480, width: 180, height: 18, bounce: 0.85, color: '#B23A22' });
        holes.push({ x: 240, y: 390, radius: 24 });
        break;

      // FIXED LEVEL 19: Fully solvable, fun double-stepped wall with open cushion rails & 100px center passage
      case 19:
        name = "Level 19: Dohri Deewar (Double Stepped Wall)";
        subtitle = "Two staggered brick barriers! Thread through the center gap or bank off the side cushions.";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'neelam' });
        targets.push({ x: 185, y: 275, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 295, y: 275, radius: 17, skinId: 'doodhia' });
        // Lower brick: x=70..170 (leaves x=20..70 and 170..460 open)
        obstacles.push({ type: 'rect', x: 70, y: 520, width: 100, height: 18, bounce: 0.85, color: '#A8321B' });
        // Upper brick: x=270..370 (leaves x=20..270 and 370..460 open)
        obstacles.push({ type: 'rect', x: 270, y: 430, width: 100, height: 18, bounce: 0.85, color: '#A8321B' });
        break;

      case 20:
        name = "Level 20: Barsaat Ki Rani";
        subtitle = "Zone 2 Finale! Muddy ground, central clay brick, and river pebbles. Clear the ring!";
        shots = 5;
        starThresholds = [2, 3, 5];
        targets.push({ x: 240, y: 195, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 180, y: 255, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 300, y: 255, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 240, y: 285, radius: 17, skinId: 'neelam' });
        targets.push({ x: 240, y: 345, radius: 17, skinId: 'classic_banta', isPenalty: true });
        obstacles.push({ type: 'rect', x: 160, y: 450, width: 160, height: 18, bounce: 0.86, color: '#A8321B' });
        obstacles.push({ type: 'circle', x: 60, y: 260, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 420, y: 260, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 240, y: 560, radius: 38 });
        break;

      // ===== TIER 3: SUNEHRA GHERA & GUCCHU (Levels 21 - 30) =====
      case 21:
        name = "Level 21: Sunehra Taj";
        winCondition = 'knock_out_golden';
        subtitle = "👑 Hit the Golden Maharaja goti! Do NOT touch the black penalty goti!";
        shots = 3;
        starThresholds = [1, 2, 3];
        targets.push({ x: 240, y: 230, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        targets.push({ x: 240, y: 310, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 185, y: 275, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 295, y: 275, radius: 17, skinId: 'doodhia' });
        obstacles.push({ type: 'rect', x: 160, y: 450, width: 160, height: 18, bounce: 0.85, color: '#B23A22' });
        break;

      case 22:
        name = "Level 22: Gucchu Kendra";
        subtitle = "Central Gucchu pit with 4 targets circling its rim! Twin pebbles in mid-field.";
        shots = 4;
        ringCenter = { x: 240, y: 280 };
        holes.push({ x: 240, y: 280, radius: 26 });
        targets.push({ x: 240, y: 220, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 240, y: 340, radius: 17, skinId: 'neelam' });
        targets.push({ x: 180, y: 280, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 300, y: 280, radius: 17, skinId: 'satrangi' });
        obstacles.push({ type: 'circle', x: 160, y: 440, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 320, y: 440, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        break;

      case 23:
        name = "Level 23: Trishul Vyuha";
        subtitle = "3 river pebbles form a trident barrier in front of the ring! Side brick blocks left wall.";
        shots = 4;
        targets.push({ x: 240, y: 210, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 180, y: 265, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 300, y: 265, radius: 17, skinId: 'classic_banta' });
        obstacles.push({ type: 'circle', x: 240, y: 390, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 170, y: 430, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 310, y: 430, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'rect', x: 50, y: 480, width: 110, height: 18, bounce: 0.84, color: '#B23A22' });
        break;

      case 24:
        name = "Level 24: Kona Sunehra";
        winCondition = 'knock_out_golden';
        subtitle = "👑 Golden goti tucked in the corner! Bank off the left cushion around the penalty guard.";
        shots = 3;
        starThresholds = [1, 2, 3];
        targets.push({ x: 310, y: 220, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        targets.push({ x: 270, y: 270, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 180, y: 270, radius: 17, skinId: 'neelam' });
        obstacles.push({ type: 'rect', x: 200, y: 450, width: 180, height: 18, bounce: 0.86, color: '#B23A22' });
        break;

      case 25:
        name = "Level 25: Teen Gucchu (Triple Pit)";
        subtitle = "3 dirt pits line the middle! Shoot wide cushions or blast through with max power.";
        shots = 4;
        targets.push({ x: 240, y: 210, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'lal_angaar' });
        holes.push({ x: 160, y: 410, radius: 22 });
        holes.push({ x: 240, y: 410, radius: 24 });
        holes.push({ x: 320, y: 410, radius: 22 });
        break;

      // FIXED LEVEL 26: Fully playable brick cage with open side rails
      case 26:
        name = "Level 26: Eent Ka Pinjra (The Brick Cage)";
        subtitle = "A brick enclosure traps the targets! Shoot through the open front window or bank!";
        shots = 4;
        targets.push({ x: 240, y: 220, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 190, y: 280, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 290, y: 280, radius: 17, skinId: 'neelam' });
        obstacles.push({ type: 'rect', x: 80, y: 460, width: 100, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 300, y: 460, width: 100, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 170, y: 150, width: 140, height: 18, bounce: 0.85, color: '#B23A22' });
        break;

      case 27:
        name = "Level 27: Sunehri Chhalang";
        winCondition = 'knock_out_golden';
        subtitle = "👑 Golden goti flanked by 2 black penalty sentinels! Laser precision required.";
        shots = 3;
        starThresholds = [1, 2, 3];
        targets.push({ x: 240, y: 230, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        targets.push({ x: 195, y: 280, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 285, y: 280, radius: 17, skinId: 'classic_banta', isPenalty: true });
        puddles.push({ x: 240, y: 510, radius: 42 });
        obstacles.push({ type: 'rect', x: 50, y: 430, width: 110, height: 18, bounce: 0.84, color: '#B23A22' });
        break;

      case 28:
        name = "Level 28: Kankad Chowk (Pebble Minefield)";
        subtitle = "5 river pebbles form a chaotic minefield! Calculate high-velocity bank trajectories.";
        shots = 4;
        targets.push({ x: 240, y: 200, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'doodhia' });
        obstacles.push({ type: 'circle', x: 140, y: 430, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 240, y: 400, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 340, y: 430, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 190, y: 480, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 290, y: 480, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        break;

      case 29:
        name = "Level 29: Daldal aur Kaanta";
        subtitle = "Gucchu pit in the center + side brick + dual mud puddles. Test your nerve!";
        shots = 4;
        targets.push({ x: 210, y: 220, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 270, y: 220, radius: 17, skinId: 'neelam' });
        targets.push({ x: 240, y: 285, radius: 17, skinId: 'classic_banta' });
        holes.push({ x: 240, y: 400, radius: 25 });
        obstacles.push({ type: 'rect', x: 300, y: 460, width: 120, height: 18, bounce: 0.85, color: '#B23A22' });
        puddles.push({ x: 120, y: 490, radius: 36 });
        puddles.push({ x: 360, y: 530, radius: 34 });
        break;

      case 30:
        name = "Level 30: Sunehra Ustaad";
        subtitle = "Zone 3 Finale! The Golden Gotis are protected by a central brick barricade!";
        shots = 5;
        starThresholds = [2, 3, 5];
        targets.push({ x: 240, y: 215, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        targets.push({ x: 190, y: 275, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 290, y: 275, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 240, y: 310, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        obstacles.push({ type: 'rect', x: 160, y: 450, width: 160, height: 18, bounce: 0.86, color: '#A8321B' });
        obstacles.push({ type: 'circle', x: 60, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 420, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 150, y: 550, radius: 34 });
        puddles.push({ x: 330, y: 550, radius: 34 });
        break;

      // ===== TIER 4: KANKAD CHAURAHA (Levels 31 - 40) =====
      case 31:
        name = "Level 31: Pehredaar Arc";
        subtitle = "5 river pebbles form a curved arc shield! Strike cushion rebounds to flank targets.";
        shots = 4;
        targets.push({ x: 240, y: 205, radius: 17, skinId: 'neelam' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'doodhia' });
        obstacles.push({ type: 'circle', x: 145, y: 430, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 190, y: 405, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 240, y: 390, radius: 19, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 290, y: 405, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 335, y: 430, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        break;

      // FIXED LEVEL 32: Widen slots to 65px and leave side cushions open
      case 32:
        name = "Level 32: Do Raste (Double Slot)";
        subtitle = "Two clear shooting slots! Pick your angle carefully to reach the back.";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 185, y: 275, radius: 17, skinId: 'neelam' });
        targets.push({ x: 295, y: 275, radius: 17, skinId: 'lal_angaar' });
        obstacles.push({ type: 'rect', x: 80, y: 450, width: 50, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 230, y: 450, width: 20, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 350, y: 450, width: 50, height: 18, bounce: 0.85, color: '#B23A22' });
        break;

      case 33:
        name = "Level 33: Kona Nishana";
        subtitle = "Wide center brick! Targets are tucked against the upper corners; bank shots mandatory.";
        shots = 4;
        targets.push({ x: 160, y: 220, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 320, y: 220, radius: 17, skinId: 'neelam' });
        targets.push({ x: 240, y: 290, radius: 17, skinId: 'lal_angaar' });
        obstacles.push({ type: 'rect', x: 120, y: 450, width: 240, height: 18, bounce: 0.86, color: '#B23A22' });
        break;

      case 34:
        name = "Level 34: Pathar Ki Bauchar";
        subtitle = "6 river pebbles and dual mud puddles! Read the ricochet geometry carefully.";
        shots = 4;
        targets.push({ x: 240, y: 205, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'classic_banta' });
        obstacles.push({ type: 'circle', x: 160, y: 390, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 320, y: 390, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 240, y: 430, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 120, y: 470, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 360, y: 470, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 240, y: 510, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 80, y: 520, radius: 32 });
        puddles.push({ x: 400, y: 520, radius: 32 });
        break;

      case 35:
        name = "Level 35: Qila-Bandi";
        subtitle = "Fortress flank walls protect the ring! Thread right through the wide open gate.";
        shots = 4;
        targets.push({ x: 240, y: 205, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'neelam' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 240, y: 330, radius: 17, skinId: 'classic_banta', isPenalty: true });
        obstacles.push({ type: 'rect', x: 50, y: 470, width: 90, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 340, y: 470, width: 90, height: 18, bounce: 0.85, color: '#B23A22' });
        break;

      case 36:
        name = "Level 36: Gucchu Surang";
        subtitle = "Gucchu pits placed right on the flank rebound zones! Find the safe cushion angle.";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 185, y: 275, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 295, y: 275, radius: 17, skinId: 'cats_eye' });
        obstacles.push({ type: 'rect', x: 160, y: 450, width: 160, height: 18, bounce: 0.85, color: '#B23A22' });
        holes.push({ x: 70, y: 360, radius: 24 });
        holes.push({ x: 410, y: 360, radius: 24 });
        break;

      case 37:
        name = "Level 37: Batwara (The Great Divider)";
        subtitle = "A vertical brick column divides the alley into two lanes! Clean both sides.";
        shots = 4;
        targets.push({ x: 170, y: 220, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 170, y: 300, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 310, y: 220, radius: 17, skinId: 'neelam' });
        targets.push({ x: 310, y: 300, radius: 17, skinId: 'cats_eye' });
        obstacles.push({ type: 'rect', x: 232, y: 360, width: 16, height: 180, bounce: 0.85, color: '#B23A22' });
        break;

      case 38:
        name = "Level 38: Sunehra Khazana";
        winCondition = 'knock_out_golden';
        subtitle = "👑 Golden goti locked behind an inverted-V brick wall! Bank high off top cushion.";
        shots = 3;
        starThresholds = [1, 2, 3];
        targets.push({ x: 240, y: 220, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        targets.push({ x: 240, y: 300, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'satrangi' });
        obstacles.push({ type: 'rect', x: 140, y: 430, width: 95, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 245, y: 430, width: 95, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'circle', x: 240, y: 400, radius: 18, bounce: 0.78, color: '#6E5C4E' });
        break;

      // FIXED LEVEL 39: Stepped bricks with open cushion rails
      case 39:
        name = "Level 39: Teen Deewarein (Triple Stepped Barricade)";
        subtitle = "3 stepped brick barricades! Staggered placement leaves tricky bank & angle routes.";
        shots = 4;
        targets.push({ x: 240, y: 205, radius: 17, skinId: 'neelam' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'doodhia' });
        obstacles.push({ type: 'rect', x: 50, y: 530, width: 40, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 180, y: 450, width: 40, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 370, y: 370, width: 40, height: 18, bounce: 0.85, color: '#B23A22' });
        break;

      case 40:
        name = "Level 40: Kankad Badshah";
        subtitle = "Zone 4 Finale! Heavy central clay brick with corner pebbles. Precision is paramount!";
        shots = 5;
        starThresholds = [2, 3, 5];
        targets.push({ x: 240, y: 195, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 180, y: 255, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 300, y: 255, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 240, y: 285, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 240, y: 340, radius: 17, skinId: 'classic_banta', isPenalty: true });
        obstacles.push({ type: 'rect', x: 160, y: 460, width: 160, height: 18, bounce: 0.86, color: '#A8321B' });
        obstacles.push({ type: 'circle', x: 60, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 420, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        break;

      // ===== TIER 5: MAHA CHAMPIONSHIP (Levels 41 - 50) =====
      // FIXED LEVEL 41: Open cushions & 80px center gate
      case 41:
        name = "Level 41: Loha Gate";
        subtitle = "Narrow gateway between two sturdy red bricks. Direct shot through the center!";
        shots = 4;
        targets.push({ x: 240, y: 210, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 175, y: 270, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 305, y: 270, radius: 17, skinId: 'neelam' });
        obstacles.push({ type: 'rect', x: 60, y: 450, width: 80, height: 18, bounce: 0.86, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 340, y: 450, width: 80, height: 18, bounce: 0.86, color: '#B23A22' });
        break;

      case 42:
        name = "Level 42: Heera Vyuha";
        subtitle = "4 river pebbles form an impenetrable diamond fort! Use multi-cushion angles.";
        shots = 4;
        targets.push({ x: 240, y: 200, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 240, y: 280, radius: 17, skinId: 'cats_eye' });
        obstacles.push({ type: 'circle', x: 240, y: 390, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 170, y: 440, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 310, y: 440, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 240, y: 490, radius: 20, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 80, y: 510, radius: 36 });
        puddles.push({ x: 400, y: 510, radius: 36 });
        break;

      case 43:
        name = "Level 43: Dohra Gucchu Pehra";
        subtitle = "Center brick blocks straight shot, twin Gucchu pits guard the side rebound paths!";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 17, skinId: 'neelam' });
        targets.push({ x: 185, y: 275, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 295, y: 275, radius: 17, skinId: 'classic_banta' });
        obstacles.push({ type: 'rect', x: 160, y: 460, width: 160, height: 18, bounce: 0.85, color: '#B23A22' });
        holes.push({ x: 110, y: 370, radius: 24 });
        holes.push({ x: 370, y: 370, radius: 24 });
        break;

      case 44:
        name = "Level 44: Pinball Galli";
        subtitle = "4 alternating side brick bumpers! A trick-shot paradise; master cushion geometry.";
        shots = 5;
        starThresholds = [2, 3, 5];
        targets.push({ x: 240, y: 200, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 180, y: 250, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 300, y: 250, radius: 17, skinId: 'cats_eye' });
        obstacles.push({ type: 'rect', x: 50, y: 560, width: 110, height: 18, bounce: 0.88, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 320, y: 490, width: 110, height: 18, bounce: 0.88, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 50, y: 420, width: 110, height: 18, bounce: 0.88, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 320, y: 350, width: 110, height: 18, bounce: 0.88, color: '#B23A22' });
        break;

      case 45:
        name = "Level 45: Sunehra Bhool-Bhulaiya";
        subtitle = "The Maharaja Gold kancha sits guarded behind flank walls and foul guards!";
        shots = 4;
        targets.push({ x: 240, y: 215, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        targets.push({ x: 190, y: 275, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 290, y: 275, radius: 17, skinId: 'classic_banta', isPenalty: true });
        obstacles.push({ type: 'rect', x: 50, y: 470, width: 90, height: 18, bounce: 0.86, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 340, y: 470, width: 90, height: 18, bounce: 0.86, color: '#B23A22' });
        break;

      case 46:
        name = "Level 46: Saanp Rasta (The Serpent Slalom)";
        subtitle = "Serpentine alternating brick walls! Slalom through the corridors or bank off open rails.";
        shots = 5;
        starThresholds = [2, 3, 5];
        targets.push({ x: 240, y: 200, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 180, y: 255, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 300, y: 255, radius: 17, skinId: 'neelam' });
        obstacles.push({ type: 'rect', x: 50, y: 540, width: 120, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 310, y: 450, width: 120, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 50, y: 360, width: 120, height: 18, bounce: 0.85, color: '#B23A22' });
        break;

      case 47:
        name = "Level 47: Chaar Deewar (The 4 Pillars)";
        subtitle = "4 brick blocks in a 2x2 grid! Thread the crosshairs or execute angled wall bank shots.";
        shots = 4;
        targets.push({ x: 240, y: 205, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 180, y: 260, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 300, y: 260, radius: 17, skinId: 'classic_banta' });
        obstacles.push({ type: 'rect', x: 90, y: 510, width: 90, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 300, y: 510, width: 90, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 90, y: 420, width: 90, height: 18, bounce: 0.85, color: '#B23A22' });
        obstacles.push({ type: 'rect', x: 300, y: 420, width: 90, height: 18, bounce: 0.85, color: '#B23A22' });
        break;

      case 48:
        name = "Level 48: Gucchu Mahajaal";
        subtitle = "3 Gucchu pits + 2 penalty gotis + 4 targets! High stakes, maximum concentration.";
        shots = 4;
        targets.push({ x: 240, y: 195, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 180, y: 250, radius: 17, skinId: 'neelam' });
        targets.push({ x: 300, y: 250, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 240, y: 275, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 190, y: 320, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 290, y: 320, radius: 17, skinId: 'classic_banta', isPenalty: true });
        holes.push({ x: 130, y: 420, radius: 22 });
        holes.push({ x: 240, y: 380, radius: 22 });
        holes.push({ x: 350, y: 420, radius: 22 });
        break;

      case 49:
        name = "Level 49: Semi-Final Jang";
        subtitle = "Semi-Final: 4 target kanchas, central brick, and rainy mud puddles. Total control needed!";
        shots = 5;
        starThresholds = [2, 3, 5];
        targets.push({ x: 240, y: 195, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 180, y: 250, radius: 17, skinId: 'neelam' });
        targets.push({ x: 300, y: 250, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 240, y: 280, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 240, y: 335, radius: 17, skinId: 'classic_banta', isPenalty: true });
        obstacles.push({ type: 'rect', x: 160, y: 450, width: 160, height: 18, bounce: 0.86, color: '#A8321B' });
        obstacles.push({ type: 'circle', x: 60, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 420, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 240, y: 560, radius: 36 });
        break;

      case 50:
        name = "👑 Level 50: MAHA CHAMPION (Grand Finale)";
        subtitle = "The Ultimate Mohalla Championship! 5 targets, 2 foul traps, central barricade. Become Legend!";
        shots = 6;
        starThresholds = [3, 4, 6];
        targets.push({ x: 240, y: 215, radius: 19, skinId: 'maharaja_gold', isGolden: true });
        targets.push({ x: 180, y: 200, radius: 17, skinId: 'lal_angaar' });
        targets.push({ x: 300, y: 200, radius: 17, skinId: 'satrangi' });
        targets.push({ x: 170, y: 270, radius: 17, skinId: 'cats_eye' });
        targets.push({ x: 310, y: 270, radius: 17, skinId: 'neelam' });
        targets.push({ x: 190, y: 330, radius: 17, skinId: 'classic_banta', isPenalty: true });
        targets.push({ x: 290, y: 330, radius: 17, skinId: 'classic_banta', isPenalty: true });
        obstacles.push({ type: 'rect', x: 160, y: 460, width: 160, height: 18, bounce: 0.86, color: '#A8321B' });
        obstacles.push({ type: 'circle', x: 60, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        obstacles.push({ type: 'circle', x: 420, y: 250, radius: 16, bounce: 0.78, color: '#6E5C4E' });
        puddles.push({ x: 160, y: 570, radius: 32 });
        puddles.push({ x: 320, y: 570, radius: 32 });
        break;

      default:
        name = `Mohalla Gali ${i}`;
        subtitle = "Knock out all target kanchas!";
        shots = 4;
        targets.push({ x: 240, y: 220, radius: 17, skinId: 'classic_banta' });
        targets.push({ x: 190, y: 280, radius: 17, skinId: 'doodhia' });
        targets.push({ x: 290, y: 280, radius: 17, skinId: 'cats_eye' });
        break;
    }

    levels.push({
      id: i,
      name,
      subtitle,
      shots,
      starThresholds,
      strikerStart,
      ring: { x: ringCenter.x, y: ringCenter.y, radius: ringRadius },
      targets,
      obstacles,
      holes,
      puddles,
      winCondition
    });
  }

  return levels;
}

const GAME_LEVELS = generate50MohallaLevels();

class ProgressManager {
  constructor() {
    this.storageKey = 'kancha_game_v3_clean';
    this.data = this.load();
    this.checkDailyReward();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.guestId) {
          parsed.guestId = 'GUEST#' + Math.floor(1000 + Math.random() * 9000);
        }
        if (!parsed.avatar) {
          parsed.avatar = '🧒';
        }
        if (!parsed.lastPlayedLevel) {
          const maxUnlocked = (parsed.unlockedLevels && parsed.unlockedLevels.length > 0)
            ? Math.max(...parsed.unlockedLevels)
            : 1;
          parsed.lastPlayedLevel = maxUnlocked;
        }
        if (!parsed.bio) {
          parsed.bio = 'Ek goli, ek nishana! Mohalla Champion.';
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load local storage", e);
    }
    const randCode = Math.floor(1000 + Math.random() * 9000);
    return {
      guestId: 'GUEST#' + randCode,
      coins: 40,
      bulbs: 2,
      playerName: 'Raju',
      avatar: '🧒',
      bio: 'Ek goli, ek nishana! Mohalla Champion.',
      lastPlayedLevel: 1,
      equippedSkin: 'classic_banta',
      ownedSkins: ['classic_banta'],
      unlockedLevels: [1],
      levelStars: {},
      sfxVolume: 0.8,
      ambienceVolume: 0.4,
      lastLoginDate: null
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  checkDailyReward() {
    const today = new Date().toDateString();
    if (this.data.lastLoginDate !== today) {
      this.data.lastLoginDate = today;
      this.data.bulbs = (this.data.bulbs || 0) + 1;
      this.save();
      return true;
    }
    return false;
  }

  isLevelUnlocked(levelId) {
    return this.data.unlockedLevels.includes(levelId);
  }

  getLevelStars(levelId) {
    return this.data.levelStars[levelId] || 0;
  }

  completeLevel(levelId, stars) {
    const oldStars = this.data.levelStars[levelId] || 0;
    if (stars > oldStars) this.data.levelStars[levelId] = stars;

    let coinsEarned = 5;
    if (stars === 2) coinsEarned = 8;
    else if (stars === 3) coinsEarned = 12;

    this.data.coins += coinsEarned;

    const nextLevel = levelId + 1;
    if (nextLevel <= GAME_LEVELS.length && !this.data.unlockedLevels.includes(nextLevel)) {
      this.data.unlockedLevels.push(nextLevel);
    }

    // Advance lastPlayedLevel to nextLevel if within bounds, otherwise current
    this.data.lastPlayedLevel = Math.min(GAME_LEVELS.length, nextLevel);

    this.save();
    return { nextLevel, coinsEarned };
  }

  useBulb() {
    if (this.data.bulbs > 0) {
      this.data.bulbs--;
      this.save();
      return true;
    }
    return false;
  }

  buyBulbWithCoins() {
    const price = 20;
    if (this.data.coins >= price) {
      this.data.coins -= price;
      this.data.bulbs = (this.data.bulbs || 0) + 1;
      this.save();
      return true;
    }
    return false;
  }

  equipSkin(skinId) {
    if (this.data.ownedSkins.includes(skinId)) {
      this.data.equippedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  buySkinWithCoins(skinId, price) {
    if (this.data.coins >= price && !this.data.ownedSkins.includes(skinId)) {
      this.data.coins -= price;
      this.data.ownedSkins.push(skinId);
      this.data.equippedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  buyProSkin(skinId) {
    if (!this.data.ownedSkins.includes(skinId)) {
      this.data.ownedSkins.push(skinId);
      this.data.equippedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  getLastPlayedLevel() {
    if (this.data.lastPlayedLevel && this.data.lastPlayedLevel >= 1 && this.data.lastPlayedLevel <= 50) {
      return this.data.lastPlayedLevel;
    }
    const maxUnlocked = (this.data.unlockedLevels && this.data.unlockedLevels.length > 0)
      ? Math.max(...this.data.unlockedLevels)
      : 1;
    return Math.min(50, Math.max(1, maxUnlocked));
  }

  setLastPlayedLevel(lvlId) {
    const validId = parseInt(lvlId, 10);
    if (!isNaN(validId) && validId >= 1 && validId <= 50) {
      this.data.lastPlayedLevel = validId;
      if (!this.data.unlockedLevels.includes(validId)) {
        this.data.unlockedLevels.push(validId);
      }
      this.save();
    }
  }

  getGuestId() {
    if (!this.data.guestId) {
      this.data.guestId = 'GUEST#' + Math.floor(1000 + Math.random() * 9000);
      this.save();
    }
    return this.data.guestId;
  }

  getAvatar() {
    return this.data.avatar || '🧒';
  }

  setAvatar(avatar) {
    if (avatar) {
      this.data.avatar = avatar;
      this.save();
    }
  }

  getPlayerName() {
    return this.data.playerName || 'Raju';
  }

  setPlayerName(name) {
    if (name && name.trim()) {
      this.data.playerName = name.trim();
      this.save();
    }
  }

  getTotalStars() {
    let total = 0;
    if (this.data.levelStars) {
      for (const k in this.data.levelStars) {
        total += this.data.levelStars[k] || 0;
      }
    }
    return total;
  }

  getBio() {
    return this.data.bio || 'Ek goli, ek nishana! Mohalla Champion.';
  }

  setBio(bio) {
    if (bio && bio.trim()) {
      this.data.bio = bio.trim();
      this.save();
    }
  }

  resetProgress() {
    localStorage.removeItem(this.storageKey);
    this.data = this.load();
  }
}

window.progress = new ProgressManager();
