// src/data/wikiData.js

export const WIKI = {
    rasy: [
        { id: "rasa_golden", title: "Golden Retriever", tags: ["✅ Dla początkujących", "⚡ Wysoka Energia", "💧 Kocha wodę"], desc: "Inteligentne, nastawione na pracę z człowiekiem i chętne do nauki. Uwielbiają wodę i aportowanie. Idealne dla aktywnej rodziny i bardzo cierpliwe wobec dzieci." },
        { id: "rasa_border", title: "Border Collie", tags: ["❌ Wymagający", "⚡⚡ Ekstremalna Energia", "🧠 Super inteligentny"], desc: "Wulkan energii i inteligencji. Uznawane za najmądrzejszą rasę psów. Nastawione na intensywną pracę mentalną i fizyczną. Potrzebują ciągłego szkolenia, inaczej same znajdą sobie niszczące zajęcie." },
        { id: "rasa_mops", title: "Mops (Pug)", tags: ["✅ Dla początkujących", "🛋️ Kanapowiec", "⚠️ Krótka kufa"], desc: "Towarzyskie, wesołe i bardzo przywiązane do właściciela. Doskonale czują się w mieszkaniach i nie wymagają długich spacerów. Trzeba uważać na nie w upalne dni ze względu na problemy z oddychaniem." },
        { id: "rasa_on", title: "Owczarek Niemiecki", tags: ["🛡️ Stróżujący", "⚡ Wysoka Energia", "❤️ Lojalny"], desc: "Niezwykle lojalne, odważne i pewne siebie psy. Wymgają stanowczego, ale sprawiedliwego prowadzenia. Doskonale sprawdzają się w szkoleniach obronnych i posłuszeństwa." },
        { id: "rasa_husky", title: "Husky Syberyjski", tags: ["❌ Wymagający", "🏃‍♂️ Biegacz", "🐺 Niezależny"], desc: "Psy stworzone do biegania. Mają silny instynkt łowiecki i często problemy z przywoływaniem. Potrzebują ogromnej dawk ruchu codziennie. Uwielbiają mrozy, źle znoszą upały." },
        { id: "rasa_buldog", title: "Buldog Francuski", tags: ["✅ Dla początkujących", "🛋️ Kanapowiec", "⚠️ Krótka kufa"], desc: "Mały pies o wielkim sercu i charakterze klauna. Świetny kompan do mieszkania. Należy jednak bardzo uważać na jego zdrowie (kręgosłup, oddychanie, alergie)." },
        { id: "rasa_kundelek", title: "Kundelek", tags: ["❤️ Wyjątkowy", "🧬 Odporny", "🎁 Pełen niespodzianek"], desc: "Mieszanka wielu ras sprawia, że są często bardziej odporne na choroby genetyczne. Każdy jest inny, unikalny i ma niepowtarzalny charakter. Wspaniali, oddani przyjaciele." }
    ],
    trening: [
        { id: "train_tree", title: "Metoda Drzewa (Ciągnięcie na smyczy)", desc: "Pies ciągnie na spacerze? Zamień się w drzewo. Jeśli czujesz napięcie smyczy, zatrzymaj się. Zrób krok dopiero wtedy, gdy pies sam odpuści naciąg lub na Ciebie spojrzy." },
        { id: "train_asphalt", title: "Asfalt latem parzy!", desc: "Zanim wyjdziesz na spacer w południe, przyłóż wewnętrzną część dłoni do chodnika na 5 sekund. Jeśli parzy Ciebie, poparzy też opuszki Twojego psa." },
        { id: "train_bingo", title: "Przywołanie awaryjne", desc: "Wybierz słowo, którego nigdy nie używasz na co dzień (np. 'BINGO!'). Nagradzaj psa za to słowo NAJLEPSZYMI smakołykami, ale ćwicz to rzadko. Używaj tylko w sytuacjach realnego zagrożenia." },
        { id: "train_rule3", title: "Reguła 3 sekund przy głaskaniu", desc: "Chcesz pogłaskać obcego psa? Zapytaj właściciela, kucnij bokiem i podaj psu dłoń do powąchania. Pogłaskaj go przez 3 sekundy po klatce piersiowej (nie po głowie!) i przestań. Jeśli pies chce więcej, sam do Ciebie podejdzie." }
    ],
    sytuacje: [
        { id: "sit_passing", title: "Mijanie innego psa", desc: "Zawsze pozwalaj psom minąć się łukiem, a nie na wprost (to niegrzeczne w psim świecie). Obserwuj sygnały uspokajające: oblizywanie nosa, odwracanie głowy. Nie zmuszaj do witania." },
        { id: "sit_trash", title: "Pies zjada śmieci", desc: "Naucz komendy 'Zostaw'. Zawsze wymieniaj śmieci z ziemi na coś znacznie pyszniejszego z ręki. Pokaż psu, że rezygnacja z byle czego opłaca się stukrotnie." },
        // 🔥 NOWOŚĆ OD KONSULTANTA – TYPY RATUNKOWE:
        { id: "sit_tick_remove", title: "Jak bezpiecznie wyjąć kleszcza?", desc: "Użyj dedykowanych kleszczołapek lub pęsety. Chwyć kleszcza tuż przy samej skórze psa i zdecydowanym ruchem pociągnij prosto w górę. NIE wykręcaj, NIE smaruj kleszcza masłem, tłuszczem ani alkoholem (to zmusza go do wymiotów i zwiększa ryzyko zakażenia!). Po wyjęciu zdezynfekuj miejsce." },
        { id: "sit_tick_protect", title: "Ochrona przed kleszczami – Sprawdzone tipy", desc: "W sezonie (od marca do listopada) stosuj potrójną ochronę: tabletki o działaniu ogólnoustrojowym (np. Bravecto/Simparica po konsultacji z weterynarzem), krople typu spot-on lub specjalne obroże odstraszające. Po każdym spacerze w wysokich trawach dokładnie przejrzyj pachwiny, szyję i brzuch psa." },
        { id: "sit_poison", title: "⚠️ Podejrzenie zatrucia (Zjedzenie trutki/padliny)", desc: "Jeśli widzisz, że pies zjadł coś skrajnie niebezpiecznego (np. trutkę na szczury), kluczowy jest CZAS. Masz maksymalnie 1-2 godziny na wywołanie wymiotów u weterynarza. Nie podawaj mleka ani oleju! Jak najszybciej jedź do najbliższej kliniki całodobowej." }
    ]
};
