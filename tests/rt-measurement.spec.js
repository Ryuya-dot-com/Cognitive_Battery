// RAF-synced stimulus onset and event.timeStamp based RT measurement.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('waitForStimulusOnset returns a finite performance.now-compatible value', async ({ page }) => {
    const { ts, now, diff } = await page.evaluate(async () => {
        const before = performance.now();
        const ts = await App.waitForStimulusOnset();
        const now = performance.now();
        return { ts, now, diff: now - ts };
    });
    expect(Number.isFinite(ts)).toBeTruthy();
    expect(diff).toBeGreaterThanOrEqual(-1);
    // Two RAFs typically resolve within ~50ms on a healthy machine
    expect(diff).toBeLessThan(200);
});

test('eventTime prefers event.timeStamp when in timeline', async ({ page }) => {
    const result = await page.evaluate(() => {
        const fake = new KeyboardEvent('keydown', { key: 'f' });
        const t = App.eventTime(fake);
        const now = performance.now();
        return { t, now, diff: Math.abs(now - t) };
    });
    expect(result.t).toBeGreaterThan(0);
    expect(result.diff).toBeLessThan(100);
});

test('eventTime falls back when timestamp is out of timeline', async ({ page }) => {
    const result = await page.evaluate(() => {
        const fake = { timeStamp: -999999 };
        const fallback = App.eventTime(fake);
        const now = performance.now();
        // Fallback should be performance.now() (close to current now)
        return { fallback, now, diff: Math.abs(fallback - now) };
    });
    expect(result.diff).toBeLessThan(50);
});

test('sessionElapsedMs returns null before session start, monotonic after', async ({ page }) => {
    const before = await page.evaluate(() => App.sessionElapsedMs());
    expect(before).toBeNull();

    const values = await page.evaluate(async () => {
        App._sessionPerfStart = performance.now();
        const a = App.sessionElapsedMs();
        await new Promise(r => setTimeout(r, 25));
        const b = App.sessionElapsedMs();
        return { a, b };
    });
    expect(values.a).not.toBeNull();
    expect(values.b).toBeGreaterThanOrEqual(values.a);
    expect(values.b - values.a).toBeGreaterThan(10);
});

test('SHA-256 hash matches known test vector', async ({ page }) => {
    const hash = await page.evaluate(() => App.computeSha256('hello'));
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
});
