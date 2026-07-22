export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Provider</h2>
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
            <option value="openai">OpenAI (GPT-4o)</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openrouter">OpenRouter (400+ models)</option>
            <option value="9router">9Router (free + tracking)</option>
            <option value="surplus">Surplus Intelligence (cheap)</option>
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Set DEFAULT_PROVIDER in backend .env to change.
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Token Tracking</h2>
          <p className="text-gray-400 text-sm">
            Track usage in the Analytics page. Costs are calculated per-model based on per-million-token pricing.
          </p>
        </div>
      </div>
    </div>
  )
}
