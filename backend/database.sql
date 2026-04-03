-- SQL Script to set up the necessary tables for AI Resume Builder

-- Drop tables if they exist to avoid conflicts (be careful if running on an existing DB with data)
DROP TABLE IF EXISTS "public"."resumes";
DROP TABLE IF EXISTS "public"."users";

-- Create "users" table
CREATE TABLE "public"."users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "googleId" TEXT,
    "isPremium" BOOLEAN DEFAULT FALSE,
    "generationCount" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create "resumes" table
CREATE TABLE "public"."resumes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "title" TEXT DEFAULT 'My Resume' NOT NULL,
    "personalInfo" JSONB DEFAULT '{}'::jsonb,
    "summary" TEXT,
    "education" JSONB DEFAULT '[]'::jsonb,
    "experience" JSONB DEFAULT '[]'::jsonb,
    "skills" JSONB DEFAULT '[]'::jsonb,
    "targetRole" TEXT,
    "template" TEXT DEFAULT 'modern',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."resumes" ENABLE ROW LEVEL SECURITY;

-- Note: The backend uses a SERVICE_ROLE key or manual logic to query data.
-- If you want explicit RLS policies for the frontend logic, you can define them here.
-- For now, letting the Service Role manage queries bypasses RLS in the Node.js API.
