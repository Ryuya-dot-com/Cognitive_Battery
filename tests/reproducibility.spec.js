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
    expect(a.order).toHaveLength(7);
});

test('counterbalance: Williams rows use each task exactly once', async ({ page }) => {
    const design = await page.evaluate(() => App.COUNTERBALANCE_WILLIAMS_DESIGN);
    expect(design).toHaveLength(14);
    for (const row of design) {
        expect(row).toHaveLength(7);
        expect(new Set(row).size).toBe(7);
    }
    // Each task occurs twice in every serial position across the 14 orders.
    for (let col = 0; col < 7; col++) {
        const counts = new Map();
        design.forEach(row => counts.set(row[col], (counts.get(row[col]) || 0) + 1));
        expect([...counts.values()]).toEqual([2, 2, 2, 2, 2, 2, 2]);
    }
    const directedPairs = new Map();
    for (const row of design) {
        for (let index = 1; index < row.length; index++) {
            const key = `${row[index - 1]}→${row[index]}`;
            directedPairs.set(key, (directedPairs.get(key) || 0) + 1);
        }
    }
    expect(directedPairs.size).toBe(42);
    expect(new Set(directedPairs.values())).toEqual(new Set([2]));
});

test('counterbalance: hashing disperses participant IDs across groups', async ({ page }) => {
    const counts = await page.evaluate(() => {
        const counts = Array(14).fill(0);
        for (let i = 0; i < 1400; i++) {
            const id = `participant_${i}_${(i * 31) ^ 0x5f3759df}`;
            const g = App.counterbalanceOrderFor(id).group;
            counts[g]++;
        }
        return counts;
    });
    // Expect roughly uniform; no bucket should be empty and none should dominate
    for (const c of counts) {
        expect(c).toBeGreaterThan(30);
        expect(c).toBeLessThan(180);
    }
});

test('task seeds are stable and independent by namespace', async ({ page }) => {
    const seeds = await page.evaluate(() => {
        App.participantId = 'P-SEED';
        App.sessionNumber = 2;
        App.seedRandom(123456);
        return {
            digitA: App.deriveTaskSeed('visual_digit_span'),
            digitB: App.deriveTaskSeed('visual_digit_span'),
            corsi: App.deriveTaskSeed('ecorsi'),
        };
    });
    expect(seeds.digitA).toBe(seeds.digitB);
    expect(seeds.digitA).not.toBe(seeds.corsi);
});
