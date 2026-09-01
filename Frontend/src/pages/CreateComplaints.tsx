import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
ArrowLeft,
FileText,
ImagePlus,
Send,
X,
AlertCircle,
CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const categories = [
{
value: "IRRIGATION",
label: "Irrigation",
},
{
value: "CROP_STORAGE",
label: "Crop Storage",
},
{
value: "MARKET_MONOPOLY",
label: "Market Monopoly",
},
{
value: "ORGANISED_CRIME",
label: "Organised Crime",
},
{
value: "PANCHAYAT_MISJUDGEMENT",
label: "Panchayat Misjudgement",
},
{
value: "OTHERS",
label: "Others",
},
];

export default function CreateComplaint() {
const navigate = useNavigate();
const fileInputRef = useRef<HTMLInputElement>(null);

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [category, setCategory] = useState("");

const [image, setImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

// --------------------------------------------------
// IMAGE SELECTION
// --------------------------------------------------

const handleImageChange = (
e: React.ChangeEvent<HTMLInputElement>
) => {
const file = e.target.files?.[0];


if (!file) return;

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
];

if (!allowedTypes.includes(file.type)) {
  setError("Only PNG, JPEG and JPG images are allowed.");
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setError("Image size must be less than 5 MB.");
  return;
}

setError("");

setImage(file);
setImagePreview(URL.createObjectURL(file));


};

const removeImage = () => {
setImage(null);
setImagePreview(null);

if (fileInputRef.current) {
  fileInputRef.current.value = "";
}


};

// --------------------------------------------------
// UPLOAD IMAGE TO S3
// --------------------------------------------------

const uploadImage = async (): Promise<string | null> => {
if (!image) {
return null;
}


// Step 1:
// Ask backend for a presigned S3 URL
const token = localStorage.getItem("agrisense_token")
const urlResponse = await fetch(
  `${API_URL}/complaints/upload-url`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
       Authorization: `Bearer ${token}`,
        
    },
    credentials: "include",
    body: JSON.stringify({
      fileName: image.name,
      fileType: image.type,
    }),
  }
);

const urlData = await urlResponse.json();

if (!urlResponse.ok) {
  throw new Error(
    urlData.message || "Failed to generate upload URL."
  );
}

if (!urlData.uploadUrl || !urlData.key) {
  throw new Error("Invalid upload URL response from server.");
}

// Step 2:
// Upload image directly to S3

console.log(token);
const uploadResponse = await fetch(urlData.uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": image.type,
      
  },
  body: image,
});

if (!uploadResponse.ok) {
  const errorText = await uploadResponse.text();

  console.error("S3 upload failed");
  console.error("Status:", uploadResponse.status);
  console.error("Response:", errorText);

  throw new Error(
    `S3 upload failed: ${uploadResponse.status}`
  );
}

// Step 3:
// Return S3 key
return urlData.key;


};

// --------------------------------------------------
// SUBMIT COMPLAINT
// --------------------------------------------------

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

setError("");
setSuccess("");

// Frontend validation
if (title.trim().length < 3) {
  setError("Title must be at least 3 characters long.");
  return;
}

if (title.trim().length > 100) {
  setError("Title cannot exceed 100 characters.");
  return;
}

if (description.trim().length < 10) {
  setError(
    "Description must be at least 10 characters long."
  );
  return;
}

if (description.trim().length > 1000) {
  setError(
    "Description cannot exceed 1000 characters."
  );
  return;
}

if (!category) {
  setError("Please select a category.");
  return;
}

setLoading(true);

try {
  // -----------------------------------------------
  // Upload image first
  // -----------------------------------------------

  const imageKey = await uploadImage();

  // -----------------------------------------------
  // Create complaint
  // -----------------------------------------------
const token = localStorage.getItem("agrisense_token")
  const response = await fetch(
    `${API_URL}/complaints`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        category,
        imageKey,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Failed to file complaint."
    );
  }

  setSuccess("Complaint filed successfully.");

  // Clear form
  setTitle("");
  setDescription("");
  setCategory("");
  removeImage();

  // Redirect after successful submission
  setTimeout(() => {
    navigate("/complaints");
  }, 1200);
} catch (err) {
  console.error("Create complaint error:", err);

  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(
      "Something went wrong. Please try again."
    );
  }
} finally {
  setLoading(false);
}


};

return ( <div className="min-h-screen bg-[#F7F5ED] px-4 py-8 sm:px-6 lg:px-8"> <div className="mx-auto max-w-3xl">


    {/* --------------------------------------------- */}
    {/* HEADER */}
    {/* --------------------------------------------- */}

    <div className="mb-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#315C3A] transition hover:text-[#23452B]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#315C3A] text-white shadow-sm">
          <FileText className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#26352A] sm:text-3xl">
            File a Complaint
          </h1>

          <p className="mt-1 text-sm leading-6 text-[#6B746D]">
            Tell us about the issue and we will make sure
            it reaches the right department.
          </p>
        </div>
      </div>
    </div>

    {/* --------------------------------------------- */}
    {/* FORM */}
    {/* --------------------------------------------- */}

    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E2E0D7] bg-white p-5 shadow-sm sm:p-8"
    >

      {/* ERROR MESSAGE */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      <div className="space-y-6">

        {/* ----------------------------------------- */}
        {/* TITLE */}
        {/* ----------------------------------------- */}

        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-[#334238]"
          >
            Complaint Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Enter complaint title"
            disabled={loading}
            maxLength={100}
            className="w-full rounded-xl border border-[#D9DCD7] bg-[#FCFCF9] px-4 py-3 text-sm text-[#26352A] outline-none transition placeholder:text-[#9AA19B] focus:border-[#315C3A] focus:ring-2 focus:ring-[#315C3A]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-[#8A918B]">
            {title.length}/100
          </div>
        </div>

        {/* ----------------------------------------- */}
        {/* CATEGORY */}
        {/* ----------------------------------------- */}

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-[#334238]"
          >
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-[#D9DCD7] bg-[#FCFCF9] px-4 py-3 text-sm text-[#26352A] outline-none transition focus:border-[#315C3A] focus:ring-2 focus:ring-[#315C3A]/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              Select a category
            </option>

            {categories.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* ----------------------------------------- */}
        {/* DESCRIPTION */}
        {/* ----------------------------------------- */}

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-[#334238]"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Describe the issue in detail..."
            disabled={loading}
            rows={6}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-[#D9DCD7] bg-[#FCFCF9] px-4 py-3 text-sm leading-6 text-[#26352A] outline-none transition placeholder:text-[#9AA19B] focus:border-[#315C3A] focus:ring-2 focus:ring-[#315C3A]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="mt-1 text-right text-xs text-[#8A918B]">
            {description.length}/1000
          </div>
        </div>

        {/* ----------------------------------------- */}
        {/* IMAGE */}
        {/* ----------------------------------------- */}

        <div>
          <label className="mb-2 block text-sm font-medium text-[#334238]">
            Attach Image
            <span className="ml-1 font-normal text-[#8A918B]">
              (Optional)
            </span>
          </label>

          {!imagePreview ? (
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={loading}
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#C9CEC9] bg-[#FAFAF6] px-6 py-10 text-center transition hover:border-[#315C3A] hover:bg-[#F4F7F1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EFE6] text-[#315C3A]">
                <ImagePlus className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-[#3C4B41]">
                Click to upload an image
              </p>

              <p className="mt-1 text-xs text-[#8A918B]">
                PNG, JPG or JPEG · Maximum 5 MB
              </p>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-[#D9DCD7] bg-[#FAFAF6]">

              <img
                src={imagePreview}
                alt="Complaint preview"
                className="max-h-80 w-full object-contain"
              />

              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/75 disabled:opacity-50"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="border-t border-[#E2E0D7] bg-white px-4 py-3">
                <p className="truncate text-sm font-medium text-[#334238]">
                  {image?.name}
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* BUTTONS */}
      {/* --------------------------------------------- */}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ECEAE2] pt-6 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="rounded-xl border border-[#D9DCD7] px-5 py-3 text-sm font-medium text-[#4A554E] transition hover:bg-[#F7F7F2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315C3A] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#274B2F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Filing Complaint...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              File Complaint
            </>
          )}
        </button>
      </div>
    </form>

    <p className="mt-5 text-center text-xs text-[#8A918B]">
      Please provide accurate information so your complaint
      can be resolved quickly.
    </p>
  </div>
</div>

);
}
