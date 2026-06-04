import React, { useRef, useState, useEffect } from "react";
import { Music, FolderOpen, Play, Pause, SkipForward, SkipBack, Trash2, Volume2, Info } from "lucide-react";
import { Song } from "../types";

interface MusicPlayerProps {
  playlist: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  onSetPlaylist: (list: Song[]) => void;
  onSetCurrentSongIndex: (idx: number) => void;
  onSetIsPlaying: (state: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  language: string;
}

export default function MusicPlayer({
  playlist,
  currentSongIndex,
  isPlaying,
  onSetPlaylist,
  onSetCurrentSongIndex,
  onSetIsPlaying,
  audioRef,
  language,
}: MusicPlayerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [volume, setVolume] = useState(0.4);
  const [progress, setProgress] = useState(0);

  // Synchronize audio output volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioRef]);

  // Listen to time updates for loading bar indicators
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    
    const loadedSongs: Song[] = files.map((file) => ({
      name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
      url: URL.createObjectURL(file),
    }));

    const updated = [...playlist, ...loadedSongs];
    onSetPlaylist(updated);

    if (playlist.length === 0) {
      onSetCurrentSongIndex(0);
      onSetIsPlaying(true);
    }
  };

  const handleClearPlaylist = () => {
    onSetPlaylist([]);
    onSetIsPlaying(false);
    onSetCurrentSongIndex(0);
  };

  const handleSkipNext = () => {
    if (playlist.length === 0) return;
    onSetCurrentSongIndex((currentSongIndex + 1) % playlist.length);
    onSetIsPlaying(true);
  };

  const handleSkipPrev = () => {
    if (playlist.length === 0) return;
    onSetCurrentSongIndex((currentSongIndex - 1 + playlist.length) % playlist.length);
    onSetIsPlaying(true);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      const targetTime = (parseFloat(e.target.value) / 100) * audio.duration;
      audio.currentTime = targetTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const activeSong = playlist[currentSongIndex];

  return (
    <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl animate-fade-in text-white">
      {/* Title */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-500 border border-orange-500/15">
          <Music className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">
            {language === "hin" ? "लोकल वर्कआउट म्यूजिक" : "Local Music Deck"}
          </h2>
          <p className="text-neutral-400 text-xs mt-0.5">
            {language === "hin" ? "म्यूजिक के साथ पंप बढ़ाएं - MP3 फाइल्स लोड करें" : "Load custom MP3s during training sets"}
          </p>
        </div>
      </div>

      {/* Upload trigger block */}
      <input
        type="file"
        accept="audio/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-neutral-950 hover:bg-neutral-900 border-2 border-dashed border-neutral-800 hover:border-orange-500/40 p-6 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group select-none mb-6"
      >
        <FolderOpen className="w-8 h-8 text-neutral-500 group-hover:text-orange-500 mb-2 transition-colors" />
        <span className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">
          {language === "hin" ? "गाने सिलेक्ट करें (Select MP3)" : "Upload Soundtracks / MP3s"}
        </span>
        <span className="text-[10px] text-neutral-500 mt-1">
          {language === "hin" ? "Tip: Long-press karke ek sath kai files chunein!" : "Tip: Multiselect files in your browser file window!"}
        </span>
      </button>

      {playlist.length > 0 ? (
        <div className="space-y-5">
          {/* Active Song Control Deck */}
          <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800/80 shadow-md">
            <div className="flex items-center space-x-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform shrink-0 ${
                  isPlaying ? "bg-orange-500 text-black animate-[spin_6s_linear_infinite]" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                <Music className="w-6 h-6" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-orange-500 text-[10px] uppercase font-bold tracking-widest">
                  {isPlaying ? (language === "hin" ? "चल रहा है..." : "NOW PLAYING") : (language === "hin" ? "रुका हुआ" : "PAUSED")}
                </p>
                <h4 className="text-white font-bold text-base truncate mt-0.5" title={activeSong?.name}>
                  {activeSong?.name || "Local track"}
                </h4>
              </div>
            </div>

            {/* Slider Seek Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Main Audio Deck Controls */}
            <div className="flex items-center justify-between mt-5">
              {/* Volume sliders */}
              <div className="flex items-center space-x-2 text-neutral-400 max-w-[30%]">
                <Volume2 className="w-4 h-4 shrink-0 text-neutral-500" />
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-300"
                />
              </div>

              {/* Player switches */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSkipPrev}
                  className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onSetIsPlaying(!isPlaying)}
                  className="bg-orange-500 hover:bg-orange-600 text-black p-3.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-md shadow-orange-500/10"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={handleSkipNext}
                  className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Clear button */}
              <button
                onClick={handleClearPlaylist}
                className="text-neutral-500 hover:text-rose-500 p-2 rounded-lg cursor-pointer transition-colors text-xs flex items-center space-x-1"
                title={language === "hin" ? "हटाएं" : "Clear queue"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrolling playlist tracks layout */}
          <div className="space-y-2">
            <h5 className="text-neutral-400 text-xs uppercase font-bold tracking-wider pl-1">
              {language === "hin" ? `प्लेलिस्ट (${playlist.length})` : `Playlist Queue (${playlist.length})`}
            </h5>
            <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
              {playlist.map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSetCurrentSongIndex(idx);
                    onSetIsPlaying(true);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl cursor-pointer border transition-all ${
                    idx === currentSongIndex
                      ? "bg-neutral-950 border-orange-500/50 text-orange-400 shadow-sm shadow-orange-500/5"
                      : "bg-neutral-950/40 border-neutral-800/40 hover:bg-neutral-900/60 hover:border-neutral-800 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1 mr-4">
                    <Music
                      className={`w-4 h-4 shrink-0 mr-3 ${idx === currentSongIndex ? "text-orange-500" : "text-neutral-600"}`}
                    />
                    <p className={`text-sm truncate font-medium ${idx === currentSongIndex ? "font-bold" : ""}`}>
                      {song.name}
                    </p>
                  </div>

                  {idx === currentSongIndex && isPlaying && (
                    <div className="flex items-end h-3 space-x-[2px] mb-0.5 shrink-0">
                      <span className="w-[3px] h-2 bg-orange-500 rounded-sm animate-[sound-bar_1.2s_infinite_ease-in-out_delay-1]" />
                      <span className="w-[3px] h-3 bg-orange-500 rounded-sm animate-[sound-bar_1.2s_infinite_ease-in-out_delay-2]" />
                      <span className="w-[3px] h-1.5 bg-orange-500 rounded-sm animate-[sound-bar_1.2s_infinite_ease-in-out_delay-3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-950 rounded-2xl border border-neutral-850 p-8 text-center text-neutral-500">
          <p className="text-sm font-medium">
            {language === "hin" ? "कोई गाना लोड नहीं है। ऊपर क्लिक करके MP3 ऐड करें।" : "Your workout queue is empty."}
          </p>
        </div>
      )}
    </div>
  );
}
