export const EMERGENCY_ARTICLES = [
    { 
        id: "sit_tick_remove", 
        title: "Jak bezpiecznie wyjąć kleszcza?", 
        category: "Pierwsza pomoc",
        priority: "warning",
        readTime: "2 min",
        keywords: ["kleszcz", "pasożyt", "kleszczołapki", "pęseta", "owad", "skóra", "wbity"], 
        related: [],
        desc: `Użyj specjalistycznych kleszczołapek, pętli lub dobrej pęsety. Rozsuń sierść, chwyć kleszcza tuż przy samej skórze psa. Zdecydowanym, płynnym ruchem pociągnij go pionowo w górę.<div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE wykręcaj (możesz ukręcić odwłok).</div><div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE smaruj kleszcza masłem, olejem, alkoholem ani lakierem do paznokci!</div><div class="wiki-tip wiki-tip-success"><span>✅</span> Po wszystkim zdezynfekuj ranę i obserwuj psa przez 2 tygodnie.</div>` 
    },
    { 
        id: "sit_burdock", 
        title: "Rzepy i Osty w sierści – Szybkie usuwanie", 
        category: "Pielęgnacja",
        priority: "info",
        readTime: "1 min",
        keywords: ["rzep", "osty", "kołtun", "sierść", "krzaki", "czesanie", "filc"], 
        related: [],
        desc: "Wyciąganie suchych rzepów na sucho sprawia psu ogromny ból. Aby zrobić to bezstresowo, nałóż na splątany kołtun odrobinę psiej odżywki lub oliwki. Wmasuj tłuszcz w strukturę rzepu i odczekaj minutę. Powstały poślizg pozwoli Ci bez problemu rozplątać kołtun." 
    },
    { 
        id: "sit_poison", 
        title: "⚠️ Podejrzenie Zatrucia", 
        category: "Zagrożenie życia",
        priority: "danger",
        readTime: "2 min",
        keywords: ["trucizna", "trutka", "padlina", "wymioty", "zjedzenie", "vet"], 
        related: ["train_bingo"],
        desc: `Masz maksymalnie 1-2 godziny na reakcję.<div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE podawaj psu mleka (przyspiesza wchłanianie trucizn)!</div><div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE podawaj oleju.</div><div class="wiki-tip wiki-tip-success"><span>✅</span> Jedź prosto do najbliższej całodobowej kliniki weterynaryjnej!</div>` 
    },
    { 
        id: "sit_wasp", 
        title: "Użądlenie przez osę lub pszczołę", 
        category: "Pierwsza pomoc",
        priority: "warning",
        readTime: "2 min",
        keywords: ["osa", "pszczoła", "użądlenie", "opuchlizna", "pysk"], 
        related: [],
        desc: `<div class="wiki-tip wiki-tip-success"><span>✅</span> Jeśli użądlenie jest w łapę lub grzbiet, przyłóż zimny kompres z wodą i octem.</div><div class="wiki-tip wiki-tip-warning"><span>⚠️</span> Jeśli użądlenie nastąpiło w okolicę pyska lub gardła – natychmiast pędź do weterynarza! Opuchlizna grozi uduszeniem.</div>` 
    },
    { 
        id: "sit_heat", 
        title: "🥵 Udar Cieplny", 
        category: "Zagrożenie życia",
        priority: "danger",
        readTime: "3 min",
        keywords: ["udar", "ciepło", "lato", "słońce", "dyszenie", "mdleje"], 
        related: ["train_asphalt"],
        desc: `<div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIGDY nie wrzucaj przegrzanego psa do lodowatej wody i nie polewaj lodem! Wywołasz szok termiczny.</div><div class="wiki-tip wiki-tip-success"><span>✅</span> Przenieś psa w cień, owiń brzuch i pachwiny ręcznikami nasączonymi chłodną (nie lodowatą!) wodą. Zapewnij nawiew.</div>` 
    },
    { 
        id: "sit_dog_fight", 
        title: "Atak i Walka psów", 
        category: "Behawior",
        priority: "danger",
        readTime: "3 min",
        keywords: ["walka", "pogryzienie", "atak", "agresja", "rozdzielanie"], 
        related: ["train_rule3"],
        desc: `<div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIGDY nie wkładaj rąk w okolice pysków – zostaniesz pogryziony.</div><div class="wiki-tip wiki-tip-success"><span>✅</span> Metoda 'Taczka': łap psy za tylne nogi w pachwinach i unoś do góry, cofając się po łuku.</div>` 
    },
    {
        id: 'sos_diarrhea',
        title: 'Biegunka u psa – pierwsza pomoc',
        category: 'Waggle SOS 🏥',
        difficulty: 'Podstawowy',
        readTime: '2 min',
        tags: ['biegunka', 'żołądek', 'niestrawność', 'sos', 'zatrucie'],
        keywords: ['biegunka', 'sraczka', 'luźny stolec', 'rozwolnienie'],
        related: ['sos_wymioty', 'sos_odwodnienie'],
        flags: {
            green: [
                "Jednorazowy lub dwukrotny luźny stolec",
                "Pies jest radosny, ma energię i chętnie pije wodę",
                "Brak innych objawów (brak wymiotów, gorączki)"
            ],
            yellow: [
                "Biegunka trwa dłużej niż 24-48 godzin",
                "Pies jest lekko osowiały lub odmawia jedzenia",
                "Objawy nawracają regularnie co kilka dni"
            ],
            red: [
                "W stolcu widoczna jest krew (jasnoczerwona lub bardzo ciemna, smolista)",
                "Biegunce towarzyszą jednoczesne wymioty (skrajne ryzyko odwodnienia!)",
                "Pies jest całkowicie apatyczny, słania się na nogach",
                "Podejrzenie zjedzenia trutki, chemii lub śmieci na spacerze"
            ]
        },
        desc: `
            <p>Luźny stolec u psa najczęściej wynika z nagłej zmiany karmy, zjedzenia czegoś nieświeżego na spacerze lub lekkiego stresu. Jeśli pies jest w <b>zielonej strefie</b>, możesz pomóc mu w domu.</p>
            
            <h3>Co możesz zrobić samemu?</h3>
            <ul>
                <li><b>Głodówka (opcjonalnie):</b> U dorosłego, silnego psa można zastosować 12-24 h głodówki, aby dać jelitom odpocząć. <i>Uwaga: Nigdy nie głodź szczeniąt ani psów miniaturowych bez konsultacji z weterynarzem!</i></li>
                <li><b>Lekkostrawna dieta:</b> Po przerwie w jedzeniu wprowadź dietę lekkostrawną: rozgotowany ryż, gotowana marchewka oraz gotowana pierś z kurczaka/indyka (bez soli i przypraw!). Podawaj małe porcje 4-5 razy dziennie.</li>
                <li><b>Stały dostęp do wody:</b> Biegunka drastycznie odwadnia organizm. Pilnuj, by miska z wodą była zawsze pełna. Możesz podać psu psie elektrolity.</li>
            </ul>
            
            <h3>Bezpieczne leki z domowej apteczki</h3>
            <p>Po konsultacji telefonicznej z lekarzem weterynarii, przy lekkich stanach można podać psu <b>węgiel aktywny</b> (wiąże toksyny) lub <b>Smectę</b>. Zawsze pytaj o dawkowanie dopasowane do wagi Twojego psa!</p>
        `
    },
    {
        id: 'sos_wymioty',
        title: 'Pies zwymiotował',
        category: 'Waggle SOS 🏥',
        difficulty: 'Podstawowy',
        readTime: '2 min',
        tags: ['wymioty', 'zatrucie', 'żołądek', 'sos'],
        keywords: ['wymioty', 'rzyga', 'zwraca'],
        related: ['sos_biegunka', 'sos_odwodnienie'],
        // 🔥 NOWY SYSTEM FLAGG WAGGLE SOS
        flags: {
            green: [
                "Pojedyncze, jednorazowe wymioty",
                "Pies zachowuje się normalnie i ma energię",
                "Pije wodę",
                "Nie ma innych objawów"
            ],
            yellow: [
                "Wymioty powtarzają się częściej niż raz w ciągu 12h",
                "Pies jest osowiały, nie chce się bawić",
                "Brak apetytu przez ponad dobę"
            ],
            red: [
                "Krew w wymiocinach (czerwona lub fusy jak z kawy)",
                "Częste, bezskuteczne próby wymiotów (odruchy)",
                "Powiększony, twardy i bolesny brzuch",
                "Utrata przytomności lub skrajne osłabienie"
            ]
        },
        desc: `
            Wymioty u psa to bardzo częsta dolegliwość, która w 80% przypadków wynika ze zjedzenia czegoś na spacerze. 
            Najważniejsza jest obserwacja. Jeśli pies zwymiotował raz, ale zachowuje się normalnie, po prostu zrób mu 12-godzinną głodówkę, 
            ale zapewnij stały dostęp do świeżej wody... (reszta standardowego tekstu artykułu).
        `
    }
];
