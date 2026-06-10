export const EMERGENCY_ARTICLES = [
    { 
        id: "sit_tick_remove", 
        title: "Jak bezpiecznie wyjąć kleszcza?", 
        category: "Pasożyty i Owady",
        difficulty: "Podstawowy 🟢",
        readTime: "2 min",
        keywords: ["kleszcz", "pasożyt", "kleszczołapki", "pęseta", "owad", "skóra", "wbity"], 
        related: [],
        content: `Użyj specjalistycznych kleszczołapek, pętli lub dobrej pęsety. Rozsuń sierść, chwyć kleszcza tuż przy samej skórze psa. Zdecydowanym, płynnym ruchem pociągnij go pionowo w górę.<br><br><div style="color: var(--danger); font-weight: bold;">⚠️ NIE wykręcaj (możesz ukręcić odwłok).</div><div style="color: var(--danger); font-weight: bold;">⚠️ NIE smaruj kleszcza masłem, olejem, alkoholem ani lakierem do paznokci!</div><br><b>✅ Po wszystkim zdezynfekuj ranę i obserwuj psa przez 2 tygodnie.</b>` 
    },
    { 
        id: "sit_burdock", 
        title: "Rzepy i Osty w sierści – Szybkie usuwanie", 
        category: "Pielęgnacja",
        difficulty: "Łatwe 🟢",
        readTime: "1 min",
        keywords: ["rzep", "osty", "kołtun", "sierść", "krzaki", "czesanie", "filc"], 
        related: [],
        content: "Wyciąganie suchych rzepów na sucho sprawia psu ogromny ból. Aby zrobić to bezstresowo, nałóż na splątany kołtun odrobinę psiej odżywki lub oliwki. Wmasuj tłuszcz w strukturę rzepu i odczekaj minutę. Powstały poślizg pozwoli Ci bez problemu rozplątać kołtun." 
    },
    { 
        id: "sit_poison", 
        title: "⚠️ Podejrzenie Zatrucia", 
        category: "Zatrucia",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        keywords: ["trucizna", "trutka", "padlina", "wymioty", "zjedzenie", "vet"], 
        related: ["sos_wymioty", "sos_czekolada", "sos_ksylitol"],
        content: `<h3>Masz maksymalnie 1-2 godziny na reakcję.</h3><br><div style="color: var(--danger); font-weight: bold;">⚠️ NIE podawaj psu mleka (przyspiesza wchłanianie trucizn)!</div><div style="color: var(--danger); font-weight: bold;">⚠️ NIE podawaj oleju.</div><br><b>✅ Jedź prosto do najbliższej całodobowej kliniki weterynaryjnej! Zabezpiecz to, co zjadł pies.</b>` 
    },
    { 
        id: "sit_wasp", 
        title: "Użądlenie przez osę lub pszczołę", 
        category: "Pasożyty i Owady",
        difficulty: "Średnie 🟡",
        readTime: "2 min",
        keywords: ["osa", "pszczoła", "użądlenie", "opuchlizna", "pysk"], 
        related: [],
        content: `<b>✅</b> Jeśli użądlenie jest w łapę lub grzbiet, przyłóż zimny kompres z wodą i octem.<br><br><div style="color: var(--danger); font-weight: bold;">⚠️ Jeśli użądlenie nastąpiło w okolicę pyska lub gardła – natychmiast pędź do weterynarza! Opuchlizna grozi uduszeniem.</div>` 
    },
    { 
        id: "sit_heat", 
        title: "🥵 Przegrzanie i Udar Cieplny", 
        category: "Zagrożenia życia",
        difficulty: "Krytyczne 🔴",
        readTime: "3 min",
        keywords: ["udar", "ciepło", "lato", "słońce", "dyszenie", "mdleje"], 
        related: [],
        content: `
            <h3>Jak rozpoznać udar?</h3>
            <p>Psy chłodzą się głównie przez ziajanie. W gorące dni, w rozgrzanym aucie (nawet przy uchylonym oknie!) temperatura ciała psa może błyskawicznie wzrosnąć do śmiertelnego poziomu.</p>
            <h3>Objawy:</h3>
            <ul>
                <li>Intensywne, głośne ziajanie</li>
                <li>Ciemnoczerwone lub fioletowe dziąsła i język</li>
                <li>Zataczanie się, dezorientacja, wymioty</li>
            </ul>
            <h3>Co robić? (Działaj natychmiast)</h3>
            <p><b>1. Przenieś psa do chłodnego miejsca:</b> W cień lub do klimatyzowanego pomieszczenia.</p>
            <p><b>2. Rozpocznij chłodzenie stopniowo:</b> Przykładaj chłodne (NIE lodowate!) i mokre ręczniki na brzuch, pachwiny i pachy psa.</p>
            <p><b>3. Zapewnij przewiew:</b> Włącz wiatrak lub wachluj psa.</p>
            <div style="color: var(--danger); font-weight: bold; margin-top: 10px;">⚠️ NIGDY nie wrzucaj przegrzanego psa do lodowatej wody i nie polewaj lodem! Wywołasz szok termiczny.</div>
        ` 
    },
    { 
        id: "sit_dog_fight", 
        title: "Atak i Walka psów", 
        category: "Behawior",
        difficulty: "Krytyczne 🔴",
        readTime: "3 min",
        keywords: ["walka", "pogryzienie", "atak", "agresja", "rozdzielanie"], 
        related: [],
        content: `<div style="color: var(--danger); font-weight: bold;">⚠️ NIGDY nie wkładaj rąk w okolice pysków – zostaniesz pogryziony.</div><br><b>✅ Metoda 'Taczka':</b> łap psy za tylne nogi w pachwinach i unoś do góry, cofając się po łuku.` 
    },
    {
        id: 'sos_diarrhea',
        title: 'Ostra biegunka',
        category: 'Układ pokarmowy',
        difficulty: 'Średnie 🟡',
        readTime: '2 min',
        tags: ['biegunka', 'żołądek', 'niestrawność', 'sos', 'zatrucie'],
        keywords: ['biegunka', 'sraczka', 'luźny stolec', 'rozwolnienie'],
        related: ['sos_wymioty'],
        flags: {
            green: ["Jednorazowy lub dwukrotny luźny stolec", "Pies jest radosny i chętnie pije wodę"],
            yellow: ["Biegunka trwa dłużej niż 24-48 godzin", "Pies jest lekko osowiały"],
            red: ["W stolcu widoczna jest krew (jasnoczerwona lub ciemna)", "Biegunce towarzyszą wymioty", "Podejrzenie zjedzenia trutki"]
        },
        content: `
            <p>Biegunka to najczęściej efekt zjedzenia "śmieci" na spacerze, nagłej zmiany karmy, stresu lub infekcji pasożytniczej.</p>
            <h3>Co robić w łagodnych przypadkach?</h3>
            <p><b>1. Głodówka:</b> Wstrzymaj podawanie jedzenia na 12-24 godziny (szczeniaki max 6 godzin). Przewód pokarmowy musi się oczyścić.</p>
            <p><b>2. Nawadnianie:</b> Biegunka odwadnia. Upewnij się, że pies pije. Jeśli odmawia, dolej do wody odrobinę niesłonego rosołu na zachętę.</p>
            <p><b>3. Leki z domowej apteczki:</b> Możesz podać węgiel aktywny (wiąże toksyny) lub Smectę, jednak skonsultuj dawkę z weterynarzem.</p>
            <p><b>4. Delikatna dieta:</b> Po głodówce wracaj z jedzeniem powoli (np. rozgotowany ryż z kurczakiem).</p>
        `
    },
    {
        id: 'sos_wymioty',
        title: 'Gwałtowne wymioty',
        category: 'Układ pokarmowy',
        difficulty: 'Średnie 🟡',
        readTime: '3 min',
        tags: ['wymioty', 'zatrucie', 'żołądek', 'sos'],
        keywords: ['wymioty', 'rzyga', 'zwraca'],
        related: ['sos_diarrhea', 'sit_poison', 'sos_czekolada'],
        flags: {
            green: ["Pojedyncze, jednorazowe wymioty", "Pies zachowuje się normalnie", "Pije wodę"],
            yellow: ["Wymioty powtarzają się częściej niż raz w ciągu 12h", "Brak apetytu przez dobę"],
            red: ["Krew w wymiocinach", "Częste, bezskuteczne próby wymiotów (ryzyko skrętu żołądka!)", "Utrata przytomności"]
        },
        content: `
            <h3>Kiedy to norma, a kiedy zagrożenie?</h3>
            <p>Pies, który zwymiotuje raz zjedzoną trawą lub z powodu zbyt łapczywego jedzenia i czuje się dobrze, zazwyczaj nie wymaga interwencji. Problem pojawia się, gdy wymioty są uporczywe.</p>
            <h3>Co robić w łagodnych przypadkach?</h3>
            <p><b>1. Głodówka:</b> Zrób psu 12 do 24 godzin głodówki (nie dotyczy szczeniąt!). Daj żołądkowi odpocząć.</p>
            <p><b>2. Woda małymi porcjami:</b> Zapewnij dostęp do wody, ale jeśli pies pije łapczywie i od razu wymiotuje, dawaj mu lizać kostki lodu lub podawaj wodę w bardzo małych ilościach (np. 1-2 łyżki co godzinę).</p>
            <p><b>3. Powrót do jedzenia:</b> Jeśli wymioty ustąpiły, podaj lekki posiłek.</p>
        `
    },
    {
        id: "sos_czekolada",
        title: "Zatrucie czekoladą",
        category: "Zatrucia",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        keywords: ["czekolada", "kakao", "zatrucie"],
        related: ["sos_wymioty", "sos_ksylitol", "sit_poison"],
        content: `
            <h3>Dlaczego to niebezpieczne?</h3>
            <p>Czekolada zawiera teobrominę, której psy nie potrafią metabolizować. Im ciemniejsza czekolada, tym bardziej toksyczna.</p>
            <h3>Objawy (pojawiają się po 2-12 godzinach):</h3>
            <ul>
                <li>Wymioty i biegunka</li>
                <li>Nadmierne pragnienie i pobudzenie</li>
                <li>Przyspieszone bicie serca, drgawki</li>
            </ul>
            <h3>Co robić?</h3>
            <p><b>1. Ustal ile i co zjadł:</b> Oszacuj ilość zjedzonej czekolady. Zachowaj opakowanie.</p>
            <p><b>2. Zadzwoń do weterynarza:</b> Podaj wagę psa oraz ilość czekolady. Lekarz oceni, czy dawka jest toksyczna.</p>
            <p><b>3. Nie wywołuj wymiotów sam:</b> Chyba że weterynarz wyraźnie Ci to poleci przez telefon.</p>
        `
    },
    {
        id: "sos_ksylitol",
        title: "Zatrucie ksylitolem (brzozowym cukrem)",
        category: "Zatrucia",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        keywords: ["ksylitol", "cukier", "guma", "zatrucie"],
        related: ["sos_czekolada", "sit_poison"],
        content: `
            <h3>Dlaczego to niebezpieczne?</h3>
            <p>Ksylitol powoduje u psów gwałtowny wyrzut insuliny, drastyczny spadek cukru (hipoglikemię) i niewydolność wątroby.</p>
            <h3>Objawy (nawet po 15-30 minutach):</h3>
            <ul>
                <li>Wymioty</li>
                <li>Osłabienie, brak koordynacji</li>
                <li>Omdlenia, drgawki</li>
            </ul>
            <h3>Co robić?</h3>
            <p><b>1. Liczy się każda minuta!</b> Natychmiast zabierz psa do kliniki.</p>
            <p><b>2. Awaryjnie:</b> Jeśli do weta masz daleko, a pies może połykać, weterynarz przez telefon może zalecić podanie syropu klonowego lub miodu na dziąsła.</p>
        `
    },
    {
        id: "sos_skaleczenie_lapy",
        title: "Skaleczenie opuszki (łapy)",
        category: "Urazy",
        difficulty: "Średnie 🟡",
        readTime: "2 min",
        keywords: ["łapa", "opuszka", "skaleczenie", "szkło", "krew"],
        related: ["sos_skrecenie"],
        content: `
            <h3>Co się stało?</h3>
            <p>Pies nadepnął na szkło lub ostry kamień. Opuszki są mocno ukrwione, krwawienie może być obfite.</p>
            <h3>Co robić?</h3>
            <p><b>1. Oczyść ranę:</b> Przemyj chłodną wodą lub solą fizjologiczną.</p>
            <p><b>2. Zatamuj krwawienie:</b> Przyłóż czysty gazik i uciskaj delikatnie przez 5-10 minut.</p>
            <p><b>3. Załóż opatrunek:</b> Zawiń łapę bandażem (włóż gaziki między palce). Nie zaciskaj zbyt mocno!</p>
            <p><b>4. Obserwuj:</b> Jeśli krew nie ustaje po 15 minutach, jedź do weterynarza (może wymagać szycia).</p>
        `
    },
    {
        id: "sos_skrecenie",
        title: "Skręcenie lub zwichnięcie łapy",
        category: "Urazy",
        difficulty: "Średnie 🟡",
        readTime: "2 min",
        keywords: ["skręcenie", "zwichnięcie", "kulawizna", "łapa"],
        related: ["sos_skaleczenie_lapy"],
        content: `
            <h3>Objawy:</h3>
            <p>Nagła kulawizna. Pies unika stawiania ciężaru na łapie, może popiskiwać, a staw może być opuchnięty.</p>
            <h3>Co robić?</h3>
            <p><b>1. Ogranicz ruch:</b> Zapnij psa na smycz. Nie pozwól mu biegać ani skakać.</p>
            <p><b>2. Zimny okład:</b> Przyłóż chłodny okład na 10 minut na opuchnięte miejsce.</p>
            <div style="color: var(--danger); font-weight: bold; margin-top: 10px;">⚠️ Nie podawaj ludzkich leków! Ibuprofen czy paracetamol są toksyczne dla psów.</div>
            <p><b>3. Konsultacja:</b> Urazy łatwo pomylić z zerwaniem więzadeł. Umów wizytę u weterynarza.</p>
        `
    },
    {
        id: "sos_zmija",
        title: "Ukąszenie przez żmiję",
        category: "Nagłe wypadki",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        keywords: ["żmija", "wąż", "ukąszenie", "jad"],
        related: ["sit_poison"],
        content: `
            <h3>Objawy:</h3>
            <ul>
                <li>Nagły pisk lub skowyt w trawie</li>
                <li>Szybko narastający, bolesny obrzęk pyska lub łapy</li>
                <li>Ślinotok, osłabienie</li>
            </ul>
            <h3>Co robić?</h3>
            <p><b>1. Zachowaj spokój:</b> Emocje i wysiłek fizyczny przyspieszają rozchodzenie się jadu.</p>
            <p><b>2. Unieruchom psa:</b> Weź psa na ręce. Jeśli jest za duży – idźcie do auta bardzo powoli.</p>
            <div style="color: var(--danger); font-weight: bold; margin-top: 10px;">⚠️ NIE wysysaj jadu! NIE nacinaj rany! NIE zakładaj opaski uciskowej!</div>
            <p><b>3. Pędem do weterynarza:</b> Zadzwoń do kliniki po drodze, by przygotowali leki przeciwwstrząsowe.</p>
        `
    },
    {
        id: "sos_prad",
        title: "Porażenie prądem",
        category: "Nagłe wypadki",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        keywords: ["prąd", "kabel", "porażenie"],
        related: [],
        content: `
            <h3>Objawy:</h3>
            <p>Oparzenia wokół pyska, duszności, ślinotok, drgawki, utrata przytomności.</p>
            <h3>Co robić?</h3>
            <p><b>1. Odłącz zasilanie!</b> Nie dotykaj psa, dopóki nie odłączysz korków lub wtyczki.</p>
            <p><b>2. Odsuń psa od kabla:</b> Użyj drewnianego kija (np. od szczotki).</p>
            <p><b>3. Sprawdź oddech:</b> Jeśli pies nie oddycha, konieczna jest resuscytacja.</p>
            <p><b>4. Natychmiast do weterynarza:</b> Nawet jeśli pies wstał, porażenie może wywołać śmiertelny obrzęk płuc godziny później.</p>
        `
    },
    {
        id: "sos_kaszel",
        title: "Kaszel kennelowy",
        category: "Choroby zakaźne",
        difficulty: "Łatwe 🟢",
        readTime: "2 min",
        keywords: ["kaszel", "przeziębienie", "gardło", "krztuszenie"],
        related: ["sos_wymioty"],
        content: `
            <h3>Czym to jest?</h3>
            <p>Zakaźna choroba dróg oddechowych (psie przeziębienie). Objawia się suchym, "gęsim" kaszlem i odkrztuszaniem białej piany.</p>
            <h3>Co robić?</h3>
            <p><b>1. Izolacja:</b> Przestań wychodzić do innych psów, by ich nie zarazić.</p>
            <p><b>2. Zmiana na szelki:</b> Zdejmij obrożę – nacisk na tchawicę potęguje ataki kaszlu.</p>
            <p><b>3. Nawilżaj powietrze:</b> Weź psa do łazienki na czas brania gorącego prysznica (para wodna łagodzi kaszel).</p>
            <p><b>4. Umów wizytę:</b> Lekarz przepisze leki przeciwkaszlowe lub antybiotyk.</p>
        `
    }
];
