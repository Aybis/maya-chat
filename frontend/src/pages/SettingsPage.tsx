import { useState } from 'react'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o')
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [openrouterKey, setOpenrouterKey] = useState('')
  const [nineRouterEnabled, setNineRouterEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save to localStorage for now (in production, this would go to backend)
    localStorage.setItem('provider', provider)
    localStorage.setItem('model', model)
    localStorage.setItem('openai_key', openaiKey)
    localStorage.setItem('anthropic_key', anthropicKey)
    localStorage.setItem('openrouter_key', openrouterKey)
    localStorage.setItem('nine_router_enabled', String(nineRouterEnabled))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Provider Selection */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Provider</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Default Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="openrouter">OpenRouter</option>
                <option value="9router">9Router (free + tracking)</option>
                <option value="surplus">Surplus Intelligence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Default Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="claude-opus-4-20250514">Claude Opus 4</option>
                <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (via OpenRouter)</option>
                <option value="deepseek/deepseek-chat">DeepSeek V3 (via OpenRouter)</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">API Keys</h2>
          <p className="text-sm text-gray-500 mb-4">Keys are stored in localStorage. In production, use backend-stored keys.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">OpenAI API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Anthropic API Key</label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">OpenRouter API Key</label>
              <input
                type="password"
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="sk-or-..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* 9Router */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">9Router (Local Proxy)</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={nineRouterEnabled}
              onChange={(e) => setNineRouterEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Enable 9Router for free provider access + token tracking</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Run <code className="bg-gray-800 px-1 rounded">npx 9router</code> or use Docker. Dashboard at localhost:20128.
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Save size={16} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
