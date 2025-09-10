// Translation dictionary for problem categories
// Prioritizes English as the primary language

export interface ProblemTranslation {
  english: string;
  hindi: string;
  marathi: string;
  category: string;
}

export const PROBLEM_TRANSLATIONS: ProblemTranslation[] = [
  {
    english: "Water Supply",
    hindi: "जल",
    marathi: "जलपुरवठा",
    category: "water",
  },
  {
    english: "Solid Waste Mgmt",
    hindi: "अपशिष्ट प्रबंधन",
    marathi: "घनकचरा व्यवस्थापन",
    category: "waste",
  },
  {
    english: "Building Permission",
    hindi: "भवन अनुमति",
    marathi: "बांधकाम परवानगी",
    category: "building",
  },
  {
    english: "Electricity",
    hindi: "विद्युत",
    marathi: "वीजपुरवठा",
    category: "electricity",
  },
  {
    english: "Property Tax",
    hindi: "संपत्ति कर",
    marathi: "मालमत्ता कर",
    category: "tax",
  },
  {
    english: "Police",
    hindi: "पुलिस",
    marathi: "पोलीस",
    category: "police",
  },
  {
    english: "Revenue",
    hindi: "राजस्व",
    marathi: "महसूल",
    category: "revenue",
  },
  {
    english: "City Survey Officer",
    hindi: "नगर सर्वेक्षण",
    marathi: "शहर सर्वेक्षण",
    category: "survey",
  },
  {
    english: "Stamp & Registration",
    hindi: "स्टांप व निबंधन",
    marathi: "मुद्रांक व नोंदणी",
    category: "registration",
  },
  {
    english: "Slum Rehabilitation",
    hindi: "झुग्गी पुनर्वास",
    marathi: "झोपडपट्टी पुनर्वसन",
    category: "rehabilitation",
  },
  {
    english: "MSEDCL /Mahavitran",
    hindi: "महावितरण",
    marathi: "महावितरण",
    category: "electricity",
  },
  {
    english: "Co-op Societies",
    hindi: "सहकारिता",
    marathi: "सहकार",
    category: "cooperative",
  },
  {
    english: "Health",
    hindi: "स्वाथ्य",
    marathi: "आरोग्य",
    category: "health",
  },
  {
    english: "PMRDA",
    hindi: "PMRDA",
    marathi: "पीएमआरडीए",
    category: "pmrda",
  },
  {
    english: "Dy. Charity Comm.",
    hindi: "दान",
    marathi: "धर्मादाय उपआयुक्त",
    category: "charity",
  },
  {
    english: "RTO/Transport",
    hindi: "परिवहन",
    marathi: "आरटीओ/परिवहन",
    category: "transport",
  },
  {
    english: "PMPL",
    hindi: "PMPL",
    marathi: "पीएमपीएमएल",
    category: "pmpl",
  },
  {
    english: "Social Welfare",
    hindi: "समाज कल्याण",
    marathi: "सामाजिक न्याय",
    category: "welfare",
  },
  {
    english: "MHADA",
    hindi: "MHADA",
    marathi: "म्हाडा",
    category: "mhada",
  },
  // Additional terms that might appear in the database
  {
    english: "Land Encroachment",
    hindi: "भूमि अतिक्रमण",
    marathi: "भूमी अतिक्रमण",
    category: "land",
  },
  {
    english: "Roads and Traffic",
    hindi: "सड़क व ट्रैफिक",
    marathi: "रस्ते व वाहतूक",
    category: "transport",
  },
  {
    english: "Waste & Cleanliness",
    hindi: "कचरा व स्वच्छता",
    marathi: "घनकचरा व स्वच्छता",
    category: "waste",
  },
];

// Function to get English version of a problem from any language
export function getEnglishProblem(problemText: string): string {
  if (!problemText) return problemText;

  const cleanText = problemText.trim();

  // First, try to find exact match
  const exactMatch = PROBLEM_TRANSLATIONS.find(
    (translation) =>
      translation.english.toLowerCase() === cleanText.toLowerCase() ||
      translation.hindi === cleanText ||
      translation.marathi === cleanText
  );

  if (exactMatch) {
    return exactMatch.english;
  }

  // Try case-insensitive exact match
  const caseInsensitiveMatch = PROBLEM_TRANSLATIONS.find(
    (translation) =>
      translation.english.toLowerCase() === cleanText.toLowerCase() ||
      translation.hindi.toLowerCase() === cleanText.toLowerCase() ||
      translation.marathi.toLowerCase() === cleanText.toLowerCase()
  );

  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch.english;
  }

  // Try partial matching (text contains translation)
  const partialMatch = PROBLEM_TRANSLATIONS.find(
    (translation) =>
      cleanText.toLowerCase().includes(translation.english.toLowerCase()) ||
      translation.hindi.toLowerCase().includes(cleanText.toLowerCase()) ||
      translation.marathi.toLowerCase().includes(cleanText.toLowerCase()) ||
      cleanText.toLowerCase().includes(translation.hindi.toLowerCase()) ||
      cleanText.toLowerCase().includes(translation.marathi.toLowerCase())
  );

  if (partialMatch) {
    return partialMatch.english;
  }

  // Try reverse partial matching (translation contains text)
  const reversePartialMatch = PROBLEM_TRANSLATIONS.find(
    (translation) =>
      translation.english.toLowerCase().includes(cleanText.toLowerCase()) ||
      translation.hindi.toLowerCase().includes(cleanText.toLowerCase()) ||
      translation.marathi.toLowerCase().includes(cleanText.toLowerCase())
  );

  if (reversePartialMatch) {
    return reversePartialMatch.english;
  }

  // Try word-by-word matching for Hindi/Marathi text
  if (/[\u0900-\u097F]/.test(cleanText)) {
    const words = cleanText.split(/\s+/);
    for (const word of words) {
      const wordMatch = PROBLEM_TRANSLATIONS.find(
        (translation) =>
          translation.hindi.includes(word) ||
          translation.marathi.includes(word) ||
          word.includes(translation.hindi) ||
          word.includes(translation.marathi)
      );
      if (wordMatch) {
        return wordMatch.english;
      }
    }
  }

  // If no match found, return original text
  return problemText;
}

// Function to get all English problems for dropdown/selection
export function getEnglishProblems(): string[] {
  return PROBLEM_TRANSLATIONS.map((translation) => translation.english);
}

// Function to get problem by category
export function getProblemByCategory(
  category: string
): ProblemTranslation | undefined {
  return PROBLEM_TRANSLATIONS.find(
    (translation) => translation.category === category
  );
}

// Function to get all categories
export function getAllCategories(): string[] {
  return PROBLEM_TRANSLATIONS.map((translation) => translation.category);
}

// Function to normalize problem text for database storage
export function normalizeProblemForStorage(problemText: string): string {
  return getEnglishProblem(problemText);
}

// Function to get translation for display (if needed)
export function getProblemTranslation(
  englishProblem: string,
  language: "english" | "hindi" | "marathi"
): string {
  const translation = PROBLEM_TRANSLATIONS.find(
    (t) => t.english === englishProblem
  );
  if (!translation) return englishProblem;

  switch (language) {
    case "hindi":
      return translation.hindi;
    case "marathi":
      return translation.marathi;
    default:
      return translation.english;
  }
}
