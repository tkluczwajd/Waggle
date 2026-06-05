// src/data/wikiData.js
import { BREEDS_A_L } from './breedsAL.js';
import { BREEDS_M_Z } from './breedsMZ.js';

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
            desc: `Użyj specjalistycznych kleszczołapek, pętli lub dobrej pęsety. Rozsuń sierść, chwyć kleszcza tuż przy samej skórze psa. Zdecydowanym, płynnym ruchem pociągnij go pionowo w górę.
                <div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE wykręcaj (możesz ukręcić odwłok).</div>
                <div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE smaruj kleszcza masłem, olejem, alkoholem ani lakierem do paznokci!</div>
                <div class="wiki-tip wiki-tip-success"><span>✅</span> Po wszystkim zdezynfekuj ranę i obserwuj psa przez 2 tygodnie.</div>`
        },
        { 
            id: "sit_burdock", 
            title: "Rzepy i Osty w sierści – Szybkie usuwanie", 
            keywords: ["rzep", "osty", "kołtun", "sierść", "krzaki", "czesanie", "filc"], 
            desc: "Wyciąganie suchych rzepów na sucho sprawia psu ogromny ból. Aby zrobić to bezstresowo, nałóż na splątany kołtun odrobinę psiej odżywki lub oliwki. Wmasuj tłuszcz w strukturę rzepu i odczekaj minutę. Powstały poślizg pozwoli Ci bez problemu rozplątać kołtun." 
        },
        { 
            id: "sit_poison", 
            title: "⚠️ Podejrzenie Zatrucia", 
            keywords: ["trucizna", "trutka", "padlina", "wymioty", "zjedzenie", "vet"], 
            desc: `Masz maksymalnie 1-2 godziny na reakcję.
                <div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE podawaj psu mleka (przyspiesza wchłanianie trucizn)!</div>
                <div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIE podawaj oleju.</div>
                <div class="wiki-tip wiki-tip-success"><span>✅</span> Jedź prosto do najbliższej całodobowej kliniki weterynaryjnej!</div>`
        },
        { 
            id: "sit_wasp", 
            title: "Użądlenie przez osę lub pszczołę", 
            keywords: ["osa", "pszczoła", "użądlenie", "opuchlizna", "pysk"], 
            desc: `
                <div class="wiki-tip wiki-tip-success"><span>✅</span> Jeśli użądlenie jest w łapę lub grzbiet, przyłóż zimny kompres z wodą i octem.</div>
                <div class="wiki-tip wiki-tip-warning"><span>⚠️</span> Jeśli użądlenie nastąpiło w okolicę pyska lub gardła – natychmiast pędź do weterynarza! Opuchlizna grozi uduszeniem.</div>`
        },
        { 
            id: "sit_heat", 
            title: "🥵 Udar Cieplny", 
            keywords: ["udar", "ciepło", "lato", "słońce", "dyszenie", "mdleje"], 
            desc: `
                <div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIGDY nie wrzucaj przegrzanego psa do lodowatej wody i nie polewaj lodem! Wywołasz szok termiczny.</div>
                <div class="wiki-tip wiki-tip-success"><span>✅</span> Przenieś psa w cień, owiń brzuch i pachwiny ręcznikami nasączonymi chłodną (nie lodowatą!) wodą. Zapewnij nawiew.</div>`
        },
        { 
            id: "sit_dog_fight", 
            title: "Atak i Walka psów", 
            keywords: ["walka", "pogryzienie", "atak", "agresja", "rozdzielanie"], 
            desc: `
                <div class="wiki-tip wiki-tip-warning"><span>⚠️</span> NIGDY nie wkładaj rąk w okolice pysków – zostaniesz pogryziony.</div>
                <div class="wiki-tip wiki-tip-success"><span>✅</span> Metoda 'Taczka': łap psy za tylne nogi w pachwinach i unoś do góry, cofając się po łuku.</div>`
        }
    ],
    rasy: [...BREEDS_A_L, ...BREEDS_M_Z]
};
