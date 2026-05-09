// app.jsx
import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AdminPanel } from "./admin.js";
var SUPABASE_URL = "https://uxfvrlmszkhlxmiqolue.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZnZybG1zemtobHhtaXFvbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDUxNTcsImV4cCI6MjA5MzY4MTE1N30.fIfsCdy8bK6XuvR_OTksdRhuEP8HPRNX6nq7txw-Fms";
var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];
var ADMIN_EMAIL = "247ggtms@gmail.com";
var _clubsCache = null;
var _clubsFetching = false;
var _clubsListeners = [];
async function getClubs() {
  if (_clubsCache) return _clubsCache;
  if (_clubsFetching) {
    return new Promise((resolve) => _clubsListeners.push(resolve));
  }
  _clubsFetching = true;
  const { data, error } = await supabase.from("clubs").select("*").order("state").order("name");
  _clubsCache = error ? [] : data;
  _clubsFetching = false;
  _clubsListeners.forEach((cb) => cb(_clubsCache));
  _clubsListeners = [];
  return _clubsCache;
}
function useClubs() {
  const [clubs, setClubs] = useState(_clubsCache || []);
  const [loading, setLoading] = useState(!_clubsCache);
  useEffect(() => {
    if (_clubsCache) {
      setClubs(_clubsCache);
      setLoading(false);
      return;
    }
    getClubs().then((c) => {
      setClubs(c);
      setLoading(false);
    });
  }, []);
  return { clubs, loading };
}
function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setNotifications(data || []);
    setUnreadCount((data || []).filter((n) => !n.read).length);
  }, [user?.id]);
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 3e4);
    return () => clearInterval(interval);
  }, [loadNotifications]);
  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  return { notifications, unreadCount, markAllRead, reload: loadNotifications };
}
function Navbar({ user, page, setPage, onLogout, role, unreadCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = (pg) => {
    setPage(pg);
    setMenuOpen(false);
  };
  return /* @__PURE__ */ jsxs("nav", { className: "navbar", children: [
    /* @__PURE__ */ jsxs("div", { className: "navbar-brand", style: { cursor: "pointer" }, onClick: () => nav("landing"), children: [
      "Stage",
      /* @__PURE__ */ jsx("span", { className: "green", children: "Pass" }),
      unreadCount > 0 && /* @__PURE__ */ jsx("span", { style: {
        marginLeft: "6px",
        background: "var(--danger)",
        color: "#fff",
        fontSize: "0.6rem",
        fontWeight: 800,
        borderRadius: "50%",
        width: "18px",
        height: "18px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }, children: unreadCount > 9 ? "9+" : unreadCount })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "hamburger",
        onClick: () => setMenuOpen(!menuOpen),
        "aria-label": "Menu",
        children: menuOpen ? "\u2715" : "\u2630"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: `navbar-links${menuOpen ? " open" : ""}`, children: [
      /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
        e.preventDefault();
        nav("clubs");
      }, children: "Clubs" }),
      /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
        e.preventDefault();
        nav("dancers");
      }, children: "Dancers" }),
      user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("a", { href: "#", onClick: (e) => {
          e.preventDefault();
          nav("dashboard");
        }, style: { position: "relative" }, children: [
          "Dashboard",
          unreadCount > 0 && /* @__PURE__ */ jsx("span", { style: {
            position: "absolute",
            top: "-6px",
            right: "-10px",
            background: "var(--danger)",
            color: "#fff",
            fontSize: "0.65rem",
            fontWeight: 800,
            borderRadius: "50%",
            width: "18px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: unreadCount > 9 ? "9+" : unreadCount })
        ] }),
        /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
          e.preventDefault();
          nav("claim");
        }, children: "Claim" }),
        user.email === ADMIN_EMAIL && /* @__PURE__ */ jsx("a", { href: "#", onClick: (e) => {
          e.preventDefault();
          nav("admin");
        }, style: { color: "var(--accent)" }, children: "Admin" }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
          onLogout();
          setMenuOpen(false);
        }, children: "Log Out" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-secondary", onClick: () => nav("login"), children: "Log In" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-primary", onClick: () => nav("signup"), children: "Sign Up" })
      ] })
    ] })
  ] });
}
function Landing({ setPage }) {
  const { clubs } = useClubs();
  const uniqueStates = [...new Set(clubs.map((c) => c.state))].length;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "hero", children: [
      /* @__PURE__ */ jsxs("h1", { style: { fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "Build Your Tour." }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { style: { color: "var(--text-muted)" }, children: "or" }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsxs("span", { style: { color: "var(--accent)", fontFamily: "'Dancing Script', cursive", fontSize: "1.15em" }, children: [
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
            clubs.length,
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
            clubs.length,
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
  const { clubs: allClubs, loading: clubsLoading } = useClubs();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [bookingClub, setBookingClub] = useState(null);
  const states = [...new Set(allClubs.map((c) => c.state))].sort();
  const types = [...new Set(allClubs.map((c) => c.type))].sort();
  const filtered = allClubs.filter((c) => {
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
        allClubs.length,
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
        user && user.user_metadata?.role === "dancer" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", marginTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-sm btn-accent",
              onClick: () => setBookingClub(club),
              children: "Request to Book"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-sm btn-secondary",
              onClick: () => setPage("tour-builder"),
              children: "+ Tour"
            }
          )
        ] })
      ] }, club.id)),
      filtered.length === 0 && /* @__PURE__ */ jsx("div", { style: { gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-dim)" }, children: "No clubs match your search. Try a different state or keyword." })
    ] }),
    bookingClub && /* @__PURE__ */ jsx(
      BookingRequestModal,
      {
        club: bookingClub,
        user,
        onClose: () => setBookingClub(null),
        onSent: () => setBookingClub(null)
      }
    )
  ] });
}
function MediaCarousel({ photos, videos }) {
  const [mediaMode, setMediaMode] = useState("photos");
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = mediaMode === "photos" ? photos : videos;
  const hasVideos = videos && videos.length > 0;
  const hasPhotos = photos && photos.length > 0;
  useEffect(() => {
    setCurrentIndex(0);
  }, [mediaMode]);
  const goNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i + 1) % items.length);
  };
  const goPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i - 1 + items.length) % items.length);
  };
  return /* @__PURE__ */ jsxs("div", { className: "carousel-wrapper", children: [
    /* @__PURE__ */ jsxs("div", { className: "carousel-viewport", children: [
      items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "carousel-empty", children: [
        mediaMode === "photos" ? "\u{1F4F7}" : "\u{1F3AC}",
        /* @__PURE__ */ jsx("span", { children: mediaMode === "photos" ? "No photos yet" : "No videos yet" })
      ] }) : mediaMode === "photos" ? /* @__PURE__ */ jsx("img", { src: items[currentIndex]?.url, alt: "", className: "carousel-img" }) : /* @__PURE__ */ jsx("video", { src: items[currentIndex]?.url, className: "carousel-video", controls: true, playsInline: true }),
      items.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { className: "carousel-arrow carousel-arrow-left", onClick: goPrev, children: "\u2039" }),
        /* @__PURE__ */ jsx("button", { className: "carousel-arrow carousel-arrow-right", onClick: goNext, children: "\u203A" })
      ] })
    ] }),
    items.length > 1 && /* @__PURE__ */ jsx("div", { className: "carousel-dots", children: items.map((_, i) => /* @__PURE__ */ jsx(
      "span",
      {
        className: `carousel-dot ${i === currentIndex ? "active" : ""}`,
        onClick: (e) => {
          e.stopPropagation();
          setCurrentIndex(i);
        }
      },
      i
    )) }),
    (hasPhotos || hasVideos) && hasVideos && /* @__PURE__ */ jsxs("div", { className: "carousel-toggle", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `toggle-btn ${mediaMode === "photos" ? "active" : ""}`,
          onClick: (e) => {
            e.stopPropagation();
            setMediaMode("photos");
          },
          children: [
            /* @__PURE__ */ jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
              /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
            ] }),
            "Photos"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `toggle-btn ${mediaMode === "videos" ? "active" : ""}`,
          onClick: (e) => {
            e.stopPropagation();
            setMediaMode("videos");
          },
          children: [
            /* @__PURE__ */ jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("polygon", { points: "23 7 16 12 23 17 23 7" }),
              /* @__PURE__ */ jsx("rect", { x: "1", y: "5", width: "15", height: "14", rx: "2", ry: "2" })
            ] }),
            "Videos"
          ]
        }
      )
    ] })
  ] });
}
function SocialIconTray({ instagram, twitter, onlyfans, linktree }) {
  const socials = [
    {
      url: instagram,
      label: "Instagram",
      color: "#E1306C",
      icon: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" }) })
    },
    {
      url: twitter,
      label: "X / Twitter",
      color: "#1DA1F2",
      icon: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" }) })
    },
    {
      url: onlyfans,
      label: "OnlyFans",
      color: "#00AFF0",
      icon: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.6a6.6 6.6 0 110-13.2 6.6 6.6 0 010 13.2zm0-10.8a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4zm0 6.6a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8z" }) })
    },
    {
      url: linktree,
      label: "Links",
      color: "var(--success)",
      icon: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" }),
        /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" })
      ] })
    }
  ];
  const activeSocials = socials.filter((s) => s.url);
  if (activeSocials.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "social-icon-tray", children: activeSocials.map((s, i) => /* @__PURE__ */ jsx(
    "a",
    {
      href: s.url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "social-icon-btn",
      style: { color: s.color },
      title: s.label,
      onClick: (e) => e.stopPropagation(),
      children: s.icon
    },
    i
  )) });
}
function ClubCardModal({ club, onClose }) {
  if (!club) return null;
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "club-detail-card", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsx("button", { className: "modal-close", onClick: onClose, children: "\u2715" }),
    /* @__PURE__ */ jsxs("div", { className: "club-detail-header", children: [
      /* @__PURE__ */ jsx("div", { className: "club-detail-icon", children: /* @__PURE__ */ jsxs("svg", { width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", stroke: "var(--accent)", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }),
        /* @__PURE__ */ jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "club-detail-type-badge", children: club.type }),
      /* @__PURE__ */ jsxs("div", { className: "club-detail-size-badge", children: [
        club.size,
        " Venue"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "club-detail-info", children: [
      /* @__PURE__ */ jsx("div", { className: "club-detail-name", children: club.name }),
      /* @__PURE__ */ jsxs("div", { className: "club-detail-location", children: [
        club.city,
        ", ",
        club.state
      ] }),
      /* @__PURE__ */ jsx("div", { className: "club-detail-divider" }),
      /* @__PURE__ */ jsxs("div", { className: "club-detail-row", children: [
        /* @__PURE__ */ jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "var(--text-muted)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }),
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3" })
        ] }),
        /* @__PURE__ */ jsx("span", { children: club.address })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "club-detail-row", children: [
        /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "var(--text-muted)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" }) }),
        /* @__PURE__ */ jsx("span", { children: club.phone })
      ] })
    ] })
  ] }) });
}
function AvailabilityDisplay({ days, timeStart, timeEnd }) {
  if (!days || days.length === 0) return null;
  const dayAbbrevs = { "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed", "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun" };
  const abbrevDays = days.map((d) => dayAbbrevs[d] || d);
  const timeStr = timeStart && timeEnd ? `${timeStart} \u2013 ${timeEnd}` : timeStart || "";
  return /* @__PURE__ */ jsxs("div", { className: "availability-display", children: [
    /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "var(--success)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
      /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
    ] }),
    /* @__PURE__ */ jsx("span", { className: "avail-days", children: abbrevDays.join(", ") }),
    timeStr && /* @__PURE__ */ jsx("span", { className: "avail-time", children: timeStr })
  ] });
}
function findClubInSystem(clubName) {
  if (!clubName) return null;
  const lower = clubName.toLowerCase().trim();
  return (_clubsCache || []).find((c) => c.name.toLowerCase() === lower) || null;
}
function DancerShowcase() {
  const [dancers, setDancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  useEffect(() => {
    loadDancers();
  }, []);
  const loadDancers = async () => {
    try {
      const { data: dancerRows, error: dErr } = await supabase.from("dancers").select("*").order("stage_name");
      if (dErr) throw dErr;
      const { data: mediaRows, error: mErr } = await supabase.from("dancer_media").select("*").order("display_order");
      if (mErr) throw mErr;
      const mediaByDancer = {};
      (mediaRows || []).forEach((m) => {
        if (!mediaByDancer[m.dancer_id]) mediaByDancer[m.dancer_id] = { photos: [], videos: [] };
        if (m.media_type === "photo") mediaByDancer[m.dancer_id].photos.push(m);
        else mediaByDancer[m.dancer_id].videos.push(m);
      });
      const merged = (dancerRows || []).map((d) => ({
        ...d,
        photos: mediaByDancer[d.id]?.photos || [],
        videos: mediaByDancer[d.id]?.videos || []
      }));
      setDancers(merged);
    } catch (err) {
      console.error("Failed to load dancers:", err);
    } finally {
      setLoading(false);
    }
  };
  const states = [...new Set(dancers.map((d) => d.state).filter(Boolean))].sort();
  const filtered = dancers.filter((d) => {
    if (stateFilter && d.state !== stateFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (d.stage_name || "").toLowerCase().includes(s) || (d.city || "").toLowerCase().includes(s) || (d.state || "").toLowerCase().includes(s);
    }
    return true;
  });
  if (loading) return /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "4rem", color: "var(--text-muted)" }, children: "Loading dancers..." });
  return /* @__PURE__ */ jsxs("div", { className: "section", children: [
    /* @__PURE__ */ jsxs("div", { className: "section-header", children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--accent)", marginBottom: "0.5rem" }, children: "THE $HOWCASE" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Where The Money ",
        /* @__PURE__ */ jsx("span", { style: { color: "var(--accent)" }, children: "Looks First" })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Discover dancers from across the country" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "filter-bar", children: [
      /* @__PURE__ */ jsx("input", { placeholder: "Search by name, city...", value: search, onChange: (e) => setSearch(e.target.value) }),
      /* @__PURE__ */ jsxs("select", { value: stateFilter, onChange: (e) => setStateFilter(e.target.value), children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "All States" }),
        states.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
      ] })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "4rem", color: "var(--text-dim)" }, children: dancers.length === 0 ? "No dancers in the showcase yet. Be the first!" : "No dancers match your search." }) : /* @__PURE__ */ jsx("div", { className: "dancer-grid", children: filtered.map((dancer) => {
      const matchedClub = findClubInSystem(dancer.home_club);
      return /* @__PURE__ */ jsxs("div", { className: "dancer-card", children: [
        /* @__PURE__ */ jsx(MediaCarousel, { photos: dancer.photos, videos: dancer.videos }),
        /* @__PURE__ */ jsxs("div", { className: "dancer-info", children: [
          /* @__PURE__ */ jsx("div", { className: "dancer-name", children: dancer.stage_name }),
          /* @__PURE__ */ jsx("div", { className: "dancer-location", children: [dancer.city, dancer.state].filter(Boolean).join(", ") || "Location not set" }),
          dancer.home_club && /* @__PURE__ */ jsxs(
            "div",
            {
              className: `dancer-club ${matchedClub ? "clickable" : ""}`,
              onClick: matchedClub ? () => setSelectedClub(matchedClub) : void 0,
              children: [
                /* @__PURE__ */ jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }),
                  /* @__PURE__ */ jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
                ] }),
                dancer.home_club
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            AvailabilityDisplay,
            {
              days: dancer.available_days,
              timeStart: dancer.available_time_start,
              timeEnd: dancer.available_time_end
            }
          ),
          /* @__PURE__ */ jsx(
            SocialIconTray,
            {
              instagram: dancer.instagram,
              twitter: dancer.twitter,
              onlyfans: dancer.onlyfans,
              linktree: dancer.linktree
            }
          )
        ] })
      ] }, dancer.id);
    }) }),
    selectedClub && /* @__PURE__ */ jsx(ClubCardModal, { club: selectedClub, onClose: () => setSelectedClub(null) })
  ] });
}
function ClaimAccount({ user, setPage }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const handleClaim = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data: claim, error: fetchErr } = await supabase.from("claim_codes").select("*").eq("code", code.trim().toUpperCase()).single();
      if (fetchErr || !claim) throw new Error("Invalid claim code. Check your code and try again.");
      if (claim.claimed_by) throw new Error("This code has already been used.");
      const { error: updateErr } = await supabase.from("claim_codes").update({ claimed_by: user.id, claimed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", claim.id);
      if (updateErr) throw new Error("Failed to claim. Try again.");
      const table = claim.entity_type === "club" ? "clubs" : "dancers";
      await supabase.from(table).update({ claimed_by: user.id }).eq("id", claim.entity_id);
      if (claim.entity_type === "club") {
        await supabase.auth.updateUser({ data: { role: "club" } });
      }
      setSuccess(`Successfully claimed your ${claim.entity_type} account! Redirecting to dashboard...`);
      setTimeout(() => setPage("dashboard"), 2e3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "auth-container", children: [
    /* @__PURE__ */ jsx("h2", { children: "Claim Your Account" }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Enter the claim code you received to take ownership of your listing." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleClaim, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Claim Code" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: code,
            onChange: (e) => setCode(e.target.value.toUpperCase()),
            placeholder: "e.g. SP-CLUB-A7X3",
            required: true,
            style: { fontFamily: "monospace", fontSize: "1.1rem", letterSpacing: "0.05em", textAlign: "center" }
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { style: { color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }, children: error }),
      success && /* @__PURE__ */ jsx("div", { style: { color: "var(--success)", fontSize: "0.85rem", marginBottom: "1rem" }, children: success }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", type: "submit", style: { width: "100%", marginBottom: "1rem" }, disabled: loading, children: loading ? "Claiming..." : "Claim Account" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "1rem" }, children: "Don't have a code? Contact StagePass to get one for your club or dancer profile." })
  ] });
}
function AdminClaimCodes({ user }) {
  const { clubs } = useClubs();
  const [dancers, setDancers] = useState([]);
  const [entityType, setEntityType] = useState("club");
  const [entityId, setEntityId] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCodes, setAllCodes] = useState([]);
  useEffect(() => {
    supabase.from("dancers").select("id, stage_name").order("stage_name").then(({ data }) => {
      setDancers(data || []);
    });
    loadCodes();
  }, []);
  const loadCodes = async () => {
    const { data } = await supabase.from("claim_codes").select("*").order("created_at", { ascending: false });
    setAllCodes(data || []);
  };
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 4; i++) result += chars[Math.floor(Math.random() * chars.length)];
    const prefix = entityType === "club" ? "SP-CLUB" : "SP-DANCER";
    return `${prefix}-${result}`;
  };
  const handleGenerate = async () => {
    if (!entityId) return;
    setLoading(true);
    const code = generateCode();
    const { data, error } = await supabase.from("claim_codes").insert({
      code,
      entity_type: entityType,
      entity_id: entityId
    }).select().single();
    if (!error && data) {
      setGeneratedCodes((prev) => [data, ...prev]);
      setAllCodes((prev) => [data, ...prev]);
    }
    setLoading(false);
  };
  if (user?.email !== ADMIN_EMAIL) {
    return /* @__PURE__ */ jsxs("div", { className: "auth-container", children: [
      /* @__PURE__ */ jsx("h2", { children: "Access Denied" }),
      /* @__PURE__ */ jsx("p", { children: "Admin only." })
    ] });
  }
  const entityOptions = entityType === "club" ? clubs : dancers;
  const getEntityName = (type, id) => {
    if (type === "club") return clubs.find((c) => c.id === id)?.name || id;
    return dancers.find((d) => d.id === id)?.stage_name || id;
  };
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsx("h2", { children: "Admin: Claim Codes" }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Generate codes for clubs and dancers to claim their accounts." }),
    /* @__PURE__ */ jsxs("div", { className: "card", style: { padding: "1.5rem", marginBottom: "2rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { marginBottom: "1rem", fontSize: "1rem" }, children: "Generate New Code" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [
          /* @__PURE__ */ jsx("label", { children: "Type" }),
          /* @__PURE__ */ jsxs("select", { value: entityType, onChange: (e) => {
            setEntityType(e.target.value);
            setEntityId("");
          }, children: [
            /* @__PURE__ */ jsx("option", { value: "club", children: "Club" }),
            /* @__PURE__ */ jsx("option", { value: "dancer", children: "Dancer" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", style: { marginBottom: 0, flex: 1, minWidth: "200px" }, children: [
          /* @__PURE__ */ jsx("label", { children: entityType === "club" ? "Club" : "Dancer" }),
          /* @__PURE__ */ jsxs("select", { value: entityId, onChange: (e) => setEntityId(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select..." }),
            entityOptions.map((item) => /* @__PURE__ */ jsx("option", { value: item.id, children: entityType === "club" ? `${item.name} \u2014 ${item.city}, ${item.state}` : item.stage_name }, item.id))
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: handleGenerate, disabled: !entityId || loading, children: loading ? "Generating..." : "Generate Code" })
      ] })
    ] }),
    generatedCodes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "card", style: { padding: "1.5rem", marginBottom: "2rem", background: "var(--bg-card)", border: "2px solid var(--success)" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { marginBottom: "0.75rem", fontSize: "1rem", color: "var(--success)" }, children: "Just Generated" }),
      generatedCodes.map((c) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }, children: c.code }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.8rem", color: "var(--text-muted)" }, children: [
          c.entity_type,
          ": ",
          getEntityName(c.entity_type, c.entity_id)
        ] })
      ] }, c.id))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card", style: { padding: "1.5rem" }, children: [
      /* @__PURE__ */ jsxs("h3", { style: { marginBottom: "0.75rem", fontSize: "1rem" }, children: [
        "All Codes (",
        allCodes.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { maxHeight: "400px", overflowY: "auto" }, children: [
        allCodes.map((c) => /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.6rem 0",
          borderBottom: "1px solid var(--border)",
          fontSize: "0.85rem"
        }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontFamily: "monospace", fontWeight: 600 }, children: c.code }),
          /* @__PURE__ */ jsxs("span", { style: { color: "var(--text-muted)" }, children: [
            c.entity_type,
            ": ",
            getEntityName(c.entity_type, c.entity_id)
          ] }),
          /* @__PURE__ */ jsx("span", { className: `status-badge ${c.claimed_by ? "status-confirmed" : "status-pending"}`, children: c.claimed_by ? "Claimed" : "Available" })
        ] }, c.id)),
        allCodes.length === 0 && /* @__PURE__ */ jsx("div", { style: { color: "var(--text-dim)", textAlign: "center", padding: "1rem" }, children: "No codes generated yet." })
      ] })
    ] })
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
var MAPBOX_TOKEN = window.__MAPBOX_TOKEN || "";
async function geocodeAddress(address) {
  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
  }
  return null;
}
async function getDrivingRoute(from, to) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?access_token=${MAPBOX_TOKEN}`
    );
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance,
        // meters
        duration: route.duration
        // seconds
      };
    }
  } catch (e) {
  }
  return null;
}
function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round(seconds % 3600 / 60);
  if (hrs === 0) return `${mins} min`;
  return `${hrs}h ${mins}m`;
}
function formatMiles(meters) {
  return (meters / 1609.344).toFixed(0);
}
function BookingRequestModal({ club, user, onClose, onSent }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("experienced");
  const [preferredShift, setPreferredShift] = useState("night");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    if (!startDate) {
      setError("Pick a start date.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const { data: req, error: insertErr } = await supabase.from("booking_requests").insert({
        dancer_id: user.id,
        club_id: club.id,
        start_date: startDate,
        end_date: endDate || startDate,
        message,
        experience_level: experienceLevel,
        preferred_shift: preferredShift,
        status: "pending"
      }).select().single();
      if (insertErr) throw insertErr;
      if (club.claimed_by) {
        const dancerName = user.user_metadata?.stage_name || "A dancer";
        await supabase.from("notifications").insert({
          user_id: club.claimed_by,
          type: "booking_request",
          title: "New Booking Request",
          message: `${dancerName} wants to book ${club.name} on ${(/* @__PURE__ */ new Date(startDate + "T12:00")).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          booking_request_id: req.id
        });
      }
      onSent && onSent();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "modal-content card", onClick: (e) => e.stopPropagation(), style: { maxWidth: "480px", position: "relative" }, children: [
    /* @__PURE__ */ jsx("button", { className: "modal-close", onClick: onClose, children: "\u2715" }),
    /* @__PURE__ */ jsx("h3", { style: { fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }, children: "Request to Book" }),
    /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }, children: [
      club.name,
      " \u2014 ",
      club.city,
      ", ",
      club.state
    ] }),
    error && /* @__PURE__ */ jsx("div", { style: { padding: "0.5rem", background: "rgba(255,71,87,0.12)", color: "var(--danger)", borderRadius: "0.5rem", fontSize: "0.85rem", marginBottom: "1rem" }, children: error }),
    /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Start Date *" }),
        /* @__PURE__ */ jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "End Date" }),
        /* @__PURE__ */ jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), min: startDate })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Experience Level" }),
        /* @__PURE__ */ jsxs("select", { value: experienceLevel, onChange: (e) => setExperienceLevel(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "beginner", children: "Beginner (under 1 year)" }),
          /* @__PURE__ */ jsx("option", { value: "intermediate", children: "Intermediate (1-3 years)" }),
          /* @__PURE__ */ jsx("option", { value: "experienced", children: "Experienced (3+ years)" }),
          /* @__PURE__ */ jsx("option", { value: "featured", children: "Featured / Headliner" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Preferred Shift" }),
        /* @__PURE__ */ jsxs("select", { value: preferredShift, onChange: (e) => setPreferredShift(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "day", children: "Day Shift" }),
          /* @__PURE__ */ jsx("option", { value: "night", children: "Night Shift" }),
          /* @__PURE__ */ jsx("option", { value: "both", children: "Both / Double" }),
          /* @__PURE__ */ jsx("option", { value: "flexible", children: "Flexible" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
      /* @__PURE__ */ jsx("label", { children: "Message to Club" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: message,
          onChange: (e) => setMessage(e.target.value),
          placeholder: "Introduce yourself \u2014 mention your experience, home club, what nights you're looking for...",
          style: { minHeight: "80px" }
        }
      )
    ] }),
    /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: handleSubmit, disabled: sending, style: { width: "100%", marginTop: "0.5rem" }, children: sending ? "Sending..." : "Send Booking Request" })
  ] }) });
}
function TourBuilder({ user }) {
  const { clubs: allClubs } = useClubs();
  const [tourStops, setTourStops] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [routeLegs, setRouteLegs] = useState([]);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [customFee, setCustomFee] = useState("");
  const [submittingAll, setSubmittingAll] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [bookingClub, setBookingClub] = useState(null);
  const submitAllRequests = async () => {
    if (sortedStops.length === 0) return;
    setSubmittingAll(true);
    setSubmitMsg("");
    let successCount = 0;
    try {
      for (const stop of sortedStops) {
        const { data: req, error } = await supabase.from("booking_requests").insert({
          dancer_id: user.id,
          club_id: stop.club.id,
          start_date: stop.date,
          end_date: stop.date,
          message: stop.notes || "",
          experience_level: "experienced",
          preferred_shift: "night",
          status: "pending"
        }).select().single();
        if (error) {
          console.error("Booking error:", error);
          continue;
        }
        successCount++;
        if (stop.club.claimed_by) {
          const dancerName = user.user_metadata?.stage_name || "A dancer";
          await supabase.from("notifications").insert({
            user_id: stop.club.claimed_by,
            type: "booking_request",
            title: "New Booking Request",
            message: `${dancerName} wants to book ${stop.club.name} on ${(/* @__PURE__ */ new Date(stop.date + "T12:00")).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            booking_request_id: req.id
          });
        }
      }
      setSubmitMsg(`Sent ${successCount} request${successCount !== 1 ? "s" : ""}!`);
      setTimeout(() => setSubmitMsg(""), 4e3);
    } catch (err) {
      setSubmitMsg("Error: " + err.message);
    } finally {
      setSubmittingAll(false);
    }
  };
  const addStop = () => {
    if (!selectedClub || !date) return;
    const club = allClubs.find((c) => c.id === selectedClub);
    if (!club) return;
    const fee = club.house_fee || (customFee ? parseFloat(customFee) : null);
    setTourStops((prev) => [...prev, {
      id: Date.now(),
      club: { ...club, house_fee: fee },
      date,
      time,
      notes,
      status: "pending",
      customFee: !club.house_fee && customFee ? parseFloat(customFee) : null
    }]);
    setSelectedClub("");
    setDate("");
    setTime("");
    setNotes("");
    setCustomFee("");
  };
  const removeStop = (id) => {
    setTourStops((prev) => prev.filter((s) => s.id !== id));
    setRouteLegs([]);
  };
  const sortedStops = [...tourStops].sort((a, b) => new Date(a.date) - new Date(b.date));
  const calculateRoutes = useCallback(async () => {
    if (sortedStops.length < 2) {
      setRouteLegs([]);
      return;
    }
    setCalculatingRoute(true);
    const legs = [];
    for (let i = 0; i < sortedStops.length - 1; i++) {
      const fromClub = sortedStops[i].club;
      const toClub = sortedStops[i + 1].club;
      let fromCoords = fromClub.lat && fromClub.lng ? { lat: fromClub.lat, lng: fromClub.lng } : null;
      let toCoords = toClub.lat && toClub.lng ? { lat: toClub.lat, lng: toClub.lng } : null;
      if (!fromCoords) {
        const addr = `${fromClub.address || ""} ${fromClub.city}, ${fromClub.state}`;
        fromCoords = await geocodeAddress(addr);
      }
      if (!toCoords) {
        const addr = `${toClub.address || ""} ${toClub.city}, ${toClub.state}`;
        toCoords = await geocodeAddress(addr);
      }
      if (fromCoords && toCoords) {
        const route = await getDrivingRoute(fromCoords, toCoords);
        legs.push({
          from: fromClub.name,
          to: toClub.name,
          distance: route?.distance || 0,
          duration: route?.duration || 0
        });
      } else {
        legs.push({ from: fromClub.name, to: toClub.name, distance: 0, duration: 0 });
      }
    }
    setRouteLegs(legs);
    setCalculatingRoute(false);
  }, [tourStops.length]);
  useEffect(() => {
    if (tourStops.length >= 2) calculateRoutes();
    else setRouteLegs([]);
  }, [tourStops.length]);
  const totalDistance = routeLegs.reduce((sum, l) => sum + l.distance, 0);
  const totalDuration = routeLegs.reduce((sum, l) => sum + l.duration, 0);
  const totalFees = sortedStops.reduce((sum, s) => sum + (s.club.house_fee || 0), 0);
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsx("h2", { children: "Build Your Tour" }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Pick clubs, choose dates, and see travel costs at a glance." }),
    /* @__PURE__ */ jsxs("div", { className: "card", style: { marginBottom: "2rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--primary-light)" }, children: "Add a Stop" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Club" }),
          /* @__PURE__ */ jsxs("select", { value: selectedClub, onChange: (e) => setSelectedClub(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select a club..." }),
            allClubs.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name)).map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
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
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Time" }),
          /* @__PURE__ */ jsx("input", { type: "time", value: time, onChange: (e) => setTime(e.target.value) })
        ] })
      ] }),
      selectedClub && (() => {
        const club = allClubs.find((c) => c.id === selectedClub);
        if (club?.house_fee) {
          return /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.85rem", color: "var(--success)", marginBottom: "0.75rem", padding: "0.5rem", background: "rgba(76,175,80,0.08)", borderRadius: "0.5rem" }, children: [
            "House fee listed by club: ",
            /* @__PURE__ */ jsxs("strong", { children: [
              "$",
              club.house_fee,
              "/night"
            ] })
          ] });
        }
        return /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "House Fee (club hasn't listed one \u2014 enter your estimate)" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.25rem" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontWeight: 700 }, children: "$" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: customFee, onChange: (e) => setCustomFee(e.target.value), placeholder: "e.g. 40", style: { maxWidth: "120px" } }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "var(--text-dim)" }, children: "/night" })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Notes for the club (optional)" }),
        /* @__PURE__ */ jsx("input", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "e.g. Available for 2 nights, experienced with VIP rooms" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: addStop, disabled: !selectedClub || !date, children: "Add to Tour" })
    ] }),
    sortedStops.length >= 2 && /* @__PURE__ */ jsxs("div", { className: "tour-summary", style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1rem",
      marginBottom: "2rem"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card", style: { textAlign: "center", padding: "1rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }, children: calculatingRoute ? "..." : `${formatMiles(totalDistance)} mi` }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }, children: "Total Distance" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: { textAlign: "center", padding: "1rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)" }, children: calculatingRoute ? "..." : formatDuration(totalDuration) }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }, children: "Total Drive Time" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", style: { textAlign: "center", padding: "1rem" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { fontSize: "1.5rem", fontWeight: 800, color: "var(--danger)" }, children: [
          "$",
          totalFees
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }, children: "Total House Fees" })
      ] })
    ] }),
    sortedStops.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("h3", { style: { fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }, children: [
        "Your Tour (",
        sortedStops.length,
        " stops)"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "tour-timeline", children: sortedStops.map((stop, i) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "tour-stop", children: [
          /* @__PURE__ */ jsx("div", { className: "tour-stop-num", children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "tour-stop-info", children: [
            /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, marginBottom: "0.15rem" }, children: stop.club.name }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }, children: [
              stop.club.city,
              ", ",
              stop.club.state,
              " \u2014 ",
              (/* @__PURE__ */ new Date(stop.date + "T12:00")).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              stop.time && ` at ${stop.time}`
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.75rem", fontSize: "0.75rem" }, children: [
              stop.club.house_fee && /* @__PURE__ */ jsxs("span", { style: { color: "var(--danger)" }, children: [
                "House fee: $",
                stop.club.house_fee,
                stop.customFee ? " (your estimate)" : ""
              ] }),
              stop.club.address && /* @__PURE__ */ jsx("span", { style: { color: "var(--text-dim)" }, children: stop.club.address })
            ] }),
            stop.notes && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "var(--text-dim)", fontStyle: "italic", marginTop: "0.25rem" }, children: [
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
        ] }),
        routeLegs[i] && routeLegs[i].distance > 0 && /* @__PURE__ */ jsxs("div", { className: "tour-leg", style: {
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 0 0.4rem 2.5rem",
          fontSize: "0.75rem",
          color: "var(--text-dim)"
        }, children: [
          /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "\u2193" }),
          /* @__PURE__ */ jsxs("span", { children: [
            formatMiles(routeLegs[i].distance),
            " mi"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "\u2022" }),
          /* @__PURE__ */ jsxs("span", { children: [
            formatDuration(routeLegs[i].duration),
            " drive"
          ] })
        ] })
      ] }, stop.id)) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-accent",
          style: { marginTop: "1.5rem", width: "100%" },
          disabled: submittingAll,
          onClick: submitAllRequests,
          children: submittingAll ? "Submitting..." : submitMsg ? submitMsg : `Submit All Booking Requests (${sortedStops.length})`
        }
      )
    ] }) : /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)" }, children: "No stops added yet. Pick a club and date above to start building your tour." })
  ] });
}
function DancerBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clubs } = useClubs();
  useEffect(() => {
    loadBookings();
  }, [user.id]);
  const loadBookings = async () => {
    setLoading(true);
    const { data } = await supabase.from("booking_requests").select("*").eq("dancer_id", user.id).order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };
  const cancelBooking = async (id) => {
    await supabase.from("booking_requests").update({ status: "cancelled" }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
  };
  const getClubName = (clubId) => {
    const club = clubs.find((c) => c.id === clubId);
    return club ? `${club.name} \u2014 ${club.city}, ${club.state}` : "Unknown Club";
  };
  const statusColors = {
    pending: "var(--accent)",
    confirmed: "var(--success)",
    declined: "var(--danger)",
    cancelled: "var(--text-dim)"
  };
  if (loading) return /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "2rem", color: "var(--text-dim)" }, children: "Loading bookings..." });
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h3", { style: { fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }, children: [
      "Your Booking Requests (",
      bookings.length,
      ")"
    ] }),
    bookings.length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)", background: "var(--bg-card)", borderRadius: "1rem", border: "1px dashed var(--border)" }, children: "No booking requests yet. Visit the Club Directory to send your first request!" }) : /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.75rem" }, children: bookings.map((b) => /* @__PURE__ */ jsxs("div", { className: "card", style: { padding: "1rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: "0.95rem" }, children: getClubName(b.club_id) }),
        /* @__PURE__ */ jsx("span", { style: {
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          padding: "0.2rem 0.6rem",
          borderRadius: "1rem",
          background: `${statusColors[b.status]}22`,
          color: statusColors[b.status]
        }, children: b.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }, children: [
        (/* @__PURE__ */ new Date(b.start_date + "T12:00")).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        b.end_date && b.end_date !== b.start_date && ` \u2014 ${(/* @__PURE__ */ new Date(b.end_date + "T12:00")).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.25rem" }, children: [
        b.experience_level && /* @__PURE__ */ jsx("span", { className: "club-tag", style: { fontSize: "0.65rem" }, children: b.experience_level }),
        b.preferred_shift && /* @__PURE__ */ jsxs("span", { className: "club-tag", style: { fontSize: "0.65rem" }, children: [
          b.preferred_shift,
          " shift"
        ] })
      ] }),
      b.message && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-dim)", fontStyle: "italic" }, children: [
        '"',
        b.message,
        '"'
      ] }),
      b.status === "pending" && /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-sm btn-secondary",
          style: { marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--danger)", borderColor: "var(--danger)" },
          onClick: () => cancelBooking(b.id),
          children: "Cancel Request"
        }
      )
    ] }, b.id)) })
  ] });
}
function DancerDashboard({ user, setPage }) {
  const [tab, setTab] = useState("bookings");
  const [dancerProfile, setDancerProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [stageName, setStageName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [onlyfans, setOnlyfans] = useState("");
  const [linktree, setLinktree] = useState("");
  const [availDays, setAvailDays] = useState([]);
  const [availTimeStart, setAvailTimeStart] = useState("");
  const [availTimeEnd, setAvailTimeEnd] = useState("");
  const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const toggleDay = (day) => {
    setAvailDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };
  useEffect(() => {
    if (user) loadProfile();
  }, [user]);
  const loadProfile = async () => {
    try {
      let { data: dancer, error } = await supabase.from("dancers").select("*").eq("user_id", user.id).single();
      if (error && error.code === "PGRST116") {
        const { data: newDancer, error: createErr } = await supabase.from("dancers").insert({ user_id: user.id, stage_name: user.user_metadata?.stage_name || "New Dancer" }).select().single();
        if (createErr) throw createErr;
        dancer = newDancer;
      } else if (error) throw error;
      setDancerProfile(dancer);
      setStageName(dancer.stage_name || "");
      setCity(dancer.city || "");
      setState(dancer.state || "");
      setHomeClub(dancer.home_club || "");
      setBio(dancer.bio || "");
      setInstagram(dancer.instagram || "");
      setTwitter(dancer.twitter || "");
      setOnlyfans(dancer.onlyfans || "");
      setLinktree(dancer.linktree || "");
      setAvailDays(dancer.available_days || []);
      setAvailTimeStart(dancer.available_time_start || "");
      setAvailTimeEnd(dancer.available_time_end || "");
      const { data: media } = await supabase.from("dancer_media").select("*").eq("dancer_id", dancer.id).order("display_order");
      const p = (media || []).filter((m) => m.media_type === "photo");
      const v = (media || []).filter((m) => m.media_type === "video");
      setPhotos(p);
      setVideos(v);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };
  const saveProfile = async () => {
    if (!dancerProfile) return;
    setSaving(true);
    setMsg("");
    try {
      const { error } = await supabase.from("dancers").update({
        stage_name: stageName,
        city,
        state,
        home_club: homeClub,
        bio,
        instagram,
        twitter,
        onlyfans,
        linktree,
        available_days: availDays,
        available_time_start: availTimeStart,
        available_time_end: availTimeEnd,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", dancerProfile.id);
      if (error) throw error;
      setMsg("Profile saved!");
      setTimeout(() => setMsg(""), 3e3);
    } catch (err) {
      setMsg("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const uploadMedia = async (files, mediaType) => {
    if (!dancerProfile || !files.length) return;
    if (mediaType === "video" && videos.length + files.length > 2) {
      setMsg("Max 2 videos allowed.");
      setTimeout(() => setMsg(""), 3e3);
      return;
    }
    setUploading(true);
    setMsg("");
    try {
      const currentItems = mediaType === "photo" ? photos : videos;
      let order = currentItems.length;
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${mediaType}s/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("dancer-media").upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("dancer-media").getPublicUrl(path);
        const { error: dbErr } = await supabase.from("dancer_media").insert({
          dancer_id: dancerProfile.id,
          media_type: mediaType,
          url: urlData.publicUrl,
          storage_path: path,
          display_order: order++,
          is_main: mediaType === "photo" && photos.length === 0 && order === 1
        });
        if (dbErr) throw dbErr;
      }
      await loadProfile();
      setMsg(`${mediaType === "photo" ? "Photo" : "Video"}(s) uploaded!`);
      setTimeout(() => setMsg(""), 3e3);
    } catch (err) {
      setMsg("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };
  const deleteMedia = async (mediaItem) => {
    try {
      await supabase.storage.from("dancer-media").remove([mediaItem.storage_path]);
      await supabase.from("dancer_media").delete().eq("id", mediaItem.id);
      await loadProfile();
      setMsg("Deleted!");
      setTimeout(() => setMsg(""), 2e3);
    } catch (err) {
      setMsg("Delete error: " + err.message);
    }
  };
  const setMainPhoto = async (mediaItem) => {
    try {
      await supabase.from("dancer_media").update({ is_main: false }).eq("dancer_id", dancerProfile.id);
      await supabase.from("dancer_media").update({ is_main: true }).eq("id", mediaItem.id);
      await supabase.from("dancers").update({ profile_photo_url: mediaItem.url }).eq("id", dancerProfile.id);
      await loadProfile();
      setMsg("Main photo updated!");
      setTimeout(() => setMsg(""), 2e3);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };
  const displayName = stageName || user?.user_metadata?.stage_name || "Dancer";
  if (loading) return /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "4rem", color: "var(--text-muted)" }, children: "Loading..." });
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsxs("h2", { children: [
      "Hey, ",
      displayName
    ] }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Manage your tours, media, and profile" }),
    msg && /* @__PURE__ */ jsx("div", { style: {
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      marginBottom: "1.5rem",
      background: msg.startsWith("Error") || msg.startsWith("Upload error") || msg.startsWith("Delete error") ? "rgba(255,71,87,0.15)" : "rgba(0,184,148,0.15)",
      color: msg.startsWith("Error") || msg.startsWith("Upload error") || msg.startsWith("Delete error") ? "var(--danger)" : "var(--success)",
      fontSize: "0.85rem",
      fontWeight: 600
    }, children: msg }),
    /* @__PURE__ */ jsxs("div", { className: "tab-bar", children: [
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "bookings" ? "active" : ""}`, onClick: () => setTab("bookings"), children: "My Bookings" }),
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "tours" ? "active" : ""}`, onClick: () => setTab("tours"), children: "My Tours" }),
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "media" ? "active" : ""}`, onClick: () => setTab("media"), children: "My Media" }),
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "profile" ? "active" : ""}`, onClick: () => setTab("profile"), children: "My Profile" })
    ] }),
    tab === "bookings" && /* @__PURE__ */ jsx(DancerBookings, { user }),
    tab === "tours" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsx("h3", { style: { fontSize: "1.1rem", fontWeight: 700 }, children: "Upcoming Tour Stops" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-primary", onClick: () => setPage("tour-builder"), children: "+ Build New Tour" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)", background: "var(--bg-card)", borderRadius: "1rem", border: "1px dashed var(--border)" }, children: "No tours yet. Start by building your first tour!" })
    ] }),
    tab === "media" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "card", style: { marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }, children: [
          /* @__PURE__ */ jsxs("h3", { style: { fontSize: "1rem", fontWeight: 700, color: "var(--primary-light)" }, children: [
            "Photos (",
            photos.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "btn btn-sm btn-primary", style: { cursor: "pointer", position: "relative" }, children: [
            uploading ? "Uploading..." : "+ Upload Photos",
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: "image/*",
                multiple: true,
                style: { display: "none" },
                onChange: (e) => uploadMedia(Array.from(e.target.files), "photo"),
                disabled: uploading
              }
            )
          ] })
        ] }),
        photos.length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "2rem", color: "var(--text-dim)", border: "1px dashed var(--border)", borderRadius: "0.75rem" }, children: "No photos yet. Upload some to appear in the showcase!" }) : /* @__PURE__ */ jsx("div", { className: "media-grid", children: photos.map((p) => /* @__PURE__ */ jsxs("div", { className: "media-thumb", children: [
          /* @__PURE__ */ jsx("img", { src: p.url, alt: "" }),
          p.is_main && /* @__PURE__ */ jsx("span", { className: "main-badge", children: "MAIN" }),
          /* @__PURE__ */ jsxs("div", { className: "media-thumb-actions", children: [
            !p.is_main && /* @__PURE__ */ jsx("button", { onClick: () => setMainPhoto(p), title: "Set as main photo", children: "\u2605" }),
            /* @__PURE__ */ jsx("button", { onClick: () => deleteMedia(p), title: "Delete", className: "delete-btn", children: "\u2715" })
          ] })
        ] }, p.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }, children: [
          /* @__PURE__ */ jsxs("h3", { style: { fontSize: "1rem", fontWeight: 700, color: "var(--primary-light)" }, children: [
            "Videos (",
            videos.length,
            "/2)"
          ] }),
          /* @__PURE__ */ jsxs(
            "label",
            {
              className: `btn btn-sm btn-primary ${videos.length >= 2 ? "disabled" : ""}`,
              style: { cursor: videos.length >= 2 ? "not-allowed" : "pointer", opacity: videos.length >= 2 ? 0.5 : 1, position: "relative" },
              children: [
                uploading ? "Uploading..." : "+ Upload Video",
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    accept: "video/*",
                    style: { display: "none" },
                    onChange: (e) => uploadMedia(Array.from(e.target.files), "video"),
                    disabled: uploading || videos.length >= 2
                  }
                )
              ]
            }
          )
        ] }),
        videos.length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "2rem", color: "var(--text-dim)", border: "1px dashed var(--border)", borderRadius: "0.75rem" }, children: "No videos yet. You can upload up to 2 videos." }) : /* @__PURE__ */ jsx("div", { className: "media-grid", children: videos.map((v) => /* @__PURE__ */ jsxs("div", { className: "media-thumb video-thumb", children: [
          /* @__PURE__ */ jsx("video", { src: v.url }),
          /* @__PURE__ */ jsx("div", { className: "video-play-overlay", children: "\u25B6" }),
          /* @__PURE__ */ jsx("div", { className: "media-thumb-actions", children: /* @__PURE__ */ jsx("button", { onClick: () => deleteMedia(v), title: "Delete", className: "delete-btn", children: "\u2715" }) })
        ] }, v.id)) })
      ] })
    ] }),
    tab === "profile" && /* @__PURE__ */ jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--primary-light)" }, children: "Your Profile" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Stage Name" }),
          /* @__PURE__ */ jsx("input", { value: stageName, onChange: (e) => setStageName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Home Club" }),
          /* @__PURE__ */ jsx("input", { value: homeClub, onChange: (e) => setHomeClub(e.target.value), placeholder: "Where you usually dance" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "City" }),
          /* @__PURE__ */ jsx("input", { value: city, onChange: (e) => setCity(e.target.value), placeholder: "e.g. Miami" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "State" }),
          /* @__PURE__ */ jsxs("select", { value: state, onChange: (e) => setState(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select state..." }),
            US_STATES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Bio" }),
        /* @__PURE__ */ jsx("textarea", { value: bio, onChange: (e) => setBio(e.target.value), placeholder: "Tell clubs about yourself...", style: { minHeight: "80px" } })
      ] }),
      /* @__PURE__ */ jsx("h4", { style: { fontSize: "0.9rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.75rem", marginTop: "0.5rem" }, children: "Availability" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: "0.75rem" }, children: "When are you available to work? This shows on your card so clubs and viewers know your schedule." }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "Days Available" }),
        /* @__PURE__ */ jsx("div", { className: "day-picker", children: ALL_DAYS.map((day) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `day-chip ${availDays.includes(day) ? "active" : ""}`,
            onClick: () => toggleDay(day),
            children: day.slice(0, 3)
          },
          day
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Start Time" }),
          /* @__PURE__ */ jsxs("select", { value: availTimeStart, onChange: (e) => setAvailTimeStart(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select..." }),
            ["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"].map(
              (t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t)
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "End Time" }),
          /* @__PURE__ */ jsxs("select", { value: availTimeEnd, onChange: (e) => setAvailTimeEnd(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select..." }),
            ["12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM"].map(
              (t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t)
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("h4", { style: { fontSize: "0.9rem", fontWeight: 700, color: "var(--accent)", marginBottom: "0.75rem", marginTop: "0.5rem" }, children: "Social Links" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: "1rem" }, children: "Paste your full profile URLs. Only filled-in links will show on your card." }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Instagram URL" }),
          /* @__PURE__ */ jsx("input", { value: instagram, onChange: (e) => setInstagram(e.target.value), placeholder: "https://instagram.com/yourname" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Twitter / X URL" }),
          /* @__PURE__ */ jsx("input", { value: twitter, onChange: (e) => setTwitter(e.target.value), placeholder: "https://x.com/yourname" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "OnlyFans URL" }),
          /* @__PURE__ */ jsx("input", { value: onlyfans, onChange: (e) => setOnlyfans(e.target.value), placeholder: "https://onlyfans.com/yourname" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Link Hub URL" }),
          /* @__PURE__ */ jsx("input", { value: linktree, onChange: (e) => setLinktree(e.target.value), placeholder: "https://linktr.ee/yourname" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: saveProfile, disabled: saving, style: { marginTop: "0.5rem" }, children: saving ? "Saving..." : "Save Profile" })
    ] })
  ] });
}
function ClubDashboard({ user, onNotificationChange }) {
  const [tab, setTab] = useState("requests");
  const [clubData, setClubData] = useState(null);
  const [houseFee, setHouseFee] = useState("");
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeSaved, setFeeSaved] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const clubName = user?.user_metadata?.club_name || "Your Club";
  useEffect(() => {
    supabase.from("clubs").select("*").eq("claimed_by", user.id).single().then(({ data }) => {
      if (data) {
        setClubData(data);
        setHouseFee(data.house_fee || "");
        loadRequests(data.id);
      } else {
        setLoadingRequests(false);
      }
    });
  }, [user.id]);
  const loadRequests = async (clubId) => {
    setLoadingRequests(true);
    const { data } = await supabase.from("booking_requests").select("*").eq("club_id", clubId).order("created_at", { ascending: false });
    setRequests(data || []);
    setLoadingRequests(false);
  };
  const saveHouseFee = async () => {
    if (!clubData) return;
    setFeeSaving(true);
    await supabase.from("clubs").update({ house_fee: houseFee ? parseFloat(houseFee) : null }).eq("id", clubData.id);
    setFeeSaving(false);
    setFeeSaved(true);
    setTimeout(() => setFeeSaved(false), 2e3);
  };
  const handleRequest = async (requestId, action) => {
    const newStatus = action === "confirmed" ? "confirmed" : "declined";
    const { error } = await supabase.from("booking_requests").update({ status: newStatus, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", requestId);
    if (error) {
      console.error(error);
      return;
    }
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      await supabase.from("notifications").insert({
        user_id: req.dancer_id,
        type: newStatus === "confirmed" ? "booking_confirmed" : "booking_declined",
        title: newStatus === "confirmed" ? "Booking Confirmed!" : "Booking Declined",
        message: `${clubData?.name || "A club"} has ${newStatus} your booking for ${(/* @__PURE__ */ new Date(req.start_date + "T12:00")).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        booking_request_id: requestId
      });
    }
    setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: newStatus } : r));
    onNotificationChange && onNotificationChange();
  };
  const getDancerLabel = (req) => {
    return req.message ? req.message.slice(0, 60) : "Dancer";
  };
  return /* @__PURE__ */ jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsx("h2", { children: clubData?.name || clubName }),
    /* @__PURE__ */ jsx("p", { className: "subtitle", children: "Manage your club" }),
    /* @__PURE__ */ jsxs("div", { className: "tab-bar", children: [
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "requests" ? "active" : ""}`, onClick: () => setTab("requests"), children: "Booking Requests" }),
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "lineup" ? "active" : ""}`, onClick: () => setTab("lineup"), children: "Upcoming Lineup" }),
      /* @__PURE__ */ jsx("button", { className: `tab ${tab === "settings" ? "active" : ""}`, onClick: () => setTab("settings"), children: "Settings" })
    ] }),
    tab === "settings" && /* @__PURE__ */ jsxs("div", { className: "card", style: { padding: "1.5rem" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "1rem", marginBottom: "1rem" }, children: "Club Settings" }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { children: "House Fee (per night)" }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: "1.1rem", fontWeight: 700 }, children: "$" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: houseFee,
              onChange: (e) => setHouseFee(e.target.value),
              placeholder: "e.g. 40",
              style: { flex: 1 }
            }
          ),
          /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-sm", onClick: saveHouseFee, disabled: feeSaving, children: feeSaving ? "Saving..." : feeSaved ? "Saved!" : "Save" })
        ] }),
        /* @__PURE__ */ jsx("small", { style: { color: "var(--text-dim)", marginTop: "0.25rem", display: "block" }, children: "The fee dancers pay you to work for the night. This shows up in their tour planner so they can budget." })
      ] })
    ] }),
    tab === "requests" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
      loadingRequests && /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "2rem", color: "var(--text-dim)" }, children: "Loading requests..." }),
      !loadingRequests && requests.filter((r) => r.status === "pending").length === 0 && /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)", background: "var(--bg-card)", borderRadius: "1rem", border: "1px dashed var(--border)" }, children: "No pending requests right now. New requests will appear here." }),
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
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }, children: [
            req.experience_level && /* @__PURE__ */ jsx("span", { className: "club-tag", style: { fontSize: "0.7rem" }, children: req.experience_level }),
            req.preferred_shift && /* @__PURE__ */ jsxs("span", { className: "club-tag", style: { fontSize: "0.7rem" }, children: [
              req.preferred_shift,
              " shift"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }, children: [
            "Dates: ",
            (/* @__PURE__ */ new Date(req.start_date + "T12:00")).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            req.end_date && req.end_date !== req.start_date && ` \u2014 ${(/* @__PURE__ */ new Date(req.end_date + "T12:00")).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
          ] }),
          req.message && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-dim)", fontStyle: "italic", marginBottom: "0.5rem" }, children: [
            '"',
            req.message,
            '"'
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: "0.5rem" }, children: [
            "Sent ",
            new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
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
    tab === "lineup" && /* @__PURE__ */ jsx("div", { children: requests.filter((r) => r.status === "confirmed").length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "3rem", color: "var(--text-dim)", background: "var(--bg-card)", borderRadius: "1rem", border: "1px dashed var(--border)" }, children: "No confirmed dancers yet. Accept booking requests to build your lineup." }) : /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: requests.filter((r) => r.status === "confirmed").sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map((req) => /* @__PURE__ */ jsxs("div", { className: "tour-stop", children: [
      /* @__PURE__ */ jsx("div", { className: "tour-stop-num", style: { background: "var(--success)" }, children: "\u2713" }),
      /* @__PURE__ */ jsxs("div", { className: "tour-stop-info", children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: 700 }, children: "Dancer" }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.8rem", color: "var(--text-muted)" }, children: [
          (/* @__PURE__ */ new Date(req.start_date + "T12:00")).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
          req.end_date && req.end_date !== req.start_date && ` \u2014 ${(/* @__PURE__ */ new Date(req.end_date + "T12:00")).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        ] }),
        req.preferred_shift && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "var(--text-dim)" }, children: [
          req.preferred_shift,
          " shift \u2022 ",
          req.experience_level
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "status-badge status-confirmed", children: "Confirmed" })
    ] }, req.id)) }) })
  ] });
}
function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing");
  const [loading, setLoading] = useState(true);
  const { notifications, unreadCount, markAllRead, reload: reloadNotifications } = useNotifications(user);
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
  useEffect(() => {
    if (page === "dashboard" && unreadCount > 0) {
      markAllRead();
    }
  }, [page]);
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
    /* @__PURE__ */ jsx(Navbar, { user, page, setPage, onLogout: handleLogout, role, unreadCount }),
    page === "landing" && /* @__PURE__ */ jsx(Landing, { setPage }),
    page === "signup" && /* @__PURE__ */ jsx(AuthForm, { mode: "signup", setPage, onAuth: handleAuth }),
    page === "login" && /* @__PURE__ */ jsx(AuthForm, { mode: "login", setPage, onAuth: handleAuth }),
    page === "clubs" && /* @__PURE__ */ jsx(ClubDirectory, { setPage, user }),
    page === "dancers" && /* @__PURE__ */ jsx(DancerShowcase, {}),
    page === "tour-builder" && user && /* @__PURE__ */ jsx(TourBuilder, { user }),
    page === "claim" && user && /* @__PURE__ */ jsx(ClaimAccount, { user, setPage }),
    page === "admin" && user && /* @__PURE__ */ jsx(AdminPanel, { user: user, onClose: function() { setPage("landing"); } }),
    page === "dashboard" && user && (role === "club" ? /* @__PURE__ */ jsx(ClubDashboard, { user, onNotificationChange: reloadNotifications }) : /* @__PURE__ */ jsx(DancerDashboard, { user, setPage }))
  ] });
}
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx(App, {}));
