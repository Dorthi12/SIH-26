import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Edit2,
  Trash2,
  CheckCircle2,
  BookOpen,
  Image,
} from "lucide-react";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { PageContainer } from "../components/ui/PageContainer";
import { Badge } from "../components/ui/Badge";
import { cn } from "../utils/cn";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender?: string;
  phoneNumber?: string;
  role: string;
  dateOfBirth?: string;
  awsS3ObjectKey?: string;
  department?: string;
  city?: string;
  state?: string;
  position?: string;
  themePreference: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface UserPost {
  id: string;
  caption: string;
  locationName?: string;
  createdAt: string;
  media: Array<{ url: string }>;
  _count: {
    votes: number;
    comments: number;
  };
}

export function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editDOB, setEditDOB] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editDept, setEditDept] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Fetch Profile ────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest("/user");
        if (res) {
          setProfile(res);
          // Initialize edit form values
          setEditName(res.name || "");
          setEditPhone(res.phoneNumber || "");
          setEditGender(res.gender || "Prefer not to say");
          setEditDOB(res.dateOfBirth ? new Date(res.dateOfBirth).toISOString().split("T")[0] : "");
          setEditCity(res.city || "");
          setEditState(res.state || "");
          setEditPosition(res.position || "");
          setEditDept(res.department || "");

          // Load user posts
          loadUserPosts(res.id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // ── Load User's Posts ────────────────────────────────────────────────────
  async function loadUserPosts(userId: string) {
    try {
      setPostsLoading(true);
      const res = await apiRequest(`/community/posts/user/${userId}`);
      if (res.success && res.posts) {
        setMyPosts(res.posts);
      }
    } catch (err) {
      console.error("Failed to load user posts:", err);
    } finally {
      setPostsLoading(false);
    }
  }

  // ── Save Profile Changes ────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await apiRequest("/user", {
        method: "PUT",
        body: JSON.stringify({
          name: editName,
          phoneNumber: editPhone || undefined,
          gender: editGender,
          dateOfBirth: editDOB ? new Date(editDOB).toISOString() : undefined,
          city: editCity || undefined,
          state: editState || undefined,
          position: editPosition || undefined,
          department: editDept || undefined,
        }),
      });

      if (res) {
        setProfile(res);
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-forest animate-spin" />
        <p className="text-sm text-charcoal-muted">Loading your profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer maxWidth="md" className="py-12 bg-ivory">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-700">Error Loading Profile</h2>
          <p className="text-sm text-red-600">{error || "User data not found."}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl" className="py-8 md:py-12 bg-ivory">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left Column: Profile Card ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 text-center space-y-4">
            
            {/* Avatar */}
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-full bg-forest/10 border-2 border-forest/30 flex items-center justify-center text-forest font-bold text-3xl uppercase mx-auto">
                {profile.name[0]}
              </div>
              
              {/* Verification Status Icon */}
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-ivory-200 shadow-sm">
                {profile.isEmailVerified ? (
                  <ShieldCheck className="h-5 w-5 text-forest" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-amber" />
                )}
              </div>
            </div>

            {/* User Title */}
            <div>
              <h2 className="text-xl font-bold text-charcoal">{profile.name}</h2>
              <span className="text-xs text-charcoal-muted mt-1 block uppercase font-bold tracking-wider">
                {profile.role}
              </span>
            </div>

            {/* Verification Alert */}
            {!profile.isEmailVerified && (
              <div className="rounded-xl border border-amber/20 bg-amber/[0.04] p-3 text-center text-2xs text-amber-700 font-semibold">
                Email Verification Pending. Please check your inbox for the verification link.
              </div>
            )}

            <div className="border-t border-ivory-200 pt-4 space-y-3.5 text-left text-xs">
              <div className="flex items-center gap-3 text-charcoal-light">
                <Mail className="h-4 w-4 text-forest/70 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              {profile.phoneNumber && (
                <div className="flex items-center gap-3 text-charcoal-light">
                  <Phone className="h-4 w-4 text-forest/70 shrink-0" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              {(profile.city || profile.state) && (
                <div className="flex items-center gap-3 text-charcoal-light">
                  <MapPin className="h-4 w-4 text-forest/70 shrink-0" />
                  <span>
                    {[profile.city, profile.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {profile.createdAt && (
                <div className="flex items-center gap-3 text-charcoal-light">
                  <Calendar className="h-4 w-4 text-forest/70 shrink-0" />
                  <span>
                    Member since {new Date(profile.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal-light hover:bg-ivory-50 transition-colors focus-visible:outline-none"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <span className="text-2xs text-charcoal-muted uppercase font-bold">Posts</span>
              <p className="text-2xl font-extrabold text-forest">{myPosts.length}</p>
            </div>
            <div className="space-y-1 border-l border-ivory-200">
              <span className="text-2xs text-charcoal-muted uppercase font-bold">Status</span>
              <p className="text-sm font-extrabold text-charcoal mt-1">
                {profile.isEmailVerified ? "Verified" : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Column: Edit Profile or My Posts ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action result banner */}
          {saveSuccess && (
            <div className="flex items-center gap-2 text-sm text-forest bg-forest/[0.04] border border-forest/15 rounded-xl px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {isEditing ? (
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 space-y-6">
              <div className="border-b border-ivory-200 pb-4">
                <h3 className="text-lg font-bold text-charcoal">Edit Profile Details</h3>
                <p className="text-xs text-charcoal-muted mt-1">Update your farming profiles, credentials and locations.</p>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2.5 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">Date of Birth</label>
                    <input
                      type="date"
                      value={editDOB}
                      onChange={(e) => setEditDOB(e.target.value)}
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">State</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">Position/Designation</label>
                    <input
                      type="text"
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      placeholder="e.g. Lead Horticulturist"
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-muted uppercase">Department</label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      placeholder="e.g. Soil & Irrigation"
                      className="w-full rounded-xl border border-ivory-300 px-3.5 py-2 text-sm bg-ivory-50 text-charcoal focus:border-forest focus:ring-1 focus:ring-forest outline-none transition-all"
                    />
                  </div>
                </div>

                {saveError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-ivory-300 px-4 py-2.5 text-sm font-semibold text-charcoal-muted hover:bg-ivory-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-white text-sm font-bold hover:bg-forest-600 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* My Posts Heading */}
              <div className="flex items-center gap-2 border-b border-ivory-300 pb-4">
                <BookOpen className="h-5 w-5 text-forest/70" />
                <h3 className="font-bold text-charcoal">My Community Posts</h3>
              </div>

              {postsLoading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-xs text-charcoal-muted">
                  <Loader2 className="h-4 w-4 text-forest animate-spin" />
                  <span>Loading posts...</span>
                </div>
              ) : myPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-ivory-300 p-12 text-center space-y-3">
                  <Image className="h-10 w-10 text-charcoal-muted/50 mx-auto" />
                  <h4 className="font-bold text-charcoal text-sm">No community posts yet</h4>
                  <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                    Updates and diagnostic inquiries you publish in the community feed will show up here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-ivory-300 p-4 space-y-3 flex flex-col justify-between shadow-sm hover:border-ivory-400 transition-colors"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] text-charcoal-muted block">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                        <p className="text-xs text-charcoal-light leading-relaxed line-clamp-3">
                          {post.caption}
                        </p>
                      </div>

                      {post.media && post.media.length > 0 && (
                        <div className="rounded-lg overflow-hidden h-32 bg-ivory-50 flex items-center justify-center bg-black">
                          <img
                            src={post.media[0].url}
                            alt="Post attachments"
                            className="object-cover h-32 w-full"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-2xs text-charcoal-muted pt-2 border-t border-ivory-100">
                        <span>{post._count.votes} Upvotes</span>
                        <span>{post._count.comments} Comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </PageContainer>
  );
}
