'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  label?: string
  error?: string
  placeholder?: string
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
}

function Select({
  options,
  label,
  error,
  placeholder,
  name,
  value: controlledValue,
  defaultValue = '',
  onChange,
  disabled,
  id,
  className,
}: SelectProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = isControlled ? controlledValue : internalValue

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const selectId = id ?? generatedId

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // placeholder는 options에 없을 때만 트리거에 표시
  const selectedOption = options.find((o) => o.value === currentValue)
  const isPlaceholder = !selectedOption && !!placeholder

  function handleSelect(optValue: string, optDisabled?: boolean) {
    if (optDisabled) return
    if (!isControlled) setInternalValue(optValue)
    onChange?.(optValue)
    setIsOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((prev) => !prev)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {name && <input type="hidden" name={name} value={currentValue} />}

        {/* 트리거 버튼 */}
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            'w-full flex items-center justify-between gap-2',
            'bg-white/6 border border-white/12 rounded-xl',
            'px-4 py-2.5 text-sm text-left',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            'transition-colors duration-200 cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isOpen ? 'border-emerald-500/50 bg-white/8' : 'hover:bg-white/8 hover:border-white/20',
            error && 'border-red-500/50',
            isPlaceholder ? 'text-slate-500' : 'text-white',
            className
          )}
        >
          <span className="truncate">
            {isPlaceholder ? placeholder : (selectedOption?.label ?? '')}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* 드롭다운 패널 */}
        {isOpen && (
          <ul
            role="listbox"
            className={cn(
              'absolute z-50 w-full mt-1.5 py-1',
              'bg-[#1c1c1c] border border-white/12 rounded-xl',
              'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
              'overflow-hidden'
            )}
          >
            {options.map((opt) => {
              const isSelected = opt.value === currentValue
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value, opt.disabled)}
                  className={cn(
                    'flex items-center justify-between gap-2',
                    'mx-1 px-3 py-2 rounded-lg text-sm',
                    'transition-colors duration-150',
                    opt.disabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : isSelected
                        ? 'bg-emerald-500/15 text-emerald-400 cursor-pointer'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white cursor-pointer'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

Select.displayName = 'Select'

export { Select }
export type { SelectProps, SelectOption }
