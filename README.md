# WEB - Your Personal Relationship Intelligence Platform

<div align="center">

**"ContACT" - All Social, No Media**

*A personal relationship CRM that works for you only — a private intelligence layer that surfaces what matters most in your network.*

[Figma Design](https://www.figma.com/design/rZf338aMhBXnv4sQBCuuHw/Web---Connection-App?node-id=161-19&t=c6wvv2li98RFywID-0)

</div>

---

## 🌟 Vision

**Web** exists to redefine connection in the digital age — building technology that enables authentic, joyful, and sustainable relationships.

Where platforms like Instagram give the illusion of connection by broadcasting curated moments, **Web** provides infrastructure for actual interaction, collaboration, and shared experience.

**Ultimate aspiration:** To make *"Add me on Web"* the new standard for forming meaningful connections — a phrase that signals intent to truly stay in touch, plan together, and build community.

---

## 📱 Core Philosophy

- **NOT social media:** No feeds, no followers, no likes
- **Active connection platform** focused on building community, not vanity metrics  
- **Proactive nudges** over reactive scrolling
- **Privacy-first** - all data stays private, controlled, and secure
- **Reduces friction** of staying in touch, planning activities, and sustaining meaningful ties

---

## 🎯 V1 - Core MVP Features

### 1. **Interactive Connection Web**
- **Visual relationship network** with dynamic graph view
- Your profile at center, connections radiating outward
- **Circular ring indicators** showing relationship health:
  - 🟢 Green full ring = strong connection
  - 🔴 Red partial ring = weak/fading connection
- **Multiple view modes:**
  - List view for quick scanning
  - Web view for visualizing network
  - Zoom/pan with pinch gestures
- **Smart categorization:**
  - By relationship type (family, friends, work, school)
  - By connection strength (1-5 scale)
  - By priority level (P1, P2, P3)

### 2. **Strength-Based Intelligence**
Connection strength is a **linear calculation (1-5)** based on:
- **When you last interacted** with them
- **Priority level** you've set (P1/P2/P3)
- **Visual indicators:**
  - 5: 🟢 Neon Green (excellent)
  - 4: 🟢 Green (good)
  - 3: 🟡 Yellow (neutral)
  - 2: 🟠 Orange (warning)
  - 1: 🔴 Red (needs attention)

**Priority Goals:**
- **P1** = Contact once a week (7 days)
- **P2** = Contact twice a month (14 days)  
- **P3** = Contact once a month (30 days)

### 3. **Silk AI Assistant** (The Chatbot)
- Trained on psychology of socialization and dopamine
- Can read your calendar + contacts
- **Incentivizes hangouts** and helps you connect
- Ask questions like:
  - *"Show me friends I haven't seen since graduation"*
  - *"Suggest a fun weekend plan for my college crew"*
  - *"Who needs attention this week?"*
- Search by name, filter by relationship + strength
- Surfaces insights about your network health

### 4. **Smart Reminders**
Proactive notifications for:
- **Strength drops** - when connections are fading
- **Birthdays** - never forget important dates
- **Weekly analysis** - relationship health summary
- **Haven't updated Silk** - prompts to log interactions
- **Meet-up reminders** - suggested check-ins

### 5. **Profile & Stats**
Track your social life with:
- **Total connections** count
- **Web health** score (overall network strength)
- **Needs attention** list (strength 1-2 connections)
- **Account setup** (name, email, profile picture)
- **Recent hangouts** timeline
- **Most active hangout friends**
- **# of hangouts** (week/month/year view)

---

## 📋 MVP V2 - Four Main Pages

### 1. **WEB View** (Home)
- Interactive network visualization
- ➕ Plus button to add new connections
- Color-coded by strength (always visible)
- **Categorize by dropdown:**
  - None (just you → all people directly)
  - Relationship type
  - Strength level
  - Priority level
- **Distance dropdown:**
  - None
  - By strength (closer = stronger)
  - By priority (closer = higher priority)
- **Filter checkboxes:**
  - Strength levels (1-5)
  - Priority levels (P1, P2, P3)
  - Relationship types

### 2. **SILK** (AI Assistant)
- 💬 Chat interface
- Search by name
- Filter (e.g., "unhealthy" + "family")
- Context-aware suggestions
- Memory of past conversations

### 3. **REMINDERS** (Notifications)
- Strength drop alerts
- Birthday reminders
- Weekly summary
- Nudges to update Silk
- Suggested check-ins

### 4. **PROFILE** (Your Stats)
- Total connections
- Web health score
- Needs attention list
- Account settings
- Basic account info (email, name, etc.)

---

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Supabase** for database & authentication
- PostgreSQL database
- Row Level Security (RLS) enabled
- Real-time subscriptions

### Mobile-First Design
- Optimized for **iPhone 16** (393x852)
- Touch gestures (pinch to zoom, swipe, drag)
- Responsive design
- PWA-ready

---

## 🎨 Design System

### Themes
Four beautiful themes to choose from:
- **Ocean:** Cool blues and teals 🌊
- **Sunset:** Warm oranges and reds 🌅
- **Forest:** Natural greens 🌲
- **Midnight:** Deep purples and dark mode 🌙

### Apple Glass Inspired UI
- Clean, journal-like aesthetic
- Soft colors, rounded edges
- Simple charts and visualizations
- Minimal, calming design

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/calebnewtonusc/webcalhacks25.git
   cd webcalhacks25
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   Run the SQL commands in the "Database Setup" section below

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## 🗄️ Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create connections table
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  relationship TEXT CHECK (relationship IN ('family', 'friend', 'colleague', 'mentor', 'acquaintance')) NOT NULL,
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  last_contact TIMESTAMPTZ DEFAULT NOW(),
  contact_frequency INTEGER DEFAULT 14,
  phone TEXT,
  email TEXT,
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  position_x REAL,
  position_y REAL,
  cluster TEXT,
  category TEXT,
  subcategory TEXT,
  communication_style TEXT CHECK (communication_style IN ('text', 'call', 'email', 'in-person')),
  proximity TEXT CHECK (proximity IN ('same-city', 'long-distance', 'international')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  shared_interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create interactions table
CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('call', 'text', 'email', 'meeting', 'social')) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  duration INTEGER,
  quality INTEGER CHECK (quality >= 1 AND quality <= 10),
  topics TEXT[] DEFAULT '{}',
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'difficult')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create silk_memories table
CREATE TABLE silk_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('conversation', 'interest', 'life_event', 'preference', 'goal', 'pattern')) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  tags TEXT[] DEFAULT '{}',
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE silk_memories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own connections" ON connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interactions" ON interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own memories" ON silk_memories
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_category ON connections(category);
CREATE INDEX idx_connections_health_score ON connections(health_score);
CREATE INDEX idx_interactions_connection_id ON interactions(connection_id);
CREATE INDEX idx_interactions_date ON interactions(date);
CREATE INDEX idx_silk_memories_connection_id ON silk_memories(connection_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_connections_updated_at 
  BEFORE UPDATE ON connections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🎮 User Flow

### Onboarding Experience
1. **Import contacts** (phone + email + manual entry)
2. **Smart tagging prompt:** App suggests categories (Family, Friends, New, Mentors)
3. **Drag-and-drop sorting** into 3 priority levels:
   - **P1:** Closest people in your life (weekly contact)
   - **P2:** People you want to get closer to (bi-weekly)
   - **P3:** People to maintain over time (monthly)
4. **Calendar & Gmail/Outlook sync** for birthdays and recent interactions

### Daily Use
1. **View your web** - visualize your network
2. **Get proactive nudges** - "Reach out to Sarah, her birthday is in 2 days"
3. **Chat with Silk** - "Who needs attention this week?"
4. **Log interactions** - Quick actions: Call, Text, Email, Meet
5. **Track relationship health** - Color-coded strength indicators

---

## 🔮 Innovative Features

### 1. **Relationship Health Meter**
Tracks time since last touchpoint, gives a "warm/cold" status

### 2. **Memory Layer**
AI generates reminders like: *"Last time you spoke with John, he was preparing for his trip to Japan"*

### 3. **Quick Actions in Contact Details**
- **Call** → Opens phone dialer
- **Text** → Opens iMessage/SMS
- **Email** → Opens Gmail app
- **Meet** → Opens Google Calendar

### 4. **Life Events Timeline**
Track important dates: birthdays, anniversaries, job changes, graduations

### 5. **Network Visualization**
- Figjam-style whiteboard
- Zoom in/out with pinch gestures
- Drag/pan to navigate
- Toggle between list and web view

---

## 🎯 Development Goals

### Current Focus
- ✅ Basic front-end and backend
- ✅ Researching similar apps
- ✅ Train AI database
- ⏳ APIs for contacts, calendar, photos
- ⏳ Find animator for UI transitions
- ⏳ Project management & tracking

### Target Platforms
- **MVP:** Web app (React)
- **Future:** iOS native app (Swift/SwiftUI)
- **Tools:** Lovable, Cursor, Bolt, Xcode

---

## 🌐 White-Space Market Opportunities

### 1. **Executive / Advisor Management**
**Target:** Founders, executives, high-performers

**Features:**
- Advisor Tab with pending follow-ups
- Meeting Memory Timeline
- AI Commitment Tracker ("You promised to share X deck")
- Contextual Nudges before meetings
- Relationship Health Score
- Priority Ranking (top 5 to nurture)
- Advisor Portfolio Map

**Value:** Every exec has mentors/investors they should keep warm but forget

### 2. **Family & Personal Wellbeing**
**Target:** Families, extended family networks

**Features:**
- Family Health Dashboard (birthdays, anniversaries, milestones)
- Shared "Life Events Feed"
- Generational Memory Bank (living archive)
- Emotional Prompts ("Check in with Dad")
- Family Timeline (multi-decade events)
- "Circle of Care" Alerts
- Village Mode (community layer)

**Value:** Families rely on group chats; nothing tracks emotional touchpoints across generations

### 3. **Student & Early-Career Networks**
**Target:** College students, recent grads, young professionals

**Features:**
- Mentor Map with last touchpoint
- Identification of gaps in advisor network
- Scholarship & Internship Nudges tied to mentors
- Career Milestone Tracker
- Peer Accountability Nudges
- Opportunity Radar (LinkedIn/uni data)
- Campus Connection Heatmap

**Value:** Students struggle to maintain mentor/peer relationships that shape careers

### 4. **Org-Backed Engagement (B2B)**
**Target:** Companies, universities, accelerators

**Features:**
- Anonymous Engagement Analytics
- Retention Risk Alerts
- Cultural Health Index
- Mentorship Tracking
- Event Impact Analysis
- Custom Wellbeing Nudges
- Org Cohort Building

**Value:** Companies struggle with employee connection + retention; schools with disconnected communities

---

## 🚀 Product Roadmap

### Phase 1: Core Foundation ✅
- [x] Monorepo setup, CI/CD
- [x] MVP Connection Web with manual linking
- [x] Secure contact import and tagging
- [x] Basic UI/UX with themes

### Phase 2: Calendar + Cluster Planning ⏳
- [ ] Calendar integration (Google, iCloud)
- [ ] Event parsing for participants
- [ ] Cluster builder with manual inputs
- [ ] Connection Map auto-population

### Phase 3: AI-Powered Intelligence 🔮
- [ ] Silk AI assistant
- [ ] Natural language plan generation
- [ ] Smart reconnect suggestions
- [ ] Conversation starters
- [ ] Decay prediction engine

### Phase 4: Social Insights + Gamification 📊
- [ ] Heatmaps and trends
- [ ] Side quests & challenges
- [ ] Badge system
- [ ] Relationship goals tracker

### Phase 5: Smart Outputs 🎨
- [ ] Auto-generated slideshows
- [ ] Custom invites
- [ ] Friend bios
- [ ] Event summaries

### Phase 6: Privacy + Compliance 🔒
- [ ] Privacy dashboard
- [ ] Data export/deletion
- [ ] GDPR, CCPA, FERPA compliance
- [ ] Third-party audit

### Phase 7: Launch + Growth 🚀
- [ ] Closed beta
- [ ] App Store / Play Store
- [ ] Desktop app (Electron)
- [ ] Public launch

---

## 💡 Future Features

### AI & Smart Automation
- **Auto-Interaction Logging:** Sync with phone, calendar, email
- **AI Reconnect Suggestions:** Who to reach out to and when
- **Conversation Starters:** Based on past notes and interests
- **Smart Reminders:** AI-optimized timing + priority ranking

### Relationship Intelligence
- **Goals Tracker:** Set and track connection frequency goals
- **Decay Prediction Engine:** Alerts for high-priority fading connections
- **Deep Health Scoring:** Based on frequency, recency, sentiment

### Shared & Team Use Cases
- **Shared Contact Spaces:** Family/friend groups share relationship management
- **B2B CRM Mode:** For founders, salespeople, coaches

### Life Events Integration
- **Life Events Sync:** Birthdays, anniversaries, promotions from calendar
- **Auto-Birthday Tracker:** With gift suggestions based on engagement

### Monetization
- **Affiliate Integrations:** Gift/service suggestions → earn commission
- **Premium Tier:** Unlock AI features, syncing, analytics
- **White-Label for Orgs:** Schools, accelerators, alumni groups

---

## 🔒 Privacy & Security

- **No feeds, no followers, no likes**
- **End-to-end encryption** (AES-256 at rest, TLS in transit)
- **Local-first storage** with optional encrypted cloud sync
- **Granular permissions** for data sharing
- **Full data sovereignty:** export, delete, anonymize all data
- **Compliance:** GDPR, CCPA, FERPA ready
- **No social media scraping**
- **No message scanning**
- **No ads, no data reselling**

---

## 🎨 Design Philosophy

### UI Style
- Clean, journal-like (Notion + Apple Calendar inspired)
- Soft colors, rounded edges
- Simple charts and data visualizations
- Supportive, assistant-like tone

### Interaction
- Swiping tabs
- One-tap note-taking
- Push notifications with context
- Touch-optimized (44px minimum targets)

### Tone
- Less "social media," more "life guide"
- Proactive, not reactive
- Encouraging, not guilt-inducing

---

## 👥 Team

### Current Team
- **Joel** - Lead Developer
- **Samuel** - Developer
- **Rianna** - Developer
- **Ian** - Developer

---

## 📊 Success Metrics

### User Engagement
- Daily active users (DAU)
- Weekly check-ins completed
- Connections added per user
- Interactions logged per week

### Relationship Health
- Average network strength score
- % of connections at strength 4-5
- Reconnections made per month
- Reminders acted upon

### Retention
- 7-day retention rate
- 30-day retention rate
- Session frequency
- Time spent in app

---

## 🏆 Competitive Advantages

1. **Privacy-first:** No social graph harvesting
2. **Proactive nudges:** Shifts from scrolling → awareness
3. **Visualization-driven:** See your network health at a glance
4. **AI-powered:** Intelligent suggestions based on your behavior
5. **Mobile-native:** Built for on-the-go relationship management
6. **Not social media:** Private, personal, purposeful

---

## 📞 Contact & Contribution

### Repository
https://github.com/calebnewtonusc/webcalhacks25.git

### Figma Design
https://www.figma.com/design/rZf338aMhBXnv4sQBCuuHw/Web---Connection-App

### Contributing
Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Support
For support, open an issue on GitHub or contact the development team.

---

## 📄 License

MIT License - see LICENSE file for details.

---

<div align="center">

**Built with ❤️ for meaningful connections**

*Making "Add me on Web" the new standard for staying connected*

</div>
