import { ref } from "vue";
import type { AudioFiles } from "@/types";

// Sound-related type definitions
type SoundType = keyof AudioFiles;

interface SoundStateDetail {
  muted: boolean;
}

// Create a single instance of the sound service to be shared
let serviceInstance: ReturnType<typeof createSoundService> | null = null;

// Create the actual service implementation
function createSoundService() {
  const isLoaded = ref(false);
  const isMuted = ref(false);
  const loadingPromise = ref<Promise<void> | null>(null);

  // Initialize audio elements
  const audio: AudioFiles = {
    flip: new Audio("/sounds/flip.mp3"),
    match: new Audio("/sounds/match.mp3"),
    win: new Audio("/sounds/win.mp3"),
  };

  // Preload all sounds
  const preloadSounds = () => {
    // Only preload once
    if (loadingPromise.value) {
      return loadingPromise.value;
    }

    // Set up all audio elements for autoplay
    Object.values(audio).forEach((sound) => {
      // Necessary for mobile devices
      sound.setAttribute("playsinline", "true");
      sound.volume = 0.6;
    });

    loadingPromise.value = new Promise<void>((resolve) => {
      // Setup event listeners for each sound
      const promises = Object.values(audio).map((sound) => {
        return new Promise<void>((resolveSound) => {
          // Listen for canplaythrough or error
          sound.addEventListener("canplaythrough", () => resolveSound(), {
            once: true,
          });
          sound.addEventListener(
            "error",
            (e: Event) => {
              console.error("Error loading sound:", e);
              resolveSound(); // Resolve anyway to not block the game
            },
            { once: true },
          );

          // Start loading
          sound.load();
        });
      });

      // Wait for all sounds to be ready
      Promise.all(promises).then(() => {
        isLoaded.value = true;
        resolve();
      });
    });

    return loadingPromise.value;
  };

  // Play a sound effect with improved error handling
  const playSound = (sound: SoundType): Promise<void> => {
    if (isMuted.value) {
      return Promise.resolve();
    }

    if (!isLoaded.value) {
      console.warn(`Sound ${sound} not ready yet, attempting to play anyway`);
    }

    try {
      const soundElement = audio[sound];
      soundElement.currentTime = 0;

      // Use the play promise to catch errors
      return soundElement.play().catch((error: Error) => {
        console.error(`Error playing ${sound} sound:`, error);
      });
    } catch (error) {
      console.error(`Error playing ${sound} sound:`, error);
      return Promise.reject(error);
    }
  };

  // Toggle mute with improved event handling
  const toggleMute = (): void => {
    isMuted.value = !isMuted.value;

    // Play a test sound when unmuting to confirm
    if (!isMuted.value) {
      setTimeout(() => {
        const testSound = new Audio("/sounds/flip.mp3");
        testSound.volume = 0.2;
        testSound
          .play()
          .catch((err) => console.error("Test sound failed:", err));
      }, 100);
    }

    // Persist mute preference
    saveMutePreference();

    // Notify UI about state change
    notifySoundStateChange();
  };

  // Save mute preference to local storage
  const saveMutePreference = (): void => {
    localStorage.setItem("memoryGameMuted", isMuted.value.toString());
  };

  // Dispatch event to notify UI about sound state changes
  const notifySoundStateChange = (): void => {
    document.dispatchEvent(
      new CustomEvent<SoundStateDetail>("sound-state-changed", {
        detail: { muted: isMuted.value },
      }),
    );
  };

  // Load mute preference from local storage
  const loadMutePreference = (): void => {
    const savedMute = localStorage.getItem("memoryGameMuted");
    if (savedMute !== null) {
      isMuted.value = savedMute === "true";
      console.log(
        `Loaded mute preference: ${isMuted.value ? "muted" : "unmuted"}`,
      );
    }
  };

  return {
    isLoaded,
    isMuted,
    preloadSounds,
    playSound,
    toggleMute,
    loadMutePreference,
  };
}

// Export singleton instance
export const useSoundEffects = () => {
  if (!serviceInstance) {
    serviceInstance = createSoundService();
  }
  return serviceInstance;
};
