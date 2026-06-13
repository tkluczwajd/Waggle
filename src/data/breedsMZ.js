// data/breedsMZ.js

export const BREEDS_M_Z = [
    { 
        id: "maltese", 
        title: "Maltańczyk", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Niezwykle radosny, inteligentny i oddany rodzinie.</li>
                <li>Uwielbia bliskość człowieka, bardzo źle znosi samotność.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zadowoli się umiarkowanymi spacerami i wspólną zabawą w domu. Idealny pies do bloku.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada <b>włos zamiast sierści</b> (doskonały dla alergików).</li>
                <li>Wymaga codziennego czesania i regularnych wizyt u psiego fryzjera.</li>
            </ul>
        `, 
        img: "./assets/breeds/Maltańczyk.png", 
        tags: ["Do towarzystwa", "Alergicy", "Mały"], 
        keywords: ["maltańczyk", "maltese", "biały", "mały", "włos", "hipoalergiczny"], 
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "miniature-schnauzer", 
        title: "Sznaucer Miniaturowy", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Mały pies o ogromnej odwadze. Bardzo czujny, lojalny i zawsze gotowy do obrony swojego stada.</li>
                <li>Szybko się uczy, ale bywa uparty.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Lubi być w ruchu i towarzyszyć właścicielowi w wędrówkach.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Szorstka sierść nie linieje, ale wymaga <b>regularnego trymowania</b> (usuwania martwego włosa).</li>
                <li>Charakterystyczna broda często brudzi się podczas jedzenia.</li>
            </ul>
        `, 
        img: "./assets/breeds/Sznaucer_Miniaturowy.png", 
        tags: ["Sznaucery", "Czujny", "Charakterny"], 
        keywords: ["sznaucer", "miniatura", "sznaucerki", "broda", "pieprz i sól"], 
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 4, energyLevel: 4 } 
    },
    { 
        id: "newfoundland", 
        title: "Nowofundland (Wodołaz)", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Łagodny olbrzym, często nazywany "psią nianią" ze względu na cierpliwość do dzieci.</li>
                <li>Posiada silny instynkt ratowniczy.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Kocha pływać (ma błony pławne między palcami!). Niezbyt chętny do szybkiego biegania.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE I PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Obficie się ślini. Gęsta sierść wymaga masy czesania.</li>
                <li>Źle znosi upały, podatny na skręt żołądka i dysplazję stawów.</li>
            </ul>
        `, 
        img: "./assets/breeds/Nowofundland.png", 
        tags: ["Molosy", "Ratownik", "Łagodny olbrzym"], 
        keywords: ["nowofundland", "wodołaz", "czarny niedźwiedź", "wielki", "ratowniczy"], 
        filters: { kidsFriendly: 5, apartmentLive: 1, easyToTrain: 4, energyLevel: 2 } 
    },
    { 
        id: "pekingese", 
        title: "Pekińczyk", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Dawny święty pies cesarzy. Dumny, dostojny, bardzo niezależny.</li>
                <li>Lojalny zwykle tylko wobec jednego opiekuna. Nie lubi hałasu i niedelikatnych dzieci.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zdecydowanie woli kanapę niż długie spacery. Świetny domator.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Płaski pyszczek (brachycefaliczny) sprawia, że <b>łatwo ulega przegrzaniu</b>. Chroń go przed słońcem!</li>
                <li>Długa szata wymaga intensywnego czesania.</li>
            </ul>
        `, 
        img: "./assets/breeds/Pekińczyk.png", 
        tags: ["Do towarzystwa", "Niezależny", "Spokojny"], 
        keywords: ["pekińczyk", "pekin", "krótka kufa", "dumna rasa"], 
        filters: { kidsFriendly: 2, apartmentLive: 5, easyToTrain: 2, energyLevel: 1 } 
    },
    { 
        id: "pomeranian", 
        title: "Szpic Miniaturowy (Pomeranian)", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Puchata kuleczka o charakterze wielkiego psa stróżującego.</li>
                <li>Bardzo odważny, ciekawski i bystry, ale też szczekliwy.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Lubi spacery, ale ze względu na małe łapki szybko się męczy na długich dystansach.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Ogromna ilość podszerstka! Wymaga regularnego, prawidłowego szczotkowania, by uniknąć filcowania.</li>
            </ul>
        `, 
        img: "./assets/breeds/Szpic_Miniaturowy.png", 
        tags: ["Szpice", "Puchaty", "Czujny"], 
        keywords: ["pomeranian", "szpic", "miniaturowy", "puchaty", "liskiem", "szczekacz"], 
        filters: { kidsFriendly: 3, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "poodle-standard", 
        title: "Pudel", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Oficjalnie w Top 3 najinteligentniejszych psów świata. Błyskawicznie się uczy.</li>
                <li>Bardzo przyjacielski, uwielbia pracę z człowiekiem.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wybitny sportowiec! Kocha aportować i trenować sztuczki. Sam spacer to dla niego za mało.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada <b>kręcony włos</b>, co czyni go w 100% bezpiecznym dla alergików (nie linieje).</li>
                <li>Wymaga regularnego strzyżenia maszynką co kilka tygodni.</li>
            </ul>
        `, 
        img: "./assets/breeds/Pudel.png", 
        tags: ["Do towarzystwa", "Geniusz", "Alergicy"], 
        keywords: ["pudel", "poodle", "inteligentny", "lokowany", "włos", "król"], 
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 5, energyLevel: 4 } 
    },
    { 
        id: "rottweiler", 
        title: "Rottweiler", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zrównoważony i lojalny obrońca. W domu łagodny i czuły, na zewnątrz pewny siebie stróż.</li>
                <li>Wymaga absolutnie konsekwentnego i bardzo sprawiedliwego przewodnika (nie dla nowicjuszy).</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Potężny, masywny pies. Wymaga codziennego wysiłku fizycznego i zadań posłuszeństwa.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Braku socjalizacji w wieku szczenięcym – izolowany rotek wyrośnie na psa lękliwo-agresywnego.</li>
            </ul>
        `, 
        img: "./assets/breeds/Rottweiler.png", 
        tags: ["Stróżujący", "Masywny", "Dla doświadczonych"], 
        keywords: ["rottweiler", "rotek", "obronny", "mocny", "czarny podpalany"], 
        filters: { kidsFriendly: 3, apartmentLive: 3, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "samoyed", 
        title: "Samojed", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>"Uśmiechnięty pies Północy". Absolutnie pozbawiony agresji, zakochany w ludziach i dzieciach.</li>
                <li>Zły stróż – prawdopodobnie zalizałby włamywacza na śmierć.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies zaprzęgowy. Potrzebuje bardzo dużo biegania (np. przy rowerze) na świeżym powietrzu.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada niesamowitą, gęstą sierść, która "sama się czyści" (zaschnięte błoto z niej odpada). Linienie jest jednak potężne.</li>
            </ul>
        `, 
        img: "./assets/breeds/Samojed.png", 
        tags: ["Szpice", "Kocha ludzi", "Uśmiech"], 
        keywords: ["samojed", "samoyed", "biały", "puchaty", "uśmiech", "pociągowy"], 
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 4, energyLevel: 4 } 
    },
    { 
        id: "shih-tzu", 
        title: "Shih Tzu", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wesoły, towarzyski, ale też bardzo dumny (cecha psów tybetańskich).</li>
                <li>Doskonale dogaduje się z dziećmi i innymi zwierzętami, bardzo łatwy w obyciu.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Typowy kanapowiec. Spacer traktuje jako relaks, a nie wyzwanie sportowe.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada <b>włos</b>, idealny dla alergików.</li>
                <li>Wymaga codziennego rozczesywania (jeśli jest długi) lub wygodnego, krótkiego strzyżenia u groomera.</li>
            </ul>
        `, 
        img: "./assets/breeds/Shih_Tzu.png", 
        tags: ["Do towarzystwa", "Wesoły", "Alergicy"], 
        keywords: ["shih", "tzu", "shihtzu", "mały", "włos", "tybetański"], 
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 3, energyLevel: 2 } 
    },
    { 
        id: "siberian-husky", 
        title: "Husky Syberyjski", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies o duszy dzikiego wilka. Niezależny, inteligentny, bardzo przyjazny dla ludzi.</li>
                <li>Praktycznie nie szczeka, za to bardzo <b>głośno i melodyjnie wyje</b>.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Stworzony do biegania na mrozie. Wymaga kilometrów codziennego biegu (canivocross, rower).</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Spuszczania ze smyczy w lesie! Husky ma potężny instynkt łowiecki i geny uciekiniera – złapie trop i nie wróci przez wiele godzin.</li>
            </ul>
        `, 
        img: "./assets/breeds/Husky_Syberyjski.png", 
        tags: ["Szpice", "Biegacz", "Niezależny"], 
        keywords: ["husky", "haski", "syberyjski", "niebieskie oczy", "wilk", "wyje"], 
        filters: { kidsFriendly: 4, apartmentLive: 2, easyToTrain: 2, energyLevel: 5 } 
    },
    { 
        id: "welsh-corgi", 
        title: "Welsh Corgi Pembroke", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Ulubiony pies królowej Elżbiety II. Wesoły, odważny i bardzo oddany stadu.</li>
                <li>Mimo wyglądu "maskotki", to pełnoprawny, bystry pies pasterski, który kocha pracę.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Dużo energii! Bardzo lubi wędrówki i naukę nowych sztuczek.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Uważaj na jego kręgosłup ze względu na budowę. Unikaj schodów u szczeniąt.</li>
                <li>Może próbować "zaganiać" uciekające dzieci, podgryzając je po piętach (instynkt zaganiacza owiec).</li>
            </ul>
        `, 
        img: "./assets/breeds/Welsh_Corgi_Pembroke.png", 
        tags: ["Pasterskie", "Krótkie łapki", "Królewski"], 
        keywords: ["corgi", "korgi", "welsh", "pembroke", "lisek", "królowa"], 
        filters: { kidsFriendly: 4, apartmentLive: 4, easyToTrain: 4, energyLevel: 4 } 
    },
    { 
        id: "yorkshire-terrier", 
        title: "Yorkshire Terrier", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pod maską "psa z kokardką" kryje się waleczny terrier stworzony do łowienia szczurów!</li>
                <li>Niezwykle pewny siebie, bystry i silnie przywiązany do właściciela (często oszczekuje większe psy).</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Kocha długie spacery i zabawy węchowe. Nie jest to pies przeznaczony wyłącznie na kolana.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada <b>włos</b>, dzięki czemu nie linieje i jest polecany alergikom. Wymaga wizyt u fryzjera.</li>
            </ul>
        `, 
        img: "./assets/breeds/Yorkshire_Terrier.png", 
        tags: ["Terriery", "Mały wojownik", "Alergicy"], 
        keywords: ["york", "jork", "terier", "terrier", "włos", "mały"], 
        filters: { kidsFriendly: 3, apartmentLive: 5, easyToTrain: 3, energyLevel: 3 } 
    }
];
