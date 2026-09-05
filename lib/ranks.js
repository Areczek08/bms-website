export const COMPANY_RANKS = {
  EMPLOYEES: [
    "Praktykant",
    "Nowy Kierowca",
    "Początkujący Kierowca",
    "Kierowca",
    "Starszy Kierowca",
    "Doświadczony Kierowca",
    "Kierowca Emeryt"
  ],
  MANAGEMENT: [
    "Księgowy",
    "Osoba ds. Social Media",
    "Próbny rekrutant firmowy",
    "Rekrutant firmowy",
    "Opiekun ds. Marketingu"
  ],
  BOARD: [
    "Opiekun ds. Rekrutacji",
    "Technik ds. IT [miłek]",
    "Menadżer",
    "Przedstawiciel",
    "Prezes",
    "Właściciel"
  ]
};

export const getAllRanks = () => {
  return [
    ...COMPANY_RANKS.EMPLOYEES,
    ...COMPANY_RANKS.MANAGEMENT,
    ...COMPANY_RANKS.BOARD
  ];
};
