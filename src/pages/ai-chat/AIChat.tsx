import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MdOutlineChatBubbleOutline, MdOutlineSend } from 'react-icons/md';
import { Alert, Button, Card, CardBody, Input } from '@/components/ui';
import { aiChatService } from '@/services/ai-chat.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: number;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'Could not send your message. Check the backend connection and try again.';
}

/** Conversational assistant for farm-related questions. */
export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    setError(null);
    setDraft('');
    setIsSending(true);
    const userMessage: Message = { id: Date.now(), role: 'user', content: text };
    setMessages((previous) => [...previous, userMessage]);
    try {
      const reply = await aiChatService.sendMessage(text, conversationId);
      if (reply.conversationId) setConversationId(reply.conversationId);
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, role: 'assistant', content: reply.content },
      ]);
    } catch (requestError) {
      setMessages((previous) => previous.filter((message) => message.id !== userMessage.id));
      setDraft(text);
      setError(getErrorMessage(requestError));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container-app flex max-w-4xl flex-col py-6 sm:py-8">
      <div>
        <p className="text-sm font-medium text-primary-600">Field guidance</p>
        <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">AI Chat</h1>
        <p className="mt-2 text-foreground-muted">Ask questions about crops, soil, and farm conditions.</p>
      </div>

      {error && <Alert variant="error" className="mt-5" onClose={() => setError(null)}>{error}</Alert>}

      <Card className="mt-6 flex min-h-[55vh] flex-col">
        <CardBody className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.length === 0 && !isSending && (
              <div className="m-auto max-w-sm py-8 text-center">
                <MdOutlineChatBubbleOutline className="mx-auto h-9 w-9 text-primary-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-foreground">Start a conversation</p>
                <p className="mt-1 text-sm text-foreground-muted">Ask a specific question about your crop or growing conditions.</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[90%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm sm:max-w-[75%] ${message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-surface-muted text-foreground'}`}>
                  {message.content}
                </p>
              </div>
            ))}
            {isSending && <p className="self-start rounded-xl bg-surface-muted px-4 py-3 text-sm text-foreground-muted" role="status">Thinking…</p>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={(event) => void handleSubmit(event)} className="flex items-end gap-2 border-t border-border p-3 sm:p-4">
            <div className="min-w-0 flex-1">
              <Input
                aria-label="Your message"
                placeholder="Ask about your farm…"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={isSending}
                maxLength={2000}
              />
            </div>
            <Button type="submit" aria-label="Send message" leftIcon={<MdOutlineSend />} isLoading={isSending} disabled={!draft.trim()}>
              Send
            </Button>
          </form>
        </CardBody>
      </Card>
      <p className="mt-3 text-xs text-foreground-muted">AI guidance can be incomplete. Verify important growing decisions with a qualified advisor.</p>
    </div>
  );
}
