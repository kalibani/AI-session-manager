import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { logError, ErrorCategory } from "./sentry";

// Simulate random API failures (10-20% chance)
const shouldSimulateError = () => {
  // Disabled for production use
  return false; // 0% failure rate
};

export interface GenerateAIResponseInput {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  onStream?: (text: string) => void;
}

export interface GenerateAIResponseOutput {
  content: string;
  success: boolean;
  error?: string;
}

export const generateAIResponse = async ({
  messages,
  onStream,
}: GenerateAIResponseInput): Promise<GenerateAIResponseOutput> => {
  try {
    // Simulate random failures
    if (shouldSimulateError()) {
      const error = new Error("Simulated Gemini API failure");
      logError(error, {
        category: ErrorCategory.API,
        additionalData: { service: "gemini", simulated: true },
      });

      // Return mock response as fallback
      return {
        content:
          "I'm experiencing technical difficulties. This is a fallback response. Please try again.",
        success: false,
        error: "Simulated API failure",
      };
    }

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    let fullText = "";

    // Stream the response
    for await (const textPart of result.textStream) {
      fullText += textPart;
      if (onStream) {
        onStream(fullText);
      }
    }

    return {
      content: fullText,
      success: true,
    };
  } catch (error) {
    const err = error as Error;
    logError(err, {
      category: ErrorCategory.API,
      additionalData: { service: "gemini", messagesCount: messages.length },
    });

    // Return mock response as fallback
    return {
      content:
        "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      success: false,
      error: err.message,
    };
  }
};

// Server-side streaming response for API routes
export const createStreamingResponse = async (
  messages: Array<{ role: "user" | "assistant"; content: string }>
) => {
  try {
    // Simulate random failures
    if (shouldSimulateError()) {
      const error = new Error("Simulated Gemini API failure");
      logError(error, {
        category: ErrorCategory.API,
        additionalData: { service: "gemini", simulated: true },
      });
      throw error;
    }

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const err = error as Error;
    logError(err, {
      category: ErrorCategory.API,
      additionalData: { service: "gemini", messagesCount: messages.length },
    });
    throw err;
  }
};
