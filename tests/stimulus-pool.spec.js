// DCCS card-set rotation, Picture Sequence themes, List Sorting vehicles domain.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('DCCS: exactly 3 bivalent card sets, each self-consistent', async ({ page }) => {
    const sets = await page.evaluate(() => DCCSTest.CARD_SETS);
    expect(sets).toHaveLength(3);
    for (const s of sets) {
        expect(s.targets).toHaveLength(2);
        expect(s.testCards).toHaveLength(2);
        // Targets differ on both color AND shape
        expect(s.targets[0].color).not.toBe(s.targets[1].color);
        expect(s.targets[0].shape).not.toBe(s.targets[1].shape);
        // Each test card shares color with one target and shape with the other (bivalence)
        for (const tc of s.testCards) {
            const colorIdx = s.targets.findIndex(t => t.color === tc.color);
            const shapeIdx = s.targets.findIndex(t => t.shape === tc.shape);
            expect(colorIdx).toBeGreaterThanOrEqual(0);
            expect(shapeIdx).toBeGreaterThanOrEqual(0);
            expect(colorIdx).not.toBe(shapeIdx);
            // colorMatch encodes which side holds the color-matching target (0=left, 1=right)
            expect(tc.colorMatch).toBe(colorIdx);
            expect(tc.shapeMatch).toBe(shapeIdx);
        }
    }
});

test('DCCS: run() picks exactly one set and assigns targets/test cards', async ({ page }) => {
    const result = await page.evaluate(() => {
        App.seedRandom(1);
        DCCSTest.run();
        const setId1 = DCCSTest.activeSetId;
        const t1 = DCCSTest.TARGETS.map(t => t.label);

        App.seedRandom(1);
        DCCSTest.run();
        const setId2 = DCCSTest.activeSetId;
        const t2 = DCCSTest.TARGETS.map(t => t.label);

        return { setId1, setId2, t1, t2 };
    });
    // Same seed → same set chosen
    expect(result.setId1).toBe(result.setId2);
    expect(result.t1).toEqual(result.t2);
});

test('Picture Sequence: 4 themes with items15, items9, and practice arrays', async ({ page }) => {
    const themes = await page.evaluate(() => {
        return Object.entries(PictureSequenceTest.THEMES).map(([key, theme]) => ({
            key,
            name: theme.name,
            items15: theme.items15.length,
            items9: theme.items9.length,
            practice: theme.practice.length,
        }));
    });
    expect(themes).toHaveLength(4);
    const keys = themes.map(t => t.key);
    expect(keys).toEqual(expect.arrayContaining(['morning', 'cooking', 'travel', 'office']));
    for (const theme of themes) {
        expect(theme.items15).toBe(15);
        expect(theme.items9).toBe(9);
        expect(theme.practice).toBe(4);
    }
});

test('List Sorting: 3 domains each with 6 items sorted ascending by size', async ({ page }) => {
    const result = await page.evaluate(() => ({
        animals: ListSortingTest.ANIMALS,
        foods: ListSortingTest.FOODS,
        vehicles: ListSortingTest.VEHICLES,
    }));
    for (const domain of [result.animals, result.foods, result.vehicles]) {
        expect(domain).toHaveLength(6);
        const sizes = domain.map(i => i.size);
        expect(sizes).toEqual([1, 2, 3, 4, 5, 6]);
    }
});

test('privacy mode: persistSession does not write to localStorage', async ({ page }) => {
    const result = await page.evaluate(() => {
        localStorage.removeItem(App.STORAGE_KEY);
        App.privacyMode = true;
        App.startTime = new Date();
        App.participantId = 'PRIV01';
        App.persistSession();
        const stored = localStorage.getItem(App.STORAGE_KEY);
        return { stored };
    });
    expect(result.stored).toBeNull();
});

test('privacy mode OFF: persistSession writes to localStorage', async ({ page }) => {
    const result = await page.evaluate(() => {
        localStorage.removeItem(App.STORAGE_KEY);
        App.privacyMode = false;
        App.startTime = new Date();
        App.participantId = 'NORM01';
        App.participantAge = 30;
        App.selectedTests = ['flanker'];
        App.results = {};
        App.trialData = {};
        App.persistSession();
        const stored = localStorage.getItem(App.STORAGE_KEY);
        return { stored: stored ? JSON.parse(stored) : null };
    });
    expect(result.stored).not.toBeNull();
    expect(result.stored.participantId).toBe('NORM01');
});
