import { prisma, isPostgresAvailable } from '@/lib/db/prisma';
import { mockStore } from '@/lib/db/mock-store';
import { AgeBand, ContentCategory, Language, PublicationStatus, ApprovalStatus } from '@prisma/client';
import { generateSignedPlaybackUrl } from '@/lib/storage/service';

export interface ContentItemWithApproval {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  language: Language;
  ageBand: AgeBand;
  durationSeconds: number;
  publicationStatus: PublicationStatus;
  storageKey: string;
  thumbnailKey: string;
  isSampleContent: boolean;
  isApproved?: boolean;
  approvalStatus?: ApprovalStatus;
  signedPlaybackUrl?: string;
}

export async function getAllCuratedContent(filters?: {
  category?: ContentCategory;
  ageBand?: AgeBand;
  language?: Language;
}): Promise<ContentItemWithApproval[]> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    let items = mockStore.contentItems.filter((i) => i.publicationStatus === PublicationStatus.PUBLISHED);
    if (filters?.category) items = items.filter((i) => i.category === filters.category);
    if (filters?.ageBand) items = items.filter((i) => i.ageBand === filters.ageBand);
    if (filters?.language) items = items.filter((i) => i.language === filters.language);

    return items.map((item) => {
      const signed = generateSignedPlaybackUrl(item.id, item.storageKey, 600);
      return {
        ...item,
        signedPlaybackUrl: signed.url,
      };
    });
  }

  const items = await prisma.contentItem.findMany({
    where: {
      publicationStatus: PublicationStatus.PUBLISHED,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.ageBand && { ageBand: filters.ageBand }),
      ...(filters?.language && { language: filters.language }),
    },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => {
    const signed = generateSignedPlaybackUrl(item.id, item.storageKey, 600);
    return {
      ...item,
      signedPlaybackUrl: signed.url,
    };
  });
}

export async function getChildApprovedContent(childId: string): Promise<ContentItemWithApproval[]> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId);
    if (!child) return [];

    const approvedItemIds = new Set(
      mockStore.approvals
        .filter((a) => a.childId === childId && a.status === ApprovalStatus.APPROVED)
        .map((a) => a.contentItemId)
    );

    return mockStore.contentItems
      .filter(
        (item) =>
          approvedItemIds.has(item.id) &&
          item.publicationStatus === PublicationStatus.PUBLISHED &&
          item.ageBand === child.ageBand
      )
      .map((item) => {
        const signed = generateSignedPlaybackUrl(item.id, item.storageKey, 600);
        return {
          ...item,
          isApproved: true,
          approvalStatus: ApprovalStatus.APPROVED,
          signedPlaybackUrl: signed.url,
        };
      });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
  });
  if (!child) return [];

  const approvals = await prisma.parentContentApproval.findMany({
    where: {
      childId,
      status: ApprovalStatus.APPROVED,
    },
    include: {
      contentItem: true,
    },
  });

  return approvals
    .map((appr) => appr.contentItem)
    .filter((item) => item.publicationStatus === PublicationStatus.PUBLISHED && item.ageBand === child.ageBand)
    .map((item) => {
      const signed = generateSignedPlaybackUrl(item.id, item.storageKey, 600);
      return {
        ...item,
        isApproved: true,
        approvalStatus: ApprovalStatus.APPROVED,
        signedPlaybackUrl: signed.url,
      };
    });
}

export async function getContentApprovalsForChild(
  parentId: string,
  childId: string
): Promise<{ content: ContentItemWithApproval[] }> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId && c.parentId === parentId);
    if (!child) throw new Error('Child profile not found or unauthorized');

    const approvals = mockStore.approvals.filter((a) => a.childId === childId);
    const approvalMap = new Map<string, ApprovalStatus>();
    approvals.forEach((a) => approvalMap.set(a.contentItemId, a.status));

    const contentWithApprovals = mockStore.contentItems
      .filter((i) => i.publicationStatus === PublicationStatus.PUBLISHED)
      .map((item) => {
        const status = approvalMap.get(item.id) || ApprovalStatus.REJECTED;
        return {
          ...item,
          isApproved: status === ApprovalStatus.APPROVED,
          approvalStatus: status,
        };
      });

    return { content: contentWithApprovals };
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
  });
  if (!child) throw new Error('Child profile not found or unauthorized');

  const allContent = await prisma.contentItem.findMany({
    where: { publicationStatus: PublicationStatus.PUBLISHED },
    orderBy: { createdAt: 'desc' },
  });

  const approvals = await prisma.parentContentApproval.findMany({
    where: { childId },
  });

  const approvalMap = new Map<string, ApprovalStatus>();
  approvals.forEach((a) => approvalMap.set(a.contentItemId, a.status));

  const contentWithApprovals = allContent.map((item) => {
    const status = approvalMap.get(item.id) || ApprovalStatus.REJECTED;
    return {
      ...item,
      isApproved: status === ApprovalStatus.APPROVED,
      approvalStatus: status,
    };
  });

  return { content: contentWithApprovals };
}

export async function toggleContentApproval(
  parentId: string,
  childId: string,
  contentItemId: string,
  approved: boolean
): Promise<{ status: ApprovalStatus }> {
  const newStatus = approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId && c.parentId === parentId);
    if (!child) throw new Error('Child profile not found or unauthorized');

    const existingIndex = mockStore.approvals.findIndex(
      (a) => a.childId === childId && a.contentItemId === contentItemId
    );

    if (existingIndex >= 0) {
      mockStore.approvals[existingIndex].status = newStatus;
      mockStore.approvals[existingIndex].decidedAt = new Date();
    } else {
      mockStore.approvals.push({
        id: `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        parentId,
        childId,
        contentItemId,
        status: newStatus,
        decidedAt: new Date(),
      });
    }

    return { status: newStatus };
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
  });
  if (!child) throw new Error('Child profile not found or unauthorized');

  await prisma.parentContentApproval.upsert({
    where: {
      childId_contentItemId: { childId, contentItemId },
    },
    update: {
      status: newStatus,
      decidedAt: new Date(),
    },
    create: {
      parentId,
      childId,
      contentItemId,
      status: newStatus,
      decidedAt: new Date(),
    },
  });

  return { status: newStatus };
}

export async function getContentItemById(id: string): Promise<ContentItemWithApproval | null> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const item = mockStore.contentItems.find((i) => i.id === id);
    if (!item) return null;
    const signed = generateSignedPlaybackUrl(item.id, item.storageKey, 600);
    return {
      ...item,
      signedPlaybackUrl: signed.url,
    };
  }

  const item = await prisma.contentItem.findUnique({
    where: { id },
  });
  if (!item) return null;
  const signed = generateSignedPlaybackUrl(item.id, item.storageKey, 600);
  return {
    ...item,
    signedPlaybackUrl: signed.url,
  };
}
