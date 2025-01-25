const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

const SCOPES = ["playlist-modify-private", "playlist-modify-public"];
const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(" "))}`;

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



export const createPlaylist = async (token, userId, name, description, songs) => {
  // Create a new playlist
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

  // Add songs to the playlist
  for (const { title, artist } of songs) {
    // Try advanced query syntax: track:TITLE artist:ARTIST
    const query = `track:${title} artist:${artist}`;
    console.log("[createPlaylist] Searching for query:", query);

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const searchData = await searchResponse.json();
    console.log("[createPlaylist] searchData for:", query, searchData);

    const track = searchData.tracks?.items?.[0];
    if (track) {
      console.log("[createPlaylist] Found track:", track.name, "by", track.artists.map(a => a.name));
      await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [track.uri] }),
      });
    } else {
      console.warn("[createPlaylist] No track found for:", query);
    }
  }

  return playlist.external_urls.spotify;
};
