// src/data/breedsMZ.js

export const BREEDS_M_Z = [
    {
        id: "maltese",
        title: "Maltańczyk",
        desc: "Jeden z najstarszych psów do towarzystwa na świecie. Maltańczyki są niezwykle radosne, inteligentne i kochające. Posiadają jedwabisty, biały włos zamiast sierści, co czyni je idealnymi dla alergików. Uwielbiają bliskość człowieka, źle znoszą samotność i wymagają codziennego czesania.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23F0F4F8'/><circle cx='18' cy='28' r='7' fill='%23FFFDF9'/><circle cx='46' cy='28' r='7' fill='%23FFFDF9'/><circle cx='32' cy='34' r='14' fill='%23FFFDF9'/><path d='M24 22c1-4 5-5 8-2s1 8 1 8zM40 22c-1-4-5-5-8-2s-1 8-1 8z' fill='%23E2EAF1'/><circle cx='27' cy='30' r='2.5' fill='%23222'/><circle cx='37' cy='30' r='2.5' fill='%23222'/><path d='M30 35h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Alergicy", "Mały"],
        keywords: ["maltańczyk", "maltese", "biały", "mały", "włos", "hipoalergiczny"],
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "miniature-schnauzer",
        title: "Sznaucer Miniaturowy",
        desc: "Mały pies o ogromnej odwadze i wyrazistej brodzie. Sznaucery są niezwykle czujne, lojalne i zawsze gotowe do obrony swojego stada. Są bardzo inteligentne i szybko się uczą, ale potrafią być uparte. Ich szorstka sierść nie linieje, ale wymaga regularnego trymowania.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%238A95A5'/><path d='M14 20l4-10 4 10zM50 20l-4-10-4 10z' fill='%236B7582'/><path d='M18 34c0-8 6-11 14-11s14 3 14 11-2 14-14 14-14-5-14-14z' fill='%238A95A5'/><path d='M20 34c0 8 5 12 12 12s12-4 12-12z' fill='%23FFFDF9'/><circle cx='26' cy='31' r='2' fill='%23222'/><circle cx='38' cy='31' r='2' fill='%23222'/><path d='M29 35h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Sznaucery", "Czujny", "Charakterny"],
        keywords: ["sznaucer", "miniatura", "sznaucerki", "broda", "pieprz i sól"],
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 4, energyLevel: 4 }
    },
    {
        id: "newfoundland",
        title: "Nowofundland (Wodołaz)",
        desc: "Potężny, majestatyczny pies o niespotykanie łagodnym usposobieniu. Słynie z instynktu ratowniczego i miłości do wody – posiada nawet błonę pławną między palcami. Nowofundlandy są niesamowicie cierpliwe i opiekuńcze wobec dzieci, przez co nazywa się je psimi nianiami.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23222'/><circle cx='18' cy='32' r='10' fill='%231A1A1A'/><circle cx='46' cy='32' r='10' fill='%231A1A1A'/><circle cx='32' cy='36' r='16' fill='%23222'/><circle cx='26' cy='31' r='2.5' fill='%23333'/><circle cx='38' cy='31' r='2.5' fill='%23333'/><path d='M29 37h6l-3 3z' fill='%23111'/></svg>",
        tags: ["Molosy", "Ratownik", "Łagodny olbrzym"],
        keywords: ["nowofundland", "wodołaz", "czarny niedźwiedź", "wielki", "ratowniczy"],
        filters: { kidsFriendly: 5, apartmentLive: 1, easyToTrain: 4, energyLevel: 2 }
    },
    {
        id: "pekingese",
        title: "Pekińczyk",
        desc: "Dawny, święty pies chińskich cesarzy. Pekińczyki to stworzenia niezwykle dumne, niezależne i pełne godności. Nie przepadają za intensywnym wysiłkiem, obcymi ludźmi ani hałaśliwymi dziećmi. Są bardzo lojalne wobec jednego opiekuna i doskonale odnajdują się w spokojnych mieszkaniach.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23D49B55'/><circle cx='20' cy='34' r='8' fill='%23A06B2F'/><circle cx='44' cy='34' r='8' fill='%23A06B2F'/><path d='M18 36c0-8 6-12 14-12s14 4 14 12-6 12-14 12-14-4-14-12z' fill='%23D49B55'/><path d='M24 32h16v12H24z' fill='%23222'/><circle cx='27' cy='30' r='2' fill='%23222'/><circle cx='33' cy='30' r='2' fill='%23222'/><path d='M29 38h6l-3-2z' fill='%23FFFDF9'/></svg>",
        tags: ["Do towarzystwa", "Niezależny", "Spokojny"],
        keywords: ["pekińczyk", "pekin", "krótka kufa", "dumna rasa"],
        filters: { kidsFriendly: 2, apartmentLive: 5, easyToTrain: 2, energyLevel: 1 }
    },
    {
        id: "pomeranian",
        title: "Szpic Miniaturowy (Pomeranian)",
        desc: "Puchata, niezwykle energiczna i głośna kuleczka. Pomeraniany to psy bardzo odważne, bystre i ciekawskie, które potrafią głośno alarmować o każdym szmerze za drzwiami. Posiadają niesamowicie gęstą, dwuwarstwową sierść, która wymaga regularnego, profesjonalnego czesania.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23E68A00'/><circle cx='20' cy='24' r='8' fill='%23CC7A00'/><circle cx='44' cy='24' r='8' fill='%23CC7A00'/><circle cx='32' cy='36' r='14' fill='%23E68A00'/><circle cx='26' cy='31' r='2' fill='%23222'/><circle cx='38' cy='31' r='2' fill='%23222'/><path d='M29 35h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Szpice", "Puchaty", "Czujny"],
        keywords: ["pomeranian", "szpic", "miniaturowy", "puchaty", "liskiem", "szczekacz"],
        filters: { kidsFriendly: 3, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "poodle-standard",
        title: "Pudel",
        desc: "Jeden z najinteligentniejszych i najbardziej wszechstronnych psów na ziemi. Pudle błyskawicznie się uczą, uwielbiają sporty i pracę z człowiekiem. Posiadają strukturę włosa, która w ogóle nie linieje – wymaga jednak strzyżenia. Doskonale dla alergików i rodzin z dziećmi.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23EAD9C9'/><circle cx='22' cy='26' r='6' fill='%23FFFDF9'/><circle cx='42' cy='26' r='6' fill='%23FFFDF9'/><circle cx='32' cy='20' r='8' fill='%23FFFDF9'/><circle cx='32' cy='36' r='12' fill='%23FFFDF9'/><circle cx='27' cy='32' r='2' fill='%23222'/><circle cx='37' cy='32' r='2' fill='%23222'/><path d='M30 37h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Geniusz", "Alergicy"],
        keywords: ["pudel", "poodle", "inteligentny", "lokowany", "włos", "król"],
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 5, energyLevel: 4 }
    },
    {
        id: "rottweiler",
        title: "Rottweiler",
        desc: "Potężny pies obronny o zrównoważonym i spokojnym charakterze. Prawidłowo prowadzony Rottweiler jest łagodnym, oddanym i niezwykle opiekuńczym przyjacielem rodziny. Wymaga jednak bardzo żelaznej konsekwencji, wczesnej socjalizacji i doświadczonego przewodnika.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%232A2A2A'/><path d='M14 22c0-4 4-6 6-2s-2 10-2 10zM50 22c0-4-4-6-6-2s2 10 2 10z' fill='%231A1A1A'/><path d='M16 34c0-8 7-11 16-11s16 3 16 11-6 14-16 14-16-6-16-14z' fill='%232A2A2A'/><circle cx='24' cy='26' r='2.5' fill='%23C67A32'/><circle cx='40' cy='26' r='2.5' fill='%23C67A32'/><circle cx='26' cy='31' r='2' fill='%23111'/><circle cx='38' cy='31' r='2' fill='%23111'/><path d='M25 37c2 2 12 2 14 0z' fill='%23C67A32'/><path d='M30 36h4l-2 1z' fill='%23111'/></svg>",
        tags: ["Stróżujący", "Masywny", "Dla doświadczonych"],
        keywords: ["rottweiler", "rotek", "obronny", "mocny", "czarny podpalany"],
        filters: { kidsFriendly: 3, apartmentLive: 3, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "samoyed",
        title: "Samojed",
        desc: "Nazywany 'uśmiechniętym psem północy' ze względu na specyficzny układ pyszczka. Samojedy are niezwykle przyjacielskie, pozbawione agresji i zakochane w ludziach. Posiadają przepiękną, śnieżnobiałą sierść, która... sama się oczyszcza z błota po wyschnięciu. Potrzebują dużo ruchu.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23E9F1F5'/><circle cx='16' cy='26' r='7' fill='%23FFFDF9'/><circle cx='48' cy='26' r='7' fill='%23FFFDF9'/><circle cx='32' cy='34' r='14' fill='%23FFFDF9'/><circle cx='26' cy='30' r='2.5' fill='%23222'/><circle cx='37' cy='30' r='2.5' fill='%23222'/><path d='M27 35c2 2 8 2 10 0z' fill='%23222'/></svg>",
        tags: ["Szpice", "Kocha ludzi", "Uśmiech"],
        keywords: ["samojed", "samoyed", "biały", "puchaty", "uśmiech", "pociągowy"],
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 4, energyLevel: 4 }
    },
    {
        id: "shih-tzu",
        title: "Shih Tzu",
        desc: "W tłumaczeniu 'lwi piesek' pochodzący z Tybetu. Shih Tzu to rasa niezwykle niezależna, dumna, ale jednocześnie niezwykle towarzyska i wesoła. Mają włos zamiast sierści, uwielbiają zabawy z dziećmi i spanie na poduszkach. Świetny wybór do bloku w mieście.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23EADCC9'/><circle cx='20' cy='30' r='7' fill='%23FFFDF9'/><circle cx='44' cy='30' r='7' fill='%23FFFDF9'/><circle cx='32' cy='34' r='13' fill='%23FFFDF9'/><path d='M22 28c0-4 4-4 4 0s-2 6-4 6zM42 28c0-4-4-4-4 0s2 6 4 6z' fill='%23A48A73'/><circle cx='27' cy='31' r='2.5' fill='%23222'/><circle cx='37' cy='31' r='2.5' fill='%23222'/><path d='M30 36h4l-2 1z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Wesoły", "Alergicy"],
        keywords: ["shih", "tzu", "shihtzu", "mały", "włos", "tybetański"],
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 3, energyLevel: 2 }
    },
    {
        id: "siberian-husky",
        title: "Husky Syberyjski",
        desc: "Pies stworzony do ciągnięcia zaprzęgów w ekstremalnych warunkach. Husky posiada potężny instynkt ucieczek i niezależną naturę – rzadko słucha komend na spacerze, jeśli złapie trop. Nie szczeka, lecz widowiskowo wyje. Wymaga wybiegania każdego dnia.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%237A8B99'/><path d='M18 18l4-10 6 6zM46 18l-4-10-6 6z' fill='%234A5863'/><path d='M20 34c0-7 4-10 12-10s12 3 12 10-4 12-12 12-12-5-12-12z' fill='%23FFFDF9'/><path d='M24 28c2-4 14-4 16 0z' fill='%234A5863'/><circle cx='26' cy='32' r='2.5' fill='%235BC0BE'/><circle cx='38' cy='32' r='2.5' fill='%235BC0BE'/><path d='M30 37h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Szpice", "Biegacz", "Niezależny"],
        keywords: ["husky", "haski", "syberyjski", "niebieskie oczy", "wilk", "wyje"],
        filters: { kidsFriendly: 4, apartmentLive: 2, easyToTrain: 2, energyLevel: 5 }
    },
    {
        id: "welsh-corgi",
        title: "Welsh Corgi Pembroke",
        desc: "Ulubiony pies brytyjskiej królowej Elżbiety II. Mimo krótkich nóżek, Corgi to w 100% zwinny i inteligentny pies pasterski. Niezwykle wesołe, odważne i bardzo czujne. Mają tendencję do nadmiernego szczekania i podgryzania pięt uciekających dzieci.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23E28743'/><path d='M14 14c0-6 8-6 12 0zM50 14c0-6-8-6-12 0z' fill='%23C86F2D'/><path d='M18 34c0-8 5-11 14-11s14 3 14 11-5 13-12 13-12-5-12-13z' fill='%23E28743'/><path d='M22 34c0 6 4 10 10 10s10-4 10-10z' fill='%23FFFDF9'/><circle cx='26' cy='31' r='2.5' fill='%23222'/><circle cx='38' cy='31' r='2.5' fill='%23222'/><path d='M30 36h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Pasterskie", "Krótkie łapki", "Królewski"],
        keywords: ["corgi", "korgi", "welsh", "pembroke", "lisek", "królowa"],
        filters: { kidsFriendly: 4, apartmentLive: 4, easyToTrain: 4, energyLevel: 4 }
    },
    {
        id: "yorkshire-terrier",
        title: "Yorkshire Terrier",
        desc: "Choć dziś kojarzony z kokardkami, to w sercu waleczny terrier stworzony do polowań na szczury. Yorki są niezwykle odważne, pewne sebe i bardzo przywiązane do właściciela. Posiadają włos, który stale rośnie i nie linieje, przez co są idealne dla alergików.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23D4A373'/><path d='M14 22c0-4 4-6 6-2s-2 10-2 10zM50 22c0-4-4-6-6-2s2 10 2 10z' fill='%234A4E69'/><path d='M18 34c0-8 5-11 14-11s14 3 14 11-5 12-12 12-12-4-12-12z' fill='%23D4A373'/><path d='M20 26c0-6 12-6 12 0s-12 6-12 6z' fill='%234A4E69'/><circle cx='26' cy='31' r='2' fill='%23222'/><circle cx='38' cy='31' r='2' fill='%23222'/><path d='M30 36h4l-2 1z' fill='%23222'/></svg>",
        tags: ["Terriery", "Mały wojownik", "Alergicy"],
        keywords: ["york", "jork", "terier", "terrier", "włos", "mały"],
        filters: { kidsFriendly: 3, apartmentLive: 5, easyToTrain: 3, energyLevel: 3 }
    }
];
