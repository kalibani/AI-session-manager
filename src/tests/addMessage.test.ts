import { addMessage, AddMessageInput } from '@/domain/usecases/addMessage';
import { messageRepository } from '@/domain/repositories/MessageRepository';
import { generateAIResponse } from '@/services/gemini';
import type { Message } from '@/domain/entities/Message';

// Mock dependencies
jest.mock('@/domain/repositories/MessageRepository');
jest.mock('@/services/gemini');
jest.mock('@/services/sentry');

describe('addMessage use case', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'session-456';
  const mockUserContent = 'Hello, AI!';
  const mockAiContent = 'Hello! How can I help you today?';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully add user message and get AI response', async () => {
    // Arrange
    const mockUserMessage: Message = {
      id: 'msg-user-1',
      sessionId: mockSessionId,
      role: 'user',
      content: mockUserContent,
      createdAt: new Date().toISOString(),
    };

    const mockAiMessage: Message = {
      id: 'msg-ai-1',
      sessionId: mockSessionId,
      role: 'assistant',
      content: mockAiContent,
      createdAt: new Date().toISOString(),
    };

    const mockExistingMessages: Message[] = [mockUserMessage];

    // Mock messageRepository.create to return user message first, then AI message
    (messageRepository.create as jest.Mock)
      .mockResolvedValueOnce(mockUserMessage)
      .mockResolvedValueOnce(mockAiMessage);

    // Mock messageRepository.getBySessionId to return existing messages
    (messageRepository.getBySessionId as jest.Mock).mockResolvedValue(
      mockExistingMessages
    );

    // Mock generateAIResponse
    (generateAIResponse as jest.Mock).mockResolvedValue({
      content: mockAiContent,
      success: true,
    });

    const input: AddMessageInput = {
      sessionId: mockSessionId,
      userId: mockUserId,
      content: mockUserContent,
    };

    // Act
    const result = await addMessage(input);

    // Assert
    expect(result.success).toBe(true);
    expect(result.userMessage).toEqual(mockUserMessage);
    expect(result.aiMessage).toEqual(mockAiMessage);
    expect(result.error).toBeUndefined();

    // Verify messageRepository.create was called twice
    expect(messageRepository.create).toHaveBeenCalledTimes(2);

    // Verify first call (user message)
    expect(messageRepository.create).toHaveBeenNthCalledWith(
      1,
      {
        sessionId: mockSessionId,
        role: 'user',
        content: mockUserContent,
      },
      mockUserId
    );

    // Verify second call (AI message)
    expect(messageRepository.create).toHaveBeenNthCalledWith(
      2,
      {
        sessionId: mockSessionId,
        role: 'assistant',
        content: mockAiContent,
      },
      mockUserId
    );

    // Verify generateAIResponse was called with correct messages
    expect(generateAIResponse).toHaveBeenCalledWith({
      messages: mockExistingMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });
  });

  it('should handle AI service failure and still return messages', async () => {
    // Arrange
    const mockUserMessage: Message = {
      id: 'msg-user-2',
      sessionId: mockSessionId,
      role: 'user',
      content: mockUserContent,
      createdAt: new Date().toISOString(),
    };

    const mockFallbackContent =
      "I apologize, but I'm having trouble processing your request right now.";

    const mockAiMessage: Message = {
      id: 'msg-ai-2',
      sessionId: mockSessionId,
      role: 'assistant',
      content: mockFallbackContent,
      createdAt: new Date().toISOString(),
    };

    (messageRepository.create as jest.Mock)
      .mockResolvedValueOnce(mockUserMessage)
      .mockResolvedValueOnce(mockAiMessage);

    (messageRepository.getBySessionId as jest.Mock).mockResolvedValue([
      mockUserMessage,
    ]);

    // Mock generateAIResponse to return failure
    (generateAIResponse as jest.Mock).mockResolvedValue({
      content: mockFallbackContent,
      success: false,
      error: 'Simulated API failure',
    });

    const input: AddMessageInput = {
      sessionId: mockSessionId,
      userId: mockUserId,
      content: mockUserContent,
    };

    // Act
    const result = await addMessage(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Simulated API failure');
    expect(result.userMessage).toEqual(mockUserMessage);
    expect(result.aiMessage.content).toBe(mockFallbackContent);
  });

  it('should propagate errors from message repository', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    (messageRepository.create as jest.Mock).mockRejectedValue(error);

    const input: AddMessageInput = {
      sessionId: mockSessionId,
      userId: mockUserId,
      content: mockUserContent,
    };

    // Act & Assert
    await expect(addMessage(input)).rejects.toThrow('Database connection failed');
  });
});




