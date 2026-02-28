import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, ResumeAnalytics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function tailorResume(resumeData: ResumeData, jobDescription: string): Promise<{ updatedResumeData: ResumeData, summaryOfChanges: string, analytics: ResumeAnalytics }> {
  const prompt = `
    You are an expert technical recruiter. Your task is to analyze the provided Job Description (JD) and tailor the provided Resume Data to perfectly align with it.
    
    CRITICAL LAYOUT INSTRUCTIONS:
    To ensure the resume fits perfectly on 2 pages, you MUST strictly adhere to the following constraints:
    1. The number of items in arrays MUST remain EXACTLY the same as the input data, WITH THE FOLLOWING EXCEPTIONS to prevent overflow:
       - The \`skills\` array should contain as many highly relevant keywords from the JD as possible to boost ATS score. Order the most relevant skills FIRST, because only the top ~8 rows of skills will be visibly printed.
       - The \`keyAchievements\` array MUST contain EXACTLY 4 items. If the current data has more, keep only the top 4 most relevant to the JD. Do not exceed 4.
       - The \`technicalExpertise\` array MUST contain EXACTLY 14 items. If the current data has more, keep only the top 14 most relevant to the JD.
       - Do not add or remove any work experience entries.
       - For each work experience entry, the number of responsibilities MUST remain EXACTLY the same.
    2. THE CHARACTER COUNT MATTERS SEVERELY. Every single text field (profile summary, individual bullet points, achievements) MUST NOT EXCEED the character length of the original text it replaces. If anything, it should be slightly shorter. Do not write excessively long sentences that would cause text to wrap onto a new line and break the highly-calibrated A4 layout.
    
    Content Instructions:
    1. Analyze the JD and identify the core required skills and keywords.
    2. Rephrase, reorder, or highlight the user's existing skills and experience in the Resume Data to align with the JD's vocabulary.
    3. Do NOT invent new skills or experiences the user does not have. Only reframe existing ones.
    4. Provide a summary of the changes you made and why.
    5. Provide analytics including the estimated ATS score of the previous resume, the estimated ATS score of the updated resume, the overall matching score, matching keywords, and missing keywords.
    
    Job Description:
    ${jobDescription}
    
    Current Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          updatedResumeData: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              title: { type: Type.STRING },
              contact: {
                type: Type.OBJECT,
                properties: {
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  location: { type: Type.STRING },
                  website: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  github: { type: Type.STRING },
                },
                required: ["phone", "email", "location", "website"]
              },
              profile: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                  },
                  required: ["period", "institution", "degree"]
                }
              },
              languages: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              technicalExpertise: { type: Type.ARRAY, items: { type: Type.STRING } },
              workExperience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    period: { type: Type.STRING },
                    role: { type: Type.STRING },
                    responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["company", "period", "role", "responsibilities"]
                }
              }
            },
            required: ["name", "title", "contact", "profile", "skills", "education", "languages", "keyAchievements", "technicalExpertise", "workExperience"]
          },
          summaryOfChanges: { type: Type.STRING },
          analytics: {
            type: Type.OBJECT,
            properties: {
              previousAtsScore: { type: Type.NUMBER, description: "Estimated ATS score of the original resume (0-100)" },
              updatedAtsScore: { type: Type.NUMBER, description: "Estimated ATS score of the tailored resume (0-100)" },
              matchingScore: { type: Type.NUMBER, description: "Overall matching score with the JD (0-100)" },
              matchingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords from the JD that are present in the updated resume" },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important keywords from the JD that are missing from the updated resume" }
            },
            required: ["previousAtsScore", "updatedAtsScore", "matchingScore", "matchingKeywords", "missingKeywords"]
          }
        },
        required: ["updatedResumeData", "summaryOfChanges", "analytics"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini API");
  }

  return JSON.parse(text);
}
