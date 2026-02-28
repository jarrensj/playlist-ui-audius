# Audius Playlist UI

A minimal, dark-themed playlist player for [Audius](https://audius.co). Stream any public Audius playlist with this minimal interface and playback.

Built with Next.js and the Audius API.

## Features

- Stream tracks directly from Audius
- Auto-advances to next track
- Artwork mirror fallback for CDN reliability
- Minimal dark charcoal theme
- Responsive design

## Setup

### Install dependencies:

```bash
npm install
```

### Configure your playlist:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_PLAYLIST_ID=your_playlist_id
```

Find your playlist ID in the Audius URL: `audius.co/playlist/YOUR_PLAYLIST_ID`

If not set, defaults to the [140 playlist](https://audius.co/audius/playlist/140-l5Q60YO).

### Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
