// src/data/breedsAL.js

export const BREEDS_A_L = [
    {
        id: "akita",
        title: "Akita Inu",
        desc: "Dumna, niezależna i niezwykle wierna rasa pochodząca z Japonii. Akity są psami jednego właściciela, bardzo powściągliwymi wobec obcych. Wymgają konsekwentnego prowadzenia i wczesnej socjalizacji. Mają silny instynkt łowiecki i terytorialny.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23EAA15F'/><path d='M20 22l4-8 6 6zM44 22l-4-8-6 6z' fill='%23D3833F'/><circle cx='32' cy='36' r='16' fill='%23FFFDF9'/><circle cx='26' cy='32' r='2' fill='%23222'/><circle cx='38' cy='32' r='2' fill='%23222'/><path d='M30 38h4l-2 3z' fill='%23222'/></svg>",
        tags: ["Szpice", "Stróżujący", "Japonia"],
        keywords: ["akita", "inu", "japoński", "hachiko", "rudy"],
        filters: { kidsFriendly: 2, apartmentLive: 3, easyToTrain: 2, energyLevel: 3 }
    },
    {
        id: "amstaff",
        title: "American Staffordshire Terrier",
        desc: "Niezwykle silny, dynamiczny i lojalny pies. Wbrew stereotypom, odpowiednio wychowany Amstaff jest niezwykle czuły wobec ludzi i oddany rodzinie. Wymaga jednak bardzo odpowiedzialnego właściciela, jasnych zasad oraz sporej dawki aktywności fizycznej.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%238A7968'/><path d='M16 16c0 0 4-6 10-2s-2 10-2 10zM48 16c0 0-4-6-10-2s2 10 2 10z' fill='%236E5E50'/><path d='M16 34c0-10 7-14 16-14s16 4 16 14-6 14-16 14-16-4-16-14z' fill='%23FFFDF9'/><ellipse cx='25' cy='30' rx='2.5' ry='3' fill='%23222'/><ellipse cx='39' cy='30' rx='2.5' ry='3' fill='%23222'/><path d='M29 36h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Terriery", "Silny", "Aktywny"],
        keywords: ["amstaff", "ast", "pitbull", "stafford", "terier"],
        filters: { kidsFriendly: 3, apartmentLive: 4, easyToTrain: 3, energyLevel: 4 }
    },
    {
        id: "australian-shepherd",
        title: "Owczarek Australijski (Aussie)",
        desc: "Wulkan energii i tytan pracy. To pies wybitnie inteligentny, który uczy się sztuczek w mgnieniu oka. Jeśli nie zapewnisz mu zajęcia umysłowego i długich spacerów, sam znajdzie sobie zajęcie – często niszcząc rzeczy. Kocha całą rodzinę.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23556270'/><path d='M14 22c0-6 6-8 10-4s-2 10-2 10zM50 22c0-6-6-8-10-4s2 10 2 10z' fill='%233B444E'/><path d='M20 26h24v24H20z' fill='%23FFFDF9'/><path d='M16 32c0-8 7-10 16-10s16 2 16 10-6 14-16 14-16-6-16-14z' fill='%23C2A68F'/><circle cx='26' cy='30' r='2.5' fill='%234EA5D9'/><circle cx='38' cy='30' r='2.5' fill='%234EA5D9'/><path d='M30 35h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Pasterskie", "Inteligentny", "Sportowiec"],
        keywords: ["aussie", "australijski", "owczarek", "blue merle", "pasterski"],
        filters: { kidsFriendly: 5, apartmentLive: 2, easyToTrain: 5, energyLevel: 5 }
    },
    {
        id: "basenji",
        title: "Basenji",
        desc: "Afrykański pies, który... nie szczeka, lecz wydaje specyficzne dźwięki przypominające jodłowanie. Słyną z czystości, myją się jak koty i nie lubią deszczu. Mają bardzo niezależny charakter i silny instynkt pogoni za wszystkim, co ucieka.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23D96B27'/><path d='M18 18l4-10 6 6zM46 18l-4-10-6 6z' fill='%23B25319'/><path d='M22 34c0-7 4-10 10-10s10 3 10 10-4 12-10 12-10-5-10-12z' fill='%23FFFDF9'/><circle cx='27' cy='31' r='2' fill='%23222'/><circle cx='37' cy='31' r='2' fill='%23222'/><path d='M30 36h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Pierwotne", "Cichy", "Koci charakter"],
        keywords: ["basenji", "afrykański", "nie szczeka", "czysty"],
        filters: { kidsFriendly: 3, apartmentLive: 5, easyToTrain: 2, energyLevel: 4 }
    },
    {
        id: "beagle",
        title: "Beagle",
        desc: "Wesoły, towarzyski i wiecznie głodny pies gończy. Kochają dzieci i świetnie dogadują się z innymi psami. Ich wadą jest niesamowicie czuły nos – jeśli Beagle poczuje ciekawy zapach na spacerze, potrafi całkowicie odciąć się od komend właściciela.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23C68A4C'/><path d='M14 24c0 0-2 12 4 16s8-6 8-16zM50 24c0 0 2 12-4 16s-8-6-8-16z' fill='%23543D2B'/><path d='M20 32c0-8 5-10 12-10s12 2 12 10-4 12-12 12-12-4-12-12z' fill='%23FFFDF9'/><circle cx='27' cy='29' r='2.5' fill='%23222'/><circle cx='37' cy='29' r='2.5' fill='%23222'/><path d='M29 35h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Gończe", "Przyjazny", "Myśliwski"],
        keywords: ["beagle", "bigiel", "gończy", "łaciaty", "nos"],
        filters: { kidsFriendly: 5, apartmentLive: 4, easyToTrain: 2, energyLevel: 4 }
    },
    {
        id: "bernese",
        title: "Berneński Pies Pasterski",
        desc: "Łagodny olbrzym o przepięknym, trójkolorowym umaszczeniu. Berneńczyki to oaza spokoju, uwielbiają dzieci i są niesamowicie cierpliwe. Ze względu na gabaryty i gęstą sierść źle znoszą upały. Potrzebują bliskości człowieka.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%232C2C2C'/><path d='M12 24c0 0-2 14 6 16s8-4 8-16zM52 24c0 0 2 14-6 16s-8-4-8-16z' fill='%231A1A1A'/><path d='M22 34c0-6 4-10 10-10s10 4 10 10-4 12-10 12-10-6-10-12z' fill='%23FFFDF9'/><path d='M18 36c2-4 5-5 5-5s3 3 1 7zM46 36c-2-4-5-5-5-5s-3 3-1 7z' fill='%23D97D24'/><circle cx='27' cy='31' r='2.5' fill='%23222'/><circle cx='37' cy='31' r='2.5' fill='%23222'/><path d='M30 36h4l-2 3z' fill='%23E22E2E'/></svg>",
        tags: ["Molosy", "Stado", "Łagodny"],
        keywords: ["berneńczyk", "berneński", "pasterski", "duży", "misiek"],
        filters: { kidsFriendly: 5, apartmentLive: 1, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "bichon",
        title: "Bichon Frise",
        desc: "Mały, biały piesek przypominający chmurkę lub pluszową zabawkę. Jest niezwykle wesoły, łagodny i nie linieje (ma włos, a nie sierść – dobry dla alergików). Idealny towarzysz do mieszkania w bloku, kocha pieszczoty i zabawę.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23E2F1F8'/><circle cx='18' cy='28' r='8' fill='%23FFFDF9'/><circle cx='46' cy='28' r='8' fill='%23FFFDF9'/><circle cx='32' cy='34' r='14' fill='%23FFFDF9'/><circle cx='27' cy='30' r='2.5' fill='%23222'/><circle cx='37' cy='30' r='2.5' fill='%23222'/><path d='M30 36h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Alergicy", "Mały"],
        keywords: ["bichon", "frise", "biały", "mały", "włos", "hipoalergiczny"],
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "border-collie",
        title: "Border Collie",
        desc: "Oficjalnie uznawany za najinteligentniejszą rasę psa na świecie. Border potrafi pracować bez przerwy. Błyskawicznie analizuje sytuację i uczy się komend po jednym powtórzeniu. Wymaga gigantycznej pracy umysłowej – sam spacer mu nie wystarczy.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23252525'/><path d='M14 20c0-6 4-6 8-2s0 10 0 10zM50 20c0-6-4-6-8-2s0 10 0 10z' fill='%23151515'/><path d='M22 28h20v24H22z' fill='%23FFFDF9'/><path d='M22 36c0-8 4-10 10-10s10 2 10 10-4 12-10 12-10-4-10-12z' fill='%23252525'/><path d='M26 30h12l-6 12z' fill='%23FFFDF9'/><circle cx='27' cy='32' r='2' fill='%23222'/><circle cx='37' cy='32' r='2' fill='%23222'/><path d='M30 37h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Pasterskie", "Geniusz", "Praca"],
        keywords: ["border", "collie", "inteligentny", "czarno biały", "agility"],
        filters: { kidsFriendly: 4, apartmentLive: 2, easyToTrain: 5, energyLevel: 5 }
    },
    {
        id: "boxer",
        title: "Bokser",
        desc: "Pies o charakterze wiecznego dziecka. Bokser jest niezwykle ekspresyjny, skoczny i pełen radości życia. Kocha dzieci, potrafi się z nimi bawić godzinami. Bywa uparty przy szkoleniu, ale nadrabia to ogromnym przywiązaniem do rodziny.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23D27D2D'/><path d='M16 18c0-4 4-4 6 0s0 8 0 8zM48 18c0-4-4-4-6 0s0 8 0 8z' fill='%23A05A15'/><path d='M18 34c0-9 6-12 14-12s14 3 14 12-6 14-14 14-14-5-14-14z' fill='%23D27D2D'/><path d='M24 32h16v14H24z' fill='%23222'/><ellipse cx='26' cy='29' rx='2' ry='2.5' fill='%23222'/><ellipse cx='38' cy='29' rx='2' ry='2.5' fill='%23222'/><path d='M28 38h8l-4 4z' fill='%23FFFDF9'/></svg>",
        tags: ["Molosy", "Energiczny", "Opiekun"],
        keywords: ["boxer", "bokser", "faflun", "krótka sierść"],
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 3, energyLevel: 5 }
    },
    {
        id: "boston-terrier",
        title: "Boston Terrier",
        desc: "Nazywany 'amerykańskim dżentelmenem' z powodu swojego eleganckiego umaszczenia przypominającego smoking. To pies o genialnym charakterze – kompaktowy, bystry, bardzo dostosowujący się do trybu życia właściciela. Idealny do miasta.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23262626'/><path d='M16 16l4-10 6 8zM48 16l-4-10-6 8z' fill='%23111'/><path d='M20 34c0-8 5-11 12-11s12 3 12 11-5 13-12 13-12-5-12-13z' fill='%23262626'/><path d='M26 27h12v18H26z' fill='%23FFFDF9'/><circle cx='26' cy='32' r='3' fill='%23222'/><circle cx='38' cy='32' r='3' fill='%23222'/><circle cx='27' cy='31' r='1' fill='%23FFF'/><circle cx='39' cy='31' r='1' fill='%23FFF'/><path d='M30 38h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Miasto", "Wesoły"],
        keywords: ["boston", "terrier", "terier", "smoking", "mały"],
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "bulldog-french",
        title: "Buldog Francuski",
        desc: "Jeden z najpopularniejszych psów miejskich. Buldożki są zabawne, towarzyskie i bardzo uparte. Nie potrzebują ekstremalnie długich spacerów, źle znoszą upały z powodu skróconej kufy. Kochają spać na kanapie blisko człowieka.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23DFD5C6'/><path d='M14 18c0-6 6-8 10-2s-2 12-2 12zM50 18c0-6-6-8-10-2s2 12 2 12z' fill='%23C1B4A1'/><path d='M18 36c0-9 6-12 14-12s14 3 14 12-6 13-14 13-14-4-14-13z' fill='%23DFD5C6'/><ellipse cx='25' cy='32' rx='2.5' ry='3' fill='%23222'/><ellipse cx='39' cy='32' rx='2.5' ry='3' fill='%23222'/><path d='M26 38c0-4 12-4 12 0s-12 3-12 0z' fill='%239E8E7D'/><path d='M30 37h4l-2 1z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Kanapowiec", "Kompaktowy"],
        keywords: ["buldog", "francuski", "frenchie", "mopsik", "uszatek"],
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 3, energyLevel: 2 }
    },
    {
        id: "bulldog-english",
        title: "Buldog Angielski",
        desc: "Masywny, przysadzisty i pełen flegmatycznego uroku osobistego. Buldog angielski to z reguły oaza spokoju, potrafi przespać większość dnia. Wymaga starannej pielęgnacji fałdek na pyszczku i uwagi ze względu na zdrowie.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23C4A482'/><path d='M12 24c0-4 4-6 6-2s-2 10-2 10zM52 24c0-4-4-6-6-2s2 10 2 10z' fill='%23A0805F'/><circle cx='32' cy='36' r='16' fill='%23FFFDF9'/><path d='M16 34c0-8 7-11 16-11s16 3 16 11-6 15-16 15-16-7-16-15z' fill='%23C4A482'/><circle cx='25' cy='30' r='2' fill='%23222'/><circle cx='39' cy='30' r='2' fill='%23222'/><path d='M22 38c0-4 20-4 20 0s-20 4-20 0z' fill='%23A0805F'/><path d='M30 37h4v2h-4z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Spokojny", "Masywny"],
        keywords: ["buldog", "angielski", "grubas", "flegmatyk"],
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 2, energyLevel: 1 }
    },
    {
        id: "bull-terrier",
        title: "Bulterier",
        desc: "Charakterystyczny pies o 'jajowatej' głowie. Bulteriery to psy niezwykle silne, oddane rodzinie i pełne zwariowanego humoru (często nazywane klaunami w psiej skórze). Potrzebują zdecydowanego prowadzenia, by nie zdominowały domu.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23FFFDF9'/><path d='M20 18l2-10 6 6zM44 18l-2-10-6 6z' fill='%23E0DCD3'/><path d='M20 34c0-12 5-16 12-16s12 4 12 16-5 14-12 14-12-2-12-14z' fill='%23FFFDF9'/><ellipse cx='22' cy='28' rx='4' ry='5' fill='%23C69A73'/><path d='M21 28l2-1zM39 27l2-1z' fill='%23222'/><path d='M30 38h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Terriery", "Charakterystyczny", "Uparciuch"],
        keywords: ["bulterier", "bull", "terrier", "jajogłowy", "gladiator"],
        filters: { kidsFriendly: 4, apartmentLive: 4, easyToTrain: 2, energyLevel: 4 }
    },
    {
        id: "cane-corso",
        title: "Cane Corso",
        desc: "Potężny, majestatyczny pies stróżujący i obronny pochodzący z Włoch. Wykazuje ogromną lojalność wobec własnego stada, z natury jest nieufny wobec obcych. Wymaga doskonałej socjalizacji od szczeniaka i doświadczonego przewodnika.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%233A3A3A'/><path d='M14 20c0 0 0-10 6-10s4 10 4 10zM50 20c0 0 0-10-6-10s-4 10-4 10z' fill='%23222'/><path d='M16 35c0-10 7-14 16-14s16 4 16 14-6 15-16 15-16-5-16-15z' fill='%233A3A3A'/><ellipse cx='25' cy='30' rx='2.5' ry='3' fill='%23222'/><ellipse cx='39' cy='30' rx='2.5' ry='3' fill='%23222'/><path d='M24 38c0-3 16-3 16 0s-16 4-16 0z' fill='%23111'/><path d='M30 37h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Stróżujący", "Molosy", "Dla doświadczonych"],
        keywords: ["cane", "corso", "włoski", "duży", "obronny", "masyw"],
        filters: { kidsFriendly: 3, apartmentLive: 2, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "cavalier",
        title: "Cavalier King Charles Spaniel",
        desc: "Pies o spojrzeniu, które potrafi roztopić każde serce. Cavalier jest pozbawiony jakiejkolwiek agresji, niesamowicie łagodny i przyjacielski. Kocha cały świat – ludzi, inne psy i koty. Idealny wybór na pierwszego psa dla rodziny z dziećmi.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23FFFDF9'/><path d='M12 22c0 0-2 16 6 18s8-6 8-18zM52 22c0 0 2 16-6 18s-8-6-8-18z' fill='%23C77A42'/><path d='M18 32c0-8 6-10 14-10s14 2 14 10-6 13-14 13-14-5-14-13z' fill='%23FFFDF9'/><circle cx='26' cy='29' r='3' fill='%23222'/><circle cx='38' cy='29' r='3' fill='%23222'/><path d='M29 35h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Spaniele", "Łagodny", "Rodzinny"],
        keywords: ["cavalier", "king", "charles", "spaniel", "łagodny", "uszy"],
        filters: { kidsFriendly: 5, apartmentLive: 5, easyToTrain: 4, energyLevel: 3 }
    },
    {
        id: "chihuahua",
        title: "Chihuahua",
        desc: "Najmniejszy pies świata o wielkim sercu i jeszcze większym temperamencie. Często nie zdaje sobie sprawy ze swoich mikrych gabarytów i potrafi oszczekać wielkiego owczarka. Bardzo przywiązuje się do jednego właściciela i uwielbia noszenie na rękach.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23D4B28C'/><path d='M14 16c0-6 8-6 12-2zM50 16c0-6-8-6-12-2z' fill='%23BFA17A'/><path d='M20 36c0-9 5-12 12-12s12 3 12 12-5 12-12 12-12-3-12-12z' fill='%23D4B28C'/><circle cx='26' cy='32' r='2' fill='%23222'/><circle cx='38' cy='32' r='2' fill='%23222'/><path d='M30 38h4l-2 1z' fill='%23222'/></svg>",
        tags: ["Do towarzystwa", "Miniaturowy", "Zadziorny"],
        keywords: ["chihuahua", "czilala", "mały", "najmniejszy", "kieszonkowy"],
        filters: { kidsFriendly: 2, apartmentLive: 5, easyToTrain: 3, energyLevel: 2 }
    },
    {
        id: "chow-chow",
        title: "Chow Chow",
        desc: "Niezwykły pies o wyglądzie lwa i unikalnym, niebiesko-czarnym języku. Z charakteru przypomina kota – jest powściągliwy, niezależny, rzadko okazuje wylewnie uczucia. Nie jest fanem intensywnego szkolenia ani obcych ludzi.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23DE9352'/><circle cx='24' cy='26' r='8' fill='%23DE9352'/><circle cx='40' cy='26' r='8' fill='%23DE9352'/><circle cx='32' cy='36' r='15' fill='%23DE9352'/><circle cx='26' cy='32' r='2' fill='%23222'/><circle cx='38' cy='32' r='2' fill='%23222'/><path d='M29 37h6l-3 4z' fill='%232B4C7E'/></svg>",
        tags: ["Szpice", "Niezależny", "Niebieski język"],
        keywords: ["chow", "chowchow", "lew", "puchaty", "język"],
        filters: { kidsFriendly: 2, apartmentLive: 4, easyToTrain: 1, energyLevel: 2 }
    },
    {
        id: "cocker-spaniel",
        title: "Cocker Spaniel Angielski",
        desc: "Elegancki pies o pięknych, długich uszach i wiecznie machającym ogonie. Cocker spaniele to psy myśliwskie – uwielbiają wodę, węszenie i aportowanie. Są bardzo przyjacielskie, ale bywają też uparte i wymagają konsekwentnego wychowania.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23C67A32'/><path d='M10 24c0 0-2 18 6 20s8-6 8-20zM54 24c0 0 2 18-6 20s-8-6-8-20z' fill='%23A05A1F'/><path d='M18 32c0-8 6-10 14-10s14 2 14 10-6 13-14 13-14-5-14-13z' fill='%23C67A32'/><circle cx='26' cy='29' r='2.5' fill='%23222'/><circle cx='38' cy='29' r='2.5' fill='%23222'/><path d='M30 35h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Spaniele", "Myśliwski", "Wesoły"],
        keywords: ["cocker", "spaniel", "angielski", "rudy", "uszy"],
        filters: { kidsFriendly: 4, apartmentLive: 4, easyToTrain: 4, energyLevel: 4 }
    },
    {
        id: "dalmatian",
        title: "Dalmatyńczyk",
        desc: "Słynny pies w czarne lub brązowe kropki. Dalmatyńczyki to psy o ogromnej wytrzymałości – dawniej biegały za powozami konnymi. Potrzebują bardzo dużo ruchu. Są inteligentne, czujne i silnie przywiązują się do domowników.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23FFFDF9'/><circle cx='12' cy='18' r='2' fill='%23222'/><circle cx='50' cy='42' r='3' fill='%23222'/><circle cx='20' cy='50' r='2' fill='%23222'/><path d='M14 24c0 0-2 14 4 16s8-6 8-16zM50 24c0 0 2 14-4 16s-8-6-8-16z' fill='%23FFFDF9'/><circle cx='46' cy='20' r='2.5' fill='%23222'/><circle cx='16' cy='38' r='1.5' fill='%23222'/><path d='M20 32c0-8 5-10 12-10s12 2 12 10-4 12-12 12-12-4-12-12z' fill='%23FFFDF9'/><circle cx='27' cy='29' r='2.5' fill='%23222'/><circle cx='37' cy='29' r='2.5' fill='%23222'/><path d='M30 35h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Gończe", "Kropki", "Biegacz"],
        keywords: ["dalmatyńczyk", "kropki", "101", "biały w kropki", "dalmatyń"],
        filters: { kidsFriendly: 4, apartmentLive: 3, easyToTrain: 4, energyLevel: 5 }
    },
    {
        id: "doberman",
        title: "Doberman",
        desc: "Arystokrata wśród psów obronnych. Niezwykle inteligentny, szybki, silny i bezgranicznie oddany swojej rodzinie. Wbrew obiegowej opinii z filmów, dobrze prowadzony doberman to pies stabilny psychicznie, wrażliwy i bardzo czuły.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23222'/><path d='M18 16l4-12 4 12zM46 16l-4-12-4 12z' fill='%23111'/><path d='M18 34c0-10 6-13 14-13s14 3 14 13-6 14-14 14-14-4-14-14z' fill='%23222'/><circle cx='24' cy='25' r='2' fill='%23B06A3B'/><circle cx='40' cy='25' r='2' fill='%23B06A3B'/><circle cx='26' cy='31' r='2' fill='%23111'/><circle cx='38' cy='31' r='2' fill='%23111'/><path d='M26 38c2 3 10 3 12 0z' fill='%23B06A3B'/><path d='M30 37h4l-2 1z' fill='%23222'/></svg>",
        tags: ["Stróżujący", "Inteligentny", "Obrońca"],
        keywords: ["doberman", "stróż", "czarny podpalany", "elegancki"],
        filters: { kidsFriendly: 3, apartmentLive: 3, easyToTrain: 5, energyLevel: 4 }
    },
    {
        id: "golden-retriever",
        title: "Golden Retriever",
        desc: "Synonim psa rodzinnego. Goldeny kochają wszystkich i wszystko. Są niezwykle łagodne, cierpliwe wobec dzieci i chętne do współpracy z człowiekiem. Uwielbiają wodę i aportowanie. Wykorzystywane masowo w dogoterapii.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23F4D090'/><path d='M12 24c0 0-2 16 6 18s8-6 8-18zM52 24c0 0 2 16-6 18s-8-6-8-18z' fill='%23D4B070'/><path d='M18 32c0-8 6-10 14-10s14 2 14 10-6 13-14 13-14-5-14-13z' fill='%23F4D090'/><circle cx='26' cy='29' r='2.5' fill='%23222'/><circle cx='38' cy='29' r='2.5' fill='%23222'/><path d='M29 35h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Retrievery", "Rodzinny", "Łagodny"],
        keywords: ["golden", "retriever", "retriwer", "biszkoptowy", "łagodny"],
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 5, energyLevel: 4 }
    },
    {
        id: "great-dane",
        title: "Dog Niemiecki",
        desc: "Apollo wśród psów. Mimo gigantycznych rozmiarów (potrafią ważyć 90 kg), są to psy niezwykle delikatne, spokojne i wrażliwe. Kochają kanapę i tulenie do właściciela. Niestety, żyją bardzo krótko, jak większość ras olbrzymich.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%239FB1BC'/><path d='M16 16c0-6 6-6 8 0s-2 12-2 12zM48 16c0-6-6-6-8 0s2 12 2 12z' fill='%236E828E'/><path d='M18 34c0-11 6-14 14-14s14 3 14 14-6 16-14 16-14-5-14-16z' fill='%239FB1BC'/><circle cx='22' cy='26' r='3' fill='%23222'/><circle cx='44' cy='38' r='4' fill='%23222'/><circle cx='25' cy='30' r='2' fill='%23222'/><circle cx='39' cy='30' r='2' fill='%23222'/><path d='M29 37h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Molosy", "Olbrzym", "Spokojny"],
        keywords: ["dog", "niemiecki", "wielki", "olbrzym", "arlekin"],
        filters: { kidsFriendly: 5, apartmentLive: 2, easyToTrain: 4, energyLevel: 2 }
    },
    {
        id: "jack-russell",
        title: "Jack Russell Terrier",
        desc: "Małe ciało, potężny charakter i nieskończone pokłady energii. Jack Russell to pies myśliwski na lisy – jest niezwykle odważny, uparty, uwielbia kopać dziury i gonić piłkę do upadłego. Nie nadaje się dla osób szukających spokoju.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23FFFDF9'/><path d='M14 20c0-4 6-4 8 0s-2 10-2 10z' fill='%23C67A32'/><path d='M50 20c0-4-6-4-8 0s2 10 2 10z' fill='%23FFFDF9'/><path d='M18 34c0-8 6-11 14-11s14 3 14 11-6 13-14 13-14-5-14-13z' fill='%23FFFDF9'/><ellipse cx='38' cy='32' rx='6' ry='7' fill='%23C67A32'/><circle cx='26' cy='31' r='2.5' fill='%23222'/><circle cx='38' cy='31' r='2.5' fill='%23222'/><path d='M30 36h4l-2 2z' fill='%23222'/></svg>",
        tags: ["Terriery", "Wulkan energii", "Mały"],
        keywords: ["jack", "russell", "jrt", "terier", "maskotka", "piłeczka"],
        filters: { kidsFriendly: 4, apartmentLive: 5, easyToTrain: 3, energyLevel: 5 }
    },
    {
        id: "labrador",
        title: "Labrador Retriever",
        desc: "Jeden z najpopularniejszych psów na globie. Labradory są silne, wesołe i niesamowicie zorientowane na jedzenie (mają tendencję do tycia). Uwielbiają pływać w każdej napotkanej kałuży. Wspaniałe psy asystujące i rodzinne.",
        img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23EAD0A3'/><path d='M12 24c0 0-2 16 6 18s8-6 8-18zM52 24c0 0 2 16-6 18s-8-6-8-18z' fill='%23CBB388'/><path d='M18 32c0-8 6-10 14-10s14 2 14 10-6 13-14 13-14-5-14-13z' fill='%23EAD0A3'/><circle cx='26' cy='29' r='2.5' fill='%23222'/><circle cx='38' cy='29' r='2.5' fill='%23222'/><path d='M29 35h6l-3 3z' fill='%23222'/></svg>",
        tags: ["Retrievery", "Rodzinny", "Żarłok"],
        keywords: ["labrador", "labek", "retriever", "czekoladowy", "czarny"],
        filters: { kidsFriendly: 5, apartmentLive: 3, easyToTrain: 5, energyLevel: 4 }
    }
];
