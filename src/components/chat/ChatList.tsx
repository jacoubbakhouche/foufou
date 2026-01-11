import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Allow image fallback
import { Button } from '@/components/ui/button';
import { MessageCircle, Trash2, Loader2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { arSA, fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Conversation {
    conversation_id: string; // From join
    user_id: string; // My ID
    last_message: string;
    updated_at: string;
    other_user?: {
        full_name: string;
        avatar_url?: string;
    };
}

interface ChatListProps {
    onSelectConversation: (conversationId: string, otherUser: any) => void;
    activeConversationId?: string;
}

const ChatList = ({ onSelectConversation, activeConversationId }: ChatListProps) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            // Fetch my participations where NOT deleted
            // @ts-ignore
            const { data: participations, error } = await supabase
                .from('conversation_participants')
                .select(`
                    conversation_id,
                    user_id,
                    is_deleted,
                    conversations (
                        id,
                        last_message,
                        updated_at
                    )
                `)
                .eq('user_id', user?.id)
                .eq('is_deleted', false)
                .order('conversations(updated_at)', { ascending: false });

            if (error) throw error;

            // For each conversation, fetch the OTHER participant info
            const formattedConversations = await Promise.all(participations.map(async (p: any) => {
                // @ts-ignore
                const { data: otherParticipants } = await supabase
                    .from('conversation_participants')
                    .select('user_id')
                    .eq('conversation_id', p.conversation_id)
                    .neq('user_id', user?.id)
                    .single();

                let otherUserInfo = { full_name: 'Unknown', avatar_url: '' };

                if (otherParticipants) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url') // Assuming profiles has these
                        .eq('id', otherParticipants.user_id)
                        .single();
                    if (profile) otherUserInfo = profile;
                }

                return {
                    conversation_id: p.conversation_id,
                    user_id: p.user_id,
                    last_message: p.conversations.last_message,
                    updated_at: p.conversations.updated_at,
                    other_user: otherUserInfo
                };
            }));

            setConversations(formattedConversations);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchConversations();

        // Subscribe to changes (Realtime)
        const subscription = supabase
            .channel('public:conversations')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_participants', filter: `user_id=eq.${user?.id}` }, fetchConversations)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        }
    }, [user]);

    const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation();
        if (!confirm(t('confirmDeleteChat', 'هل أنت متأكد من حذف هذه المحادثة؟ ستختفي من عندك فقط.'))) return;

        try {
            // @ts-ignore
            const { error } = await supabase.rpc('soft_delete_conversation', {
                conversation_id_param: conversationId
            });

            if (error) throw error;

            toast.success(t('chatDeleted', 'تم حذف المحادثة'));
            fetchConversations(); // Refresh list immediately
            if (activeConversationId === conversationId) {
                onSelectConversation('', null); // Deselect
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(t('error'));
        }
    };

    if (isLoading) {
        return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground bg-secondary/20 rounded-xl m-4 border border-dashed border-border">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>{t('noConversations', 'لا توجد محادثات')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {conversations.map((conv) => (
                <div
                    key={conv.conversation_id}
                    onClick={() => onSelectConversation(conv.conversation_id, conv.other_user)}
                    className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${activeConversationId === conv.conversation_id
                        ? 'bg-primary/10 border-primary/30 shadow-sm'
                        : 'bg-card border-transparent hover:bg-secondary/50'
                        }`}
                >
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={conv.other_user?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                            <h4 className="font-bold text-sm text-foreground truncate">
                                {conv.other_user?.full_name || 'User'}
                            </h4>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: language === 'ar' ? arSA : fr })}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate opacity-80">
                            {conv.last_message || t('noMessages', 'لا توجد رسائل')}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-1"
                        onClick={(e) => handleDeleteConversation(e, conv.conversation_id)}
                        title={t('deleteChat', 'حذف المحادثة')}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default ChatList;
