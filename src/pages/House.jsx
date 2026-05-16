import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/tripConfig'
import { getFamily } from '../lib/family'
import FamilyBadge from '../components/FamilyBadge'

export default function House() {
  const [house, setHouse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [candidateForm, setCandidateForm] = useState(null)
  const [expandedComments, setExpandedComments] = useState({})
  const [comments, setComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('house_candidates_sort') || 'recent')
  const family = getFamily()

  // --- House data ---
  async function loadHouse() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('house').select('*').limit(1).maybeSingle()
    setHouse(data)
    setLoading(false)
  }

  async function loadCandidates() {
    if (!supabase) return
    const { data } = await supabase.from('house_candidates').select('*').order('created_at', { ascending: false })
    if (data) setCandidates(data)
  }

  useEffect(() => {
    loadHouse()
    loadCandidates()
    if (!supabase) return
    const ch1 = supabase.channel('house')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'house' }, () => loadHouse())
      .subscribe()
    const ch2 = supabase.channel('house_candidates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'house_candidates' }, () => loadCandidates())
      .subscribe()
    const ch3 = supabase.channel('house_candidate_comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'house_candidate_comments' }, () => {
        // Reload comments for all expanded candidates
        Object.keys(expandedComments).forEach((id) => {
          if (expandedComments[id]) loadComments(id)
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); supabase.removeChannel(ch3) }
  }, [])

  // --- House CRUD ---
  async function handleSaveHouse() {
    if (!editing) return
    const row = {
      name: editing.name || null,
      listing_url: editing.listing_url || null,
      address: editing.address || null,
      check_in: editing.check_in || null,
      check_out: editing.check_out || null,
      notes: editing.notes || null,
      updated_at: new Date().toISOString(),
    }
    if (house) {
      await supabase.from('house').update(row).eq('id', house.id)
    } else {
      await supabase.from('house').insert(row)
    }
    setEditing(null)
    loadHouse()
  }

  function openHouseEdit() {
    setEditing({
      name: house?.name || '',
      listing_url: house?.listing_url || '',
      address: house?.address || '',
      check_in: house?.check_in || '',
      check_out: house?.check_out || '',
      notes: house?.notes || '',
    })
  }

  // --- Candidate CRUD ---
  async function handleSaveCandidate() {
    if (!candidateForm || !candidateForm.listing_url) return
    const row = {
      name: candidateForm.name || null,
      listing_url: candidateForm.listing_url,
      address: candidateForm.address || null,
      total_price: candidateForm.total_price ? Number(candidateForm.total_price) : null,
      bedrooms: candidateForm.bedrooms ? Number(candidateForm.bedrooms) : null,
      sleeping_areas: candidateForm.sleeping_areas ? Number(candidateForm.sleeping_areas) : null,
      beds: candidateForm.beds ? Number(candidateForm.beds) : null,
      bathrooms: candidateForm.bathrooms ? Number(candidateForm.bathrooms) : null,
      image_url: candidateForm.image_url || null,
      notes: candidateForm.notes || null,
      added_by: family,
    }
    if (candidateForm.id) {
      await supabase.from('house_candidates').update(row).eq('id', candidateForm.id)
    } else {
      row.created_at = new Date().toISOString()
      await supabase.from('house_candidates').insert(row)
    }
    setCandidateForm(null)
    loadCandidates()
  }

  async function handleDeleteCandidate(id) {
    if (!confirm('Delete this candidate and all its comments?')) return
    await supabase.from('house_candidates').delete().eq('id', id)
    loadCandidates()
  }

  async function handlePickCandidate(candidate) {
    if (!confirm('Set this as our booked house?')) return
    // Update house table
    const houseRow = {
      name: candidate.name || null,
      listing_url: candidate.listing_url,
      address: candidate.address || null,
      updated_at: new Date().toISOString(),
    }
    if (house) {
      await supabase.from('house').update(houseRow).eq('id', house.id)
    } else {
      await supabase.from('house').insert(houseRow)
    }
    // Mark candidate as selected
    await supabase.from('house_candidates').update({ is_selected: false }).neq('id', candidate.id)
    await supabase.from('house_candidates').update({ is_selected: true }).eq('id', candidate.id)
    loadHouse()
    loadCandidates()
  }

  // --- Comments ---
  async function loadComments(candidateId) {
    if (!supabase) return
    const { data } = await supabase
      .from('house_candidate_comments')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: true })
    if (data) setComments((prev) => ({ ...prev, [candidateId]: data }))
  }

  function toggleComments(candidateId) {
    const isOpen = expandedComments[candidateId]
    setExpandedComments((prev) => ({ ...prev, [candidateId]: !isOpen }))
    if (!isOpen) loadComments(candidateId)
  }

  async function postComment(candidateId) {
    const body = commentInputs[candidateId]?.trim()
    if (!body || !supabase) return
    await supabase.from('house_candidate_comments').insert({
      candidate_id: candidateId,
      family_name: family,
      body,
      created_at: new Date().toISOString(),
    })
    setCommentInputs((prev) => ({ ...prev, [candidateId]: '' }))
    loadComments(candidateId)
  }

  const isEmpty = !house || !house.name

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-[#78350F]">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-6">🏔️ The House</h1>

      {!supabase && (
        <p className="text-[#B91C1C] bg-red-50 p-3 rounded-lg mb-4 text-sm">Supabase not connected.</p>
      )}

      {/* ====== OUR HOUSE CARD ====== */}
      {isEmpty ? (
        <div className="bg-white/50 rounded-xl p-8 border border-[#78350F]/10 text-center mb-10">
          <div className="text-5xl mb-4">🏔️</div>
          <h2 className="font-display text-xl font-bold text-[#2A2118] mb-2">
            We haven&apos;t booked a house yet!
          </h2>
          <p className="text-[#78350F] text-sm mb-6">
            Once we find the perfect mountain cabin, add the details here — or pick one from the candidates below.
          </p>
          <button
            onClick={openHouseEdit}
            className="px-6 py-3 bg-[#C2410C] text-white rounded-lg font-bold hover:bg-[#B91C1C] transition-colors"
          >
            Add house details
          </button>
        </div>
      ) : (
        <div className="bg-white/50 rounded-xl p-6 border border-[#78350F]/10 relative mb-10">
          <button
            onClick={openHouseEdit}
            className="absolute top-4 right-4 text-xs text-[#D97706] hover:underline"
          >
            Edit
          </button>
          <h2 className="font-display text-2xl font-bold text-[#2A2118] mb-3">{house.name}</h2>
          {house.address && (
            <div className="mb-3">
              <p className="text-[#2A2118] text-sm">{house.address}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0EA5E9] hover:underline">Open in Maps</a>
            </div>
          )}
          {(house.check_in || house.check_out) && (
            <div className="flex gap-4 mb-3 text-sm">
              {house.check_in && <div><span className="text-[#78350F]">Check-in:</span> <span className="font-medium text-[#2A2118]">{formatDate(house.check_in)}</span></div>}
              {house.check_out && <div><span className="text-[#78350F]">Check-out:</span> <span className="font-medium text-[#2A2118]">{formatDate(house.check_out)}</span></div>}
            </div>
          )}
          {house.listing_url && (
            <a href={house.listing_url} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 bg-[#C2410C] text-white rounded-lg font-bold text-sm hover:bg-[#B91C1C] transition-colors mb-3">View listing →</a>
          )}
          {house.notes && (
            <div className="mt-3 pt-3 border-t border-[#78350F]/10">
              <h3 className="text-sm font-bold text-[#78350F] mb-1">Notes</h3>
              <p className="text-[#2A2118] text-sm whitespace-pre-wrap">{house.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ====== HOUSE CANDIDATES ====== */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold text-[#2A2118]">House Candidates</h2>
        <button
          onClick={() => setCandidateForm({ listing_url: '', name: '', address: '', total_price: '', bedrooms: '', sleeping_areas: '', beds: '', bathrooms: '', image_url: '', notes: '' })}
          className="px-4 py-2 bg-[#C2410C] text-white rounded-lg text-sm font-bold hover:bg-[#B91C1C] transition-colors"
        >
          + Add candidate
        </button>
      </div>

      {candidates.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm text-[#78350F] font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); localStorage.setItem('house_candidates_sort', e.target.value) }}
            className="border border-[#78350F]/30 rounded-lg px-2 py-1 text-sm bg-white text-[#2A2118]"
          >
            <option value="recent">Recently added</option>
            <option value="price_asc">Total price: low → high</option>
            <option value="price_desc">Total price: high → low</option>
            <option value="per_family">Per-family price: low → high</option>
            <option value="beds">Most beds</option>
            <option value="bedrooms">Most bedrooms</option>
          </select>
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="bg-white/50 rounded-xl p-8 border border-[#78350F]/10 text-center">
          <p className="text-[#78350F]">No candidates yet. Add a rental you&apos;re considering.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...candidates].sort((a, b) => {
            const sortFns = {
              recent: () => new Date(b.created_at) - new Date(a.created_at),
              price_asc: () => {
                if (!a.total_price && !b.total_price) return 0
                if (!a.total_price) return 1
                if (!b.total_price) return -1
                return Number(a.total_price) - Number(b.total_price)
              },
              price_desc: () => {
                if (!a.total_price && !b.total_price) return 0
                if (!a.total_price) return 1
                if (!b.total_price) return -1
                return Number(b.total_price) - Number(a.total_price)
              },
              per_family: () => {
                if (!a.total_price && !b.total_price) return 0
                if (!a.total_price) return 1
                if (!b.total_price) return -1
                return Number(a.total_price) / 3 - Number(b.total_price) / 3
              },
              beds: () => {
                if (!a.beds && !b.beds) return 0
                if (!a.beds) return 1
                if (!b.beds) return -1
                return Number(b.beds) - Number(a.beds)
              },
              bedrooms: () => {
                if (!a.bedrooms && !b.bedrooms) return 0
                if (!a.bedrooms) return 1
                if (!b.bedrooms) return -1
                return Number(b.bedrooms) - Number(a.bedrooms)
              },
            }
            return (sortFns[sortBy] || sortFns.recent)()
          }).map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              comments={comments[c.id] || []}
              isExpanded={!!expandedComments[c.id]}
              commentInput={commentInputs[c.id] || ''}
              family={family}
              hasAnySelected={candidates.some((x) => x.is_selected)}
              onToggleComments={() => toggleComments(c.id)}
              onCommentChange={(val) => setCommentInputs((prev) => ({ ...prev, [c.id]: val }))}
              onPostComment={() => postComment(c.id)}
              onEdit={() => setCandidateForm({
                id: c.id, listing_url: c.listing_url, name: c.name || '',
                address: c.address || '', total_price: c.total_price || '',
                bedrooms: c.bedrooms || '', sleeping_areas: c.sleeping_areas || '',
                beds: c.beds || '', bathrooms: c.bathrooms || '',
                image_url: c.image_url || '', notes: c.notes || '',
              })}
              onDelete={() => handleDeleteCandidate(c.id)}
              onPick={() => handlePickCandidate(c)}
            />
          ))}
        </div>
      )}

      {/* ====== HOUSE EDIT MODAL ====== */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-[#2A2118] mb-4">House Details</h3>
            <label className="block text-sm font-medium text-[#78350F] mb-1">Name</label>
            <input type="text" placeholder="e.g. The Mountain View Cabin" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm" autoFocus />
            <label className="block text-sm font-medium text-[#78350F] mb-1">Listing URL</label>
            <input type="url" placeholder="Airbnb / VRBO link" value={editing.listing_url} onChange={(e) => setEditing({ ...editing, listing_url: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm" />
            <label className="block text-sm font-medium text-[#78350F] mb-1">Address</label>
            <input type="text" placeholder="Full address" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Check-in</label>
                <input type="date" value={editing.check_in} onChange={(e) => setEditing({ ...editing, check_in: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Check-out</label>
                <input type="date" value={editing.check_out} onChange={(e) => setEditing({ ...editing, check_out: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <label className="block text-sm font-medium text-[#78350F] mb-1">Notes</label>
            <textarea placeholder="WiFi password, door codes, parking, etc." value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-4 text-sm" rows={3} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-[#78350F]">Cancel</button>
              <button onClick={handleSaveHouse} className="px-4 py-2 bg-[#C2410C] text-white rounded-lg text-sm font-bold">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== CANDIDATE FORM MODAL ====== */}
      {candidateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-[#2A2118] mb-4">
              {candidateForm.id ? 'Edit Candidate' : 'Add Candidate'}
            </h3>

            <label className="block text-sm font-medium text-[#78350F] mb-1">Listing URL *</label>
            <input
              type="url"
              placeholder="Paste the Airbnb/VRBO link"
              value={candidateForm.listing_url}
              onChange={(e) => setCandidateForm({ ...candidateForm, listing_url: e.target.value })}
              className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm"
              autoFocus
            />

            <label className="block text-sm font-medium text-[#78350F] mb-1">Name</label>
            <input type="text" placeholder="e.g. Cozy Mountain Cabin" value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm" />

            <label className="block text-sm font-medium text-[#78350F] mb-1">Address</label>
            <input type="text" placeholder="Full address" value={candidateForm.address} onChange={(e) => setCandidateForm({ ...candidateForm, address: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm" />

            <label className="block text-sm font-medium text-[#78350F] mb-1">Total cost ($)</label>
            <input type="number" step="any" placeholder="e.g. 4200" value={candidateForm.total_price} onChange={(e) => setCandidateForm({ ...candidateForm, total_price: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm" />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Bedrooms</label>
                <input type="number" placeholder="0" value={candidateForm.bedrooms} onChange={(e) => setCandidateForm({ ...candidateForm, bedrooms: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Sleeping areas (loft, nook, bunk room)</label>
                <input type="number" placeholder="0" value={candidateForm.sleeping_areas} onChange={(e) => setCandidateForm({ ...candidateForm, sleeping_areas: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Total beds</label>
                <input type="number" placeholder="0" value={candidateForm.beds} onChange={(e) => setCandidateForm({ ...candidateForm, beds: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#78350F] mb-1">Bathrooms</label>
                <input type="number" step="any" placeholder="e.g. 2.5" value={candidateForm.bathrooms} onChange={(e) => setCandidateForm({ ...candidateForm, bathrooms: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <label className="block text-sm font-medium text-[#78350F] mb-1">Image URL</label>
            <input type="url" placeholder="Auto-filled from listing, or paste manually" value={candidateForm.image_url} onChange={(e) => setCandidateForm({ ...candidateForm, image_url: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-3 text-sm" />

            <label className="block text-sm font-medium text-[#78350F] mb-1">Notes</label>
            <textarea placeholder="Great views, near a creek, etc." value={candidateForm.notes} onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })} className="w-full border border-[#78350F]/30 rounded-lg px-3 py-2 mb-4 text-sm" rows={2} />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setCandidateForm(null)} className="px-4 py-2 text-sm text-[#78350F]">Cancel</button>
              <button onClick={handleSaveCandidate} disabled={!candidateForm.listing_url} className="px-4 py-2 bg-[#C2410C] text-white rounded-lg text-sm font-bold disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Candidate Card Component ---
function CandidateCard({ candidate: c, comments, isExpanded, commentInput, family, hasAnySelected, onToggleComments, onCommentChange, onPostComment, onEdit, onDelete, onPick }) {
  return (
    <div className={`bg-white/50 rounded-xl border overflow-hidden ${c.is_selected ? 'border-[#15803D] border-2' : 'border-[#78350F]/10'}`}>
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-[#78350F]/5 flex-shrink-0 flex items-center justify-center">
          {c.image_url ? (
            <img src={c.image_url} alt={c.name || 'Listing'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">🏠</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-[#2A2118] text-lg leading-tight">
              {c.name || 'Untitled'}
            </h3>
            {c.is_selected && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#15803D] text-white whitespace-nowrap">
                Selected
              </span>
            )}
            {!c.is_selected && hasAnySelected && (
              <span className="text-xs text-[#78350F]/50 whitespace-nowrap">Not selected</span>
            )}
          </div>

          {c.address && <p className="text-[#78350F] text-sm mt-0.5">{c.address}</p>}

          {/* Spec strip */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm mt-1">
            {c.total_price && (
              <span className="font-bold text-[#2A2118]">Total: ${Number(c.total_price).toLocaleString()}</span>
            )}
            {c.total_price && (
              <span className="text-[#78350F]">${Math.round(Number(c.total_price) / 3).toLocaleString()}/family &divide; 3</span>
            )}
            {(() => {
              const specs = []
              if (c.bedrooms) specs.push(`${c.bedrooms} BR`)
              if (c.sleeping_areas) specs.push(`${c.sleeping_areas} sleeping area${c.sleeping_areas > 1 ? 's' : ''}`)
              if (c.beds) specs.push(`${c.beds} bed${c.beds > 1 ? 's' : ''}`)
              if (c.bathrooms) specs.push(`${c.bathrooms} BA`)
              return specs.length > 0 ? <span className="text-[#78350F]">{specs.join(' · ')}</span> : null
            })()}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <FamilyBadge family={c.added_by} small />
          </div>

          {c.notes && <p className="text-[#78350F]/70 text-xs mt-1 italic">{c.notes}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
        <a href={c.listing_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#C2410C] text-white rounded-lg text-xs font-bold hover:bg-[#B91C1C] transition-colors">
          View listing →
        </a>
        {!c.is_selected && (
          <button onClick={onPick} className="px-3 py-1.5 bg-[#15803D] text-white rounded-lg text-xs font-bold hover:bg-[#166534] transition-colors">
            Pick this one
          </button>
        )}
        <button onClick={onToggleComments} className="px-3 py-1.5 bg-[#78350F]/10 text-[#78350F] rounded-lg text-xs font-medium">
          💬 Comments ({comments.length || '...'})
        </button>
        <button onClick={onEdit} className="text-xs text-[#D97706] hover:underline">✏️ Edit</button>
        <button onClick={onDelete} className="text-xs text-[#B91C1C]/60 hover:text-[#B91C1C]">🗑️ Delete</button>
      </div>

      {/* Comments section */}
      {isExpanded && (
        <div className="border-t border-[#78350F]/10 px-4 py-3 bg-white/30">
          {comments.length === 0 && (
            <p className="text-[#78350F]/40 text-xs italic mb-2">No comments yet.</p>
          )}
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <FamilyBadge family={comment.family_name} small />
                <span className="text-[#78350F]/40 text-xs ml-2">
                  {new Date(comment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
                <p className="text-[#2A2118] mt-0.5">{comment.body}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onPostComment()}
              className="flex-1 border border-[#78350F]/30 rounded-lg px-3 py-1.5 text-sm"
            />
            <button
              onClick={onPostComment}
              disabled={!commentInput.trim()}
              className="px-3 py-1.5 bg-[#C2410C] text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

