import { useSpotify } from "../context/SpotifyContext";

export function SpotifyMockModal({ open, onClose }) {
  const {
    connectSpotify,
    currentTrack,
    disconnectSpotify,
    error,
    hasSpotifyAuth,
    isConfigured,
    isPlaying,
    nextTrack,
    playlists,
    previousTrack,
    profile,
    selectPlaylist,
    selectedPlaylistId,
    selectedTrackId,
    selectTrack,
    setIsPlaying,
    tracks
  } = useSpotify();

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="theme-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="theme-modal-header">
          <div>
            <h2>Spotify</h2>
            <p>Connect a real Spotify account, switch playlists, and pick tracks from your own library.</p>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="premium-banner spotify-banner">
          <strong>
            {hasSpotifyAuth ? `Connected as ${profile?.displayName || "Spotify user"}` : "Spotify not connected"}
          </strong>
          <span>
            {hasSpotifyAuth
              ? profile?.email || "Your playlists and profile are loaded from Spotify."
              : "This uses Spotify's real account chooser/login page with browser-safe PKCE auth."}
          </span>
        </div>

        {!isConfigured ? (
          <div className="payment-card">
            <h3>Spotify setup needed</h3>
            <p>Add `VITE_SPOTIFY_CLIENT_ID` to the BMS frontend `.env` file and make sure your Spotify redirect URI is `http://127.0.0.1:5173/callback`.</p>
          </div>
        ) : null}

        {error ? (
          <p className="status-message error">{error}</p>
        ) : null}

        <div className="payment-card spotify-card">
          <div className="spotify-actions">
            <button className="primary-button" onClick={connectSpotify} type="button">
              {hasSpotifyAuth ? "Switch Spotify account" : "Connect Spotify"}
            </button>
            <button className="ghost-button" disabled={!hasSpotifyAuth} onClick={() => setIsPlaying((current) => !current)} type="button">
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button className="ghost-button" disabled={!hasSpotifyAuth} onClick={previousTrack} type="button">
              Previous track
            </button>
            <button className="ghost-button" disabled={!hasSpotifyAuth} onClick={nextTrack} type="button">
              Next track
            </button>
            <button className="ghost-button" disabled={!hasSpotifyAuth} onClick={disconnectSpotify} type="button">
              Disconnect
            </button>
          </div>

          <div className="spotify-grid">
            <label className="field-label">
              Playlist
              <select className="text-input" disabled={!hasSpotifyAuth} value={selectedPlaylistId} onChange={(event) => selectPlaylist(event.target.value)}>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Track
              <select className="text-input" disabled={!hasSpotifyAuth} value={selectedTrackId} onChange={(event) => selectTrack(event.target.value)}>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title} · {track.artist}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="payment-summary">
            <span>Status</span>
            <strong>
              {hasSpotifyAuth && currentTrack
                ? `${isPlaying ? "Playing" : "Ready"}: ${currentTrack.title} · ${currentTrack.artist}`
                : "Waiting for Spotify login"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
