// ================== ИКОНКИ ==================
const PLAY_ICON = '<path d="M8 5v14l11-7z"/>';
const PAUSE_ICON = '<path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"/>';
const HEART_ICON = '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
const PLUS_ICON = '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>';
const SUN_ICON = '<path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>';
const MOON_ICON = '<path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 01-4.4 2.26 5.4 5.4 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>';

const EMOJIS = ['🎵','🎧','🎸','🎹','🎤','🎼','🎷','🥁','🎺','🎻','🌃','🌊','🚗','🌅','⚡','🔥','💜','💙','💚','❤️','🌙','☀️','⭐','✨','🎮','🕹','🏆','🎉','🍕','🌺','🌈','🦋'];

const COVER_GRADIENTS = [
    'linear-gradient(135deg, #7c3aed, #a855f7)',
    'linear-gradient(135deg, #a855f7, #ec4899)',
    'linear-gradient(135deg, #6366f1, #a855f7)',
    'linear-gradient(135deg, #8b5cf6, #d946ef)',
    'linear-gradient(135deg, #c084fc, #7c3aed)',
    'linear-gradient(135deg, #9333ea, #6366f1)',
    'linear-gradient(135deg, #a78bfa, #f472b6)',
    'linear-gradient(135deg, #6d28d9, #a855f7)',
    'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    'linear-gradient(135deg, #d8b4fe, #a855f7)'
];

// ================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ==================
let allTracks = [];
let currentTracks = [];
let currentIndex = 0;
let isPlaying = false;
let shuffle = false;
let repeat = false;
let currentUser = null;
let currentPlaylist = null;

const blobUrls = {};

let likedTracks = new Set(JSON.parse(localStorage.getItem('liked') || '[]'));
let users = JSON.parse(localStorage.getItem('users') || '{}');
let playlists = JSON.parse(localStorage.getItem('playlists') || '{}');
let userPlaylists = JSON.parse(localStorage.getItem('userPlaylists') || '{}');

// ================== ЭЛЕМЕНТЫ ==================
const audio = document.getElementById('audio');
const tracksList = document.getElementById('tracksList');
const sectionTitle = document.getElementById('sectionTitle');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerCover = document.getElementById('playerCover');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const heroPlayBtn = document.getElementById('heroPlayBtn');
const searchInput = document.getElementById('searchInput');
const hero = document.getElementById('hero');

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const authBtn = document.getElementById('authBtn');
const authLabel = document.getElementById('authLabel');
const authModal = document.getElementById('authModal');
const authClose = document.getElementById('authClose');
const authForm = document.getElementById('authForm');
const authName = document.getElementById('authName');
const authPassword = document.getElementById('authPassword');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const authSwitch = document.getElementById('authSwitch');
const authSwitchText = document.getElementById('authSwitchText');

const playlistsList = document.getElementById('playlistsList');
const addPlaylistBtn = document.getElementById('addPlaylistBtn');
const playlistModal = document.getElementById('playlistModal');
const playlistClose = document.getElementById('playlistClose');
const playlistChooser = document.getElementById('playlistChooser');

const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const clearAllBtn = document.getElementById('clearAllBtn');
const toastContainer = document.getElementById('toastContainer');
const uploadProgress = document.getElementById('uploadProgress');
const uploadText = document.getElementById('uploadText');

const editModal = document.getElementById('editModal');
const editClose = document.getElementById('editClose');
const editForm = document.getElementById('editForm');
const editTitle = document.getElementById('editTitle');
const editArtist = document.getElementById('editArtist');
const emojiPicker = document.getElementById('emojiPicker');
const editCoverPreview = document.getElementById('editCoverPreview');
const editCoverEmoji = document.getElementById('editCoverEmoji');
const editCoverImg = document.getElementById('editCoverImg');
const coverInput = document.getElementById('coverInput');
const coverRemoveBtn = document.getElementById('coverRemoveBtn');

let editingTrack = null;
let selectedEmoji = '🎵';
let pendingCoverBlob = null;
let pendingCoverUrl = null;
let pendingRemoveCover = false;

// ================== INDEXEDDB ==================
const DB_NAME = 'MyMusicDB';
const DB_VERSION = 2;
const STORE_NAME = 'audioFiles';
const COVER_STORE = 'coverImages';
let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME);
            }
            if (!database.objectStoreNames.contains(COVER_STORE)) {
                database.createObjectStore(COVER_STORE);
            }
        };
        req.onsuccess = () => { db = req.result; resolve(db); };
        req.onerror = () => reject(req.error);
    });
}

function saveBlob(store, key, blob) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(blob, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function getBlob(store, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function deleteBlob(store, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

const saveFileToDB = (key, blob) => saveBlob(STORE_NAME, key, blob);
const getFileFromDB = (key) => getBlob(STORE_NAME, key);
const deleteFileFromDB = (key) => deleteBlob(STORE_NAME, key);

const saveCoverToDB = (key, blob) => saveBlob(COVER_STORE, key, blob);
const getCoverFromDB = (key) => getBlob(COVER_STORE, key);
const deleteCoverFromDB = (key) => deleteBlob(COVER_STORE, key);

function clearDB() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME, COVER_STORE], 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.objectStore(COVER_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// ================== МЕТАДАННЫЕ ==================
function saveTracksMeta() {
    const meta = allTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        cover: t.cover,
        coverKey: t.coverKey,
        color: t.color,
        duration: t.duration,
        blobKey: t.blobKey
    }));
    localStorage.setItem('tracksMeta', JSON.stringify(meta));
}

function loadTracksMeta() {
    try {
        return JSON.parse(localStorage.getItem('tracksMeta') || '[]');
    } catch { return []; }
}

// ================== РЕСАЙЗ ИЗОБРАЖЕНИЯ ==================
const COVER_SIZE = 400;

function resizeImage(file, size = COVER_SIZE, quality = 0.85) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            return reject(new Error('Не изображение'));
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;

                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

                const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('canvas.toBlob вернул null')),
                    outType,
                    quality
                );
            };
            img.onerror = () => reject(new Error('Не удалось прочитать изображение'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}

// ================== ЗАГРУЗКА АУДИО ==================
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    uploadProgress.classList.add('show');
    let added = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        uploadText.textContent = `Загрузка ${i + 1} из ${files.length}: ${file.name}`;

        try {
            if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac|aac|opus)$/i.test(file.name)) {
                showToast(`❌ "${file.name}" — не аудиофайл`, 'error');
                continue;
            }

            const id = Date.now() + i;
            const blobKey = `audio_${id}`;

            await saveFileToDB(blobKey, file);

            const url = URL.createObjectURL(file);
            blobUrls[id] = url;

            const duration = await getAudioDuration(url);

            const baseName = file.name.replace(/\.[^.]+$/, '');
            let title = baseName;
            let artist = 'Неизвестный исполнитель';
            const dashMatch = baseName.match(/^(.+?)\s*[-–—]\s*(.+)$/);
            if (dashMatch) {
                artist = dashMatch[1].trim();
                title = dashMatch[2].trim();
            }

            const track = {
                id,
                title,
                artist,
                cover: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                color: COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)],
                duration,
                blobKey
            };

            allTracks.push(track);
            added++;
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            showToast(`❌ Ошибка загрузки "${file.name}"`, 'error');
        }
    }

    saveTracksMeta();
    uploadProgress.classList.remove('show');
    fileInput.value = '';

    if (added > 0) {
        showToast(`✅ Загружено треков: ${added}`, 'success');
        currentTracks = [...allTracks];
        renderTracks(searchInput.value);
    }
});

function getAudioDuration(url) {
    return new Promise((resolve) => {
        const tmp = new Audio();
        tmp.preload = 'metadata';
        tmp.src = url;
        const timer = setTimeout(() => resolve(null), 3000);
        tmp.addEventListener('loadedmetadata', () => {
            clearTimeout(timer);
            resolve(formatTime(tmp.duration));
        });
        tmp.addEventListener('error', () => {
            clearTimeout(timer);
            resolve(null);
        });
    });
}

// ================== ВОССТАНОВЛЕНИЕ ==================
async function restoreTracks() {
    await openDB();
    const meta = loadTracksMeta();

    for (const t of meta) {
        try {
            const blob = await getFileFromDB(t.blobKey);
            if (!blob) continue;

            blobUrls[t.id] = URL.createObjectURL(blob);

            if (t.coverKey) {
                const coverBlob = await getCoverFromDB(t.coverKey);
                if (coverBlob) {
                    t.coverUrl = URL.createObjectURL(coverBlob);
                }
            }

            allTracks.push(t);
        } catch (err) {
            console.error('Ошибка восстановления:', err);
        }
    }

    currentTracks = [...allTracks];
    renderTracks();
    renderPlaylistsList();
}

// ================== ОЧИСТИТЬ ВСЁ ==================
clearAllBtn.addEventListener('click', async () => {
    if (allTracks.length === 0) return showToast('Треков и так нет', 'info');
    if (!confirm(`Удалить все ${allTracks.length} треков? Это действие нельзя отменить.`)) return;

    await clearDB();
    Object.values(blobUrls).forEach(url => URL.revokeObjectURL(url));
    Object.keys(blobUrls).forEach(k => delete blobUrls[k]);
    allTracks.forEach(t => { if (t.coverUrl) URL.revokeObjectURL(t.coverUrl); });

    allTracks = [];
    currentTracks = [];
    currentIndex = 0;
    saveTracksMeta();

    audio.pause();
    audio.src = '';
    isPlaying = false;
    updatePlayIcon();
    playerTitle.textContent = 'Выбери трек';
    playerArtist.textContent = '—';
    playerCover.innerHTML = '♪';
    playerCover.style.background = 'linear-gradient(135deg, #241a38, #150f22)';

    renderTracks();
    showToast('🗑 Все треки удалены', 'info');
});

// ================== ТЕМА ==================
function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
    themeIcon.innerHTML = theme === 'dark' ? MOON_ICON : SUN_ICON;
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
});

// ================== TOAST ==================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ================== РЕНДЕР ==================
function renderTracks(filter = '') {
    let list = currentTracks;

    if (currentPlaylist === 'liked') {
        list = allTracks.filter(t => likedTracks.has(t.id));
        sectionTitle.textContent = '❤️ Любимое';
    } else if (currentPlaylist) {
        const pl = playlists[currentPlaylist];
        if (pl) {
            list = allTracks.filter(t => pl.trackIds.includes(t.id));
            sectionTitle.textContent = `📁 ${currentPlaylist}`;
        }
    } else {
        sectionTitle.textContent = 'Мои треки';
    }

    if (filter) {
        list = list.filter(t =>
            t.title.toLowerCase().includes(filter.toLowerCase()) ||
            t.artist.toLowerCase().includes(filter.toLowerCase())
        );
    }

    hero.style.display = (currentPlaylist === null && !filter && allTracks.length > 0) ? 'flex' : 'none';

    if (list.length === 0) {
        let msg = 'Ничего не найдено 🔍';
        if (allTracks.length === 0) {
            msg = `📂 У тебя пока нет треков.<br><br>Нажми <b>«Загрузить трек»</b> слева, чтобы добавить музыку 🎵`;
        } else if (currentPlaylist === 'liked') {
            msg = '❤️ Ты ещё не лайкал треки';
        } else if (currentPlaylist) {
            msg = '📁 В плейлисте пока пусто';
        }
        tracksList.innerHTML = `<div class="empty-state">${msg}</div>`;
        return;
    }

    tracksList.innerHTML = list.map((track, i) => {
        const isPlayingNow = allTracks[currentIndex]?.id === track.id;
        const liked = likedTracks.has(track.id);
        const coverHtml = track.coverUrl
            ? `<img src="${track.coverUrl}" alt="">`
            : track.cover;

        return `
        <div class="track ${isPlayingNow ? 'playing' : ''}" data-id="${track.id}" style="animation-delay: ${i * 0.04}s">
            <div class="track-num">${i + 1}</div>
            <div class="track-main">
                <div class="track-cover" style="background: ${track.color}">${coverHtml}</div>
                <div class="track-text">
                    <div class="track-title">${escapeHtml(track.title)}</div>
                    <div class="track-artist">${escapeHtml(track.artist)}</div>
                </div>
            </div>
            <div class="track-duration">${track.duration || '--:--'}</div>
            <div class="track-actions">
                <button class="track-action edit-track" data-edit="${track.id}" title="Редактировать">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button class="track-action add-playlist" data-add="${track.id}" title="В плейлист">
                    <svg viewBox="0 0 24 24" fill="currentColor">${PLUS_ICON}</svg>
                </button>
                <button class="track-action like ${liked ? 'liked' : ''}" data-like="${track.id}" title="Лайк">
                    <svg viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">${HEART_ICON}</svg>
                </button>
                <button class="track-action delete-track" data-del-track="${track.id}" title="Удалить">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.track').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.track-action')) return;
            const id = parseInt(el.dataset.id);
            const idx = allTracks.findIndex(t => t.id === id);
            if (idx >= 0) playTrack(idx);
        });
    });

    document.querySelectorAll('.track-action.like').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(parseInt(btn.dataset.like));
        });
    });

    document.querySelectorAll('.track-action.add-playlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPlaylistModal(parseInt(btn.dataset.add));
        });
    });

    document.querySelectorAll('.track-action.delete-track').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTrack(parseInt(btn.dataset.delTrack));
        });
    });

    document.querySelectorAll('.track-action.edit-track').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(parseInt(btn.dataset.edit));
        });
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ================== УДАЛЕНИЕ ТРЕКА ==================
async function deleteTrack(id) {
    const track = allTracks.find(t => t.id === id);
    if (!track) return;
    if (!confirm(`Удалить трек "${track.title}"?`)) return;

    try {
        await deleteFileFromDB(track.blobKey);
        if (track.coverKey) await deleteCoverFromDB(track.coverKey);
    } catch (e) { console.error(e); }

    if (blobUrls[id]) {
        URL.revokeObjectURL(blobUrls[id]);
        delete blobUrls[id];
    }
    if (track.coverUrl) URL.revokeObjectURL(track.coverUrl);

    if (allTracks[currentIndex]?.id === id) {
        audio.pause();
        audio.src = '';
        isPlaying = false;
        updatePlayIcon();
    }

    Object.values(playlists).forEach(pl => {
        pl.trackIds = pl.trackIds.filter(tid => tid !== id);
    });
    localStorage.setItem('playlists', JSON.stringify(playlists));

    allTracks = allTracks.filter(t => t.id !== id);
    currentTracks = [...allTracks];
    saveTracksMeta();
    renderTracks(searchInput.value);
    showToast(`🗑 "${track.title}" удалён`, 'info');
}

// ================== ВОСПРОИЗВЕДЕНИЕ ==================
function playTrack(index) {
    if (allTracks.length === 0) return;
    if (index < 0) index = allTracks.length - 1;
    if (index >= allTracks.length) index = 0;

    currentIndex = index;
    const track = allTracks[index];
    const url = blobUrls[track.id];

    if (!url) {
        showToast('❌ Файл недоступен', 'error');
        return;
    }

    audio.src = url;
    audio.play().then(() => {
        isPlaying = true;
        updatePlayIcon();
        updatePlayerInfo(track);
        renderTracks(searchInput.value);
        document.title = `▶ ${track.title} — Aurora Music`;
    }).catch(err => {
        console.error(err);
        showToast(`❌ Не удалось воспроизвести "${track.title}"`, 'error');
    });
}

function togglePlay() {
    if (!audio.src) {
        if (allTracks.length > 0) playTrack(0);
        return;
    }
    if (isPlaying) { audio.pause(); isPlaying = false; }
    else { audio.play(); isPlaying = true; }
    updatePlayIcon();
}

function updatePlayIcon() {
    playIcon.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
    playerCover.classList.toggle('playing', isPlaying);
}

function updatePlayerInfo(track) {
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerCover.style.background = track.color;

    if (track.coverUrl) {
        playerCover.innerHTML = `<img src="${track.coverUrl}" alt="">`;
    } else {
        playerCover.textContent = track.cover;
    }
}

function nextTrack() {
    if (shuffle) {
        currentIndex = Math.floor(Math.random() * allTracks.length);
    } else {
        currentIndex = (currentIndex + 1) % allTracks.length;
    }
    playTrack(currentIndex);
}

// ================== ЛАЙКИ ==================
function toggleLike(id) {
    if (likedTracks.has(id)) likedTracks.delete(id);
    else likedTracks.add(id);
    localStorage.setItem('liked', JSON.stringify([...likedTracks]));
    renderTracks(searchInput.value);
}

// ================== ПРОГРЕСС ==================
function formatTime(sec) {
    if (isNaN(sec) || sec === null) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    if (repeat) { audio.currentTime = 0; audio.play(); }
    else nextTrack();
});

progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
});
audio.volume = volumeSlider.value / 100;

// ================== КНОПКИ ==================
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => playTrack(currentIndex - 1));
nextBtn.addEventListener('click', nextTrack);
heroPlayBtn.addEventListener('click', () => {
    if (allTracks.length === 0) return showToast('Сначала загрузи треки', 'info');
    playTrack(0);
});

shuffleBtn.addEventListener('click', () => {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle('active', shuffle);
});
repeatBtn.addEventListener('click', () => {
    repeat = !repeat;
    repeatBtn.classList.toggle('active', repeat);
});

searchInput.addEventListener('input', (e) => renderTracks(e.target.value));

// ================== РЕДАКТИРОВАНИЕ ТРЕКА ==================
function openEditModal(id) {
    const track = allTracks.find(t => t.id === id);
    if (!track) return;
    editingTrack = track;
    editTitle.value = track.title;
    editArtist.value = track.artist === 'Неизвестный исполнитель' ? '' : track.artist;
    selectedEmoji = track.cover;

    pendingCoverBlob = null;
    pendingRemoveCover = false;
    if (pendingCoverUrl) {
        URL.revokeObjectURL(pendingCoverUrl);
        pendingCoverUrl = null;
    }

    if (track.coverUrl) {
        editCoverImg.src = track.coverUrl;
        editCoverImg.hidden = false;
        editCoverEmoji.hidden = true;
    } else {
        editCoverImg.hidden = true;
        editCoverImg.removeAttribute('src');
        editCoverEmoji.hidden = false;
        editCoverEmoji.textContent = track.cover;
    }

    emojiPicker.innerHTML = EMOJIS.map(e =>
        `<button type="button" class="${e === selectedEmoji ? 'selected' : ''}" data-emoji="${e}">${e}</button>`
    ).join('');

    emojiPicker.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            emojiPicker.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedEmoji = btn.dataset.emoji;

            pendingCoverBlob = null;
            pendingRemoveCover = true;
            if (pendingCoverUrl) {
                URL.revokeObjectURL(pendingCoverUrl);
                pendingCoverUrl = null;
            }
            editCoverImg.hidden = true;
            editCoverImg.removeAttribute('src');
            editCoverEmoji.hidden = false;
            editCoverEmoji.textContent = selectedEmoji;
        });
    });

    editModal.classList.add('open');
}

coverInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        showToast('⏳ Обработка фото...', 'info');
        const resized = await resizeImage(file, 400, 0.85);
        pendingCoverBlob = resized;
        pendingRemoveCover = false;

        if (pendingCoverUrl) URL.revokeObjectURL(pendingCoverUrl);
        pendingCoverUrl = URL.createObjectURL(resized);

        editCoverImg.src = pendingCoverUrl;
        editCoverImg.hidden = false;
        editCoverEmoji.hidden = true;

        showToast('✅ Фото готово', 'success');
    } catch (err) {
        console.error(err);
        showToast('❌ Не удалось обработать фото', 'error');
    } finally {
        coverInput.value = '';
    }
});

coverRemoveBtn.addEventListener('click', () => {
    pendingCoverBlob = null;
    pendingRemoveCover = true;
    if (pendingCoverUrl) {
        URL.revokeObjectURL(pendingCoverUrl);
        pendingCoverUrl = null;
    }
    editCoverImg.hidden = true;
    editCoverImg.removeAttribute('src');
    editCoverEmoji.hidden = false;
    editCoverEmoji.textContent = selectedEmoji;
});

function closeEditModal() {
    editModal.classList.remove('open');
    if (pendingCoverUrl) {
        URL.revokeObjectURL(pendingCoverUrl);
        pendingCoverUrl = null;
    }
    pendingCoverBlob = null;
    pendingRemoveCover = false;
    editingTrack = null;
}

editClose.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!editingTrack) return;

    editingTrack.title = editTitle.value.trim() || 'Без названия';
    editingTrack.artist = editArtist.value.trim() || 'Неизвестный исполнитель';

    if (pendingCoverBlob) {
        const coverKey = `cover_${editingTrack.id}_${Date.now()}`;

        if (editingTrack.coverKey) {
            try { await deleteCoverFromDB(editingTrack.coverKey); } catch {}
        }
        if (editingTrack.coverUrl) {
            URL.revokeObjectURL(editingTrack.coverUrl);
        }

        await saveCoverToDB(coverKey, pendingCoverBlob);

        editingTrack.coverKey = coverKey;
        editingTrack.coverUrl = URL.createObjectURL(pendingCoverBlob);
    } else if (pendingRemoveCover) {
        if (editingTrack.coverKey) {
            try { await deleteCoverFromDB(editingTrack.coverKey); } catch {}
        }
        if (editingTrack.coverUrl) {
            URL.revokeObjectURL(editingTrack.coverUrl);
            delete editingTrack.coverUrl;
        }
        delete editingTrack.coverKey;
        editingTrack.cover = selectedEmoji;
    } else {
        editingTrack.cover = selectedEmoji;
    }

    pendingCoverBlob = null;
    pendingRemoveCover = false;
    if (pendingCoverUrl) {
        URL.revokeObjectURL(pendingCoverUrl);
        pendingCoverUrl = null;
    }

    if (allTracks[currentIndex]?.id === editingTrack.id) {
        updatePlayerInfo(editingTrack);
    }

    saveTracksMeta();
    renderTracks(searchInput.value);
    editModal.classList.remove('open');
    showToast('✅ Сохранено', 'success');
    editingTrack = null;
});

// ================== НАВИГАЦИЯ ==================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const page = item.dataset.page;
        searchInput.value = '';

        if (page === 'home') {
            currentPlaylist = null;
            currentTracks = [...allTracks];
        } else if (page === 'liked') {
            currentPlaylist = 'liked';
            currentTracks = allTracks;
        } else if (page === 'playlists') {
            currentPlaylist = null;
            currentTracks = allTracks;
            showToast('Выбери плейлист слева 👈', 'info');
            renderPlaylistsList();
            renderTracks();
            return;
        }
        renderPlaylistsList();
        renderTracks();
    });
});

// ================== АВТОРИЗАЦИЯ ==================
let isRegisterMode = false;

authBtn.addEventListener('click', () => {
    if (currentUser) {
        if (confirm(`Выйти из аккаунта "${currentUser}"?`)) {
            currentUser = null;
            localStorage.removeItem('currentUser');
            authLabel.textContent = 'Войти';
            renderPlaylistsList();
            renderTracks();
        }
    } else {
        authModal.classList.add('open');
    }
});

authClose.addEventListener('click', () => authModal.classList.remove('open'));
authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.remove('open'); });

authSwitch.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    authTitle.textContent = isRegisterMode ? 'Регистрация' : 'Вход';
    authSubmit.textContent = isRegisterMode ? 'Создать аккаунт' : 'Войти';
    authSwitchText.textContent = isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?';
    authSwitch.textContent = isRegisterMode ? 'Войти' : 'Зарегистрироваться';
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = authName.value.trim();
    const pass = authPassword.value;

    if (name.length < 3) return showToast('Имя минимум 3 символа', 'error');
    if (pass.length < 4) return showToast('Пароль минимум 4 символа', 'error');

    if (isRegisterMode) {
        if (users[name]) return showToast('Такое имя уже занято', 'error');
        users[name] = pass;
        localStorage.setItem('users', JSON.stringify(users));
        showToast(`✅ Аккаунт "${name}" создан!`, 'success');
    } else {
        if (!users[name]) return showToast('Пользователь не найден', 'error');
        if (users[name] !== pass) return showToast('Неверный пароль', 'error');
    }

    currentUser = name;
    localStorage.setItem('currentUser', name);
    authLabel.textContent = name;
    authModal.classList.remove('open');
    authForm.reset();
    renderPlaylistsList();
    renderTracks();
});

currentUser = localStorage.getItem('currentUser');
if (currentUser && users[currentUser]) {
    authLabel.textContent = currentUser;
}

// ================== ПЛЕЙЛИСТЫ ==================
function renderPlaylistsList() {
    if (!currentUser) {
        playlistsList.innerHTML = '<div style="color: var(--text-dim); font-size: 12px; padding: 8px 12px;">Войди, чтобы создавать плейлисты</div>';
        return;
    }
    const myPls = userPlaylists[currentUser] || [];
    if (myPls.length === 0) {
        playlistsList.innerHTML = '<div style="color: var(--text-dim); font-size: 12px; padding: 8px 12px;">Пока пусто. Нажми +</div>';
        return;
    }
    playlistsList.innerHTML = myPls.map(name => `
        <a href="#" class="playlist-item ${currentPlaylist === name ? 'active' : ''}" data-pl="${escapeHtml(name)}">
            📁 ${escapeHtml(name)}
            <span class="del" data-del="${escapeHtml(name)}">✕</span>
        </a>
    `).join('');

    playlistsList.querySelectorAll('.playlist-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('del')) {
                e.preventDefault();
                const name = e.target.dataset.del;
                if (confirm(`Удалить плейлист "${name}"?`)) {
                    delete playlists[name];
                    userPlaylists[currentUser] = userPlaylists[currentUser].filter(n => n !== name);
                    localStorage.setItem('playlists', JSON.stringify(playlists));
                    localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
                    if (currentPlaylist === name) currentPlaylist = null;
                    renderPlaylistsList();
                    renderTracks();
                    showToast(`🗑 Плейлист удалён`, 'info');
                }
                return;
            }
            e.preventDefault();
            currentPlaylist = el.dataset.pl;
            currentTracks = allTracks;
            searchInput.value = '';
            renderPlaylistsList();
            renderTracks();
        });
    });
}

addPlaylistBtn.addEventListener('click', () => {
    if (!currentUser) return showToast('Сначала войди в аккаунт', 'error');
    const name = prompt('Название плейлиста:');
    if (!name || !name.trim()) return;
    const n = name.trim();
    if (playlists[n]) return showToast('Такой плейлист уже есть', 'error');

    playlists[n] = { owner: currentUser, trackIds: [] };
    if (!userPlaylists[currentUser]) userPlaylists[currentUser] = [];
    userPlaylists[currentUser].push(n);
    localStorage.setItem('playlists', JSON.stringify(playlists));
    localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
    renderPlaylistsList();
    showToast(`📁 Плейлист "${n}" создан`, 'success');
});

let pendingTrackId = null;

function openPlaylistModal(trackId) {
    if (!currentUser) {
        showToast('Войди в аккаунт, чтобы создавать плейлисты', 'error');
        authModal.classList.add('open');
        return;
    }
    pendingTrackId = trackId;
    const myPls = userPlaylists[currentUser] || [];

    playlistChooser.innerHTML = myPls.length
        ? myPls.map(n => `<div class="playlist-choice" data-pick="${escapeHtml(n)}">📁 ${escapeHtml(n)}</div>`).join('')
        : '<div style="color: var(--text-dim); font-size: 13px; margin-bottom: 12px;">Плейлистов пока нет</div>';

    playlistChooser.innerHTML += '<div class="playlist-choice new" data-pick="__new__">+ Создать новый плейлист</div>';

    playlistChooser.querySelectorAll('.playlist-choice').forEach(el => {
        el.addEventListener('click', () => {
            const pick = el.dataset.pick;
            let targetName = pick;

            if (pick === '__new__') {
                const name = prompt('Название плейлиста:');
                if (!name || !name.trim()) return;
                targetName = name.trim();
                if (!playlists[targetName]) {
                    playlists[targetName] = { owner: currentUser, trackIds: [] };
                    if (!userPlaylists[currentUser]) userPlaylists[currentUser] = [];
                    userPlaylists[currentUser].push(targetName);
                    localStorage.setItem('playlists', JSON.stringify(playlists));
                    localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
                }
            }

            const pl = playlists[targetName];
            if (!pl) return;
            if (pl.trackIds.includes(pendingTrackId)) {
                showToast('Этот трек уже в плейлисте', 'info');
                return;
            }
            pl.trackIds.push(pendingTrackId);
            localStorage.setItem('playlists', JSON.stringify(playlists));
            showToast(`✅ Добавлено в "${targetName}"`, 'success');
            playlistModal.classList.remove('open');
            renderPlaylistsList();
        });
    });

    playlistModal.classList.add('open');
}

playlistClose.addEventListener('click', () => playlistModal.classList.remove('open'));
playlistModal.addEventListener('click', (e) => { if (e.target === playlistModal) playlistModal.classList.remove('open'); });

// ================== DRAG & DROP ==================
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f =>
        f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac|opus)$/i.test(f.name)
    );
    if (files.length === 0) return;

    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change'));
});

// ================== ГОРЯЧИЕ КЛАВИШИ ==================
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight':
            nextTrack();
            break;
        case 'ArrowLeft':
            playTrack(currentIndex - 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            volumeSlider.value = Math.min(100, +volumeSlider.value + 5);
            audio.volume = volumeSlider.value / 100;
            break;
        case 'ArrowDown':
            e.preventDefault();
            volumeSlider.value = Math.max(0, +volumeSlider.value - 5);
            audio.volume = volumeSlider.value / 100;
            break;
    }
});

// ================== СТАРТ ==================
initTheme();
restoreTracks();
renderPlaylistsList();