import { useState, useRef, useEffect } from 'react'

export default function MultiSelect({ options, selected, onChange, placeholder = "Select options..." }) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef(null)

    const toggleOpen = () => setIsOpen(!isOpen)

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.section.includes(searchTerm)
    )

    const handleSelect = (option) => {
        const isSelected = selected.find(item => item.id === option.id)
        if (isSelected) {
            onChange(selected.filter(item => item.id !== option.id))
        } else {
            onChange([...selected, option])
        }
    }

    const removeSelected = (e, option) => {
        e.stopPropagation()
        onChange(selected.filter(item => item.id !== option.id))
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={toggleOpen}
                className={`input-field min-h-[42px] py-2 cursor-pointer flex flex-wrap gap-2 pr-10 items-center transition-all ${isOpen ? 'ring-2 ring-bloom-200 border-bloom-400' : ''}`}
            >
                {selected.length === 0 ? (
                    <span className="text-gray-400 text-sm">{placeholder}</span>
                ) : (
                    selected.map(item => (
                        <span key={item.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-bloom-100 text-bloom-700 text-xs font-medium rounded-lg border border-bloom-200 fade-in animate-duration-200">
                            {item.label}
                            <button
                                onClick={(e) => removeSelected(e, item)}
                                className="hover:text-bloom-900 transition-colors"
                            >
                                ✕
                            </button>
                        </span>
                    ))
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-bloom-400 transition-transform duration-300" style={{ transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)` }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full max-h-72 overflow-hidden bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col slide-down">
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search laws or sections..."
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bloom-100 focus:border-bloom-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => {
                                const isSelected = selected.find(item => item.id === option.id)
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelect(option)}
                                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-bloom-50 text-bloom-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-bloom-500 font-bold mb-0.5">SECTION {option.section}</span>
                                            <span>{option.label}</span>
                                        </div>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-bloom-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-400 text-xs italic">
                                No matching laws found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

