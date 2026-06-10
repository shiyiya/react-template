import * as React from "react"
import { cn } from "../../utils/utils"
import { motion } from "motion/react"
import { AnimatePresence } from "motion/react"


const Table = ({
  ref,
  className,
  containerClassName,
  ...props
}: React.HTMLAttributes<HTMLTableElement> & { containerClassName?: string } & {
  ref?: React.Ref<HTMLTableElement | null>
}) => (
  <div className={cn("relative w-full", containerClassName)}>
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
)
Table.displayName = "Table"

const TableHeader = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement | null>
}) => <thead ref={ref} className={cn(className)} {...props} />
TableHeader.displayName = "TableHeader"

const TableBody = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement | null>
}) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
TableBody.displayName = "TableBody"

const TableFooter = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement | null>
}) => (
  <tfoot
    ref={ref}
    className={cn("bg-material-thin border-t font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
)
TableFooter.displayName = "TableFooter"

const TableRow = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.Ref<HTMLTableRowElement | null>
}) => (
  <tr
    ref={ref}
    className={cn("data-[state=selected]:bg-material-medium transition-colors", className)}
    {...props}
  />
)
TableRow.displayName = "TableRow"

const TableMotionRow = ({
  ref,
  className,
  ...props
}: any &
  React.HTMLAttributes<HTMLTableRowElement> & {
    ref?: React.Ref<HTMLTableRowElement | null>
  }) => (
  //@ts-ignore
  <motion.tr
    ref={ref}
    className={cn("data-[state=selected]:bg-material-medium transition-colors", className)}
    {...props}
  />
)
TableMotionRow.displayName = "TableMotionRow"

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead = ({
  ref,
  className,
  ...props
}: TableHeadProps & { ref?: React.Ref<HTMLTableCellElement | null> }) => (
  <th
    ref={ref}
    className={cn(
      "text-text-secondary text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
      //   tableHeadVariants({ size, className }),
      "h-12 px-4",
      className,
    )}
    {...props}
  />
)
TableHead.displayName = "TableHead"

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = ({
  ref,
  className,
  ...props
}: TableCellProps & { ref?: React.Ref<HTMLTableCellElement | null> }) => (
  <td
    ref={ref}
    className={cn(
      "align-middle [&:has([role=checkbox])]:pr-0",
      "px-4 py-2" /**tableCellVariants({ size, className }) */,
    )}
    {...props}
  />
)
TableCell.displayName = "TableCell"

const TableCaption = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.Ref<HTMLTableCaptionElement | null>
}) => <caption ref={ref} className={cn("text-text-secondary mt-4 text-sm", className)} {...props} />
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableMotionRow,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}

// export const tableHeadVariants = cva("", {
//   variants: {
//     size: {
//       default: "h-12 px-4",
//       sm: "h-6 px-3 font-normal text-zinc-800 dark:text-zinc-500"
//     }
//   },
//   defaultVariants: {
//     size: "default"
//   }
// });

// export const tableCellVariants = {
//   size: {
//     default: "px-4 py-2",
//     sm: "py-1 pr-2 [&:last-child]:pr-0"
//   },
//   size: "default"
// };



// <Table>
//         <TableHeader className="bg-[#fafafa]">
//           <TableRow>
//             {columns.map((c: any) => (
//               <TableHead key={c.title} className="font-bold">
//                 {c.title}
//               </TableHead>
//             ))}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           <AnimatePresence mode="popLayout">
//             {data?._?.map((row: any) => {
//               return (
//                 <TableMotionRow
//                   key={row.name}
//                   layout
//                   initial={{ opacity: 0, scale: 0.8, y: -20 }}
//                   animate={{
//                     opacity: 1,
//                     scale: 1,
//                     y: 0,
//                   }}
//                   exit={{
//                     opacity: 0,
//                     scale: 0.8,
//                     x: -100,
//                     transition: { duration: 0.3 },
//                   }}
//                   transition={{
//                     layout: { type: "spring", stiffness: 300, damping: 30 },
//                     opacity: { duration: 0.2 },
//                     scale: { duration: 0.2 },
//                   }}
//                 >
//                   {columns.map((c: any) => (
//                     <TableCell key={c.title} className="pl-0 pr-6">
//                       {c.render ? c.render(c, row) : row[c.dataIndex]}
//                     </TableCell>
//                   ))}
//                 </TableMotionRow>
//               )
//             })}
//           </AnimatePresence>
//         </TableBody>
//       </Table>
