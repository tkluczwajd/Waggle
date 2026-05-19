// src/data/wikiData.js
import { BREEDS_A_L } from './breedsAL.js';

export const WIKI = {
    trening: [
        { 
            id: "train_tree", 
            title: "Metoda Drzewa (Luźna smycz)", 
            keywords: ["smycz", "ciągnięcie", "spacer", "napięcie", "ciągnie"], 
            desc: "Podstawowy trening spacerowy. Gdy tylko poczujesz, że smycz napina się choćby minimalnie, natychmiast zatrzymaj się i stój nieruchomo jak drzewo. Nie szarp psa, nie krzycz. Rusz przed siebie DOPIERO wtedy, gdy pies sam poluzuje smycz lub odwróci się i spojrzy na Ciebie. Uczy to psa, że tylko luźna smycz pozwala iść do przodu." 
        },
        { 
            id: "train_asphalt", 
            title: "Reguła 5 Sekund (Ochrona łap w lato)", 
            keywords: ["lato", "asfalt", "upał", "poparzenie", "poduszki", "chodnik"], 
            desc: "Zanim wyjdziesz z psem na spacer na rozgrzany chodnik w słoneczny dzień, przyłóż wewnętrzną część swojej dłoni płasko do asfaltu i przytrzymaj przez 5 sekund. Jeśli podłoże parzy Ciebie, oznacza to, że poparzy również delikatne opuszki Twojego psa. W upały spaceruj wyłącznie rano, wieczorem lub po trawiastych terenach leśnych." 
        },
        { 
            id: "train_bingo", 
            title: "Przywołanie Awaryjne (Słowo Życia)", 
            keywords: ["ucieczka", "przywołanie", "bingo", "zagrożenie", "wróć", "wołąnie"], 
            desc: "Wybierz jedno unikalne, dźwięczne słowo, którego NIGDY nie używasz na co dzień (np. 'BINGO!', 'BANAN!'). Przez kilka tygodni ćwicz w domu: wypowiedz słowo i natychmiast daj psu najlepszy smakołyk na świecie (np. kawałek pieczonego mięsa). To słowo ma kojarzyć się z absolutnym rajem. Używaj lo w terenie TYLKO wtedy, gdy pies np. biegnie w stronę ulicy. Nigdy nie używaj go na darmo." 
        },
        { 
            id: "train_rule3", 
            title: "Reguła 3 Sekund (Głaskanie obcych psów)", 
            keywords: ["głaskanie", "dotyk", "obcy pies", "dzieci", "kontakt", "gryzie"], 
            desc: "Zanim dotkniesz jakiegokolwiek psa, zapytaj właściciela o zgodę. Jeśli ją uzyskasz, kucnij bokiem do psa (nigdy nie podchodź od przodu i nie pochylaj się nad nim – to gest groźby). Wyciągnij delikatnie dłoń do powąchania. Pogłaskaj psa przez dokładnie 3 sekundy pod brodą lub po klatce piersiowej (NIGDY po czubku głowy!), po czym cofnij rękę. Jeśli pies odejdzie – zostaw go. Jeśli podejdzie bliżej i trąci Cię noskiem – oznacza to, że chce więcej." 
        },
        { 
            id: "train_clicker", 
            title: "Trening Klikerowy (Zaznaczanie zachowań)", 
            keywords: ["kliker", "szkolenie", "nagroda", "smakołyk", "siad", "nauka"], 
            desc: "Kliker to małe urządzenie wydające powtarzalny dźwięk 'klik'. Najpierw 'warunkujemy' kliker: klikasz i natychmiast dajesz smakołyk (powtórz 20 razy). Dźwięk staje się dla psa obietnicą nagrody. Następnie podczas nauki np. komendy 'siad', klikasz DOKŁADNIE w milisekundzie, gdy pupa psa dotyka ziemi, i dajesz nagrodę. Kliker pozwala precyzyjnie wskazać psu, za które zachowanie dostaje wypłatę." 
        },
        { 
            id: "train_cage", 
            title: "Klatka Kennelowa (Bezpieczny azyl)", 
            keywords: ["klatka", "kennel", "lęk", "niszczenie", "samotność", "odpoczynek"], 
            desc: "Klatka kennelowa nie jest więzieniem – to sztuczna jaskinia i azyl dla psa. Proces wprowadzania klatki musi być powolny: wrzucaj tam najlepsze gryzaki, podawaj miski z jedzeniem, nigdy nie zamykaj drzwiczek na siłę. Pies ma sam wybierać spanie w kennelówce. Prawidłowo wprowadzona klatka drastycznie obniża poziom stresu u psów z lękiem separacyjnym i zapobiega niszczeniu mieszkania." 
        },
        { 
            id: "train_eye", 
            title: "Nauka Skupienia (Kontakt Wzrokowy)", 
            keywords: ["skupienie", "uwaga", "patrz", "kontakt", "smycz", "bodźce"], 
            desc: "Podstawa pracy z psem reaktywnym. Weź smakołyk do dłoni, zamknij ją w pięść i wyciągnij w bok. Pies będzie lizał i drapał rękę. Stój nieruchomo. W momencie, gdy pies sfrustrowany brakiem dostępu do jedzenia odwróci wzrok od dłoni i spojrzy Ci prosto w oczy – powiedz 'TAK' i daj mu nagrodę. Uczy to psa, że kluczem do wszystkiego jest kontakt wzrokowy z przewodnikiem, a nie fiksacja na bodźcu." 
        }
    ],
    sytuacje: [
        { 
            id: "sit_tick_remove", 
            title: "Jak bezpiecznie wyjąć kleszcza?", 
            keywords: ["kleszcz", "pasożyt", "kleszczołapki", "pęseta", "owad", "skóra", "wbity"], 
            desc: "Użyj specjalistycznych kleszczołapek, pętli lub dobrej pęsety. Rozsuń sierść, chwyć kleszcza tuż przy samej skórze psa, jak najbliżej jego aparatu gębowego. Zdecydowanym, płynnym ruchem pociągnij go pionowo w górę. NIE wykręcaj (możesz ukręcić odwłok), NIE smaruj kleszcza masłem, olejem, alkoholem ani lakierem do paznokci! (Kleszcz zacznie się dusić i wstrzyknie do krwiobiegu psa toksyny oraz patogeny boreliozy czy babeszjozy). Po wszystkim zdezynfekuj ranę i obserwuj psa przez 2 tygodnie pod kątem apatii czy ciemnego moczu." 
        },
        { 
            id: "sit_burdock", 
            title: "Rzepy i Osty w sierści – Szybkie usuwanie", 
            keywords: ["rzep", "osty", "kołtun", "sierść", "krzaki", "czesanie", "filc"], 
            desc: "Wyciąganie suchych rzepów na sucho sprawia psu ogromny ból i powoduje wyrywanie zdrowych włosów. Aby zrobić to bezstresowo, nałóż na splątany kołtun z rzepem odrobinę psiej odżywki bez spłukiwania, oliwki dla dzieci lub zwykłej oliwy z oliwek. Wmasuj tłuszcz w strukturę rzepu i odczekaj minutę. Powstały poślizg pozwoli Ci bez problemu rozplątać kołtun i wysunąć rzepy samymi palcami lub rzadkim grzebieniem." 
        },
        { 
            id: "sit_poison", 
            title: "⚠️ Podejrzenie Zatrucia (Trutka na szczury/Padlina)", 
            keywords: ["trucizna", "trutka", "padlina", "wymioty", "zjedzenie", "vet", "śmierć", "kości"], 
            desc: "Jeśli Twój pies zjadł trutkę, padlinę lub kiełbasę z gwoździami wrzuconą przez wandali, liczy się każda minuta. Masz maksymalnie 1 do 2 godzin na bezpieczne wywołanie wymiotów u lekarza weterynarii, zanim toksyny przenikną do krwiobiegu. NIE podawaj psu mleka (tłuszcz przyspiesza wchłanianie wielu trucizn!), NIE podawaj oleju. Pakuj psa do auta i jedź prosto do najbliższej całodobowej kliniki weterynaryjnej. Jeśli to możliwe, zabierz próbkę zjedzonej substancji lub jej opakowanie." 
        },
        { 
            id: "sit_wasp", 
            title: "Użądlenie przez osę lub pszczołę", 
            keywords: ["osa", "pszczoła", "użądlenie", "opuchlizna", "pysk", "język", "puchnie"], 
            desc: "Jeśli pies zostanie użądlony w łapę lub grzbiet, usuń żądło (jeśli to pszczoła) i przyłóż zimny kompres z wody i octu, by zmniejszyć pieczenie. Jeśli jednak użądlenie nastąpiło w okolicę pyska, gardła lub wewnątrz jamy ustnej (np. pies kłapał pyszczkiem za owadem) – natychmiast podaj psu lód do lizania i pędź do weterynarza. Opuchlina dróg oddechowych może doprowadzić do nagłego uduszenia psa. Monitoruj czy nie występuje wstrząs anafilaktyczny (blade dziąsła, wymioty, osłabienie)." 
        },
        { 
            id: "sit_heat", 
            title: "🥵 Udar Cieplny i Przegrzanie Organizmu", 
            keywords: ["udar", "ciepło", "lato", "słońce", "dyszenie", "mdleje", "gorączka", "woda"], 
            desc: "Objawy udaru to: potężne, niekontrolowane dyszenie, bardzo ciemnoczerwone lub sine dziąsła, gęsta ślina, wymioty i utrata stabilności na łapach. NIGDY nie wrzucaj przegrzanego psa do lodowatej wody i nie polewaj go lodem – wywołasz szok termiczny i zatrzymanie akcji serca! Przenieś psa w cień, owiń jego brzuch i pachwiny ręcznikami nasączonymi chłodną (ale nie lodowatą!) wodą. Zapewnij nawiew i natychmiast skonsultuj się z lekarzem." 
        },
        { 
            id: "sit_dog_fight", 
            title: "Atak i Walka dwóch psów – Jak rozdzielić?", 
            keywords: ["walka", "pogryzienie", "atak", "agresja", "rozdzielanie", "krew"], 
            desc: "NIGDY nie wkładaj rąk w okolice pyskasz gryzących się psów, nie łap za obroże – zostaniesz dotkliwie pogryziony przez tzw. agresję przekierowaną. Najbezpieczniejsza metoda to 'Taczka': dwie osoby podchodzą jednocześnie od tyłu psów, łapią je mocno za tylne nogi na wysokości pachwin i unoszą do góry, cofając się w tył po łuku. Pies traci równowagę i puszcza uścisk. Jeśli jesteś sam, spróbuj narzucić na głowy psów dużą kurtkę, koc lub wylej na nie potężną ilość wody, aby wywołać dezorientację." 
        }
    ], // 🔥 TU DODALIŚMY BRAKUJĄCY PRZECINEK!
    rasy: BREEDS_A_L
};
