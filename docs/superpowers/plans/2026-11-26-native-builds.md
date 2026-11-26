[Polski](2026-11-26-native-builds.md) | [English](2026-11-26-native-builds.en.md) | [Deutsch](2026-11-26-native-builds.de.md)

# Plan zgodności i kompilacji natywnych

Użytkownik upoważnił do dalszej implementacji, kompilacji Android/iOS, kolejnych commitów i wysyłania ich do GitHub; komunikaty commitów mają być jednym zdaniem po angielsku, bez informacji o współautorstwie. Zachowaj aplikację Expo58/RN0.88 i rzeczywiste transporty ELM. README i dokumentacja mają być dostępne po polsku, angielsku i niemiecku.

- [x] Sprawdzenie lokalnych narzędzi i dostępu: brak pełnego Xcode i Android SDK; istniejące osobiste konto Expo ma bezpłatny limit kompilacji. Skonfigurowany GitHub origin był pusty.
- [x] Niezależne przeglądy kodu natywnego: interop RN pozostaje dostępny; Directory nie jest dowodem kompilacji. RN0.88.1 uzupełnia namespace TCP, więc łatka TCP nie jest potrzebna. Brak BuildConfig w Classic potwierdził kompilator Androida.
- [x] Weryfikacja stanu wyjściowego (135 testów, typy/lint), commit na codex/native-build-compat, bez ustawień IDE i poświadczeń.
- [x] Archiwum ograniczone allowlistą, profile walidacji bez poświadczeń i przypisany projekt Expo; kontrola zawartości przed wysłaniem (101 plików przed pluginem Classic, 102 po nim).
- [x] Rzeczywiste kompilacje chmurowe Android Release APK i iOS Release na symulator, rozpoznanie błędu Classic, odtwarzalna poprawka przez plugin CNG, ponowny sukces kompilatora. Brak ręcznych zmian wygenerowanych projektów.
- [x] Produkcyjny Android AAB zbudowano po jawnej zgodzie na nowy klucz w Expo; potwierdzono podpis, manifest, Bundletool i wyrównanie bibliotek.
- [ ] Sklepowe IPA jest zablokowane brakiem aktywnego konta Apple Developer; nie publikuj i nie zobowiązuj się do nowych opłat.
- [x] Kontrola powtarzanego prebuild, testów, typów/lint, archiwum i pobranych artefaktów; niezależny przegląd poprawki, kolejne commity/push. Sprawdzono także wynikowy AAB.
- [x] Wszystkie dokumenty Markdown w trzech językach, przełączniki i indeks dokumentacji, zgodność poleceń i sprawdzenie odnośników; instrukcje AGENTS.md i raporty o strukturze maszynowej zachowują składnię źródłową.

Kompilacja, podpisywanie i test sprzętowy stanowią odrębne dowody. Kompilacja na symulator nie jest sklepowym IPA, interop nie jest przepisaniem na TurboModules, a ostrzeżenie Directory nie jest wyciszane w celu uzyskania zielonego wyniku. Szczegóły: [raport kompilacji](../../verification/2026-11-26-native-builds.md).
