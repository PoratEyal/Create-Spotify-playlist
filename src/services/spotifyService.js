// spotifyService.js

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

const SCOPES = [
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-private"
];

const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=${encodeURIComponent(SCOPES.join(" "))}`;

export const loginToSpotify = () => {
  window.location.href = AUTH_URL;
};

export const getSpotifyToken = () => {
  const hash = window.location.hash;
  if (hash) {
    const token = new URLSearchParams(hash.substring(1)).get("access_token");
    window.location.hash = ""; // נקה את ההאש
    return token;
  }
  return null;
};

/**
 * פונקציה להשוואת מחרוזות על בסיס Levenshtein Distance.
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // החלפה
          matrix[i][j - 1] + 1,     // הוספה
          matrix[i - 1][j] + 1      // מחיקה
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * מחשב את הדמיון בין שתי מחרוזות (ערך בין 0 ל-1, כאשר 1 הוא זהה).
 */
function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const distance = levenshteinDistance(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

/**
 * מנקה מחרוזת – מסיר סימנים לא רצויים כגון סימני שאלה, סימני קריאה וכדומה.
 */
function cleanString(str) {
  // ניתן להוסיף כאן עוד תווים להסרה במידת הצורך
  return str.replace(/[?!]/g, "").trim();
}

/**
 * מחפש שיר ב־Spotify לפי שם השיר והאמן.
 * מבצע שני סוגי חיפושים – שאילתה מתקדמת עם מרכאות, ואם לא מתקבלת תוצאה מספקת – שאילתה חלופית פשוטה.
 * במקום limit=1, אנו מבקשים עד 5 תוצאות ובוחרים את המועמד עם ציון התאמה גבוה.
 */
async function findTrack(token, title, artist) {
  const cleanedTitle = cleanString(title);
  const cleanedArtist = cleanString(artist);

  // מערך שאילתות: קודם מתקדמת עם מרכאות, אחר כך שאילתה פשוטה (fallback)
  const queries = [
    `track:"${cleanedTitle}" artist:"${cleanedArtist}"`,
    `${cleanedTitle} ${cleanedArtist}`
  ];

  let bestCandidate = null;
  let bestScore = 0;
  // נסו כל שאילתה עד למציאת מועמד מתאים
  for (const query of queries) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=5&market=US`;

    const response = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    const candidates = data.tracks?.items || [];

    for (const candidate of candidates) {
      const titleSim = similarity(cleanedTitle, candidate.name);
      const candidateArtists = candidate.artists.map(a => a.name).join(" ");
      const artistSim = similarity(cleanedArtist, candidateArtists);
      const score = (titleSim + artistSim) / 2; // ממוצע בין ההתאמות

      if (score > bestScore && score >= 0.5) { // סף מינימלי 0.5
        bestScore = score;
        bestCandidate = candidate;
      }
    }
    // אם מצאנו מועמד עם ציון טוב, נוכל לצאת מהלולאה
    if (bestCandidate) break;
  }

  if (!bestCandidate) {
    console.warn(`[findTrack] No matching track found for queries: ${queries.join(" | ")}`);
  }
  return bestCandidate;
}

/**
 * יוצר פלייליסט חדש עבור המשתמש, מחפש כל שיר מ־GPT ומוסיף אותו לפלייליסט (אם נמצא).
 */
export const createPlaylist = async (token, userId, name, description, songs) => {
  // 1) יצירת פלייליסט חדש
  const createPlaylistResponse = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description, public: false }),
    }
  );

  const playlist = await createPlaylistResponse.json();
  console.log("[createPlaylist] Created playlist:", playlist);

  // 2) חיפוש והוספת כל שיר לפלייליסט
  for (const { title, artist } of songs) {
    console.log("[createPlaylist] Searching for:", { title, artist });
    const track = await findTrack(token, title, artist);

    if (track) {
      console.log(
        "[createPlaylist] Found track:",
        track.name,
        "by",
        track.artists.map((a) => a.name)
      );

      await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [track.uri] }),
      });
    } else {
      console.warn("[createPlaylist] No track found for:", title, artist);
    }
  }

  return playlist.external_urls.spotify;
};
