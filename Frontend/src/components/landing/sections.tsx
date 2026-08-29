/**
 * Landing page content sections — ported from agrisense-insights.
 * Replaced @tanstack/react-router with react-router-dom.
 * Asset imports use relative paths.
 */
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
import type { ReactNode } from "react";
import { Reveal, Section, SectionHead } from "./primitives";
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

const CROP_GUIDE = [
  { name: "Paddy (Dhaan)",    season: "Kharif Season", text: "High-yielding varieties, planting time, irrigation and care.",                        img: paddyImg },
  { name: "Wheat (Gehu)",     season: "Rabi Season",   text: "Best varieties, sowing time, fertilizers and yield management.",                      img: wheatImg },
  { name: "Cotton",           season: "Kharif Season", text: "Seed selection, pest control, irrigation and harvesting.",                             img: cottonImg },
  { name: "Mustard (Sarson)", season: "Rabi Season",   text: "Growing guide, disease management and best practices.",                                img: mustardImg },
  { name: "Maize",            season: "Kharif Season", text: "Sowing time, nutrients, irrigation and disease control.",                              img: maizeImg },
  { name: "Sugarcane (Ganna)", season: "Year-round",   text: "Planting, ratoon management, irrigation and harvest timing.",                          img: sugarcaneImg },
];

export function CropGuide() {
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
            <Link
              to="/recommendation"
              className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl shadow-landing-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-landing-lift"
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
            </Link>
          </Reveal>
        ))}
      </div>
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
