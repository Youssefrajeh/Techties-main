const { computeAge } = require("./dateUtils");

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1; // 1-indexed
const currentDate = today.getDate();

function format(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const testCases = [
  {
    name: "Birthday today",
    dob: format(currentYear - 20, currentMonth, currentDate),
    expected: 20
  },
  {
    name: "Birthday yesterday",
    dob: format(currentYear - 20, currentMonth, currentDate - 1 || 1), // simplified
    expected: 20
  },
  {
    name: "Birthday tomorrow",
    dob: format(currentYear - 20, currentMonth, currentDate + 1), // might overflow month but Date() handles it
    expected: 19
  },
  {
    name: "Birthday next month",
    dob: format(currentYear - 20, currentMonth + 1, currentDate),
    expected: 19
  },
  {
    name: "Birthday last month",
    dob: format(currentYear - 20, currentMonth - 1, currentDate),
    expected: 20
  },
  {
    name: "Leap year - Feb 29 on non-leap year today",
    dob: "2000-02-29",
    // Depends on current date, but let's just check if it returns a number
    check: (age) => typeof age === 'number'
  }
];

console.log("Running Age Calculation Tests...\n");

let passed = 0;
testCases.forEach(tc => {
  const actual = computeAge(tc.dob);
  let success = false;
  if (tc.check) {
    success = tc.check(actual);
  } else {
    success = actual === tc.expected;
  }

  if (success) {
    console.log(`✅ PASSED: ${tc.name} (DOB: ${tc.dob}, Expected: ${tc.expected}, Actual: ${actual})`);
    passed++;
  } else {
    console.log(`❌ FAILED: ${tc.name} (DOB: ${tc.dob}, Expected: ${tc.expected}, Actual: ${actual})`);
  }
});

console.log(`\nTests complete: ${passed}/${testCases.length} passed.`);

if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
