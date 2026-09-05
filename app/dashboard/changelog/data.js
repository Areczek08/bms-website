export const changelogData = [
  {
    version: "v4.0.0",
    date: "2026-07-28",
    title: "BMS 4.0 - Wielka Modernizacja Pulpitu i Zarządzania Flotą",
    description: "Ogromny kamień milowy w rozwoju platformy BMS: Wdrożenie nowoczesnego pulpitu kierowcy, dwukierunkowego systemu kart paliwowych, rozbudowa profili kadrowych, dedykowana sekcja Scanii S450, aplikacja mobilna na Androida oraz gruntowna optymalizacja bazy danych i stabilności.",
    changes: [
      { type: "feature", text: "Dodano dwukierunkowy system przydziału kart paliwowych (dostępny zarówno w profilu kierowcy, jak i w module kart paliwowych)." },
      { type: "feature", text: "Rozbudowano profil kierowcy o datę urodzenia, typ umowy, przydzieloną naczepę oraz kilometry/dostawy zrealizowane poza systemem." },
      { type: "feature", text: "Wdrożono automatyczny system powiadomień i życzeń w dniu urodzin kierowcy na głównym pulpicie." },
      { type: "update", text: "Zmieniono działanie przycisków szybkich akcji 'Zatankuj' i 'Umyj ciężarówkę' na bezpośrednie przekierowania." },
      { type: "update", text: "Dodano podgląd aktywnych kart paliwowych bezpośrednio w profilu każdego kierowcy." },
      { type: "feature", text: "Dodano nową dedykowaną stronę dla Scanii S450 z możliwością pobierania modyfikacji dla zalogowanych kierowców." },
      { type: "update", text: "Odświeżono wygląd paneli logowania, rejestracji oraz odzyskiwania hasła na bardziej nowoczesny i przejrzysty." },
      { type: "update", text: "Uproszczono profile i listę kierowców, usuwając zbędne statystyki i systemy ocen." },
      { type: "feature", text: "Uruchomiono aplikację mobilną oraz instalator na telefony z systemem Android dla wygody w trasie." },
      { type: "feature", text: "Dodano nowe statystyki finansowe z podziałem na bazy transportowe." },
      { type: "feature", text: "Dodano możliwość ręcznego sortowania i numeracji na liście kierowców." },
      { type: "feature", text: "Wprowadzono wskaźnik statusu online dla kierowców korzystających z panelu." },
      { type: "update", text: "Wyłączono uciążliwe powiadomienia i zdarzenia dotyczące awarii pojazdów w trasie." },
      { type: "fix", text: "Usprawniono system odzyskiwania i resetowania hasła, w tym poprawiono wysyłkę wiadomości e-mail z instrukcjami." },
      { type: "fix", text: "Poprawiono importowanie tras z zewnętrznych aplikacji, aby dane o kilometrach i paliwie były dokładniejsze." },
      { type: "fix", text: "Usprawniono system przelewów między kierowcami – saldo konta aktualizuje się teraz natychmiast po wysłaniu przelewu." },
      { type: "fix", text: "Naprawiono błąd przy usuwaniu kont kierowców, zachowując przy tym historię ich zleceń w statystykach firmy." }
    ]
  },
  {
    version: "v2.8",
    date: "2026-05-30",
    title: "Nowy System Egzaminacyjny",
    description: "Zupełnie nowa, realistyczna mechanika wyrabiania dokumentów kierowcy.",
    changes: [
      { type: "feature", text: "Dodano system egzaminów teoretycznych na kategorię C+E." },
      { type: "feature", text: "Zaktualizowano bazę pytań o nowe przepisy drogowe." },
      { type: "feature", text: "Wprowadzono automatyczne opłaty z wirtualnego konta za egzaminy oraz badania." }
    ]
  },
  {
    version: "v2.7",
    date: "2026-05-30",
    title: "Synchronizacja Bezpieczeństwa",
    description: "Ważne poprawki techniczne dotyczące logowania i wizerunku firmy.",
    changes: [
      { type: "fix", text: "Zwiększono bezpieczeństwo logowania i sesji użytkownika." },
      { type: "update", text: "Wdrożono ładniejsze powiadomienia e-mail przy rejestracji i odzyskiwaniu hasła." }
    ]
  },
  {
    version: "v2.6",
    date: "2026-05-25",
    title: "Moduł Finansowania - Leasingi",
    description: "Wdrożenie możliwości rozkładania zakupów firmowych na raty.",
    changes: [
      { type: "feature", text: "Dodano panel zarządzania leasingami ciężarówek." },
      { type: "fix", text: "Usprawniono rozliczanie rat leasingowych z konta firmowego." },
      { type: "update", text: "Ulepszono podgląd miesięcznych finansów firmy." }
    ]
  },
  {
    version: "v2.5",
    date: "2026-05-25",
    title: "Centrum Rozrywki",
    description: "Rozszerzenie panelu BMS o system wirtualnego kasyna i kredytów.",
    changes: [
      { type: "feature", text: "Dodano wirtualne kasyno (ruletka, automaty) dla rozrywki." },
      { type: "feature", text: "Uruchomiono system wirtualnych pożyczek bankowych." }
    ]
  },
  {
    version: "v2.4",
    date: "2026-05-20",
    title: "Kartoteka Paliwowa",
    description: "Dodanie cyfrowych kart paliwowych i ewidencji spalania.",
    changes: [
      { type: "feature", text: "Dodano obsługę kart paliwowych dla kierowców." },
      { type: "feature", text: "Wprowadzono dziennik tankowań pozwalający kontrolować zużycie paliwa." }
    ]
  },
  {
    version: "v2.3",
    date: "2026-05-15",
    title: "Komunikacja i Raportowanie",
    description: "Dodanie funkcji czatu na żywo oraz ulepszenie tablicy informacyjnej.",
    changes: [
      { type: "feature", text: "Uruchomiono firmowy czat z możliwością przesyłania obrazków." },
      { type: "feature", text: "Dodano reakcje emoji na czacie." },
      { type: "feature", text: "Dodano moduł zgłaszania błędów systemowych bezpośrednio do zarządu." }
    ]
  },
  {
    version: "v2.1",
    date: "2026-05-10",
    title: "Rozbudowa Operacyjna Pojazdów",
    description: "Dodanie historii serwisowej oraz podczepiania naczep.",
    changes: [
      { type: "feature", text: "Dodano bazę naczep." },
      { type: "feature", text: "Umożliwiono przypisywanie naczep do ciężarówek." },
      { type: "feature", text: "Wdrożono historię serwisową i przeglądy pojazdów." }
    ]
  },
  {
    version: "v2.0",
    date: "2026-05-01",
    title: "Wielkie Otwarcie - Bojar Manager System 2.0",
    description: "Ogromny kamień milowy. Zbudowanie systemu od podstaw w nowoczesnej technologii.",
    changes: [
      { type: "feature", text: "Przebudowano system na nową, szybszą platformę." },
      { type: "feature", text: "Wdrożono nowy pulpit główny ze statystykami." },
      { type: "feature", text: "Dodano moduł rozliczania tras oraz statystyki ekonomicznej jazdy." },
      { type: "feature", text: "Wprowadzono zarządzanie flotą pojazdów i przypisywanie ich do kierowców." },
      { type: "feature", text: "Uruchomiono system wirtualnych finansów i przelewów." }
    ]
  }
];
