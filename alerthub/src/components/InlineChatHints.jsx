import PropTypes from 'prop-types'

export default function InlineChatHints({ hints = [] }) {
  function ask(q) { window.dispatchEvent(new CustomEvent('chatbot:ask', { detail: q })) }
  if (!hints.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-sm font-semibold">Ask the Assistant</div>
      <div className="flex flex-wrap gap-2 text-xs">
        {hints.map(h => (
          <button key={h} onClick={()=>ask(h)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10">{h}</button>
        ))}
      </div>
    </div>
  )
}

InlineChatHints.propTypes = {
  hints: PropTypes.arrayOf(PropTypes.string),
}
