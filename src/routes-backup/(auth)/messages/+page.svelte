<script lang="ts">
  import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Plus } from 'lucide-svelte';
  import { Button, Input, Avatar, AvatarFallback, AvatarImage, Badge } from '$lib/components/ui';

  interface Conversation {
    id: number;
    name: string;
    role: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    online: boolean;
  }

  interface Message {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
    avatar?: string;
  }

  const conversations: Conversation[] = [
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
  ];

  const messages: Message[] = [
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
  ];

  let selectedConversation = $state(conversations[0]);
  let messageInput = $state("");
</script>

<svelte:head>
  <title>Messages - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Messages</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button size="sm">
      <Plus class="size-4" />
    </Button>
  </div>
</div>

<div class="flex h-[calc(100vh-4rem)]">
  <!-- Conversations List -->
  <div class="w-80 border-r border-border">
    <div class="border-b border-border p-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search conversations..." class="pl-9" />
      </div>
    </div>

    <div class="h-[calc(100vh-9rem)] overflow-y-auto">
      <div class="space-y-1 p-2">
        {#each conversations as conversation (conversation.id)}
          <button
            onclick={() => selectedConversation = conversation}
            class="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent {selectedConversation.id === conversation.id ? 'bg-accent' : ''}"
          >
            <div class="relative">
              <Avatar class="size-10">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                <AvatarFallback>{conversation.name[0]}</AvatarFallback>
              </Avatar>
              {#if conversation.online}
                <div class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500"></div>
              {/if}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate font-medium">{conversation.name}</p>
                <span class="text-xs text-muted-foreground">{conversation.timestamp}</span>
              </div>
              <p class="text-sm text-muted-foreground">{conversation.role}</p>
              <p class="truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
            </div>
            {#if conversation.unread > 0}
              <Badge class="size-5 items-center justify-center rounded-full p-0 text-xs">
                {conversation.unread}
              </Badge>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Chat Area -->
  <div class="flex flex-1 flex-col">
    <!-- Chat Header -->
    <div class="flex items-center justify-between border-b border-border p-4">
      <div class="flex items-center gap-3">
        <Avatar class="size-10">
          <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
          <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p class="font-medium">{selectedConversation.name}</p>
          <p class="text-sm text-muted-foreground">{selectedConversation.role}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <Phone class="size-5" />
        </Button>
        <Button size="icon" variant="ghost">
          <Video class="size-5" />
        </Button>
        <Button size="icon" variant="ghost">
          <MoreVertical class="size-5" />
        </Button>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-4">
        {#each messages as message (message.id)}
          <div class="flex gap-3 {message.isOwn ? 'flex-row-reverse' : ''}">
            {#if !message.isOwn}
              <Avatar class="size-8">
                <AvatarImage src={message.avatar || "/placeholder.svg"} />
                <AvatarFallback>{message.sender[0]}</AvatarFallback>
              </Avatar>
            {/if}
            <div class="flex flex-col gap-1 {message.isOwn ? 'items-end' : ''}">
              <div
                class="max-w-md rounded-2xl px-4 py-2 {message.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}"
              >
                <p class="text-sm">{message.content}</p>
              </div>
              <span class="text-xs text-muted-foreground">{message.timestamp}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Message Input -->
    <div class="border-t border-border p-4">
      <div class="flex items-end gap-2">
        <Button size="icon" variant="ghost">
          <Paperclip class="size-5" />
        </Button>
        <div class="flex-1">
          <Input
            placeholder="Type a message..."
            bind:value={messageInput}
            onkeydown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // Handle send message
                messageInput = "";
              }
            }}
            class="min-h-10"
          />
        </div>
        <Button size="icon" variant="ghost">
          <Smile class="size-5" />
        </Button>
        <Button size="icon">
          <Send class="size-5" />
        </Button>
      </div>
    </div>
  </div>
</div>