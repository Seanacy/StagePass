// admin.js â StagePass Admin Panel
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

var SUPABASE_URL = "https://uxfvrlmszkhlxmiqolue.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZnZybG1zemtobHhtaXFvbHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDUxNTcsImV4cCI6MjA5MzY4MTE1N30.fIfsCdy8bK6XuvR_OTksdRhuEP8HPRNX6nq7txw-Fms";
var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var ADMIN_EMAIL = "247ggtms@gmail.com";

/* ââ helpers ââ */
var fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "â";
var fmtTime = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "â";

/* ââ Stat Card ââ */
function StatCard({ label, value, color }) {
  return jsx("div", {
    style: {
      background: "rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.25rem",
      flex: "1 1 140px", minWidth: "140px", border: "1px solid rgba(255,255,255,0.08)"
    },
    children: jsxs("div", { children: [
      jsx("div", { style: { fontSize: "2rem", fontWeight: 900, color: color || "#e84393" }, children: value }),
      jsx("div", { style: { fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }, children: label })
    ]})
  });
}

/* ââ Overview Tab ââ */
function OverviewTab({ dancers, clubs, bookings }) {
  var pending = bookings.filter(b => b.status === "pending").length;
  var confirmed = bookings.filter(b => b.status === "confirmed").length;
  var recentBookings = bookings.slice(0, 5);

  return jsxs("div", { children: [
    jsx("div", {
      style: { display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" },
      children: jsxs(Fragment, { children: [
        jsx(StatCard, { label: "Total Dancers", value: dancers.length, color: "#e84393" }),
        jsx(StatCard, { label: "Total Clubs", value: clubs.length, color: "#f9ca24" }),
        jsx(StatCard, { label: "Pending Bookings", value: pending, color: "#fd79a8" }),
        jsx(StatCard, { label: "Confirmed", value: confirmed, color: "#00cec9" })
      ]})
    }),
    jsx("h3", { style: { fontWeight: 700, marginBottom: "1rem", color: "#fff" }, children: "Recent Booking Requests" }),
    recentBookings.length === 0
      ? jsx("div", { style: { color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "2rem" }, children: "No booking requests yet" })
      : jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" }, children: recentBookings.map(b =>
          jsx("div", {
            style: {
              background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "0.85rem 1rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.06)"
            },
            children: jsxs(Fragment, { children: [
              jsxs("div", { children: [
                jsx("div", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#fff" }, children: "Dancer â Club" }),
                jsx("div", { style: { fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }, children: fmt(b.start_date) + " â " + fmt(b.end_date) })
              ]}),
              jsx("span", {
                style: {
                  padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                  background: b.status === "pending" ? "rgba(249,202,36,0.15)" : b.status === "confirmed" ? "rgba(0,206,201,0.15)" : "rgba(255,255,255,0.06)",
                  color: b.status === "pending" ? "#f9ca24" : b.status === "confirmed" ? "#00cec9" : "rgba(255,255,255,0.5)"
                },
                children: b.status
              })
            ]})
          }, b.id)
        )})
  ]});
}

/* ââ Dancers Tab ââ */
function DancersTab({ dancers, onRefresh }) {
  var [search, setSearch] = useState("");
  var filtered = dancers.filter(d => {
    if (!search) return true;
    var s = search.toLowerCase();
    return (d.stage_name || "").toLowerCase().includes(s) || (d.city || "").toLowerCase().includes(s) || (d.state || "").toLowerCase().includes(s);
  });

  var handleDelete = async (id) => {
    if (!confirm("Delete this dancer profile? This cannot be undone.")) return;
    await supabase.from("dancer_media").delete().eq("dancer_id", id);
    await supabase.from("dancers").delete().eq("id", id);
    onRefresh();
  };

  return jsxs("div", { children: [
    jsx("input", {
      value: search, onChange: (e) => setSearch(e.target.value),
      placeholder: "Search dancers by name, city, state...",
      style: {
        width: "100%", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "#fff",
        fontSize: "0.9rem", marginBottom: "1rem", outline: "none"
      }
    }),
    jsx("div", { style: { fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }, children: filtered.length + " dancer" + (filtered.length !== 1 ? "s" : "") }),
    filtered.length === 0
      ? jsx("div", { style: { color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "2rem" }, children: "No dancers found" })
      : jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" }, children: filtered.map(d =>
          jsx("div", {
            style: {
              background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "1rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.06)"
            },
            children: jsxs(Fragment, { children: [
              jsxs("div", { children: [
                jsx("div", { style: { fontWeight: 700, fontSize: "0.95rem", color: "#e84393" }, children: d.stage_name || "Unnamed" }),
                jsx("div", { style: { fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }, children: [d.city, d.state].filter(Boolean).join(", ") || "No location" }),
                d.home_club && jsx("div", { style: { fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "0.15rem" }, children: "Home: " + d.home_club }),
                jsx("div", { style: { fontSize: "0.7rem", color: d.claimed_by ? "#00cec9" : "rgba(255,255,255,0.3)", marginTop: "0.25rem" }, children: d.claimed_by ? "Claimed" : "Unclaimed" })
              ]}),
              jsx("button", {
                onClick: () => handleDelete(d.id),
                style: {
                  background: "rgba(255,71,87,0.1)", color: "#ff4757", border: "none",
                  borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem",
                  fontWeight: 600, cursor: "pointer"
                },
                children: "Delete"
              })
            ]})
          }, d.id)
        )})
  ]});
}

/* ââ Clubs Tab ââ */
function ClubsTab({ clubs, onRefresh }) {
  var [search, setSearch] = useState("");
  var [showAdd, setShowAdd] = useState(false);
  var [newClub, setNewClub] = useState({ name: "", city: "", state: "", type: "", size: "", address: "", phone: "" });
  var [saving, setSaving] = useState(false);

  var filtered = clubs.filter(c => {
    if (!search) return true;
    var s = search.toLowerCase();
    return (c.name || "").toLowerCase().includes(s) || (c.city || "").toLowerCase().includes(s) || (c.state || "").toLowerCase().includes(s);
  });

  var handleAdd = async () => {
    if (!newClub.name || !newClub.city || !newClub.state) return;
    setSaving(true);
    await supabase.from("clubs").insert(newClub);
    setNewClub({ name: "", city: "", state: "", type: "", size: "", address: "", phone: "" });
    setShowAdd(false);
    setSaving(false);
    onRefresh();
  };

  var handleDelete = async (id) => {
    if (!confirm("Delete this club? This cannot be undone.")) return;
    await supabase.from("clubs").delete().eq("id", id);
    onRefresh();
  };

  var inputStyle = {
    width: "100%", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff",
    fontSize: "0.85rem", outline: "none", marginBottom: "0.5rem"
  };

  return jsxs("div", { children: [
    jsxs("div", { style: { display: "flex", gap: "0.5rem", marginBottom: "1rem" }, children: [
      jsx("input", {
        value: search, onChange: (e) => setSearch(e.target.value),
        placeholder: "Search clubs...",
        style: { ...inputStyle, flex: 1, marginBottom: 0 }
      }),
      jsx("button", {
        onClick: () => setShowAdd(!showAdd),
        style: {
          background: "#e84393", color: "#fff", border: "none", borderRadius: "0.5rem",
          padding: "0.5rem 1rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
        },
        children: showAdd ? "Cancel" : "+ Add Club"
      })
    ]}),
    showAdd && jsx("div", {
      style: {
        background: "rgba(232,67,147,0.08)", borderRadius: "0.75rem", padding: "1rem",
        marginBottom: "1rem", border: "1px solid rgba(232,67,147,0.2)"
      },
      children: jsxs("div", { children: [
        jsx("input", { style: inputStyle, placeholder: "Club name *", value: newClub.name, onChange: e => setNewClub({...newClub, name: e.target.value}) }),
        jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [
          jsx("input", { style: { ...inputStyle, flex: 1 }, placeholder: "City *", value: newClub.city, onChange: e => setNewClub({...newClub, city: e.target.value}) }),
          jsx("input", { style: { ...inputStyle, width: "80px" }, placeholder: "State *", value: newClub.state, onChange: e => setNewClub({...newClub, state: e.target.value}) })
        ]}),
        jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [
          jsx("input", { style: { ...inputStyle, flex: 1 }, placeholder: "Type (e.g. Full Nude)", value: newClub.type, onChange: e => setNewClub({...newClub, type: e.target.value}) }),
          jsx("input", { style: { ...inputStyle, width: "100px" }, placeholder: "Size", value: newClub.size, onChange: e => setNewClub({...newClub, size: e.target.value}) })
        ]}),
        jsx("input", { style: inputStyle, placeholder: "Address", value: newClub.address, onChange: e => setNewClub({...newClub, address: e.target.value}) }),
        jsx("input", { style: inputStyle, placeholder: "Phone", value: newClub.phone, onChange: e => setNewClub({...newClub, phone: e.target.value}) }),
        jsx("button", {
          onClick: handleAdd, disabled: saving || !newClub.name || !newClub.city || !newClub.state,
          style: {
            width: "100%", padding: "0.65rem", background: "#e84393", color: "#fff", border: "none",
            borderRadius: "0.5rem", fontWeight: 700, cursor: "pointer", marginTop: "0.25rem",
            opacity: saving || !newClub.name ? 0.5 : 1
          },
          children: saving ? "Adding..." : "Add Club"
        })
      ]})
    }),
    jsx("div", { style: { fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }, children: filtered.length + " club" + (filtered.length !== 1 ? "s" : "") }),
    jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" }, children: filtered.map(c =>
      jsx("div", {
        style: {
          background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "1rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: "1px solid rgba(255,255,255,0.06)"
        },
        children: jsxs(Fragment, { children: [
          jsxs("div", { children: [
            jsx("div", { style: { fontWeight: 700, fontSize: "0.95rem", color: "#f9ca24" }, children: c.name }),
            jsx("div", { style: { fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }, children: c.city + ", " + c.state }),
            c.type && jsx("div", { style: { fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }, children: c.type + (c.size ? " Â· " + c.size : "") }),
            jsx("div", { style: { fontSize: "0.7rem", color: c.claimed_by ? "#00cec9" : "rgba(255,255,255,0.3)", marginTop: "0.25rem" }, children: c.claimed_by ? "Claimed" : "Unclaimed" })
          ]}),
          jsx("button", {
            onClick: () => handleDelete(c.id),
            style: {
              background: "rgba(255,71,87,0.1)", color: "#ff4757", border: "none",
              borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.75rem",
              fontWeight: 600, cursor: "pointer"
            },
            children: "Delete"
          })
        ]})
      }, c.id)
    )})
  ]});
}

/* ââ Bookings Tab ââ */
function BookingsTab({ bookings, dancers, clubs, onRefresh }) {
  var [filter, setFilter] = useState("all");
  var filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  var dancerMap = {};
  dancers.forEach(d => { dancerMap[d.id] = d.stage_name || "Unknown"; });
  var clubMap = {};
  clubs.forEach(c => { clubMap[c.id] = c.name || "Unknown"; });

  var handleUpdate = async (id, status) => {
    await supabase.from("booking_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    onRefresh();
  };

  var statusColors = {
    pending: { bg: "rgba(249,202,36,0.12)", color: "#f9ca24" },
    confirmed: { bg: "rgba(0,206,201,0.12)", color: "#00cec9" },
    declined: { bg: "rgba(255,71,87,0.12)", color: "#ff4757" },
    cancelled: { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }
  };
  var filters = ["all", "pending", "confirmed", "declined", "cancelled"];

  return jsxs("div", { children: [
    jsx("div", {
      style: { display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap" },
      children: filters.map(f => jsx("button", {
        onClick: () => setFilter(f),
        style: {
          padding: "0.4rem 0.85rem", borderRadius: "999px", border: "none", fontSize: "0.8rem",
          fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
          background: filter === f ? "#e84393" : "rgba(255,255,255,0.06)",
          color: filter === f ? "#fff" : "rgba(255,255,255,0.5)"
        },
        children: f === "all" ? "All (" + bookings.length + ")" : f + " (" + bookings.filter(b => b.status === f).length + ")"
      }, f))
    }),
    filtered.length === 0
      ? jsx("div", { style: { color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "2rem" }, children: "No bookings found" })
      : jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" }, children: filtered.map(b => {
          var sc = statusColors[b.status] || statusColors.cancelled;
          return jsx("div", {
            style: {
              background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "1rem",
              border: "1px solid rgba(255,255,255,0.06)"
            },
            children: jsxs("div", { children: [
              jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }, children: [
                jsxs("div", { children: [
                  jsx("div", { style: { fontWeight: 700, fontSize: "0.95rem", color: "#e84393" }, children: dancerMap[b.dancer_id] || "Unknown Dancer" }),
                  jsxs("div", { style: { fontSize: "0.8rem", color: "#f9ca24" }, children: ["â ", clubMap[b.club_id] || "Unknown Club"] })
                ]}),
                jsx("span", {
                  style: { padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: sc.bg, color: sc.color },
                  children: b.status
                })
              ]}),
              jsxs("div", { style: { fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }, children: [
                fmt(b.start_date), " â ", fmt(b.end_date),
                b.preferred_shift ? " Â· " + b.preferred_shift : ""
              ]}),
              b.message && jsx("div", { style: { fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: "0.5rem" }, children: b.message }),
              b.status === "pending" && jsxs("div", { style: { display: "flex", gap: "0.5rem", marginTop: "0.25rem" }, children: [
                jsx("button", {
                  onClick: () => handleUpdate(b.id, "confirmed"),
                  style: { flex: 1, padding: "0.5rem", background: "rgba(0,206,201,0.15)", color: "#00cec9", border: "none", borderRadius: "0.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" },
                  children: "Confirm"
                }),
                jsx("button", {
                  onClick: () => handleUpdate(b.id, "declined"),
                  style: { flex: 1, padding: "0.5rem", background: "rgba(255,71,87,0.15)", color: "#ff4757", border: "none", borderRadius: "0.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" },
                  children: "Decline"
                })
              ]})
            ]})
          }, b.id);
        })
      })
  ]});
}

/* ââ Claim Codes Tab ââ */
function ClaimCodesTab({ user, dancers, clubs }) {
  var [codes, setCodes] = useState([]);
  var [entityType, setEntityType] = useState("club");
  var [entityId, setEntityId] = useState("");
  var [generating, setGenerating] = useState(false);

  useEffect(() => { loadCodes(); }, []);

  var loadCodes = async () => {
    var { data } = await supabase.from("claim_codes").select("*").order("created_at", { ascending: false });
    setCodes(data || []);
  };

  var generate = async () => {
    if (!entityId) return;
    setGenerating(true);
    var prefix = entityType === "club" ? "SP-CLUB-" : "SP-DANCER-";
    var code = prefix + Math.random().toString(36).substring(2, 6).toUpperCase();
    await supabase.from("claim_codes").insert({ code, entity_type: entityType, entity_id: entityId });
    await loadCodes();
    setGenerating(false);
    setEntityId("");
  };

  var entities = entityType === "club" ? clubs : dancers;

  return jsxs("div", { children: [
    jsx("div", {
      style: {
        background: "rgba(232,67,147,0.08)", borderRadius: "0.75rem", padding: "1rem",
        marginBottom: "1.5rem", border: "1px solid rgba(232,67,147,0.2)"
      },
      children: jsxs("div", { children: [
        jsx("h4", { style: { fontWeight: 700, marginBottom: "0.75rem", color: "#fff" }, children: "Generate Claim Code" }),
        jsxs("div", { style: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }, children: [
          jsx("button", {
            onClick: () => { setEntityType("club"); setEntityId(""); },
            style: {
              flex: 1, padding: "0.5rem", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer",
              background: entityType === "club" ? "#e84393" : "rgba(255,255,255,0.06)",
              color: entityType === "club" ? "#fff" : "rgba(255,255,255,0.5)"
            },
            children: "Club"
          }),
          jsx("button", {
            onClick: () => { setEntityType("dancer"); setEntityId(""); },
            style: {
              flex: 1, padding: "0.5rem", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer",
              background: entityType === "dancer" ? "#e84393" : "rgba(255,255,255,0.06)",
              color: entityType === "dancer" ? "#fff" : "rgba(255,255,255,0.5)"
            },
            children: "Dancer"
          })
        ]}),
        jsx("select", {
          value: entityId, onChange: e => setEntityId(e.target.value),
          style: {
            width: "100%", padding: "0.65rem 0.75rem", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff",
            fontSize: "0.85rem", marginBottom: "0.75rem", outline: "none"
          },
          children: jsxs(Fragment, { children: [
            jsx("option", { value: "", children: "Select " + entityType + "..." }),
            entities.map(e => jsx("option", { value: e.id, style: { color: "#000" }, children: entityType === "club" ? e.name + " (" + e.city + ", " + e.state + ")" : (e.stage_name || "Unnamed") }, e.id))
          ]})
        }),
        jsx("button", {
          onClick: generate, disabled: generating || !entityId,
          style: {
            width: "100%", padding: "0.65rem", background: "#e84393", color: "#fff", border: "none",
            borderRadius: "0.5rem", fontWeight: 700, cursor: "pointer", opacity: generating || !entityId ? 0.5 : 1
          },
          children: generating ? "Generating..." : "Generate Code"
        })
      ]})
    }),
    jsx("h4", { style: { fontWeight: 700, marginBottom: "0.75rem", color: "#fff" }, children: "Existing Codes (" + codes.length + ")" }),
    codes.length === 0
      ? jsx("div", { style: { color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "2rem" }, children: "No claim codes yet" })
      : jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" }, children: codes.map(c =>
          jsx("div", {
            style: {
              background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "0.85rem 1rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.06)"
            },
            children: jsxs(Fragment, { children: [
              jsxs("div", { children: [
                jsx("div", { style: { fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", color: "#f9ca24", letterSpacing: "0.05em" }, children: c.code }),
                jsx("div", { style: { fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }, children: c.entity_type + " Â· " + fmtTime(c.created_at) })
              ]}),
              jsx("span", {
                style: {
                  padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                  background: c.claimed_by ? "rgba(0,206,201,0.12)" : "rgba(249,202,36,0.12)",
                  color: c.claimed_by ? "#00cec9" : "#f9ca24"
                },
                children: c.claimed_by ? "Claimed" : "Available"
              })
            ]})
          }, c.id)
        )})
  ]});
}

/* ââ Analytics Tab ââ */
function AnalyticsTab({ dancers, clubs, bookings }) {
  var claimedDancers = dancers.filter(d => d.claimed_by).length;
  var claimedClubs = clubs.filter(c => c.claimed_by).length;

  var stateMap = {};
  clubs.forEach(c => { if (c.state) stateMap[c.state] = (stateMap[c.state] || 0) + 1; });
  var topStates = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  var statusMap = {};
  bookings.forEach(b => { statusMap[b.status] = (statusMap[b.status] || 0) + 1; });

  var monthMap = {};
  bookings.forEach(b => {
    var m = new Date(b.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  return jsxs("div", { children: [
    jsx("div", {
      style: { display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" },
      children: jsxs(Fragment, { children: [
        jsx(StatCard, { label: "Claimed Dancers", value: claimedDancers + "/" + dancers.length, color: "#e84393" }),
        jsx(StatCard, { label: "Claimed Clubs", value: claimedClubs + "/" + clubs.length, color: "#f9ca24" }),
        jsx(StatCard, { label: "Total Bookings", value: bookings.length, color: "#fd79a8" }),
        jsx(StatCard, { label: "Confirmation Rate", value: bookings.length > 0 ? Math.round(((statusMap.confirmed || 0) / bookings.length) * 100) + "%" : "0%", color: "#00cec9" })
      ]})
    }),
    jsxs("div", { style: { display: "flex", gap: "1rem", flexWrap: "wrap" }, children: [
      jsx("div", {
        style: { flex: "1 1 280px", background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.06)" },
        children: jsxs("div", { children: [
          jsx("h4", { style: { fontWeight: 700, marginBottom: "0.75rem", color: "#fff" }, children: "Top States by Clubs" }),
          topStates.length === 0
            ? jsx("div", { style: { color: "rgba(255,255,255,0.4)" }, children: "No data" })
            : jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem" }, children: topStates.map(([state, count]) =>
                jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
                  jsx("div", { style: { width: "40px", fontWeight: 600, fontSize: "0.85rem", color: "#f9ca24" }, children: state }),
                  jsx("div", { style: { flex: 1, height: "20px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }, children:
                    jsx("div", { style: { height: "100%", width: Math.round((count / (topStates[0]?.[1] || 1)) * 100) + "%", background: "linear-gradient(90deg, #e84393, #f9ca24)", borderRadius: "10px" } })
                  }),
                  jsx("div", { style: { width: "30px", textAlign: "right", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }, children: count })
                ]}, state)
              )})
        ]})
      }),
      jsx("div", {
        style: { flex: "1 1 280px", background: "rgba(255,255,255,0.04)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.06)" },
        children: jsxs("div", { children: [
          jsx("h4", { style: { fontWeight: 700, marginBottom: "0.75rem", color: "#fff" }, children: "Booking Status Breakdown" }),
          Object.keys(statusMap).length === 0
            ? jsx("div", { style: { color: "rgba(255,255,255,0.4)" }, children: "No data" })
            : jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem" }, children: Object.entries(statusMap).map(([status, count]) => {
                var colors = { pending: "#f9ca24", confirmed: "#00cec9", declined: "#ff4757", cancelled: "rgba(255,255,255,0.4)" };
                return jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
                  jsx("div", { style: { width: "80px", fontWeight: 600, fontSize: "0.8rem", color: colors[status] || "#fff", textTransform: "capitalize" }, children: status }),
                  jsx("div", { style: { flex: 1, height: "20px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }, children:
                    jsx("div", { style: { height: "100%", width: Math.round((count / bookings.length) * 100) + "%", background: colors[status] || "#fff", borderRadius: "10px", opacity: 0.6 } })
                  }),
                  jsx("div", { style: { width: "30px", textAlign: "right", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }, children: count })
                ]}, status);
              })
            })
        ]})
      })
    ]})
  ]});
}

/* ââââââââââââââââââââââââââââââââââââââââââââââ
   Main Admin Panel
   ââââââââââââââââââââââââââââââââââââââââââââââ */
export function AdminPanel({ user, onClose }) {
  if (user?.email !== ADMIN_EMAIL) {
    return jsx("div", {
      style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#ff4757", fontSize: "1.1rem", fontWeight: 700 },
      children: "Access Denied"
    });
  }

  var [tab, setTab] = useState("overview");
  var [dancers, setDancers] = useState([]);
  var [clubs, setClubs] = useState([]);
  var [bookings, setBookings] = useState([]);
  var [loading, setLoading] = useState(true);

  var loadData = useCallback(async () => {
    var [dRes, cRes, bRes] = await Promise.all([
      supabase.from("dancers").select("*").order("stage_name"),
      supabase.from("clubs").select("*").order("state").order("name"),
      supabase.from("booking_requests").select("*").order("created_at", { ascending: false })
    ]);
    setDancers(dRes.data || []);
    setClubs(cRes.data || []);
    setBookings(bRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  var tabs = [
    { key: "overview", label: "Overview" },
    { key: "dancers", label: "Dancers" },
    { key: "clubs", label: "Clubs" },
    { key: "bookings", label: "Bookings" },
    { key: "codes", label: "Claim Codes" },
    { key: "analytics", label: "Analytics" }
  ];

  return jsx("div", {
    style: {
      position: "fixed", inset: 0, background: "#0a0a0f", color: "#fff", zIndex: 9999,
      display: "flex", flexDirection: "column", overflow: "hidden"
    },
    children: jsxs(Fragment, { children: [
      /* header */
      jsx("div", {
        style: {
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid rgba(232,67,147,0.2)"
        },
        children: jsxs(Fragment, { children: [
          jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem" }, children: [
            jsx("span", { style: { fontSize: "1.3rem" }, children: "â" }),
            jsx("h2", { style: { fontSize: "1.1rem", fontWeight: 800, background: "linear-gradient(90deg, #e84393, #f9ca24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }, children: "StagePass Admin" })
          ]}),
          jsx("button", {
            onClick: onClose,
            style: { background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.4rem 0.85rem", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" },
            children: "â Back"
          })
        ]})
      }),
      /* tabs */
      jsx("div", {
        style: {
          display: "flex", gap: "0.25rem", padding: "0.75rem 1rem", overflowX: "auto",
          background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)"
        },
        children: tabs.map(t => jsx("button", {
          onClick: () => setTab(t.key),
          style: {
            padding: "0.45rem 0.85rem", borderRadius: "999px", border: "none", fontSize: "0.8rem",
            fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            background: tab === t.key ? "#e84393" : "transparent",
            color: tab === t.key ? "#fff" : "rgba(255,255,255,0.45)"
          },
          children: t.label
        }, t.key))
      }),
      /* content */
      jsx("div", {
        style: { flex: 1, overflowY: "auto", padding: "1.25rem" },
        children: loading
          ? jsx("div", { style: { textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)" }, children: "Loading..." })
          : jsxs(Fragment, { children: [
              tab === "overview" && jsx(OverviewTab, { dancers, clubs, bookings }),
              tab === "dancers" && jsx(DancersTab, { dancers, onRefresh: loadData }),
              tab === "clubs" && jsx(ClubsTab, { clubs, onRefresh: loadData }),
              tab === "bookings" && jsx(BookingsTab, { bookings, dancers, clubs, onRefresh: loadData }),
              tab === "codes" && jsx(ClaimCodesTab, { user, dancers, clubs }),
              tab === "analytics" && jsx(AnalyticsTab, { dancers, clubs, bookings })
            ]})
      })
    ]})
  });
}
