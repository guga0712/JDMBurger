'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type PedidoDia = { data: string; total: number }

interface Props {
  dadosIniciais: PedidoDia[]
}

const PERIODOS = [
  { label: '7 dias', value: 7 },
  { label: '14 dias', value: 14 },
  { label: '30 dias', value: 30 },
]

function formatarData(iso: string, dias: number) {
  const [, mes, dia] = iso.split('-')
  if (dias <= 14) return `${dia}/${mes}`
  return `${dia}/${mes}`
}

export default function DashboardChart({ dadosIniciais }: Props) {
  const [periodo, setPeriodo] = useState(7)
  const [dados, setDados] = useState<PedidoDia[]>(dadosIniciais)
  const [carregando, setCarregando] = useState(false)

  async function mudarPeriodo(dias: number) {
    if (dias === periodo) return
    setPeriodo(dias)
    setCarregando(true)
    try {
      const res = await fetch(`/api/dashboard?dias=${dias}`)
      const json = await res.json()
      setDados(json.pedidosPorDia)
    } finally {
      setCarregando(false)
    }
  }

  const dadosFormatados = dados.map((d) => ({
    ...d,
    label: formatarData(d.data, periodo),
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-semibold text-foreground">Pedidos por dia</p>
        <div className="flex gap-1">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => mudarPeriodo(p.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                periodo === p.value
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`h-52 transition-opacity ${carregando ? 'opacity-40' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dadosFormatados} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPedidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c0392b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#888' }}
              axisLine={false}
              tickLine={false}
              interval={periodo > 14 ? Math.floor(periodo / 7) - 1 : 0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#aaa' }}
              itemStyle={{ color: '#fff' }}
              formatter={(v: number | string) => [v, 'Pedidos']}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#c0392b"
              strokeWidth={2}
              fill="url(#gradPedidos)"
              dot={false}
              activeDot={{ r: 4, fill: '#c0392b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
