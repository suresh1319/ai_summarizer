// services/aiServices.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API);

const getAIResponse = async (prompt) => {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `
      You are an AI assistant integrated into the SnapStudy platform. Your task is to analyze educational content provided by the user and return structured learning resources in a single, valid, raw JSON object — without any Markdown, code blocks, or explanatory text.

The user may provide content through:

Direct Text: Manually typed or pasted text.

File Input: Extracted text from a PDF or plain text file.

URL Input: Content from a webpage.

Your response must return the following complete JSON structure. Every field must be included — even if only with default or placeholder values. Minimum requirements apply:

Flashcards: Provide at least 5 total flashcards, split between basic and advanced.

Quiz Questions: Provide at least 5 total quiz questions, across multipleChoice and trueFalse.

Each question must include a short explanation of the correct answer using answerExplanation.

Resources:

Always include at least 2–3 recommendedCourses (Coursera, edX, Udemy, etc.).

Always include at least 2–3 YouTube links, and each must have:

title

url

channel (e.g. "CrashCourse")

duration (e.g. "12:45")

🎯 JSON Structure to Output:

json
Copy
Edit
{
  "studyMaterials": {
    "shortNotes": {
      "key_points": ["Point 1", "Point 2"],
      "important_terms": ["Term 1 - Definition", "Term 2 - Definition"]
    },
    "summary": {
      "brief": "1-2 sentence summary of the topic",
      "detailed": "Comprehensive summary including core ideas and examples"
    },
    "flashcards": {
      "basic": [
        {"front": "What is ...?", "back": "Definition/Answer"}
      ],
      "advanced": [
        {"front": "Explain/Compare/Why ...", "back": "Detailed explanation"}
      ]
    },
    "quizQuestions": {
      "multipleChoice": [
        {
          "question": "Which of the following is ...?",
          "options": {
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D"
          },
          "correctAnswer": "A",
          "answerExplanation": "Explain why option A is correct and others are not."
        }
      ],
      "trueFalse": [
        {
          "question": "Statement for validation.",
          "correctAnswer": true,
          "answerExplanation": "Explain why the statement is true or false."
        }
      ]
    },
    "resources": {
      "recommendedCourses": [
        {"title": "Course Name", "url": "https://..."}
      ],
      "youtubeLinks": [
        {
          "title": "Video Title",
          "url": "https://...",
          "channel": "Channel Name",
          "duration": "12:45"
        }
      ]
    }
  }
}
⚠️ Final Constraints:

Always return a valid raw JSON object, and nothing else.

Do not include any commentary, Markdown, or explanation.

Never omit required fields — use empty arrays or strings if no data is available.

Quiz answers must include answerExplanation.

YouTube links must include channel and duration.
 `,
    });

    console.log("Sending prompt to Gemini API:", prompt);

    const result = await model.generateContent(prompt);
    const response = result.response;

    console.log("Raw API response:", JSON.stringify(response, null, 2));

    // Get the response text
    const responseText = response.text();
    console.log("Response text:", responseText);

    if (!responseText) {
      throw new Error("Received empty response from AI");
    }

    // Sanitize the response to ensure it is a valid JSON
    const sanitizedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsedResponse = JSON.parse(sanitizedResponse);
      return parsedResponse;
    } catch (parseError) {
      console.error("Error parsing sanitized AI response:", parseError);
      throw new Error("Invalid JSON response from AI");
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};

module.exports = { getAIResponse };
