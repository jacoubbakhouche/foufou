import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image as ImageIcon, Loader2, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    type: 'text' | 'image';
    created_at: string;
    read: boolean;
}

interface ChatWindowProps {
    conversationId: string;
    otherUser: {
        full_name: string;
        avatar_url?: string;
    };
    onBack?: () => void; // Mobile back
}

const ChatWindow = ({ conversationId, otherUser, onBack }: ChatWindowProps) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const fetchMessages = async () => {
        try {
            // @ts-ignore
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true }); // Oldest first

            if (error) throw error;
            setMessages((data || []) as Message[]);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();

        // Realtime Subscription
        const subscription = supabase
            .channel(`chat:${conversationId}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                    setTimeout(scrollToBottom, 100);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [conversationId]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            // Call the SECURE function (Handles resurrection)
            // @ts-ignore
            const { error } = await supabase.rpc('send_message_secure', {
                conversation_id_param: conversationId,
                content_param: newMessage.trim(),
                type_param: 'text'
            });

            if (error) throw error;

            setNewMessage('');
            // Optimistic update is tricky because RPC returns data but subscription handles it. 
            // We wait for subscription to add the message to state.
        } catch (error) {
            // ...
            console.error('Send error:', error);
            toast.error(t('sendError', 'فشل في إرسال الرسالة'));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card rounded-xl shadow-card overflow-hidden border border-border">
            {/* Header */}
            <div className="p-4 border-b border-border bg-secondary/10 flex items-center gap-3 shadow-sm">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={otherUser.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-foreground">{otherUser.full_name}</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-muted-foreground">{t('online', 'متصل')}</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-dots bg-fixed"
                style={{ backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)', backgroundSize: '20px 20px', '--dot-color': 'rgba(0,0,0,0.05)' } as any}
            >
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p>{t('startConversation', 'ابدأ المحادثة الآن')}</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-secondary text-secondary-foreground border border-border/50 rounded-tl-none'
                                        }`}
                                >
                                    {msg.content}
                                    <span className={`text-[10px] block text-right mt-1 opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary">
                    <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('typeMessage', 'اكتب رسالتك...')}
                    className="flex-1 bg-secondary/30 border-transparent focus:bg-background transition-all"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={isSending || !newMessage.trim()}
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
};

export default ChatWindow;
