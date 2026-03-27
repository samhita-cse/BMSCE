import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SpotifyContext = createContext(null);

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
const DEFAULT_REDIRECT_URI = `${window.location.origin}/callback`;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || DEFAULT_REDIRECT_URI;
const SCOPES = ["user-read-email", "user-read-private", "playlist-read-private", "playlist-read-collaborative"];
const STORAGE_KEYS = {
  accessToken: "studyflow-spotify-access-token",
  refreshToken: "studyflow-spotify-refresh-token",
  expiresAt: "studyflow-spotify-expires-at",
  codeVerifier: "studyflow-spotify-code-verifier",
  state: "studyflow-spotify-state",
  handledCode: "studyflow-spotify-handled-code"
};

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomString(length = 64) {
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (value) => (value % 36).toString(36)).join("");
}

async function createPkce() {
  const codeVerifier = randomString(96);
  const hashed = await sha256(codeVerifier);
  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(hashed)
  };
}

async function parseErrorResponse(response, fallbackMessage) {
  const rawText = await response.text();

  try {
    const parsed = JSON.parse(rawText);
    const message = parsed.error_description || parsed.error?.message || parsed.error || parsed.message;
    return `${fallbackMessage} (${response.status})${message ? `: ${message}` : ""}`;
  } catch {
    return `${fallbackMessage} (${response.status})${rawText ? `: ${rawText}` : ""}`;
  }
}

async function requestToken(body) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(body)
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, "Spotify token request failed"));
  }

  return response.json();
}

function storeTokens(tokenPayload) {
  const expiresAt = Date.now() + tokenPayload.expires_in * 1000;
  localStorage.setItem(STORAGE_KEYS.accessToken, tokenPayload.access_token);
  localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));

  if (tokenPayload.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokenPayload.refresh_token);
  }

  return {
    accessToken: tokenPayload.access_token,
    expiresAt,
    refreshToken: tokenPayload.refresh_token || localStorage.getItem(STORAGE_KEYS.refreshToken) || ""
  };
}

async function spotifyFetch(accessToken, path) {
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, `Spotify request failed for ${path}`));
  }

  return response.json();
}

function clearSpotifyStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function SpotifyProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(STORAGE_KEYS.accessToken) || "");
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(STORAGE_KEYS.refreshToken) || "");
  const [expiresAt, setExpiresAt] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.expiresAt) || 0));
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");

  const isConfigured = Boolean(CLIENT_ID);

  const currentTrack = useMemo(() => {
    return tracks.find((track) => track.id === selectedTrackId) || tracks[0] || null;
  }, [selectedTrackId, tracks]);

  const currentPlaylist = useMemo(() => {
    return playlists.find((playlist) => playlist.id === selectedPlaylistId) || playlists[0] || null;
  }, [playlists, selectedPlaylistId]);

  const fetchPlaylists = async (token) => {
    const playlistData = await spotifyFetch(token, "/me/playlists?limit=20");
    const nextPlaylists = (playlistData.items || []).map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      owner: playlist.owner?.display_name || "Spotify",
      image: playlist.images?.[0]?.url || ""
    }));
    setPlaylists(nextPlaylists);

    if (nextPlaylists.length > 0) {
      const nextPlaylistId = nextPlaylists[0].id;
      setSelectedPlaylistId((current) => current || nextPlaylistId);
      return nextPlaylists;
    }

    return [];
  };

  const fetchTracksForPlaylist = async (token, playlistId) => {
    if (!playlistId) {
      setTracks([]);
      setSelectedTrackId("");
      return;
    }

    const trackData = await spotifyFetch(token, `/playlists/${playlistId}/tracks?limit=25`);
    const nextTracks = (trackData.items || [])
      .map((item) => item.track)
      .filter(Boolean)
      .map((track) => ({
        id: track.id,
        title: track.name,
        artist: track.artists?.map((artist) => artist.name).join(", ") || "Spotify",
        album: track.album?.name || "",
        image: track.album?.images?.[0]?.url || ""
      }));

    setTracks(nextTracks);
    setSelectedTrackId(nextTracks[0]?.id || "");
  };

  const hydrateSpotifyData = async (token) => {
    const me = await spotifyFetch(token, "/me");
    setProfile({
      displayName: me.display_name || me.id,
      email: me.email || "",
      image: me.images?.[0]?.url || ""
    });

    const nextPlaylists = await fetchPlaylists(token);
    if (nextPlaylists[0]) {
      await fetchTracksForPlaylist(token, nextPlaylists[0].id);
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      throw new Error("No Spotify refresh token available.");
    }

    const payload = await requestToken({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    });

    const stored = storeTokens(payload);
    setAccessToken(stored.accessToken);
    setRefreshToken(stored.refreshToken);
    setExpiresAt(stored.expiresAt);
    return stored.accessToken;
  };

  useEffect(() => {
    let cancelled = false;

    const finishAuth = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get("code");
        const state = currentUrl.searchParams.get("state");
        const errorParam = currentUrl.searchParams.get("error");

        if (window.location.pathname === "/callback" && errorParam) {
          throw new Error(`Spotify login was cancelled or denied: ${errorParam}`);
        }

        if (window.location.pathname === "/callback" && code) {
          const storedState = localStorage.getItem(STORAGE_KEYS.state);
          const codeVerifier = localStorage.getItem(STORAGE_KEYS.codeVerifier);

          if (!codeVerifier || !storedState || storedState !== state) {
            throw new Error("Spotify login could not be verified. Start login again from the same browser tab and host.");
          }

          const tokenPayload = await requestToken({
            client_id: CLIENT_ID,
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier
          });

          const stored = storeTokens(tokenPayload);
          if (cancelled) {
            return;
          }

          setAccessToken(stored.accessToken);
          setRefreshToken(stored.refreshToken);
          setExpiresAt(stored.expiresAt);
          localStorage.removeItem(STORAGE_KEYS.codeVerifier);
          localStorage.removeItem(STORAGE_KEYS.state);
          window.history.replaceState({}, document.title, "/");
          await hydrateSpotifyData(stored.accessToken);
          if (!cancelled) {
            setAuthLoading(false);
          }
          return;
        }

        if (!accessToken || !isConfigured) {
          if (!cancelled) {
            setAuthLoading(false);
          }
          return;
        }

        let tokenToUse = accessToken;
        if (expiresAt && Date.now() >= expiresAt - 60000) {
          tokenToUse = await refreshAccessToken();
        }

        await hydrateSpotifyData(tokenToUse);
        if (!cancelled) {
          setAuthLoading(false);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError.message || "Spotify login failed.");
          clearSpotifyStorage();
          sessionStorage.removeItem(STORAGE_KEYS.handledCode);
          setAccessToken("");
          setRefreshToken("");
          setExpiresAt(0);
          setProfile(null);
          setPlaylists([]);
          setTracks([]);
          setSelectedPlaylistId("");
          setSelectedTrackId("");
          setAuthLoading(false);
        }
      }
    };

    finishAuth();

    return () => {
      cancelled = true;
    };
  }, [accessToken, expiresAt, isConfigured, refreshToken]);

  const connectSpotify = async () => {
    if (!isConfigured) {
      setError("Spotify client ID is missing.");
      return;
    }

    setError("");
    setIsPlaying(false);
    const { codeVerifier, codeChallenge } = await createPkce();
    const state = randomString(24);
    localStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);
    localStorage.setItem(STORAGE_KEYS.state, state);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.search = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(" "),
      state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge
    }).toString();

    window.location.href = authUrl.toString();
  };

  const disconnectSpotify = () => {
    clearSpotifyStorage();
    setAccessToken("");
    setRefreshToken("");
    setExpiresAt(0);
    setProfile(null);
    setPlaylists([]);
    setTracks([]);
    setSelectedPlaylistId("");
    setSelectedTrackId("");
    setIsPlaying(false);
    setError("");
  };

  const selectPlaylist = async (playlistId) => {
    setSelectedPlaylistId(playlistId);
    setIsPlaying(false);
    if (accessToken) {
      await fetchTracksForPlaylist(accessToken, playlistId);
    }
  };

  const selectTrack = (trackId) => {
    setSelectedTrackId(trackId);
  };

  const nextTrack = () => {
    if (!tracks.length || !currentTrack) {
      return;
    }

    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
    const next = tracks[(currentIndex + 1) % tracks.length];
    setSelectedTrackId(next.id);
  };

  const previousTrack = () => {
    if (!tracks.length || !currentTrack) {
      return;
    }

    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
    const nextIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setSelectedTrackId(tracks[nextIndex].id);
  };

  return (
    <SpotifyContext.Provider
      value={{
        authLoading,
        connectSpotify,
        currentPlaylist,
        currentTrack,
        disconnectSpotify,
        error,
        hasSpotifyAuth: Boolean(accessToken && profile),
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
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  return useContext(SpotifyContext);
}

