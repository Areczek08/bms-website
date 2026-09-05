const fs = require('fs');

const basicQuestions = [
  { text: "Czy dopuszczalna prędkość zespołu pojazdów na autostradzie wynosi 80 km/h?", answer: "Tak" },
  { text: "Czy w strefie zamieszkania dopuszczalna prędkość to 20 km/h?", answer: "Tak" },
  { text: "Czy wyprzedzanie na przejściu dla pieszych, na którym ruch nie jest kierowany, jest dozwolone?", answer: "Nie" },
  { text: "Czy wjazd na skrzyżowanie jest dozwolony, jeśli brakuje miejsca do jego opuszczenia?", answer: "Nie" },
  { text: "Czy używanie świateł mijania w dzień jest obowiązkowe w Polsce?", answer: "Tak" },
  { text: "Czy dopuszczalne jest holowanie pojazdu z przyczepą?", answer: "Nie" },
  { text: "Czy kierujący zespołem pojazdów może używać opon o różnej rzeźbie bieżnika na tej samej osi?", answer: "Nie" },
  { text: "Czy wolno zatrzymać pojazd ciężarowy w tunelu, jeśli nie ma awarii?", answer: "Nie" },
  { text: "Czy przewożąc ładunek sypki, musisz go zabezpieczyć plandeką?", answer: "Tak" },
  { text: "Czy tachograf musi być sprawdzany co najmniej raz na 2 lata?", answer: "Tak" },
  { text: "Czy kierowca musi mieć przy sobie kartę kierowcy podczas prowadzenia pojazdu z tachografem cyfrowym?", answer: "Tak" },
  { text: "Czy dzienny czas prowadzenia pojazdu może wynosić maksymalnie 9 godzin (z możliwością przedłużenia do 10h dwa razy w tyg)?", answer: "Tak" },
  { text: "Czy przerwa po 4.5h jazdy musi wynosić minimum 45 minut (może być podzielona na 15+30)?", answer: "Tak" },
  { text: "Czy regularny tygodniowy okres odpoczynku wynosi minimum 45 godzin?", answer: "Tak" },
  { text: "Czy w pojeździe ciężarowym musisz wozić gaśnicę?", answer: "Tak" },
  { text: "Czy odblaskowa kamizelka jest obowiązkowa przy wysiadaniu z pojazdu na autostradzie?", answer: "Tak" },
  { text: "Czy podczas jazdy można trzymać telefon w ręku?", answer: "Nie" },
  { text: "Czy musisz zapinać pasy bezpieczeństwa w pojeździe ciężarowym?", answer: "Tak" },
  { text: "Czy ładunek może zasłaniać światła pojazdu?", answer: "Nie" },
  { text: "Czy na drodze ekspresowej jednojezdniowej limit prędkości dla C+E to 80 km/h?", answer: "Tak" },
  { text: "Czy zielona strzałka warunkowego skrętu zwalnia z obowiązku zatrzymania się?", answer: "Nie" },
  { text: "Czy na skrzyżowaniu równorzędnym pierwszeństwo ma pojazd z lewej strony?", answer: "Nie" },
  { text: "Czy masz prawo wyprzedzać z prawej strony na dwujezdniowej autostradzie w Polsce?", answer: "Nie" },
  { text: "Czy kierujący pojazdem członowym ma prawo cofać na autostradzie lub drodze ekspresowej?", answer: "Nie" },
  { text: "Czy znak STOP wymaga bezwzględnego zatrzymania pojazdu?", answer: "Tak" },
  { text: "Czy w terenie zabudowanym dopuszczalna prędkość dla samochodów ciężarowych wynosi zawsze 50 km/h niezależnie od pory dnia?", answer: "Tak" },
  { text: "Czy zmęczenie kierowcy prowadzącego zestaw znacząco wydłuża czas jego reakcji na zagrożenie?", answer: "Tak" },
  { text: "Czy po zażyciu leków nasennych dopuszczalne jest prowadzenie pojazdu ciężarowego?", answer: "Nie" },
  { text: "Czy opony zimowe są w Polsce obowiązkowe dla pojazdów ciężarowych w okresie od 1 grudnia do 1 marca?", answer: "Nie" },
  { text: "Czy włączony sygnał dźwiękowy w terenie zabudowanym może być używany tylko w celu ostrzeżenia o bezpośrednim niebezpieczeństwie?", answer: "Tak" },
  { text: "Czy kierowca ma obowiązek ustąpić pierwszeństwa rowerzyście znajdującemu się na przejeździe dla rowerów?", answer: "Tak" },
  { text: "Czy dozwolone jest wyprzedzanie pojazdu uprzywilejowanego w obszarze zabudowanym?", answer: "Nie" },
  { text: "Czy widząc znak A-7 (ustąp pierwszeństwa), musisz zawsze zatrzymać się do zera?", answer: "Nie" },
  { text: "Czy kierowca ciężarówki powyżej 3,5t może zaparkować pojazd na chodniku?", answer: "Nie" },
  { text: "Czy w przypadku awarii tachografu cyfrowego, kierowca ma obowiązek prowadzić odręczne zapisy na wykresówkach lub wydrukach?", answer: "Tak" },
  { text: "Czy skrzyżowanie odwołuje zakaz wyprzedzania wyrażony znakiem B-25?", answer: "Tak" },
  { text: "Czy widząc migające żółte światło na sygnalizatorze masz bezwzględny obowiązek zatrzymania się?", answer: "Nie" },
  { text: "Czy trójkąt ostrzegawczy na drodze ekspresowej musi być ustawiony w odległości 100 m za pojazdem?", answer: "Tak" },
  { text: "Czy jazda 'na zderzaku' (bez zachowania bezpiecznej odległości) na autostradzie jest w Polsce wykroczeniem?", answer: "Tak" },
  { text: "Czy załadunek pojazdu może spowodować przekroczenie dopuszczalnego nacisku osi na jezdnię, jeśli całkowita masa nie przekracza DMC?", answer: "Nie" }
];

const specialistQuestions = [
  { text: "Z jaką maksymalną prędkością można prowadzić zespół pojazdów w obszarze zabudowanym?", options: ["A. 50 km/h", "B. 60 km/h", "C. 70 km/h"], answer: "A. 50 km/h" },
  { text: "Co musisz zrobić przed odczepieniem naczepy od ciągnika siodłowego?", options: ["A. Spuścić powietrze z opon", "B. Zaciągnąć hamulec postojowy i opuścić podpory naczepy", "C. Odłączyć przewody pneumatyczne przed zatrzymaniem ciągnika"], answer: "B. Zaciągnąć hamulec postojowy i opuścić podpory naczepy" },
  { text: "Jakie jest dopuszczalne stężenie alkoholu we krwi kierowcy w Polsce?", options: ["A. 0.0 promila", "B. Do 0.2 promila", "C. Do 0.5 promila"], answer: "B. Do 0.2 promila" },
  { text: "Ile czasu masz na wpis manualny na karcie kierowcy po jej włożeniu do tachografu?", options: ["A. Musisz to zrobić natychmiast", "B. Do końca dnia pracy", "C. Nie ma obowiązku wpisu manualnego"], answer: "A. Musisz to zrobić natychmiast" },
  { text: "Gdzie znajduje się środek ciężkości w prawidłowo załadowanej naczepie kurtynowej?", options: ["A. Jak najwyżej i z tyłu", "B. Jak najniżej i równomiernie wzdłuż osi", "C. Nad osiami ciągnika"], answer: "B. Jak najniżej i równomiernie wzdłuż osi" },
  { text: "W jakim celu stosuje się zwalniacz (retarder/intarder) w ciężarówkach?", options: ["A. Do awaryjnego hamowania", "B. Do odciążenia hamulców roboczych na zjazdach", "C. Do ruszania na śliskiej nawierzchni"], answer: "B. Do odciążenia hamulców roboczych na zjazdach" },
  { text: "W jaki sposób kierowca C+E powinien pokonywać ostre zakręty w prawo w mieście?", options: ["A. Ścinając zakręt", "B. Najeżdżając szerzej, aby tył naczepy nie wszedł na chodnik", "C. Tyłem naczepy celując w krawężnik"], answer: "B. Najeżdżając szerzej, aby tył naczepy nie wszedł na chodnik" },
  { text: "Co oznacza pomarańczowa, pusta tablica odblaskowa na pojeździe?", options: ["A. Przewóz odpadów", "B. Transport materiałów niebezpiecznych w sztukach przesyłki (ADR)", "C. Pojazd nienormatywny"], answer: "B. Transport materiałów niebezpiecznych w sztukach przesyłki (ADR)" },
  { text: "Co jest najczęstszą przyczyną wywrócenia zestawu z ładunkiem płynnym (cysterna)?", options: ["A. Falowanie cieczy i przesunięcie środka ciężkości w zakręcie", "B. Złe opony na osi napędowej", "C. Awaria sprężarki powietrza"], answer: "A. Falowanie cieczy i przesunięcie środka ciężkości w zakręcie" },
  { text: "Jak często należy kalibrować tachograf cyfrowy?", options: ["A. Co 12 miesięcy", "B. Co 24 miesiące", "C. Co 36 miesięcy"], answer: "B. Co 24 miesiące" },
  { text: "Znak zakazu wjazdu pojazdów ciężarowych (B-5) bez dodatkowych tabliczek dotyczy:", options: ["A. Ciągników siodłowych bez naczep", "B. Pojazdów o DMC powyżej 3.5t", "C. Pojazdów o DMC powyżej 12t"], answer: "B. Pojazdów o DMC powyżej 3.5t" },
  { text: "Kiedy kierowca musi odebrać regularny tygodniowy okres odpoczynku?", options: ["A. Najpóźniej po sześciu okresach 24-godzinnych", "B. W każdy piątek wieczorem", "C. Po przejechaniu 4500 km"], answer: "A. Najpóźniej po sześciu okresach 24-godzinnych" },
  { text: "Jaki jest standardowy czas jazdy ciągłej (bez przerwy) dozwolony przepisami?", options: ["A. 4 godziny", "B. 4 godziny i 30 minut", "C. 5 godzin"], answer: "B. 4 godziny i 30 minut" },
  { text: "Jakie działanie należy podjąć, jeśli ładunek wystaje poza obrys naczepy z tyłu na odległość 1 metra?", options: ["A. Nic, dopuszcza się do 2 metrów bez oznakowania", "B. Należy oznaczyć go czerwoną chorągiewką lub tablicą w pasy", "C. Nie wolno w ogóle przewozić takiego ładunku"], answer: "B. Należy oznaczyć go czerwoną chorągiewką lub tablicą w pasy" },
  { text: "Jaka jest maksymalna dopuszczalna długość zespołu pojazdów (ciągnik siodłowy + naczepa) w Polsce bez zezwoleń na pojazdy nienormatywne?", options: ["A. 16.50 m", "B. 18.75 m", "C. 25.25 m"], answer: "A. 16.50 m" },
  { text: "Który z układów zapobiega blokowaniu kół podczas ostrego hamowania?", options: ["A. ASR", "B. ESP", "C. ABS"], answer: "C. ABS" },
  { text: "Który układ elektroniczny poprawia stabilność toru jazdy zespołu pojazdów i chroni przed poślizgiem bocznym?", options: ["A. ESP", "B. ACC", "C. Retarder"], answer: "A. ESP" },
  { text: "W jakich warunkach można zastosować wydruk z tachografu cyfrowego zamiast poprawnego zapisu na karcie?", options: ["A. Gdy karta ulegnie uszkodzeniu lub kradzieży (max. 15 dni)", "B. Kiedy skończy się miejsce na karcie", "C. Kiedy kierowca zapomni pinu do karty"], answer: "A. Gdy karta ulegnie uszkodzeniu lub kradzieży (max. 15 dni)" },
  { text: "Jak sprawdzić luz na siodle ciągnika siodłowego?", options: ["A. Nasłuchując stuków przy ruszaniu i hamowaniu zespołem", "B. Patrząc z daleka na ustawienie naczepy", "C. Poprzez spuszczenie powietrza z opon naczepy"], answer: "A. Nasłuchując stuków przy ruszaniu i hamowaniu zespołem" },
  { text: "Jaka jest najbezpieczniejsza technika zjeżdżania ciężkim zestawem z długiego wzniesienia?", options: ["A. Jazda na biegu jałowym (tzw. luz) z wciśniętym hamulcem nożnym", "B. Zjazd na niskim biegu przy użyciu hamulca silnikowego / zwalniacza", "C. Użycie wyłącznie hamulca awaryjnego ręcznego"], answer: "B. Zjazd na niskim biegu przy użyciu hamulca silnikowego / zwalniacza" }
];

const medicalPool = [
  { text: "Czy zdarza Ci się ignorować sygnały zmęczenia organizmu i decydować na dalszą jazdę mimo senności?", answer: "Nigdy" },
  { text: "Jak często odczuwasz nagłą frustrację z powodu działań innych kierowców i masz ochotę 'wymierzyć sprawiedliwość'?", answer: "Nigdy" },
  { text: "Uważasz, że Twoje umiejętności za kierownicą pozwalają na bezpieczne ignorowanie niektórych ograniczeń prędkości w nocy?", answer: "Zdecydowanie nie" },
  { text: "Jeśli jesteś bardzo zmęczony, ale do bazy zostało tylko 50 km, co wybierasz:", options: ["A. Szukam miejsca na krótką drzemkę", "B. Piję trzecią kawę i przyspieszam", "C. Jadę na światłach awaryjnych", "D. Jadę dalej ryzykując"], answer: "A. Szukam miejsca na krótką drzemkę" },
  { text: "W teście aparatem krzyżowym Twoja reakcja na niespodziewany bodziec wynosi przeważnie:", options: ["A. > 1 sekunda", "B. 0.8 - 1 sekunda", "C. < 0.5 sekundy"], answer: "C. < 0.5 sekundy" },
  { text: "Czy potrafisz się wyłączyć na bodźce rozpraszające (np. telefon) podczas manewru cofania pod rampę?", answer: "Tak" },
  { text: "Jak reagujesz na niespodziewane wybuchy opon lub huki na drodze?", options: ["A. Zamykam oczy ze strachu", "B. Szarpię kierownicą", "C. Zachowuję spokój i analizuję", "D. Wciskam hamulec w podłogę bez patrzenia"], answer: "C. Zachowuję spokój i analizuję" },
  { text: "Gdy kierowca osobowówki celowo wciśnie hamulec przed Twoją maską (tzw. brake check):", options: ["A. Uderzam go by go nauczyć", "B. Rejestruję to na kamerce, zwalniam, zachowuję spokój", "C. Wyprzedzam go i robię to samo"], answer: "B. Rejestruję to na kamerce, zwalniam, zachowuję spokój" },
  { text: "Czy zdarza Ci się działać pod wpływem silnych emocji, których później żałujesz?", answer: "Nie" },
  { text: "Jak oceniasz swoją odporność na długotrwały stres związany z presją czasu dyspozytora?", options: ["A. Bardzo wysoka", "B. Przeciętna", "C. Niska, często wybucham"], answer: "A. Bardzo wysoka" },
  { text: "Jesteś świadkiem wypadku na drodze ekspresowej. Twoja pierwsza czynność to:", options: ["A. Nagranie filmiku", "B. Zabezpieczenie miejsca zdarzenia i wezwanie służb", "C. Ominięcie i odjechanie", "D. Panika"], answer: "B. Zabezpieczenie miejsca zdarzenia i wezwanie służb" },
  { text: "Masz poczucie, że koledzy z pracy stale knują przeciwko Tobie?", answer: "Nie" }
];

let generatedQuestions = [];
let id = 1;

basicQuestions.forEach(q => {
  generatedQuestions.push({
    id: id++,
    text: q.text,
    options: ["Tak", "Nie"],
    answer: q.answer,
    points: [1, 2, 3][Math.floor(Math.random() * 3)],
    type: "basic"
  });
});

specialistQuestions.forEach(q => {
  generatedQuestions.push({
    id: id++,
    text: q.text,
    options: q.options,
    answer: q.answer,
    points: [1, 2, 3][Math.floor(Math.random() * 3)],
    type: "specialist"
  });
});

let medGenerated = [];
medicalPool.forEach(q => {
  let opts = q.options ? q.options : ["Tak", "Nie", "Nigdy", "Zawsze"];
  medGenerated.push({
    id: id++,
    text: q.text,
    options: opts,
    answer: q.answer,
    points: 1
  });
});

const fileContent = `export const licenseQuestions = ${JSON.stringify(generatedQuestions, null, 2)};
export const medicalQuestions = ${JSON.stringify(medGenerated, null, 2)};
`;

fs.writeFileSync('app/api/exams/questions/questionsDB.js', fileContent);
console.log('Zbudowano unikalną bazę!');
