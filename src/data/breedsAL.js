// data/breedsAL.js

export const BREEDS_A_L = [
    { 
        id: "akita", 
        title: "Akita Inu", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Dumna, niezależna i niezwykle wierna. Powściągliwa wobec obcych.</li>
                <li>Typowy "pies jednego właściciela" (jak słynny Hachiko).</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Ma silny instynkt łowiecki i terytorialny. Lubi spacery patrolowe.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Braku wczesnej socjalizacji z innymi psami – może wykazywać agresję wobec obcych czworonogów. Wymaga konsekwentnego przewodnika.</li>
            </ul>
        `, 
        img: "./assets/breeds/Akita_Inu.png", 
        tags: ["Szpice", "Stróżujący", "Japonia"], 
        keywords: ["akita", "inu", "japoński", "hachiko", "rudy"], 
        filters: { kidsFriendly: 2, apartmentLive: 3, easyToTrain: 2, energyLevel: 3 } 
    },
    { 
        id: "amstaff", 
        title: "American Staffordshire Terrier", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wbrew groźnym stereotypom, odpowiednio wychowany Amstaff jest niesamowicie czuły wobec ludzi i bezgranicznie oddany rodzinie.</li>
                <li>Bardzo lojalny, dynamiczny i pewny siebie.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies-kulturysta. Wymaga ogromnej dawki ruchu i ujścia dla swojej fizycznej siły (np. szarpanie zabawek).</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pobłażliwości. Wymaga bardzo odpowiedzialnego właściciela i żelaznych, jasnych zasad od pierwszych miesięcy życia.</li>
            </ul>
        `, 
        img: "./assets/breeds/American_Staffordshire_Terrier.png", 
        tags: ["Terriery", "Silny", "Aktywny"], 
        keywords: ["amstaff", "ast", "pitbull", "stafford", "terier"], 
        filters: { kidsFriendly: 3, apartmentLive: 4, easyToTrain: 3, energyLevel: 4 } 
    },
    { 
        id: "australian-shepherd", 
        title: "Owczarek Australijski (Aussie)", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wybitnie inteligentny i mocno wpatrzony w człowieka. Kocha całą rodzinę.</li>
                <li>Uczy się nowych sztuczek dosłownie w mgnieniu oka.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wulkan energii i tytan pracy! Doskonały do psich sportów (agility, frisbee).</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nudy! Jeśli nie zapewnisz mu regularnego zajęcia umysłowego, sam znajdzie sobie pracę – często polegającą na niszczeniu mieszkania.</li>
            </ul>
        `, 
        img: "./assets/breeds/Owczarek_Australijski.png", 
        tags: ["Pasterskie", "Inteligentny", "Sportowiec"], 
        keywords: ["aussie", "australijski", "owczarek", "blue merle", "pasterski"], 
        filters: { kidsFriendly: 5, apartmentLive: 2, easyToTrain: 5, energyLevel: 5 } 
    },
    { 
        id: "basenji", 
        title: "Basenji", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies o duszy kota! Bardzo czysty, sam dba o higienę i myje się łapkami.</li>
                <li>Niezależny, powściągliwy wobec obcych.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada bardzo silny instynkt pogoni za wszystkim, co ucieka. Uwielbia biegać.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✨ CIEKAWOSTKI</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>To afrykańska rasa, która... <b>nie szczeka</b>! Zamiast tego wydaje specyficzne dźwięki przypominające jodłowanie. Zazwyczaj nienawidzi deszczu.</li>
            </ul>
        `, 
        img: "./assets/breeds/Basenji.png", 
        tags: ["Pierwotne", "Cichy", "Koci charakter"], 
        keywords: ["basenji", "afrykański", "nie szczeka", "czysty"], 
        filters: { kidsFriendly: 3, apartmentLive: 5, easyToTrain: 2, energyLevel: 4 } 
    },
    { 
        id: "beagle", 
        title: "Beagle", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wesoły, towarzyski pies gończy. Świetnie dogaduje się z dziećmi i innymi psami.</li>
                <li>Jest niesamowicie uparty i... wiecznie głodny.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Lubi długie spacery, na których może zająć się tym, co potrafi najlepiej – wąchaniem świata.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Spuszczania ze smyczy bez wypracowanego przywołania. Gdy Beagle złapie ciekawy trop, jego nos "wyłącza uszy" i całkowicie ignoruje właściciela.</li>
            </ul>
        `, 
        img: "./assets/breeds/Beagle.png", 
        tags: ["Gończe", "Przyjazny", "Myśliwski"], 
        keywords: ["beagle", "bigiel", "gończy", "łaciaty", "nos"], 
        filters: { kidsFriendly: 5, apartmentLive: 4, easyToTrain: 2, energyLevel: 4 } 
    },
    { 
        id: "bernese", 
        title: "Berneński Pies Pasterski", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Łagodny olbrzym, prawdziwa oaza spokoju.</li>
                <li>Niesamowicie cierpliwy, uwielbia dzieci i potrzebuje nieustannego kontaktu z rodziną.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Cieszy się ze spacerów, ale nie nadaje się na długodystansowego biegacza z powodu gabarytów.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE I PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada piękną, bardzo gęstą sierść – tragicznie znosi upały. Latem należy mu zapewnić chłód!</li>
                <li>Niestety jest to rasa bardzo chorobliwa i krótko żyjąca.</li>
            </ul>
        `, 
        img: "./assets/breeds/Berneński_Pies_Pasterski.png", 
        tags: ["Molosy", "Stado", "Łagodny"], 
        keywords: ["berneńczyk", "berneński", "pasterski", "duży", "misiek"], 
        filters: { kidsFriendly: 5, apartmentLive: 1, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "bichon", 
        title: "Bichon Frise", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Radosna, łagodna chmurka na czterech łapach! Zawsze chętny do pieszczot.</li>
                <li>Idealny towarzysz do życia w mieszkaniu.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zadowoli go umiarkowany ruch i domowe sesje zabaw.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada piękny biały <b>włos</b> (nie linieje), co czyni go wspaniałym psem dla alergików.</li>
                <li>Wymaga codziennego rozczesywania i strzyżenia u groomera, inaczej szata zbije się w filc.</li>
            </ul>
        `, 
        img: "./assets/breeds/Bichon_Frise.png", 
        tags: ["Do towarzystwa", "Alergicy", "Mały"], 
        keywords: ["bichon", "frise", "biały", "mały", "włos", "hipoalergiczny"], 
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "border-collie", 
        title: "Border Collie", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Oficjalnie uznawany za <b>najinteligentniejszego psa na świecie</b>. Uczy się komend po jednym powtórzeniu.</li>
                <li>Zorientowany w 100% na przewodnika. Żyje po to, by wykonywać polecenia.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies pracujący. Potrafi wykonywać zadania bez przerwy. Król psich sportów!</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zwykłego, powolnego spaceru. Border Collie wymaga <b>gigantycznej</b> dawki pracy umysłowej. Znudzony, sfrustrowany Border niszczy w domu i wpada w nerwice (np. "pasie" bawiące się dzieci lub auta).</li>
            </ul>
        `, 
        img: "./assets/breeds/Border_Collie.png", 
        tags: ["Pasterskie", "Geniusz", "Praca"], 
        keywords: ["border", "collie", "inteligentny", "czarno biały", "agility"], 
        filters: { kidsFriendly: 4, apartmentLive: 2, easyToTrain: 5, energyLevel: 5 } 
    },
    { 
        id: "boxer", 
        title: "Bokser", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies o charakterze wiecznego dziecka. Niezwykle radosny, wylewny i oddany rodzinie.</li>
                <li>Kocha dzieci i potrafi się z nimi bardzo czule bawić.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wulkan energii. Jest bardzo skoczny, ekspresyjny i potrzebuje solidnego zmęczenia fizycznego.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE I WADY</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Krótka kufa utrudnia mu radzenie sobie z wysokimi temperaturami. Silnie się ślini! Bywa uparty podczas szkolenia.</li>
            </ul>
        `, 
        img: "./assets/breeds/Bokser.png", 
        tags: ["Molosy", "Energiczny", "Opiekun"], 
        keywords: ["boxer", "bokser", "faflun", "krótka sierść"], 
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 3, energyLevel: 5 } 
    },
    { 
        id: "boston-terrier", 
        title: "Boston Terrier", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nazywany "amerykańskim dżentelmenem" z racji eleganckiego umaszczenia w kształcie smokingu.</li>
                <li>Bystry, wesoły i wybitnie dopasowujący się do trybu życia opiekuna.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Kompaktowy pies, idealny towarzysz do tętniącego życiem miasta. Zadowoli go średnia ilość spacerów.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Ze względu na skrócony pyszczek jest mocno podatny na przegrzanie latem i wyziębienie zimą.</li>
            </ul>
        `, 
        img: "./assets/breeds/Boston_Terrier.png", 
        tags: ["Do towarzystwa", "Miasto", "Wesoły"], 
        keywords: ["boston", "terrier", "terier", "smoking", "mały"], 
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "bulldog-french", 
        title: "Buldog Francuski", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Jeden z najpopularniejszych psów miejskich na świecie.</li>
                <li>Zabawny, uroczy i wielki domowy kanapowiec. Czasem bywa dość mocno uparty.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Niska. Nie potrzebuje (a wręcz nie powinien) odbywać ekstremalnie długich spacerów ani biegać przy rowerze.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Brachycefaliczny pysk często powoduje u niego problemy z chrapaniem i dusznościami. Upał to dla niego śmiertelne zagrożenie.</li>
            </ul>
        `, 
        img: "./assets/breeds/Buldog_Francuski.png", 
        tags: ["Do towarzystwa", "Kanapowiec", "Kompaktowy"], 
        keywords: ["buldog", "francuski", "frenchie", "mopsik", "uszatek"], 
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 3, energyLevel: 2 } 
    },
    { 
        id: "bulldog-english", 
        title: "Buldog Angielski", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Masywny i przysadzisty pies pełen flegmatycznego uroku osobistego.</li>
                <li>Prawdziwa oaza spokoju, potrafi przespać zadowolony większą część dnia.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Minimalna. Zadowoli się bardzo spokojnymi, krótkimi wędrówkami wokół bloku.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE I PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wymaga codziennej, starannej pielęgnacji i przemywania głębokich fałdek na pyszczku, w których zbierają się zanieczyszczenia.</li>
            </ul>
        `, 
        img: "./assets/breeds/Buldog_Angielski.png", 
        tags: ["Do towarzystwa", "Spokojny", "Masywny"], 
        keywords: ["buldog", "angielski", "grubas", "flegmatyk"], 
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 2, energyLevel: 1 } 
    },
    { 
        id: "bull-terrier", 
        title: "Bulterier", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nazywany "klaunem w psiej skórze". Posiada charakterystyczną głowę, ogromne zasoby energii i zwariowane poczucie humoru.</li>
                <li>Mocno oddany rodzinie, wylewny i "całuśny".</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies o budowie i sile małego czołgu. Wymaga porządnego, codziennego zmęczenia fizycznego.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Potrzebuje bardzo konsekwentnego przewodnika. Bez jasnych granic domowych wejdzie właścicielowi na głowę.</li>
            </ul>
        `, 
        img: "./assets/breeds/Bulterier.png", 
        tags: ["Terriery", "Charakterystyczny", "Uparciuch"], 
        keywords: ["bulterier", "bull", "terrier", "jajogłowy", "gladiator"], 
        filters: { kidsFriendly: 4, apartmentLive: 4, easyToTrain: 2, energyLevel: 4 } 
    },
    { 
        id: "cane-corso", 
        title: "Cane Corso", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Potężny, majestatyczny pies z Włoch. Wybitny obrońca o niesamowitej lojalności wobec własnego stada.</li>
                <li>Z natury jest bardzo nieufny i podejrzliwy wobec obcych.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wymaga mądrych, długich spacerów, a nie tylko wybiegu na podwórku. Z chęcią potrenuje posłuszeństwo.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Izolacji! Wymaga doskonałej socjalizacji w wieku szczenięcym oraz silnego, bardzo doświadczonego przewodnika.</li>
            </ul>
        `, 
        img: "./assets/breeds/Cane_Corso.png", 
        tags: ["Stróżujący", "Molosy", "Dla doświadczonych"], 
        keywords: ["cane", "corso", "włoski", "duży", "obronny", "masyw"], 
        filters: { kidsFriendly: 3, apartmentLive: 2, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "cavalier", 
        title: "Cavalier King Charles Spaniel", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies o spojrzeniu roztapiającym serca! Całkowicie pozbawiony agresji, wybitnie łagodny.</li>
                <li>Kocha cały świat – domowników, obcych, dzieci, psy i koty.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zadowoli się kanapą i miłymi, rodzinnymi spacerkami w parku.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Niestety rasa ta jest genetycznie obciążona wieloma poważnymi chorobami, w tym m.in. postępującą wadą zastawek serca (MVD).</li>
            </ul>
        `, 
        img: "./assets/breeds/Cavalier_King_Charles_Spaniel.png", 
        tags: ["Spaniele", "Łagodny", "Rodzinny"], 
        keywords: ["cavalier", "king", "charles", "spaniel", "łagodny", "uszy"], 
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 } 
    },
    { 
        id: "chihuahua", 
        title: "Chihuahua", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Najmniejszy pies świata o ogromnym, zawadiackim temperamencie!</li>
                <li>Bardzo często nie jest świadomy swoich gabarytów i potrafi z podniesioną głową oszczekać owczarka.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nie potrzebuje ogromnej przestrzeni do życia. UWIELBIA być noszonym na rękach i przesiadywać na kolanach.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Traktowania go jak lalki! To wciąż pełnoprawny pies, który potrzebuje wychowania, granic i spacerów na własnych nogach.</li>
            </ul>
        `, 
        img: "./assets/breeds/Chihuahua.png", 
        tags: ["Do towarzystwa", "Miniaturowy", "Zadziorny"], 
        keywords: ["chihuahua", "czilala", "mały", "najmniejszy", "kieszonkowy"], 
        filters: { kidsFriendly: 2, apartmentLive: 5, easyToTrain: 3, energyLevel: 2 } 
    },
    { 
        id: "chow-chow", 
        title: "Chow Chow", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies, który uważa się za lwa (lub kota). Bardzo powściągliwy, niezależny, nie łasi się bez powodu do rąk.</li>
                <li>Niezwykła cecha: posiada naturalnie <b>niebiesko-czarny język!</b></li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nieszczególnie interesują go intensywne spacery czy praca węchowa.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Posiada przepotężną, podwójną szatę (gruby podszerstek), która w okresie linienia jest wszechobecna w mieszkaniu.</li>
            </ul>
        `, 
        img: "./assets/breeds/Chow_Chow.png", 
        tags: ["Szpice", "Niezależny", "Niebieski język"], 
        keywords: ["chow", "chowchow", "lew", "puchaty", "język"], 
        filters: { kidsFriendly: 2, apartmentLive: 4, easyToTrain: 1, energyLevel: 2 } 
    },
    { 
        id: "cocker-spaniel", 
        title: "Cocker Spaniel Angielski", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Elegancki pies o wspaniałych uszach, u którego ogon praktycznie nigdy nie przestaje radośnie merdać.</li>
                <li>Bardzo kontaktowy, przyjazny, chociaż bywa cwaniakiem, który wykorzystuje urok osobisty, by postawić na swoim.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>To prawdziwy pies myśliwski (płochacz). Uwielbia bieganie w zaroślach, błoto, rzeki i aportowanie.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE I PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Długie, zwisające uszy nie wentylują ucha wewnątrz, co u Spanieli bardzo często prowadzi do groźnych infekcji (wymagają cotygodniowego czyszczenia!).</li>
            </ul>
        `, 
        img: "./assets/breeds/Cocker_Spaniel_Angielski.png", 
        tags: ["Spaniele", "Myśliwski", "Wesoły"], 
        keywords: ["cocker", "spaniel", "angielski", "rudy", "uszy"], 
        filters: { kidsFriendly: 4, apartmentLive: 4, easyToTrain: 4, energyLevel: 4 } 
    },
    { 
        id: "dalmatian", 
        title: "Dalmatyńczyk", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Słynny gwiazdor o umaszczeniu w kropki (101 powodów do miłości!).</li>
                <li>Bystry, lojalny towarzysz, który bardzo silnie przywiązuje się do domowników.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Dawniej ta rasa biegła za wozami konnymi! Dalmatyńczyki mają <b>potężną wydolność</b> fizyczną i potrzebują długich dystansów, by zrzucić stres.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Życia w kawalerce połączonego z leniwym właścicielem. Niewybiegany dalmatyńczyk to gwarancja zjedzonych butów.</li>
            </ul>
        `, 
        img: "./assets/breeds/Dalmatyńczyk.png", 
        tags: ["Gończe", "Kropki", "Biegacz"], 
        keywords: ["dalmatyńczyk", "kropki", "101", "biały w kropki", "dalmatyń"], 
        filters: { kidsFriendly: 4, apartmentLive: 3, easyToTrain: 4, energyLevel: 5 } 
    },
    { 
        id: "doberman", 
        title: "Doberman", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Elegancki arystokrata wśród obrońców. Niezwykle sprytny, szybki i odważny pies.</li>
                <li>Wbrew negatywnej reputacji z amerykańskich filmów, w domu jest <b>wybitnie czuły</b>, nakolankowy i oddany swojej rodzinie.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies pracujący pełną gębą. Wymaga porządnego treningu posłuszeństwa (np. IGP).</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Krótka, gładka sierść (bez podszerstka) sprawia, że zimą bardzo marzną – podczas mrozów konieczne jest zakładanie kubraka.</li>
            </ul>
        `, 
        img: "./assets/breeds/Doberman.png", 
        tags: ["Stróżujący", "Inteligentny", "Obrońca"], 
        keywords: ["doberman", "stróż", "czarny podpalany", "elegancki"], 
        filters: { kidsFriendly: 3, apartmentLive: 3, easyToTrain: 5, energyLevel: 4 } 
    },
    { 
        id: "golden-retriever", 
        title: "Golden Retriever", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Absolutny synonim psa rodzinnego. Pełen miłości do wszystkiego i wszystkich, bez jakiejkolwiek agresji w genach.</li>
                <li>Niezwykle ufny i cierpliwy do dzieci (stąd często spotykany w dogoterapii).</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Urodzony pływak i aporter. Nie ma kałuży i jeziora, którego nie wykorzystałby podczas spaceru.</li>
            </ul>
            <h4 style="color: #2ed573; margin-bottom: 5px; font-weight: 900;">✂️ PIELĘGNACJA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Bądź w gotowości: w okresie linienia ten pies pozostawia na podłodze wystarczająco dużo złotej sierści, by zbudować z niej drugiego goldena.</li>
            </ul>
        `, 
        img: "./assets/breeds/Golden_Retriever.png", 
        tags: ["Retrievery", "Rodzinny", "Łagodny"], 
        keywords: ["golden", "retriever", "retriwer", "biszkoptowy", "łagodny"], 
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 5, energyLevel: 4 } 
    },
    { 
        id: "great-dane", 
        title: "Dog Niemiecki", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Prawdziwy psi Apollo. Mimo potężnych gabarytów (samce ważą do 90 kg), jest to pies o naturze niezwykle wrażliwego, delikatnego introwertyka.</li>
                <li>Kocha wtulać swoją wielką głowę w ramiona właściciela i drzemać na miękkiej kanapie.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Zdecydowanie umiarkowana. Z racji swojej ogromnej wagi nie nadaje się do długodystansowych, wyczerpujących biegów.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ ZDROWIE / CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Bezwzględnie zakazany intensywny ruch (nawet na spacerze) w ciągu kilkudziesięciu minut po zjedzeniu posiłku ze względu na potężne ryzyko śmiertelnego skrętu żołądka!</li>
                <li>Żyje niestety krócej niż małe i średnie rasy.</li>
            </ul>
        `, 
        img: "./assets/breeds/Dog_Niemiecki.png", 
        tags: ["Molosy", "Olbrzym", "Spokojny"], 
        keywords: ["dog", "niemiecki", "wielki", "olbrzym", "arlekin"], 
        filters: { kidsFriendly: 5, apartmentLive: 2, easyToTrain: 4, energyLevel: 2 } 
    },
    { 
        id: "jack-russell", 
        title: "Jack Russell Terrier", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Kompaktowy rozmiar, w którym zamknięto potężnego, walecznego myśliwego o nieskończonych pokładach pozytywnej energii.</li>
                <li>Bardzo odważny, wesoły i lubi być w centrum uwagi.</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Goni piłki, kopie dziury i z łatwością wyprzedza na szlaku owczarki. Ta bateria nigdy nie siada!</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ CZEGO UNIKAĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nie należy mu pozwalać na rzucanie się z zębami do większych psów. Uważaj w obecności małych zwierząt (chomiki, króliki) – jego geny teriera mogą potraktować je jak zdobycz.</li>
            </ul>
        `, 
        img: "./assets/breeds/Jack_Russell_Terrier.png", 
        tags: ["Terriery", "Wulkan energii", "Mały"], 
        keywords: ["jack", "russell", "jrt", "terier", "maskotka", "piłeczka"], 
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 3, energyLevel: 5 } 
    },
    { 
        id: "labrador", 
        title: "Labrador Retriever", 
        desc: `
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">🐕 CHARAKTER</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Absolutnie nieustraszony wielbiciel ludzi, z natury wesoły i chętny do radosnego lizania każdej nowo poznanej osoby.</li>
                <li>Jedna z najbardziej wszechstronnych ras świata (pracuje w policji, służbach ratowniczych i jako przewodnik niewidomych).</li>
            </ul>
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🏃‍♂️ AKTYWNOŚĆ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Uwielbia aportować piłki oraz za wszelką cenę wskakiwać do każdego błotnistego rowu wypełnionego wodą.</li>
            </ul>
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ UWAGA NA DIETĘ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Pies ten ma "czarną dziurę" zamiast żołądka. Zje dosłownie wszystko. Jest to rasa ekstremalnie podatna na otyłość – rygorystycznie pilnuj jego porcji!</li>
            </ul>
        `, 
        img: "./assets/breeds/Labrador_Retriever.png", 
        tags: ["Retrievery", "Rodzinny", "Żarłok"], 
        keywords: ["labrador", "labek", "retriever", "czekoladowy", "czarny"], 
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 5, energyLevel: 4 } 
    }
];
