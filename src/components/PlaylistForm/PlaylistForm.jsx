import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import styles from "./PlaylistForm.module.css";

const PlaylistForm = ({
  prompt,
  onPromptChange,
  loading,
  onCreatePlaylist,
  playlistLink,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [runConfetti, setRunConfetti] = useState(false);

  useEffect(() => {
    if (playlistLink) {
      setShowConfetti(true);
      setRunConfetti(true);
      setTimeout(() => setRunConfetti(false), 2802); // Stop generating new pieces after ~2.8s
      setTimeout(() => setShowConfetti(false), 3000); // Remove confetti component after ~3s
    }
  }, [playlistLink]);

  return (
    <div className={styles.container}>
      {/* Confetti effect */}
      {showConfetti && (
        <Confetti
          run={runConfetti}
          recycle={false}
          friction={0.99} // Standard friction
          gravity={0.1} // Standard gravity
          numberOfPieces={200} // Initial number of pieces
        />
      )}

      {/* Main title */}
      <h3 className={styles.title}>Create Your Perfect Playlist</h3>

      {/* Subtitle / Helper text */}
      <p className={styles.subtitle}>
        Tell us what you’d like to listen to: your mood, genre, or any occasion.
        The more details you provide, the better your playlist will be 🎧
      </p>

      <div className={styles.data_container}>
        {/* Prompt textarea */}
        <textarea
          type="text"
          placeholder="For example: I want an energetic morning run playlist with a pop twist..."
          value={prompt}
          onChange={onPromptChange}
          className={styles.promptInput}
        />

        {/* Create playlist button with spinner when loading */}
        <button
          onClick={onCreatePlaylist}
          disabled={loading}
          className={styles.createPlaylistButton}
        >
          {loading ? <div className={styles.spinner}></div> : "Create Playlist 🚀"}
        </button>

        {/* If a playlist has been created, show the link */}
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
