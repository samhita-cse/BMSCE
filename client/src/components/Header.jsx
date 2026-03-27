import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";
import { useTheme } from "../context/ThemeContext";
import { SpotifyMiniPlayer } from "./SpotifyMiniPlayer";
import { SpotifyMockModal } from "./SpotifyMockModal";
import { ThemePickerModal } from "./ThemePickerModal";

export function Header() {
  const { user, logout } = useAuth();
  const { currentTheme, hasPremium } = useTheme();
  const { currentPlaylist, hasSpotifyAuth, profile } = useSpotify();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-copy">
          <p className="eyebrow">StudyFlow</p>
          <h1>Student Dashboard</h1>
          <p className="header-subtitle">
            Pomodoro, explanations, quizzes, flashcards, and weak-area tracking.
          </p>
        </div>

        <div className="header-actions">
          <button className="ghost-button" onClick={() => setIsSpotifyModalOpen(true)} type="button">
            {hasSpotifyAuth ? `Spotify: ${currentPlaylist?.name || profile?.displayName}` : "Connect Spotify"}
          </button>
          <button className="ghost-button" onClick={() => setIsThemeModalOpen(true)} type="button">
            {hasPremium ? `Theme: ${currentTheme.name}` : "Themes"}
          </button>
          <div className="user-pill">
            <img alt={user.displayName || "User"} src={user.photoURL} />
            <span>{user.displayName}</span>
          </div>
          <button className="ghost-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      <SpotifyMiniPlayer onOpenSettings={() => setIsSpotifyModalOpen(true)} />
      <SpotifyMockModal open={isSpotifyModalOpen} onClose={() => setIsSpotifyModalOpen(false)} />
      <ThemePickerModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </>
  );
}
