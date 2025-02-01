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
    window.location.hash = ""; // Clean the hash
    return token;
  }
  return null;
};

/**
 * Creates a new playlist for the given user, then searches for each song
 * and adds it to that playlist (if found).
 */
export const createPlaylist = async (token, userId, name, description, songs) => {
  // 1) Create a new playlist
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

  // 2) Helper function to search for a single track
  async function findTrack(title, artist) {
    // -- FIRST ATTEMPT: SIMPLE SEARCH (title + artist) --
    let query = `${title} ${artist}`;
    let searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
    let response = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    let data = await response.json();
    let track = data.tracks?.items?.[0];

    if (!track) {
      console.warn(`[createPlaylist] No track found for SIMPLE query: "${query}"`);

      // -- SECOND ATTEMPT (OPTIONAL): ADVANCED SYNTAX --
      const advancedQuery = `track:${title} artist:${artist}`;
      console.log("[createPlaylist] Trying advanced query:", advancedQuery);

      searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        advancedQuery
      )}&type=track&limit=1`;

      response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      data = await response.json();
      track = data.tracks?.items?.[0];

      if (!track) {
        console.warn(
          `[createPlaylist] No track found for ADVANCED query: "${advancedQuery}"`
        );
      }
    }

    return track;
  }

  // 3) Search each song and add to playlist
  for (const { title, artist } of songs) {
    console.log("[createPlaylist] Searching for:", { title, artist });
    const track = await findTrack(title, artist);

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
