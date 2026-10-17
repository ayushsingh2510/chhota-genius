import { PrismaClient, AgeBand, ContentCategory, Language, ActivityType, PublicationStatus, ApprovalStatus, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Chhota Genius database seed with fictional development data...');

  // 1. Create a fictional demo parent (clearly marked for local development only)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('ChhotaGenius@2026', salt);

  const demoParent = await prisma.parent.upsert({
    where: { email: 'parent.demo@chhotagenius.local' },
    update: {},
    create: {
      email: 'parent.demo@chhotagenius.local',
      passwordHash,
      name: 'Priya Sharma (Demo Parent)',
      role: 'PARENT',
      dailyScreenTimeMinutesDefault: 30,
      sessionBreakReminderMinutes: 15,
      monthlyRewardCoinBudget: 200,
    },
  });

  console.log(`✓ Seeded Demo Parent: ${demoParent.email} (ID: ${demoParent.id})`);

  // 2. Create Child Profiles
  const aarav = await prisma.child.upsert({
    where: { id: 'seed-child-aarav-3-5' },
    update: {},
    create: {
      id: 'seed-child-aarav-3-5',
      parentId: demoParent.id,
      name: 'Aarav',
      avatar: 'lion',
      ageBand: AgeBand.BAND_3_5,
      preferredLanguage: Language.ENGLISH,
      dailyScreenTimeMinutes: 25,
      breakReminderMinutes: 12,
    },
  });

  const ananya = await prisma.child.upsert({
    where: { id: 'seed-child-ananya-6-8' },
    update: {},
    create: {
      id: 'seed-child-ananya-6-8',
      parentId: demoParent.id,
      name: 'Ananya',
      avatar: 'elephant',
      ageBand: AgeBand.BAND_6_8,
      preferredLanguage: Language.HINDI,
      dailyScreenTimeMinutes: 35,
      breakReminderMinutes: 15,
    },
  });

  console.log(`✓ Seeded Child Profiles: Aarav (3-5) & Ananya (6-8)`);

  // 3. Create Curated Educational Video Content Items
  const sampleVideos = [
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
    },
  ];

  for (const item of sampleVideos) {
    await prisma.contentItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }
  console.log(`✓ Seeded ${sampleVideos.length} Curated Educational Videos`);

  // 4. Parent Approvals for Child Aarav and Ananya
  for (const item of sampleVideos) {
    // Approve for Aarav if age 3-5
    if (item.ageBand === AgeBand.BAND_3_5) {
      await prisma.parentContentApproval.upsert({
        where: { childId_contentItemId: { childId: aarav.id, contentItemId: item.id } },
        update: {},
        create: {
          parentId: demoParent.id,
          childId: aarav.id,
          contentItemId: item.id,
          status: ApprovalStatus.APPROVED,
        },
      });
    }

    // Approve for Ananya if age 6-8 or good habits
    if (item.ageBand === AgeBand.BAND_6_8 || item.category === ContentCategory.GOOD_HABITS) {
      await prisma.parentContentApproval.upsert({
        where: { childId_contentItemId: { childId: ananya.id, contentItemId: item.id } },
        update: {},
        create: {
          parentId: demoParent.id,
          childId: ananya.id,
          contentItemId: item.id,
          status: ApprovalStatus.APPROVED,
        },
      });
    }
  }
  console.log(`✓ Seeded Parent Approvals for Aarav and Ananya`);

  // 5. Seed Learning Activities (Quizzes, Matching, Sorting) with server-authoritative secret answer keys
  const activities = [
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
    },
  ];

  for (const act of activities) {
    await prisma.learningActivity.upsert({
      where: { id: act.id },
      update: {},
      create: act,
    });
  }
  console.log(`✓ Seeded ${activities.length} Interactive Learning Activities`);

  // 6. Seed Parent-Approved Offline Rewards
  const rewards = [
    {
      id: 'reward-bedtime-story',
      parentId: demoParent.id,
      title: 'Extra Bedtime Story Pick',
      description: 'Choose any bedtime story for mom or dad to read with voices tonight!',
      category: 'STORYBOOK',
      coinCost: 15,
      icon: 'book-open',
    },
    {
      id: 'reward-park-visit',
      parentId: demoParent.id,
      title: 'Weekend Family Park Trip',
      description: 'A special trip to the local playground or butterfly garden with picnic snacks.',
      category: 'FAMILY_ACTIVITY',
      coinCost: 25,
      icon: 'sun',
    },
    {
      id: 'reward-crayons-pack',
      parentId: demoParent.id,
      title: 'Colourful Sketchbook & Crayons',
      description: 'A brand new drawing sketchbook and bright wax crayons for creative art.',
      category: 'ART_SUPPLIES',
      coinCost: 30,
      icon: 'palette',
    },
    {
      id: 'reward-bake-cookies',
      parentId: demoParent.id,
      title: 'Bake Star Cookies Together',
      description: 'Help roll out dough and use fun star cutters to bake fresh cookies.',
      category: 'OFFLINE_TREAT',
      coinCost: 20,
      icon: 'sparkles',
    },
  ];

  for (const rew of rewards) {
    await prisma.reward.upsert({
      where: { id: rew.id },
      update: {},
      create: rew,
    });
  }
  console.log(`✓ Seeded ${rewards.length} Parent Reward Catalogue Items`);

  // 7. Seed Initial Safe Coin Ledger Transactions for Aarav and Ananya
  await prisma.coinTransaction.upsert({
    where: { idempotencyKey: 'seed-tx-welcome-aarav' },
    update: {},
    create: {
      childId: aarav.id,
      amount: 10,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Welcome to Chhota Genius learning journey!',
      idempotencyKey: 'seed-tx-welcome-aarav',
    },
  });

  await prisma.coinTransaction.upsert({
    where: { idempotencyKey: 'seed-tx-welcome-ananya' },
    update: {},
    create: {
      childId: ananya.id,
      amount: 20,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Welcome bonus for reading exploration!',
      idempotencyKey: 'seed-tx-welcome-ananya',
    },
  });

  console.log('✓ Seeded initial coin ledger transactions');
  console.log('🎉 Chhota Genius database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
