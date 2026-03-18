import { useState, useRef, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || ''

// ── tiny helpers ──────────────────────────────────────────────────────────────
const api = (path, opts = {}) => fetch(`${API}${path}`, opts).then(r => {
  if (!r.ok) return r.json().then(e => Promise.reject(e.detail || 'Request failed'))
  return r.json()
})

function ChevronIcon({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }}>
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2 5.5L4.5 8L9 3" stroke="#0ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox({ checked, indeterminate, onChange, label, dim }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      opacity: dim ? 0.45 : 1, userSelect: 'none' }}>
      <span onClick={onChange} style={{
        width: 16, height: 16, border: '1.5px solid',
        borderColor: checked || indeterminate ? '#00e5ff' : '#3a4a5a',
        borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? 'rgba(0,229,255,0.12)' : indeterminate ? 'rgba(0,229,255,0.06)' : 'transparent',
        flexShrink: 0, transition: 'all 0.15s',
      }}>
        {checked && <CheckIcon />}
        {indeterminate && !checked && (
          <span style={{ width: 8, height: 2, background: '#00e5ff', borderRadius: 1 }} />
        )}
      </span>
      {label && <span style={{ fontSize: 13, color: dim ? '#607080' : '#b0c4d8' }}>{label}</span>}
    </label>
  )
}

// ── TreeGroup ─────────────────────────────────────────────────────────────────
function TreeGroup({ group, screens, selected, onToggleGroup, onToggleScreen }) {
  const [open, setOpen] = useState(true)
  const allChecked = screens.every(s => selected.has(s))
  const someChecked = screens.some(s => selected.has(s))

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Group row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px',
        borderRadius: 4, cursor: 'pointer',
        background: open ? 'rgba(0,229,255,0.04)' : 'transparent' }}>
        <span onClick={() => setOpen(o => !o)}
          style={{ color: '#4a7a9b', display: 'flex', alignItems: 'center', width: 14 }}>
          {group !== null && <ChevronIcon open={open} />}
        </span>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked && !allChecked}
          onChange={() => onToggleGroup(screens, allChecked)}
        />
        <span onClick={() => setOpen(o => !o)} style={{
          fontSize: 13, fontWeight: 600, color: '#8ab4cc',
          fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em',
          textTransform: 'uppercase', cursor: 'pointer', flex: 1,
        }}>
          {group ?? '—'}
        </span>
        <span style={{ fontSize: 11, color: '#3a5a6a', fontFamily: 'Share Tech Mono' }}>
          {screens.length}
        </span>
      </div>

      {/* Screen rows */}
      {(open || group === null) && screens.map(screen => (
        <div key={screen} style={{ display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px 4px 36px', borderRadius: 3, cursor: 'pointer',
          transition: 'background 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Checkbox
            checked={selected.has(screen)}
            onChange={() => onToggleScreen(screen)}
          />
          <span style={{ fontSize: 12.5, color: '#7a9ab8',
            fontFamily: "'Exo 2', sans-serif" }}>{screen}</span>
        </div>
      ))}
    </div>
  )
}

// ── FileButton ────────────────────────────────────────────────────────────────
function FileButton({ label, accept, multiple, onSelect, fileName }) {
  const ref = useRef()
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => ref.current.click()} style={{
        width: '100%', padding: '9px 16px',
        background: 'linear-gradient(135deg, #1a3a5c 0%, #0d2238 100%)',
        border: '1px solid #1e4060', borderRadius: 5, color: '#5ab4d8',
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 600,
        fontSize: 13.5, letterSpacing: '0.06em', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#00e5ff'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#1e4060'}
      >
        {label}
      </button>
      {fileName && (
        <div style={{ fontSize: 11, color: '#3a7a5a', marginTop: 3,
          paddingLeft: 4, fontFamily: 'Share Tech Mono',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          ✓ {fileName}
        </div>
      )}
      <input ref={ref} type="file" accept={accept} multiple={multiple}
        style={{ display: 'none' }}
        onChange={e => { onSelect(e.target.files); e.target.value = '' }} />
    </div>
  )
}

// ── ActionButton ──────────────────────────────────────────────────────────────
function ActionButton({ label, onClick, variant = 'primary', disabled }) {
  const colors = {
    primary: { bg: 'linear-gradient(135deg, #1a3a5c 0%, #0d2238 100%)', border: '#1e4060', color: '#5ab4d8' },
    success: { bg: 'linear-gradient(135deg, #0d4020 0%, #072810 100%)', border: '#1a6030', color: '#40c870' },
    disabled: { bg: '#0d1520', border: '#1a2530', color: '#2a4050' },
  }
  const c = disabled ? colors.disabled : colors[variant]
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      width: '100%', padding: '10px 16px',
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 5, color: c.color,
      fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
      fontSize: 14, letterSpacing: '0.08em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      marginBottom: 8, transition: 'all 0.15s',
      opacity: disabled ? 0.5 : 1,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = variant === 'success' ? '#40c870' : '#00e5ff' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = c.border }}
    >
      {label}
    </button>
  )
}

// ── StatusLog ─────────────────────────────────────────────────────────────────
function StatusLog({ lines }) {
  return (
    <div style={{
      marginTop: 12, padding: '10px 12px', minHeight: 100,
      background: '#050e18', border: '1px solid #0d2030',
      borderRadius: 5, fontFamily: 'Share Tech Mono',
      fontSize: 11.5, lineHeight: 1.7, overflowY: 'auto', maxHeight: 260,
    }}>
      {lines.length === 0
        ? <span style={{ color: '#1e3a50' }}>— awaiting input —</span>
        : lines.map((l, i) => (
          <div key={i} style={{ color: l.type === 'error' ? '#f04040' : l.type === 'success' ? '#40c870' : l.type === 'info' ? '#00e5ff' : '#4a7a9b' }}>
            {l.text}
          </div>
        ))
      }
    </div>
  )
}

// ── OVIVO Logo ────────────────────────────────────────────────────────────────
function OvivoLogo() {
  return (
    <div style={{
      width: 100, height: 64, background: '#fff', borderRadius: 6,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '4px 8px', flexShrink: 0,
    }}>
      <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
        fontSize: 22, color: '#0056a0', letterSpacing: '-1px', lineHeight: 1 }}>
        OVIVO
      </div>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 7.5,
        color: '#0056a0', textAlign: 'center', lineHeight: 1.2, marginTop: 2 }}>
        Ultra-Pure Water +<br />
        <span style={{ color: '#00a0c0' }}>by Ecolab</span>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [sessionId,       setSessionId]       = useState(null)
  const [tree,            setTree]            = useState([])
  const [selected,        setSelected]        = useState(new Set())
  const [genPageConfig,   setGenPageConfig]   = useState(true)
  const [genNavScreen,    setGenNavScreen]    = useState(false)
  const [structureFile,   setStructureFile]   = useState(null)
  const [refFiles,        setRefFiles]        = useState([])
  const [log,             setLog]             = useState([])
  const [loading,         setLoading]         = useState(false)

  const addLog = useCallback((text, type = 'normal') => {
    setLog(prev => [...prev, { text, type }])
  }, [])

  // ── Ensure session ──────────────────────────────────────────────────────────
  const ensureSession = async () => {
    if (sessionId) return sessionId
    const { session_id } = await api('/api/session', { method: 'POST' })
    setSessionId(session_id)
    return session_id
  }

  // ── Upload structure file ───────────────────────────────────────────────────
  const handleStructureSelect = async (files) => {
    const file = files[0]
    if (!file) return
    setStructureFile(file.name)
    setLoading(true)
    try {
      const sid  = await ensureSession()
      const form = new FormData()
      form.append('file', file)
      await api(`/api/upload/structure?session_id=${sid}`, { method: 'POST', body: form })
      addLog(`Structure selected: ${file.name}`, 'info')
    } catch (e) {
      addLog(`Error uploading structure: ${e}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Upload reference zips ───────────────────────────────────────────────────
  const handleRefSelect = async (files) => {
    if (!files.length) return
    const names = Array.from(files).map(f => f.name)
    setRefFiles(names)
    setLoading(true)
    try {
      const sid  = await ensureSession()
      const form = new FormData()
      Array.from(files).forEach(f => form.append('files', f))
      const res = await api(`/api/upload/refs?session_id=${sid}`, { method: 'POST', body: form })
      res.files.forEach(f => addLog(`Ref uploaded: ${f.filename} → ${f.detected_as}`, 'normal'))
    } catch (e) {
      addLog(`Error uploading refs: ${e}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Load screens ────────────────────────────────────────────────────────────
  const handleLoad = async () => {
    if (!sessionId) { addLog('Upload a structure file first.', 'error'); return }
    setLoading(true)
    setTree([])
    setSelected(new Set())
    try {
      const res = await api(`/api/load-screens?session_id=${sessionId}`, { method: 'POST' })
      setTree(res.tree)
      addLog(`Screens loaded successfully. (${res.total} total)`, 'success')
      if (res.errors?.length) {
        res.errors.forEach(e => addLog(e, 'error'))
      }
    } catch (e) {
      addLog(`Load failed: ${e}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Selection helpers ───────────────────────────────────────────────────────
  const toggleScreen = (screen) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(screen) ? next.delete(screen) : next.add(screen)
      return next
    })
  }

  const toggleGroup = (screens, allChecked) => {
    setSelected(prev => {
      const next = new Set(prev)
      screens.forEach(s => allChecked ? next.delete(s) : next.add(s))
      return next
    })
  }

  const allScreens = tree.flatMap(g => g.screens)
  const allChecked = allScreens.length > 0 && allScreens.every(s => selected.has(s))
  const someChecked = allScreens.some(s => selected.has(s))

  const toggleAll = () => {
    if (allChecked) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allScreens))
    }
  }

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!sessionId) { addLog('No session active.', 'error'); return }
    if (selected.size === 0) { addLog('Select at least one screen.', 'error'); return }
    if (!genPageConfig && !genNavScreen) { addLog('Select at least one output type.', 'error'); return }

    setLoading(true)
    addLog(`Generating ${selected.size} screen(s)…`, 'info')
    try {
      const res = await api('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id:           sessionId,
          selected_screens:     Array.from(selected),
          generate_page_config: genPageConfig,
          generate_views:       genNavScreen,
        }),
      })

      addLog('Generation complete!', 'success')

      // Trigger downloads
      for (const [key, path] of Object.entries(res.downloads || {})) {
        const name = key === 'page_config'
          ? 'generated_page_config.zip'
          : 'generated_views.zip'
        addLog(`Downloading ${name}…`, 'info')
        const a = document.createElement('a')
        a.href = `${API}${path}`
        a.download = name
        a.click()
      }
    } catch (e) {
      addLog(`Generation failed: ${e}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#0a1520',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Exo 2', sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '12px 24px',
        background: 'linear-gradient(180deg, #0d1f35 0%, #081525 100%)',
        borderBottom: '1px solid #0d2540',
        boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
      }}>
        <OvivoLogo />
        <div>
          <h1 style={{
            margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.1,
            fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em',
            color: '#c8dff0',
          }}>
            Ignition Perspective Screen Compiler Tool
          </h1>
          <div style={{ fontSize: 11, color: '#2a5070', marginTop: 2,
            fontFamily: 'Share Tech Mono', letterSpacing: '0.08em' }}>
            OVIVO UPW SYSTEM · SCREEN GENERATOR v1.0
          </div>
        </div>

        {/* top-right status dot */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%',
            background: sessionId ? '#40c870' : '#1e3a50',
            boxShadow: sessionId ? '0 0 6px #40c870' : 'none',
            display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#2a5070', fontFamily: 'Share Tech Mono' }}>
            {sessionId ? 'SESSION ACTIVE' : 'NO SESSION'}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left panel — screen tree ── */}
        <div style={{
          width: 320, flexShrink: 0,
          borderRight: '1px solid #0d2030',
          display: 'flex', flexDirection: 'column',
          background: '#080f1a',
        }}>

          {/* Output type checkboxes */}
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid #0d2030',
            display: 'flex', gap: 20,
          }}>
            <Checkbox
              checked={genPageConfig}
              onChange={() => setGenPageConfig(v => !v)}
              label="Page Configuration"
            />
            <Checkbox
              checked={genNavScreen}
              onChange={() => setGenNavScreen(v => !v)}
              label="Navigation Screen"
            />
          </div>

          {/* Select all row */}
          {tree.length > 0 && (
            <div style={{ padding: '7px 16px', borderBottom: '1px solid #0d2030',
              display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox
                checked={allChecked}
                indeterminate={someChecked && !allChecked}
                onChange={toggleAll}
                label="Select All"
              />
              <span style={{ marginLeft: 'auto', fontSize: 11,
                color: '#2a5070', fontFamily: 'Share Tech Mono' }}>
                {selected.size}/{allScreens.length}
              </span>
            </div>
          )}

          {/* Tree */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {tree.length === 0
              ? <div style={{ padding: '24px 16px', color: '#1e3a50',
                  fontSize: 12, fontFamily: 'Share Tech Mono', textAlign: 'center' }}>
                  Load screens to populate tree
                </div>
              : tree.map((g, i) => (
                <TreeGroup
                  key={i}
                  group={g.group}
                  screens={g.screens}
                  selected={selected}
                  onToggleGroup={toggleGroup}
                  onToggleScreen={toggleScreen}
                />
              ))
            }
          </div>
        </div>

        {/* ── Right panel — controls ── */}
        <div style={{
          flex: 1, padding: '20px 24px',
          display: 'flex', gap: 24,
        }}>

          {/* Action column */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <FileButton
              label="Select Structure File"
              accept=".xlsx"
              onSelect={handleStructureSelect}
              fileName={structureFile}
            />
            <FileButton
              label="Select Config File"
              accept=".zip"
              multiple
              onSelect={handleRefSelect}
              fileName={refFiles.length ? refFiles.join(', ') : null}
            />
            <ActionButton
              label="LOAD Screens"
              onClick={handleLoad}
              disabled={loading || !structureFile}
            />
            <ActionButton
              label={loading ? 'Working…' : 'Generate Selected Screens'}
              onClick={handleGenerate}
              variant="success"
              disabled={loading || selected.size === 0}
            />
          </div>

          {/* Log column */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#1e3a50', fontFamily: 'Share Tech Mono',
              marginBottom: 4, letterSpacing: '0.1em' }}>
              COMPILER OUTPUT
            </div>
            <StatusLog lines={log} />

            {/* Selection summary */}
            {selected.size > 0 && (
              <div style={{ marginTop: 12, padding: '8px 12px',
                background: '#05100a', border: '1px solid #0d2018',
                borderRadius: 5, fontSize: 12, color: '#2a8050',
                fontFamily: 'Share Tech Mono' }}>
                {selected.size} screen{selected.size > 1 ? 's' : ''} selected
                {genPageConfig && ' · page-config'}
                {genNavScreen && ' · nav-screen'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999,
        }}>
          <div style={{ fontFamily: 'Share Tech Mono', color: '#00e5ff',
            fontSize: 14, letterSpacing: '0.15em', animation: 'pulse 1s infinite' }}>
            PROCESSING…
          </div>
        </div>
      )}
    </div>
  )
}
