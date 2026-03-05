import { useEffect, useState } from 'react'
import { useSpeech } from '../contexts/SpeechContext'

// Robust CSV parser that handles quoted fields with commas
function parseCSV(text) {
    const rows = []
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const row = []
        let current = ''
        let inQuotes = false
        for (let j = 0; j < line.length; j++) {
            const ch = line[j]
            if (inQuotes) {
                if (ch === '"') {
                    if (j + 1 < line.length && line[j + 1] === '"') {
                        current += '"'
                        j++
                    } else {
                        inQuotes = false
                    }
                } else {
                    current += ch
                }
            } else {
                if (ch === '"') {
                    inQuotes = true
                } else if (ch === ',') {
                    row.push(current.trim())
                    current = ''
                } else {
                    current += ch
                }
            }
        }
        row.push(current.trim())
        rows.push(row)
    }
    return rows
}

export default function Categories() {
    const { speak, stop } = useSpeech()
    const [dataset, setDataset] = useState([])
    const [categories, setCategories] = useState([])
    const [selected, setSelected] = useState('')
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch('/india_women_child_safety_500_laws_dataset.csv')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load dataset')
                return res.text()
            })
            .then(text => {
                const rows = parseCSV(text)
                if (rows.length < 2) throw new Error('Dataset appears empty')
                const headers = rows[0]
                const data = rows.slice(1).map(row => {
                    const obj = {}
                    headers.forEach((h, i) => {
                        obj[h] = row[i] || ''
                    })
                    return obj
                })
                setDataset(data)
                const uniqueCats = [...new Set(data.map(d => d.Category))].filter(Boolean)
                setCategories(uniqueCats)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    const handleChange = (e) => {
        const cat = e.target.value
        setSelected(cat)
        if (cat) {
            setFiltered(dataset.filter(d => d.Category === cat))
        } else {
            setFiltered([])
        }
    }

    if (loading) {
        return (
            <div className="page-container flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block w-10 h-10 border-4 border-bloom-300 border-t-bloom-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading legal categories...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="glass-card p-8 text-center">
                    <p className="text-red-500 text-lg font-semibold">⚠️ {error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container fade-up">
            {/* Page Header */}
            <div className="text-center mb-8">
                <h1 className="section-title mb-2">📚 Legal Categories</h1>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Browse Indian laws related to women &amp; child safety. Select a category below to view all applicable laws, sections, and references.
                </p>
            </div>

            {/* Category Selector */}
            <div className="glass-card p-6 mb-8 max-w-2xl mx-auto">
                <label
                    className="block text-sm font-semibold text-bloom-700 mb-2"
                    onMouseEnter={() => speak('Select a legal category')}
                    onMouseLeave={stop}
                >
                    📋 Choose a Category
                </label>
                <select
                    value={selected}
                    onChange={handleChange}
                    className="input-field w-full text-base cursor-pointer"
                    id="category-select"
                >
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                {selected && (
                    <p className="text-xs text-gray-400 mt-2">
                        Showing {filtered.length} law{filtered.length !== 1 ? 's' : ''} under &ldquo;{selected}&rdquo;
                    </p>
                )}
            </div>

            {/* Results */}
            {selected && filtered.length > 0 && (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {filtered.map((item, idx) => (
                        <div
                            key={idx}
                            className="glass-card p-5 border-l-4 border-l-bloom-400 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 fade-up"
                            style={{ animationDelay: `${idx * 40}ms` }}
                            onMouseEnter={() => speak(item['Law / Section'])}
                            onMouseLeave={stop}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1">
                                    <h3 className="font-display font-bold text-bloom-800 text-lg">
                                        {item['Law / Section']}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="inline-block bg-bloom-50 text-bloom-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-2">
                                            📅 {item.Year}
                                        </span>
                                        <span className="inline-block bg-petal-50 text-petal-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {item.Category}
                                        </span>
                                    </p>
                                </div>
                                {item.Reference && (
                                    <a
                                        href={item.Reference}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-bloom-600 hover:text-bloom-800 font-medium underline underline-offset-2 shrink-0"
                                    >
                                        🔗 Reference
                                    </a>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                                <strong className="text-gray-700">Purpose:</strong> {item.Purpose}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {selected && filtered.length === 0 && (
                <div className="glass-card p-8 text-center max-w-2xl mx-auto">
                    <p className="text-gray-400">No laws found under this category.</p>
                </div>
            )}

            {!selected && (
                <div className="glass-card p-8 text-center max-w-2xl mx-auto">
                    <p className="text-gray-400 text-lg">👆 Select a category above to view laws</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelected(cat)
                                    setFiltered(dataset.filter(d => d.Category === cat))
                                }}
                                className="px-3 py-1.5 text-xs font-medium bg-bloom-50 text-bloom-700 rounded-full hover:bg-bloom-100 transition-colors cursor-pointer border border-bloom-200"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
