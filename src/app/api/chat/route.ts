import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Convert UIMessages (with parts) to the format expected by streamText
    // Filter out messages with empty content (causes Gemini API error)
    const formattedMessages = messages
      .map(
        (msg: {
          role: string;
          parts?: Array<{ type: string; text: string }>;
          content?: string;
        }) => {
          // Handle UIMessage format (with parts array)
          let content = msg.content || "";
          if (msg.parts && Array.isArray(msg.parts)) {
            content = msg.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("");
          }

          return {
            role: msg.role as "user" | "assistant",
            content,
          };
        }
      )
      .filter((msg) => msg.content.trim().length > 0); // Remove empty messages

    if (formattedMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 }
      );
    }

    // Use streamText from AI SDK with Google Gemini
    const result = await streamText({
      model: google("gemini-2.0-flash-exp"),
      messages: formattedMessages,
      temperature: 0.7,
    });

    // Return the UI message stream response for useChat
    return result.toUIMessageStreamResponse();
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
