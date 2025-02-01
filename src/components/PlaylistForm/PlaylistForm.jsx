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
      {/* Main title */}
      <h3 className={styles.title}>Create Your Perfect Playlist</h3>
      
      {/* Subtitle / Helper text */}
      <p className={styles.subtitle}>
        Tell us what you’d like to listen to: your mood, genre, or any occasion. 
        The more details you provide, the better your playlist will be!
      </p>

      <div className={styles.data_container}>
        {/* Prompt textarea */}
        <textarea
          type="text"
          placeholder="For example: I'd like an energetic morning run playlist with a pop twist..."
          value={prompt}
          onChange={onPromptChange}
          className={styles.promptInput}
        />

        {/* Create playlist button with loading state */}
        <button
          onClick={onCreatePlaylist}
          disabled={loading}
          className={styles.createPlaylistButton}
        >
          {loading ? "Creating Playlist..." : "Create Playlist 🎶"}
        </button>

        {/* Display the playlist link once created */}
        {playlistLink && (
          <div className={styles.playlistLinkContainer}>
            <p className={styles.successMessage}>Your playlist is ready!</p>
            <a
              href={playlistLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.playlistLink}
            >
              View your playlist
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistForm;
