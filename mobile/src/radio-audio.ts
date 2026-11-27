type SpeechEngine = {
  getAvailableVoicesAsync(): Promise<{ language: string }[]>;
  speak(text: string, options: { language: string; useApplicationAudioSession: boolean; onDone: () => void; onStopped: () => void; onError: (error: Error) => void }): void;
  stop(): Promise<void>;
};

// Playback completion confirms only that the OS speech engine finished, not its output route.
export function createRadioAudioTest(speech: SpeechEngine, timeoutMs = 20000) {
  let cancel: (() => void) | null = null;
  return {
    play(text = 'VehicleSenseX. Próba dźwięku. Jeśli słyszysz ten komunikat w głośnikach samochodu, telefon przesyła dźwięk do radia.'): Promise<void> {
      if (typeof text !== 'string' || !text.trim() || text.length > 2000) return Promise.reject(new Error('Nieprawidłowy komunikat do odczytania.'));
      if (cancel) return Promise.reject(new Error('Próba dźwięku już trwa.'));
      return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error?: Error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          cancel = null;
          if (error) reject(error); else resolve();
        };
        const timer = setTimeout(() => {
          finish(new Error('Przekroczono czas próby dźwięku. Sprawdź systemową syntezę mowy.'));
          void speech.stop().catch(() => {});
        }, timeoutMs);
        cancel = () => finish(new Error('Próba dźwięku została przerwana.'));
        void (async () => {
          try {
            const voices = await speech.getAvailableVoicesAsync();
            if (settled) return;
            if (!voices.length) { finish(new Error('Brak głosu syntezy mowy. Zainstaluj głos w ustawieniach systemu.')); return; }
            speech.speak(text, {
            language: 'pl-PL', useApplicationAudioSession: false,
            onDone: () => finish(),
            onStopped: () => finish(new Error('Próba dźwięku została przerwana.')),
            onError: () => finish(new Error('Błąd syntezy mowy. Sprawdź głos i ustawienia dźwięku telefonu.')),
          });
          } catch {
            finish(new Error('Nie udało się uruchomić syntezy mowy.'));
          }
        })();
      });
    },
    async stop(): Promise<void> {
      if (!cancel) return;
      cancel();
      await speech.stop();
    },
  };
}
