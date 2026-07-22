import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { DollarSign, BarChart3, Cpu, TrendingUp } from 'lucide-react'

interface UsageSummary {
  total_requests: number
  total_prompt_tokens: number
  total_completion_tokens: number
  total_cost: number
  by_provider: Record<string, {
    requests: number
    prompt_tokens: number
    completion_tokens: number
    cost: number
  }>
}

export default function AnalyticsPage() {
  const { data: todayData } = useQuery({
    queryKey: ['analytics', 'today'],
    queryFn: () => api.getAnalyticsToday(),
  })

  const { data: dailyData } = useQuery({
    queryKey: ['analytics', 'daily'],
    queryFn: () => api.getAnalyticsDaily(30),
  })

  const summary: UsageSummary = todayData || {
    total_requests: 0,
    total_prompt_tokens: 0,
    total_completion_tokens: 0,
    total_cost: 0,
    by_provider: {},
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Analytics</h1>
      <p className="text-gray-400 mb-8">Token usage and cost breakdown across all providers.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign size={16} />
            <span className="text-sm">Today's Cost</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${summary.total_cost.toFixed(4)}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <BarChart3 size={16} />
            <span className="text-sm">Requests</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {summary.total_requests}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Cpu size={16} />
            <span className="text-sm">Input Tokens</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {summary.total_prompt_tokens.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-sm">Output Tokens</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {summary.total_completion_tokens.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Provider Breakdown (Today)</h2>
        {Object.keys(summary.by_provider).length === 0 ? (
          <p className="text-gray-500">No usage today. Start chatting to see analytics!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2">Provider</th>
                  <th className="text-right py-2">Requests</th>
                  <th className="text-right py-2">Input Tokens</th>
                  <th className="text-right py-2">Output Tokens</th>
                  <th className="text-right py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.by_provider).map(([provider, data]) => (
                  <tr key={provider} className="border-b border-gray-800/50">
                    <td className="py-3 font-medium capitalize">{provider}</td>
                    <td className="py-3 text-right">{data.requests}</td>
                    <td className="py-3 text-right">{data.prompt_tokens.toLocaleString()}</td>
                    <td className="py-3 text-right">{data.completion_tokens.toLocaleString()}</td>
                    <td className="py-3 text-right text-green-400">${data.cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Trend */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Daily Trend (30 days)</h2>
        {dailyData && dailyData.length > 0 ? (
          <div className="space-y-2">
            {dailyData.slice(-14).map((day: any) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-24">{day.date}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (day.cost / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-green-400 w-20 text-right">${day.cost.toFixed(3)}</span>
                <span className="text-sm text-gray-500 w-24 text-right">{(day.tokens / 1000).toFixed(1)}K tokens</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No data yet. Start chatting!</p>
        )}
      </div>

      {/* Cost Info */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">💡 Cost Tracking Info</h3>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• 9Router routes to free providers when possible (cost = $0)</li>
          <li>• OpenRouter pricing varies by model (see openrouter.ai/pricing)</li>
          <li>• Surplus Intelligence offers spot-market discounts (up to 80% off)</li>
          <li>• Switch providers in Settings to optimize cost vs quality</li>
        </ul>
      </div>
    </div>
  )
}
