let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  const searchWord = word.toLowerCase();

  return notes.filter(note =>
    note.text.toLowerCase().includes(searchWord)
  );
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }

  return longest;
}

function countByCategory() {
  const counts = {};

  for (const note of notes) {
    if (!counts[note.category]) {
      counts[note.category] = 0;
    }

    counts[note.category]++;
  }

  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";

  return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0}.`;
}

function isDuplicate(text) {
  const normalizedText = text.trim().toLowerCase();

  return notes.some(note =>
    note.text.trim().toLowerCase() === normalizedText
  );
}

function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];
  const trimmedText = text.trim();

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log("Note was not added: text must be 1–200 characters.");
    return false;
  }

  if (isDuplicate(trimmedText)) {
    console.log("Note was not added: duplicate note.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("Note was not added: invalid category.");
    return false;
  }

  const newId = notes.length > 0
    ? Math.max(...notes.map(note => note.id)) + 1
    : 1;

  notes.push({
    id: newId,
    text: trimmedText,
    category: category
  });

  return true;
}


// Test searchNotes
console.log(searchNotes("DAY 3")); 
// Expected: [{ id: 2, text: "Finish the Day 3 assignment", category: "study" }]

console.log(searchNotes("pizza")); 
// Expected: []


// Test longestNote
console.log(longestNote()); 
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

const savedNotesForLongestTest = notes;
notes = [];

console.log(longestNote()); 
// Expected: null

notes = savedNotesForLongestTest;


// Test countByCategory
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

const savedNotesForCategoryTest = notes;
notes = [];

console.log(countByCategory());
// Expected: {}

notes = savedNotesForCategoryTest;


// Test getSummary
console.log(getSummary()); 
// Expected: "5 notes: 2 personal, 1 work, 2 study."

const savedNotesForSummaryTest = notes;
notes = [];

console.log(getSummary()); 
// Expected: "0 notes: 0 personal, 0 work, 0 study."

notes = savedNotesForSummaryTest;


// Test isDuplicate
console.log(isDuplicate("  BUY MILK AND BREAD  ")); 
// Expected: true

console.log(isDuplicate("Buy coffee")); 
// Expected: false


// Test addNote
console.log(addNote("Plan weekend trip", "personal")); 
// Expected: true

console.log(addNote("  Buy milk and bread  ", "personal")); 
// Expected: false (duplicate)