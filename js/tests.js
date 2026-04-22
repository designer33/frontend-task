/**
 * @fileoverview Unit Tests for ContactListComponent utilities.
 *
 * This is an in-browser test runner — no external test framework required.
 * Tests are executed automatically on page load and results appear in the
 * browser DevTools console under the "Tests" group.
 *
 * In a full Angular implementation, these would be Jasmine/Jest specs run via
 * `ng test` with Karma or Jest, using TestBed for component isolation.
 * E2E tests (Protractor/Cypress/Playwright) are intentionally excluded per spec.
 *
 * SIMPLIFIED: Only utility-level unit tests are provided here. A production
 * suite would also include:
 *   - ContactListComponent render() tests (using DOM mocks)
 *   - ContactDetailsComponent render() tests
 *   - ContactApiService tests (using fetch mocks / jest.spyOn)
 *   - Integration tests for user interactions (click, search, pagination)
 */

/**
 * Micro test runner — mimics Jest/Jasmine describe/it/expect API
 * without any external dependencies.
 */
const TestRunner = (() => {
  let passed = 0;
  let failed = 0;
  const results = [];

  function describe(suiteName, fn) {
    console.group(`📋 ${suiteName}`);
    fn();
    console.groupEnd();
  }

  function it(testName, fn) {
    try {
      fn();
      console.log(`  ✅ ${testName}`);
      passed++;
      results.push({ name: testName, status: 'PASS' });
    } catch (err) {
      console.error(`  ❌ ${testName}: ${err.message}`);
      failed++;
      results.push({ name: testName, status: 'FAIL', error: err.message });
    }
  }

  function expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      },
      toEqual(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected))
          throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      },
      toContain(item) {
        if (!actual.includes(item)) throw new Error(`Expected "${actual}" to contain "${item}"`);
      },
      toHaveLength(len) {
        if (actual.length !== len) throw new Error(`Expected length ${len}, got ${actual.length}`);
      },
      toBeTruthy() {
        if (!actual) throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
      },
      toBeFalsy() {
        if (actual) throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
      },
      toBeGreaterThan(n) {
        if (actual <= n) throw new Error(`Expected ${actual} > ${n}`);
      },
    };
  }

  function summary() {
    const total = passed + failed;
    const icon  = failed === 0 ? '🎉' : '⚠️';
    console.log(`\n${icon} Tests: ${passed}/${total} passed${failed > 0 ? `, ${failed} FAILED` : ''}`);
  }

  return { describe, it, expect, summary };
})();

/**
 * Main test suite — called from app.js after the app bootstraps.
 * Receives exported symbols to test without needing module imports.
 *
 * @param {typeof ContactListComponent} ContactListComponent
 * @param {Function} getInitials
 * @param {Function} escHtml
 */
function runTests(ContactListComponent, getInitials, escHtml) {
  console.group('🧪 Contact Management – Unit Tests');

  // ---------------------------------------------------------------------------
  // getInitials()
  // ---------------------------------------------------------------------------
  TestRunner.describe('getInitials()', () => {
    TestRunner.it('returns uppercase initials from first and last name', () => {
      TestRunner.expect(getInitials('Johanna', 'Stevens')).toBe('JS');
    });

    TestRunner.it('handles single-word name gracefully', () => {
      TestRunner.expect(getInitials('Alice', '')).toBe('A');
    });

    TestRunner.it('handles empty strings', () => {
      TestRunner.expect(getInitials('', '')).toBe('');
    });

    TestRunner.it('extracts first character of each name', () => {
      TestRunner.expect(getInitials('Brian', 'Watson')).toBe('BW');
    });
  });

  // ---------------------------------------------------------------------------
  // escHtml()
  // ---------------------------------------------------------------------------
  TestRunner.describe('escHtml()', () => {
    TestRunner.it('escapes < and > characters', () => {
      const result = escHtml('<script>alert("xss")</script>');
      TestRunner.expect(result).toContain('&lt;script&gt;');
    });

    TestRunner.it('escapes & character', () => {
      TestRunner.expect(escHtml('Tom & Jerry')).toContain('&amp;');
    });

    TestRunner.it('escapes double quotes', () => {
      TestRunner.expect(escHtml('"hello"')).toContain('&quot;');
    });

    TestRunner.it('returns empty string for null/undefined', () => {
      TestRunner.expect(escHtml(null)).toBe('');
      TestRunner.expect(escHtml(undefined)).toBe('');
    });

    TestRunner.it('returns plain string unchanged if no special chars', () => {
      TestRunner.expect(escHtml('Hello World')).toBe('Hello World');
    });
  });

  // ---------------------------------------------------------------------------
  // ContactListComponent.filter()
  // ---------------------------------------------------------------------------
  TestRunner.describe('ContactListComponent.filter()', () => {
    // Create a minimal DOM container for the component
    const container = document.createElement('div');
    // Patch _updateCount and _updatePaginationButtons to avoid real DOM lookups
    const mockOnSelect = () => {};
    const comp = new ContactListComponent(container, mockOnSelect);
    comp._updateCount = () => {};
    comp._updatePaginationButtons = () => {};

    const sampleContacts = [
      { id: '1', firstName: 'Johanna', lastName: 'Stevens', jobTitle: 'PM', avatar: null, phone: ['111-111'], status: 'online' },
      { id: '2', firstName: 'Nicholas', lastName: 'Gordon', jobTitle: 'Dev', avatar: null, phone: ['222-222'], status: 'online' },
      { id: '3', firstName: 'Bradley', lastName: 'Malone', jobTitle: 'Sales', avatar: null, phone: ['333-333'], status: 'away' },
    ];
    comp.setContacts(sampleContacts);

    TestRunner.it('shows all contacts when query is empty', () => {
      comp.filter('');
      TestRunner.expect(comp.filteredContacts).toHaveLength(3);
    });

    TestRunner.it('filters by first name (case-insensitive)', () => {
      comp.filter('johanna');
      TestRunner.expect(comp.filteredContacts).toHaveLength(1);
      TestRunner.expect(comp.filteredContacts[0].firstName).toBe('Johanna');
    });

    TestRunner.it('filters by last name (case-insensitive)', () => {
      comp.filter('MALONE');
      TestRunner.expect(comp.filteredContacts).toHaveLength(1);
      TestRunner.expect(comp.filteredContacts[0].lastName).toBe('Malone');
    });

    TestRunner.it('filters by partial name match', () => {
      comp.filter('gor');
      TestRunner.expect(comp.filteredContacts).toHaveLength(1);
    });

    TestRunner.it('returns empty array for no match', () => {
      comp.filter('zzznomatch');
      TestRunner.expect(comp.filteredContacts).toHaveLength(0);
    });

    TestRunner.it('resets to page 0 after filtering', () => {
      comp.currentPage = 2;
      comp.filter('johanna');
      TestRunner.expect(comp.currentPage).toBe(0);
    });

    TestRunner.it('filters by phone number', () => {
      comp.filter('333-333');
      TestRunner.expect(comp.filteredContacts).toHaveLength(1);
      TestRunner.expect(comp.filteredContacts[0].id).toBe('3');
    });

    TestRunner.it('trims whitespace from query', () => {
      comp.filter('  Nicholas  ');
      TestRunner.expect(comp.filteredContacts).toHaveLength(1);
    });
  });

  TestRunner.summary();
  console.groupEnd();
}

// Expose to app.js
window.runTests = runTests;
