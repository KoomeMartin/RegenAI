import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create test user account
  const hashedPassword = await bcrypt.hash('johndoe123', 10)
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      alias: 'SafeSpaceUser',
      avatar: 'avatar1',
    },
  })
  console.log('Test user created:', testUser.alias)

  // Create sample therapist accounts
  const therapist1Password = await bcrypt.hash('therapist123', 10)
  const therapist1 = await prisma.user.upsert({
    where: { email: 'therapist1@safespace.com' },
    update: {},
    create: {
      email: 'therapist1@safespace.com',
      password: therapist1Password,
      alias: 'Dr. Amara Okafor',
      avatar: 'avatar5',
      role: 'therapist',
    },
  })

  await prisma.therapistProfile.upsert({
    where: { userId: therapist1.id },
    update: {},
    create: {
      userId: therapist1.id,
      bio: 'Licensed clinical psychologist with 8+ years of experience specializing in anxiety, depression, and trauma. Passionate about making mental health care accessible and culturally sensitive.',
      specialties: ['anxiety', 'depression', 'trauma', 'stress management'],
      languages: ['English', 'Igbo', 'Yoruba'],
      qualifications: 'Ph.D. in Clinical Psychology, University of Lagos. Licensed by the Nigerian Psychology Board.',
      verified: true,
      availability: {
        monday: ['09:00-12:00', '14:00-17:00'],
        tuesday: ['09:00-12:00', '14:00-17:00'],
        wednesday: ['09:00-12:00'],
        thursday: ['09:00-12:00', '14:00-17:00'],
        friday: ['09:00-12:00', '14:00-16:00'],
      },
      hourlyRate: 25.0,
    },
  })
  console.log('Therapist 1 created:', therapist1.alias)

  const therapist2Password = await bcrypt.hash('therapist123', 10)
  const therapist2 = await prisma.user.upsert({
    where: { email: 'therapist2@safespace.com' },
    update: {},
    create: {
      email: 'therapist2@safespace.com',
      password: therapist2Password,
      alias: 'Dr. Kwame Mensah',
      avatar: 'avatar6',
      role: 'therapist',
    },
  })

  await prisma.therapistProfile.upsert({
    where: { userId: therapist2.id },
    update: {},
    create: {
      userId: therapist2.id,
      bio: 'Compassionate therapist specializing in relationship counseling, life transitions, and LGBTQ+ affirmative therapy. Creating safe spaces for healing and growth.',
      specialties: ['relationship counseling', 'life transitions', 'LGBTQ+ support', 'self-esteem'],
      languages: ['English', 'Swahili', 'French'],
      qualifications: 'M.A. in Counseling Psychology, University of Nairobi. Certified Relationship Therapist.',
      verified: true,
      availability: {
        monday: ['10:00-13:00', '15:00-18:00'],
        tuesday: ['10:00-13:00', '15:00-18:00'],
        wednesday: ['10:00-13:00', '15:00-18:00'],
        thursday: ['10:00-13:00'],
        friday: ['10:00-13:00', '15:00-17:00'],
      },
      hourlyRate: 30.0,
    },
  })
  console.log('Therapist 2 created:', therapist2.alias)

  const therapist3Password = await bcrypt.hash('therapist123', 10)
  const therapist3 = await prisma.user.upsert({
    where: { email: 'therapist3@safespace.com' },
    update: {},
    create: {
      email: 'therapist3@safespace.com',
      password: therapist3Password,
      alias: 'Dr. Zara Hassan',
      avatar: 'avatar7',
      role: 'therapist',
    },
  })

  await prisma.therapistProfile.upsert({
    where: { userId: therapist3.id },
    update: {},
    create: {
      userId: therapist3.id,
      bio: 'Trauma-informed therapist with expertise in PTSD, complex trauma, and grief counseling. Using evidence-based approaches to support your healing journey.',
      specialties: ['PTSD', 'trauma', 'grief counseling', 'mindfulness'],
      languages: ['English', 'Kinyarwanda', 'French'],
      qualifications: 'M.S. in Clinical Mental Health, Kigali Health Institute. Certified EMDR Therapist.',
      verified: true,
      availability: {
        monday: ['08:00-12:00', '13:00-16:00'],
        tuesday: ['08:00-12:00', '13:00-16:00'],
        wednesday: ['08:00-12:00'],
        thursday: ['08:00-12:00', '13:00-16:00'],
        friday: ['08:00-12:00', '13:00-15:00'],
      },
      hourlyRate: 28.0,
    },
  })
  console.log('Therapist 3 created:', therapist3.alias)

  // PHQ-9 Assessment (Depression Screening)
  const phq9 = await prisma.assessment.upsert({
    where: { id: 'phq9-assessment' },
    update: {},
    create: {
      id: 'phq9-assessment',
      type: 'PHQ9',
      title: 'PHQ-9 Depression Screening',
      description: 'The Patient Health Questionnaire-9 is a screening tool for depression. Over the last 2 weeks, how often have you been bothered by the following problems?',
      questions: [
        { id: 1, text: 'Little interest or pleasure in doing things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 2, text: 'Feeling down, depressed, or hopeless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 3, text: 'Trouble falling or staying asleep, or sleeping too much', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 4, text: 'Feeling tired or having little energy', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 5, text: 'Poor appetite or overeating', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 6, text: 'Feeling bad about yourself or that you are a failure', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 7, text: 'Trouble concentrating on things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 8, text: 'Moving or speaking slowly, or being fidgety or restless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 9, text: 'Thoughts of being better off dead or hurting yourself', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
      ],
    },
  })
  console.log('PHQ-9 Assessment created')

  // GAD-7 Assessment (Anxiety Screening)
  const gad7 = await prisma.assessment.upsert({
    where: { id: 'gad7-assessment' },
    update: {},
    create: {
      id: 'gad7-assessment',
      type: 'GAD7',
      title: 'GAD-7 Anxiety Screening',
      description: 'The Generalized Anxiety Disorder-7 is a screening tool for anxiety. Over the last 2 weeks, how often have you been bothered by the following problems?',
      questions: [
        { id: 1, text: 'Feeling nervous, anxious, or on edge', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 2, text: 'Not being able to stop or control worrying', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 3, text: 'Worrying too much about different things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 4, text: 'Trouble relaxing', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 5, text: 'Being so restless that it is hard to sit still', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 6, text: 'Becoming easily annoyed or irritable', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
        { id: 7, text: 'Feeling afraid, as if something awful might happen', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
      ],
    },
  })
  console.log('GAD-7 Assessment created')

  // Mood Check-in
  const moodCheckin = await prisma.assessment.upsert({
    where: { id: 'mood-checkin' },
    update: {},
    create: {
      id: 'mood-checkin',
      type: 'MOOD_CHECKIN',
      title: 'Weekly Mood Check-in',
      description: 'A quick check-in to track how you\'re feeling this week.',
      questions: [
        { id: 1, text: 'How would you rate your overall mood this week?', type: 'scale', min: 1, max: 10, labels: { 1: 'Very Low', 5: 'Neutral', 10: 'Great' } },
        { id: 2, text: 'How has your energy level been?', type: 'scale', min: 1, max: 10, labels: { 1: 'Very Low', 5: 'Moderate', 10: 'Very High' } },
        { id: 3, text: 'How well have you been sleeping?', type: 'scale', min: 1, max: 10, labels: { 1: 'Very Poor', 5: 'Okay', 10: 'Excellent' } },
      ],
    },
  })
  console.log('Mood Check-in created')

  // Sample Referrals - Nigeria
  const nigeriaReferrals = [
    {
      name: 'Mental Health Foundation Nigeria',
      type: 'clinic',
      country: 'Nigeria',
      city: 'Lagos',
      address: '12 Admiralty Way, Lekki Phase 1, Lagos',
      phone: '+234 1 234 5678',
      email: 'info@mhfnigeria.org',
      website: 'https://mhfnigeria.org',
      specialties: ['depression', 'anxiety', 'trauma', 'addiction'],
      costRange: 'low-cost',
      languages: ['English', 'Yoruba', 'Igbo', 'Hausa'],
      description: 'Comprehensive mental health services with trained psychologists and psychiatrists. Sliding scale fees available.',
    },
    {
      name: 'Dr. Adaeze Okonkwo',
      type: 'psychologist',
      country: 'Nigeria',
      city: 'Abuja',
      phone: '+234 803 456 7890',
      email: 'dr.okonkwo@gmail.com',
      specialties: ['anxiety', 'depression', 'relationship counseling'],
      costRange: 'standard',
      languages: ['English', 'Igbo'],
      description: 'Licensed clinical psychologist specializing in cognitive behavioral therapy.',
    },
  ]

  // Sample Referrals - Kenya
  const kenyaReferrals = [
    {
      name: 'Nairobi Mental Wellness Center',
      type: 'clinic',
      country: 'Kenya',
      city: 'Nairobi',
      address: 'Westlands, Nairobi',
      phone: '+254 20 123 4567',
      email: 'contact@nairobiwellness.co.ke',
      website: 'https://nairobiwellness.co.ke',
      specialties: ['depression', 'anxiety', 'PTSD', 'stress management'],
      costRange: 'standard',
      languages: ['English', 'Swahili'],
      description: 'Modern mental health facility with experienced therapists and counselors.',
    },
    {
      name: 'Befrienders Kenya (Free Helpline)',
      type: 'counselor',
      country: 'Kenya',
      city: 'Nairobi',
      phone: '+254 722 178 177',
      email: 'info@befrienderskenya.org',
      website: 'https://befrienderskenya.org',
      specialties: ['crisis intervention', 'emotional support', 'suicide prevention'],
      costRange: 'free',
      languages: ['English', 'Swahili'],
      description: 'Free 24/7 emotional support helpline staffed by trained volunteers.',
    },
  ]

  // Sample Referrals - Rwanda
  const rwandaReferrals = [
    {
      name: 'Rwanda Mental Health Care',
      type: 'clinic',
      country: 'Rwanda',
      city: 'Kigali',
      address: 'KN 3 Ave, Kigali',
      phone: '+250 788 123 456',
      email: 'info@rwandamentalhealth.rw',
      specialties: ['trauma', 'PTSD', 'depression', 'anxiety'],
      costRange: 'low-cost',
      languages: ['English', 'Kinyarwanda', 'French'],
      description: 'Specialized trauma-informed care with culturally sensitive approaches.',
    },
  ]

  // Sample Referrals - South Africa
  const southAfricaReferrals = [
    {
      name: 'South African Depression and Anxiety Group (SADAG)',
      type: 'clinic',
      country: 'South Africa',
      city: 'Johannesburg',
      address: 'PO Box 652548, Benmore 2010',
      phone: '+27 11 234 4837',
      email: 'help@sadag.org',
      website: 'https://www.sadag.org',
      specialties: ['depression', 'anxiety', 'bipolar', 'OCD', 'panic attacks'],
      costRange: 'free',
      languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa'],
      description: 'Leading mental health organization offering free support groups and helplines.',
    },
    {
      name: 'Dr. Thandiwe Nkosi',
      type: 'psychiatrist',
      country: 'South Africa',
      city: 'Cape Town',
      phone: '+27 21 456 7890',
      email: 'dr.nkosi@capetown.health',
      specialties: ['medication management', 'depression', 'bipolar disorder'],
      costRange: 'standard',
      languages: ['English', 'Xhosa', 'Afrikaans'],
      description: 'Board-certified psychiatrist with 15 years of experience.',
    },
  ]

  const allReferrals = [...nigeriaReferrals, ...kenyaReferrals, ...rwandaReferrals, ...southAfricaReferrals]
  
  for (const referral of allReferrals) {
    await prisma.referral.create({ data: referral })
  }
  console.log(`Created ${allReferrals.length} referral listings`)

  // Scheduled Group Sessions
  const now = new Date()
  const groupSessions = [
    {
      title: 'Anxiety Support Group',
      description: 'A safe space to share experiences and coping strategies for anxiety.',
      topic: 'anxiety',
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      duration: 60,
      maxCapacity: 10,
      guidelines: 'Be respectful. Listen actively. Share if you\'re comfortable. Everything shared here stays here. No judgment.',
    },
    {
      title: 'Depression Support Circle',
      description: 'Connect with others who understand what you\'re going through.',
      topic: 'depression',
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
      maxCapacity: 10,
      guidelines: 'Be kind. Share your truth. Support each other. Confidentiality is key.',
    },
    {
      title: 'Stress Management Workshop',
      description: 'Learn and practice stress reduction techniques together.',
      topic: 'stress',
      scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 90,
      maxCapacity: 15,
      guidelines: 'Participate actively. Try new techniques. Be open-minded. Support your peers.',
    },
    {
      title: 'Trauma Recovery Group',
      description: 'A supportive environment for those healing from trauma.',
      topic: 'trauma',
      scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 90,
      maxCapacity: 8,
      guidelines: 'Share at your own pace. Respect boundaries. Practice self-care. Trigger warnings appreciated.',
    },
    {
      title: 'Daily Mindfulness Session',
      description: 'Start your day with guided mindfulness and meditation.',
      topic: 'mindfulness',
      scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      duration: 30,
      maxCapacity: 20,
      guidelines: 'Find a quiet space. Be present. No pressure to share. Just breathe.',
    },
  ]

  for (const session of groupSessions) {
    await prisma.groupSession.create({ data: session })
  }
  console.log(`Created ${groupSessions.length} group sessions`)

  // Create sample therapy bookings for test user
  const bookings = [
    {
      clientId: testUser.id,
      therapistId: therapist1.id,
      sessionType: 'chat',
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 2 days from now, 10am
      duration: 50,
      status: 'scheduled',
      clientNotes: 'First session - feeling anxious about work and relationships.',
    },
    {
      clientId: testUser.id,
      therapistId: therapist2.id,
      sessionType: 'video',
      scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 5 days from now, 3pm
      duration: 50,
      status: 'scheduled',
      clientNotes: 'Want to work on communication skills.',
    },
    {
      clientId: testUser.id,
      therapistId: therapist1.id,
      sessionType: 'chat',
      scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (completed)
      duration: 50,
      status: 'completed',
      notes: 'Client showed good progress with anxiety management techniques. Recommended daily mindfulness practice.',
      rating: 5,
      feedback: 'Dr. Okafor was very understanding and provided helpful coping strategies.',
    },
  ]

  for (const booking of bookings) {
    await prisma.therapyBooking.create({ data: booking })
  }
  console.log(`Created ${bookings.length} therapy bookings`)

  // Create sample notifications for test user
  const notifications = [
    {
      userId: testUser.id,
      type: 'booking_confirmed',
      title: 'Therapy Session Confirmed',
      message: `Your session with ${therapist1.alias} has been confirmed for ${new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toLocaleDateString()}.`,
      actionUrl: '/therapy',
      read: false,
    },
    {
      userId: testUser.id,
      type: 'session_reminder',
      title: 'Group Session Starting Soon',
      message: 'Your "Daily Mindfulness Session" starts in 24 hours. Join us for guided meditation.',
      actionUrl: '/group-sessions',
      read: false,
    },
    {
      userId: testUser.id,
      type: 'assessment_reminder',
      title: 'Weekly Check-in Due',
      message: 'It\'s been a week since your last mood check-in. Take a moment to reflect on how you\'re feeling.',
      actionUrl: '/assessments',
      read: false,
    },
  ]

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification })
  }
  console.log(`Created ${notifications.length} notifications`)

  // Create educational content
  const educationalContent = [
    {
      title: 'Understanding Anxiety: What It Is and How to Manage It',
      slug: 'understanding-anxiety',
      category: 'anxiety',
      description: 'Learn about anxiety, its symptoms, and practical strategies to manage it in your daily life.',
      content: `# Understanding Anxiety

Anxiety is a natural human emotion that everyone experiences from time to time. It's your body's way of responding to stress or perceived threats. However, when anxiety becomes persistent and overwhelming, it can interfere with your daily life.

## What is Anxiety?

Anxiety is characterized by feelings of worry, nervousness, or unease about something with an uncertain outcome. It can manifest in various ways:

- Racing thoughts
- Restlessness or feeling on edge
- Difficulty concentrating
- Muscle tension
- Sleep disturbances
- Rapid heartbeat

## Common Types of Anxiety

1. **Generalized Anxiety Disorder (GAD)**: Persistent worry about various aspects of life
2. **Social Anxiety**: Fear of social situations and judgment
3. **Panic Disorder**: Sudden episodes of intense fear
4. **Specific Phobias**: Fear of particular objects or situations

## Managing Anxiety: Practical Strategies

### 1. Deep Breathing Exercises
Practice the 4-7-8 technique:
- Breathe in for 4 counts
- Hold for 7 counts
- Exhale for 8 counts

### 2. Progressive Muscle Relaxation
Systematically tense and relax different muscle groups in your body.

### 3. Mindfulness and Meditation
Stay present in the moment rather than worrying about the future.

### 4. Regular Exercise
Physical activity releases endorphins and reduces stress hormones.

### 5. Healthy Sleep Habits
Maintain a consistent sleep schedule and create a relaxing bedtime routine.

### 6. Limit Caffeine and Alcohol
Both can trigger or worsen anxiety symptoms.

## When to Seek Professional Help

If anxiety is:
- Persistent and overwhelming
- Interfering with your work, relationships, or daily activities
- Causing physical symptoms
- Leading to avoidance behaviors

Consider reaching out to a mental health professional. Treatment options like therapy and medication can be highly effective.

## Remember

Anxiety is treatable, and you don't have to face it alone. Take small steps each day toward managing your anxiety, and be patient with yourself.`,
      contentType: 'article',
      difficulty: 'beginner',
      duration: 8,
      tags: ['anxiety', 'coping strategies', 'self-help', 'mental health basics'],
      author: 'SafeSpace Mental Health Team',
      published: true,
      featured: true,
    },
    {
      title: 'Depression: Recognizing the Signs and Finding Support',
      slug: 'recognizing-depression',
      category: 'depression',
      description: 'Understand depression symptoms and learn about effective ways to cope and seek support.',
      content: `# Depression: Recognizing the Signs and Finding Support

Depression is more than just feeling sad or going through a rough patch. It's a serious mental health condition that affects how you think, feel, and handle daily activities.

## What is Depression?

Depression (major depressive disorder) is a common and serious medical illness that negatively affects how you feel, think, and act. It causes feelings of sadness and/or a loss of interest in activities you once enjoyed.

## Common Signs and Symptoms

### Emotional Symptoms:
- Persistent sad, anxious, or "empty" mood
- Feelings of hopelessness or pessimism
- Irritability
- Feelings of guilt, worthlessness, or helplessness

### Physical Symptoms:
- Fatigue or decreased energy
- Changes in appetite or weight
- Sleep disturbances (insomnia or oversleeping)
- Physical aches and pains

### Behavioral Symptoms:
- Loss of interest in hobbies or activities
- Withdrawal from friends and family
- Difficulty concentrating or making decisions
- In severe cases, thoughts of death or suicide

## Understanding the Causes

Depression doesn't have a single cause. It can result from:
- Biological differences in brain chemistry
- Hormonal changes
- Genetic factors
- Life events and trauma
- Chronic stress

## Coping Strategies

### 1. Establish a Routine
Structure your day with regular times for waking, eating, activities, and sleeping.

### 2. Set Realistic Goals
Break large tasks into smaller, manageable ones. Celebrate small victories.

### 3. Stay Connected
Reach out to supportive friends and family. Social connection is vital.

### 4. Exercise Regularly
Even a short walk can boost your mood and energy.

### 5. Practice Self-Compassion
Be kind to yourself. Depression is not a personal failing.

### 6. Limit Alcohol and Avoid Drugs
These can worsen depression symptoms.

## Treatment Options

Depression is highly treatable. Common treatments include:

### Psychotherapy
- Cognitive Behavioral Therapy (CBT)
- Interpersonal Therapy
- Problem-solving therapy

### Medication
Antidepressants can help regulate brain chemistry. Consult with a healthcare provider.

### Lifestyle Changes
Regular exercise, healthy eating, and good sleep habits support recovery.

## When to Seek Help Immediately

If you or someone you know is experiencing:
- Thoughts of suicide
- Self-harm behaviors
- Inability to care for oneself

**Call emergency services or a crisis helpline immediately.**

## Remember

Depression is not a weakness, and you are not alone. With proper treatment and support, you can recover and feel better. Reaching out for help is a sign of strength.`,
      contentType: 'article',
      difficulty: 'beginner',
      duration: 10,
      tags: ['depression', 'mental health', 'treatment', 'support'],
      author: 'SafeSpace Mental Health Team',
      published: true,
      featured: true,
    },
    {
      title: '5-Minute Stress Relief: Quick Techniques for Busy Days',
      slug: 'quick-stress-relief',
      category: 'stress',
      description: 'Fast and effective stress management techniques you can use anywhere, anytime.',
      content: `# 5-Minute Stress Relief: Quick Techniques for Busy Days

Feeling overwhelmed? These quick stress-relief techniques can help you reset and refocus in just 5 minutes or less.

## 1. Box Breathing (2 minutes)

A powerful technique used by Navy SEALs to stay calm under pressure.

**How to do it:**
1. Breathe in for 4 counts
2. Hold for 4 counts
3. Breathe out for 4 counts
4. Hold for 4 counts
5. Repeat 4-5 times

## 2. Body Scan (3 minutes)

Quickly release physical tension throughout your body.

**Steps:**
1. Close your eyes
2. Notice tension in your forehead - relax it
3. Move down to your jaw - unclench it
4. Drop your shoulders
5. Release tension in your hands
6. Wiggle your toes and relax your feet

## 3. 5-4-3-2-1 Grounding (2 minutes)

Bring yourself back to the present moment.

**Identify:**
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

## 4. Progressive Muscle Relaxation (4 minutes)

Systematically tense and release muscle groups.

**Process:**
1. Tense your fists - hold for 5 seconds - release
2. Tense your arms - hold - release
3. Shrug your shoulders - hold - release
4. Squeeze your core - hold - release
5. Tense your legs - hold - release

## 5. Visualization (3 minutes)

Transport yourself to a calm place mentally.

**Try this:**
- Close your eyes
- Imagine a peaceful place (beach, forest, mountain)
- Engage all your senses in the visualization
- Notice the colors, sounds, smells
- Feel the calmness washing over you

## 6. Quick Walk (5 minutes)

Movement is medicine for stress.

- Step outside if possible
- Walk briskly for 5 minutes
- Focus on your surroundings
- Notice your breathing
- Feel the ground beneath your feet

## 7. Gratitude Reset (2 minutes)

Shift your focus to the positive.

**Think of:**
- 3 things you're grateful for today
- 2 people who support you
- 1 thing that made you smile

## Tips for Success

- **Set reminders**: Schedule stress-relief breaks throughout your day
- **Keep it simple**: Start with one technique and practice regularly
- **Be consistent**: The more you practice, the more effective these become
- **Combine techniques**: Mix and match based on your needs

## When Stress Becomes Overwhelming

If you notice:
- Stress affecting your daily functioning
- Physical symptoms (headaches, stomach issues, fatigue)
- Difficulty sleeping or concentrating
- Feeling constantly overwhelmed

Consider reaching out to a mental health professional. Chronic stress needs proper attention and support.

## Remember

Taking 5 minutes for yourself is not selfish - it's essential self-care. You deserve moments of calm in your busy day.`,
      contentType: 'article',
      difficulty: 'beginner',
      duration: 7,
      tags: ['stress management', 'quick relief', 'breathing exercises', 'mindfulness'],
      author: 'SafeSpace Mental Health Team',
      published: true,
      featured: true,
    },
    {
      title: 'Building Healthy Coping Mechanisms',
      slug: 'healthy-coping-mechanisms',
      category: 'coping-skills',
      description: 'Develop positive coping strategies to deal with life\'s challenges and emotional difficulties.',
      content: `# Building Healthy Coping Mechanisms

Life throws challenges our way, and how we cope with them significantly impacts our mental health and well-being. Let's explore healthy coping mechanisms that can help you navigate difficult times.

## What Are Coping Mechanisms?

Coping mechanisms are the strategies and behaviors we use to deal with stress, difficult emotions, or challenging situations. They can be healthy (adaptive) or unhealthy (maladaptive).

## Healthy vs. Unhealthy Coping

### Healthy Coping:
- Addresses problems constructively
- Provides long-term relief
- Supports overall well-being
- Doesn't harm self or others

### Unhealthy Coping:
- Provides temporary relief but long-term harm
- Avoids addressing the real problem
- Can become addictive or damaging
- Examples: substance abuse, self-harm, excessive avoidance

## Building Your Coping Toolkit

### 1. Emotional Coping Strategies

**Journaling**
- Write about your feelings
- Track patterns and triggers
- Express thoughts you can't say aloud

**Talking it Out**
- Connect with trusted friends or family
- Join support groups
- Seek professional counseling

**Creative Expression**
- Art, music, or dance
- Write poetry or stories
- Engage in crafts or DIY projects

### 2. Physical Coping Strategies

**Exercise**
- Releases endorphins
- Reduces stress hormones
- Improves sleep and mood

**Yoga or Tai Chi**
- Combines movement with mindfulness
- Reduces anxiety
- Improves body awareness

**Deep Breathing**
- Activates relaxation response
- Can be done anywhere
- Immediate calming effect

### 3. Social Coping Strategies

**Reach Out**
- Don't isolate yourself
- Call a friend
- Join community activities

**Set Boundaries**
- Learn to say no
- Protect your energy
- Prioritize supportive relationships

**Volunteer**
- Helps others while helping yourself
- Creates sense of purpose
- Builds community connections

### 4. Cognitive Coping Strategies

**Positive Self-Talk**
- Challenge negative thoughts
- Practice self-compassion
- Use affirmations

**Problem-Solving**
- Break problems into manageable steps
- Brainstorm solutions
- Take action on what you can control

**Perspective-Taking**
- Ask: "Will this matter in 5 years?"
- Consider alternative viewpoints
- Practice acceptance of what you can't change

### 5. Spiritual/Meaning-Based Coping

**Meditation**
- Cultivates inner peace
- Reduces reactivity
- Increases self-awareness

**Prayer or Spiritual Practice**
- Provides comfort and hope
- Connects to something greater
- Offers community support

**Gratitude Practice**
- Shifts focus to positives
- Improves mood and resilience
- Strengthens relationships

## Creating Your Personal Coping Plan

### Step 1: Identify Your Triggers
What situations, people, or thoughts cause you stress?

### Step 2: Assess Your Current Coping
What do you do now? What works? What doesn't?

### Step 3: Choose New Strategies
Select 3-5 healthy coping mechanisms to try.

### Step 4: Practice Regularly
Don't wait for a crisis - build these skills now.

### Step 5: Evaluate and Adjust
What's working? What needs to change?

## Common Barriers and Solutions

### "I don't have time"
- Start with 5-minute practices
- Build gradually
- Remember: self-care is not selfish

### "Nothing works for me"
- Try multiple strategies
- Be patient - skills take time to develop
- Consider professional support

### "I feel guilty taking time for myself"
- Reframe self-care as necessary, not indulgent
- You can't pour from an empty cup
- Taking care of yourself helps you care for others

## Red Flags: When to Seek Professional Help

If you're:
- Using harmful coping methods (substance abuse, self-harm)
- Feeling overwhelmed despite trying healthy coping
- Experiencing suicidal thoughts
- Unable to function in daily life

**Reach out to a mental health professional immediately.**

## Remember

Building healthy coping mechanisms is a journey, not a destination. Be patient with yourself, celebrate progress, and don't hesitate to ask for help when you need it.

Your mental health matters, and you deserve support.`,
      contentType: 'article',
      difficulty: 'intermediate',
      duration: 12,
      tags: ['coping skills', 'resilience', 'self-care', 'mental wellness'],
      author: 'SafeSpace Mental Health Team',
      published: true,
      featured: false,
    },
    {
      title: 'The Importance of Sleep for Mental Health',
      slug: 'sleep-mental-health',
      category: 'sleep',
      description: 'Discover the powerful connection between quality sleep and mental well-being, plus tips for better rest.',
      content: `# The Importance of Sleep for Mental Health

Sleep isn't just about rest - it's fundamental to your mental health and emotional well-being. Let's explore why sleep matters and how to improve your sleep quality.

## The Sleep-Mental Health Connection

### How Sleep Affects Mental Health:

**Emotional Regulation**
- Poor sleep makes it harder to manage emotions
- Increases irritability and mood swings
- Reduces ability to cope with stress

**Cognitive Function**
- Impairs memory and concentration
- Affects decision-making
- Reduces problem-solving abilities

**Mental Health Disorders**
- Sleep problems increase risk of depression and anxiety
- Can trigger episodes in bipolar disorder
- Worsen symptoms of existing conditions

## How Much Sleep Do You Need?

**Adults**: 7-9 hours per night
**Teenagers**: 8-10 hours per night
**Older adults**: 7-8 hours per night

Quality matters as much as quantity!

## Signs of Poor Sleep Quality

- Difficulty falling asleep (taking more than 30 minutes)
- Waking frequently during the night
- Waking too early and can't fall back asleep
- Not feeling refreshed in the morning
- Daytime fatigue and sleepiness
- Needing caffeine to function

## Building Better Sleep Habits

### 1. Create a Sleep Schedule

**Do:**
- Go to bed and wake up at the same time daily
- Yes, even on weekends!
- Allow time to wind down before bed

**Don't:**
- Vary your sleep schedule wildly
- Force yourself to stay awake or sleep in

### 2. Optimize Your Sleep Environment

**Temperature**: Cool (60-67°F / 15-19°C)
**Light**: Dark (use blackout curtains or eye mask)
**Sound**: Quiet (use earplugs or white noise if needed)
**Comfort**: Supportive mattress and pillow

### 3. Develop a Bedtime Routine

**60 minutes before bed:**
- Dim the lights
- Put away screens
- Do relaxing activities (reading, gentle stretching, bath)

**30 minutes before bed:**
- Practice relaxation techniques
- Write in a journal
- Listen to calm music

**At bedtime:**
- Keep the routine consistent
- Go to bed when sleepy, not just tired

### 4. Mind Your Diet

**Do:**
- Avoid caffeine 6+ hours before bed
- Limit alcohol (disrupts sleep quality)
- Have a light snack if hungry
- Stay hydrated (but not too close to bedtime)

**Don't:**
- Eat heavy meals within 3 hours of bedtime
- Drink too many fluids before bed

### 5. Exercise Smart

**Benefits:**
- Regular exercise improves sleep quality
- Reduces time to fall asleep
- Deepens sleep

**Timing:**
- Best: Morning or early afternoon
- Avoid: Vigorous exercise 3 hours before bed
- Gentle stretching is okay before bed

### 6. Manage Stress and Worry

**If your mind races at night:**
- Keep a "worry journal" - write concerns before bed
- Practice the "10-10 rule": if it won't matter in 10 years, don't spend more than 10 minutes worrying
- Try progressive muscle relaxation
- Use guided sleep meditations

### 7. Limit Screen Time

**Why?**
- Blue light suppresses melatonin (sleep hormone)
- Content can be stimulating
- Disrupts circadian rhythm

**Solutions:**
- No screens 1 hour before bed
- Use blue light filters if you must use devices
- Keep phones out of the bedroom

### 8. Don't Force It

**If you can't sleep after 20 minutes:**
1. Get up and leave the bedroom
2. Do something calming and boring
3. Return to bed when sleepy
4. Repeat if necessary

**Don't:**
- Lie in bed frustrated
- Watch the clock
- Try too hard to sleep

## When Sleep Problems Persist

### Consider Professional Help If:
- Sleep problems last more than a month
- They interfere with daily life
- You suspect sleep apnea (loud snoring, gasping)
- You have restless legs or limb movements
- You're experiencing insomnia despite good sleep hygiene

### Treatment Options:
- Cognitive Behavioral Therapy for Insomnia (CBT-I)
- Sleep studies
- Medical evaluation
- Addressing underlying mental health conditions

## The Power of Consistency

Remember:
- Changes take time (2-4 weeks to see improvements)
- Be patient with yourself
- Small consistent changes are better than dramatic ones
- Sleep hygiene works best when practiced regularly

## Take Action Today

Choose 2-3 sleep hygiene practices to start:
1. Set a consistent bedtime
2. Create a relaxing bedtime routine
3. Optimize your sleep environment

Track your sleep and notice improvements over time.

## Remember

Quality sleep is not a luxury - it's a necessity for your mental health. Prioritizing sleep is one of the most powerful things you can do for your well-being.

Sweet dreams! 🌙`,
      contentType: 'article',
      difficulty: 'beginner',
      duration: 10,
      tags: ['sleep', 'self-care', 'mental health', 'wellness'],
      author: 'SafeSpace Mental Health Team',
      published: true,
      featured: false,
    },
    {
      title: 'Mindfulness for Beginners: A Practical Guide',
      slug: 'mindfulness-beginners-guide',
      category: 'coping-skills',
      description: 'Learn the basics of mindfulness practice and how to incorporate it into your daily life.',
      content: `# Mindfulness for Beginners: A Practical Guide

Mindfulness is the practice of being fully present and engaged in the current moment. It's a powerful tool for reducing stress, improving focus, and enhancing overall well-being.

## What is Mindfulness?

Mindfulness means paying attention to the present moment without judgment. It's about:
- Being aware of your thoughts, feelings, and sensations
- Accepting them without trying to change them
- Staying focused on the here and now

### Mindfulness is NOT:
- Emptying your mind
- Stopping your thoughts
- Being relaxed all the time
- A religious practice (though it has roots in Buddhism)

## Benefits of Mindfulness

**Mental Health:**
- Reduces anxiety and depression
- Decreases rumination
- Improves emotional regulation
- Enhances self-awareness

**Physical Health:**
- Lowers blood pressure
- Reduces chronic pain
- Improves sleep
- Boosts immune function

**Daily Life:**
- Better focus and concentration
- Improved relationships
- Enhanced decision-making
- Greater life satisfaction

## Simple Mindfulness Exercises

### 1. Mindful Breathing (5 minutes)

**Steps:**
1. Find a comfortable seated position
2. Close your eyes or soften your gaze
3. Notice your breath naturally
4. Count 10 breaths (in and out = 1)
5. When your mind wanders, gently return to the breath
6. No judgment - wandering is normal!

### 2. Body Scan (10 minutes)

**Process:**
1. Lie down comfortably
2. Start at your toes
3. Notice sensations without changing them
4. Move slowly up through your body
5. End at the top of your head
6. If you fall asleep, that's okay!

### 3. Mindful Eating (During a meal)

**Try this:**
- Look at your food before eating
- Notice colors, shapes, and textures
- Smell the aroma
- Take small bites
- Chew slowly, noticing flavors and textures
- Put down utensils between bites

### 4. Walking Meditation (10 minutes)

**How to:**
- Walk slowly and deliberately
- Notice each foot lifting, moving, and placing
- Feel the ground beneath your feet
- Notice your body's movement
- If your mind wanders, return to the sensations of walking

### 5. Five Senses Exercise (2 minutes)

**Quick grounding:**
- Notice 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

## Bringing Mindfulness to Daily Activities

You don't need special time for mindfulness. Practice during:

**Morning Routine:**
- Mindful brushing teeth
- Feeling the water in the shower
- Noticing the taste of breakfast

**At Work:**
- Mindful breathing between tasks
- Noticing your posture
- Taking mindful breaks

**Evening:**
- Mindful cooking or eating
- Gentle stretching
- Gratitude practice before bed

## Common Challenges and Solutions

### Challenge: "My mind won't stop wandering"
**Solution:** That's completely normal! The practice is noticing when it wanders and gently bringing it back. You're not failing - this IS the practice.

### Challenge: "I don't have time"
**Solution:** Start with 1-2 minutes. Mindfulness can happen during activities you already do. Quality over quantity.

### Challenge: "I feel restless sitting still"
**Solution:** Try movement-based practices like walking meditation or mindful yoga. You don't have to sit still.

### Challenge: "Nothing is happening"
**Solution:** Mindfulness is subtle. The benefits accumulate over time. Keep practicing without expectation.

### Challenge: "I fall asleep"
**Solution:** This is common with body scans. Try practicing at a more alert time or in a seated position.

## Building a Sustainable Practice

### Start Small
- Begin with 2-5 minutes daily
- Gradually increase as it becomes habit
- Consistency matters more than duration

### Pick a Time
- Same time each day
- Link to an existing habit
- Morning or evening often work well

### Create Space
- Find a quiet spot
- Make it inviting
- Keep it simple

### Use Support
- Guided meditation apps
- Join a meditation group
- Take a class or workshop

### Be Patient
- Benefits develop over time
- Some days will be easier than others
- There's no "perfect" practice

## Mindfulness Apps and Resources

**Free Resources:**
- Insight Timer (large library of free meditations)
- UCLA Mindful App
- YouTube guided meditations

**Paid Options:**
- Headspace
- Calm
- 10% Happier

## When to Practice Mindfulness

**Great times:**
- Morning (sets tone for the day)
- Before stressful situations
- During transitions
- When feeling overwhelmed
- Before bed (aids sleep)

**Anytime:** Remember, any moment can be a mindfulness moment!

## Signs Your Practice is Working

You might notice:
- Catching yourself before reacting
- More space between stimulus and response
- Greater awareness of thoughts and emotions
- Feeling more grounded
- Better sleep
- Improved relationships

## Remember

Mindfulness is a practice, not a perfect. Every time you bring your attention back to the present moment, you're succeeding. Be patient and kind with yourself.

Start today with just one mindful breath. That's all it takes to begin. 🧘`,
      contentType: 'article',
      difficulty: 'beginner',
      duration: 12,
      tags: ['mindfulness', 'meditation', 'stress relief', 'self-care'],
      author: 'SafeSpace Mental Health Team',
      published: true,
      featured: false,
    },
  ]

  for (const content of educationalContent) {
    await prisma.educationContent.upsert({
      where: { slug: content.slug },
      update: {},
      create: content,
    })
  }
  console.log(`Created ${educationalContent.length} educational articles`)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
