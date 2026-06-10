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
    },
    {
        id: "sos_czekolada",
        title: "Zatrucie czekoladą",
        category: "Zatrucia",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        content: `
            <h3>Dlaczego to niebezpieczne?</h3>
            <p>Czekolada zawiera teobrominę, której psy nie potrafią metabolizować. Im ciemniejsza czekolada (więcej kakao), tym bardziej toksyczna dla psa. Czekolada do pieczenia i gorzka to największe zagrożenie.</p>
            <h3>Objawy (pojawiają się po 2-12 godzinach):</h3>
            <ul>
                <li>Wymioty i biegunka</li>
                <li>Nadmierne pragnienie i częste oddawanie moczu</li>
                <li>Pobudzenie i niepokój</li>
                <li>Przyspieszone bicie serca, drgawki (w ciężkich przypadkach)</li>
            </ul>
            <h3>Co robić?</h3>
            <p><b>1. Ustal ile i co zjadł:</b> Oszacuj ilość zjedzonej czekolady i jej rodzaj. Zachowaj opakowanie.</p>
            <p><b>2. Zadzwoń do weterynarza natychmiast:</b> Podaj wagę psa oraz ilość/rodzaj zjedzonej czekolady. Lekarz oceni, czy dawka jest toksyczna.</p>
            <p><b>3. Nie wywołuj wymiotów sam:</b> Chyba że weterynarz wyraźnie Ci to poleci przez telefon.</p>
        `,
        related: ["sos_wymioty", "sos_ksylitol"]
    },
    {
        id: "sos_ksylitol",
        title: "Zatrucie ksylitolem (brzozowym cukrem)",
        category: "Zatrucia",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        content: `
            <h3>Dlaczego to niebezpieczne?</h3>
            <p>Ksylitol (często obecny w gumach do żucia, maśle orzechowym "fit" i pastach do zębów) powoduje u psów gwałtowny i zagrażający życiu wyrzut insuliny, co prowadzi do drastycznego spadku cukru we krwi (hipoglikemii), a w konsekwencji do niewydolności wątroby.</p>
            <h3>Objawy (nawet po 15-30 minutach):</h3>
            <ul>
                <li>Wymioty</li>
                <li>Osłabienie, zataczanie się, brak koordynacji</li>
                <li>Omdlenia, drgawki</li>
            </ul>
            <h3>Co robić?</h3>
            <p><b>1. Liczy się każda minuta!</b> Natychmiast zabierz psa do najbliższej kliniki weterynaryjnej.</p>
            <p><b>2. Zabezpiecz opakowanie:</b> Weź ze sobą opakowanie produktu, który zjadł pies.</p>
            <p><b>3. Awaryjnie:</b> Jeśli masz do weterynarza daleko, a pies jest przytomny i może połykać, weterynarz przez telefon może zalecić podanie syropu klonowego lub miodu na dziąsła, aby chwilowo podnieść poziom cukru.</p>
        `,
        related: ["sos_czekolada", "sos_wymioty"]
    },
    {
        id: "sos_udar",
        title: "Przegrzanie i udar cieplny",
        category: "Zagrożenia życia",
        difficulty: "Krytyczne 🔴",
        readTime: "3 min",
        content: `
            <h3>Jak rozpoznać udar?</h3>
            <p>Psy nie pocą się jak ludzie – chłodzą się głównie przez ziajanie. W gorące dni, w rozgrzanym aucie (nawet przy uchylonym oknie!) lub podczas intensywnego wysiłku, temperatura ciała psa może błyskawicznie wzrosnąć do śmiertelnego poziomu.</p>
            <h3>Objawy:</h3>
            <ul>
                <li>Intensywne, głośne ziajanie</li>
                <li>Ciemnoczerwone lub fioletowe dziąsła i język</li>
                <li>Gęsta, lepka ślina</li>
                <li>Zataczanie się, dezorientacja, brak reakcji na imię</li>
                <li>Wymioty lub biegunka</li>
            </ul>
            <h3>Co robić? (Działaj natychmiast)</h3>
            <p><b>1. Przenieś psa do chłodnego miejsca:</b> W cień lub do klimatyzowanego pomieszczenia.</p>
            <p><b>2. Rozpocznij chłodzenie stopniowo:</b> Przykładaj chłodne (NIE lodowate!) i mokre ręczniki na brzuch, pachwiny i pachy psa. Polewaj łapy chłodną wodą.</p>
            <p><b>3. Zapewnij przewiew:</b> Włącz wiatrak lub wachluj psa.</p>
            <p><b>4. Oferuj wodę:</b> Pozwól psu pić, ale małymi łykami. Nie zmuszaj go do picia na siłę.</p>
            <p><b>5. Jedź do weterynarza:</b> Nawet jeśli pies poczuje się lepiej, udar powoduje obrzęk narządów wewnętrznych. Kontrola jest niezbędna.</p>
        `,
        related: []
    },
    {
        id: "sos_skaleczenie_lapy",
        title: "Skaleczenie opuszki (łapy)",
        category: "Urazy zewnętrzne",
        difficulty: "Średnie 🟡",
        readTime: "2 min",
        content: `
            <h3>Co się stało?</h3>
            <p>Pies nadepnął na rozbite szkło, ostry kamień lub lód. Opuszki są mocno ukrwione, więc krwawienie może wydawać się bardzo obfite, nawet przy małym nacięciu.</p>
            <h3>Co robić?</h3>
            <p><b>1. Oczyść ranę:</b> Przemyj łapę chłodną, bieżącą wodą lub solą fizjologiczną, aby usunąć piasek i brud. Obejrzyj, czy w ranie nie tkwi szkło.</p>
            <p><b>2. Zatamuj krwawienie:</b> Przyłóż czysty gazik lub czysty materiał bezpośrednio do rany i uciskaj delikatnie przez około 5-10 minut.</p>
            <p><b>3. Załóż opatrunek:</b> Jeśli krwawienie ustaje, zawiń łapę bandażem (pamiętaj, by włożyć gaziki między palce psa, by zapobiec odparzeniom). Nie zaciskaj zbyt mocno!</p>
            <p><b>4. Obserwuj:</b> Załóż psu skarpetę ochronną. Jeśli krwawienie nie ustaje po 15 minutach ucisku lub rana jest głęboka/szeroka, konieczna jest wizyta u weterynarza (może wymagać szycia).</p>
        `,
        related: ["sos_skrecenie"]
    },
    {
        id: "sos_skrecenie",
        title: "Skręcenie lub zwichnięcie łapy",
        category: "Urazy układu ruchu",
        difficulty: "Średnie 🟡",
        readTime: "2 min",
        content: `
            <h3>Objawy:</h3>
            <p>Nagła kulawizna po bieganiu, skoku lub zabawie z innym psem. Pies unika stawiania ciężaru na jednej łapie, może popiskiwać przy dotyku, a staw może być opuchnięty lub cieplejszy.</p>
            <h3>Co robić?</h3>
            <p><b>1. Ogranicz ruch:</b> Natychmiast zapnij psa na smycz. Nie pozwól mu biegać ani skakać, nawet jeśli "rozchodził" uraz.</p>
            <p><b>2. Nie podawaj ludzkich leków!</b> Nigdy nie podawaj psu ibuprofenu, paracetamolu ani aspiryny – są toksyczne dla psów.</p>
            <p><b>3. Zimny okład (opcjonalnie):</b> Jeśli pies na to pozwala, możesz przyłożyć chłodny okład (np. mrożonkę owiniętą w ręcznik) na 10 minut na opuchnięte miejsce.</p>
            <p><b>4. Konsultacja weterynaryjna:</b> Urazy ortopedyczne łatwo pomylić z poważnymi zerwaniami więzadeł (np. zerwane więzadło krzyżowe w kolanie). Umów wizytę, by lekarz zbadał łapę (często konieczne jest RTG).</p>
        `,
        related: ["sos_skaleczenie_lapy"]
    },
    {
        id: "sos_zmija",
        title: "Ukąszenie przez żmiję",
        category: "Nagłe wypadki",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        content: `
            <h3>Kiedy uważać?</h3>
            <p>Podczas spacerów w lasach, na podmokłych łąkach lub w górach (szczególnie wiosną i latem). Psy najczęściej padają ofiarą ukąszeń w okolicy pyska, szyi lub przednich łap.</p>
            <h3>Objawy:</h3>
            <ul>
                <li>Nagły pisk lub skowyt podczas obwąchiwania trawy</li>
                <li>Dwie małe ranki kłute (nie zawsze widoczne)</li>
                <li>Bardzo szybko narastający, bolesny obrzęk (np. pysk puchnie jak "balon")</li>
                <li>Ślinotok, osłabienie, przyspieszony oddech</li>
            </ul>
            <h3>Co robić?</h3>
            <p><b>1. Zachowaj spokój i uspokój psa:</b> Emocje i wysiłek fizyczny przyspieszają rozchodzenie się jadu po organizmie.</p>
            <p><b>2. Unieruchom psa:</b> Jeśli to możliwe, weź psa na ręce. Jeśli to duży pies – idźcie do auta najwolniejszym możliwym krokiem.</p>
            <p><b>3. NIE ROBCIE TEGO:</b> Nie wysysaj jadu! Nie nacinaj rany! Nie zakładaj opaski uciskowej!</p>
            <p><b>4. Pędem do weterynarza:</b> Zadzwoń do kliniki po drodze, by przygotowali leki przeciwwstrząsowe (i ewentualnie surowicę, jeśli posiadają).</p>
        `,
        related: []
    },
    {
        id: "sos_prad",
        title: "Porażenie prądem (pogryzienie kabla)",
        category: "Nagłe wypadki domowe",
        difficulty: "Krytyczne 🔴",
        readTime: "2 min",
        content: `
            <h3>Co się stało?</h3>
            <p>Najczęściej dotyczy szczeniąt lub młodych psów, które w fazie ząbkowania zgryzły kabel podłączony do gniazdka.</p>
            <h3>Objawy:</h3>
            <p>Oparzenia wokół pyska i na języku, duszności, ślinotok (płyn zbierający się w płucach), drgawki mięśni, utrata przytomności.</p>
            <h3>Co robić?</h3>
            <p><b>1. Odłącz zasilanie!</b> Absolutnie nie dotykaj psa, dopóki nie odłączysz korków w domu lub nie wyciągniesz wtyczki z gniazdka. Inaczej prąd porazi też Ciebie.</p>
            <p><b>2. Odsuń psa od kabla:</b> Użyj drewnianego kija od szczotki lub plastikowego przedmiotu, aby odsunąć kabel od pyska psa.</p>
            <p><b>3. Sprawdź oddech i puls:</b> Jeśli pies nie oddycha, konieczna jest resuscytacja (masaż serca i sztuczne oddychanie).</p>
            <p><b>4. Natychmiast do weterynarza:</b> Nawet jeśli pies wstał i zachowuje się normalnie, porażenie prądem może wywołać obrzęk płuc, który rozwija się nawet kilka godzin po zdarzeniu.</p>
        `,
        related: []
    },
    {
        id: "sos_kaszel",
        title: "Kaszel kennelowy",
        category: "Choroby zakaźne",
        difficulty: "Łatwe 🟢",
        readTime: "2 min",
        content: `
            <h3>Czym jest kaszel kennelowy?</h3>
            <p>To wysoce zakaźna choroba górnych dróg oddechowych (odpowiednik psiego przeziębienia). Zarażenie następuje przez kontakt z innym psem (w parku, na wybiegu, w hotelu).</p>
            <h3>Objawy:</h3>
            <p>Suchy, twardy, "gęsi" kaszel. Właściciele często myślą, że psu utknęła w gardle kość lub patyk. Po ataku kaszlu pies może odkrztuszać białą pianę (wygląda to jak wymioty, ale to ślina z dróg oddechowych). Pies ma zazwyczaj normalny apetyt i humor.</p>
            <h3>Co robić?</h3>
            <p><b>1. Izolacja:</b> Przestań wychodzić z psem w miejsca, gdzie są inne psy, aby nie roznosić choroby.</p>
            <p><b>2. Zmiana na szelki:</b> Zdejmij obrożę i przypinaj smycz do szelek – nacisk na tchawicę potęguje ataki kaszlu.</p>
            <p><b>3. Zadbaj o wilgotność:</b> Zbyt suche powietrze w domu podrażnia gardło. Jeśli nie masz nawilżacza, weź psa ze sobą do łazienki na czas brania gorącego prysznica (para wodna łagodzi kaszel).</p>
            <p><b>4. Umów wizytę:</b> Lekarz weterynarii często przepisuje leki przeciwkaszlowe lub antybiotyk, by zapobiec przejściu w zapalenie płuc.</p>
        `,
        related: ["sos_wymioty"]
    },
    {
        id: "sos_wymioty",
        title: "Gwałtowne wymioty",
        category: "Układ pokarmowy",
        difficulty: "Średnie 🟡",
        readTime: "3 min",
        content: `
            <h3>Kiedy to norma, a kiedy zagrożenie?</h3>
            <p>Pies, który zwymiotuje raz zjedzoną trawą lub z powodu zbyt łapczywego jedzenia i czuje się dobrze, zazwyczaj nie wymaga interwencji. Problem pojawia się, gdy wymioty są uporczywe.</p>
            <h3>Sygnały alarmowe (od razu do weterynarza!):</h3>
            <ul>
                <li>Wymioty połączone z letargiem i brakiem chęci do ruchu.</li>
                <li>Wymiotowanie wodą natychmiast po jej wypiciu.</li>
                <li>Pies bezskutecznie próbuje wymiotować (pusta treść, odruchy wymiotne) – to może być objaw śmiertelnego SKRĘTU ŻOŁĄDKA!</li>
                <li>Krew w wymiocinach (wygląda jak fusy po kawie).</li>
            </ul>
            <h3>Co robić w łagodnych przypadkach?</h3>
            <p><b>1. Głodówka:</b> Zrób psu 12 do 24 godzin głodówki (nie dotyczy szczeniąt!). Daj żołądkowi odpocząć.</p>
            <p><b>2. Woda małymi porcjami:</b> Zapewnij dostęp do wody, ale jeśli pies pije łapczywie i od razu wymiotuje, dawaj mu lizać kostki lodu lub podawaj wodę w bardzo małych ilościach (np. 1-2 łyżki co godzinę).</p>
            <p><b>3. Powrót do jedzenia:</b> Jeśli wymioty ustąpiły, podaj lekki posiłek: rozgotowany ryż z chudym gotowanym kurczakiem lub specjalną karmę weterynaryjną "Gastrointestinal".</p>
        `,
        related: ["sos_biegunka", "sos_czekolada"]
    },
    {
        id: "sos_biegunka",
        title: "Ostra biegunka",
        category: "Układ pokarmowy",
        difficulty: "Średnie 🟡",
        readTime: "2 min",
        content: `
            <h3>Dlaczego występuje?</h3>
            <p>Biegunka to najczęściej efekt zjedzenia "śmieci" na spacerze, nagłej zmiany karmy, stresu lub infekcji pasożytniczej.</p>
            <h3>Sygnały alarmowe (do weterynarza):</h3>
            <p>Biegunka trwająca dłużej niż 24h, obfita ilość jasnej, świeżej krwi w kale (przypominająca dżem malinowy), smolisty czarny kał, biegunka u niezaszczepionego szczeniaka (ryzyko parwowirozy) lub biegunka połączona z wymiotami.</p>
            <h3>Co robić w łagodnych przypadkach?</h3>
            <p><b>1. Głodówka:</b> Wstrzymaj podawanie jedzenia na 12-24 godziny (szczeniaki max 6 godzin). Przewód pokarmowy musi się oczyścić.</p>
            <p><b>2. Nawadnianie:</b> Biegunka odwadnia. Upewnij się, że pies pije. Jeśli odmawia, dolej do wody odrobinę niesłonego rosołu na zachętę.</p>
            <p><b>3. Leki bez recepty:</b> Możesz podać preparaty wspierające (np. węgiel aktywny w odpowiedniej dawce lub glinkę kaolinową), jednak skonsultuj to najpierw telefonicznie ze swoją kliniką.</p>
            <p><b>4. Delikatna dieta:</b> Po głodówce wracaj z jedzeniem powoli. Podaj rozgotowaną marchew z ryżem lub mokrą karmę ratunkową.</p>
        `,
        related: ["sos_wymioty"]
    }
];
