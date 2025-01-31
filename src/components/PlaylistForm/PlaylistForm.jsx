// src/components/PlaylistForm/PlaylistForm.jsx
import React from "react";
import styles from "./PlaylistForm.module.css";

const PlaylistForm = ({
  prompt,
  onPromptChange,
  loading,
  onCreatePlaylist,
  playlistLink,
}) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Create your own playlist</h3>

      <div className={styles.data_container}>
        <textarea
          type="text"
          placeholder="Describe your playlist..."
          value={prompt}
          onChange={onPromptChange}
          className={styles.promptInput}
        />
        <button
          onClick={onCreatePlaylist}
          disabled={loading}
          className={styles.spotifyLoginButton}
        >
          {loading ? "Creating..." : "Create Playlist 🎶"}
        </button>

        {playlistLink && (
          <div className={styles.playlistLink}>
            <a
              href={playlistLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.playlistLink}
            >
              View Playlist
            </a>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default PlaylistForm;
