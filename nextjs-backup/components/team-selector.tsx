"use client"

import { useState } from "react"
import { Check, ChevronDown, Users, Lock, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TeamType = "personal" | "public" | "temp"

interface Team {
  id: string
  name: string
  type: TeamType
}

const teams: Team[] = [
  { id: "1", name: "My Personal Projects", type: "personal" },
  { id: "2", name: "Cosplay Community", type: "public" },
  { id: "3", name: "Convention Group 2024", type: "temp" },
  { id: "4", name: "Photo Collab Team", type: "temp" },
]

const typeIcons = {
  personal: Lock,
  public: Globe,
  temp: Users,
}

const typeLabels = {
  personal: "Personal",
  public: "Public",
  temp: "Temporary",
}

export function TeamSelector() {
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0])

  const Icon = typeIcons[selectedTeam.type]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent">
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{selectedTeam.name}</span>
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(
          teams.reduce(
            (acc, team) => {
              if (!acc[team.type]) acc[team.type] = []
              acc[team.type].push(team)
              return acc
            },
            {} as Record<TeamType, Team[]>,
          ),
        ).map(([type, teamList]) => {
          const TypeIcon = typeIcons[type as TeamType]
          return (
            <div key={type}>
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                <TypeIcon className="size-3" />
                {typeLabels[type as TeamType]}
              </DropdownMenuLabel>
              {teamList.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{team.name}</span>
                  {selectedTeam.id === team.id && <Check className="size-4 shrink-0" />}
                </DropdownMenuItem>
              ))}
            </div>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Users className="mr-2 size-4" />
          Create New Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
