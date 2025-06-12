import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Groq } from "groq-sdk";

const router = express.Router();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate Enhanced Job Description
router.post("/enhance-job", async (req, res) => {
  try {
    const { title, description, requirements } = req.body;

    const prompt = `You are an expert HR professional. Please enhance this job posting to make it more attractive and comprehensive:

Title: ${title}
Description: ${description}
Requirements: ${requirements}

Please provide:
1. An enhanced, engaging job description
2. Clear and comprehensive requirements
3. Suggested skills and qualifications
4. Company benefits that would attract candidates

Make it professional, clear, and appealing to potential candidates.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const enhancedContent = chatCompletion.choices[0]?.message?.content || "";

    res.json({
      enhancedContent,
      original: { title, description, requirements },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error enhancing job posting", error: error.message });
  }
});

// Generate Resume Optimization Suggestions
router.post("/optimize-resume", async (req, res) => {
  try {
    const { resumeText, targetJob } = req.body;

    const prompt = `You are a career counselor expert. Analyze this resume and provide optimization suggestions for the target job:

Resume:
${resumeText}

Target Job: ${targetJob}

Please provide:
1. Key strengths in the resume
2. Areas for improvement
3. Specific keywords to include
4. Skills to highlight or develop
5. Overall recommendations

Be specific and actionable in your suggestions.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const suggestions = chatCompletion.choices[0]?.message?.content || "";

    res.json({ suggestions });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error generating resume suggestions",
        error: error.message,
      });
  }
});

// Generate Interview Questions
router.post("/interview-questions", async (req, res) => {
  try {
    const { jobTitle, jobDescription, candidateResume } = req.body;

    const prompt = `Generate 10 relevant interview questions for this position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Candidate Resume: ${candidateResume}

Please provide a mix of:
1. Technical questions specific to the role
2. Behavioral questions
3. Situational questions
4. Questions about the candidate's experience

Make them professional and relevant to assess the candidate's fit for this specific role.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.8,
      max_tokens: 1024,
    });

    const questions = chatCompletion.choices[0]?.message?.content || "";

    res.json({ questions });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error generating interview questions",
        error: error.message,
      });
  }
});

export default router;
