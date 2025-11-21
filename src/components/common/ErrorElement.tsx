import { Button, Modal } from "antd"
import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router"

export function ErrorElement() {
  const error = useRouteError()
  const navigate = useNavigate()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : JSON.stringify(error)
  const stack = error instanceof Error ? error.stack : null

  if (!__DEV__ && message.includes("Failed to fetch dynamically imported module")) {
    setTimeout(() => {
      window.location.reload()
    }, 1000)
    return (
      <Modal
        open
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => {
          window.location.reload()
        }}
        okText="Reload"
        closable={false}
      >
        <div className="py-4">资源文件有更新</div>
      </Modal>
    )
  }

  return (
    <div className="m-auto flex min-h-full max-w-prose select-text flex-col p-8 pt-24">
      <div className="drag-region fixed inset-x-0 top-0 h-12" />
      <div className="center flex flex-col">
        <i className="i-mgc-bug-cute-re size-12 text-red-400" />
        <h2 className="mb-4 mt-12 text-2xl">Sorry, has encountered an error</h2>
      </div>
      <h3 className="text-xl">{message}</h3>
      {stack ? (
        <pre className="mt-4 max-h-48 cursor-text overflow-auto whitespace-pre-line rounded-md bg-red-50 p-4 text-left font-mono text-sm text-red-600">
          {stack.split("\n").map((line) => (
            <div className="cursor-pointer" key={line}>
              {line}
            </div>
          ))}
        </pre>
      ) : null}
      <p className="mb-2 mt-6">
        Has a temporary problem, click the button below to try reloading the app or another
        solution?
      </p>

      <div className="text-right">
        <Button
          onClick={() => {
            navigate("/")
            window.location.reload()
          }}
        >
          Reload
        </Button>
      </div>
    </div>
  )
}
