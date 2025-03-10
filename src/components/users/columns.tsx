import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge" 
import { Coins, TrendingDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

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
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const { balance, totalSpent } = row.original;
      
      return (
        <div className="flex flex-col gap-1">
          <Badge 
            variant="outline" 
            className={cn(
              "w-fit font-medium",
              balance > 0 ? "border-primary/50 text-primary" : "border-muted-foreground"
            )}
          >
            <Coins className="h-3.5 w-3.5 mr-1.5" />
            {balance} TFC
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Spent: {totalSpent} TFC
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => {
      return new Date(row.original.joinedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
]