import test from 'node:test';
import assert from 'node:assert/strict';
import { addPost, createDraft, isoDate, loadState, moveMonth, saveState, weekStart, DEFAULT_POSTS, STORAGE_KEY } from '../src/appLogic.js';

test('addPost creates a planned post with a unique id and trimmed title', () => {
  const next = addPost(DEFAULT_POSTS, { title: '  Új poszt  ', date: '2026-11-03', platform: 'Instagram' });
  assert.equal(next.length, DEFAULT_POSTS.length + 1);
  assert.equal(next.at(-1).title, 'Új poszt');
  assert.equal(next.at(-1).status, 'Planned');
  assert.equal(next.at(-1).date, '2026-11-03');
});
test('addPost rejects blank title and missing date', () => {
  assert.throws(() => addPost([], { title: '  ', date: '2026-11-03' }), { message: 'TITLE_REQUIRED' });
  assert.throws(() => addPost([], { title: 'Valid' }), { message: 'DATE_REQUIRED' });
});
test('createDraft returns localized template copy and platform metadata', () => {
  const hu = createDraft({ topic: 'Új termék', business: 'Bolt', goal: 'Eladás', platform: 'Instagram', language: 'hu' });
  const en = createDraft({ topic: 'New product', business: 'Shop', goal: 'Sales', platform: 'Facebook', language: 'en' });
  assert.match(hu.copy, /Javasolt CTA/);
  assert.match(en.copy, /Suggested CTA/);
  assert.equal(hu.status, 'Draft');
  assert.equal(en.platform, 'Facebook');
});
test('weekStart returns Monday and month navigation crosses year boundary', () => {
  assert.equal(isoDate(weekStart(new Date(2026, 10, 1))), '2026-10-26');
  assert.equal(isoDate(moveMonth(new Date(2026, 11, 1), 1)), '2027-01-01');
});
test('saveState and loadState preserve user changes across reloads', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const state = { posts: [{ ...DEFAULT_POSTS[0], title: 'Updated title' }], language: 'en', brand: { name: 'My shop' } };

  assert.equal(saveState(state, storage), true);
  assert.equal(values.has(STORAGE_KEY), true);
  assert.deepEqual(loadState(storage), state);
});
test('saveState reports unavailable storage instead of throwing', () => {
  const storage = { setItem() { throw new Error('Storage unavailable'); } };
  assert.equal(saveState({}, storage), false);
});
