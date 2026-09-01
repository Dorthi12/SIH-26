/**
 * Landing page content sections — ported from agrisense-insights.
 * Replaced @tanstack/react-router with react-router-dom.
 * Asset imports use relative paths.
 */
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Landmark,
  Sprout,
  Sun,
  Wind,
} from "lucide-react";
import { Reveal, Section, SectionHead } from "./primitives";
import { CropDetailModal, type CropGuideItem } from "./CropDetailModal";
import paddyImg    from "../../assets/crop-paddy.jpg";
import wheatImg    from "../../assets/crop-wheat.jpg";
import cottonImg   from "../../assets/crop-cotton.jpg";
import mustardImg  from "../../assets/crop-mustard.jpg";
import maizeImg    from "../../assets/crop-maize.jpg";
import sugarcaneImg from "../../assets/crop-sugarcane.jpg";
import adviceImg   from "../../assets/advice-farmer.jpg";
import fieldWide   from "../../assets/field-wide.jpg";

/* ---------------- 1. Quick Access Cards ---------------- */

const QUICK = [
  {
    icon: <Sprout className="size-6" />,
    title: "Crop Guidance",
    text: "Get practical crop recommendations for your field and season.",
    to: "/recommendation",
  },
  {
    icon: <Landmark className="size-6" />,
    title: "Government Schemes",
    text: "Find useful information about government schemes and farmer benefits.",
    href: "#schemes",
  },
  {
    icon: <CloudSun className="size-6" />,
    title: "Weather Updates",
    text: "Get current weather updates and forecasts for your location.",
    href: "#weather",
  },
  {
    icon: <BookOpen className="size-6" />,
    title: "Farming Knowledge",
    text: "Learn practical farming tips, crop practices and useful agricultural information.",
    href: "#knowledge",
  },
];

function CardShell({
  children,
  href,
  to,
}: {
  children: ReactNode;
  href?: string;
  to?: string;
}) {
  const cls =
    "group flex h-full flex-col rounded-2xl border border-landing-border bg-landing-card p-6 shadow-landing-soft transition-all duration-300 hover:-translate-y-1 hover:border-landing-primary/30 hover:shadow-landing-lift";
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}

export function QuickAccess() {
  return (
    <Section className="pt-8 md:pt-12">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK.map((q, i) => (
          <Reveal key={q.title} delay={i * 80} className="h-full">
            <CardShell to={"to" in q ? q.to : undefined} href={"href" in q ? q.href : undefined}>
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-landing-secondary text-landing-primary">
                {q.icon}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-landing-fg">{q.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-landing-fg-muted">{q.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-landing-primary">
                Explore
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </CardShell>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 2. Crop Guide ---------------- */

const CROP_GUIDE: CropGuideItem[] = [
  {
    name: "Paddy (Dhaan)",
    hindiName: "धान",
    season: "Kharif Season",
    hindiSeason: "खरीफ फसल",
    text: "High-yielding varieties, planting time, irrigation and care.",
    hindiText: "उच्च उपज वाली किस्में, रोपाई का समय, सिंचाई एवं देखभाल।",
    img: paddyImg,
    topStates: [
      { name: "West Bengal", hindiName: "पश्चिम बंगाल", share: "13.6%", percentage: 13.6 },
      { name: "Uttar Pradesh", hindiName: "उत्तर प्रदेश", share: "12.8%", percentage: 12.8 },
      { name: "Punjab", hindiName: "पंजाब", share: "11.5%", percentage: 11.5 },
      { name: "Andhra Pradesh", hindiName: "आंध्र प्रदेश", share: "7.9%", percentage: 7.9 },
      { name: "Odisha", hindiName: "ओडिशा", share: "7.4%", percentage: 7.4 },
    ],
    details: {
      climate: {
        temp: "20°C - 37°C",
        rainfall: "100 - 200 cm",
        note: "Requires standing water and high humidity during growth.",
        noteHi: "विकास चरण के दौरान जलभराव और अधिक आर्द्रता आवश्यक है।"
      },
      soil: {
        type: "Clayey Loam / Silt (चिकनी दोमट)",
        ph: "5.5 - 7.0",
        note: "High water retention capacity soil is ideal.",
        noteHi: "अधिक जल धारण क्षमता वाली चिकनी मिट्टी सर्वोत्तम है।"
      },
      duration: { season: "Kharif / खरीफ", days: "120 - 150 Days (दिन)", sowingWindow: "June - July (जून - जुलाई)" },
      yield: { average: "3.5 - 5.5 t/ha (टन/हेक्टेयर)", optimal: "Up to 6.5 t/ha (संकर बीजों से 6.5 टन/हे।)" },
      fertilizer: {
        npk: "120:60:40 kg/ha NPK",
        advice: "Apply Nitrogen in 3 split doses + Zinc Sulphate (25 kg/ha).",
        adviceHi: "नाइट्रोजन 3 किस्तों में दें और जिंक सल्फेट (25 किग्रा/हे।) डालें।"
      },
      pestControl: {
        commonPests: "Stem Borer, Blast / तना छेदक, झुलसा रोग",
        prevention: "Use resistant seeds, avoid excess Nitrogen, apply neem oil.",
        preventionHi: "प्रतिरोधी किस्मों का उपयोग करें, नीम तेल का छिड़काव करें।"
      },
    },
  },
  {
    name: "Wheat (Gehu)",
    hindiName: "गेहूँ",
    season: "Rabi Season",
    hindiSeason: "रबी फसल",
    text: "Best varieties, sowing time, fertilizers and yield management.",
    hindiText: "उन्नत किस्में, बुवाई का समय, उर्वरक प्रबंधन एवं उपज वृद्धि।",
    img: wheatImg,
    topStates: [
      { name: "Uttar Pradesh", hindiName: "उत्तर प्रदेश", share: "32.4%", percentage: 32.4 },
      { name: "Madhya Pradesh", hindiName: "मध्य प्रदेश", share: "21.6%", percentage: 21.6 },
      { name: "Punjab", hindiName: "पंजाब", share: "15.2%", percentage: 15.2 },
      { name: "Haryana", hindiName: "हरियाणा", share: "11.8%", percentage: 11.8 },
      { name: "Rajasthan", hindiName: "राजस्थान", share: "9.3%", percentage: 9.3 },
    ],
    details: {
      climate: {
        temp: "10°C - 25°C",
        rainfall: "75 - 100 cm",
        note: "Cool winter growth period and warm dry harvest weather.",
        noteHi: "ठंडी सर्दियों में विकास तथा पकाई के समय शुष्क धूप आवश्यक है।"
      },
      soil: {
        type: "Fertile Loam / Clay Loam (उपजाऊ दोमट)",
        ph: "6.0 - 7.5",
        note: "Well-drained soil with good structure and organic matter.",
        noteHi: "अच्छे जल निकास वाली उपजाऊ दोमट मिट्टी आदर्श है।"
      },
      duration: { season: "Rabi / रबी", days: "110 - 130 Days (दिन)", sowingWindow: "Nov - Dec (नवंबर - दिसंबर)" },
      yield: { average: "3.2 - 4.8 t/ha (टन/हेक्टेयर)", optimal: "Up to 5.5 t/ha in irrigated plains (5.5 टन/हे।)" },
      fertilizer: {
        npk: "120:60:40 kg/ha NPK",
        advice: "Full P&K at sowing; split Nitrogen at crown root initiation stage.",
        adviceHi: "बुवाई के समय फास्फोरस व पोटाश दें, ताज जड़ बनते समय नाइट्रोजन दें।"
      },
      pestControl: {
        commonPests: "Yellow Rust, Aphids / पीला रतुआ, माहू (चेपा)",
        prevention: "Seed treatment with Trichoderma; monitor rust spikes early.",
        preventionHi: "ट्राइकोडेर्मा से बीज उपचार करें, रतुआ का समय पर नियंत्रण करें।"
      },
    },
  },
  {
    name: "Cotton",
    hindiName: "कपास",
    season: "Kharif Season",
    hindiSeason: "खरीफ फसल",
    text: "Seed selection, pest control, irrigation and harvesting.",
    hindiText: "बीज चयन, कीट नियंत्रण, सिंचाई एवं कटाई प्रबंधन।",
    img: cottonImg,
    topStates: [
      { name: "Gujarat", hindiName: "गुजरात", share: "28.5%", percentage: 28.5 },
      { name: "Maharashtra", hindiName: "महाराष्ट्र", share: "22.1%", percentage: 22.1 },
      { name: "Telangana", hindiName: "तेलंगाना", share: "14.3%", percentage: 14.3 },
      { name: "Rajasthan", hindiName: "राजस्थान", share: "8.7%", percentage: 8.7 },
      { name: "Karnataka", hindiName: "कर्नाटक", share: "7.2%", percentage: 7.2 },
    ],
    details: {
      climate: {
        temp: "21°C - 35°C",
        rainfall: "50 - 100 cm",
        note: "Requires at least 200 frost-free days and abundant sunshine.",
        noteHi: "कम से कम 200 पाला-रहित दिन तथा प्रचुर धूप आवश्यक है।"
      },
      soil: {
        type: "Deep Black Soil / Regur (काली मिट्टी)",
        ph: "6.0 - 8.0",
        note: "Deep clay soil with excellent moisture retention capacity.",
        noteHi: "उत्कृष्ट नमी धारण करने वाली गहरी काली चिकनी मिट्टी।"
      },
      duration: { season: "Kharif / खरीफ", days: "160 - 180 Days (दिन)", sowingWindow: "May - June (मई - जून)" },
      yield: { average: "2.0 - 3.2 t/ha (टन/हेक्टेयर)", optimal: "Up to 3.8 t/ha with Bt Cotton (3.8 टन/हे।)" },
      fertilizer: {
        npk: "90:45:45 kg/ha NPK",
        advice: "Apply Magnesium Sulphate & Boron spray during boll development.",
        adviceHi: "डोडी (बॉल्स) बनते समय मैग्नीशियम सल्फेट व बोरॉन का छिड़काव करें।"
      },
      pestControl: {
        commonPests: "Pink Bollworm, Whitefly / गुलाबी सूंडी, सफेद मक्खी",
        prevention: "Pheromone traps, refuge crops, and IPM monitoring.",
        preventionHi: "फेरोमोन प्रपंच (ट्रैप) लगाएं एवं एकीकृत कीट प्रबंधन (IPM) अपनाएं।"
      },
    },
  },
  {
    name: "Mustard (Sarson)",
    hindiName: "सरसों",
    season: "Rabi Season",
    hindiSeason: "रबी फसल",
    text: "Growing guide, disease management and best practices.",
    hindiText: "उगाने का मार्गदर्शन, रोग प्रबंधन एवं सर्वश्रेष्ठ तकनीकें।",
    img: mustardImg,
    topStates: [
      { name: "Rajasthan", hindiName: "राजस्थान", share: "46.2%", percentage: 46.2 },
      { name: "Madhya Pradesh", hindiName: "मध्य प्रदेश", share: "14.8%", percentage: 14.8 },
      { name: "Haryana", hindiName: "हरियाणा", share: "11.5%", percentage: 11.5 },
      { name: "Uttar Pradesh", hindiName: "उत्तर प्रदेश", share: "10.9%", percentage: 10.9 },
      { name: "West Bengal", hindiName: "पश्चिम बंगाल", share: "4.5%", percentage: 4.5 },
    ],
    details: {
      climate: {
        temp: "10°C - 25°C",
        rainfall: "25 - 40 cm",
        note: "Subtropical dry and cool winter climate.",
        noteHi: "शुष्क और ठंडी सर्दियों का मौसम अत्यंत अनुकूल है।"
      },
      soil: {
        type: "Sandy Loam to Heavy Loam (बलुई दोमट)",
        ph: "6.0 - 7.5",
        note: "Tolerates light soil; requires good sub-soil moisture.",
        noteHi: "हल्की मिट्टी में भी उगाई जा सकती है; नमी आवश्यक है।"
      },
      duration: { season: "Rabi / रबी", days: "100 - 120 Days (दिन)", sowingWindow: "Oct - Nov (अक्टूबर - नवंबर)" },
      yield: { average: "1.5 - 2.5 t/ha (टन/हेक्टेयर)", optimal: "Up to 3.0 t/ha under irrigation (3.0 टन/हे।)" },
      fertilizer: {
        npk: "80:40:40 kg/ha NPK",
        advice: "Essential Sulphur application (40 kg/ha) for oil content boost.",
        adviceHi: "तेल की मात्रा बढ़ाने के लिए सल्फर (40 किग्रा/हे।) अवश्य दें।"
      },
      pestControl: {
        commonPests: "Mustard Aphids, Alternaria Blight / चेपा (माहू), अल्टरनेरिया",
        prevention: "Early sowing in October; yellow sticky traps for aphids.",
        preventionHi: "अक्टूबर में समय पर बुवाई करें; पीले चिपचिपे ट्रैप लगाएं।"
      },
    },
  },
  {
    name: "Maize",
    hindiName: "मक्का",
    season: "Kharif Season",
    hindiSeason: "खरीफ फसल",
    text: "Sowing time, nutrients, irrigation and disease control.",
    hindiText: "बुवाई का समय, पोषण प्रबंधन, सिंचाई एवं रोग रोकथाम।",
    img: maizeImg,
    topStates: [
      { name: "Karnataka", hindiName: "कर्नाटक", share: "16.5%", percentage: 16.5 },
      { name: "Madhya Pradesh", hindiName: "मध्य प्रदेश", share: "13.8%", percentage: 13.8 },
      { name: "Maharashtra", hindiName: "महाराष्ट्र", share: "11.2%", percentage: 11.2 },
      { name: "Bihar", hindiName: "बिहार", share: "8.9%", percentage: 8.9 },
      { name: "Uttar Pradesh", hindiName: "उत्तर प्रदेश", share: "8.1%", percentage: 8.1 },
    ],
    details: {
      climate: {
        temp: "21°C - 30°C",
        rainfall: "50 - 100 cm",
        note: "Warm weather crop, highly sensitive to frost and waterlogging.",
        noteHi: "गर्म मौसम की फसल; पाले और जलभराव के प्रति अत्यंत संवेदनशील।"
      },
      soil: {
        type: "Deep Fertile Loam (उपजाऊ दोमट)",
        ph: "5.8 - 7.2",
        note: "Rich in organic matter with effective surface drainage.",
        noteHi: "जीवांश युक्त उपजाऊ दोमट मिट्टी जिसमें जल निकास अच्छा हो।"
      },
      duration: { season: "Kharif/Rabi (खरीफ/रबी)", days: "90 - 110 Days (दिन)", sowingWindow: "June - July (जून - जुलाई)" },
      yield: { average: "3.0 - 5.0 t/ha (टन/हेक्टेयर)", optimal: "Up to 6.5 t/ha for hybrids (6.5 टन/हे।)" },
      fertilizer: {
        npk: "120:60:50 kg/ha NPK",
        advice: "Zinc Sulphate (25 kg/ha) at planting; top dress N at knee-high stage.",
        adviceHi: "बुवाई पर जिंक सल्फेट दें; घुटने तक की ऊंचाई पर नाइट्रोजन दें।"
      },
      pestControl: {
        commonPests: "Fall Armyworm, Stem Borer / फॉल आर्मीवर्म, तना छेदक",
        prevention: "Pheromone traps, Emamectin benzoate at early stage.",
        preventionHi: "फेरोमोन ट्रैप लगाएं, शुरुआती अवस्था में इमामेक्टिन का प्रयोग करें।"
      },
    },
  },
  {
    name: "Sugarcane (Ganna)",
    hindiName: "गन्ना",
    season: "Year-round",
    hindiSeason: "वर्ष भर की फसल",
    text: "Planting, ratoon management, irrigation and harvest timing.",
    hindiText: "पेड़ी प्रबंधन, सिंचाई चक्र, उर्वरक एवं कटाई का सही समय।",
    img: sugarcaneImg,
    topStates: [
      { name: "Uttar Pradesh", hindiName: "उत्तर प्रदेश", share: "44.5%", percentage: 44.5 },
      { name: "Maharashtra", hindiName: "महाराष्ट्र", share: "23.2%", percentage: 23.2 },
      { name: "Karnataka", hindiName: "कर्नाटक", share: "11.1%", percentage: 11.1 },
      { name: "Tamil Nadu", hindiName: "तमिलनाडु", share: "5.8%", percentage: 5.8 },
      { name: "Bihar", hindiName: "बिहार", share: "4.2%", percentage: 4.2 },
    ],
    details: {
      climate: {
        temp: "20°C - 38°C",
        rainfall: "75 - 150 cm",
        note: "Hot tropical to subtropical climate with high sunshine hours.",
        noteHi: "उष्णकटिबंधीय आर्द्र जलवायु तथा अधिक धूप की आवश्यकता।"
      },
      soil: {
        type: "Deep Alluvial & Black Loam (जलोढ़ व काली दोमट)",
        ph: "6.5 - 7.5",
        note: "Deep well-drained soil rich in organic humus.",
        noteHi: "जीवांश से भरपूर गहरी तथा अच्छे जल निकास वाली मिट्टी।"
      },
      duration: { season: "Annual / वार्षिक", days: "300 - 420 Days (दिन)", sowingWindow: "Feb - March / Oct (फरवरी - मार्च / अक्टूबर)" },
      yield: { average: "65 - 90 t/ha (टन/हेक्टेयर)", optimal: "Up to 110 t/ha with drip fertigation (110 टन/हे।)" },
      fertilizer: {
        npk: "250:115:115 kg/ha NPK",
        advice: "Apply Pressmud compost; split Nitrogen in 4 doses across tillering.",
        adviceHi: "प्रेसमड खाद का प्रयोग करें; नाइट्रोजन को 4 बराबर किस्तों में बांटकर दें।"
      },
      pestControl: {
        commonPests: "Early Shoot Borer, Red Rot / कंसुआ, लाल सड़न रोग (रेड रॉट)",
        prevention: "Use disease-free setts, trash mulching, bio-control.",
        preventionHi: "रोगमुक्त गूलों (टुकड़ों) की बुवाई करें, सूखी पत्तियों की मल्चिंग करें।"
      },
    },
  },
];

export function CropGuide() {
  const [selectedCrop, setSelectedCrop] = useState<CropGuideItem | null>(null);

  return (
    <Section id="crop-guide">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead
          eyebrow="Crop Guide"
          hindi="फसल मार्गदर्शन"
          title="Explore Crop Guide"
          sub="Find detailed information about different crops and their best farming practices."
        />
        <Link
          to="/recommendation"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-landing-primary hover:text-landing-forest-deep"
        >
          View All Crops
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CROP_GUIDE.map((c, i) => (
          <Reveal key={c.name} delay={i * 70} className="h-full">
            <button
              onClick={() => setSelectedCrop(c)}
              className="group relative flex h-80 w-full text-left flex-col justify-end overflow-hidden rounded-2xl shadow-landing-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-landing-lift cursor-pointer focus:outline-none focus:ring-2 focus:ring-landing-primary"
            >
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                width={900}
                height={700}
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-landing-forest-deep/95 via-landing-forest-deep/25 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-landing-ivory/90 px-3 py-1 text-xs font-semibold text-landing-olive backdrop-blur-sm">
                {c.season}
              </span>
              <div className="relative flex flex-col p-5">
                <h3 className="text-xl font-bold text-landing-ivory drop-shadow-sm">{c.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-landing-ivory/85">{c.text}</p>
                <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-landing-ivory/15 px-3.5 py-1.5 text-sm font-semibold text-landing-ivory backdrop-blur-sm transition-colors group-hover:bg-landing-accent group-hover:text-landing-forest-deep">
                  Learn More
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      <CropDetailModal
        crop={selectedCrop}
        onClose={() => setSelectedCrop(null)}
      />
    </Section>
  );
}

/* ---------------- 3. Government Schemes ---------------- */

const SCHEMES = [
  { name: "PM Kisan",              text: "Direct income support paid to eligible small and marginal farmer families." },
  { name: "PM Fasal Bima Yojana",  text: "Crop insurance cover against loss from unseasonal weather and pests." },
  { name: "Kisan Credit Card",     text: "Short-term credit for seeds, fertilizer and other farming needs." },
  { name: "Soil Health Card",      text: "Know your soil nutrients and get fertilizer recommendations for your field." },
  { name: "PM-KUSUM",              text: "Support for solar pumps and solar power for irrigation on your farm." },
];

export function Schemes() {
  return (
    <Section id="schemes" className="bg-landing-secondary/30">
      <SectionHead
        eyebrow="Schemes"
        hindi="सरकारी योजनाएं"
        title="Government Schemes"
        sub="Understand government schemes, eligibility and benefits available to farmers."
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SCHEMES.map((s, i) => (
          <Reveal key={s.name} delay={i * 70} className="h-full">
            <CardShell href="#advice">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-landing-accent/20 text-landing-olive">
                <Landmark className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-landing-fg">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-landing-fg-muted">{s.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-landing-primary">
                Learn More
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </CardShell>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 4. Weather ---------------- */

const WEATHER_FORECAST = [
  { day: "Today",    icon: <CloudRain className="size-6" />, temp: "28°", rain: "20%" },
  { day: "Tomorrow", icon: <CloudRain className="size-6" />, temp: "27°", rain: "65%" },
  { day: "Wed",      icon: <Cloud className="size-6" />,     temp: "29°", rain: "30%" },
  { day: "Thu",      icon: <CloudSun className="size-6" />,  temp: "30°", rain: "10%" },
  { day: "Fri",      icon: <Sun className="size-6" />,       temp: "31°", rain: "5%"  },
];

export function Weather() {
  return (
    <Section id="weather">
      <SectionHead
        eyebrow="Weather"
        hindi="मौसम"
        title="Weather for Your Location"
        sub="Stay updated with current conditions and a simple five-day outlook for your area."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="h-full">
          <div className="h-full overflow-hidden rounded-2xl border border-landing-border bg-landing-card shadow-landing-soft">
            <div className="relative h-40">
              <img
                src={fieldWide}
                alt="Green farmland at sunrise"
                loading="lazy"
                width={1600}
                height={800}
                className="size-full object-cover"
              />
            </div>
            <div className="p-6">
              <p className="text-sm text-landing-fg-muted">Prayagraj, Uttar Pradesh</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-5xl font-semibold tracking-tight text-landing-fg">28°C</p>
                <p className="pb-2 text-base font-medium text-landing-fg-muted">Partly Cloudy</p>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: <Droplets className="size-4" />, k: "Humidity", v: "72%" },
                  { icon: <CloudRain className="size-4" />, k: "Rain", v: "20%" },
                  { icon: <Wind className="size-4" />, k: "Wind", v: "12 km/h" },
                ].map((r) => (
                  <div key={r.k} className="rounded-xl bg-landing-secondary/60 p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-landing-fg-muted">
                      <span className="text-landing-olive">{r.icon}</span>
                      {r.k}
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-landing-fg">{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="h-full">
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-2xl border border-landing-border bg-landing-card p-6 shadow-landing-soft">
              <p className="text-sm font-semibold text-landing-fg">Next 5 days</p>
              <div className="mt-5 grid grid-cols-5 gap-2 text-center">
                {WEATHER_FORECAST.map((f) => (
                  <div key={f.day} className="rounded-xl bg-landing-secondary/50 px-1 py-4">
                    <p className="text-xs font-medium text-landing-fg-muted">{f.day}</p>
                    <span className="mt-2 inline-flex justify-center text-landing-olive">{f.icon}</span>
                    <p className="mt-2 text-base font-semibold text-landing-fg">{f.temp}</p>
                    <p className="text-xs text-landing-fg-muted">{f.rain}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-start gap-4 rounded-2xl border border-landing-accent/40 bg-landing-accent/12 p-6">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-landing-accent/30 text-landing-olive">
                <CloudRain className="size-5" />
              </span>
              <div>
                <p className="text-base font-semibold text-landing-fg">Rain expected tomorrow</p>
                <p className="mt-1 text-sm leading-relaxed text-landing-fg-muted">
                  Consider planning irrigation accordingly and delay spraying until the field dries.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------- 5. Farming Knowledge ---------------- */

const KNOWLEDGE = [
  { title: "Sowing at the right time", text: "Simple season-wise guidance on when to sow each crop for better results." },
  { title: "Water and irrigation",     text: "Practical ways to plan irrigation and save water through the growing season." },
  { title: "Soil and fertilizer care", text: "Keep your soil healthy with balanced nutrients and simple field practices." },
  { title: "Pest and disease control", text: "Spot common crop problems early and know the safe steps to take." },
];

export function Knowledge() {
  return (
    <Section id="knowledge" className="bg-landing-secondary/30">
      <SectionHead
        eyebrow="Knowledge"
        hindi="खेती का ज्ञान"
        title="Farming Knowledge"
        sub="Learn practical information that helps you make better farming decisions."
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KNOWLEDGE.map((k, i) => (
          <Reveal key={k.title} delay={i * 70} className="h-full">
            <CardShell href="#advice">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-landing-secondary text-landing-primary">
                <BookOpen className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-landing-fg">{k.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-landing-fg-muted">{k.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-landing-primary">
                Read More
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </CardShell>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 6. Personalized advice CTA ---------------- */

export function PersonalizedAdvice() {
  return (
    <Section id="advice">
      <Reveal>
        <div className="grid overflow-hidden rounded-3xl border border-landing-border bg-landing-card shadow-landing-lift lg:grid-cols-2">
          <div className="order-2 flex flex-col justify-center p-8 sm:p-12 lg:order-1">
            <p className="flex items-center gap-2.5 text-landing-olive">
              <span className="text-sm font-semibold tracking-wide uppercase">
                Personalized Advice
              </span>
              <span className="landing-hindi rounded-full border border-landing-terracotta/30 bg-landing-terracotta/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-landing-terracotta normal-case">
                आपके लिए सलाह
              </span>
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-semibold text-landing-fg sm:text-4xl">
              Get Personalized Crop Advice
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-landing-fg-muted">
              Ask your questions and get farming guidance based on your location, season and crop
              needs.
            </p>
            <div className="mt-8">
              <Link
                to="/recommendation"
                className="group inline-flex items-center gap-2 rounded-full bg-landing-primary px-7 py-3.5 text-base font-semibold text-landing-primary-fg shadow-landing-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-landing-forest-deep"
              >
                Get Crop Advice
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="order-1 min-h-[16rem] lg:order-2">
            <img
              src={adviceImg}
              alt="Farmers examining young crop plants in their field"
              loading="lazy"
              width={1200}
              height={912}
              className="size-full object-cover"
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------------- 7. Impact Stats ---------------- */

const STATS = [
  { v: "25+",    k: "Crop Guides" },
  { v: "100+",   k: "Government Schemes" },
  { v: "50,000+", k: "Questions Answered" },
  { v: "500+",   k: "Districts Covered" },
];

export function ImpactStats() {
  return (
    <Section className="pb-8">
      <Reveal>
        <div className="grid gap-8 rounded-3xl border border-landing-border bg-landing-secondary/50 px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k} className="text-center sm:text-left">
              <p className="text-4xl font-semibold tracking-tight text-landing-primary">{s.v}</p>
              <p className="mt-2 text-sm text-landing-fg-muted">{s.k}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-landing-fg-muted sm:text-left">
          Figures shown are indicative platform coverage values.
        </p>
      </Reveal>
    </Section>
  );
}
