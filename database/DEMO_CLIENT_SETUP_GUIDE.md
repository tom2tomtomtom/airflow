# 🎯 Add Demo Client to AIrWAVE Database

## 🚀 **Quick Setup - Add Demo Client Data**

I've created a comprehensive demo client with all related data so you can test the full functionality of your AIrWAVE platform.

---

## 📋 **What You'll Get:**

### **✅ Demo Client: "TechFlow Solutions"**
- **Industry**: Technology  
- **Description**: AI-powered business solutions company
- **Brand Colors**: Blue (#2563EB) & Red (#DC2626)
- **Complete Brand Guidelines**: Voice, tone, target audience, key messages
- **Social Media**: Twitter, LinkedIn, Facebook, Instagram

### **✅ 3 Client Contacts**
- **Sarah Chen** - Chief Marketing Officer (Primary Contact)
- **Michael Rodriguez** - Chief Executive Officer  
- **Emma Thompson** - Brand Manager

### **✅ Sample Campaign**
- **"Q1 2025 AI Innovation Campaign"**
- **Budget**: $250,000
- **Platforms**: LinkedIn, Google Ads, Industry Publications
- **Status**: Planning

### **✅ 3 Sample Assets**
- **Primary Logo** (PNG)
- **AI Technology Hero Image** (1200x600)
- **Brand Guidelines Document** (PDF)

### **✅ LinkedIn Template**
- **"LinkedIn Tech Announcement"** template
- **Professional design** for technology announcements

---

## 🗄️ **How to Add the Data:**

### **Step 1: Access Supabase SQL Editor**
1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your **AIrWAVE project**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### **Step 2: Run the SQL Script**
1. **Pull the latest changes**: `git pull origin main`
2. **Open the SQL file**: `database/add-demo-client.sql`
3. **Copy all the SQL** from the file
4. **Paste it** into the Supabase SQL Editor
5. **Click "RUN"** to execute

### **Step 3: Verify the Data**
The script includes verification queries at the end to confirm everything was added correctly.

---

## 🧪 **Alternative: Quick Test Client (Minimal)**

If you just want a simple client for testing, run this minimal SQL:

```sql
-- Quick Demo Client (Minimal Version)
INSERT INTO clients (
  name, slug, industry, description, website, 
  primary_color, secondary_color, is_active
) VALUES (
  'Demo Tech Corp',
  'demo-tech-corp', 
  'Technology',
  'A demo technology company for testing AIrWAVE functionality.',
  'https://demo-tech-corp.com',
  '#1976d2',
  '#dc004e', 
  true
);

-- Add a primary contact
INSERT INTO client_contacts (
  client_id, name, role, email, is_primary, is_active
) VALUES (
  (SELECT id FROM clients WHERE slug = 'demo-tech-corp'),
  'John Demo',
  'Marketing Manager', 
  'john@demo-tech-corp.com',
  true,
  true
);
```

---

## 🎯 **Test the Functionality:**

Once you've added the demo client, you can test:

### **1. Client Management**
- Go to `/clients` → Should see "TechFlow Solutions"
- Click on the client → View details and contacts
- Edit client information

### **2. Campaign Management** 
- Go to `/campaigns` → Should see "Q1 2025 AI Innovation Campaign"
- Create new campaigns for TechFlow Solutions
- Test campaign workflow

### **3. Asset Management**
- Go to `/assets` → Should see 3 demo assets
- Upload new assets for TechFlow Solutions
- Test asset categorization and search

### **4. Template Usage**
- Go to `/templates` → Should see "LinkedIn Tech Announcement"
- Test template selection and customization
- Generate content using the template

### **5. AI Content Generation**
- Use TechFlow's brand guidelines in AI prompts
- Test generating content that matches their voice and tone
- Generate social media posts using their brand colors

---

## 🔍 **Verification Queries:**

After running the script, verify with these queries:

```sql
-- Check if client was created
SELECT name, slug, industry FROM clients WHERE slug = 'techflow-solutions';

-- Check contacts
SELECT name, role, email FROM client_contacts 
WHERE client_id = (SELECT id FROM clients WHERE slug = 'techflow-solutions');

-- Check assets  
SELECT name, type, category FROM assets
WHERE client_id = (SELECT id FROM clients WHERE slug = 'techflow-solutions');
```

---

## 🎉 **Ready to Test!**

Once you've added the demo client data:

1. **Start your dev server**: `npm run dev`
2. **Login**: `tomh@redbaez.com` / `Wijlre2010`  
3. **Go to `/clients`** → You should see "TechFlow Solutions"
4. **Explore all the features** with real data!

The demo client has realistic data that will help you test every aspect of your AIrWAVE platform! 🚀
