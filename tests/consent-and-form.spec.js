// Consent gate, form validation, and required fields.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('start blocked without consent', async ({ page }) => {
    await page.fill('#participant-id', 'TEST001');
    await page.fill('#participant-age', '30');
    // Check all readiness boxes but NOT consent
    await page.evaluate(() => {
        document.querySelectorAll('.readiness-checkbox').forEach(cb => {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
    const err = await page.evaluate(() => App.validateStartForm());
    expect(err).toContain('同意');
});

test('start blocked without participant ID', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(cb => cb.checked = true);
    });
    await page.fill('#participant-age', '30');
    const err = await page.evaluate(() => App.validateStartForm());
    expect(err).toContain('ID');
});

test('age out of range is rejected', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(cb => cb.checked = true);
    });
    await page.fill('#participant-id', 'TEST001');
    await page.fill('#participant-age', '17');
    const errLow = await page.evaluate(() => App.validateStartForm());
    expect(errLow).toContain('18');

    await page.fill('#participant-age', '90');
    const errHigh = await page.evaluate(() => App.validateStartForm());
    expect(errHigh).toContain('18');
});

test('viewing distance out of range is rejected, empty is accepted', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(cb => cb.checked = true);
    });
    await page.fill('#participant-id', 'TEST001');
    await page.fill('#participant-age', '30');

    await page.fill('#participant-viewing-distance', '10');
    let err = await page.evaluate(() => App.validateStartForm());
    expect(err).toContain('30');

    await page.fill('#participant-viewing-distance', '200');
    err = await page.evaluate(() => App.validateStartForm());
    expect(err).toContain('150');

    await page.fill('#participant-viewing-distance', '');
    err = await page.evaluate(() => App.validateStartForm());
    // Empty is allowed — expect no viewing-distance error (may still fail environment checks if viewport)
    expect(err).not.toContain('距離');
});

test('optional name field: empty name is accepted', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('consent-agree').checked = true;
        document.querySelectorAll('.readiness-checkbox').forEach(cb => cb.checked = true);
    });
    await page.fill('#participant-id', 'TEST001');
    await page.fill('#participant-age', '30');
    const err = await page.evaluate(() => App.validateStartForm());
    // Name field is not checked — should not block
    expect(err).not.toContain('氏名');
    expect(err).not.toContain('名前');
});

test('CONSENT_VERSION is exposed and stable', async ({ page }) => {
    const version = await page.evaluate(() => App.CONSENT_VERSION);
    expect(typeof version).toBe('string');
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
});
