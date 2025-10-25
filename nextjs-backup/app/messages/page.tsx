"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Plus } from "lucide-react"
import { useState } from "react"

const conversations = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Wig Stylist",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "The wig is ready for pickup!",
    timestamp: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Team: Elden Ring Shoot",
    role: "Group Chat",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Alex: See you all at 10am tomorrow",
    timestamp: "15m ago",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Mike Photography",
    role: "Photographer",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I've uploaded the edited photos",
    timestamp: "1h ago",
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: "Emma Makeup",
    role: "Makeup Artist",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "What time should I arrive?",
    timestamp: "3h ago",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Cosplay Crafters",
    role: "Community Group",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Check out this new foam technique!",
    timestamp: "1d ago",
    unread: 5,
    online: false,
  },
]

const messages = [
  {
    id: 1,
    sender: "Sarah Chen",
    content: "Hi! I wanted to update you on the wig progress",
    timestamp: "10:30 AM",
    isOwn: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    sender: "You",
    content: "That's great! How's it looking?",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Sarah Chen",
    content: "Really good! I've styled it according to the reference photos you sent",
    timestamp: "10:33 AM",
    isOwn: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    sender: "Sarah Chen",
    content: "The wig is ready for pickup!",
    timestamp: "10:35 AM",
    isOwn: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [messageInput, setMessageInput] = useState("")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search messages..."
            notifications={[
              {
                title: "New message",
                description: "Sarah Chen sent you a message",
              },
            ]}
          >
            <Button size="sm">
              <Plus className="size-4" />
            </Button>
          </PageHeader>

          <div className="flex h-[calc(100vh-4rem)]">
            {/* Conversations List */}
            <div className="w-80 border-r border-border">
              <div className="border-b border-border p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-9" />
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-9rem)]">
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent ${
                        selectedConversation.id === conversation.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="size-10">
                          <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium">{conversation.name}</p>
                          <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{conversation.role}</p>
                        <p className="truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge className="size-5 items-center justify-center rounded-full p-0 text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex flex-1 flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedConversation.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedConversation.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost">
                    <Phone className="size-5" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Video className="size-5" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="size-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}>
                      {!message.isOwn && (
                        <Avatar className="size-8">
                          <AvatarImage src={message.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{message.sender[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col gap-1 ${message.isOwn ? "items-end" : ""}`}>
                        <div
                          className={`max-w-md rounded-2xl px-4 py-2 ${
                            message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-end gap-2">
                  <Button size="icon" variant="ghost">
                    <Paperclip className="size-5" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          // Handle send message
                          setMessageInput("")
                        }
                      }}
                      className="min-h-10"
                    />
                  </div>
                  <Button size="icon" variant="ghost">
                    <Smile className="size-5" />
                  </Button>
                  <Button size="icon">
                    <Send className="size-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
