"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  Activity,
  Signal,
  Droplets,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  Search,
  Filter,
  TrendingUp,
  ChevronDown,
  X,
  Info,
  Gauge,
  Calendar,
} from "lucide-react"

import "../../styles/monitor.css"

/* =========================================================
   MOCK DATA
========================================================= */
const mockNodes = [
  { name: "Node_Alpha", activated: true, h1_m: 15 },
  { name: "Node_Beta", activated: true, h1_m: 12 },
  { name: "Node_Gamma", activated: true, h1_m: 18 },
  { name: "Node_Delta", activated: false, h1_m: 10 },
]

const generateReadings = () => {
  const data = []
  const now = new Date()

  mockNodes.forEach((node) => {
    for (let i = 0; i < 15; i++) {
      const height = node.activated ? Math.random() * 10 + 1 : 0
      let status = "inactive"
      if (node.activated) {
        if (height < 3) status = "critical"
        else if (height < 6) status = "warning"
        else status = "active"
      }

      data.push({
        id: `${node.name}-${i}`,
        node: node.name,
        region: "Arusha, Tanzania",
        waterHeight: parseFloat(height.toFixed(2)),
        status,
        timestamp: new Date(now.getTime() - i * 3600000),
        h1: node.h1_m,
      })
    }
  })

  return data.sort((a, b) => b.timestamp - a.timestamp)
}

/* =========================================================
   TOOLTIP
========================================================= */
const Tooltip = ({ text }) => {
  const [show, setShow] = useState(false)

  return (
    <span
      className="monitor-tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button className="monitor-tooltip-btn">
        <Info />
      </button>
      {show && <span className="monitor-tooltip-content">{text}</span>}
    </span>
  )
}

/* =========================================================
   TOAST
========================================================= */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`monitor-toast monitor-toast-${type}`}>
      {type === "success" ? <CheckCircle /> : <AlertTriangle />}
      <span>{message}</span>
    </div>
  )
}

/* =========================================================
   MAIN PAGE
========================================================= */
export default function MonitorPage() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("time")
  const [modal, setModal] = useState(null)
  const [cable, setCable] = useState("")
  const [toast, setToast] = useState(null)

  const readings = useMemo(() => generateReadings(), [])

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
  }

  /* =====================================================
     FILTER + SORT
  ===================================================== */
  const filtered = useMemo(() => {
    let result = [...readings]

    if (search) {
      result = result.filter(
        (r) =>
          r.node.toLowerCase().includes(search.toLowerCase()) ||
          r.region.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (sort === "high") result.sort((a, b) => b.waterHeight - a.waterHeight)
    if (sort === "low") result.sort((a, b) => a.waterHeight - b.waterHeight)

    return result
  }, [readings, search, sort])

  /* =====================================================
     NODE STATS
  ===================================================== */
  const stats = useMemo(() => {
    return mockNodes.map((node) => {
      const nodeReadings = readings.filter((r) => r.node === node.name)
      const avg =
        nodeReadings.reduce((s, r) => s + r.waterHeight, 0) /
        (nodeReadings.length || 1)

      return {
        ...node,
        count: nodeReadings.length,
        avg: avg.toFixed(2),
        latest: nodeReadings[0],
      }
    })
  }, [readings])

  /* =====================================================
     UPDATE CABLE
  ===================================================== */
  const updateCable = () => {
    if (!cable || cable <= 0) {
      showToast("Invalid cable length", "error")
      return
    }
    setModal(null)
    setCable("")
    showToast("Cable length updated")
  }

  return (
    <div className="monitor-page">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="monitor-main">

        {/* ================= STATS ================= */}
        <div className="monitor-stats-grid">
          <div className="monitor-stat-card">
            <div className="monitor-stat-card-bg monitor-stat-card-bg-emerald" />
            <div className="monitor-stat-card-content">
              <div className="monitor-stat-icon monitor-stat-icon-emerald">
                <Signal />
              </div>
              <p className="monitor-stat-label">Total Nodes</p>
              <div className="monitor-stat-value-row">
                <span className="monitor-stat-value">{mockNodes.length}</span>
                <span className="monitor-stat-unit">nodes</span>
              </div>
            </div>
          </div>

          <div className="monitor-stat-card">
            <div className="monitor-stat-card-bg monitor-stat-card-bg-sky" />
            <div className="monitor-stat-card-content">
              <div className="monitor-stat-icon monitor-stat-icon-sky">
                <Gauge />
              </div>
              <p className="monitor-stat-label">Avg Water Level</p>
              <div className="monitor-stat-value-row">
                <span className="monitor-stat-value">
                  {(
                    stats.reduce((s, n) => s + Number(n.avg), 0) /
                    stats.length
                  ).toFixed(1)}
                </span>
                <span className="monitor-stat-unit">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FILTERS ================= */}
        <div className="monitor-filters">
          <div className="monitor-filters-grid">
            <div className="monitor-filter-group">
              <label>Search</label>
              <div className="monitor-search-wrapper">
                <Search className="monitor-search-icon" />
                <input
                  className="monitor-search-input"
                  placeholder="Search node or region"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="monitor-filter-group">
              <label>Sort</label>
              <div className="monitor-select-wrapper">
                <Filter className="monitor-select-icon" />
                <select
                  className="monitor-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="time">Most Recent</option>
                  <option value="high">Highest Level</option>
                  <option value="low">Lowest Level</option>
                </select>
                <ChevronDown className="monitor-select-chevron" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= NODE CARDS ================= */}
        <section className="monitor-nodes-section">
          <div className="monitor-nodes-grid">
            {stats.map((node) => {
              const progress = Math.min(
                (node.avg / node.h1_m) * 100,
                100
              )

              return (
                <div key={node.name} className="monitor-node-card">
                  <div className="monitor-node-card-header">
                    <div className="monitor-node-card-left">
                      <div className="monitor-node-card-icon monitor-node-card-icon-sky">
                        <Droplets />
                      </div>
                      <div>
                        <h3 className="monitor-node-card-name">
                          {node.name}
                        </h3>
                        <p className="monitor-node-card-id">
                          {node.region}
                        </p>
                      </div>
                    </div>
                    <button
                      className="monitor-node-card-edit"
                      onClick={() => {
                        setModal(node)
                        setCable(node.h1_m)
                      }}
                    >
                      <Edit3 />
                    </button>
                  </div>

                  <div className="monitor-water-level">
                    <div className="monitor-water-level-header">
                      <span className="monitor-water-level-label">
                        Water Level
                      </span>
                      <span className="monitor-water-level-value">
                        {node.avg}m <span>/ {node.h1_m}m</span>
                      </span>
                    </div>
                    <div className="monitor-progress-bar">
                      <div
                        className="monitor-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="monitor-node-card-footer">
                    <div className="monitor-node-card-footer-item">
                      <Signal /> {node.count} readings
                    </div>
                    <div className="monitor-node-card-footer-item">
                      <Clock />{" "}
                      {node.latest
                        ? node.latest.timestamp.toLocaleTimeString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ================= TABLE ================= */}
        <section className="monitor-readings-section">
          <div className="monitor-readings-table-container">
            <div className="monitor-table-header">
              <div className="monitor-table-header-cell">Node</div>
              <div className="monitor-table-header-cell">Status</div>
              <div className="monitor-table-header-cell">Level</div>
              <div className="monitor-table-header-cell">Region</div>
              <div className="monitor-table-header-cell">Time</div>
            </div>

            {filtered.map((r, i) => (
              <div
                key={r.id}
                className={`monitor-table-row ${
                  i % 2 === 0
                    ? "monitor-table-row-even"
                    : "monitor-table-row-odd"
                }`}
              >
                <div className="monitor-table-cell">{r.node}</div>
                <div className="monitor-table-cell">
                  <span
                    className={`monitor-status-badge monitor-status-badge-${r.status}`}
                  >
                    <span className="monitor-status-badge-dot" />
                    {r.status}
                  </span>
                </div>
                <div className="monitor-table-cell">
                  <TrendingUp /> {r.waterHeight}m
                  <Tooltip text="Distance from sensor to water surface" />
                </div>
                <div className="monitor-table-cell">{r.region}</div>
                <div className="monitor-table-cell">
                  <Calendar /> {r.timestamp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ================= MODAL ================= */}
      {modal && (
        <div className="monitor-modal-overlay">
          <div className="monitor-modal">
            <div className="monitor-modal-header">
              <div>
                <h2 className="monitor-modal-title">Edit Cable Length</h2>
                <p className="monitor-modal-subtitle">{modal.name}</p>
              </div>
              <button
                className="monitor-modal-close"
                onClick={() => setModal(null)}
              >
                <X />
              </button>
            </div>

            <div className="monitor-form-group">
              <label className="monitor-form-label">
                Cable Length (m)
              </label>
              <input
                className="monitor-form-input"
                type="number"
                value={cable}
                onChange={(e) => setCable(e.target.value)}
              />
            </div>

            <div className="monitor-modal-actions">
              <button
                className="monitor-modal-btn monitor-modal-btn-primary"
                onClick={updateCable}
              >
                <CheckCircle /> Save
              </button>
              <button
                className="monitor-modal-btn monitor-modal-btn-secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
