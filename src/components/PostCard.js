import React from "react";
import ChallengeCard from "./ChallengeCard";
import VoiceNoteCard from "./VoiceNoteCard";
import StoryThreadCard from "./StoryThreadCard";

// The unified home feed mixes all three content types (like Instagram mixing
// photos/reels/stories). This component renders the right card per type.
export default function PostCard({ item, onLikeChallenge, onReactVoice, onDuet, onOpenStory, likedChallenges = [], reactedVoiceNotes = {} }) {
  if (item.type === "challenge") {
    return <ChallengeCard post={item} onLike={onLikeChallenge} isLiked={likedChallenges.includes(item.id)} />;
  }
  if (item.type === "voice") {
    return <VoiceNoteCard note={item} onReact={onReactVoice} onDuet={onDuet} activeReactions={reactedVoiceNotes[item.id] || {}} />;
  }
  if (item.type === "story") {
    return <StoryThreadCard thread={item} onPress={onOpenStory} />;
  }
  return null;
}
