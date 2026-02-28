<div align="center">
  <h1>AI Resume Tailor</h1>
  <p>An intelligent, responsive web application for dynamically tailoring A4 resumes to specific job descriptions using Gemini AI.</p>
</div>

## Features

- **Gemini AI Integration**: Automatically rephrases and reorders your skills, experience, and profile to match a target Job Description.
- **ATS Analytics**: get instant feedback on the keyword matching score and ATS compatibility after tailoring.
- **Live A4 Preview**: See exactly how your resume looks on a realistic A4 document before exporting.
- **Unified Storage History**: Keep track of different tailored versions of your resume per company, saved locally in your browser.
- **JSON Editor**: Manually tweak your core resume data via a raw JSON editor.
- **PDF Export**: Perfectly formatted, pixel-perfect A4 dimension PDF downloads.
- **Responsive Design**: Flawless experience across desktop, tablet, and mobile.

## Run Locally

**Prerequisites:** Node.js (v18+) and pnpm (Since this project enforces `pnpm` exclusively).

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/jasimjs/tailoring-resume-based-on-jd.git
   ```

2. Install dependencies using `pnpm`:
   ```bash
   pnpm install
   ```

3. Configure your Environment Variables:
   Create a `.env` file in the root directory (you can copy `.env.example`) and add your Gemini API Key:
   ```bash
   GEMINI_API_KEY="your_api_key_here"
   ```

4. Start the development server:
   ```bash
   pnpm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Built With
- React 19
- Vite
- Tailwind CSS v4
- Google GenAI SDK (Gemini 2.5 Flash)
- Lucide React Icons
- React-to-Print
