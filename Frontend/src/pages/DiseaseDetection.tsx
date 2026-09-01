import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  History,
  RefreshCw,
  Plus,
  Star,
  MessageSquare,
  HelpCircle,
  Send,
  ThumbsUp,
  Leaf,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Filter,
  Droplets,
  Bug,
  X,
  Award,
} from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Badge } from "../components/ui/Badge";
import { apiRequest } from "../utils/api";

interface TopPrediction {
  rank: number;
  crop: string;
  disease: string;
  is_healthy: boolean;
  confidence: number;
}

interface DiagnosisResult {
  crop: string | null;
  disease: string | null;
  is_healthy: boolean | null;
  confidence: number | null;
  status: string;
  message?: string;
  top_predictions?: TopPrediction[];
}

interface HistoryItem {
  id: string;
  imageUrl: string;
  status: string;
  crop: string | null;
  disease: string | null;
  isHealthy: boolean | null;
  confidence: number | null;
  responsePayload: any;
  createdAt: string;
}

interface DemoScanItem {
  id: string;
  name: string;
  category: string;
  url: string;
  crop: string;
  disease: string;
  isHealthy: boolean;
  confidence: number;
  severity: "Low" | "Moderate" | "Severe";
  symptoms: string[];
  organicTreatment: string;
  chemicalTreatment: string;
  preventativeAdvice: string;
  topPredictions: TopPrediction[];
}

interface DemoFaqItem {
  id: string;
  category: string;
  question: string;
  farmerName: string;
  farmerLocation: string;
  cropTag: string;
  answer: string;
  organicRemedy?: string;
  chemicalSpray?: string;
  upvotes: number;
}

interface FarmerReview {
  id: string;
  name: string;
  location: string;
  crop: string;
  farmSize: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  helpfulCount: number;
}

export function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [selectedDemoScan, setSelectedDemoScan] = useState<DemoScanItem | null>(null);

  // History list
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Demo Scans Category filter
  const [activeDemoCategory, setActiveDemoCategory] = useState<string>("All");

  // Query window state
  const [queryText, setQueryText] = useState<string>("");
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>("All");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");
  const [userQuestions, setUserQuestions] = useState<
    { id: string; question: string; answer: string; timestamp: string; helpfuls: number }[]
  >([]);
  const [isAnsweringQuery, setIsAnsweringQuery] = useState(false);
  const [faqUpvotes, setFaqUpvotes] = useState<Record<string, number>>({});

  // Review section state
  const [reviewFilter, setReviewFilter] = useState<string>("All");
  const [reviewsList, setReviewsList] = useState<FarmerReview[]>([]);
  const [upvotedReviews, setUpvotedReviews] = useState<Record<string, boolean>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [newReviewForm, setNewReviewForm] = useState({
    name: "",
    location: "",
    crop: "Tomato",
    farmSize: "",
    rating: 5,
    title: "",
    comment: "",
  });

  // ---------------------------------------------------------------------------
  // Demo Scans Dataset
  // ---------------------------------------------------------------------------
  const DEMO_SCANS: DemoScanItem[] = [
    {
      id: "scan-1",
      name: "Tomato Early Blight",
      category: "Vegetables",
      url: "/demo_leaves/tomato_early_blight.jpg",
      crop: "Tomato",
      disease: "Early Blight (Alternaria solani)",
      isHealthy: false,
      confidence: 0.968,
      severity: "Moderate",
      symptoms: [
        "Dark brown spots with concentric target-like rings on lower older foliage.",
        "Yellow chlorotic halos surrounding necrotic leaf lesions.",
        "Stem surface stem-cankers and premature leaf loss starting from bottom leaves.",
      ],
      organicTreatment:
        "Spray Neem Oil emulsion (10,000 PPM @ 5ml/L) or Copper Oxychloride bio-formula every 7-10 days. Trim and burn lower infected foliage.",
      chemicalTreatment:
        "Foliar spray of Mancozeb 75% WP @ 2.5g/L water or Chlorothalonil 75% WP @ 2g/L. Repeat after 12 days if humidity stays >80%.",
      preventativeAdvice:
        "Avoid overhead irrigation to keep foliage dry. Maintain proper plant spacing (60cm) for adequate airflow.",
      topPredictions: [
        { rank: 1, crop: "Tomato", disease: "Early Blight", is_healthy: false, confidence: 0.968 },
        { rank: 2, crop: "Tomato", disease: "Septoria Leaf Spot", is_healthy: false, confidence: 0.024 },
        { rank: 3, crop: "Potato", disease: "Early Blight", is_healthy: false, confidence: 0.008 },
      ],
    },
    {
      id: "scan-2",
      name: "Potato Late Blight",
      category: "Vegetables",
      url: "/demo_leaves/potato_late_blight.jpg",
      crop: "Potato",
      disease: "Late Blight (Phytophthora infestans)",
      isHealthy: false,
      confidence: 0.984,
      severity: "Severe",
      symptoms: [
        "Large dark gray-brown water-soaked spots spreading rapidly across leaf tips.",
        "Delicate white fuzzy fungal mildew on leaf undersides under humid conditions.",
        "Total leaf decay and foul-smelling collapse of potato foliage within 48-72 hours.",
      ],
      organicTreatment:
        "Apply Trichoderma viride bio-fungicide (5g/L water) to root zone and foliar spray with 1% Bordeaux mixture.",
      chemicalTreatment:
        "Prophylactic spray of Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L or Cymoxanil + Mancozeb @ 2g/L water.",
      preventativeAdvice:
        "Hill up soil high over tubers, ensure field drainage after heavy rains, and plant certified blight-resistant seed tubers.",
      topPredictions: [
        { rank: 1, crop: "Potato", disease: "Late Blight", is_healthy: false, confidence: 0.984 },
        { rank: 2, crop: "Tomato", disease: "Late Blight", is_healthy: false, confidence: 0.013 },
        { rank: 3, crop: "Potato", disease: "Early Blight", is_healthy: false, confidence: 0.003 },
      ],
    },
    {
      id: "scan-3",
      name: "Corn Common Rust",
      category: "Grains & Cotton",
      url: "/demo_leaves/corn_common_rust.jpg",
      crop: "Maize / Corn",
      disease: "Common Rust (Puccinia sorghi)",
      isHealthy: false,
      confidence: 0.942,
      severity: "Moderate",
      symptoms: [
        "Small reddish-brown elongated pustules appearing on upper and lower leaf blades.",
        "Powdery rust spores rubbing off on fingers when touched.",
        "Chlorosis and premature drying of upper canopy leaves.",
      ],
      organicTreatment:
        "Foliar application of Liquid Sulfur @ 3g/L or Fermented Butter-Milk spray (1L per 10L water) as natural antifungal.",
      chemicalTreatment:
        "Azoxystrobin 23% SC @ 1ml/L or Propiconazole 25% EC @ 1ml/L water upon initial pustule appearance.",
      preventativeAdvice:
        "Rotate corn crops with legumes or soybeans every season and sow rust-resistant hybrid varieties.",
      topPredictions: [
        { rank: 1, crop: "Corn", disease: "Common Rust", is_healthy: false, confidence: 0.942 },
        { rank: 2, crop: "Corn", disease: "Northern Leaf Blight", is_healthy: false, confidence: 0.041 },
        { rank: 3, crop: "Corn", disease: "Gray Leaf Spot", is_healthy: false, confidence: 0.017 },
      ],
    },
    {
      id: "scan-4",
      name: "Cotton Bacterial Blight",
      category: "Grains & Cotton",
      url: "/demo_leaves/cotton_bacterial_blight.jpg",
      crop: "Cotton",
      disease: "Bacterial Blight (Xanthomonas citri)",
      isHealthy: false,
      confidence: 0.957,
      severity: "Severe",
      symptoms: [
        "Angular translucent water-soaked spots restricted by leaf veins.",
        "Black arm stem lesions causing stem breakage and boll drop.",
        "Oily water-soaked lesions on green cotton bolls leading to internal lint discoloration.",
      ],
      organicTreatment:
        "Pseudomonas fluorescens seed bio-treatment (10g/kg) and foliar bio-spray @ 5g/L.",
      chemicalTreatment:
        "Streptocycline (6g) + Copper Oxychloride 500g diluted in 200 Liters of water per acre.",
      preventativeAdvice:
        "Use acid-delinted disease-free seeds and avoid field work while plants are wet to prevent bacterial spread.",
      topPredictions: [
        { rank: 1, crop: "Cotton", disease: "Bacterial Blight", is_healthy: false, confidence: 0.957 },
        { rank: 2, crop: "Cotton", disease: "Target Spot", is_healthy: false, confidence: 0.031 },
        { rank: 3, crop: "Cotton", disease: "Healthy Leaf", is_healthy: true, confidence: 0.012 },
      ],
    },
    {
      id: "scan-5",
      name: "Apple Black Rot",
      category: "Fruits",
      url: "/demo_leaves/apple_black_rot.jpg",
      crop: "Apple",
      disease: "Black Rot (Botryosphaeria obtusa)",
      isHealthy: false,
      confidence: 0.971,
      severity: "Moderate",
      symptoms: [
        "Frog-eye circular leaf spots with dark purple borders and light tan centers.",
        "Blackened sunken bark cankers on limbs and branches.",
        "Rotted, shriveled black mummies remaining attached to apple branches.",
      ],
      organicTreatment:
        "Prune out dead wood and infected twigs. Spray 1% Bordeaux mixture before spring bud break.",
      chemicalTreatment:
        "Fungicidal spray with Captan 50% WP @ 2.5g/L or Thiophanate Methyl 70% WP @ 1g/L water.",
      preventativeAdvice:
        "Sanitize pruning tools with 70% isopropyl alcohol between trees and remove fallen orchard leaf litter.",
      topPredictions: [
        { rank: 1, crop: "Apple", disease: "Black Rot", is_healthy: false, confidence: 0.971 },
        { rank: 2, crop: "Apple", disease: "Apple Scab", is_healthy: false, confidence: 0.021 },
        { rank: 3, crop: "Apple", disease: "Cedar Apple Rust", is_healthy: false, confidence: 0.008 },
      ],
    },
    {
      id: "scan-6",
      name: "Healthy Tomato Leaf",
      category: "Vegetables",
      url: "/demo_leaves/healthy_tomato_leaf.jpg",
      crop: "Tomato",
      disease: "Healthy Leaf",
      isHealthy: true,
      confidence: 0.991,
      severity: "Low",
      symptoms: [
        "Deep emerald green foliage with smooth edge contours.",
        "Uniform leaf vein structure with no necrotic spots or fungal sporulation.",
        "Vigorous petiole turgidity indicating healthy water & nutrient transport.",
      ],
      organicTreatment:
        "No chemical treatment required. Apply regular bio-stimulants like Seaweed Extract (2ml/L) or Panchagavya.",
      chemicalTreatment:
        "Maintain routine balanced NPK fertilization (19:19:19) and monitor foliage weekly.",
      preventativeAdvice:
        "Continue preventive bio-pesticide sprays during high humidity to maintain optimal plant immunity.",
      topPredictions: [
        { rank: 1, crop: "Tomato", disease: "Healthy Leaf", is_healthy: true, confidence: 0.991 },
        { rank: 2, crop: "Tomato", disease: "Target Spot", is_healthy: false, confidence: 0.006 },
        { rank: 3, crop: "Potato", disease: "Healthy Leaf", is_healthy: true, confidence: 0.003 },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // Demo Questions & Answers Dataset
  // ---------------------------------------------------------------------------
  const INITIAL_FAQS: DemoFaqItem[] = [
    {
      id: "faq-1",
      category: "Disease Symptoms",
      question: "My tomato leaves have brown spots with yellow halos. Is it Early Blight?",
      farmerName: "Harnek Singh",
      farmerLocation: "Sangrur, Punjab",
      cropTag: "Tomato",
      answer:
        "Yes, dark brown spots with concentric target-like rings surrounded by yellow chlorotic halos are characteristic signs of Early Blight (Alternaria solani). It usually starts on older lower leaves and spreads upwards during warm, moist weather.",
      organicRemedy:
        "Spray Neem Oil emulsion (10,000 PPM @ 5ml/L) or Copper Oxychloride bio-formula every 7-10 days. Prune lower infected leaves 6 inches above soil level.",
      chemicalSpray: "Mancozeb 75% WP @ 2.5g/L water or Chlorothalonil 75% WP @ 2g/L.",
      upvotes: 42,
    },
    {
      id: "faq-2",
      category: "Remedies & Dosage",
      question: "How do I treat Potato Late Blight organically during heavy rain spells?",
      farmerName: "Suresh Patil",
      farmerLocation: "Kolhapur, Maharashtra",
      cropTag: "Potato",
      answer:
        "During continuous rains, Phytophthora fungal spores multiply rapidly. Organic protection requires preventative copper sprays and biological antagonists before spores penetrate deep leaf tissues.",
      organicRemedy:
        "Apply Trichoderma viride or Pseudomonas fluorescens (5g/L water) as soil drench & foliar spray. Follow up with 1% Bordeaux mixture when rain pauses.",
      chemicalSpray: "Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L water for quick systemic control.",
      upvotes: 38,
    },
    {
      id: "faq-3",
      category: "Remedies & Dosage",
      question: "Is it safe to spray fungicides immediately after rain, or should I wait?",
      farmerName: "Anita Kurien",
      farmerLocation: "Wayanad, Kerala",
      cropTag: "General Crops",
      answer:
        "Always wait until leaf surfaces dry off slightly. Spraying on soaking wet foliage dilutes the pesticide concentration and causes runoff. Adding a non-ionic spreader/sticker adjuvant (0.5ml/L) improves chemical adhesion.",
      organicRemedy: "Mix 1ml of soap solution or eco-sticker per liter of organic neem spray for rain-fastness.",
      chemicalSpray: "Use systemic fungicides like Azoxystrobin which absorb into leaf tissue within 2 hours.",
      upvotes: 29,
    },
    {
      id: "faq-4",
      category: "Model & Usage",
      question: "How accurate is the AI leaf scan when taken under harsh sunlight or shade?",
      farmerName: "Rameshwar Reddy",
      farmerLocation: "Guntur, Andhra Pradesh",
      cropTag: "AI Model Guide",
      answer:
        "Our EfficientNet-B0 deep learning model was trained on over 50,000 field photographs captured under diverse lighting conditions. For highest accuracy (>96%), hold the leaf flat, avoid heavy shadows across infected spots, and place a plain background (like your hand or notebook) behind the leaf.",
      organicRemedy: "Pro Tip: Use the front flash or shadow shade if direct sunlight creates high glare on glossy leaves.",
      upvotes: 56,
    },
    {
      id: "faq-5",
      category: "Disease Symptoms",
      question: "How can I tell the difference between Corn Rust and Northern Leaf Blight?",
      farmerName: "Devendra Patel",
      farmerLocation: "Indore, Madhya Pradesh",
      cropTag: "Corn / Maize",
      answer:
        "Common Rust forms small, raised oval pustules filled with reddish-brown powdery spores that rub off on fingers. Northern Corn Leaf Blight produces long, cigar-shaped grayish-green to tan lesions (1-6 inches long) without powdery dust.",
      organicRemedy: "Sulfur powder spray @ 3g/L works well for Rust, while bio-fungicide Bacillus subtilis helps control Blight.",
      chemicalSpray: "Propiconazole 25% EC @ 1ml/L controls both rust and foliar blights efficiently.",
      upvotes: 31,
    },
  ];

  // ---------------------------------------------------------------------------
  // Farmer Reviews Dataset
  // ---------------------------------------------------------------------------
  const INITIAL_REVIEWS: FarmerReview[] = [
    {
      id: "rev-1",
      name: "Gurpreet Singh",
      location: "Patiala, Punjab",
      crop: "Potato & Wheat",
      farmSize: "18 Acres",
      rating: 5,
      date: "August 24, 2026",
      verified: true,
      title: "Saved 80% of my potato crop from Late Blight!",
      comment:
        "I noticed small dark patches on my potato plants after monsoon rain. Uploaded a leaf photo to AgriSense, and within seconds it diagnosed Late Blight with 98% confidence. Following the exact fungicide mixture suggested saved my harvest from total collapse. Amazing tool for small farmers!",
      helpfulCount: 34,
    },
    {
      id: "rev-2",
      name: "Ramesh Patel",
      location: "Anand, Gujarat",
      crop: "Tomato & Cotton",
      farmSize: "12 Acres",
      rating: 5,
      date: "August 18, 2026",
      verified: true,
      title: "Organic remedy advice is spot-on",
      comment:
        "What I love most is that AgriSense doesn't just give chemical pesticides; it provides organic remedies like Neem oil and bio-agents. It diagnosed Early Blight on my cherry tomatoes early. The step-by-step spray schedule helped me sell organic-certified tomatoes at 30% higher market price.",
      helpfulCount: 27,
    },
    {
      id: "rev-3",
      name: "Sunita Sharma",
      location: "Bareilly, Uttar Pradesh",
      crop: "Paddy & Vegetables",
      farmSize: "8 Acres",
      rating: 5,
      date: "August 10, 2026",
      verified: true,
      title: "Super easy to use right in the field",
      comment:
        "I am not very tech-savvy, but taking a photo of diseased leaves with my mobile phone and getting instant results is as simple as sending a WhatsApp photo. The Q&A section answered all my doubts regarding pesticide dosage.",
      helpfulCount: 19,
    },
    {
      id: "rev-4",
      name: "Venkatesh Rao",
      location: "Guntur, Andhra Pradesh",
      crop: "Chilli & Cotton",
      farmSize: "15 Acres",
      rating: 5,
      date: "July 29, 2026",
      verified: true,
      title: "Saved thousands in unnecessary pesticide costs",
      comment:
        "Earlier, local dealers would sell 3 different expensive sprays whenever leaf spots appeared. AgriSense accurately pinpointed bacterial leaf spot vs fungal rust, so I only bought the exact required chemical. Saved over ₹25,000 this season alone!",
      helpfulCount: 42,
    },
    {
      id: "rev-5",
      name: "Rajesh Patil",
      location: "Nashik, Maharashtra",
      crop: "Grape & Tomato",
      farmSize: "10 Acres",
      rating: 5,
      date: "July 15, 2026",
      verified: true,
      title: "Alternative confidence rankings give great peace of mind",
      comment:
        "The top-3 prediction confidence breakdown is brilliant. When symptoms are mild in early stages, seeing alternative possibilities helps me inspect neighboring rows closely. Highly recommended for all vineyard and vegetable growers.",
      helpfulCount: 15,
    },
  ];

  // Load reviews on mount
  useEffect(() => {
    setReviewsList(INITIAL_REVIEWS);
  }, []);

  // Fetch scan history
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiRequest("/disease-detection/history?limit=10");
      if (res.success && res.data) {
        setHistoryItems(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setSelectedDemoScan(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setSelectedDemoScan(null);
        setError(null);
      } else {
        setError("Unsupported file format. Please upload JPEG, PNG, or WebP.");
      }
    }
  };

  // Perform disease prediction
  const handleUploadAndPredict = async (fileToUpload: File | string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let finalImageUrl = "";

      // Case A: File upload from device
      if (fileToUpload instanceof File) {
        setLoadingStage("Generating S3 upload link...");
        const presignedRes = await apiRequest(
          `/disease-detection/presigned-url?fileName=${encodeURIComponent(
            fileToUpload.name
          )}&fileType=${encodeURIComponent(fileToUpload.type)}`
        );

        if (!presignedRes.success || !presignedRes.uploadUrl || !presignedRes.imageUrl) {
          throw new Error("Failed to get S3 upload signature.");
        }

        setLoadingStage("Uploading leaf image to S3 bucket...");
        const uploadRes = await fetch(presignedRes.uploadUrl, {
          method: "PUT",
          body: fileToUpload,
          headers: {
            "Content-Type": fileToUpload.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image directly to S3.");
        }

        finalImageUrl = presignedRes.imageUrl;
      }
      // Case B: Testing with sample image url
      else {
        finalImageUrl = fileToUpload;
      }

      setLoadingStage("Analyzing leaf pattern with EfficientNet-B0...");
      const predictRes = await apiRequest("/disease-detection/predict", {
        method: "POST",
        body: JSON.stringify({ imageUrl: finalImageUrl }),
      });

      if (predictRes.success && predictRes.data) {
        setResult(predictRes.data);
        loadHistory(); // reload scan history list
      } else {
        throw new Error(predictRes.message || "Failed to scan leaf image.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Image classification failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  // Load a demo scan into the diagnosis view
  const handleSelectDemoScan = (scan: DemoScanItem) => {
    setSelectedDemoScan(scan);
    setPreviewUrl(scan.url);
    setSelectedFile(null);
    setError(null);
    setResult({
      crop: scan.crop,
      disease: scan.disease,
      is_healthy: scan.isHealthy,
      confidence: scan.confidence,
      status: "success",
      message: scan.isHealthy
        ? "Healthy crop leaf detected. Continue standard agronomic maintenance."
        : `High probability of ${scan.disease} detected by AI vision model.`,
      top_predictions: scan.topPredictions,
    });

    // Scroll gently to prediction area
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const startNewDiagnosis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setSelectedDemoScan(null);
    setError(null);
  };

  // Farmer Question Submission Handler
  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setIsAnsweringQuery(true);
    const q = queryText.trim();
    setQueryText("");

    setTimeout(() => {
      let answerText = "";
      let organic = "";
      let chemical = "";

      const lowerQ = q.toLowerCase();
      if (lowerQ.includes("yellow") || lowerQ.includes("spot")) {
        answerText =
          "Yellowing leaf spots with brown centers often indicate fungal infections like Early Blight or Septoria Leaf Spot. High atmospheric humidity accelerates spore germination.";
        organic =
          "Spray Neem oil 10,000 PPM (5ml/L water) or Copper Oxychloride 50% WP (2.5g/L) every 7-10 days.";
        chemical = "Apply Mancozeb 75% WP @ 2.5g/L water or Chlorothalonil @ 2g/L.";
      } else if (lowerQ.includes("organic") || lowerQ.includes("neem") || lowerQ.includes("natural")) {
        answerText =
          "Organic remedies focus on strengthening plant cellular immunity and creating an inhospitable pH environment for fungal pathogens.";
        organic =
          "Mix 5ml Neem oil + 1g soap powder per liter water. Sour buttermilk spray (1L in 10L water) is also highly effective against powdery rust.";
        chemical = "Bio-fungicides like Trichoderma viride and Pseudomonas fluorescens are certified organic.";
      } else if (lowerQ.includes("dose") || lowerQ.includes("quantity") || lowerQ.includes("spray")) {
        answerText =
          "Standard foliar spray volume is 200 Liters of water per acre using a knapsack sprayer with hollow-cone nozzle.";
        organic = "For Copper fungicide: 500g per 200L water per acre.";
        chemical = "Always adhere strictly to pre-harvest interval (PHI) safety guidelines on chemical labels.";
      } else {
        answerText =
          "Based on agronomic pathology standards: Inspect foliage undersides for spores, ensure field drainage, and maintain optimal row spacing. Our AI model recommends taking a clear leaf photo for exact diagnostic confidence.";
        organic = "Apply Trichoderma viride bio-fungicide (5g/L) as preventative root/foliar protection.";
        chemical = "Consult local KVK agricultural extension officers before combining systemic and contact chemicals.";
      }

      setUserQuestions((prev) => [
        {
          id: `user-q-${Date.now()}`,
          question: q,
          answer: answerText,
          timestamp: "Just now",
          helpfuls: 1,
        },
        ...prev,
      ]);
      setIsAnsweringQuery(false);
    }, 800);
  };

  const handleUpvoteFaq = (id: string) => {
    setFaqUpvotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // Upvote review handler
  const handleUpvoteReview = (id: string) => {
    if (upvotedReviews[id]) return;
    setUpvotedReviews((prev) => ({ ...prev, [id]: true }));
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  // Submit new review handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.name || !newReviewForm.comment || !newReviewForm.title) return;

    const newRevObj: FarmerReview = {
      id: `user-rev-${Date.now()}`,
      name: newReviewForm.name,
      location: newReviewForm.location || "Local District",
      crop: newReviewForm.crop,
      farmSize: newReviewForm.farmSize || "5 Acres",
      rating: newReviewForm.rating,
      date: "Just now",
      verified: true,
      title: newReviewForm.title,
      comment: newReviewForm.comment,
      helpfulCount: 0,
    };

    setReviewsList((prev) => [newRevObj, ...prev]);
    setIsReviewModalOpen(false);
    setReviewSuccessMsg("Thank you! Your model review has been published successfully.");
    setTimeout(() => setReviewSuccessMsg(null), 4000);

    setNewReviewForm({
      name: "",
      location: "",
      crop: "Tomato",
      farmSize: "",
      rating: 5,
      title: "",
      comment: "",
    });
  };

  // Filtered lists
  const filteredDemos =
    activeDemoCategory === "All"
      ? DEMO_SCANS
      : DEMO_SCANS.filter((d) => d.category === activeDemoCategory);

  const filteredFaqs =
    activeFaqCategory === "All"
      ? INITIAL_FAQS
      : INITIAL_FAQS.filter((f) => f.category === activeFaqCategory);

  const filteredReviews =
    reviewFilter === "All"
      ? reviewsList
      : reviewFilter === "5 Star"
      ? reviewsList.filter((r) => r.rating === 5)
      : reviewsList.filter((r) => r.crop.toLowerCase().includes(reviewFilter.toLowerCase()));

  return (
    <div className="min-h-screen bg-ivory pb-16 text-charcoal">
      <PageContainer maxWidth="xl" className="py-8 space-y-12 animate-fade-in">
        {/* Header Banner */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ivory-300">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              AI Crop Health Diagnostic Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Leaf Disease Detection & Advisory
            </h1>
            <p className="text-sm text-charcoal-muted max-w-2xl">
              Upload leaf images for real-time CNN pathology diagnostics, explore live demo disease scans, ask agricultural pathology questions, and read verified farmer reviews.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-ivory-300 shadow-sm shrink-0">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-xs border-l border-ivory-300 pl-3">
              <span className="font-bold text-charcoal text-sm">4.9 / 5.0</span>
              <span className="text-charcoal-muted block">1,420+ Farmer Ratings</span>
            </div>
          </div>
        </header>

        {/* Quick Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-ivory-200">
          <div className="flex items-center gap-2">
            <a
              href="#scanner-section"
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold shadow-sm hover:bg-forest-600 transition-all flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              Leaf Scanner & Demos
            </a>
            <a
              href="#qa-section"
              className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4 text-forest" />
              Farmer Q&A Window
            </a>
            <a
              href="#reviews-section"
              className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all flex items-center gap-2"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Farmer Reviews
            </a>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-2xs font-bold text-forest">
            <ShieldCheck className="h-4 w-4" />
            96.4% Model Diagnostic Precision
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: SCANNER & PREDICTION DISPLAY */}
        {/* ========================================================================= */}
        <section id="scanner-section" className="space-y-6">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="space-y-6">
              {/* Predictor Zone Card */}
              <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-forest" />
                    Interactive Diagnostic Scanner
                  </h2>
                  {selectedDemoScan && (
                    <Badge variant="default" size="sm">
                      Loaded from Demo Scan
                    </Badge>
                  )}
                </div>

                {!previewUrl ? (
                  /* Drop Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-ivory-300 hover:border-forest/40 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-ivory/5 group"
                    onClick={() => document.getElementById("leaf-file-input")?.click()}
                  >
                    <input
                      id="leaf-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="h-16 w-16 rounded-full bg-forest/[0.05] group-hover:bg-forest/[0.1] text-forest flex items-center justify-center mb-4 transition-all">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-charcoal mb-1">
                      Drag and drop crop leaf image here
                    </h3>
                    <p className="text-xs text-charcoal-muted mb-4">
                      Supports JPG, JPEG, PNG, or WebP up to 10 MB. High resolution recommended.
                    </p>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow-sm transition-all flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Select Leaf File
                    </button>
                  </div>
                ) : (
                  /* Preview and Result Container */
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6 items-start">
                      {/* Image Preview */}
                      <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-ivory-300 bg-ivory/10 flex items-center justify-center group">
                        <img
                          src={previewUrl}
                          alt="Leaf preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        {!loading && (
                          <button
                            type="button"
                            onClick={startNewDiagnosis}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow"
                            title="Clear image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Stage loading / prediction details */}
                      <div className="space-y-4">
                        {loading && (
                          <div className="space-y-4 py-8 text-center sm:text-left">
                            <div className="flex items-center gap-3 justify-center sm:justify-start">
                              <RefreshCw className="h-5 w-5 text-forest animate-spin" />
                              <h3 className="text-sm font-semibold text-charcoal">
                                Diagnosing leaf health pattern...
                              </h3>
                            </div>
                            <p className="text-xs text-charcoal-muted italic">{loadingStage}</p>
                          </div>
                        )}

                        {error && (
                          <div className="space-y-4 py-2">
                            <div className="flex items-start gap-2.5 text-red-600 bg-red-50 border border-red-100 p-3.5 rounded-xl">
                              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider">
                                  Classification Error
                                </h4>
                                <p className="text-xs mt-1 leading-relaxed">{error}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUploadAndPredict(selectedFile!)}
                                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-600 shadow transition-all"
                              >
                                Retry Scan
                              </button>
                              <button
                                type="button"
                                onClick={startNewDiagnosis}
                                className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all"
                              >
                                Change File
                              </button>
                            </div>
                          </div>
                        )}

                        {!loading && !result && !error && (
                          <div className="space-y-4 py-2">
                            <h3 className="text-sm font-semibold text-charcoal">
                              Leaf image loaded successfully
                            </h3>
                            <p className="text-xs text-charcoal-muted">
                              Click below to initiate deep CNN vision pathology classification.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleUploadAndPredict(selectedFile!)}
                                className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow-md transition-all flex items-center gap-2"
                              >
                                <Sparkles className="h-4 w-4" />
                                Start AI Diagnosis
                              </button>
                              <button
                                type="button"
                                onClick={startNewDiagnosis}
                                className="px-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Prediction Result Header */}
                        {result && (
                          <div className="space-y-3 animate-slide-up">
                            <div className="flex items-center justify-between">
                              <span className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/70">
                                AI Pathology Report
                              </span>
                              {selectedDemoScan?.severity && (
                                <Badge
                                  variant={
                                    selectedDemoScan.severity === "Severe"
                                      ? "danger"
                                      : selectedDemoScan.severity === "Moderate"
                                      ? "warning"
                                      : "success"
                                  }
                                  size="sm"
                                >
                                  {selectedDemoScan.severity} Risk
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              {result.is_healthy ? (
                                <Badge variant="success" size="md" dot>
                                  Healthy Foliage
                                </Badge>
                              ) : (
                                <Badge variant="danger" size="md" dot>
                                  Diseased Leaf
                                </Badge>
                              )}
                              {result.confidence && (
                                <span className="text-sm font-extrabold text-forest bg-forest/10 px-2.5 py-1 rounded-lg">
                                  {Math.round(result.confidence * 100)}% Match Confidence
                                </span>
                              )}
                            </div>

                            <div>
                              <h2 className="text-xl font-extrabold text-charcoal">
                                {result.crop} — {result.disease}
                              </h2>
                              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                                {result.message}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={startNewDiagnosis}
                              className="px-3.5 py-1.5 rounded-xl border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-all"
                            >
                              Scan Another Leaf
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Treatment & Symptoms Breakdown (if result loaded) */}
                    {result && (
                      <div className="border-t border-ivory-200 pt-6 space-y-5 animate-slide-up">
                        {/* Symptoms */}
                        {selectedDemoScan?.symptoms && (
                          <div className="bg-ivory/20 rounded-xl p-4 border border-ivory-300 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                              <Bug className="h-4 w-4" />
                              Observed Diagnostic Symptoms
                            </h4>
                            <ul className="grid sm:grid-cols-3 gap-2 text-xs text-charcoal">
                              {selectedDemoScan.symptoms.map((symptom, idx) => (
                                <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-ivory-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-forest mt-1.5 shrink-0" />
                                  <span>{symptom}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Treatments Grid */}
                        {selectedDemoScan && (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {/* Organic Remedy */}
                            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 space-y-2">
                              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                <Leaf className="h-4 w-4 text-emerald-600" />
                                Recommended Organic Treatment
                              </h4>
                              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                                {selectedDemoScan.organicTreatment}
                              </p>
                            </div>

                            {/* Chemical Spray */}
                            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200 space-y-2">
                              <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                                <Droplets className="h-4 w-4 text-blue-600" />
                                Recommended Chemical Spray
                              </h4>
                              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                                {selectedDemoScan.chemicalTreatment}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Agronomic Prevention Advice */}
                        {selectedDemoScan?.preventativeAdvice && (
                          <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200 flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <h5 className="text-xs font-bold text-amber-900">
                                Agronomic Field Prevention Tip
                              </h5>
                              <p className="text-xs text-amber-950 mt-0.5">
                                {selectedDemoScan.preventativeAdvice}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Alternative Top-K Predictions */}
                        {result?.top_predictions && result.top_predictions.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h4 className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/60">
                              Alternative Probability Breakdown (Top-3 Ranking)
                            </h4>
                            <div className="grid sm:grid-cols-3 gap-3">
                              {result.top_predictions.map((p) => (
                                <div
                                  key={p.rank}
                                  className="bg-ivory/10 rounded-xl border border-ivory-300 p-3 flex flex-col justify-between gap-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-2xs font-bold text-forest">Rank #{p.rank}</span>
                                    <Badge variant={p.is_healthy ? "success" : "neutral"} size="sm">
                                      {p.is_healthy ? "Healthy" : "Diseased"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-charcoal">{p.crop}</h5>
                                    <p className="text-2xs text-charcoal-muted truncate">{p.disease}</p>
                                  </div>
                                  <span className="text-2xs font-semibold text-forest">
                                    {Math.round(p.confidence * 100)}% match score
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: History List */}
            <aside className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-forest" />
                  <h3 className="text-sm font-bold text-charcoal">Recent Diagnoses</h3>
                </div>
                <button
                  onClick={loadHistory}
                  className="text-2xs text-forest hover:underline font-semibold"
                >
                  Refresh
                </button>
              </div>

              {historyLoading && (
                <div className="py-6 flex items-center justify-center text-charcoal-muted gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-forest" />
                  <span className="text-xs">Loading history...</span>
                </div>
              )}

              {!historyLoading && historyItems.length === 0 && (
                <div className="py-8 text-center text-xs text-charcoal-muted space-y-1">
                  <p>No past scans recorded yet.</p>
                  <p className="text-2xs text-charcoal-muted/60">
                    Try uploading a leaf or click a demo scan below!
                  </p>
                </div>
              )}

              {!historyLoading && historyItems.length > 0 && (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="group border border-ivory-300 rounded-xl p-3 bg-ivory/5 hover:border-forest/30 hover:bg-forest/[0.02] transition-all cursor-pointer flex gap-3"
                      onClick={() => {
                        setPreviewUrl(item.imageUrl);
                        setResult(item.responsePayload);
                        setSelectedDemoScan(null);
                        window.scrollTo({ top: 120, behavior: "smooth" });
                      }}
                    >
                      <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-ivory-200 bg-ivory/15 flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt="Diagnosis thumb"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-charcoal truncate">
                            {item.crop || "Crop"}
                          </h4>
                          {item.isHealthy ? (
                            <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-2xs text-charcoal-muted truncate">
                          {item.isHealthy ? "Healthy" : item.disease}
                        </p>
                        <span className="block text-[10px] text-charcoal-muted/60">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>

          {/* DEMO SCANS SHOWCASE GALLERY */}
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                  <Award className="h-5 w-5 text-forest" />
                  Interactive Demo Leaf Scans
                </h3>
                <p className="text-xs text-charcoal-muted">
                  No leaf image handy? Click any demo scan below to simulate immediate ML model detection results.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["All", "Vegetables", "Grains & Cotton", "Fruits"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveDemoCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeDemoCategory === cat
                        ? "bg-forest text-white shadow-sm"
                        : "bg-ivory/30 border border-ivory-300 text-charcoal-muted hover:bg-ivory-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Demo Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredDemos.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => handleSelectDemoScan(scan)}
                  className={`border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col bg-white hover:shadow-md ${
                    selectedDemoScan?.id === scan.id
                      ? "border-forest ring-2 ring-forest/20 shadow-md"
                      : "border-ivory-300 hover:border-forest/40"
                  }`}
                >
                  {/* Image Container with Badge */}
                  <div className="h-40 overflow-hidden bg-ivory/20 relative">
                    <img
                      src={scan.url}
                      alt={scan.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <Badge
                        variant={scan.isHealthy ? "success" : "danger"}
                        size="sm"
                      >
                        {scan.isHealthy ? "Healthy" : "Diseased"}
                      </Badge>
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                        {Math.round(scan.confidence * 100)}% Match
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-forest/70">
                        {scan.crop}
                      </span>
                      <h4 className="text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        {scan.name}
                      </h4>
                      <p className="text-xs text-charcoal-muted mt-1 line-clamp-2">
                        {scan.disease}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-ivory-200 flex items-center justify-between text-2xs font-bold text-forest">
                      <span>Click to Test Diagnosis</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: FARMER QUERY WINDOW (Q&A HUB) */}
        {/* ========================================================================= */}
        <section id="qa-section" className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ivory-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-forest text-xs font-bold uppercase tracking-wider mb-1">
                <MessageSquare className="h-4 w-4" />
                Farmer Community Q&A Hub
              </div>
              <h2 className="text-2xl font-bold text-charcoal">
                Ask Questions & Explore Expert Answers
              </h2>
              <p className="text-xs text-charcoal-muted">
                Type your crop pathology query or click pre-analyzed demo questions answered by agricultural experts.
              </p>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["All", "Disease Symptoms", "Remedies & Dosage", "Model & Usage"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFaqCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFaqCategory === cat
                      ? "bg-forest text-white shadow-sm"
                      : "bg-ivory/40 border border-ivory-300 text-charcoal-muted hover:bg-ivory-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ask Question Live Input Box */}
          <form onSubmit={handleAskQuestion} className="bg-ivory/10 p-4 rounded-2xl border border-ivory-300 space-y-3">
            <label htmlFor="farmer-query-input" className="text-xs font-bold text-charcoal block">
              Have a question about your crop's symptoms or spray doses?
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="farmer-query-input"
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="e.g. How do I treat white powder on my pumpkin leaves organically?"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-ivory-300 bg-white text-xs focus:ring-2 focus:ring-forest/40 focus:border-forest"
                />
                <HelpCircle className="absolute right-3 top-3.5 h-4 w-4 text-charcoal-muted/50" />
              </div>
              <button
                type="submit"
                disabled={isAnsweringQuery || !queryText.trim()}
                className="px-5 py-3 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                {isAnsweringQuery ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Ask Query</span>
              </button>
            </div>

            {/* Pre-suggested quick query chips */}
            <div className="flex items-center gap-2 flex-wrap text-2xs text-charcoal-muted pt-1">
              <span className="font-semibold text-charcoal">Quick suggestions:</span>
              {[
                "Can I spray Neem oil in hot sun?",
                "What is safe Copper dosage for tomatoes?",
                "How to prevent fungus after rain?",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQueryText(chip)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-ivory-300 text-charcoal-muted hover:text-forest hover:border-forest/40 transition-all"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </form>

          {/* User-submitted Queries (if any) */}
          {userQuestions.length > 0 && (
            <div className="space-y-3 border-b border-ivory-200 pb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest">
                Your Recent Asked Queries
              </h4>
              {userQuestions.map((q) => (
                <div key={q.id} className="bg-forest/[0.03] border border-forest/20 rounded-xl p-4 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-charcoal">
                    <span className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-forest" />
                      {q.question}
                    </span>
                    <span className="text-2xs font-normal text-charcoal-muted">{q.timestamp}</span>
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed bg-white p-3 rounded-lg border border-ivory-200">
                    {q.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* DEMO QUESTIONS & ANSWERS (ACCORDION / CARDS) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
              Featured Farmer Questions & Diagnostic Answers
            </h3>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                const extraVotes = faqUpvotes[faq.id] || 0;

                return (
                  <div
                    key={faq.id}
                    className={`border rounded-xl transition-all duration-200 overflow-hidden bg-white ${
                      isExpanded
                        ? "border-forest/40 shadow-sm"
                        : "border-ivory-300 hover:border-forest/30"
                    }`}
                  >
                    {/* Question Header */}
                    <button
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full p-4 flex items-start justify-between text-left gap-3 hover:bg-ivory/10 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-2xs">
                          <span className="px-2 py-0.5 rounded-md bg-forest/10 text-forest font-bold">
                            {faq.cropTag}
                          </span>
                          <span className="text-charcoal-muted font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-forest/60" />
                            {faq.farmerName} ({faq.farmerLocation})
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-charcoal leading-snug">
                          {faq.question}
                        </h4>
                      </div>

                      <div className="h-7 w-7 rounded-full bg-ivory/30 border border-ivory-300 flex items-center justify-center text-charcoal-muted shrink-0 mt-1">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Expandable Answer Content */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-ivory-200/80 bg-ivory/5 space-y-4 animate-slide-up">
                        <div className="space-y-2 pt-3">
                          <span className="text-2xs font-bold uppercase tracking-wider text-forest">
                            Expert Pathology Advice:
                          </span>
                          <p className="text-xs text-charcoal leading-relaxed">{faq.answer}</p>
                        </div>

                        {(faq.organicRemedy || faq.chemicalSpray) && (
                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            {faq.organicRemedy && (
                              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1">
                                <span className="font-bold text-emerald-800 text-2xs uppercase block">
                                  🌱 Organic Solution
                                </span>
                                <p className="text-emerald-950">{faq.organicRemedy}</p>
                              </div>
                            )}

                            {faq.chemicalSpray && (
                              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl space-y-1">
                                <span className="font-bold text-blue-800 text-2xs uppercase block">
                                  🧪 Recommended Spray
                                </span>
                                <p className="text-blue-950">{faq.chemicalSpray}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-2xs text-charcoal-muted pt-2 border-t border-ivory-200">
                          <span>Was this answer helpful?</span>
                          <button
                            type="button"
                            onClick={() => handleUpvoteFaq(faq.id)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-ivory-300 text-charcoal hover:border-forest/40 hover:text-forest transition-all"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Helpful ({faq.upvotes + extraVotes})</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: FARMER REVIEWS & MODEL USAGE FEEDBACK */}
        {/* ========================================================================= */}
        <section id="reviews-section" className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 sm:p-8 space-y-6">
          {/* Header & Metrics */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-ivory-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                Farmer Testimonials & Experience
              </div>
              <h2 className="text-2xl font-bold text-charcoal">
                What Farmers Say About Our AI Model
              </h2>
              <p className="text-xs text-charcoal-muted">
                Read real-world field experiences from farmers who saved harvests using our leaf disease diagnostic model.
              </p>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow-sm transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Write a Review
            </button>
          </div>

          {reviewSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in">
              <span>{reviewSuccessMsg}</span>
              <button onClick={() => setReviewSuccessMsg(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-ivory/20 border border-ivory-300">
            <div className="text-center space-y-1">
              <span className="text-2xl font-extrabold text-charcoal">4.9 ★</span>
              <span className="block text-2xs text-charcoal-muted font-medium">
                Average Rating (1,420+ Farmers)
              </span>
            </div>
            <div className="text-center space-y-1 border-l border-ivory-300">
              <span className="text-2xl font-extrabold text-forest">96.4%</span>
              <span className="block text-2xs text-charcoal-muted font-medium">
                Diagnostic Precision
              </span>
            </div>
            <div className="text-center space-y-1 border-l border-ivory-300">
              <span className="text-2xl font-extrabold text-charcoal">15,000+</span>
              <span className="block text-2xs text-charcoal-muted font-medium">
                Leaves Scanned
              </span>
            </div>
            <div className="text-center space-y-1 border-l border-ivory-300">
              <span className="text-2xl font-extrabold text-emerald-600">8,500+</span>
              <span className="block text-2xs text-charcoal-muted font-medium">
                Harvests Protected
              </span>
            </div>
          </div>

          {/* Filter Pills for Reviews */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-charcoal-muted" />
              <span className="text-xs font-bold text-charcoal">Filter Reviews:</span>
              {["All", "5 Star", "Potato", "Tomato", "Cotton"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReviewFilter(filter)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    reviewFilter === filter
                      ? "bg-forest text-white"
                      : "bg-ivory/30 border border-ivory-300 text-charcoal-muted hover:bg-ivory-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <span className="text-2xs text-charcoal-muted">
              Showing {filteredReviews.length} verified reviews
            </span>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-ivory-300 rounded-2xl p-5 space-y-3.5 hover:border-forest/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Top line: Stars & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        Verified Farmer
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-charcoal leading-snug">
                    "{rev.title}"
                  </h4>

                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-2xs text-charcoal-muted">
                  <div className="space-y-0.5">
                    <span className="font-bold text-charcoal block">{rev.name}</span>
                    <span>
                      {rev.location} • {rev.crop} ({rev.farmSize})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpvoteReview(rev.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-2xs font-semibold transition-all ${
                      upvotedReviews[rev.id]
                        ? "bg-forest/10 border-forest text-forest"
                        : "border-ivory-300 bg-white hover:bg-ivory-100"
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{rev.helpfulCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>

      {/* ========================================================================= */}
      {/* WRITE A REVIEW MODAL */}
      {/* ========================================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-2xl max-w-lg w-full p-6 space-y-5 relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-charcoal">
                Share Your Experience with AgriSense AI
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Your feedback helps other farmers trust and effectively use disease detection tools.
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal block">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewForm.name}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-forest/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-charcoal block">District / State</label>
                  <input
                    type="text"
                    required
                    value={newReviewForm.location}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, location: e.target.value })}
                    placeholder="e.g. Karnal, Haryana"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-forest/40"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal block">Primary Crop</label>
                  <select
                    value={newReviewForm.crop}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, crop: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-forest/40"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Wheat & Paddy">Wheat & Paddy</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize / Corn">Maize / Corn</option>
                    <option value="Fruit Orchard">Fruit Orchard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-charcoal block">Farm Size</label>
                  <input
                    type="text"
                    value={newReviewForm.farmSize}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, farmSize: e.target.value })}
                    placeholder="e.g. 10 Acres"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-forest/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal block">Model Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReviewForm.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-ivory-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-forest ml-2">
                    {newReviewForm.rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal block">Headline / Title</label>
                <input
                  type="text"
                  required
                  value={newReviewForm.title}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                  placeholder="e.g. Saved 5 acres of tomato crop using early prediction"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-forest/40"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal block">Detailed Review & Impact</label>
                <textarea
                  rows={3}
                  required
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  placeholder="Describe how the model helped detect crop diseases, what treatments you used, and money/yield saved..."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-forest/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal text-xs font-semibold hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
