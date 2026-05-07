// app.jsx
import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var SUPABASE_URL = "https://uxfvrlmszkhlxmiqolue.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZnZybG1zemtobHhtaXFvbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDUxNTcsImV4cCI6MjA5MzY4MTE1N30.fIfsCdy8bK6XuvR_OTksdRhuEP8HPRNX6nq7txw-Fms";
var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var SEED_CLUBS = [
  // Florida
  { name: "Tootsie's Cabaret", city: "Miami", state: "Florida", address: "150 NW 183rd St, Miami Gardens, FL 33169", phone: "(305) 651-5822", type: "Full Nude", size: "Large" },
  { name: "Scarlett's Cabaret", city: "Miami", state: "Florida", address: "2920 SW 30th Ave, Hallandale Beach, FL 33009", phone: "(954) 457-5765", type: "Full Nude", size: "Large" },
  { name: "Mons Venus", city: "Tampa", state: "Florida", address: "2040 N Dale Mabry Hwy, Tampa, FL 33607", phone: "(813) 875-6667", type: "Full Nude", size: "Medium" },
  { name: "Deja Vu Tampa", city: "Tampa", state: "Florida", address: "6314 S Dale Mabry Hwy, Tampa, FL 33611", phone: "(813) 831-7700", type: "Full Nude", size: "Medium" },
  { name: "Rachel's Orlando", city: "Orlando", state: "Florida", address: "8401 S Orange Blossom Trl, Orlando, FL 32809", phone: "(407) 857-8825", type: "Full Nude", size: "Large" },
  { name: "Lido Cabaret", city: "Jacksonville", state: "Florida", address: "5535 Philips Hwy, Jacksonville, FL 32207", phone: "(904) 733-3330", type: "Bikini", size: "Medium" },
  // Texas
  { name: "XTC Cabaret", city: "Houston", state: "Texas", address: "7530 N Sam Houston Pkwy E, Humble, TX 77396", phone: "(281) 821-8099", type: "Full Nude", size: "Large" },
  { name: "Baby Dolls", city: "Dallas", state: "Texas", address: "10250 Shady Trail, Dallas, TX 75220", phone: "(214) 358-8tried ", type: "Full Nude", size: "Large" },
  { name: "Perfect 10", city: "Dallas", state: "Texas", address: "10477 Composite Dr, Dallas, TX 75220", phone: "(214) 630-0906", type: "Full Nude", size: "Medium" },
  { name: "Palazio Cabaret", city: "Austin", state: "Texas", address: "401 E Highland Mall Blvd, Austin, TX 78752", phone: "(512) 467-8822", type: "Bikini", size: "Medium" },
  { name: "Sugar's", city: "Houston", state: "Texas", address: "4540 Bissonnet St, Houston, TX 77401", phone: "(713) 668-2781", type: "Full Nude", size: "Large" },
  { name: "Rick's Cabaret", city: "San Antonio", state: "Texas", address: "10030 Luminance, San Antonio, TX 78249", phone: "(210) 408-2535", type: "Full Nude", size: "Medium" },
  // Georgia
  { name: "Magic City", city: "Atlanta", state: "Georgia", address: "241 Forsyth St SW, Atlanta, GA 30303", phone: "(404) 331-4799", type: "Full Nude", size: "Large" },
  { name: "Cheetah Lounge", city: "Atlanta", state: "Georgia", address: "887 Spring St NW, Atlanta, GA 30308", phone: "(404) 892-3037", type: "Full Nude", size: "Large" },
  { name: "Allure", city: "Atlanta", state: "Georgia", address: "2788 Metropolitan Pkwy SW, Atlanta, GA 30315", phone: "(404) 209-9798", type: "Full Nude", size: "Medium" },
  { name: "Onyx", city: "Atlanta", state: "Georgia", address: "2801 Metropolitan Pkwy SW, Atlanta, GA 30315", phone: "(404) 209-0990", type: "Full Nude", size: "Large" },
  // Nevada
  { name: "Spearmint Rhino", city: "Las Vegas", state: "Nevada", address: "3340 S Highland Dr, Las Vegas, NV 89109", phone: "(702) 796-3600", type: "Full Nude", size: "Large" },
  { name: "Sapphire", city: "Las Vegas", state: "Nevada", address: "3025 Sammy Davis Jr Dr, Las Vegas, NV 89109", phone: "(702) 796-6000", type: "Full Nude", size: "Large" },
  { name: "Crazy Horse III", city: "Las Vegas", state: "Nevada", address: "3525 W Russell Rd, Las Vegas, NV 89118", phone: "(702) 673-1700", type: "Full Nude", size: "Large" },
  { name: "Deja Vu Showgirls", city: "Las Vegas", state: "Nevada", address: "3247 Sammy Davis Jr Dr, Las Vegas, NV 89109", phone: "(702) 894-4167", type: "Full Nude", size: "Medium" },
  // New York
  { name: "Sapphire 60", city: "New York", state: "New York", address: "20 W 20th St, New York, NY 10011", phone: "(212) 206-8188", type: "Topless", size: "Medium" },
  { name: "Rick's Cabaret NYC", city: "New York", state: "New York", address: "50 W 33rd St, New York, NY 10001", phone: "(212) 279-8800", type: "Topless", size: "Large" },
  { name: "Hustler Club NYC", city: "New York", state: "New York", address: "641 W 51st St, New York, NY 10019", phone: "(212) 247-2460", type: "Topless", size: "Large" },
  // California
  { name: "Seventh Veil", city: "Los Angeles", state: "California", address: "7180 Sunset Blvd, Hollywood, CA 90046", phone: "(323) 851-7447", type: "Full Nude", size: "Medium" },
  { name: "Deja Vu Hollywood", city: "Los Angeles", state: "California", address: "7969 Santa Monica Blvd, Los Angeles, CA 90046", phone: "(323) 656-6461", type: "Full Nude", size: "Medium" },
  { name: "Gold Club SF", city: "San Francisco", state: "California", address: "650 Howard St, San Francisco, CA 94105", phone: "(415) 536-0300", type: "Full Nude", size: "Large" },
  { name: "Centerfolds", city: "San Francisco", state: "California", address: "391 Broadway, San Francisco, CA 94133", phone: "(415) 677-7625", type: "Full Nude", size: "Medium" },
  // Illinois
  { name: "Admirals Theatre", city: "Chicago", state: "Illinois", address: "3940 W Lawrence Ave, Chicago, IL 60625", phone: "(773) 478-8263", type: "Full Nude", size: "Medium" },
  { name: "VIP's Gentlemen's Club", city: "Chicago", state: "Illinois", address: "1621 N Harlem Ave, Elmwood Park, IL 60707", phone: "(708) 452-6400", type: "Full Nude", size: "Medium" },
  // Arizona
  { name: "Bourbon Street Circus", city: "Phoenix", state: "Arizona", address: "4341 W Thomas Rd, Phoenix, AZ 85031", phone: "(602) 233-8879", type: "Full Nude", size: "Medium" },
  { name: "Hi-Liter", city: "Phoenix", state: "Arizona", address: "1620 N Black Canyon Hwy, Phoenix, AZ 85009", phone: "(602) 254-1601", type: "Full Nude", size: "Large" },
  { name: "Skin Cabaret", city: "Scottsdale", state: "Arizona", address: "4240 N Craftsman Ct, Scottsdale, AZ 85251", phone: "(480) 947-7456", type: "Bikini", size: "Medium" },
  // North Carolina
  { name: "Blush", city: "Charlotte", state: "North Carolina", address: "3500 S Blvd, Charlotte, NC 28209", phone: "(704) 527-0808", type: "Topless", size: "Medium" },
  { name: "Uptown Cabaret", city: "Charlotte", state: "North Carolina", address: "3218 S Blvd, Charlotte, NC 28209", phone: "(704) 523-3377", type: "Topless", size: "Large" },
  // Louisiana
  { name: "Rick's Cabaret NOLA", city: "New Orleans", state: "Louisiana", address: "315 Bourbon St, New Orleans, LA 70130", phone: "(504) 524-4222", type: "Full Nude", size: "Medium" },
  { name: "Hustler Club NOLA", city: "New Orleans", state: "Louisiana", address: "225 Bourbon St, New Orleans, LA 70130", phone: "(504) 568-1313", type: "Topless", size: "Large" },
  // Ohio
  { name: "Diamond Fox", city: "Columbus", state: "Ohio", address: "886 W Broad St, Columbus, OH 43222", phone: "(614) 228-0200", type: "Full Nude", size: "Medium" },
  // Michigan
  { name: "Bouzouki", city: "Detroit", state: "Michigan", address: "432 Monroe St, Detroit, MI 48226", phone: "(313) 964-5744", type: "Full Nude", size: "Large" },
  { name: "Flight Club", city: "Detroit", state: "Michigan", address: "29709 Michigan Ave, Inkster, MI 48141", phone: "(734) 721-5540", type: "Full Nude", size: "Medium" },
  // Colorado
  { name: "Shotgun Willie's", city: "Denver", state: "Colorado", address: "490 S Colorado Blvd, Denver, CO 80246", phone: "(303) 399-2110", type: "Full Nude", size: "Large" },
  { name: "Diamond Cabaret", city: "Denver", state: "Colorado", address: "1222 Glenarm Pl, Denver, CO 80204", phone: "(303) 571-4242", type: "Full Nude", size: "Medium" },
  // Tennessee
  { name: "Deja Vu Nashville", city: "Nashville", state: "Tennessee", address: "218 Printers Alley, Nashville, TN 37201", phone: "(615) 244-7256", type: "Topless", size: "Medium" },
  // Washington
  { name: "Deja Vu Seattle", city: "Seattle", state: "Washington", address: "1538 Western Ave, Seattle, WA 98101", phone: "(206) 624-5610", type: "Full Nude", size: "Medium" },
  // Oregon
  { name: "Casa Diablo", city: "Portland", state: "Oregon", address: "2839 NW St Helens Rd, Portland, OR 97210", phone: "(503) 222-6600", type: "Full Nude", size: "Small" },
  { name: "Acropolis Steakhouse", city: "Portland", state: "Oregon", address: "8325 SE McLoughlin Blvd, Portland, OR 97202", phone: "(503) 231-9611", type: "Full Nude", size: "Medium" },
  // New Jersey
  { name: "Satin Dolls", city: "Lodi", state: "New Jersey", address: "230 NJ-17, Lodi, NJ 07644", phone: "(201) 845-2113", type: "Topless", size: "Large" },
  // Pennsylvania
  { name: "Club Risque", city: "Philadelphia", state: "Pennsylvania", address: "1700 S Columbus Blvd, Philadelphia, PA 19148", phone: "(215) 468-2010", type: "Full Nude", size: "Large" },
  { name: "Cheerleaders", city: "Philadelphia", state: "Pennsylvania", address: "2740 S Front St, Philadelphia, PA 19148", phone: "(215) 218-8400", type: "Full Nude", size: "Medium" },
  // South Carolina
  { name: "Platinum Plus", city: "Columbia", state: "South Carolina", address: "820 Harden St, Columbia, SC 29205", phone: "(803) 254-1000", type: "Full Nude", size: "Medium" },
  // Maryland
  { name: "Norma Jean's", city: "Baltimore", state: "Maryland", address: "5056 Washington Blvd, Halethorpe, MD 21227", phone: "(410) 789-8118", type: "Full Nude", size: "Medium" }
].map((c, i) => ({ ...c, id: `club_${i + 1}` }));
function Navbar({ user, page, setPage, onLogout, role }) {
  return /* @__PURE__ */ jsxs("nav", { className: "navbar", children: [
    /* @__PURE__ */ jsxs("div", { className: "navbar-brand", style: { cursor: "pointer" }, onClick: () => setPage("landing"), children: [
      "Stage",
      /* @__PURE__ */ jsx("span", { className: "green", children: "Pass" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "navbar-links", children: [
      /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
        e.preventDefault();
        setPage("clubs");
      }, children: "Clubs" }),
      /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
        e.preventDefault();
        setPage("dancers");
      }, children: "Dancers" }),
      user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
          e.preventDefault();
          setPage("dashboard");
        }, children: "Dashboard" }),
        /* @__PURE__ */ jsx("button", { onClick: onLogout, children: "Log Out" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-secondary", onClick: () => setPage("login"), children: "Log In" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-primary", onClick: () => setPage("signup"), children: "Sign Up" })
      ] })
    ] })
  ] });
}
function Landing({ setPage }) {
  const uniqueStates = [...new Set(SEED_CLUBS.map((c) => c.state))].length;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "hero", children: [
      /* @__PURE__ */ jsxs("h1", { style: { fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem" }, children: [
        "Build Your Tour.",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsxs("span", { style: { color: "var(--accent)" }, children: [
          "Join The ",
          /* @__PURE__ */ jsx("span", { style: { color: "var(--success)" }, children: "$" }),
          "howcase."
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "560px", margin: "0 auto 2rem" }, children: "The platform for dancers to plan tours across clubs nationwide \u2014 and get seen by the people who matter." }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-lg", onClick: () => setPage("signup"), children: "I'm a Dancer" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-accent btn-lg", onClick: () => setPage("login"), children: "I'm a Club" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "center", gap: "3rem", marginTop: "3rem", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "2rem", fontWeight: 900, color: "var(--primary)" }, children: [
            SEED_CLUBS.length,
            "+"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: "0.8rem", color: "var(--text-dim)" }, children: "Clubs Listed" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: "2rem", fontWeight: 900, color: "var(--accent)" }, children: uniqueStates }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: "0.8rem", color: "var(--text-dim)" }, children: "States" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: "2rem", fontWeight: 900, color: "var(--success)" }, children: "Free" }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: "0.8rem", color: "var(--text-dim)" }, children: "For Dancers" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "section", style: { borderTop: "1px solid var(--border)" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { flex: "1 1 320px" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--primary)", marginBottom: "0.75rem" }, children: "TOUR BUILDER" }),
        /* @__PURE__ */ jsxs("h2", { style: { fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }, children: [
          "Build Your ",
          /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "Next Tour" })
        ] }),
        /* @__PURE__ */ jsx("p", { style: { color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }, children: "Browse clubs by state, city, or name. Pick your dates. Submit booking requests. Track confirmations from one dashboard." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "\u2713 ",
            SEED_CLUBS.length,
            "+ clubs across ",
            uniqueStates,
            " states"
          ] }),
          /* @__PURE__ */ jsx("div", { children: "\u2713 Full Nude, Topless, and Bikini venues" }),
          /* @__PURE__ */ jsx("div", { children: "\u2713 Send booking requests directly to clubs" }),
          /* @__PURE__ */ jsx("div", { children: "\u2713 Track every stop from your dashboard" })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: () => setPage("clubs"), children: "Browse Clubs" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { flex: "1 1 300px", maxWidth: "380px" }, children: /* @__PURE__ */ jsxs("div", { className: "tour-preview", style: { maxWidth: "100%" }, children: [
        /* @__PURE__ */ jsx("div", { className: "tour-preview-header", children: "SAMPLE TOUR" }),
        [
          { num: 1, name: "Tootsie's Cabaret", meta: "Miami, FL \u2014 Jun 14", status: "confirmed" },
          { num: 2, name: "Magic City", meta: "Atlanta, GA \u2014 Jun 18", status: "pending" },
          { num: 3, name: "King of Diamonds", meta: "Miami, FL \u2014 Jun 22", status: "pending" }
        ].map((stop, i) => /* @__PURE__ */ jsxs("div", { className: "tour-preview-stop", children: [
          /* @__PURE__ */ jsx("div", { className: "tour-preview-num", children: stop.num }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "tour-preview-name", children: stop.name }),
            /* @__PURE__ */ jsx("div", { className: "tour-preview-meta", children: stop.meta })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `tour-preview-badge status-${stop.status}`, children: stop.status === "confirmed" ? "Confirmed" : "Pending" })
        ] }, i))
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { style: { background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }, children: /* @__PURE__ */ jsx("div", { className: "section", style: { padding: "4rem 2rem" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap-reverse" }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: "1 1 300px", maxWidth: "380px" }, children: /* @__PURE__ */ jsx("div", { className: "dancer-preview-row", style: { maxWidth: "100%" }, children: [
        { name: "Diamond", city: "Miami, FL", emoji: "\u{1F483}", tags: ["IG", "Linktree"] },
        { name: "Sapphire", city: "Atlanta, GA", emoji: "\u2728", tags: ["IG", "OnlyFans"] }
      ].map((d, i) => /* @__PURE__ */ jsxs("div", { className: "dancer-preview-card", children: [
        /* @__PURE__ */ jsx("div", { className: "dancer-preview-avatar", children: d.emoji }),
        /* @__PURE__ */ jsxs("div", { className: "dancer-preview-info", children: [
          /* @__PURE__ */ jsx("div", { className: "dancer-preview-name", children: d.name }),
          /* @__PURE__ */ jsx("div", { className: "dancer-preview-loc", children: d.city }),
          /* @__PURE__ */ jsx("div", { className: "dancer-preview-tags", children: d.tags.map((t, j) => /* @__PURE__ */ jsx("span", { className: "dancer-preview-tag", children: t }, j)) })
        ] })
      ] }, i)) }) }),
      /* @__PURE__ */ jsxs("div", { style: { flex: "1 1 320px" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--accent)", marginBottom: "0.75rem" }, children: "THE $HOWCASE" }),
        /* @__PURE__ */ jsxs("h2", { style: { fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }, children: [
          "Where The Money ",
          /* @__PURE__ */ jsx("span", { style: { color: "var(--accent)" }, children: "Looks First" })
        ] }),
        /* @__PURE__ */ jsx("p", { style: { color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }, children: "Your profile. Your links. Your spotlight. Get discovered by the people who spend." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }, children: [
          /* @__PURE__ */ jsx("div", { children: "\u2713 All your social links in one place" }),
          /* @__PURE__ */ jsx("div", { children: "\u2713 Searchable by state, city, and club" }),
          /* @__PURE__ */ jsx("div", { children: "\u2713 Featured profiles for top dancers" }),
          /* @__PURE__ */ jsx("div", { children: "\u2713 Free to join \u2014 own your spotlight" })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-accent", onClick: () => setPage("dancers"), children: "See Dancers" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "section", style: { textAlign: "center" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--success)", marginBottom: "0.75rem" }, children: "FOR CLUBS" }),
      /* @__PURE__ */ jsx("h2", { style: { fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }, children: "Manage Your Bookings" }),
      /* @__PURE__ */ jsx("p", { style: { color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto 1.5rem", fontSize: "0.95rem" }, children: "Review dancer requests, accept or decline with one click, and build your upcoming lineup \u2014 all from one dashboard." }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-secondary btn-lg", onClick: () => setPage("login"), children: "Club Log In" })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "footer", children: /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx("span", { style: { color: "var(--accent)", fontWeight: 700 }, children: "Stage" }),
      /* @__PURE__ */ jsx("span", { style: { color: "var(--success)", fontWeight: 700 }, children: "Pass" }),
      " \u2014 Tour. Perform. Get Discovered."
    ] }) })
  ] });
}
function ClubDirectory({ setPage, user }) {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const states = [...new Set(SEED_CLUBS.map((c) => c.state))].sort();
  const types = [...new Set(SEED_CLUBS.map((c) => c.type))].sort();
  const filtered = SEED_CLUBS.filter((c) => {
    if (stateFilter && c.state !== stateFilter) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.city.toLowerCase().includes(s) || c.state.toLowerCase().includes(s);
    }
    return true;
  });
  return /* @__PURE__ */ jsxs("div", { className: "section", children: [
    /* @__PURE__ */ jsxs("div", { className: "section-header", children: [
      /* @__PURE__ */ jsx("h2", { children: "Club Directory" }),
      /* @__PURE__ */ jsxs("p", { children: [
        SEED_CLUBS.length,
        " clubs across ",
        states.length,
        " states"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "filter-bar", children: [
      /* @__PURE__ */ jsx("input", { placeholder: "Search clubs, cities...", value: search, onChange: (e) => setSearch(e.target.value) }),
      /* @__PURE__ */ jsxs("select", { value: stateFilter, onChange: (e) => setStateFilter(e.target.value), children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "All States" }),
        states.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
      ] }),
      /* @__PURE__ */ jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "All Types" }),
        types.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "club-grid", children: [
      filtered.map((club) => /* @__PURE__ */ jsxs("div", { className: "club-card", children: [
        /* @__PURE__ */ jsx("div", { className: "club-name", children: club.name }),
        /* @__PURE__ */ jsxs("div", { className: "club-location", children: [
          club.city,
          ", ",
          club.state
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.3rem", marginBottom: "0.5rem", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx("span", { className: "club-tag", children: club.type }),
          /* @__PURE__ */ jsx("span", { className: "club-tag", children: club.size })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "club-contact", children: club.address }),
        /* @__PURE__ */ jsx("div", { className: "club-contact", style: { marginTop: "0.25rem" }, children: club.phone }),
        user && user.user_metadata?.role === "dancer" && /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm btn-primary",
            style: { marginTop: "0.75rem" },
            onClick: () => setPage("tour-builder"),
            children: "+ Add to Tour"
          }
        )
      ] }, club.id)),
      filtered.length === 0 && /* @__PURE__ */ jsx("div", { style: { gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-dim)" }, children: "No clubs match your search. Try a different state or keyword." })
    ] })
  ] });
}
function DancerShowcase() {
  const sampleDancers = [
    { id: 1, name: "Diamond", city: "Miami", state: "Florida", homeClub: "Tootsie's Cabaret", socials: [{ platform: "IG", handle: "@diamond" }, { platform: "Twitter", handle: "@diamondx" }] },
    { id: 2, name: "Coco", city: "Atlanta", state: "Georgia", homeClub: "Magic City", socials: [{ platform: "IG", handle: "@cocoatl" }] },
    { id: 3, name: "Jade", city: "Las Vegas", state: "Nevada", homeClub: "Spearmint Rhino", socials: [{ platform: "IG", handle: "@jadelv" }, { platform: "Linktree", handle: "jade.lv" }] },
    { id: 4, name: "Sapphire", city: "Houston", state: "Texas", homeClub: "XTC Cabaret", socials: [{ platform: "IG", handle: "@sapphiretx" }] },
    { id: 5, name: "Raven", city: "New York", state: "New York", homeClub: "Rick's Cabaret NYC", socials: [{ platform: "IG", handle: "@ravennyc" }, { platform: "OnlyFans", handle: "ravenx" }] },
    { id: 6, name: "Luna", city: "Dallas", state: "Texas", homeClub: "Baby Dolls", socials: [{ platform: "IG", handle: "@lunadallas" }] }
  ];
  const [stateFilter, setStateFilter] = useState("");
  const states = [...new Set(sampleDancers.map((d) => d.state))].sort();
  const filtered = stateFilter ? sampleDancers.filter((d) => d.state === stateFilter) : sampleDancers;
  return /* @__PURE__ */ jsxs("div", { className: "section", children: [
    /* @__PURE__ */ jsxs("div", { className: "section-header", children: [
      /* @__PURE__ */ jsx("h2", { children: "Dancer Showcase" }),
      /* @__PURE__ */ jsx("p", { children: "Discover dancers from across the country" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "filter-bar", children: /* @__PURE__ */ jsxs("select", { value: stateFilter, onChange: (e) => setStateFilter(e.target.value), children: [
      /* @__PURE__ */ jsx("option", { value: "", children: "All States" }),
      states.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "dancer-grid", children: filtered.map((dancer) => /* @__PURE__ */ jsxs("div", { className: "dancer-card", children: [
      /* @__PURE__ */ jsx("div", { className: "dancer-avatar", children: "\u{1F483}" }),
      /* @__PURE__ */ jsxs("div", { className: "dancer-info", children: [
        /* @__PURE__ */ jsx("div", { className: "dancer-name", children: dancer.name }),
        /* @__PURE__ */ jsxs("div", { className: "dancer-location", children: [
          dancer.city,
          ", ",
          dancer.state
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "0.5rem" }, children: [
          "Home: ",
          dancer.homeClub
        ] }),
        /* @__PURE__ */ jsx("div", { className: "dancer-socials", children: dancer.socials.map((s, i) => /* @__PURE__ */ jsxs("span", { className: "social-link", children: [
          s.platform,
          ": ",
          s.handle
        ] }, i)) })
      ] })
    ] }, dancer.id)) })
  ] });
}
function AuthForm({ mode, setPage, onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stageName, setStageName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { stage_name: stageName, role: "dancer" } }
        });
        if (err) throw err;
        if (data.user) {
          onAuth(data.user);
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) {
          onAuth(data.user);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "auth-container", children: [
    /* @__PURE__ */ jsx("h2", { children: mode === "signup" ? "Join StagePass" : "Welcome Back" }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: mode === "signup" ? "Create your dancer profile for free" : "Log in to your account" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      mode === "signup" && /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Stage Name" }),
        /* @__PURE__ */ jsx("input", { value: stageName, onChange: (e) => setStageName(e.target.value), placeholder: "Your stage name", required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Email" }),
        /* @__PURE__ */ jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@email.com", required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Password" }),
        /* @__PURE__ */ jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Min 6 characters", required: true })
      ] }),
      error && /* @__PURE__ */ jsx("div", { style: { color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }, children: error }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", type: "submit", style: { width: "100%", marginBottom: "1rem" }, disabled: loading, children: loading ? "Loading..." : mode === "signup" ? "Create Account" : "Log In" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }, children: mode === "signup" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      "Already have an account? ",
      /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
        e.preventDefault();
        setPage("login");
      }, children: "Log in" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      "Need an account? ",
      /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
        e.preventDefault();
        setPage("signup");
      }, children: "Sign up" })
    ] }) })
  ] });
}
function TourBuilder({ user }) {
  const [tourStops, setTourStops] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const addStop = () => {
    if (!selectedClub || !date) return;
    const club = SEED_CLUBS.find((c) => c.id === selectedClub);
    if (!club) return;
    setTourStops((prev) => [...prev, {
      id: Date.now(),
      club,
      date,
      notes,
      status: "pending"
    }]);
    setSelectedClub("");
    setDate("");
    setNotes("");
  };
  const removeStop = (id) => {
    setTourStops((prev) => prev.filter((s) => s.id !== id));
  };
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsx("h2", { children: "Build Your Tour" }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Pick clubs, choose dates, and submit booking requests." }),
    /* @__PURE__ */ jsxs("div", { className: "card", style: { marginBottom: "2rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--primary-light)" }, children: "Add a Stop" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Club" }),
          /* @__PURE__ */ jsxs("select", { value: selectedClub, onChange: (e) => setSelectedClub(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select a club..." }),
            SEED_CLUBS.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name)).map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
              c.name,
              " \u2014 ",
              c.city,
              ", ",
              c.state
            ] }, c.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Date" }),
          /* @__PURE__ */ jsx("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Notes for the club (optional)" }),
        /* @__PURE__ */ jsx("input", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "e.g. Available for 2 nights, experienced with VIP rooms" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: addStop, disabled: !selectedClub || !date, children: "Add to Tour" })
    ] }),
    tourStops.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("h3", { style: { fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }, children: [
        "Your Tour (",
        tourStops.length,
        " stops)"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tour-timeline", children: tourStops.sort((a, b) => new Date(a.date) - new Date(b.date)).map((stop, i) => /* @__PURE__ */ jsxs("div", { className: "tour-stop", children: [
        /* @__PURE__ */ jsx("div", { className: "tour-stop-num", children: i + 1 }),
        /* @__PURE__ */ jsxs("div", { className: "tour-stop-info", children: [
          /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, marginBottom: "0.15rem" }, children: stop.club.name }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }, children: [
            stop.club.city,
            ", ",
            stop.club.state,
            " \u2014 ",
            (/* @__PURE__ */ new Date(stop.date + "T12:00")).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
          ] }),
          stop.notes && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "var(--text-dim)", fontStyle: "italic" }, children: [
            '"',
            stop.notes,
            '"'
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `status-badge status-${stop.status}`, children: stop.status }),
        /* @__PURE__ */ jsx("button", { onClick: () => removeStop(stop.id), style: {
          background: "none",
          border: "none",
          color: "var(--danger)",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0.25rem"
        }, children: "\u2715" })
      ] }, stop.id)) }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-accent", style: { marginTop: "1.5rem", width: "100%" }, children: "Submit All Booking Requests" })
    ] }) : /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)" }, children: "No stops added yet. Pick a club and date above to start building your tour." })
  ] });
}
function DancerDashboard({ user, setPage }) {
  const [tab, setTab] = useState("tours");
  const stageName = user?.user_metadata?.stage_name || "Dancer";
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsxs("h2", { children: [
      "Hey, ",
      stageName
    ] }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Manage your tours and profile" }),
    /* @__PURE__ */ jsxs("div", { className: "tab-bar", children: [
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "tours" ? "active" : ""}`, onClick: () => setTab("tours"), children: "My Tours" }),
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "profile" ? "active" : ""}`, onClick: () => setTab("profile"), children: "My Profile" })
    ] }),
    tab === "tours" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsx("h3", { style: { fontSize: "1.1rem", fontWeight: 700 }, children: "Upcoming Tour Stops" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-primary", onClick: () => setPage("tour-builder"), children: "+ Build New Tour" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)", background: "var(--bg-card)", borderRadius: "1rem", border: "1px dashed var(--border)" }, children: "No tours yet. Start by building your first tour!" })
    ] }),
    tab === "profile" && /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--primary-light)" }, children: "Your Profile" }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Stage Name" }),
        /* @__PURE__ */ jsx("input", { defaultValue: stageName })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Home City" }),
        /* @__PURE__ */ jsx("input", { placeholder: "e.g. Miami, FL" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Home Club" }),
        /* @__PURE__ */ jsx("input", { placeholder: "Where you usually dance" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Instagram" }),
        /* @__PURE__ */ jsx("input", { placeholder: "@yourhandle" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Linktree / Link Hub URL" }),
        /* @__PURE__ */ jsx("input", { placeholder: "https://linktr.ee/yourname" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Bio" }),
        /* @__PURE__ */ jsx("textarea", { placeholder: "Tell clubs about yourself...", style: { minHeight: "80px" } })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", children: "Save Profile" })
    ] })
  ] });
}
function ClubDashboard({ user }) {
  const [tab, setTab] = useState("requests");
  const clubName = user?.user_metadata?.club_name || "Your Club";
  const sampleRequests = [
    { id: 1, dancer: "Diamond", date: "2026-05-15", status: "pending", notes: "Available for 2 nights, 5 years experience" },
    { id: 2, dancer: "Luna", date: "2026-05-20", status: "pending", notes: "Featured at Baby Dolls Dallas, touring through your city" }
  ];
  const [requests, setRequests] = useState(sampleRequests);
  const handleRequest = (id, action) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: action } : r));
  };
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsx("h2", { children: clubName }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Manage your incoming booking requests" }),
    /* @__PURE__ */ jsxs("div", { className: "tab-bar", children: [
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "requests" ? "active" : ""}`, onClick: () => setTab("requests"), children: "Booking Requests" }),
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "lineup" ? "active" : ""}`, onClick: () => setTab("lineup"), children: "Upcoming Lineup" })
    ] }),
    tab === "requests" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
      requests.filter((r) => r.status === "pending").length === 0 && /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)", background: "var(--bg-card)", borderRadius: "1rem", border: "1px dashed var(--border)" }, children: "No pending requests right now. New requests will appear here." }),
      requests.filter((r) => r.status === "pending").map((req) => /* @__PURE__ */ jsxs("div", { className: "card", style: { display: "flex", alignItems: "flex-start", gap: "1rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          flexShrink: 0
        }, children: "\u{1F483}" }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, marginBottom: "0.15rem" }, children: req.dancer }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }, children: [
            "Requested: ",
            (/* @__PURE__ */ new Date(req.date + "T12:00")).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
          ] }),
          req.notes && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-dim)", fontStyle: "italic", marginBottom: "0.5rem" }, children: [
            '"',
            req.notes,
            '"'
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-sm",
                style: { background: "var(--success)", color: "#fff", border: "none" },
                onClick: () => handleRequest(req.id, "confirmed"),
                children: "Accept"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-sm btn-secondary",
                style: { color: "var(--danger)", borderColor: "var(--danger)" },
                onClick: () => handleRequest(req.id, "declined"),
                children: "Decline"
              }
            )
          ] })
        ] })
      ] }, req.id))
    ] }),
    tab === "lineup" && /* @__PURE__ */ jsx("div", { children: requests.filter((r) => r.status === "confirmed").length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)", background: "var(--bg-card)", borderRadius: "1rem", border: "1px dashed var(--border)" }, children: "No confirmed dancers yet. Accept booking requests to build your lineup." }) : /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: requests.filter((r) => r.status === "confirmed").map((req) => /* @__PURE__ */ jsxs("div", { className: "tour-stop", children: [
      /* @__PURE__ */ jsx("div", { className: "tour-stop-num", style: { background: "var(--success)" }, children: "\u2713" }),
      /* @__PURE__ */ jsxs("div", { className: "tour-stop-info", children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: 700 }, children: req.dancer }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.8rem", color: "var(--text-muted)" }, children: (/* @__PURE__ */ new Date(req.date + "T12:00")).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "status-badge status-confirmed", children: "Confirmed" })
    ] }, req.id)) }) })
  ] });
}
function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleAuth = (user2) => {
    setUser(user2);
    setPage("dashboard");
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage("landing");
  };
  const role = user?.user_metadata?.role || "dancer";
  if (loading) return /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "4rem", color: "var(--text-muted)" }, children: "Loading..." });
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navbar, { user, page, setPage, onLogout: handleLogout, role }),
    page === "landing" && /* @__PURE__ */ jsx(Landing, { setPage }),
    page === "signup" && /* @__PURE__ */ jsx(AuthForm, { mode: "signup", setPage, onAuth: handleAuth }),
    page === "login" && /* @__PURE__ */ jsx(AuthForm, { mode: "login", setPage, onAuth: handleAuth }),
    page === "clubs" && /* @__PURE__ */ jsx(ClubDirectory, { setPage, user }),
    page === "dancers" && /* @__PURE__ */ jsx(DancerShowcase, {}),
    page === "tour-builder" && user && /* @__PURE__ */ jsx(TourBuilder, { user }),
    page === "dashboard" && user && (role === "club" ? /* @__PURE__ */ jsx(ClubDashboard, { user }) : /* @__PURE__ */ jsx(DancerDashboard, { user, setPage }))
  ] });
}
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx(App, {}));
