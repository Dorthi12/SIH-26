/**
 * Landing page content sections — ported from agrisense-insights.
 * Replaced @tanstack/react-router with react-router-dom.
 * Asset imports use relative paths.
 */
import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Landmark,
  MapPin,
  Navigation,
  RefreshCw,
  Sprout,
  Sun,
  Wind,
} from "lucide-react";
import { getWeatherData, type WeatherServiceResult } from "../../services/weatherService";
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

import { useLanguage } from "../../context/LanguageContext";

/* ---------------- 1. Quick Access Cards ---------------- */

const QUICK_DATA = [
  {
    icon: <Sprout className="size-6" />,
    titleEn: "Crop Guidance",
    titleHi: "फसल मार्गदर्शन",
    textEn: "Get practical crop recommendations for your field and season.",
    textHi: "अपने खेत और मौसम के अनुसार सही फसल का सुझाव पाएं।",
    to: "/recommendation",
    theme: {
      cardHover: "hover:border-emerald-500/40 hover:shadow-emerald-500/10 hover:shadow-xl",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      accentText: "text-emerald-700 dark:text-emerald-400",
      pillBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    },
  },
  {
    icon: <Landmark className="size-6" />,
    titleEn: "Government Schemes",
    titleHi: "सरकारी योजनाएं",
    textEn: "Find useful information about government schemes and farmer benefits.",
    textHi: "सरकारी योजनाओं और किसान लाभों की उपयोगी जानकारी प्राप्त करें।",
    href: "#schemes",
    theme: {
      cardHover: "hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:shadow-xl",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
      accentText: "text-indigo-700 dark:text-indigo-400",
      pillBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    },
  },
  {
    icon: <CloudSun className="size-6" />,
    titleEn: "Weather Updates",
    titleHi: "मौसम अपडेट",
    textEn: "Get current weather updates and forecasts for your location.",
    textHi: "अपने क्षेत्र के सटीक मौसम अपडेट और पूर्वानुमान प्राप्त करें।",
    href: "#weather",
    theme: {
      cardHover: "hover:border-amber-500/40 hover:shadow-amber-500/10 hover:shadow-xl",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      accentText: "text-amber-800 dark:text-amber-400",
      pillBg: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30",
    },
  },
  {
    icon: <BookOpen className="size-6" />,
    titleEn: "Farming Knowledge",
    titleHi: "खेती का ज्ञान",
    textEn: "Learn practical farming tips, crop practices and useful agricultural information.",
    textHi: "व्यावहारिक खेती के टिप्स और उपयोगी कृषि तकनीक सीखें।",
    href: "#knowledge",
    theme: {
      cardHover: "hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      accentText: "text-purple-700 dark:text-purple-400",
      pillBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    },
  },
];

function CardShell({
  children,
  href,
  to,
  hoverCls,
}: {
  children: ReactNode;
  href?: string;
  to?: string;
  hoverCls?: string;
}) {
  const cls = `group flex h-full flex-col rounded-2xl border border-landing-border bg-landing-card p-6 shadow-landing-soft transition-all duration-300 hover:-translate-y-1.5 ${
    hoverCls || "hover:border-landing-primary/30 hover:shadow-landing-lift"
  }`;
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
  const { t, language } = useLanguage();

  return (
    <Section className="pt-8 md:pt-12">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_DATA.map((q, i) => {
          const title = t(q.titleEn, q.titleHi);
          const text = t(q.textEn, q.textHi);

          return (
            <Reveal key={q.titleEn} delay={i * 80} className="h-full">
              <CardShell
                to={"to" in q ? q.to : undefined}
                href={"href" in q ? q.href : undefined}
                hoverCls={q.theme.cardHover}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex size-12 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-110 ${q.theme.iconBg}`}>
                    {q.icon}
                  </span>
                  {language === "both" && (
                    <span className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold ${q.theme.pillBg}`}>
                      {q.titleHi}
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-lg font-bold tracking-tight text-landing-fg group-hover:text-landing-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-landing-fg-muted font-medium">
                  {text}
                </p>
                <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${q.theme.accentText}`}>
                  {t("Explore", "खोजें")}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </CardShell>
            </Reveal>
          );
        })}
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
  const { t, language } = useLanguage();

  return (
    <Section id="crop-guide">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead
          eyebrow="Crop Guide"
          hindi="फसल मार्गदर्शन"
          title={t("Explore Crop Guide", "फसल मार्गदर्शन खोजें")}
          sub={t(
            "Find detailed information about different crops and their best farming practices.",
            "विभिन्न फसलों और उनकी सर्वोत्तम खेती प्रथाओं के बारे में विस्तृत जानकारी प्राप्त करें।"
          )}
          badgeTheme="emerald"
        />
        <Link
          to="/recommendation"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
        >
          {t("View All Crops", "सभी फसलें देखें")}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CROP_GUIDE.map((c, i) => {
          const cropTitle = language === "hi" ? c.hindiName : language === "both" ? `${c.name} (${c.hindiName})` : c.name;
          const cropSeason = language === "hi" ? c.hindiSeason : language === "both" ? `${c.season} (${c.hindiSeason})` : c.season;
          const cropText = language === "hi" ? c.hindiText : c.text;

          return (
            <Reveal key={c.name} delay={i * 70} className="h-full">
              <button
                onClick={() => setSelectedCrop(c)}
                className="group relative flex h-80 w-full text-left flex-col justify-end overflow-hidden rounded-2xl shadow-landing-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-emerald-500/10 hover:border-emerald-500/40"
              >
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={700}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/30 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-200 border border-emerald-500/30 backdrop-blur-md">
                  {cropSeason}
                </span>
                <div className="relative flex flex-col p-5">
                  <h3 className="text-xl font-extrabold text-white drop-shadow-md">{cropTitle}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-emerald-100/90 font-medium">{cropText}</p>
                  <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-sm font-bold text-white border border-emerald-400/30 backdrop-blur-md transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    {t("Learn More", "विवरण देखें")}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            </Reveal>
          );
        })}
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
  {
    nameEn: "PM Kisan",
    nameHi: "पीएम किसान",
    textEn: "Direct income support paid to eligible small and marginal farmer families.",
    textHi: "पात्र छोटे और सीमांत किसान परिवारों को प्रत्यक्ष आय सहायता।",
  },
  {
    nameEn: "PM Fasal Bima Yojana",
    nameHi: "पीएम फसल बीमा योजना",
    textEn: "Crop insurance cover against loss from unseasonal weather and pests.",
    textHi: "बेमौसम मौसम और कीटों से नुकसान के खिलाफ फसल बीमा सुरक्षा।",
  },
  {
    nameEn: "Kisan Credit Card",
    nameHi: "किसान क्रेडिट कार्ड",
    textEn: "Short-term credit for seeds, fertilizer and other farming needs.",
    textHi: "बीज, उर्वरक और अन्य कृषि आवश्यकताओं के लिए अल्पकालिक ऋण।",
  },
  {
    nameEn: "Soil Health Card",
    nameHi: "मृदा स्वास्थ्य कार्ड",
    textEn: "Know your soil nutrients and get fertilizer recommendations for your field.",
    textHi: "अपनी मिट्टी के पोषक तत्वों को जानें और अपने खेत के लिए खाद की सलाह पाएं।",
  },
  {
    nameEn: "PM-KUSUM",
    nameHi: "पीएम-कुसुम",
    textEn: "Support for solar pumps and solar power for irrigation on your farm.",
    textHi: "आपके खेत में सिंचाई के लिए सौर पंप और सौर ऊर्जा सहायता।",
  },
];

export function Schemes() {
  const { language } = useLanguage();

  const isBoth = language === "both";
  const isHi = language === "hi";

  const titleContent = isHi ? (
    "सरकारी योजनाएं"
  ) : isBoth ? (
    <div className="flex flex-col">
      <span>Government Schemes</span>
      <span className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
        (सरकारी योजनाएं)
      </span>
    </div>
  ) : (
    "Government Schemes"
  );

  const subContent = isHi ? (
    "सरकारी योजनाओं, पात्रता और किसानों के लिए उपलब्ध लाभों को समझें।"
  ) : isBoth ? (
    <div className="flex flex-col gap-1 mt-1">
      <span>Understand government schemes, eligibility and benefits available to farmers.</span>
      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
        (सरकारी योजनाओं, पात्रता और किसानों के लिए उपलब्ध लाभों को समझें।)
      </span>
    </div>
  ) : (
    "Understand government schemes, eligibility and benefits available to farmers."
  );

  return (
    <Section id="schemes" className="bg-indigo-500/5 dark:bg-indigo-950/20">
      <SectionHead
        eyebrow="Schemes"
        hindi="सरकारी योजनाएं"
        title={titleContent}
        sub={subContent}
        badgeTheme="indigo"
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SCHEMES.map((s, i) => {
          const cardName = isHi ? (
            s.nameHi
          ) : isBoth ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-landing-fg">{s.nameEn}</span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                ({s.nameHi})
              </span>
            </div>
          ) : (
            s.nameEn
          );

          const cardText = isHi ? (
            s.textHi
          ) : isBoth ? (
            <div className="flex flex-col gap-2 mt-1">
              <span>{s.textEn}</span>
              <span className="text-xs font-semibold leading-relaxed text-amber-900 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/50 px-2.5 py-1.5 rounded-lg border border-amber-500/30 inline-block w-fit">
                ({s.textHi})
              </span>
            </div>
          ) : (
            s.textEn
          );

          const learnMoreText = isHi ? (
            "अधिक जानें"
          ) : isBoth ? (
            <span className="inline-flex items-center gap-1.5">
              <span>Learn More</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                (अधिक जानें)
              </span>
            </span>
          ) : (
            "Learn More"
          );

          return (
            <Reveal key={s.nameEn} delay={i * 70} className="h-full">
              <CardShell href="#advice" hoverCls="hover:border-indigo-500/40 hover:shadow-indigo-500/10">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Landmark className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-landing-fg">{cardName}</h3>
                <div className="mt-2 flex-1 text-sm leading-relaxed text-landing-fg-muted font-medium">
                  {cardText}
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                  {learnMoreText}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </CardShell>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------------- 4. Weather ---------------- */

export function Weather() {
  const { t } = useLanguage();

  const [weatherResult, setWeatherResult] = useState<WeatherServiceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRequestingPrecise, setIsRequestingPrecise] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<"ip" | "precise" | "denied">("ip");

  const loadWeather = async (lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const res = await getWeatherData(lat, lon);
      setWeatherResult(res);
      if (lat !== undefined && lon !== undefined) {
        setLocationStatus("precise");
      }
    } catch (e) {
      console.error("Failed to load weather data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleEnablePreciseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsRequestingPrecise(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        loadWeather(latitude, longitude);
        setIsRequestingPrecise(false);
      },
      (error) => {
        console.warn("Geolocation permission error:", error.message);
        setLocationStatus("denied");
        setIsRequestingPrecise(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const data = weatherResult?.data;

  const renderIcon = (iconType?: string, className: string = "size-6") => {
    switch (iconType) {
      case "sun":
        return <Sun className={className} />;
      case "partly":
        return <CloudSun className={className} />;
      case "cloud":
        return <Cloud className={className} />;
      case "rain":
        return <CloudRain className={className} />;
      case "storm":
        return <CloudLightning className={className} />;
      default:
        return <CloudSun className={className} />;
    }
  };

  return (
    <Section id="weather">
      <SectionHead
        eyebrow="Weather"
        hindi="मौसम अपडेट"
        title={t("Weather for Your Location", "आपके स्थान का मौसम")}
        sub={t(
          "Stay updated with current conditions and a simple five-day outlook for your area.",
          "वर्तमान स्थितियों और अपने क्षेत्र के 5-दिवसीय मौसम पूर्वानुमान से अपडेट रहें।"
        )}
        badgeTheme="amber"
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="h-full">
          <div className="h-full overflow-hidden rounded-2xl border border-amber-500/20 bg-landing-card shadow-landing-soft hover:border-amber-500/40 transition-colors">
            <div className="relative h-40">
              <img
                src={fieldWide}
                alt="Green farmland at sunrise"
                loading="lazy"
                width={1600}
                height={800}
                className="size-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleEnablePreciseLocation}
                  disabled={isRequestingPrecise}
                  className="flex items-center gap-1.5 rounded-full bg-amber-950/80 hover:bg-amber-900 px-3 py-1.5 text-xs font-bold text-amber-200 border border-amber-500/30 backdrop-blur-md transition-all shadow-md active:scale-95 disabled:opacity-50"
                  title="Prompt browser to use precise GPS location"
                >
                  <Navigation className={`size-3.5 ${isRequestingPrecise ? "animate-spin" : ""}`} />
                  {isRequestingPrecise
                    ? t("Requesting...", "अनुमति मांगी जा रही है...")
                    : locationStatus === "precise"
                    ? t("GPS Location Active", "सटीक स्थान चालू")
                    : t("Enable Precise Location", "सटीक स्थान सक्षम करें")}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <MapPin className="size-4 shrink-0" />
                  <p className="text-sm font-bold truncate">
                    {data?.location || t("Prayagraj, Uttar Pradesh", "प्रयागराज, उत्तर प्रदेश")}
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  {locationStatus === "precise" || data?.isPrecise
                    ? t("GPS Location", "सटीक स्थान")
                    : t("IP Location", "आईपी स्थान")}
                </span>
              </div>

              {locationStatus === "denied" && (
                <p className="mt-1 text-2xs text-amber-700 dark:text-amber-400 font-medium">
                  {t(
                    "Location permission denied. Showing approximate location.",
                    "स्थान अनुमति अस्वीकृत। केवल अनुमानित स्थान दिखाया जा रहा है।"
                  )}
                </p>
              )}

              <div className="mt-4 flex items-end justify-between">
                <p className="text-5xl font-extrabold tracking-tight text-landing-fg">
                  {loading ? "--°C" : `${data?.current.temperature_c ?? 28}°C`}
                </p>
                <div className="flex flex-col items-end">
                  <span className="text-amber-600 mb-1">
                    {renderIcon(data?.current.condition_icon, "size-7")}
                  </span>
                  <p className="text-base font-bold text-landing-fg-muted">
                    {data?.current.condition || t("Partly Cloudy", "आंशिक रूप से बादल")}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3">
                {[
                  {
                    icon: <Droplets className="size-4" />,
                    k: t("Humidity", "आर्द्रता"),
                    v: `${data?.current.humidity_percent ?? 72}%`,
                  },
                  {
                    icon: <CloudRain className="size-4" />,
                    k: t("Rain Chance", "बारिश की संभावना"),
                    v: `${data?.current.rain_chance ?? 20}%`,
                  },
                  {
                    icon: <Wind className="size-4" />,
                    k: t("Wind", "हवा"),
                    v: `${data?.current.wind_kmh ?? 12} km/h`,
                  },
                ].map((r) => (
                  <div key={r.k} className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/15">
                    <dt className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <span className="text-amber-600">{r.icon}</span>
                      {r.k}
                    </dt>
                    <dd className="mt-1 text-base font-bold text-landing-fg">{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="h-full">
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-2xl border border-landing-border bg-landing-card p-6 shadow-landing-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-landing-fg">{t("Next 5 days", "अगले 5 दिन")}</p>
                <button
                  onClick={() => loadWeather()}
                  disabled={loading}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                  {t("Refresh", "ताज़ा करें")}
                </button>
              </div>
              <div className="mt-5 grid grid-cols-5 gap-2 text-center">
                {(data?.forecast || [
                  { day: "Today", temp: "28°", rain: "20%", icon: "rain" },
                  { day: "Tomorrow", temp: "27°", rain: "65%", icon: "rain" },
                  { day: "Wed", temp: "29°", rain: "30%", icon: "cloud" },
                  { day: "Thu", temp: "30°", rain: "10%", icon: "partly" },
                  { day: "Fri", temp: "31°", rain: "5%", icon: "sun" },
                ]).map((f: any) => (
                  <div key={f.day} className="rounded-xl bg-amber-500/10 px-1 py-4 border border-amber-500/10">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{f.day}</p>
                    <span className="mt-2 inline-flex justify-center text-amber-600">
                      {renderIcon(f.condition_icon || f.icon, "size-5")}
                    </span>
                    <p className="mt-2 text-base font-bold text-landing-fg">
                      {f.high_c !== undefined ? `${f.high_c}°` : f.temp}
                    </p>
                    <p className="text-xs font-semibold text-landing-fg-muted">
                      {f.rain_chance !== undefined ? `${f.rain_chance}%` : f.rain}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <CloudRain className="size-5" />
              </span>
              <div>
                <p className="text-base font-bold text-landing-fg">
                  {data?.alert?.title || t("Rain expected tomorrow", "कल बारिश की संभावना")}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-landing-fg-muted font-medium">
                  {data?.alert?.description ||
                    t(
                      "Consider planning irrigation accordingly and delay spraying until the field dries.",
                      "तदनुसार सिंचाई की योजना बनाएं और खेत सूखने तक छिड़काव टालें।"
                    )}
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
  {
    titleEn: "Sowing at the right time",
    titleHi: "सही समय पर बुवाई",
    textEn: "Simple season-wise guidance on when to sow each crop for better results.",
    textHi: "बेहतर परिणाम के लिए प्रत्येक फसल की बुवाई कब करें, इसका मौसम-वार मार्गदर्शन।",
  },
  {
    titleEn: "Water and irrigation",
    titleHi: "जल और सिंचाई",
    textEn: "Practical ways to plan irrigation and save water through the growing season.",
    textHi: "बढ़ते मौसम के दौरान सिंचाई की योजना बनाने और पानी बचाने के व्यावहारिक तरीके।",
  },
  {
    titleEn: "Soil and fertilizer care",
    titleHi: "मिट्टी और उर्वरक देखभाल",
    textEn: "Keep your soil healthy with balanced nutrients and simple field practices.",
    textHi: "संतुलित पोषक तत्वों और सरल कृषि तकनीकों से अपनी मिट्टी को स्वस्थ रखें।",
  },
  {
    titleEn: "Pest and disease control",
    titleHi: "कीट और रोग नियंत्रण",
    textEn: "Spot common crop problems early and know the safe steps to take.",
    textHi: "फसल की आम समस्याओं को जल्द पहचानें और सुरक्षात्मक उपाय अपनाएं।",
  },
];

export function Knowledge() {
  const { t } = useLanguage();

  return (
    <Section id="knowledge" className="bg-purple-500/5 dark:bg-purple-950/20">
      <SectionHead
        eyebrow="Knowledge"
        hindi="खेती का ज्ञान"
        title={t("Farming Knowledge", "खेती का ज्ञान")}
        sub={t(
          "Learn practical information that helps you make better farming decisions.",
          "व्यावहारिक जानकारी सीखें जो आपको बेहतर खेती के निर्णय लेने में मदद करती है।"
        )}
        badgeTheme="purple"
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KNOWLEDGE.map((k, i) => (
          <Reveal key={k.titleEn} delay={i * 70} className="h-full">
            <CardShell href="#advice" hoverCls="hover:border-purple-500/40 hover:shadow-purple-500/10">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <BookOpen className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-bold text-landing-fg">{t(k.titleEn, k.titleHi)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-landing-fg-muted font-medium">
                {t(k.textEn, k.textHi)}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 dark:text-purple-400">
                {t("Read More", "और पढ़ें")}
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
  const { t, language } = useLanguage();

  return (
    <Section id="advice">
      <Reveal>
        <div className="grid overflow-hidden rounded-3xl border border-emerald-500/20 bg-landing-card shadow-landing-lift lg:grid-cols-2">
          <div className="order-2 flex flex-col justify-center p-8 sm:p-12 lg:order-1">
            <p className="flex items-center gap-2.5">
              <span className="text-sm font-bold tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
                {t("Personalized Advice", "व्यक्तिगत सलाह")}
              </span>
              {(language === "both" || language === "hi") && (
                <span className="landing-hindi rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.75rem] font-bold text-emerald-700 dark:text-emerald-300">
                  आपके लिए सलाह
                </span>
              )}
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-extrabold text-landing-fg sm:text-4xl">
              {t("Get Personalized Crop Advice", "व्यक्तिगत फसल सलाह प्राप्त करें")}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-landing-fg-muted font-medium">
              {t(
                "Ask your questions and get farming guidance based on your location, season and crop needs.",
                "अपने प्रश्न पूछें और अपने स्थान, मौसम और फसल की जरूरतों के आधार पर खेती का मार्गदर्शन प्राप्त करें।"
              )}
            </p>
            <div className="mt-8">
              <Link
                to="/recommendation"
                className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                {t("Get Crop Advice", "फसल सलाह लें")}
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

export function ImpactStats() {
  const { t } = useLanguage();

  const STATS = [
    { v: "25+", k: t("Crop Guides", "फसल गाइड") },
    { v: "100+", k: t("Government Schemes", "सरकारी योजनाएं") },
    { v: "50,000+", k: t("Questions Answered", "उत्तर दिए गए प्रश्न") },
    { v: "500+", k: t("Districts Covered", "कवर किए गए जिले") },
  ];

  return (
    <Section className="pb-8">
      <Reveal>
        <div className="grid gap-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k} className="text-center sm:text-left">
              <p className="text-4xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400">{s.v}</p>
              <p className="mt-2 text-sm font-bold text-landing-fg-muted">{s.k}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs font-medium text-landing-fg-muted sm:text-left">
          {t("Figures shown are indicative platform coverage values.", "दिखाए गए आंकड़े केवल मंच कवरेज के सूचक हैं।")}
        </p>
      </Reveal>
    </Section>
  );
}
