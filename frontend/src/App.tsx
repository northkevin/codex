import { useState, useEffect } from 'react'
import axios from 'axios'
import { format, formatDistance } from 'date-fns'
import { Stats } from './types/stats'
import './App.css'

function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get<Stats>('http://localhost:3001/api/stats')
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div className="loading">Loading stats...</div>
  if (!stats) return <div className="error">No stats available</div>

  const dateRange = formatDistance(
    new Date(stats.dateRange.earliest),
    new Date(stats.dateRange.latest)
  )

  return (
    <div className="container">
      <h1>YouTube Watch History Analysis</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>Total Videos Watched</h2>
          <div className="stat-value">{stats.totalVideos.toLocaleString()}</div>
        </div>

        <div className="stat-card">
          <h2>History Span</h2>
          <div className="stat-value">{dateRange}</div>
          <div className="stat-detail">
            {format(new Date(stats.dateRange.earliest), 'MMM d, yyyy')} -
            {format(new Date(stats.dateRange.latest), 'MMM d, yyyy')}
          </div>
        </div>

        <div className="stat-card">
          <h2>Unique Channels</h2>
          <div className="stat-value">{stats.uniqueChannels.toLocaleString()}</div>
        </div>
      </div>

      <div className="stat-sections">
        <div className="stat-section">
          <h2>Top {stats.topChannels.length} Most Watched Channels</h2>
          <div className="channels-list">
            {stats.topChannels.map((channel, index) => (
              <div key={channel.channelTitle} className="channel-item">
                <span className="rank">#{index + 1}</span>
                <span className="channel">{channel.channelTitle}</span>
                <span className="count">{channel._count.videoId} videos</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-section">
          <h2>Videos Watched by Year</h2>
          <div className="year-stats">
            {stats.watchesByYear.map(year => (
              <div key={year._key} className="year-item">
                <span className="year">{year._key}</span>
                <div className="bar" style={{ width: `${(year._count / stats.totalVideos) * 100}%` }} />
                <span className="count">{year._count.toLocaleString()} videos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
