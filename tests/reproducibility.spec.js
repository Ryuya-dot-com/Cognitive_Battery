// Seeded PRNG and counterbalancing determinism.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('mulberry32: same seed produces same sequence', async ({ page }) => {
    const { run1, run2, run3 } = await page.evaluate(() => {
        App.seedRandom(12345);
        const a = [App.random(), App.random(), App.random(), App.random(), App.random()];
        App.seedRandom(12345);
        const b = [App.random(), App.random(), App.random(), App.random(), App.random()];
        App.seedRandom(99999);
        const c = [App.random(), App.random()];
        return { run1: a, run2: b, run3: c };
    });
    expect(run1).toEqual(run2);
    expect(run3[0]).not.toBe(run1[0]);
});

test('shuffle: deterministic under fixed seed', async ({ page }) => {
    const { a, b } = await page.evaluate(() => {
        App.seedRandom(4242);
        const a = App.shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
        App.seedRandom(4242);
        const b = App.shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
        return { a, b };
    });
    expect(a).toEqual(b);
    expect(a).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8]); // should actually shuffle
});

test('counterbalance: same participant ID → same order', async ({ page }) => {
    const { a, b, c, differs } = await page.evaluate(() => {
        const a = App.counterbalanceOrderFor('P001');
        const b = App.counterbalanceOrderFor('P001');
        const c = App.counterbalanceOrderFor('P002');
        return { a, b, c, differs: a.group !== c.group || JSON.stringify(a.order) !== JSON.stringify(c.order) };
    });
    expect(a.order).toEqual(b.order);
    expect(a.group).toBe(b.group);
    // With FNV-1a hashing, P001 and P002 should land in different groups often but not guaranteed.
    // We only assert the hash is stable — the not-equal expectation is a sanity check over many IDs.
    // Test below covers coverage.
    expect(a.order).toHaveLength(5);
});

test('counterbalance: Latin square rows use each task exactly once', async ({ page }) => {
    const square = await page.evaluate(() => App.COUNTERBALANCE_LATIN_SQUARE);
    for (const row of square) {
        expect(row).toHaveLength(5);
        expect(new Set(row).size).toBe(5);
    }
    // Column-wise: each task appears in each column position across 5 rows (Latin property)
    for (let col = 0; col < 5; col++) {
        const column = square.map(r => r[col]);
        expect(new Set(column).size).toBe(5);
    }
});

test('counterbalance: hashing disperses participant IDs across groups', async ({ page }) => {
    const counts = await page.evaluate(() => {
        const counts = [0, 0, 0, 0, 0];
        for (let i = 0; i < 500; i++) {
            const id = `participant_${i}_${(i * 31) ^ 0x5f3759df}`;
            const g = App.counterbalanceOrderFor(id).group;
            counts[g]++;
        }
        return counts;
    });
    // Expect roughly uniform; no bucket should be empty and none should dominate
    for (const c of counts) {
        expect(c).toBeGreaterThan(30); // >6% of 500
        expect(c).toBeLessThan(250); // <50% of 500
    }
});
