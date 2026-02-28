import { FileText, MessageCircle, Instagram } from "lucide-react";
import TrackList from "./components/TrackList";

interface Track {
  id: string;
  title: string;
  artwork: {
    "150x150": string;
    "480x480": string;
    "1000x1000": string;
  };
  user: {
    name: string;
  };
  duration: number;
  play_count: number;
}

interface Playlist {
  id: string;
  playlist_name: string;
  description: string;
  artwork: {
    "150x150": string;
    "480x480": string;
    "1000x1000": string;
  };
  user: {
    name: string;
  };
  track_count: number;
  total_play_count: number;
  favorite_count: number;
  repost_count: number;
  tracks: Track[];
}

interface ApiResponse {
  data: Playlist[];
}

function formatPlayCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

async function getPlaylist(): Promise<Playlist> {
  const res = await fetch("https://api.audius.co/v1/playlists/l5Q60YO", {
    next: { revalidate: 60 },
  });
  const data: ApiResponse = await res.json();
  return data.data[0];
}

export default async function Home() {
  const playlist = await getPlaylist();

  return (
    <main className="min-h-screen bg-[#262926]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Playlist Header */}
        <div className="flex gap-6">
          <div className="h-36 w-36 shrink-0 overflow-hidden rounded-sm border border-stone-700 shadow-sm">
            <img
              src={playlist.artwork["480x480"]}
              alt={playlist.playlist_name}
              className="h-full w-full object-cover opacity-90 grayscale-[20%]"
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
              Playlist
            </span>
            <h1 className="font-serif text-2xl font-light tracking-wide text-stone-200">
              {playlist.playlist_name}
            </h1>
            <p className="text-sm leading-relaxed text-stone-400">
              {playlist.description.split("\n")[0]}
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="text-stone-300">{playlist.user.name}</span>
              <span className="text-stone-600">·</span>
              <span>{playlist.track_count} tracks</span>
              <span className="text-stone-600">·</span>
              <span>{formatPlayCount(playlist.total_play_count)} plays</span>
              <span className="text-stone-600">·</span>
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {formatPlayCount(playlist.favorite_count)}
              </span>
              <span className="text-stone-600">·</span>
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
                {formatPlayCount(playlist.repost_count)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4">
              <a
                href="https://forms.gle/JeqK3jWEdxaYKdaU7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-stone-300"
                title="Submit"
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>submit</span>
              </a>
              <a
                href="https://discord.gg/audius"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-stone-300"
                title="Discord"
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>discord</span>
              </a>
              <a
                href="https://instagram.com/audius"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-stone-500 transition-colors hover:text-stone-300"
                title="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto mt-12 h-px w-16 bg-stone-700" />

        {/* Track List */}
        <div className="mt-12 pb-24">
          <TrackList tracks={playlist.tracks} />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-stone-600">
          ·
        </div>
      </div>
    </main>
  );
}
