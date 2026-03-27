import { useSpotify } from "../context/SpotifyContext";

export function SpotifyMiniPlayer({ onOpenSettings }) {
  const { currentTrack, hasSpotifyAuth, isPlaying, nextTrack, previousTrack, profile, setIsPlaying } = useSpotify();

  if (!hasSpotifyAuth || !currentTrack) {
    return null;
  }

  return (
    <aside className="spotify-mini-player">
      <div className="spotify-mini-copy">
        <span>Spotify</span>
        <strong>{currentTrack.title}</strong>
        <small>
          {currentTrack.artist} · {profile?.displayName}
        </small>
      </div>

      <div className="spotify-mini-actions">
        <button className="ghost-button" onClick={previousTrack} type="button">
          Prev
        </button>
        <button className="primary-button" onClick={() => setIsPlaying((current) => !current)} type="button">
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button className="ghost-button" onClick={nextTrack} type="button">
          Next
        </button>
        <button className="ghost-button" onClick={onOpenSettings} type="button">
          Manage
        </button>
      </div>
    </aside>
  );
}
