# AI Resume Builder SaaS - Project Submission

**Project Title:** AI-Powered Resume Builder & Analyzer
**Tech Stack:** React (Vite), Node.js, Express, MongoDB, Firebase Auth, Razorpay API, OpenAI API

### Deployment Links
- **Frontend Live URL (Vercel):** https://frontend-84y80groq-venkatesh161065s-projects.vercel.app
- **Backend Live API (Render):** https://ai-resume-backend-venkatesh.onrender.com/
- **GitHub Source Code:** https://github.com/Venkatesh161065/ai-resume-builder.git

### Project Overview
A fully functional Software-as-a-Service (SaaS) application that leverages AI to simplify resume creation. 

**Key Features Implemented:**
1. **Secure Authentication:** User login and signup handled natively via Firebase Google Authentication.
2. **AI-Powered Generation:** Seamless integration with OpenAI API to auto-generate professional summaries and ATS-optimized bullet points based on brief user inputs.
3. **Real-time Document Preview:** Split-screen dual interface that updates a live A4 PDF document representation in real-time as users fill in their data.
4. **Data Persistence:** Complete CRUD functionality via REST API backed by MongoDB, automatically saving and tracking uniquely generated resumes per user.
5. **Premium Checkout/Monetization:** Fully active payment gateway integrated via Razorpay order fulfillment to handle subscription and premium upgrades.
6. **PDF Export System:** 1-click feature to instantly render and scrape the HTML document into a standardized A4 PDF using `html2canvas` and `jsPDF`.

**Deployment Architecture:**
- Frontend deployed and globally distributed through Vercel.
- Backend Node API continuously deployed via Render attached to the main GitHub branch.
- Environment variables secured in deployment platforms respectively.
