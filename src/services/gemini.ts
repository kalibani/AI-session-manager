import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { logError, ErrorCategory } from "./sentry";

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
