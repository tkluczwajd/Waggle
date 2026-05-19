// src/data/wikiData.js

export const WIKI = {
    rasy: [
        { 
            id: "rasa_golden", 
            title: "Golden Retriever", 
            tags: ["✅ Dla początkujących", "⚡ Wysoka Energia", "💧 Kocha wodę"],
            // Parametry do zaawansowanej wyszukiwarki i filtrów (skala 1-5):
            filters: { kidsFriendly: 5, easyToTrain: 5, energyLevel: 4, apartmentLive: 2 },
            desc: "Inteligentne, nastawione na pracę z człowiekiem i chętne do nauki. Uwielbiają wodę i aportowanie. Idealne dla aktywnej rodziny i bardzo cierpliwe wobec dzieci.",
            img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400" // W przyszłości podmienimy na nasze dedykowane rendery AI
        },
        { 
            id: "rasa_border", 
            title: "Border Collie", 
            tags: ["❌ Wymagający", "⚡⚡ Ekstremalna Energia", "🧠 Super inteligentny"],
            filters: { kidsFriendly: 4, easyToTrain: 4, energyLevel: 5, apartmentLive: 1 },
            desc: "Wulkan energii i inteligencji. Uznawane za najmądrzejszą rasę psów. Nastawione na intensywną pracę mentalną i fizyczną. Potrzebują ciągłego szkolenia, inaczej same znajdą sobie niszczące zajęcie.",
            img: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400"
        },
        { 
            id: "rasa_mops", 
            title: "Mops (Pug)", 
            tags: ["✅ Dla początkujących", "🛋️ Kanapowiec", "⚠️ Krótka kufa"],
            filters: { kidsFriendly: 5, easyToTrain: 3, energyLevel: 1, apartmentLive: 5 },
            desc: "Towarzyskie, wesołe i bardzo przywiązane do właściciela. Doskonale czują się w mieszkaniach i nie wymagają długich spacerów. Trzeba uważać na nie w upalne dni ze względu na problemy z oddychaniem.",
            img: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=400"
        },
        { 
            id: "rasa_on", 
            title: "Owczarek Niemiecki", 
            tags: ["🛡️ Stróżujący", "⚡ Wysoka Energia", "❤️ Lojalny"],
            filters: { kidsFriendly: 4, easyToTrain: 5, energyLevel: 4, apartmentLive: 2 },
            desc: "Niezwykle lojalne, odważne i pewne siebie psy. Wymagają stanowczego, ale sprawiedliwego prowadzenia. Doskonale sprawdzają się w szkoleniach obronnych i posłuszeństwa.",
            img: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400"
        }
    ],
    trening: [
        { id: "train_tree", title: "Metoda Drzewa (Ciągnięcie na smyczy)", keywords: ["smycz", "ciągnięcie", "spacer", "napięcie"], desc: "Pies ciągnie na spacerze? Zamień się w drzewo. Jeśli czujesz napięcie smyczy, zatrzymaj się. Zrób krok dopiero wtedy, gdy pies sam odpuści naciąg lub na Ciebie spojrzy." },
        { id: "train_asphalt", title: "Asfalt latem parzy!", keywords: ["lato", "asfalt", "upał", "poparzenie", "poduszki"], desc: "Zanim wyjdziesz na spacer w południe, przyłóż wewnętrzną część dłoni do chodnika na 5 sekund. Jeśli parzy Ciebie, poparzy też opuszki Twojego psa." },
        { id: "train_bingo", title: "Przywołanie awaryjne", keywords: ["ucieczka", "przywołanie", "bingo", "zagrożenie", "smakołyk"], desc: "Wybierz słowo, którego nigdy nie używasz na co dzień (np. 'BINGO!'). Nagradzaj psa za to słowo NAJLEPSZYMI smakołykami, ale ćwicz to rzadko. Używaj tylko w sytuacjach realnego zagrożenia." }
    ],
    sytuacje: [
        { id: "sit_tick_remove", title: "Jak bezpiecznie wyjąć kleszcza?", keywords: ["kleszcz", "pasożyt", "kleszczołapki", "pęseta", "owad"], desc: "Użyj kleszczołapek lub pęsety. Chwyć kleszcza tuż przy samej skórze psa i zdecydowanym ruchem pociągnij prosto w górę. NIE wykręcaj, NIE smaruj kleszcza tłuszczem ani alkoholem! Po wyjęciu zdezynfekuj miejsce." },
        { id: "sit_burdock", title: "Rzepy i osty w sierści – jak usunąć?", keywords: ["rzep", "osty", "kołtun", "sierść", "krzaki"], desc: "Nie ciągnij rzepów na siłę, bo sprawisz psu ból. Nałóż na kołtun odrobinę psiej odżywki lub zwykłej oliwy z oliwek. Odczekaj minutę – poślizg sprawi, że rzepy bez problemu wyjmiesz palcami lub rzadkim grzebieniem." },
        { id: "sit_poison", title: "⚠️ Podejrzenie zatrucia (Trutka/Padlina)", keywords: ["trucizna", "trutka", "padlina", "wymioty", "zjedzenie"], desc: "Jeśli widzisz, że pies zjadł coś skrajnie niebezpiecznego, kluczowy jest CZAS. Masz maksymalnie 1-2 godziny na wywołanie wymiotów u weterynarza. Nie podawaj mleka ani oleju! Jak najszybciej jedź do kliniki." }
    ]
};
