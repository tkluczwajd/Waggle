// data/wikiTrainingData.js

export const TRAINING_ARTICLES = [
    { 
        id: "train_tree", 
        title: "Metoda Drzewa (Luźna smycz)", 
        category: "Spacer",
        difficulty: "Podstawowy 🟢",
        readTime: "2 min",
        keywords: ["smycz", "ciągnięcie", "spacer", "napięcie", "ciągnie"], 
        related: ["train_eye", "train_bingo"],
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🎯 CEL</h4>
            <p style="margin-top: 5px; font-size: 14px; color: var(--text-color);">Nauczenie psa, że ciągnięcie nie działa, a spacer kontynuujemy tylko na luźnej smyczy.</p>

            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🛠️ JAK TO ZROBIĆ (KROKI)</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Gdy tylko poczujesz napięcie smyczy – <b>zatrzymaj się natychmiast</b>.</li>
                <li>Stój nieruchomo jak drzewo. Nie odzywaj się do psa.</li>
                <li>Poczekaj, aż pies sam zrezygnuje z ciągnięcia (poluzuje smycz lub odwróci się do Ciebie).</li>
                <li>Gdy smycz jest luźna – powiedz "Dobrze!" i ruszcie przed siebie (to jest jego nagroda).</li>
            </ul>

            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li><b>Nie szarp psa w tył!</b> To wyzwala w nim odruch oporu i ciągnie jeszcze mocniej.</li>
                <li>Nie powtarzaj w kółko "nie ciągnij", zachowaj absolutną ciszę i spokój.</li>
            </ul>
        ` 
    },
    { 
        id: "train_asphalt", 
        title: "Reguła 5 Sekund (Ochrona łap w lato)", 
        category: "Bezpieczeństwo",
        difficulty: "Podstawowy 🟢",
        readTime: "1 min",
        keywords: ["lato", "asfalt", "upał", "poparzenie", "poduszki", "chodnik"], 
        related: ["sit_heat"],
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🎯 CEL</h4>
            <p style="margin-top: 5px; font-size: 14px; color: var(--text-color);">Zabezpieczenie delikatnych opuszek psa przed poparzeniem trzeciego stopnia.</p>

            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🛠️ TEST 5 SEKUND</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zanim wyjdziesz z psem, przyłóż wewnętrzną część dłoni płasko do asfaltu.</li>
                <li>Spróbuj przytrzymać ją tam przez pełne 5 sekund.</li>
                <li>Jeśli podłoże parzy Ciebie – poparzy również łapy Twojego psa!</li>
            </ul>

            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Spacerów po betonowych chodnikach między godziną 11:00 a 16:00 w upalne dni. Wybieraj leśne ścieżki i trawę.</li>
            </ul>
        ` 
    },
    { 
        id: "train_bingo", 
        title: "Przywołanie Awaryjne (Słowo Życia)", 
        category: "Bezpieczeństwo",
        difficulty: "Średni 🟡",
        readTime: "3 min",
        keywords: ["ucieczka", "przywołanie", "bingo", "zagrożenie", "wróć", "wołąnie"], 
        related: ["train_eye"],
        desc: `
            <div style="background: rgba(52, 172, 224, 0.1); border-left: 4px solid var(--primary); padding: 15px; border-radius: 0 12px 12px 0; margin-bottom: 20px;">
                <b style="color: var(--primary); font-size: 14px;">O CO CHODZI?</b>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-color);">To słowo-klucz, które ratuje życie (np. gdy pies biegnie pod auto). Wypowiedziane oznacza: rzuć wszystko, wracaj do mnie, a dostaniesz najlepszą nagrodę na świecie.</p>
            </div>

            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🛠️ TRENING</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wybierz dźwięczne słowo, którego nie używasz na co dzień (np. "BINGO!", "EKSTRA!").</li>
                <li><b>W domu:</b> Wypowiedz słowo radosnym tonem i natychmiast daj psu najlepszy smakołyk (np. kawałek mięsa). Powtórz to 50 razy przez kilka dni.</li>
                <li><b>W terenie:</b> Stopniowo testuj słowo na zewnątrz, zawsze mając przy sobie nagrodę "premium".</li>
            </ul>

            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nigdy nie używaj tego słowa na darmo, w błahych sytuacjach (np. żeby zapiąć smycz na koniec spaceru). Straci swoją magiczną moc.</li>
            </ul>
        ` 
    },
    { 
        id: "train_rule3", 
        title: "Reguła 3 Sekund (Głaskanie obcych psów)", 
        category: "Socjalizacja",
        difficulty: "Podstawowy 🟢",
        readTime: "2 min",
        keywords: ["głaskanie", "dotyk", "obcy pies", "dzieci", "kontakt", "gryzie"], 
        related: ["sit_dog_fight"],
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🎯 CEL</h4>
            <p style="margin-top: 5px; font-size: 14px; color: var(--text-color);">Bezpieczne i kulturalne przywitanie się z obcym psem, uniknięcie pogryzienia i stresu zwierzęcia.</p>

            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🛠️ JAK PODEJŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zawsze najpierw <b>zapytaj właściciela</b> o zgodę.</li>
                <li>Kucnij lekko bokiem do psa. Wyciągnij delikatnie dłoń, by mógł ją powąchać.</li>
                <li>Pogłaskaj psa przez dokładnie 3 sekundy po klatce piersiowej lub pod brodą.</li>
                <li>Cofnij rękę. Jeśli pies odejdzie – to koniec. Jeśli trąci Cię noskiem – prosi o więcej.</li>
            </ul>

            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li><b>Nigdy nie głaskaj psa po czubku głowy!</b> W psim języku klepanie od góry to gest dominacji lub groźby.</li>
                <li>Nie pochylaj się nad psem i nie patrz mu natarczywie prosto w oczy.</li>
            </ul>
        ` 
    },
    { 
        id: "train_clicker", 
        title: "Trening Klikerowy (Zaznaczanie)", 
        category: "Szkolenie",
        difficulty: "Średni 🟡",
        readTime: "4 min",
        keywords: ["kliker", "szkolenie", "nagroda", "smakołyk", "siad", "nauka"], 
        related: [],
        desc: `
            <div style="background: rgba(52, 172, 224, 0.1); border-left: 4px solid var(--primary); padding: 15px; border-radius: 0 12px 12px 0; margin-bottom: 20px;">
                <b style="color: var(--primary); font-size: 14px;">O CO CHODZI?</b>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-color);">Kliker działa jak przycisk spustu migawki w aparacie. Robi "zdjęcie" zachowaniu psa w konkretnej sekundzie i daje mu znać: "Dokładnie za TO dostajesz nagrodę".</p>
            </div>

            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🛠️ ETAPY TRENINGU</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li><b>Krok 1 (Warunkowanie):</b> Kliknij i natychmiast daj psu smakołyk. Powtórz to 20 razy. Dźwięk musi stać się obietnicą nagrody.</li>
                <li><b>Krok 2 (Nauka np. siadania):</b> Kiedy uczysz komendy "siad", wciśnij kliker w tej ułamku sekundy, w której pośladki psa stykają się z ziemią. Następnie wydaj smakołyk.</li>
            </ul>

            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nie klikaj jak pilotem do telewizora w celu przywołania psa.</li>
                <li>Nie oszukuj. Każdy "klik" to pakt, który musi zakończyć się wydaniem jedzenia.</li>
            </ul>
        ` 
    },
    { 
        id: "train_eye", 
        title: "Nauka Skupienia (Kontakt Wzrokowy)", 
        category: "Szkolenie",
        difficulty: "Średni 🟡",
        readTime: "3 min",
        keywords: ["skupienie", "uwaga", "patrz", "kontakt", "smycz", "bodźce"], 
        related: ["train_tree"],
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🎯 CEL</h4>
            <p style="margin-top: 5px; font-size: 14px; color: var(--text-color);">Zrozumienie przez psa, że najlepszym sposobem na zdobycie nagrody nie jest wymuszanie, lecz spojrzenie w oczy przewodnikowi.</p>

            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🛠️ ĆWICZENIE</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Weź pachnący smakołyk, zamknij go w dłoni i wyciągnij rękę w bok (z dala od swojej twarzy).</li>
                <li>Pies będzie gryzł, lizał i drapał Twoją rękę, by zdobyć jedzenie. <b>Stój nieruchomo jak posąg.</b></li>
                <li>W pewnym momencie pies sfrustrowany brakiem efektu zrezygnuje i <b>spojrzy w Twoje oczy</b> (szukając pomocy).</li>
                <li>Natychmiast powiedz entuzjastyczne "TAK!" i otwórz dłoń, dając mu nagrodę.</li>
            </ul>

            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nie cmokaj i nie wołaj psa po imieniu podczas ćwiczenia. On musi <b>sam</b> wpaść na to rozwiązanie!</li>
            </ul>
        ` 
    }
];
