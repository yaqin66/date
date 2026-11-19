import React, { useState, useEffect, useRef } from 'react';
import {
  ListChecks,
  Images,
  Heart,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Upload,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Send,
  Check,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
  KeyRound,
  Delete,
  ZoomIn,
} from 'lucide-react';

type TabType = 'wishlist' | 'memori' | 'love';

interface WishlistItem {
  id: string;
  title: string;
  note: string;
  done: boolean;
}

interface MemoryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
}

interface SongItem {
  id: string;
  title: string;
  url: string;
  isBlob?: boolean;
}

const NO_PHRASES = [
  'Tidak',
  'Yakin nih?',
  'Coba pikir lagi...',
  'Salah pencet kayaknya',
  'Tombol Iya lebih bagus',
  'Waduh, geser lagi',
  'Udah klik Iya aja!',
];

// ==========================================
// DAFTAR LAGU BAWAAN DARI FOLDER `public/`
// ==========================================
const DEFAULT_PLAYLIST: SongItem[] = [
  {
    id: 'song-1',
    title: 'Surat Cinta Untuk Starla - Virgoun',
    url: '/Virgoun-SuratCintaUntukStarla.mp3',
  },
  {
    id: 'song-2',
    title: 'Komang - Raim Laode',
    url: '/Komang-RaimLaode.mp3',
  },
  {
    id: 'song-3',
    title: 'Penjaga Hati - Nadhif Basalamah',
    url: '/PenjagaHati-NadhifBasalamah.mp3',
  },
];

export default function App() {
  // ==========================================
  // KONFIGURASI UTAMA
  // ==========================================
  const WHATSAPP_NUMBER = '6281234567890'; // Format internasional tanpa +
  const HER_NAME = 'Kamu'; // Nama panggilan dia

  // Kode PIN Rahasia untuk membuka menu Love
  const LOVE_SECRET_PIN = '2604';
  const PIN_HINT = 'Petunjuk: 4 digit kita pertama ketemu di telegram buyy (YYMM)';

  // Kecepatan pergantian slideshow dalam milidetik (2500 = 2.5 detik)
  const SLIDESHOW_INTERVAL_MS = 2500;

  const [activeTab, setActiveTab] = useState<TabType>('wishlist');

  // ==========================================
  // STATE 1: WISHLIST
  // ==========================================
  const [wishlists, setWishlists] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('couple_app_wishlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishTitle, setWishTitle] = useState('');
  const [wishNote, setWishNote] = useState('');

  useEffect(() => {
    localStorage.setItem('couple_app_wishlists', JSON.stringify(wishlists));
  }, [wishlists]);

  const handleAddWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishTitle.trim()) return;
    const newItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      title: wishTitle.trim(),
      note: wishNote.trim(),
      done: false,
    };
    setWishlists((prev) => [newItem, ...prev]);
    setWishTitle('');
    setWishNote('');
  };

  const toggleWishlistDone = (id: string) => {
    setWishlists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const deleteWishlist = (id: string) => {
    setWishlists((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================
  // STATE 2: MEMORI (SLIDESHOW + LONG PRESS ZOOM)
  // ==========================================
  const [memories, setMemories] = useState<MemoryPhoto[]>(() => {
    const saved = localStorage.getItem('couple_app_memories');
    return saved ? JSON.parse(saved) : [];
  });
  const [photoCaption, setPhotoCaption] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State Long-Press Zoom
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const longPressTimerRef = useRef<number | null>(null);

  const updateZoomOrigin = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  const startLongPress = (clientX: number, clientY: number, rect: DOMRect) => {
    updateZoomOrigin(clientX, clientY, rect);
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      setIsZoomed(true);
    }, 220); // Tahan 220ms untuk mengaktifkan zoom
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsZoomed(false);
  };

  // ==========================================
  // STATE MULTI-SONG PLAYLIST AUDIO
  // ==========================================
  const [playlist, setPlaylist] = useState<SongItem[]>(DEFAULT_PLAYLIST);
  const [currentSongIdx, setCurrentSongIdx] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const currentSong = playlist[currentSongIdx];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (activeTab === 'memori') {
      audio
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          setAudioError(false);
        })
        .catch(() => {
          setIsAudioPlaying(false);
        });
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, [activeTab, currentSongIdx, playlist]);

  useEffect(() => {
    return () => {
      playlist.forEach((song) => {
        if (song.isBlob) URL.revokeObjectURL(song.url);
      });
    };
  }, [playlist]);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSongs: SongItem[] = Array.from(files).map((file, i) => ({
      id: `upload-song-${Date.now()}-${i}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      isBlob: true,
    }));

    const startIndex = playlist.length;
    setPlaylist((prev) => [...prev, ...newSongs]);
    setCurrentSongIdx(startIndex);
    setAudioError(false);

    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const toggleAudioPlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          setAudioError(false);
        })
        .catch(() => setIsAudioPlaying(false));
    }
  };

  const handlePrevSong = () => {
    if (playlist.length === 0) return;
    setAudioError(false);
    setCurrentSongIdx((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleNextSong = () => {
    if (playlist.length === 0) return;
    setAudioError(false);
    setCurrentSongIdx((prev) => (prev + 1) % playlist.length);
  };

  const toggleAudioMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    try {
      localStorage.setItem('couple_app_memories', JSON.stringify(memories));
    } catch {
      alert('Kapasitas penyimpanan browser penuh. Hapus beberapa foto lama terlebih dahulu.');
    }
  }, [memories]);

  // Jeda auto-slide saat foto sedang di-zoom (long press)
  useEffect(() => {
    if (activeTab !== 'memori' || !isPlaying || isZoomed || memories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % memories.length);
    }, SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeTab, isPlaying, isZoomed, memories.length]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1080;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedItems: MemoryPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressedBase64 = await compressImage(files[i]);
      uploadedItems.push({
        id: `mem-${Date.now()}-${i}`,
        imageUrl: compressedBase64,
        caption: photoCaption.trim() || `Momen #${memories.length + i + 1}`,
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      });
    }

    setMemories((prev) => [...prev, ...uploadedItems]);
    setPhotoCaption('');
    setCurrentSlide(memories.length);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (currentSlide >= updated.length) {
        setCurrentSlide(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  // ==========================================
  // STATE 3: LOVE (TERKUNCI MUTLAK DENGAN PIN)
  // ==========================================
  const [isLoveUnlocked, setIsLoveUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [accepted, setAccepted] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleDigitPress = (digit: string) => {
    if (pinInput.length >= LOVE_SECRET_PIN.length) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setPinError(false);

    if (nextPin.length === LOVE_SECRET_PIN.length) {
      if (nextPin === LOVE_SECRET_PIN) {
        setTimeout(() => {
          setIsLoveUnlocked(true);
          setPinInput('');
        }, 180);
      } else {
        setPinError(true);
        setTimeout(() => {
          setPinInput('');
        }, 500);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  useEffect(() => {
    if (activeTab !== 'love' || isLoveUnlocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handlePinBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNoInteraction = () => {
    setNoCount((prev) => prev + 1);
    const randomX = Math.floor(Math.random() * 140) - 70;
    const randomY = Math.floor(Math.random() * 90) - 45;
    setNoPosition({ x: randomX, y: randomY });
  };

  const generateWhatsAppUrl = () => {
    const wishSummary =
      wishlists.length > 0
        ? `\n\nWishlist kita yang bakal dijalanin:\n${wishlists
            .slice(0, 5)
            .map((w) => `• ${w.title}`)
            .join('\n')}`
        : '';

    const text = `Iya, aku mau jadi pacar kamu! ❤️${wishSummary}\n\nResmi mulai hari ini ya!`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#FAF9F6] text-stone-900 flex flex-col items-center justify-center p-3 sm:p-4 font-sans selection:bg-stone-900 selection:text-white">
      {/* Elemen Audio dengan Auto-Next saat lagu berakhir */}
      <audio
        ref={audioRef}
        src={currentSong?.url}
        loop={playlist.length === 1}
        onEnded={handleNextSong}
        onError={() => {
          setAudioError(true);
          setIsAudioPlaying(false);
        }}
      />

      <div className="w-full max-w-md max-h-full bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* ========================================== */}
        {/* NAVBAR 3 MENU (Wishlist, Memori, Love)     */}
        {/* ========================================== */}
        <nav className="grid grid-cols-3 border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Wishlist</span>
            {wishlists.length > 0 && (
              <span className="text-[10px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded-full">
                {wishlists.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memori')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'memori'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Images className="w-4 h-4" />
            <span>Memori</span>
            {memories.length > 0 && (
              <span className="text-[10px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded-full">
                {memories.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('love')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'love'
                ? isLoveUnlocked
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : isLoveUnlocked
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {isLoveUnlocked ? (
              <Heart className="w-4 h-4 fill-current text-rose-500" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>Love</span>
          </button>
        </nav>

        {/* ========================================== */}
        {/* KONTEN TAB 1: WISHLIST                     */}
        {/* ========================================== */}
        {activeTab === 'wishlist' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div className="space-y-1">
              <h1 className="text-2xl font-serif font-medium tracking-tight text-stone-900">
                Wishlist Kita
              </h1>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tempat yang ingin aku datangi sama, {HER_NAME}.
              </p>
            </div>

            <form onSubmit={handleAddWishlist} className="space-y-2.5">
              <input
                type="text"
                value={wishTitle}
                onChange={(e) => setWishTitle(e.target.value)}
                placeholder="Tulis wishlist..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 bg-stone-50/50 placeholder:text-stone-400"
              />
              {wishTitle.trim().length > 0 && (
                <input
                  type="text"
                  value={wishNote}
                  onChange={(e) => setWishNote(e.target.value)}
                  placeholder="Catatan tambahan (opsional, misal: sore jam 4)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 bg-stone-50/50 placeholder:text-stone-400"
                />
              )}
              <button
                type="submit"
                disabled={!wishTitle.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan ke Wishlist</span>
              </button>
            </form>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 pt-1">
              {wishlists.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl text-xs text-stone-400">
                  Belum ada wishlist tersimpan. Yuk isi satu dulu di atas!
                </div>
              ) : (
                wishlists.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      item.done
                        ? 'bg-stone-50 border-stone-200/70 opacity-70'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleWishlistDone(item.id)}
                      className="mt-0.5 text-stone-700 hover:text-stone-900 cursor-pointer shrink-0"
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          item.done ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {item.title}
                      </div>
                      {item.note && (
                        <div className="text-xs text-stone-500 mt-0.5">{item.note}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteWishlist(item.id)}
                      title="Hapus"
                      className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* KONTEN TAB 2: MEMORI (BOX + LONG PRESS ZOOM)*/}
        {/* ========================================== */}
        {activeTab === 'memori' && (
          <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-medium tracking-tight text-stone-900">
                Galeri Memori Kita
              </h2>
              <p className="text-xs text-stone-500">
                Tekan lama pada foto untuk memperbesar (zoom).
              </p>
            </div>

            {/* Mini Playlist Player Bar */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {playlist.length > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevSong}
                      title="Lagu Sebelumnya"
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer shrink-0"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleAudioPlay}
                    title={isAudioPlaying ? 'Jeda Musik' : 'Putar Musik'}
                    className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {isAudioPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </button>

                  {playlist.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNextSong}
                      title="Lagu Berikutnya"
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer shrink-0"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="min-w-0 pl-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <Music className="w-2.5 h-2.5" />
                      <span>
                        {audioError
                          ? 'File MP3 belum ada di public/'
                          : `Track ${currentSongIdx + 1}/${playlist.length}`}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-stone-800 truncate">
                      {currentSong?.title || 'Belum ada lagu'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!audioError && (
                    <button
                      type="button"
                      onClick={toggleAudioMute}
                      title={isMuted ? 'Bunyikan' : 'Bisukan'}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-red-500" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    title="Tambah file MP3 dari perangkat"
                    className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-medium text-stone-700 hover:border-stone-900 transition-colors cursor-pointer"
                  >
                    + Lagu
                  </button>
                </div>
              </div>

              {playlist.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pt-1.5 border-t border-stone-200/70 pb-0.5">
                  {playlist.map((song, idx) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        setAudioError(false);
                        setCurrentSongIdx(idx);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] truncate max-w-[145px] transition-colors cursor-pointer shrink-0 ${
                        idx === currentSongIdx
                          ? 'bg-stone-900 text-white font-medium'
                          : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {idx + 1}. {song.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Area Slideshow Kotak Tetap (Ada hitam/blur kiri-kanan + Long Press Zoom) */}
            {memories.length > 0 ? (
              <div className="space-y-2">
                <div
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    startLongPress(e.clientX, e.clientY, rect);
                  }}
                  onMouseMove={(e) => {
                    if (!isZoomed) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    updateZoomOrigin(e.clientX, e.clientY, rect);
                  }}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    startLongPress(touch.clientX, touch.clientY, rect);
                  }}
                  onTouchMove={(e) => {
                    if (!isZoomed) return;
                    const touch = e.touches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    updateZoomOrigin(touch.clientX, touch.clientY, rect);
                  }}
                  onTouchEnd={cancelLongPress}
                  onTouchCancel={cancelLongPress}
                  onContextMenu={(e) => e.preventDefault()}
                  className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-200 select-none touch-none cursor-zoom-in"
                >
                  {/* Stack semua gambar dengan transisi cross-fade + latar gelap kiri-kanan */}
                  {memories.map((memory, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <div
                        key={memory.id}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        {/* Latar Belakang Gelap Blur Sisi Kiri-Kanan */}
                        <img
                          src={memory.imageUrl}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-40 pointer-events-none"
                        />

                        {/* Foto Utama Utuh (object-contain) + Efek Zoom saat ditekan lama */}
                        <img
                          src={memory.imageUrl}
                          alt={memory.caption}
                          draggable={false}
                          style={{
                            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                            transform: isActive && isZoomed ? 'scale(2.1)' : 'scale(1)',
                          }}
                          className="relative z-10 w-full h-full object-contain transition-transform duration-200 ease-out pointer-events-none"
                        />
                      </div>
                    );
                  })}

                  {/* Badge Indikator Zoom di Kiri Atas */}
                  <div
                    className={`absolute top-2.5 left-2.5 z-20 px-2 py-1 rounded-lg bg-black/50 text-white text-[10px] font-medium flex items-center gap-1 pointer-events-none transition-opacity ${
                      isZoomed ? 'opacity-100 bg-stone-900/90' : 'opacity-75'
                    }`}
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>{isZoomed ? 'Zoom Aktif (Geser untuk lihat)' : 'Tahan untuk zoom'}</span>
                  </div>

                  {/* Gradient Overlay & Caption (sembunyikan saat zoom agar gambar bersih) */}
                  <div
                    className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3.5 text-white pointer-events-none transition-opacity duration-200 ${
                      isZoomed ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">
                      {memories[currentSlide]?.caption}
                    </div>
                    <div className="text-[11px] text-stone-300 font-mono mt-0.5">
                      {memories[currentSlide]?.date} · {currentSlide + 1} / {memories.length}
                    </div>
                  </div>

                  {/* Kontrol Navigasi Slide */}
                  {memories.length > 1 && !isZoomed && (
                    <>
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={() =>
                          setCurrentSlide((prev) => (prev - 1 + memories.length) % memories.length)
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/45 text-white hover:bg-black/75 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % memories.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/45 text-white hover:bg-black/75 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Tombol Play/Pause Slideshow & Hapus Foto */}
                  {!isZoomed && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5"
                    >
                      {memories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          title={isPlaying ? 'Jeda Slideshow' : 'Putar Slideshow'}
                          className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/75 transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMemory(memories[currentSlide].id)}
                        title="Hapus foto ini"
                        className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Indikator Dots */}
                {memories.length > 1 && (
                  <div className="flex justify-center gap-1.5 pt-0.5">
                    {memories.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentSlide === idx ? 'w-5 bg-stone-900' : 'w-1.5 bg-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3] w-full rounded-xl border border-dashed border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Images className="w-8 h-8 text-stone-300" />
                <div className="text-xs text-stone-500">
                  Belum ada foto kenangan. Upload foto pertama di bawah untuk memulai slideshow!
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-100 space-y-2">
              <input
                type="text"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Tulis caption foto sebelum upload (opsional)..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 bg-stone-50/50 placeholder:text-stone-400"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Foto ke Memori</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* KONTEN TAB 3: LOVE (PIN LOCK + NEMBAK)     */}
        {/* ========================================== */}
        {activeTab === 'love' && (
          <div className="p-6 overflow-y-auto overflow-x-hidden">
            {!isLoveUnlocked ? (
              <div className="py-2 space-y-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-serif font-medium text-stone-900">
                    Menu Terkunci
                  </h2>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                    Masukkan kode PIN rahasia untuk membuka pesan spesial di dalamnya.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3 py-2">
                    {Array.from({ length: LOVE_SECRET_PIN.length }).map((_, idx) => {
                      const isFilled = idx < pinInput.length;
                      return (
                        <div
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                            pinError
                              ? 'bg-red-500 scale-110'
                              : isFilled
                              ? 'bg-stone-900 scale-110'
                              : 'bg-stone-200'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {pinError ? (
                    <div className="text-xs font-medium text-red-500">
                      PIN salah, coba masukkan lagi!
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-400">{PIN_HINT}</div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleDigitPress(digit)}
                      className="h-12 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-900 hover:text-white hover:border-stone-900 text-base font-medium transition-colors cursor-pointer active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}

                  <div />

                  <button
                    type="button"
                    onClick={() => handleDigitPress('0')}
                    className="h-12 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-900 hover:text-white hover:border-stone-900 text-base font-medium transition-colors cursor-pointer active:scale-95"
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={handlePinBackspace}
                    title="Hapus digit"
                    className="h-12 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !accepted ? (
              <div className="space-y-6 text-center py-2">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PIN Terverifikasi</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLoveUnlocked(false);
                      setPinInput('');
                    }}
                    title="Kunci kembali"
                    className="text-[11px] text-stone-400 hover:text-stone-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Kunci</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-medium text-stone-900">
                    Untuk {HER_NAME},
                  </h2>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Kamu berhasil membuka kuncinya. Semua wishlist dan memori di sini sudah siap
                    kita jalanin bareng-bareng.
                  </p>
                  <p className="text-base font-medium text-stone-900 pt-2">
                    Mau nggak jadi pacar aku?
                  </p>
                </div>

                <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-center gap-3 min-h-[110px] relative">
                  <button
                    type="button"
                    onClick={() => setAccepted(true)}
                    style={{
                      transform: `scale(${1 + Math.min(noCount * 0.14, 0.7)})`,
                    }}
                    className="px-7 py-3 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-all shadow-sm z-10 cursor-pointer"
                  >
                    Iya, Mau! ❤️
                  </button>

                  <button
                    type="button"
                    onMouseEnter={handleNoInteraction}
                    onClick={handleNoInteraction}
                    style={{
                      transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                    }}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-500 text-xs hover:border-stone-300 transition-transform duration-200 cursor-pointer"
                  >
                    {NO_PHRASES[Math.min(noCount, NO_PHRASES.length - 1)]}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-medium text-stone-900">
                    Resmi Jadian! ❤️
                  </h2>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Terima kasih sudah memilih <strong>Iya</strong>. Sekarang saatnya kita coret
                    satu per satu wishlist dan tambah terus foto di galeri memori!
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <a
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Jawaban ke WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setAccepted(false)}
                    className="w-full py-2 text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                  >
                    Lihat pertanyaan lagi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}