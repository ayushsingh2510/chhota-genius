import {
  AgeBand,
  ContentCategory,
  Language,
  PublicationStatus,
  ApprovalStatus,
  ActivityType,
  AttemptStatus,
  TransactionType,
  RedemptionStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface MockParent {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  dailyScreenTimeMinutesDefault: number;
  sessionBreakReminderMinutes: number;
  monthlyRewardCoinBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockChild {
  id: string;
  parentId: string;
  name: string;
  avatar: string;
  ageBand: AgeBand;
  preferredLanguage: Language;
  dailyScreenTimeMinutes: number;
  breakReminderMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockContentItem {
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
  uploader?: string | null;
  isSampleContent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockApproval {
  id: string;
  parentId: string;
  childId: string;
  contentItemId: string;
  status: ApprovalStatus;
  decidedAt: Date;
}

export interface MockActivity {
  id: string;
  contentItemId?: string | null;
  title: string;
  description: string;
  activityType: ActivityType;
  ageBand: AgeBand;
  language: Language;
  category: ContentCategory;
  instructions: string;
  coinReward: number;
  questionsData: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAttempt {
  id: string;
  childId: string;
  activityId: string;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  passed: boolean;
  rewardAwarded: boolean;
  answersData?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
}

export interface MockCoinTx {
  id: string;
  childId: string;
  amount: number;
  type: TransactionType;
  reason: string;
  idempotencyKey?: string | null;
  learningAttemptId?: string | null;
  redemptionId?: string | null;
  createdAt: Date;
}

export interface MockReward {
  id: string;
  parentId: string;
  title: string;
  description: string;
  category: string;
  coinCost: number;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockRedemption {
  id: string;
  childId: string;
  rewardId: string;
  coinCost: number;
  status: RedemptionStatus;
  parentNote?: string | null;
  requestedAt: Date;
  decidedAt?: Date | null;
}

export interface MockScreenSession {
  id: string;
  childId: string;
  sessionToken: string;
  startedAt: Date;
  lastHeartbeatAt: Date;
  endedAt?: Date | null;
  durationSeconds: number;
  isActive: boolean;
}

// Global in-memory state singleton
class MockDatabaseStore {
  parents: MockParent[] = [];
  children: MockChild[] = [];
  contentItems: MockContentItem[] = [];
  approvals: MockApproval[] = [];
  activities: MockActivity[] = [];
  attempts: MockAttempt[] = [];
  coinTransactions: MockCoinTx[] = [];
  rewards: MockReward[] = [];
  redemptions: MockRedemption[] = [];
  sessions: MockScreenSession[] = [];
  initialized = false;

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    if (this.initialized) return;

    // Seed Demo Parent: password "ChhotaGenius@2026"
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('ChhotaGenius@2026', salt);

    const demoParent: MockParent = {
      id: 'parent_demo_01',
      email: 'parent.demo@chhotagenius.local',
      passwordHash,
      name: 'Priya Sharma (Demo Parent)',
      role: 'PARENT',
      dailyScreenTimeMinutesDefault: 30,
      sessionBreakReminderMinutes: 15,
      monthlyRewardCoinBudget: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.parents.push(demoParent);

    // Seed Children
    const aarav: MockChild = {
      id: 'child_aarav_01',
      parentId: demoParent.id,
      name: 'Aarav',
      avatar: 'lion',
      ageBand: AgeBand.BAND_3_5,
      preferredLanguage: Language.ENGLISH,
      dailyScreenTimeMinutes: 25,
      breakReminderMinutes: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ananya: MockChild = {
      id: 'child_ananya_02',
      parentId: demoParent.id,
      name: 'Ananya',
      avatar: 'elephant',
      ageBand: AgeBand.BAND_6_8,
      preferredLanguage: Language.HINDI,
      dailyScreenTimeMinutes: 35,
      breakReminderMinutes: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.children.push(aarav, ananya);

    // Seed Curated Videos
    const videos: MockContentItem[] = [
      {
        id: 'content-abc-phonics',
        title: 'Fun ABC Phonics with Friendly Animals',
        description: 'Learn letter sounds from A to Z with cheerful animal companions.',
        category: ContentCategory.ALPHABETS,
        language: Language.ENGLISH,
        ageBand: AgeBand.BAND_3_5,
        durationSeconds: 180,
        publicationStatus: PublicationStatus.PUBLISHED,
        storageKey: 'sample/videos/abc-phonics.mp4',
        thumbnailKey: 'sample/thumbnails/abc-phonics.png',
        uploader: 'Curator Editorial Team',
        isSampleContent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'content-counting-1-to-10',
        title: 'Counting 1 to 10 with Playful Monkeys',
        description: 'Count juicy mangoes and jumping monkeys in this joyful math rhyme.',
        category: ContentCategory.NUMBERS,
        language: Language.ENGLISH,
        ageBand: AgeBand.BAND_3_5,
        durationSeconds: 150,
        publicationStatus: PublicationStatus.PUBLISHED,
        storageKey: 'sample/videos/counting-monkeys.mp4',
        thumbnailKey: 'sample/thumbnails/counting-monkeys.png',
        uploader: 'Curator Editorial Team',
        isSampleContent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'content-hindi-varnamala',
        title: 'हिंदी वर्णमाला सीखें: स्वर और व्यंजन (Hindi Alphabet)',
        description: 'सरल और रोचक तरीके से क, ख, ग और अ, आ, इ सीखिए।',
        category: ContentCategory.LANGUAGES,
        language: Language.HINDI,
        ageBand: AgeBand.BAND_6_8,
        durationSeconds: 240,
        publicationStatus: PublicationStatus.PUBLISHED,
        storageKey: 'sample/videos/hindi-varnamala.mp4',
        thumbnailKey: 'sample/thumbnails/hindi-varnamala.png',
        uploader: 'Curator Editorial Team',
        isSampleContent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'content-solar-system',
        title: 'Our Amazing Solar System: Planets & Stars',
        description: 'Journey through space to explore the Sun, Earth, Moon, and neighbor planets.',
        category: ContentCategory.SCIENCE,
        language: Language.ENGLISH,
        ageBand: AgeBand.BAND_6_8,
        durationSeconds: 300,
        publicationStatus: PublicationStatus.PUBLISHED,
        storageKey: 'sample/videos/solar-system.mp4',
        thumbnailKey: 'sample/thumbnails/solar-system.png',
        uploader: 'Curator Editorial Team',
        isSampleContent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'content-good-habits',
        title: 'Good Habits: Washing Hands and Healthy Smiles',
        description: 'Sing along and learn how clean hands and brushing teeth keep us strong.',
        category: ContentCategory.GOOD_HABITS,
        language: Language.ENGLISH,
        ageBand: AgeBand.BAND_3_5,
        durationSeconds: 120,
        publicationStatus: PublicationStatus.PUBLISHED,
        storageKey: 'sample/videos/good-habits.mp4',
        thumbnailKey: 'sample/thumbnails/good-habits.png',
        uploader: 'Curator Editorial Team',
        isSampleContent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'content-art-colors',
        title: 'Magic of Rainbow Colors: Mixing & Painting',
        description: 'Discover primary and secondary colors through fun splash art.',
        category: ContentCategory.ART,
        language: Language.HINDI,
        ageBand: AgeBand.BAND_6_8,
        durationSeconds: 210,
        publicationStatus: PublicationStatus.PUBLISHED,
        storageKey: 'sample/videos/rainbow-art.mp4',
        thumbnailKey: 'sample/thumbnails/rainbow-art.png',
        uploader: 'Curator Editorial Team',
        isSampleContent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.contentItems.push(...videos);

    // Seed Parent Approvals
    videos.forEach((vid, idx) => {
      if (vid.ageBand === AgeBand.BAND_3_5) {
        this.approvals.push({
          id: `appr_aarav_${idx}`,
          parentId: demoParent.id,
          childId: aarav.id,
          contentItemId: vid.id,
          status: ApprovalStatus.APPROVED,
          decidedAt: new Date(),
        });
      }
      if (vid.ageBand === AgeBand.BAND_6_8 || vid.category === ContentCategory.GOOD_HABITS) {
        this.approvals.push({
          id: `appr_ananya_${idx}`,
          parentId: demoParent.id,
          childId: ananya.id,
          contentItemId: vid.id,
          status: ApprovalStatus.APPROVED,
          decidedAt: new Date(),
        });
      }
    });

    // Seed Learning Activities with Secret Server Answer Keys
    const acts: MockActivity[] = [
      {
        id: 'act-abc-quiz-1',
        contentItemId: 'content-abc-phonics',
        title: 'Alphabet Phonics Fun Quiz',
        description: 'Which friendly animal begins with letter A and letter B?',
        activityType: ActivityType.QUIZ,
        ageBand: AgeBand.BAND_3_5,
        language: Language.ENGLISH,
        category: ContentCategory.ALPHABETS,
        instructions: 'Listen to the letter and tap the correct picture!',
        coinReward: 5,
        questionsData: JSON.stringify({
          questions: [
            {
              id: 'q1',
              prompt: 'Which delicious fruit starts with the letter "A"?',
              illustration: '🍎',
              options: [
                { id: 'opt1', label: 'Apple', icon: '🍎' },
                { id: 'opt2', label: 'Banana', icon: '🍌' },
                { id: 'opt3', label: 'Grapes', icon: '🍇' },
              ],
              correctOptionId: 'opt1',
              explanation: 'Super job! "A" is for Apple!',
            },
            {
              id: 'q2',
              prompt: 'Which sweet creature buzzes and begins with "B"?',
              illustration: '🐝',
              options: [
                { id: 'opt1', label: 'Cat', icon: '🐱' },
                { id: 'opt2', label: 'Bee', icon: '🐝' },
                { id: 'opt3', label: 'Dog', icon: '🐶' },
              ],
              correctOptionId: 'opt2',
              explanation: 'Bzzzz! "B" is for Bee!',
            },
          ],
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'act-animals-match-1',
        contentItemId: null,
        title: 'Animals and Their Homes Matching',
        description: 'Help our animal friends find where they sleep safe and sound.',
        activityType: ActivityType.MATCHING,
        ageBand: AgeBand.BAND_3_5,
        language: Language.ENGLISH,
        category: ContentCategory.ANIMALS,
        instructions: 'Tap an animal, then tap its home to match them up!',
        coinReward: 5,
        questionsData: JSON.stringify({
          pairs: [
            { id: 'p1', left: 'Bird 🐦', right: 'Nest 🪺', leftId: 'bird', rightId: 'nest' },
            { id: 'p2', left: 'Lion 🦁', right: 'Den ⛰️', leftId: 'lion', rightId: 'den' },
            { id: 'p3', left: 'Fish 🐠', right: 'Water 🌊', leftId: 'fish', rightId: 'water' },
          ],
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'act-healthy-sort-1',
        contentItemId: 'content-good-habits',
        title: 'Healthy Habits Sorting Box',
        description: 'Sort everyday habits into Everyday Healthy Habits and Sometimes Treats.',
        activityType: ActivityType.SORTING,
        ageBand: AgeBand.BAND_6_8,
        language: Language.ENGLISH,
        category: ContentCategory.GOOD_HABITS,
        instructions: 'Drag or tap each item into either "Healthy Habit" or "Sometimes Treat"!',
        coinReward: 5,
        questionsData: JSON.stringify({
          categories: [
            { id: 'cat-healthy', name: 'Everyday Healthy' },
            { id: 'cat-treat', name: 'Sometimes Treat' },
          ],
          items: [
            { id: 'it1', label: 'Drinking fresh water 💧', correctCategory: 'cat-healthy' },
            { id: 'it2', label: 'Brushing teeth twice a day 🪥', correctCategory: 'cat-healthy' },
            { id: 'it3', label: 'Eating sweet sugary candies 🍬', correctCategory: 'cat-treat' },
            { id: 'it4', label: 'Sleeping 8-9 hours every night 😴', correctCategory: 'cat-healthy' },
          ],
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'act-hindi-quiz-1',
        contentItemId: 'content-hindi-varnamala',
        title: 'हिंदी वर्णमाला ज्ञान प्रश्नोत्तरी (Hindi Quiz)',
        description: 'अक्षरों और उनके चित्रों की पहचान कीजिए।',
        activityType: ActivityType.QUIZ,
        ageBand: AgeBand.BAND_6_8,
        language: Language.HINDI,
        category: ContentCategory.LANGUAGES,
        instructions: 'सही उत्तर चुनिए और अपना ज्ञान बढ़ाइए!',
        coinReward: 5,
        questionsData: JSON.stringify({
          questions: [
            {
              id: 'hq1',
              prompt: 'हाथी (Elephant) का पहला अक्षर कौन सा है?',
              illustration: '🐘',
              options: [
                { id: 'opt1', label: 'क (Ka)' },
                { id: 'opt2', label: 'ह (Ha)' },
                { id: 'opt3', label: 'म (Ma)' },
              ],
              correctOptionId: 'opt2',
              explanation: 'शाबाश! ह से हाथी होता है!',
            },
            {
              id: 'hq2',
              prompt: 'कमल (Lotus) किस अक्षर से शुरू होता है?',
              illustration: '🪷',
              options: [
                { id: 'opt1', label: 'क (Ka)' },
                { id: 'opt2', label: 'त (Ta)' },
                { id: 'opt3', label: 'स (Sa)' },
              ],
              correctOptionId: 'opt1',
              explanation: 'बहुत बढ़िया! क से कमल!',
            },
          ],
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.activities.push(...acts);

    // Seed Rewards Catalogue
    const rews: MockReward[] = [
      {
        id: 'reward-bedtime-story',
        parentId: demoParent.id,
        title: 'Extra Bedtime Story Pick',
        description: 'Choose any bedtime story for mom or dad to read with voices tonight!',
        category: 'STORYBOOK',
        coinCost: 15,
        icon: 'book-open',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reward-park-visit',
        parentId: demoParent.id,
        title: 'Weekend Family Park Trip',
        description: 'A special trip to the local playground or butterfly garden with picnic snacks.',
        category: 'FAMILY_ACTIVITY',
        coinCost: 25,
        icon: 'sun',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reward-crayons-pack',
        parentId: demoParent.id,
        title: 'Colourful Sketchbook & Crayons',
        description: 'A brand new drawing sketchbook and bright wax crayons for creative art.',
        category: 'ART_SUPPLIES',
        coinCost: 30,
        icon: 'palette',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reward-bake-cookies',
        parentId: demoParent.id,
        title: 'Bake Star Cookies Together',
        description: 'Help roll out dough and use fun star cutters to bake fresh cookies.',
        category: 'OFFLINE_TREAT',
        coinCost: 20,
        icon: 'sparkles',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.rewards.push(...rews);

    // Initial Ledger transactions
    this.coinTransactions.push(
      {
        id: 'tx_aarav_init',
        childId: aarav.id,
        amount: 10,
        type: TransactionType.PARENT_ADJUSTMENT,
        reason: 'Welcome to Chhota Genius learning journey!',
        idempotencyKey: 'seed-tx-welcome-aarav',
        createdAt: new Date(),
      },
      {
        id: 'tx_ananya_init',
        childId: ananya.id,
        amount: 20,
        type: TransactionType.PARENT_ADJUSTMENT,
        reason: 'Welcome bonus for reading exploration!',
        idempotencyKey: 'seed-tx-welcome-ananya',
        createdAt: new Date(),
      }
    );

    this.initialized = true;
  }
}

const globalForMockStore = globalThis as unknown as {
  mockStore: MockDatabaseStore | undefined;
};

export const mockStore = globalForMockStore.mockStore ?? new MockDatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForMockStore.mockStore = mockStore;
