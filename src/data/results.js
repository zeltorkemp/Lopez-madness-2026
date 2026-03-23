// ============================================================
// LOPEZ MADNESS 2026 — LIVE RESULTS
// Updated: March 23, 2026 — Round of 32 complete, Sweet 16 set
// ============================================================

export const KNOWN_RESULTS = {

  // ── FIRST ROUND (32 games) ──────────────────────────────
  firstRound: [
    // EAST
    'Duke',          // 1. (1) Duke 71, (16) Siena 65
    'TCU',           // 2. (9) TCU 66, (8) Ohio State 64 🚨 UPSET
    "St. John's",    // 3. (5) St. John's def. Northern Iowa
    'Kansas',        // 4. (4) Kansas 68, (13) Cal Baptist 60
    'Louisville',    // 5. (6) Louisville 83, (11) South Florida 79
    'Michigan State',// 6. (3) Michigan State 92, (14) N. Dakota St. 67
    'UCLA',          // 7. (7) UCLA def. UCF
    'UConn',         // 8. (2) UConn def. Furman
    // WEST
    'Arizona',       // 9.  (1) Arizona def. Long Island
    'Utah State',    // 10. (9) Utah State def. (8) Villanova 🚨 UPSET
    'High Point',    // 11. (12) High Point 83, (5) Wisconsin 82 🚨 UPSET
    'Arkansas',      // 12. (4) Arkansas 97, (13) Hawai'i 78
    'Texas',         // 13. (11) Texas 79, (6) BYU 71 🚨 UPSET
    'Gonzaga',       // 14. (3) Gonzaga 73, (14) Kennesaw St. 64
    'Missouri',      // 15. (10) Missouri def. (7) Miami FL 🚨 UPSET
    'Purdue',        // 16. (2) Purdue def. Queens NC
    // MIDWEST
    'Michigan',      // 17. (1) Michigan 101, (16) Howard 80
    'Saint Louis',   // 18. (9) Saint Louis 102, (8) Georgia 77 🚨 UPSET
    'Texas Tech',    // 19. (5) Texas Tech def. Akron
    'Alabama',       // 20. (4) Alabama def. Hofstra
    'Tennessee',     // 21. (6) Tennessee 78, (11) Miami OH 56
    'Virginia',      // 22. (3) Virginia def. Wright State
    'Kentucky',      // 23. (7) Kentucky def. Santa Clara (OT)
    'Iowa State',    // 24. (2) Iowa State def. Tennessee St.
    // SOUTH
    'Florida',       // 25. (1) Florida def. Lehigh
    'Iowa',          // 26. (9) Iowa def. (8) Clemson 🚨 UPSET
    'Vanderbilt',    // 27. (5) Vanderbilt 78, (12) McNeese 68
    'Nebraska',      // 28. (4) Nebraska 76, (13) Troy 47
    'VCU',           // 29. (11) VCU 82, (6) UNC 78 OT 🚨 UPSET
    'Illinois',      // 30. (3) Illinois 105, (14) Penn 70
    'Texas A&M',     // 31. (10) Texas A&M 63, (7) Saint Mary's 50 🚨 UPSET
    'Houston',       // 32. (2) Houston 78, (15) Idaho 47
  ],

  // ── SECOND ROUND / ROUND OF 32 (16 games) ──────────────
  // Results map to Sweet 16 teams
  secondRound: [
    // EAST
    'Duke',          // Duke 81, TCU 58
    'Michigan State',// Michigan State 77, Louisville 69
    "St. John's",    // St. John's 67, Kansas 65 (buzzer beater!) 🚨 UPSET
    'UConn',         // UConn 73, UCLA 57
    // WEST
    'Arizona',       // Arizona def. Utah State
    'Arkansas',      // Arkansas 94, High Point 88
    'Texas',         // Texas 74, Gonzaga 68 🚨 UPSET
    'Purdue',        // Purdue 79, Missouri 69
    // MIDWEST
    'Michigan',      // Michigan 95, Saint Louis 72
    'Alabama',       // Alabama def. Texas Tech (routed)
    'Tennessee',     // Tennessee 79, Virginia 72
    'Iowa State',    // Iowa State def. Kentucky
    // SOUTH
    'Iowa',          // Iowa 73, Florida 72 (last-second 3!) 🚨 UPSET — Florida ELIMINATED
    'Nebraska',      // Nebraska 74, Vanderbilt 72
    'Illinois',      // Illinois 76, VCU 55
    'Houston',       // Houston 88, Texas A&M 57
  ],

  // ── SWEET 16 (not yet played) ──────────────────────────
  sweet16: new Array(8).fill(null),
  eliteEight: new Array(4).fill(null),
  finalFour: new Array(2).fill(null),
  champion: null,
}
