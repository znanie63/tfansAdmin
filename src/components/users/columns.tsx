import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "avatar",
    header: "",
    cell: ({ row }) => {
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.avatar} alt={row.original.username} />
        </Avatar>
      )
    },
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.original.joinedAt), { addSuffix: true })
    },
  },
]