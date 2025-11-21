import { Popover } from "antd"
import dayjs from "dayjs"

function getStatusProps(phase: string): { icon: any; colorClassName: any } {
  switch (phase) {
    case "Running":
      return { icon: "●", colorClassName: "text-green-500" }
    case "Pending":
      return { icon: "●", colorClassName: "text-yellow-500" }
    case "Failed":
      return { icon: "●", colorClassName: "text-red-500" }
    case "Succeeded":
      return { icon: "●", colorClassName: "text-blue-500" }
    default:
      return { icon: "●", colorClassName: "text-gray-400" }
  }
}

export const Timeline = ({
  nodes,
  simple,
  onClick,
}: {
  simple?: boolean
  onClick?: Function
  nodes: {
    phase: string
    displayName: string
    startedAt?: string
    finishedAt?: string
    message: string
  }[]
}) => {
  return (
    <div className="flex items-center">
      {nodes.map((node, i) => {
        const { icon, colorClassName } = getStatusProps(node.phase)
        return (
          <li className="grid grid-cols-6 grid-rows-3 items-center" key={node.displayName}>
            {i != 0 && <hr className="row-start-2" />}
            <div className="col-start-2 row-start-2 cursor-pointer">
              <span
                className="bg-primary/20 flex items-center justify-center rounded-full"
                onClick={() => onClick?.(node)}
              >
                {simple ? (
                  <span className={`text-2xl ${colorClassName}`}>{icon}</span>
                ) : (
                  <Popover
                    content={
                      <div>
                        <p>
                          {dayjs(
                            ["Running", "Pending"].includes(node.phase)
                              ? node.startedAt
                              : node.finishedAt,
                          ).format("YYYY/MM/DD hh:mm:ss")}
                        </p>
                      </div>
                    }
                  >
                    <span className={`text-2xl ${colorClassName}`}>{icon}</span>
                  </Popover>
                )}
              </span>
            </div>
            <div className="col-start-1 col-end-4 row-start-3 row-end-4 text-center text-xs">
              <p className="font-bold">{node.displayName}</p>
              {/* <p className="font-thin"> {dayjs(node.startedAt).format("DD/MM/YYYY")}</p> */}
            </div>
            {i != nodes.length - 1 && <hr className="col-start-3 col-end-7 row-start-2" />}
          </li>
        )
      })}
    </div>
  )
}
