import { messageRepository } from "@/domain/repositories/MessageRepository";
import { generateAIResponse } from "@/services/gemini";
import type { Message } from "@/domain/entities/Message";
import { logError, ErrorCategory } from "@/services/sentry";

export interface AddMessageInput {
  sessionId: string;
  userId: string;
  content: string;
}

export interface AddMessageOutput {
  userMessage: Message;
  aiMessage: Message;
  success: boolean;
  error?: string;
}

export const addMessage = async (
  input: AddMessageInput
): Promise<AddMessageOutput> => {
  try {
    // 1. Store user message
    const userMessage = await messageRepository.create(
      {
        sessionId: input.sessionId,
        role: "user",
        content: input.content,
      },
      input.userId
    );

    // 2. Get all messages for context
    const allMessages = await messageRepository.getBySessionId(
      input.sessionId,
      input.userId
    );

    // 3. Generate AI response
    const aiResponse = await generateAIResponse({
      messages: allMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // 4. Store AI response
    const aiMessage = await messageRepository.create(
      {
        sessionId: input.sessionId,
        role: "assistant",
        content: aiResponse.content,
      },
      input.userId
    );

    return {
      userMessage,
      aiMessage,
      success: aiResponse.success,
      error: aiResponse.error,
    };
  } catch (error) {
    const err = error as Error;
    logError(err, {
      category: ErrorCategory.API,
      userId: input.userId,
      additionalData: {
        operation: "addMessage",
        sessionId: input.sessionId,
      },
    });
    throw err;
  }
};
