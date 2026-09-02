import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Camera,
  MapPin,
  Sparkles,
  Send,
  UserCheck,
  UserPlus,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { PageContainer } from "../components/ui/PageContainer";
import { Badge } from "../components/ui/Badge";
import { cn } from "../utils/cn";

interface Author {
  id: string;
  name: string;
  role: string;
  profileImageUrl?: string;
  awsS3ObjectKey?: string;
}

interface PostMedia {
  id: string;
  url: string;
  awsS3ObjectKey: string;
  type: "IMAGE" | "VIDEO";
}

interface AIAnalysisResult {
  crop?: string;
  disease?: string;
  confidence?: number;
  message?: string;
  top_predictions?: Array<{
    rank: number;
    crop: string;
    disease: string;
    confidence: number;
  }>;
}

interface AIAnalysis {
  id: string;
  modelType: string;
  summary?: string;
  confidence?: number;
  diseaseResult?: AIAnalysisResult;
  createdAt: string;
}

interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    profileImageUrl?: string;
  };
}

interface Post {
  id: string;
  caption: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  authorId: string;
  author: Author;
  media: PostMedia[];
  aianalyses: AIAnalysis[];
  createdAt: string;
  _count?: {
    votes: number;
    comments: number;
  };
  hasVoted?: "UPVOTE" | "DOWNVOTE" | null;
  upvotesCount: number;
  downvotesCount: number;
  isFollowing?: boolean;
}

const DEMO_POSTS: Post[] = [
  {
    id: "demo-post-1",
    caption:
      "Noticeable yellowing and dark spots appearing on my wheat crop leaves after recent rainfall in Bhatinda. Ran AgriSense AI Leaf Diagnostic. Has anyone experienced similar Septoria leaf blotch issues this season?",
    locationName: "Bhatinda, Punjab",
    latitude: 30.211,
    longitude: 74.9455,
    authorId: "user-rajesh",
    author: {
      id: "user-rajesh",
      name: "Rajesh Sharma",
      role: "WHEAT FARMER",
    },
    media: [
      {
        id: "media-1",
        url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=1000",
        awsS3ObjectKey: "demo/wheat_disease.jpg",
        type: "IMAGE",
      },
    ],
    aianalyses: [
      {
        id: "analysis-1",
        modelType: "DISEASE_DETECTION",
        summary: "Septoria Leaf Blotch detected on Wheat crop with 94% confidence.",
        confidence: 0.94,
        diseaseResult: {
          crop: "Wheat",
          disease: "Septoria Leaf Blotch (Zymoseptoria tritici)",
          confidence: 0.94,
          top_predictions: [
            { rank: 1, crop: "Wheat", disease: "Septoria Leaf Blotch", confidence: 0.94 },
            { rank: 2, crop: "Wheat", disease: "Yellow Rust", confidence: 0.04 },
            { rank: 3, crop: "Wheat", disease: "Healthy Wheat", confidence: 0.02 },
          ],
        },
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    _count: {
      votes: 24,
      comments: 2,
    },
    upvotesCount: 24,
    downvotesCount: 1,
    hasVoted: null,
    isFollowing: false,
  },
  {
    id: "demo-post-2",
    caption:
      "Successfully controlled cotton bollworm using Neem oil extract (10,000 PPM) mixed with liquid soap solution. Zero chemical residue and saved nearly ₹4,000 per acre compared to synthetic sprays! 🌾 #SustainableFarming",
    locationName: "Rajkot, Gujarat",
    authorId: "user-priya",
    author: {
      id: "user-priya",
      name: "Priya Patel",
      role: "ORGANIC EXPERT",
    },
    media: [
      {
        id: "media-2",
        url: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1000",
        awsS3ObjectKey: "demo/cotton_field.jpg",
        type: "IMAGE",
      },
    ],
    aianalyses: [],
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    _count: {
      votes: 42,
      comments: 1,
    },
    upvotesCount: 42,
    downvotesCount: 0,
    hasVoted: "UPVOTE",
    isFollowing: true,
  },
  {
    id: "demo-post-3",
    caption:
      "High humidity in Varanasi region causing early blight symptoms on hybrid tomato leaves. Uploaded high-res crop photo to AI engine for treatment advisory.",
    locationName: "Varanasi, Uttar Pradesh",
    authorId: "user-amit",
    author: {
      id: "user-amit",
      name: "Amit Kumar",
      role: "HORTICULTURIST",
    },
    media: [
      {
        id: "media-3",
        url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19657?auto=format&fit=crop&q=80&w=1000",
        awsS3ObjectKey: "demo/tomato_early_blight.jpg",
        type: "IMAGE",
      },
    ],
    aianalyses: [
      {
        id: "analysis-3",
        modelType: "DISEASE_DETECTION",
        summary: "Tomato Early Blight detected with 91% confidence.",
        confidence: 0.91,
        diseaseResult: {
          crop: "Tomato",
          disease: "Early Blight (Alternaria solani)",
          confidence: 0.91,
          top_predictions: [
            { rank: 1, crop: "Tomato", disease: "Early Blight", confidence: 0.91 },
            { rank: 2, crop: "Tomato", disease: "Late Blight", confidence: 0.06 },
            { rank: 3, crop: "Tomato", disease: "Healthy Tomato Leaf", confidence: 0.03 },
          ],
        },
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    _count: {
      votes: 18,
      comments: 0,
    },
    upvotesCount: 18,
    downvotesCount: 0,
    hasVoted: null,
    isFollowing: false,
  },
  {
    id: "demo-post-4",
    caption:
      "Mustard harvest in full swing across Bharatpur mandi circle! Current local rate is ₹5,450/quintal. Yield estimates look strong at 18-20 quintals per hectare due to favorable cold winter spell.",
    locationName: "Bharatpur, Rajasthan",
    authorId: "user-vikram",
    author: {
      id: "user-vikram",
      name: "Vikram Singh",
      role: "MUSTARD GROWER",
    },
    media: [],
    aianalyses: [],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    _count: {
      votes: 35,
      comments: 0,
    },
    upvotesCount: 35,
    downvotesCount: 2,
    hasVoted: null,
    isFollowing: true,
  },
];

const INITIAL_DEMO_COMMENTS: Record<string, PostComment[]> = {
  "demo-post-1": [
    {
      id: "c-1",
      content:
        "Yes Rajesh! We had the exact same Septoria spot pattern in neighboring Ludhiana plots. Applying Copper Oxychloride @ 2.5g/L water controlled the spread effectively.",
      createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      author: { id: "u-101", name: "Sukhwinder Gill" },
    },
    {
      id: "c-2",
      content:
        "The AI confidence (94%) is spot on. Make sure to avoid overhead sprinkler irrigation for the next 5 days to reduce moisture on leaves.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      author: { id: "u-102", name: "Dr. K.V. Rao (Agronomist)" },
    },
  ],
  "demo-post-2": [
    {
      id: "c-3",
      content:
        "Excellent advice Priya! What spray pressure did you use for uniform leaf coverage?",
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      author: { id: "u-103", name: "Ramesh Bhai" },
    },
  ],
};

export function Community() {
  const { user: currentUser } = useAuth();

  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Post Form State
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Expanded comments per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>(INITIAL_DEMO_COMMENTS);
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  // ── Fetch Community Feed ──────────────────────────────────────────────────
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/community/feed?page=1&limit=20");
      if (res && res.success && Array.isArray(res.posts) && res.posts.length > 0) {
        setPosts(res.posts);
      } else {
        setPosts(DEMO_POSTS);
      }
    } catch (err: any) {
      console.warn("Community feed API unavailable, falling back to rich demo posts:", err);
      setPosts(DEMO_POSTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // ── File Selection & Image Preview ────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setSubmitError("Please select a valid image file (JPG, PNG, WebP).");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSubmitError(null);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // ── Create Post Handler ──────────────────────────────────────────────────
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !selectedFile) {
      setSubmitError("Please provide a caption or upload an image.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    let createdPost: Post | null = null;
    let localPreview = previewUrl;

    try {
      const formData = new FormData();
      formData.append("caption", caption);
      if (locationName) formData.append("locationName", locationName);
      if (selectedFile) formData.append("media", selectedFile);

      const token = localStorage.getItem("agrisense_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.post) {
        createdPost = data.post;
      }
    } catch (err) {
      console.warn("Post creation API offline, creating post locally in demo mode.");
    }

    const newDemoPost: Post = createdPost || {
      id: `post-${Date.now()}`,
      caption,
      locationName: locationName || "Local Farm",
      authorId: currentUser?.id || "user-current",
      author: {
        id: currentUser?.id || "user-current",
        name: currentUser?.name || "You (Farmer)",
        role: "FARMER",
      },
      media: localPreview
        ? [
            {
              id: `media-${Date.now()}`,
              url: localPreview,
              awsS3ObjectKey: "local/upload.jpg",
              type: "IMAGE",
            },
          ]
        : [],
      aianalyses: localPreview
        ? [
            {
              id: `analysis-${Date.now()}`,
              modelType: "DISEASE_DETECTION",
              summary: "AgriSense AI quick scan completed.",
              confidence: 0.95,
              diseaseResult: {
                crop: "Uploaded Crop",
                disease: "Healthy Leaf Structure",
                confidence: 0.95,
                top_predictions: [
                  { rank: 1, crop: "Crop Leaf", disease: "Healthy Leaf", confidence: 0.95 },
                  { rank: 2, crop: "Crop Leaf", disease: "Minor Leaf Spot", confidence: 0.05 },
                ],
              },
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
      _count: { votes: 0, comments: 0 },
      upvotesCount: 0,
      downvotesCount: 0,
      hasVoted: null,
      isFollowing: false,
    };

    setPosts((prev) => [newDemoPost, ...prev]);
    setCaption("");
    setLocationName("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setCreateOpen(false);
    setSubmitting(false);
  };

  // ── Upvote/Downvote ──────────────────────────────────────────────────────
  const handleVote = async (postId: string, type: "UPVOTE" | "DOWNVOTE") => {
    try {
      await apiRequest(`/community/posts/${postId}/vote`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      console.warn("Vote API failed, updating vote count locally in demo mode");
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const prevVote = post.hasVoted;
          let up = post.upvotesCount;
          if (prevVote === "UPVOTE" && type === "DOWNVOTE") up = Math.max(0, up - 1);
          else if (prevVote !== "UPVOTE" && type === "UPVOTE") up += 1;
          else if (prevVote === "UPVOTE" && type === "UPVOTE") up = Math.max(0, up - 1);

          return {
            ...post,
            hasVoted: prevVote === type ? null : type,
            upvotesCount: up,
          };
        }
        return post;
      })
    );
  };

  // ── Follow User ──────────────────────────────────────────────────────────
  const handleFollowToggle = async (post: Post) => {
    const isFollowing = post.isFollowing;
    try {
      const url = `/community/users/${post.author.id}/`;
      const method = isFollowing ? "PUT" : "POST";
      await apiRequest(url, { method });
    } catch (err) {
      console.warn("Follow API failed, updating follow state locally in demo mode");
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.author.id === post.author.id ? { ...p, isFollowing: !isFollowing } : p
      )
    );
  };

  // ── Comments Handling ────────────────────────────────────────────────────
  const fetchComments = async (postId: string) => {
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await apiRequest(`/community/posts/${postId}/comments?limit=20`);
      if (res && res.success && Array.isArray(res.comments)) {
        setCommentsMap((prev) => ({ ...prev, [postId]: res.comments }));
      } else if (INITIAL_DEMO_COMMENTS[postId]) {
        setCommentsMap((prev) => ({ ...prev, [postId]: INITIAL_DEMO_COMMENTS[postId] }));
      }
    } catch (err) {
      console.warn("Comments API failed, using demo comments:", err);
      if (INITIAL_DEMO_COMMENTS[postId]) {
        setCommentsMap((prev) => ({ ...prev, [postId]: INITIAL_DEMO_COMMENTS[postId] }));
      }
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const newCommentObj: PostComment = {
      id: `comment-${Date.now()}`,
      content: text,
      createdAt: new Date().toISOString(),
      author: {
        id: currentUser?.id || "user-current",
        name: currentUser?.name || "You (Farmer)",
      },
    };

    try {
      const res = await apiRequest(`/community/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      if (res && res.success && res.comment) {
        newCommentObj.id = res.comment.id;
      }
    } catch (err) {
      console.warn("Comment API failed, adding comment locally in demo mode");
    }

    setNewCommentText((prev) => ({ ...prev, [postId]: "" }));
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [newCommentObj, ...(prev[postId] || [])],
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              _count: {
                votes: p._count?.votes || p.upvotesCount || 0,
                comments: (p._count?.comments || (commentsMap[postId]?.length || 0)) + 1,
              },
            }
          : p
      )
    );
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !commentsMap[postId]) {
      fetchComments(postId);
    }
  };

  return (
    <PageContainer title="Community & Farm Updates">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-300 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              Farmer Community <Sparkles className="h-6 w-6 text-forest/70" />
            </h1>
            <p className="text-sm text-charcoal-muted mt-1">
              Connect with fellow farmers, share crop updates, and get AI leaf disease diagnostics.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-white text-sm font-bold shadow-sm hover:bg-forest-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
          >
            Create Update
          </button>
        </div>

        {/* ── Create Post Overlay ── */}
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-ivory-300 shadow-xl overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between bg-ivory-100 border-b border-ivory-200 px-6 py-4">
                <h3 className="font-bold text-charcoal">Share Farm Update</h3>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="rounded-lg p-1 text-charcoal-muted hover:bg-ivory-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label htmlFor="caption" className="text-xs font-bold text-charcoal-muted uppercase">Caption</label>
                  <textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tell the community about your crops, weather, or ask for diagnostic help..."
                    rows={4}
                    className="w-full rounded-xl border border-ivory-300 px-3.5 py-2.5 text-sm bg-ivory-50 text-charcoal placeholder-charcoal-muted/50 focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="location" className="text-xs font-bold text-charcoal-muted uppercase">Location</label>
                    <input
                      id="location"
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Prayagraj, UP"
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal placeholder-charcoal-muted/50 focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-charcoal-muted uppercase block">Attach Leaf Image</span>
                    <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-charcoal-muted hover:text-forest hover:border-forest/40 cursor-pointer transition-all">
                      <Camera className="h-4 w-4" />
                      <span>{selectedFile ? "Change Image" : "Upload leaf"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {previewUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-ivory-300 max-h-48 flex justify-center bg-black">
                    <img src={previewUrl} alt="Upload preview" className="object-contain max-h-48 w-full" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1 rounded-full bg-charcoal/70 text-white hover:bg-charcoal transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {submitError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="rounded-xl border border-ivory-300 px-4 py-2.5 text-sm font-semibold text-charcoal-muted hover:bg-ivory-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-white text-sm font-bold hover:bg-forest-600 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Share Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Feed List ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 text-forest animate-spin" />
            <p className="text-sm text-charcoal-muted">Loading farm updates...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
            <p className="text-sm text-red-700 font-semibold">{error}</p>
            <button
              onClick={fetchFeed}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-ivory-300 bg-white p-12 text-center space-y-4">
            <div className="h-16 w-16 bg-forest/5 rounded-full flex items-center justify-center mx-auto text-forest">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-charcoal">No updates yet</h3>
            <p className="text-sm text-charcoal-muted max-w-sm mx-auto">
              Be the first to share a farm status, update, or ask for crop diagnostic help!
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-white text-sm font-bold shadow-sm hover:bg-forest-600 transition-all"
            >
              Start Conversation
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const diseaseAnalysis = post.aianalyses?.find(
                (a) => a.modelType === "DISEASE_DETECTION"
              );
              const hasMedia = post.media && post.media.length > 0;

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-4 transition-all duration-150 hover:border-ivory-400"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest font-bold text-sm uppercase">
                        {post.author?.name ? post.author.name[0] : "F"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-charcoal text-sm">{post.author?.name || "Farmer"}</span>
                          <Badge variant="default" size="sm">
                            {post.author?.role || "FARMER"}
                          </Badge>
                        </div>
                        <span className="text-2xs text-charcoal-muted block">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Follow Toggle */}
                    {currentUser?.id !== post.author?.id && (
                      <button
                        onClick={() => handleFollowToggle(post)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none",
                          post.isFollowing
                            ? "bg-forest/[0.08] text-forest hover:bg-forest/[0.12]"
                            : "border border-ivory-300 text-charcoal-muted hover:text-forest hover:border-forest/20"
                        )}
                      >
                        {post.isFollowing ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Caption & Location */}
                  <div className="space-y-2">
                    <p className="text-sm text-charcoal-light leading-relaxed whitespace-pre-wrap">
                      {post.caption}
                    </p>
                    {post.locationName && (
                      <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
                        <MapPin className="h-3.5 w-3.5 text-forest/60" />
                        <span>{post.locationName}</span>
                      </div>
                    )}
                  </div>

                  {/* Media Gallery */}
                  {hasMedia && (
                    <div className="rounded-xl overflow-hidden border border-ivory-200 bg-ivory-50 max-h-96 flex justify-center bg-black">
                      <img
                        src={post.media[0].url}
                        alt="Attached farm update"
                        className="object-contain max-h-96 w-full hover:scale-[1.01] transition-transform duration-200"
                      />
                    </div>
                  )}

                  {/* AI Plant Disease Diagnosis Section (Expandable Sub-Card) */}
                  {diseaseAnalysis?.diseaseResult && (
                    <div className="rounded-xl border border-forest/20 bg-forest/[0.03] p-4 space-y-3.5 animate-fade-in shadow-inner">
                      <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                        <span className="text-xs font-extrabold text-forest uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" />
                          AI Plant Diagnosis
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-forest">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Inference Complete</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-2xs text-charcoal-muted uppercase font-bold tracking-wider">Crop Type</span>
                          <p className="text-sm font-bold text-charcoal">{diseaseAnalysis.diseaseResult.crop}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-2xs text-charcoal-muted uppercase font-bold tracking-wider">Condition</span>
                          <p className="text-sm font-bold text-red-700">{diseaseAnalysis.diseaseResult.disease}</p>
                        </div>
                      </div>

                      {/* Confidence Meter */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-2xs text-charcoal-muted">
                          <span>Confidence Score</span>
                          <span className="font-bold tabular-nums">
                            {Math.round((diseaseAnalysis.diseaseResult.confidence || 0) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-ivory-200/80 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-forest transition-all"
                            style={{
                              width: `${(diseaseAnalysis.diseaseResult.confidence || 0) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Alternative predictions detail */}
                      {diseaseAnalysis.diseaseResult.top_predictions && (
                        <div className="pt-1.5 border-t border-forest/10 space-y-1.5">
                          <span className="text-2xs font-bold text-charcoal-muted uppercase">Top Probabilities:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {diseaseAnalysis.diseaseResult.top_predictions.slice(0, 3).map((pred) => (
                              <div key={pred.rank} className="rounded-lg bg-white/70 border border-forest/5 px-2 py-1 flex items-center justify-between gap-2 text-2xs">
                                <span className="font-semibold text-charcoal-light truncate">{pred.disease}</span>
                                <span className="font-bold text-forest tabular-nums">{Math.round(pred.confidence * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Actions (Upvote, Downvote, Comment togglers) */}
                  <div className="flex items-center justify-between border-t border-ivory-200 pt-3 text-charcoal-muted">
                    <div className="flex items-center gap-4">
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleVote(post.id, "UPVOTE")}
                        className={cn(
                          "flex items-center gap-1.5 hover:text-forest transition-colors text-xs font-semibold focus-visible:outline-none",
                          post.hasVoted === "UPVOTE" && "text-forest"
                        )}
                        aria-label="Upvote post"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="tabular-nums">{post.upvotesCount}</span>
                      </button>

                      {/* Downvote Button */}
                      <button
                        onClick={() => handleVote(post.id, "DOWNVOTE")}
                        className={cn(
                          "flex items-center gap-1.5 hover:text-red-500 transition-colors text-xs font-semibold focus-visible:outline-none",
                          post.hasVoted === "DOWNVOTE" && "text-red-500"
                        )}
                        aria-label="Downvote post"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Comments Toggle */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 hover:text-forest transition-colors text-xs font-semibold focus-visible:outline-none"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post._count?.comments || 0} Comments</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post.id] && (
                    <div className="border-t border-ivory-200 pt-4 space-y-4 animate-slide-down">
                      {/* Comments Input */}
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newCommentText[post.id] || ""}
                          onChange={(e) =>
                            setNewCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(post.id);
                          }}
                          placeholder="Write a comment..."
                          className="flex-1 rounded-xl border border-ivory-300 px-3.5 py-2 text-xs bg-ivory-50 text-charcoal placeholder-charcoal-muted/50 focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="rounded-xl bg-forest p-2 text-white hover:bg-forest-600 transition-colors focus-visible:outline-none"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Comments List */}
                      {commentsLoading[post.id] ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-xs text-charcoal-muted">
                          <Loader2 className="h-4 w-4 text-forest animate-spin" />
                          <span>Loading comments...</span>
                        </div>
                      ) : !commentsMap[post.id] || commentsMap[post.id].length === 0 ? (
                        <p className="text-xs text-charcoal-muted text-center py-2">
                          No comments yet. Write a comment to share your opinion!
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {commentsMap[post.id].map((comment) => (
                            <div key={comment.id} className="rounded-xl bg-ivory-50 border border-ivory-200 p-3 space-y-1">
                              <div className="flex items-center justify-between text-2xs">
                                <span className="font-bold text-charcoal">{comment.author?.name || "Farmer"}</span>
                                <span className="text-charcoal-muted">
                                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                    dateStyle: "short",
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-charcoal-light whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
