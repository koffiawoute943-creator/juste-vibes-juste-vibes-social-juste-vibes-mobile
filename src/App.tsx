import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageCircle, 
  User, 
  Heart, 
  Share2, 
  Music, 
  MoreHorizontal,
  Bell,
  Send,
  Image as ImageIcon,
  Mic,
  X,
  Play,
  Pause,
  ChevronLeft
} from 'lucide-react';
import { cn } from './lib/utils';
import { Post, User as UserType, MusicTrend, Message } from './types';
import { io, Socket } from 'socket.io-client';

// Mock Current User
const CURRENT_USER: UserType = {
  id: 'user1',
  username: 'VibeMaster',
  email: 'vibe@example.com',
  bio: 'Living for the music 🎵',
  avatar: 'https://picsum.photos/seed/user1/200',
  created_at: new Date().toISOString()
};

const OTHER_USER: UserType = {
  id: 'user2',
  username: 'AmapianoQueen',
  email: 'queen@example.com',
  bio: 'Amapiano to the world! 🇿🇦',
  avatar: 'https://picsum.photos/seed/user2/200',
  created_at: new Date().toISOString()
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trends, setTrends] = useState<MusicTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    fetchData();
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, trendsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/music/trends')
      ]);
      const postsData = await postsRes.json();
      const trendsData = await trendsRes.json();
      setPosts(postsData);
      setTrends(trendsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="flex flex-col h-screen bg-brand-black text-white max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-white/5">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-40 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-brand-purple to-violet-400 bg-clip-text text-transparent">
          Juste Vibes
        </h1>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors relative"
          >
            <MessageCircle size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-purple rounded-full border border-brand-black" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeView posts={posts} />}
          {activeTab === 'explorer' && <ExplorerView trends={trends} />}
          {activeTab === 'publish' && <PublishView onPublished={fetchData} onCancel={() => setActiveTab('home')} />}
          {activeTab === 'messages' && <MessagesView />}
          {activeTab === 'profile' && <ProfileView user={CURRENT_USER} posts={posts.filter(p => p.user_id === CURRENT_USER.id)} />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-black/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 z-50">
        <div className="flex items-center justify-between">
          <NavButton icon={<Home />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" />
          <NavButton icon={<Search />} active={activeTab === 'explorer'} onClick={() => setActiveTab('explorer')} label="Explorer" />
          <button 
            onClick={() => setActiveTab('publish')}
            className="w-12 h-12 bg-brand-purple rounded-2xl flex items-center justify-center shadow-lg shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusSquare className="text-white" size={28} />
          </button>
          <NavButton icon={<MessageCircle />} active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} label="Messages" />
          <NavButton icon={<User />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="h-screen bg-brand-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-purple)_0%,_transparent_70%)] opacity-20 blur-3xl" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <div className="w-24 h-24 bg-brand-purple rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-purple/40">
          <Music className="text-white" size={48} />
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Juste Vibes</h1>
        <p className="text-violet-400 font-medium tracking-widest uppercase text-xs">Share Your Vibes</p>
      </motion.div>
    </div>
  );
}

function NavButton({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-brand-purple scale-110" : "text-white/40 hover:text-white/60"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 2.5 : 2 })}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function HomeView({ posts }: { posts: Post[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pt-2"
    >
      {/* Stories */}
      <div className="px-6">
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center p-1">
              <div className="w-full h-full bg-white/5 rounded-full flex items-center justify-center">
                <PlusSquare size={20} className="text-white/40" />
              </div>
            </div>
            <span className="text-[10px] text-white/60">Your Vibe</span>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-brand-purple to-violet-400">
                <div className="w-full h-full rounded-full border-2 border-brand-black overflow-hidden">
                  <img src={`https://picsum.photos/seed/story${i}/200`} alt="Story" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
              <span className="text-[10px] text-white/60">Viber_{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-8 px-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </motion.div>
  );
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/5">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.avatar} alt={post.username} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
          <div>
            <h3 className="text-sm font-semibold">{post.username}</h3>
            <p className="text-[10px] text-white/40">2 hours ago</p>
          </div>
        </div>
        <button className="text-white/40"><MoreHorizontal size={20} /></button>
      </div>

      {post.type === 'text' && (
        <div className="px-6 py-4">
          <p className="text-lg font-display leading-relaxed">{post.content}</p>
        </div>
      )}

      {post.type === 'image' && (
        <div className="relative aspect-square">
          <img src={post.media_url} alt="Post content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          {post.content && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-sm">{post.content}</p>
            </div>
          )}
        </div>
      )}

      {post.type === 'music' && (
        <div className="px-6 py-4">
          <div className="bg-brand-purple/20 rounded-2xl p-4 flex items-center gap-4 border border-brand-purple/30">
            <div className="w-12 h-12 bg-brand-purple rounded-xl flex items-center justify-center">
              <Music className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold">{post.music_title}</h4>
              <p className="text-xs text-white/60">{post.music_artist}</p>
            </div>
            <button className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center">
              <Play size={16} fill="white" />
            </button>
          </div>
          {post.content && <p className="mt-4 text-sm text-white/80">{post.content}</p>}
        </div>
      )}

      <div className="p-4 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setLiked(!liked)}
            className={cn("flex items-center gap-2 transition-colors", liked ? "text-red-500" : "text-white/60")}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
            <span className="text-xs font-medium">{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-2 text-white/60">
            <MessageCircle size={20} />
            <span className="text-xs font-medium">12</span>
          </button>
          <button className="text-white/60"><Share2 size={20} /></button>
        </div>
        <button className="text-brand-purple"><Music size={20} /></button>
      </div>
    </div>
  );
}

function ExplorerView({ trends }: { trends: MusicTrend[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 space-y-8"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <input 
          type="text" 
          placeholder="Search vibes, music, people..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-purple/50 transition-colors"
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold">Trending Sounds</h2>
          <button className="text-xs text-brand-purple font-semibold">See All</button>
        </div>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.id} className="flex items-center gap-4 group">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden">
                <img src={trend.cover_url} alt={trend.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={16} fill="white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">{trend.title}</h3>
                <p className="text-xs text-white/40">{trend.artist} • {trend.genre}</p>
              </div>
              <button className="p-2 text-white/20 hover:text-brand-purple transition-colors">
                <Heart size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-display font-bold mb-4">Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {['Afrobeats', 'Amapiano', 'Drill', 'Love Vibes'].map((cat) => (
            <div key={cat} className="relative h-24 rounded-2xl overflow-hidden group cursor-pointer">
              <img src={`https://picsum.photos/seed/${cat}/400/200`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-brand-purple/40 mix-blend-multiply" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold tracking-wider uppercase">{cat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function PublishView({ onPublished, onCancel }: { onPublished: () => void, onCancel: () => void }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'image' | 'music'>('text');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!content.trim()) return;
    setIsPublishing(true);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: CURRENT_USER.id,
          type,
          content,
          media_url: type === 'image' ? 'https://picsum.photos/seed/newpost/600/800' : null,
          music_title: type === 'music' ? 'New Vibe' : null,
          music_artist: type === 'music' ? CURRENT_USER.username : null
        })
      });
      onPublished();
      onCancel();
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-6 pt-4 space-y-6"
    >
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-white/60"><X size={24} /></button>
        <h2 className="text-lg font-display font-bold">New Vibe</h2>
        <button 
          onClick={handlePublish}
          disabled={!content.trim() || isPublishing}
          className="px-6 py-2 bg-brand-purple rounded-full text-sm font-bold disabled:opacity-50"
        >
          {isPublishing ? '...' : 'Post'}
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => setType('text')}
          className={cn("px-4 py-2 rounded-full text-xs font-bold transition-colors", type === 'text' ? "bg-brand-purple" : "bg-white/5")}
        >
          Status
        </button>
        <button 
          onClick={() => setType('image')}
          className={cn("px-4 py-2 rounded-full text-xs font-bold transition-colors", type === 'image' ? "bg-brand-purple" : "bg-white/5")}
        >
          Photo
        </button>
        <button 
          onClick={() => setType('music')}
          className={cn("px-4 py-2 rounded-full text-xs font-bold transition-colors", type === 'music' ? "bg-brand-purple" : "bg-white/5")}
        >
          Music
        </button>
      </div>

      <textarea 
        placeholder="What's your vibe today?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-40 bg-transparent text-xl font-display placeholder:text-white/20 focus:outline-none resize-none"
      />

      <div className="flex items-center gap-6 pt-6 border-t border-white/5">
        <button className="flex items-center gap-2 text-white/60"><ImageIcon size={20} /> <span className="text-xs">Media</span></button>
        <button className="flex items-center gap-2 text-white/60"><Music size={20} /> <span className="text-xs">Music</span></button>
        <button className="flex items-center gap-2 text-white/60"><Mic size={20} /> <span className="text-xs">Audio</span></button>
      </div>
    </motion.div>
  );
}

function MessagesView() {
  const [selectedChat, setSelectedChat] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit('join', CURRENT_USER.id);

    socketRef.current.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('message_sent', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages/${CURRENT_USER.id}/${selectedChat?.id}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedChat) return;
    socketRef.current?.emit('send_message', {
      sender_id: CURRENT_USER.id,
      receiver_id: selectedChat.id,
      content: input,
      type: 'text'
    });
    setInput('');
  };

  if (selectedChat) {
    return (
      <motion.div 
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        className="fixed inset-0 z-50 bg-brand-black flex flex-col max-w-md mx-auto"
      >
        <div className="p-4 flex items-center gap-4 border-b border-white/5">
          <button onClick={() => setSelectedChat(null)}><ChevronLeft size={24} /></button>
          <img src={selectedChat.avatar} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
          <div>
            <h3 className="text-sm font-bold">{selectedChat.username}</h3>
            <p className="text-[10px] text-emerald-400">Online</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm",
              msg.sender_id === CURRENT_USER.id 
                ? "bg-brand-purple ml-auto rounded-tr-none" 
                : "bg-white/10 mr-auto rounded-tl-none"
            )}>
              {msg.content}
            </div>
          ))}
        </div>

        <div className="p-4 bg-brand-black border-t border-white/5 flex items-center gap-3">
          <button className="text-white/40"><Mic size={20} /></button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a vibe..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-6 text-sm focus:outline-none"
          />
          <button 
            onClick={sendMessage}
            className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Messages</h2>
        <button className="text-brand-purple font-semibold text-sm">Requests (2)</button>
      </div>

      <div className="space-y-2">
        <div 
          onClick={() => setSelectedChat(OTHER_USER)}
          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="relative">
            <img src={OTHER_USER.avatar} className="w-14 h-14 rounded-full" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-brand-black rounded-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold">{OTHER_USER.username}</h3>
              <span className="text-[10px] text-white/40">12:45</span>
            </div>
            <p className="text-xs text-white/40 truncate">That new Amapiano mix is fire! 🔥</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileView({ user, posts }: { user: UserType, posts: Post[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="px-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-brand-purple to-violet-400">
            <img src={user.avatar} className="w-full h-full rounded-full border-4 border-brand-black object-cover" referrerPolicy="no-referrer" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-purple rounded-full border-2 border-brand-black flex items-center justify-center">
            <PlusSquare size={16} />
          </button>
        </div>
        <h2 className="text-xl font-display font-bold">{user.username}</h2>
        <p className="text-sm text-white/60 mt-1">{user.bio}</p>
        
        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-lg font-bold">{posts.length}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">1.2k</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">450</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Following</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold">Edit Profile</button>
          <button className="flex-1 py-3 bg-brand-purple rounded-2xl text-sm font-bold">Share Vibe</button>
        </div>
      </div>

      <div className="px-6">
        <div className="flex border-b border-white/5 mb-6">
          <button className="flex-1 pb-4 border-b-2 border-brand-purple text-sm font-bold">Vibes</button>
          <button className="flex-1 pb-4 text-white/40 text-sm font-bold">Music</button>
          <button className="flex-1 pb-4 text-white/40 text-sm font-bold">Liked</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5">
              {post.type === 'image' ? (
                <img src={post.media_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 text-center">
                  <p className="text-xs font-display line-clamp-4">{post.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
