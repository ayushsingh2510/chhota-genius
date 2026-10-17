import { describe, it, expect } from 'vitest';
import { getAllCuratedContent, getChildApprovedContent, toggleContentApproval } from '@/modules/content/service';
import { generateSignedPlaybackUrl, verifyPlaybackToken, validateMediaFile } from '@/lib/storage/service';
import { mockStore } from '@/lib/db/mock-store';
import { AgeBand, ContentCategory } from '@prisma/client';

describe('Curated Content & Storage Security Suite', () => {
  it('generates short-lived signed playback URLs with tamper detection', () => {
    const contentId = 'content-abc-phonics';
    const storageKey = 'sample/videos/abc-phonics.mp4';

    const signed = generateSignedPlaybackUrl(contentId, storageKey, 300);
    expect(signed.url).toContain('/api/content/content-abc-phonics/stream?token=');

    // Token must verify successfully
    const isValid = verifyPlaybackToken(contentId, storageKey, signed.token);
    expect(isValid).toBe(true);

    // Tampered token must fail
    const tampered = signed.token + 'bad';
    expect(verifyPlaybackToken(contentId, storageKey, tampered)).toBe(false);

    // Wrong storageKey or contentId must fail
    expect(verifyPlaybackToken('wrong-id', storageKey, signed.token)).toBe(false);
  });

  it('rejects expired playback tokens', () => {
    const contentId = 'content-abc-phonics';
    const storageKey = 'sample/videos/abc-phonics.mp4';

    // Generate token with negative duration (expired 10s ago)
    const signed = generateSignedPlaybackUrl(contentId, storageKey, -10);
    const isValid = verifyPlaybackToken(contentId, storageKey, signed.token);
    expect(isValid).toBe(false);
  });

  it('validates allowed video file mime types and rejecting malicious uploads', () => {
    // Valid MP4 buffer with 'ftyp' at offset 4
    const validMp4Header = Buffer.alloc(32);
    validMp4Header.write('ftyp', 4, 'ascii');
    const validRes = validateMediaFile(validMp4Header, 'video/mp4');
    expect(validRes.valid).toBe(true);

    // Invalid MIME type (e.g. executable or html)
    const invalidRes = validateMediaFile(Buffer.from('malicious script'), 'text/html');
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.reason).toContain('Only MP4 and WebM');

    // Spoofed extension with fake signature
    const spoofedMp4 = Buffer.from('FAKE-CONTENT-NO-FTYP');
    const spoofRes = validateMediaFile(spoofedMp4, 'video/mp4');
    expect(spoofRes.valid).toBe(false);
    expect(spoofRes.reason).toContain('File signature does not match');
  });

  it('filters curated content by age band and category', async () => {
    const items35 = await getAllCuratedContent({ ageBand: AgeBand.BAND_3_5 });
    expect(items35.length).toBeGreaterThan(0);
    items35.forEach((item) => {
      expect(item.ageBand).toBe(AgeBand.BAND_3_5);
    });

    const itemsScience = await getAllCuratedContent({ category: ContentCategory.SCIENCE });
    itemsScience.forEach((item) => {
      expect(item.category).toBe(ContentCategory.SCIENCE);
    });
  });

  it('strictly restricts child mode to parent-approved content matching child age band', async () => {
    const testChildId = 'child_test_filter_01';
    const testParentId = 'parent_test_filter_01';

    mockStore.children.push({
      id: testChildId,
      parentId: testParentId,
      name: 'Tester',
      avatar: 'lion',
      ageBand: AgeBand.BAND_3_5,
      preferredLanguage: 'ENGLISH',
      dailyScreenTimeMinutes: 30,
      breakReminderMinutes: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear existing approvals for this test child
    mockStore.approvals = mockStore.approvals.filter((a) => a.childId !== testChildId);

    // 1. Initially child has NO approved content
    const initialApproved = await getChildApprovedContent(testChildId);
    expect(initialApproved.length).toBe(0);

    // 2. Parent approves one age 3-5 video
    await toggleContentApproval(testParentId, testChildId, 'content-abc-phonics', true);

    const afterApprove = await getChildApprovedContent(testChildId);
    expect(afterApprove.length).toBe(1);
    expect(afterApprove[0].id).toBe('content-abc-phonics');

    // 3. Parent revokes approval
    await toggleContentApproval(testParentId, testChildId, 'content-abc-phonics', false);
    const afterRevoke = await getChildApprovedContent(testChildId);
    expect(afterRevoke.length).toBe(0);
  });
});
