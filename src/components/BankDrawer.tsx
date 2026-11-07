'use client'

import { useState, useEffect } from 'react'
import { X, Landmark, Copy, CheckCircle2, ArrowRight } from 'lucide-react'

export interface BankDrawerProps {
  open:         boolean
  onClose:      () => void
  bankName?:    string
  bankAccount?: string
  bankBranch?:  string
  accountName?: string
  giftName?:    string
}

const STEPS = [
  { n: '1', title: 'Open your banking app',       desc: 'Use your mobile banking app or visit any branch.' },
  { n: '2', title: 'Select "Transfer / Send"',    desc: 'Choose to transfer to another bank account.' },
  { n: '3', title: 'Enter the account details',   desc: 'Copy the account number and name shown above.' },
  { n: '4', title: 'Enter your amount',           desc: 'Send any amount you wish to give.' },
  { n: '5', title: 'Confirm the transfer',        desc: 'Review and approve the transaction in your app.' },
]

export function BankDrawer({ open, onClose, bankName, bankAccount, bankBranch, accountName, giftName }: BankDrawerProps) {
  const [copied,  setCopied]  = useState<string | null>(null)
  const [thanked, setThanked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => { setMounted(false); setThanked(false) }, 350)
      return () => clearTimeout(t)
    }
  }, [open])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!mounted) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className={`relative bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-md
                        max-h-[92vh] overflow-y-auto
                        transition-all duration-350 ease-out
                        ${visible
                          ? 'translate-y-0 opacity-100 md:scale-100'
                          : 'translate-y-full opacity-0 md:translate-y-0 md:scale-95'}`}>

          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 pt-5 pb-4
                          flex items-center justify-between border-b border-gray-100 rounded-t-3xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                <Landmark size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-serif text-lg text-purple-900 leading-tight">Bank Transfer</h2>
                {giftName && <p className="text-xs text-gray-400 font-sans">{giftName}</p>}
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">

            {thanked ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h3 className="font-serif text-2xl text-purple-900 mb-2">Thank You! 🎉</h3>
                <p className="text-gray-500 font-sans text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                  Your gift means so much to Ekow &amp; Ekua. Thank you for celebrating with them.
                </p>
                <button onClick={onClose}
                  className="px-8 py-3 rounded-full bg-gold text-purple-950 font-sans font-semibold hover:bg-yellow-300 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Bank details */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <p className="text-[11px] text-green-700 uppercase tracking-widest font-sans font-semibold mb-4">
                    Account Details
                  </p>
                  <div className="space-y-3">
                    {bankName && (
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-gray-400 font-sans uppercase tracking-wider">Bank</p>
                          <p className="text-gray-900 font-semibold font-sans text-sm">{bankName}</p>
                        </div>
                        <button onClick={() => copy(bankName, 'bank')}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors">
                          {copied === 'bank' ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                          {copied === 'bank' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                    {accountName && (
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-gray-400 font-sans uppercase tracking-wider">Account Name</p>
                          <p className="text-gray-900 font-semibold font-sans text-sm">{accountName}</p>
                        </div>
                        <button onClick={() => copy(accountName, 'name')}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors">
                          {copied === 'name' ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                          {copied === 'name' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                    {bankAccount && (
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-gray-400 font-sans uppercase tracking-wider">Account Number</p>
                          <p className="font-mono text-gray-900 font-bold text-base tracking-wider">{bankAccount}</p>
                        </div>
                        <button onClick={() => copy(bankAccount, 'account')}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors">
                          {copied === 'account' ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                          {copied === 'account' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                    {bankBranch && (
                      <div>
                        <p className="text-[11px] text-gray-400 font-sans uppercase tracking-wider">Branch</p>
                        <p className="text-gray-900 font-sans text-sm">{bankBranch}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-sans font-semibold mb-4">
                    How to Transfer
                  </p>
                  <ol className="space-y-3">
                    {STEPS.map(s => (
                      <li key={s.n} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 border border-purple-200
                                         flex items-center justify-center text-xs font-bold text-purple-700 mt-0.5">
                          {s.n}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 font-sans">{s.title}</p>
                          <p className="text-xs text-gray-500 font-sans mt-0.5">{s.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Confirm */}
                <button onClick={() => setThanked(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-700
                             text-white font-sans font-semibold text-base
                             hover:from-green-700 hover:to-green-800 transition-all
                             flex items-center justify-center gap-2.5 shadow-lg shadow-green-100">
                  <CheckCircle2 size={18} />
                  I&apos;ve Sent the Transfer
                  <ArrowRight size={16} />
                </button>

                <p className="text-center text-[11px] text-gray-400 font-sans">
                  Tap this after completing your transfer so Ekow &amp; Ekua know.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
