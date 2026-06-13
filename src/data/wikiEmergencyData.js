// data/wikiEmergencyData.js

export const EMERGENCY_ARTICLES = [
    { 
        id: "sos_udar", 
        title: "🥵 Przegrzanie i Udar Cieplny", 
        category: "Zagrożenia życia",
        difficulty: "Krytyczne 🔴",
        readTime: "1 min",
        keywords: ["udar", "ciepło", "lato", "słońce", "dyszenie", "mdleje"], 
        related: ["train_asphalt"],
        desc: `
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">🔴 OBJAWY</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Intensywne, głośne ziajanie i ślinotok</li>
                <li>Ciemnoczerwone lub fioletowe dziąsła i język</li>
                <li>Zataczanie się, dezorientacja, brak reakcji</li>
            </ul>
            
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🟡 ZRÓB TERAZ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Przenieś psa do chłodnego miejsca lub cienia.</li>
                <li>Przykładaj <b>chłodne (nie lodowate!)</b>, mokre ręczniki na brzuch, pachwiny i pachy.</li>
                <li>Zapewnij przewiew (wiatrak, wachlowanie).</li>
            </ul>
            
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ NIE RÓB</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nigdy nie wrzucaj psa do lodowatej wody (ryzyko śmiertelnego szoku termicznego!).</li>
                <li>Nie polewaj psa lodem.</li>
            </ul>
            
            <h4 style="color: var(--primary); margin-bottom: 5px; font-weight: 900;">📞 WETERYNARZ</h4>
            <p style="margin-top: 5px; font-size: 14px; font-weight: bold; color: var(--text-color);">Natychmiast po wstępnym schłodzeniu. Udar niszczy organy wewnętrzne.</p>
        ` 
    },
    {
        id: "sos_czekolada",
        title: "Zatrucie czekoladą / ksylitolem",
        category: "Zatrucia",
        difficulty: "Krytyczne 🔴",
        readTime: "1 min",
        keywords: ["czekolada", "kakao", "zatrucie", "ksylitol", "cukier"],
        related: ["sos_wymioty", "sit_poison"],
        desc: `
            <div style="background: rgba(46, 213, 115, 0.1); border-left: 4px solid #2ed573; padding: 15px; border-radius: 0 12px 12px 0; margin-bottom: 20px;">
                <b style="color: #2ed573; font-size: 14px;">ZŁOTA ZASADA 2 GODZIN</b>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-color);">Jeśli przyłapałeś psa na jedzeniu i minęły mniej niż 2 godziny, toksyny nie zdążyły wchłonąć się z żołądka do krwiobiegu. Masz szansę uratować mu życie poprzez wywołanie wymiotów u weterynarza.</p>
            </div>

            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">🔴 OBJAWY ZATRUCIA</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Wymioty i biegunka</li>
                <li>Nadmierne pragnienie, pobudzenie lub dreszcze</li>
                <li>Przyspieszone bicie serca, drgawki (często po ksylitolu)</li>
            </ul>
            
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🟡 ZRÓB TERAZ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Oszacuj, ile gramów produktu zjadł pies. Zachowaj opakowanie!</li>
                <li>Zadzwoń do weterynarza podając wagę psa i zjedzoną ilość.</li>
            </ul>
            
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ NIE RÓB</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nie wywołuj wymiotów samodzielnie domowymi sposobami (woda utleniona, sól), chyba że weterynarz instruuje Cię telefonicznie.</li>
            </ul>
        `
    },
    { 
        id: "sit_tick_remove", 
        title: "Jak bezpiecznie wyjąć kleszcza?", 
        category: "Pasożyty i Owady",
        difficulty: "Podstawowy 🟢",
        readTime: "1 min",
        keywords: ["kleszcz", "pasożyt", "kleszczołapki", "pęseta", "owad", "skóra", "wbity"], 
        related: [],
        desc: `
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">🟡 ZRÓB TERAZ</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Rozsuń sierść, użyj specjalistycznych kleszczołapek (haczyków) lub dobrej pęsety.</li>
                <li>Chwyć kleszcza <b>tuż przy samej skórze</b> psa (za główkę).</li>
                <li>Zdecydowanym, powolnym i płynnym ruchem pociągnij go prosto w górę (pęseta) lub wykręć (haczyki).</li>
                <li>Po wszystkim zdezynfekuj ranę i obserwuj zachowanie psa przez 2 tygodnie.</li>
            </ul>
            
            <h4 style="color: var(--danger); margin-bottom: 5px; font-weight: 900;">❌ NIE RÓB</h4>
            <ul style="margin-top: 5px; padding-left: 20px; color: var(--text-color); font-size: 14px; line-height: 1.6;">
                <li>Nie wykręcaj kleszcza pęsetą (urwiesz odwłok, a głowa zostanie w skórze).</li>
                <li>Nigdy nie smaruj kleszcza masłem, olejem, alkoholem! Duszący się kleszcz wymiotuje treścią żołądkową do krwi psa, błyskawicznie zarażając go babeszjozą.</li>
            </ul>
        ` 
    },
    { 
        id: "sit_dog_fight", 
        title: "Atak i Walka psów", 
        category: "Behawior",
        difficulty: "Krytyczne 🔴",
        readTime: "1 min",
        keywords: ["walka", "pogryzienie", "atak", "agresja", "rozdzielanie"], 
        related: [],
        desc: `
            <h4 style="color: #e1b12c; margin-bottom: 5px; font-weight: 900;">
