// Keyboard-only operation for List Sorting and Picture Sequence.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Minimal session bootstrap so tasks can run
    await page.evaluate(() => {
        App.seedRandom(12345);
        App._sessionPerfStart = performance.now();
        App.participantAge = 30;
    });
});

test('List Sorting: items are rendered as native buttons with keyboard hint', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const items = [
            { emoji: '🐁', name: 'ネズミ', size: 1 },
            { emoji: '🐈', name: '猫', size: 2 },
            { emoji: '🐕', name: '犬', size: 3 },
        ];
        ListSortingTest.getResponse(items, 'single');
        await new Promise(r => setTimeout(r, 100));
        const buttons = Array.from(document.querySelectorAll('.ls-item-btn'));
        const focusable = buttons.filter(b => b.tagName === 'BUTTON' && !b.disabled);
        const hint = document.querySelector('.ls-keyboard-hint');
        return {
            count: buttons.length,
            focusableCount: focusable.length,
            hintText: hint ? hint.textContent : null,
        };
    });
    expect(result.count).toBe(3);
    expect(result.focusableCount).toBe(3);
    expect(result.hintText).toContain('Backspace');
});

test('List Sorting: Backspace undoes last selection', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const items = [
            { emoji: '🐁', name: 'ネズミ', size: 1 },
            { emoji: '🐈', name: '猫', size: 2 },
        ];
        ListSortingTest.getResponse(items, 'single');
        await new Promise(r => setTimeout(r, 50));
        // Click first button to select the first displayed item
        document.querySelector('.ls-item-btn:not(.disabled)').click();
        await new Promise(r => setTimeout(r, 50));
        const selectedBefore = document.querySelectorAll('.ls-selected-item').length;
        // Backspace should undo
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
        await new Promise(r => setTimeout(r, 50));
        const selectedAfter = document.querySelectorAll('.ls-selected-item').length;
        // Clean up keyboard handler
        if (ListSortingTest._keyboardHandler) {
            document.removeEventListener('keydown', ListSortingTest._keyboardHandler);
            ListSortingTest._keyboardHandler = null;
        }
        return { selectedBefore, selectedAfter };
    });
    expect(result.selectedBefore).toBe(1);
    expect(result.selectedAfter).toBe(0);
});

test('Picture Sequence: drop slots and draggables are ARIA buttons with tabindex', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const items = [
            { emoji: '🌅', label: '朝起きる' },
            { emoji: '☕', label: 'コーヒー' },
            { emoji: '🛁', label: 'シャワー' },
        ];
        PictureSequenceTest.reorderPhase(items);
        await new Promise(r => setTimeout(r, 100));
        const slots = Array.from(document.querySelectorAll('.ps-drop-slot'));
        const drags = Array.from(document.querySelectorAll('.ps-draggable'));
        const slotAttrs = slots.map(s => ({ role: s.getAttribute('role'), tab: s.getAttribute('tabindex') }));
        const dragAttrs = drags.map(d => ({ role: d.getAttribute('role'), tab: d.getAttribute('tabindex'), aria: d.getAttribute('aria-label') }));
        return { slotAttrs, dragAttrs };
    });
    for (const attrs of result.slotAttrs) {
        expect(attrs.role).toBe('button');
        expect(attrs.tab).toBe('0');
    }
    expect(result.dragAttrs).toHaveLength(3);
    for (const attrs of result.dragAttrs) {
        expect(attrs.role).toBe('button');
        expect(attrs.tab).toBe('0');
        expect(attrs.aria).toBeTruthy();
    }
});

test('Picture Sequence: Enter key activates draggable and fills next slot', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const items = [
            { emoji: '🌅', label: '朝' },
            { emoji: '☕', label: 'コーヒー' },
        ];
        PictureSequenceTest.reorderPhase(items);
        await new Promise(r => setTimeout(r, 100));
        const firstDrag = document.querySelector('.ps-draggable');
        firstDrag.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await new Promise(r => setTimeout(r, 80));
        // A selection indicator appears when dragItem is set
        const hasSelection = !!document.querySelector('.ps-current-selection');
        const firstSlot = document.querySelector('.ps-drop-slot');
        firstSlot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await new Promise(r => setTimeout(r, 80));
        const occupied = document.querySelectorAll('.ps-drop-slot.occupied').length;
        return { hasSelection, occupied };
    });
    expect(result.hasSelection).toBe(true);
    expect(result.occupied).toBe(1);
});

test('Picture Sequence: Backspace on occupied slot removes the item', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const items = [
            { emoji: '🌅', label: '朝' },
            { emoji: '☕', label: 'コーヒー' },
        ];
        PictureSequenceTest.reorderPhase(items);
        await new Promise(r => setTimeout(r, 100));
        // Click-place to fill a slot
        document.querySelector('.ps-draggable').click();
        await new Promise(r => setTimeout(r, 50));
        document.querySelector('.ps-drop-slot[data-action="place"]').click();
        await new Promise(r => setTimeout(r, 80));
        const beforeOccupied = document.querySelectorAll('.ps-drop-slot.occupied').length;
        const filledSlot = document.querySelector('.ps-drop-slot.occupied');
        filledSlot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
        await new Promise(r => setTimeout(r, 80));
        const afterOccupied = document.querySelectorAll('.ps-drop-slot.occupied').length;
        return { beforeOccupied, afterOccupied };
    });
    expect(result.beforeOccupied).toBe(1);
    expect(result.afterOccupied).toBe(0);
});
