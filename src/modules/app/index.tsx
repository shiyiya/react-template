import { useEffect, useMemo, useRef, type JSX } from "react"
import { isString } from "antd/es/button"
//@ts-ignore
import { useFlowLogs } from "./sse"

export default function LogViewer({ node }: { node: any; env: typeof APP_ENV }) {
  const argoConfig = useMemo(() => {
    const i = node.id.lastIndexOf("-")
    return {
      podName:
        node.id.slice(0, i) +
        "-" +
        (node.templateName || node.templateRef.template) +
        node.id.slice(i),
    }
  }, [node])

  const { data: argo, eventSourceRef } = useFlowLogs(node.boundaryID, argoConfig.podName)

  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = boxRef.current

    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 500)
    }
  }, [argo])

  return (
    <div className="my-2 rounded-xl bg-gray-900 text-xs text-gray-200 shadow-lg">
      <header className="rounded-t-xl px-4 py-2 font-semibold">{node.displayName}</header>

      <div
        ref={boxRef}
        className="scrollbar-thin scrollbar-thumb-gray-700 h-80 overflow-y-auto px-4 py-3 font-mono"
      >
        {argo.message?.map?.((l: any, idx: number) => (
          <LogLine key={idx} raw={l} eventSourceRef={eventSourceRef} />
        ))}
      </div>
    </div>
  )
}

function parseLine(raw: string) {
  const o = JSON.parse(raw).result

  if (!o.content) return

  if (o.content.startsWith("time=")) {
    const kv: Record<string, string> = {}
    const regex = /(\w+)=(".*?"|\S+)/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(o.content))) {
      const k = m[1]
      let v = m[2]
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
      kv[k] = v
    }

    return kv
  }

  return o.content
}

const ansi2tw: Record<number, string> = {
  30: "text-gray-800",
  31: "text-red-500",
  32: "text-green-500",
  33: "text-yellow-400",
  34: "text-blue-500",
  35: "text-purple-500",
  36: "text-cyan-400",
  37: "text-white",
}

function renderAnsi(line: string) {
  const escRe = /\x1b\[[0-9;]*m/g
  const texts = line.split(escRe)
  const codes = line.match(escRe) || []
  const spans: JSX.Element[] = []

  let color = "text-gray-200"
  texts.forEach((txt, idx) => {
    if (txt)
      spans.push(
        <span key={idx} className={color}>
          {txt}
        </span>,
      )

    const code = codes[idx]
    if (code) {
      const nums = code.slice(2, -1).split(";").map(Number)
      if (nums.includes(0)) color = "text-gray-200"
      const fg = nums.find((n) => n >= 30 && n <= 37)
      if (fg !== undefined) color = ansi2tw[fg] || color
    }
  })
  return spans
}

const color: Record<string, string> = {
  info: "text-green-400",
  debug: "text-sky-400",
  warn: "text-yellow-300",
  error: "text-red-400",
}

function LogLine({ raw, eventSourceRef }: { raw: string; eventSourceRef: any }) {
  const kv = parseLine(raw)

  if (!kv) return

  if (isString(kv)) {
    return <p className="flex flex-wrap gap-x-2 whitespace-pre-wrap break-all">{renderAnsi(kv)}</p>
  }
  if (kv.argo == "true" && kv.msg.includes("exited")) {
    eventSourceRef.current.close()
  }

  const time = kv.time || ""
  const level = kv.level || "info"
  const msg = kv.msg || raw
  const err = kv.error
  const rest = Object.entries(kv).filter(
    ([k]) => !["time", "level", "msg", "error", "argo"].includes(k),
  )

  return (
    <p className="flex flex-wrap gap-x-2 whitespace-pre-wrap break-all">
      {time && <span className="text-gray-500">{time}</span>}

      <span className={`${color[level] ?? "text-white"} font-semibold`}>{level.toUpperCase()}</span>

      <span>{msg}</span>
      {err && err !== "<nil>" && <span className="text-red-400">err={err}</span>}

      {rest.map(([k, v]: any[]) => (
        <span key={k} className="text-gray-400">
          {k}={v}
        </span>
      ))}
    </p>
  )
}
