export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

  export function toSingular(word: string): string {
    if (!word) return "Item";

    const exceptions: Record<string, string> = {
      "alumni": "alumnus",
      "analyses": "analysis",
      "appendices": "appendix",
      "attributes": "attribute",
      "axes": "axis",
      "bacteria": "bacterium",
      "cacti": "cactus",
      "children": "child",
      "corpora": "corpus",
      "criteria": "criterion",
      "crises": "crisis",
      "data": "datum",
      "diagnoses": "diagnosis",
      "feet": "foot",
      "focuses": "focus",
      "fungi": "fungus",
      "hypotheses": "hypothesis",
      "indices": "index",
      "loci": "locus",
      "matrices": "matrix",
      "media": "medium",
      "nuclei": "nucleus",
      "oases": "oasis",
      "people": "person",
      "phenomena": "phenomenon",
      "radiuses": "radius",
      "responses": "response",
      "roles": "role",
      "series": "series",
      "species": "species",
      "stimuli": "stimulus",
      "strata": "stratum",
      "syllabi": "syllabus",
      "teeth": "tooth",
      "theses": "thesis",
      "vertices": "vertex",
    };

    if (exceptions[word]) {
      return exceptions[word];
    }

    // Handle common English plural patterns
    if (word.endsWith("ies")) {
      word = word.slice(0, -3) + "y";
    } else if (word.endsWith("es")) {
      word = word.slice(0, -2);
    } else if (word.endsWith("s") && word.length > 1) {
      word = word.slice(0, -1);
    }

    // Capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
