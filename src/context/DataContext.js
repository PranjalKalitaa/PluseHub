import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { SPARK_RULES } from "../utils/points";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user, addSparks } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [storyThreads, setStoryThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [likedSet, setLikedSet] = useState(new Set());
  const [reactedVoiceNotes, setReactedVoiceNotes] = useState({});
  const [followedUsers, setFollowedUsers] = useState(new Set());

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const fetchChallenges = useCallback(async () => {
    const { data } = await supabase
      .from("challenge_posts")
      .select("*, user:users(*)")
      .order("created_at", { ascending: false });
    if (data) setChallenges(data);
  }, []);

  const fetchVoiceNotes = useCallback(async () => {
    const { data } = await supabase
      .from("voice_notes")
      .select("*, user:users(*)")
      .order("created_at", { ascending: false });
    if (data) setVoiceNotes(data);
  }, []);

  const fetchStories = useCallback(async () => {
    const { data } = await supabase
      .from("story_threads")
      .select("*, entries:story_entries(*, user:users(*))")
      .order("created_at", { ascending: false });
    
    if (data) {
      const formatted = data.map(thread => ({
        ...thread,
        entries: (thread.entries || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }));
      setStoryThreads(formatted);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setNotifications(data);
  }, [user]);

  const fetchDailyChallenge = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { data: dcData } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('active_date', today)
      .maybeSingle();
    if (dcData) setDailyChallenge(dcData);
    else setDailyChallenge({ id: 'fallback', prompt: 'Share something creative today!', hashtag: '#FreeStyle', active_date: today });
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      const [{ data: likesData }, { data: reactData }, { data: followsData }] = await Promise.all([
        supabase.from('challenge_likes').select('post_id').eq('user_id', user.id),
        supabase.from('voice_reactions').select('note_id, reaction').eq('user_id', user.id),
        supabase.from('follows').select('following_id').eq('follower_id', user.id)
      ]);

      if (likesData) setLikedSet(new Set(likesData.map(l => l.post_id)));
      
      if (reactData) {
        const reacts = {};
        reactData.forEach(r => {
          if (!reacts[r.note_id]) reacts[r.note_id] = {};
          reacts[r.note_id][r.reaction] = true;
        });
        setReactedVoiceNotes(reacts);
      }

      if (followsData) setFollowedUsers(new Set(followsData.map(f => f.following_id)));
    } catch (e) {
      console.warn("Failed to fetch user data", e);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        fetchChallenges(),
        fetchVoiceNotes(),
        fetchStories(),
        fetchNotifications()
      ]);
    } catch (e) {
      console.error("Failed to load feed data", e);
    }
  }, [fetchChallenges, fetchVoiceNotes, fetchStories, fetchNotifications]);

  useEffect(() => {
    fetchData();
    fetchDailyChallenge();
  }, [fetchData, fetchDailyChallenge]);

  useEffect(() => {
    if (user) {
      fetchUserData();

      const channel = supabase.channel('feed-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_posts' }, () => fetchChallenges())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_notes' }, () => fetchVoiceNotes())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'story_threads' }, () => fetchStories())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'story_entries' }, () => fetchStories())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user, fetchChallenges, fetchVoiceNotes, fetchStories, fetchUserData]);

  const createNotification = async (targetUserId, kind, text) => {
    if (!user || targetUserId === user.id) return;
    try {
      await supabase.from("notifications").insert([{
        user_id: targetUserId,
        kind,
        text,
        read: false
      }]);
    } catch (e) {
      console.error("Error creating notification", e);
    }
  };

  const markNotificationsRead = async () => {
    if (!user) return;
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    } catch (e) {
      console.error("Error marking notifications read", e);
    }
  };

  const followUser = async (userId) => {
    if (!user) return;
    try {
      setFollowedUsers(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
      await supabase.from("follows").insert([{ follower_id: user.id, following_id: userId }]);
      await createNotification(userId, "follow", `${user?.handle || 'Someone'} started following you`);
    } catch (e) {
      console.error("Error following user", e);
    }
  };

  const unfollowUser = async (userId) => {
    if (!user) return;
    try {
      setFollowedUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
    } catch (e) {
      console.error("Error unfollowing user", e);
    }
  };

  const isFollowing = useCallback((userId) => {
    return followedUsers.has(userId);
  }, [followedUsers]);

  const postChallenge = async (caption, videoUrl = null, durationSec = 12) => {
    if (!user || !dailyChallenge) return;
    const newPost = {
      user_id: user.id,
      hashtag: dailyChallenge.hashtag,
      caption,
      likes: 0,
      comments: 0,
      thumbnail: "🎬",
      duration_sec: durationSec,
      video_url: videoUrl,
    };

    try {
      const { error } = await supabase.from("challenge_posts").insert([newPost]);
      if (error) throw error;
      
      await addSparks(SPARK_RULES.POST_CHALLENGE);
    } catch (e) {
      console.error("Error posting challenge", e);
    }
  };

  const recordVoiceNote = async (caption, topic, duetOf = null, audioUrl = null, durationSec = 15) => {
    if (!user) return;
    const newNote = {
      user_id: user.id,
      topic: topic || "#General",
      caption,
      duration_sec: durationSec,
      reactions: { heart: 0, laugh: 0, clap: 0 },
      duet_of: duetOf,
      audio_url: audioUrl,
    };

    try {
      const { error } = await supabase.from("voice_notes").insert([newNote]);
      if (error) throw error;

      await addSparks(duetOf ? SPARK_RULES.VOICE_DUET : SPARK_RULES.RECORD_VOICE_NOTE);
    } catch (e) {
      console.error("Error posting voice note", e);
    }
  };

  const likeChallenge = async (id) => {
    if (!user) return;
    try {
      const isAlreadyLiked = likedSet.has(id);
      
      const targetChallenge = challenges.find(c => c.id === id);

      if (isAlreadyLiked) {
        setLikedSet(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        setChallenges(prev =>
          prev.map(c => (c.id === id ? { ...c, likes: Math.max(0, c.likes - 1) } : c))
        );

        await supabase.from("challenge_likes").delete().eq("user_id", user.id).eq("post_id", id);
      } else {
        setLikedSet(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });

        setChallenges(prev =>
          prev.map(c => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
        );

        await supabase.from("challenge_likes").insert([{ user_id: user.id, post_id: id }]);
        
        if (targetChallenge?.user_id) {
          await createNotification(targetChallenge.user_id, "like", `${user?.handle || 'Someone'} liked your challenge`);
        }
      }
    } catch (e) {
      console.error("Error toggling like", e);
    }
  };

  const reactToVoice = async (id, reaction) => {
    if (!user) return;
    try {
      const noteReactions = reactedVoiceNotes[id] || {};
      const hasReacted = !!noteReactions[reaction];
      
      const targetNote = voiceNotes.find(v => v.id === id);

      setReactedVoiceNotes(prev => ({
        ...prev,
        [id]: { ...noteReactions, [reaction]: !hasReacted }
      }));

      setVoiceNotes(prev =>
        prev.map(v => {
          if (v.id === id) {
            const currentVal = v.reactions?.[reaction] || 0;
            return {
              ...v,
              reactions: {
                ...v.reactions,
                [reaction]: Math.max(0, hasReacted ? currentVal - 1 : currentVal + 1),
              },
            };
          }
          return v;
        })
      );

      if (hasReacted) {
        await supabase.from("voice_reactions").delete().eq("user_id", user.id).eq("note_id", id).eq("reaction", reaction);
      } else {
        await supabase.from("voice_reactions").insert([{ user_id: user.id, note_id: id, reaction }]);
        
        if (targetNote?.user_id) {
          await createNotification(targetNote.user_id, "reaction", `${user?.handle || 'Someone'} reacted to your voice note`);
        }
      }
    } catch (e) {
      console.error("Error reacting to voice note", e);
    }
  };

  const startStoryThread = async (title, firstLine, tags = []) => {
    if (!user) return;

    try {
      const { data: thread, error: tErr } = await supabase
        .from("story_threads")
        .insert([{ title, tags, ink_points: 20, is_public: true }])
        .select()
        .single();

      if (tErr) throw tErr;

      const { error: eErr } = await supabase
        .from("story_entries")
        .insert([{ thread_id: thread.id, user_id: user.id, text: firstLine }]);

      if (eErr) throw eErr;

      await addSparks(SPARK_RULES.START_STORY_THREAD);
    } catch (e) {
      console.error("Error starting story thread", e);
    }
  };

  const addStoryEntry = async (threadId, text) => {
    if (!user) return;

    try {
      const { error: eErr } = await supabase
        .from("story_entries")
        .insert([{ thread_id: threadId, user_id: user.id, text }]);

      if (eErr) throw eErr;

      const { data: thread } = await supabase
        .from("story_threads")
        .select("ink_points, story_entries(user_id)")
        .eq("id", threadId)
        .single();

      if (thread) {
        await supabase
          .from("story_threads")
          .update({ ink_points: (thread.ink_points || 0) + 10 })
          .eq("id", threadId);
          
        const creatorId = thread.story_entries?.[0]?.user_id;
        if (creatorId) {
           await createNotification(creatorId, "story_entry", `${user?.handle || 'Someone'} added to your story`);
        }
      }

      await addSparks(SPARK_RULES.ADD_STORY_ENTRY);
    } catch (e) {
      console.error("Error adding story entry", e);
    }
  };

  return (
    <DataContext.Provider
      value={{
        challenges,
        voiceNotes,
        storyThreads,
        notifications,
        dailyChallenge,
        likedChallenges: Array.from(likedSet),
        reactedVoiceNotes,
        postChallenge,
        recordVoiceNote,
        likeChallenge,
        reactToVoice,
        startStoryThread,
        addStoryEntry,
        refreshData: fetchData,
        followUser,
        unfollowUser,
        isFollowing,
        followedUsers,
        createNotification,
        unreadNotificationCount,
        markNotificationsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useAppData must be used within DataProvider");
  return ctx;
}
