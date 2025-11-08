<script lang="ts">
	import { 
		Button, Card, CardContent, CardDescription, CardHeader, CardTitle, 
		Input, Label, Badge, Select, Textarea, Checkbox, Switch, 
		Separator, Progress, Tabs, TabsList, TabsTrigger, TabsContent,
		Avatar, AvatarImage, AvatarFallback, Skeleton, LoadingSpinner
	} from '$lib/components/ui';
	import { getComponentsUsingVariable } from '$lib/utils/theme-variable-usage';

	interface Props {
		selectedVariable?: string;
		mode: 'light' | 'dark';
	}

	let { selectedVariable, mode }: Props = $props();

	const highlightedComponents = $derived(
		selectedVariable ? getComponentsUsingVariable(selectedVariable).map(u => u.componentId) : []
	);

	function isHighlighted(componentId: string): boolean {
		return highlightedComponents.includes(componentId);
	}
</script>

<div class="theme-preview space-y-6 p-4" style="background-color: var(--theme-section-bg);">
	<!-- Buttons -->
	<div class="space-y-2">
		<Label>Buttons</Label>
		<div class="flex flex-wrap gap-2">
			<button
				id="button-primary"
				class="px-4 py-2 rounded-md transition-colors {isHighlighted('button-primary') ? 'ring-2 ring-offset-2' : ''}"
				style="background-color: var(--theme-primary); color: var(--theme-card-bg); {isHighlighted('button-primary') ? '--tw-ring-color: var(--theme-accent);' : ''}"
				onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary-hover)'}
				onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary)'}
			>
				Primary Button
			</button>
			<button
				id="button-outline"
				class="px-4 py-2 rounded-md border transition-colors {isHighlighted('button-outline') ? 'ring-2 ring-offset-2' : ''}"
				style="border-color: var(--theme-border); color: var(--theme-foreground); {isHighlighted('button-outline') ? '--tw-ring-color: var(--theme-accent);' : ''}"
				onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover)'}
				onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			>
				Outline Button
			</button>
			<button
				id="button-ghost"
				class="px-4 py-2 rounded-md transition-colors {isHighlighted('button-ghost') ? 'ring-2 ring-offset-2' : ''}"
				style="color: var(--theme-foreground); {isHighlighted('button-ghost') ? '--tw-ring-color: var(--theme-accent);' : ''}"
				onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover)'}
				onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
			>
				Ghost Button
			</button>
		</div>
	</div>

	<!-- Cards -->
	<div class="space-y-2">
		<Label>Cards</Label>
		<div class="grid grid-cols-2 gap-4">
			<Card id="card" class={isHighlighted('card') ? 'ring-2 ring-offset-2' : ''} style={isHighlighted('card') ? '--tw-ring-color: var(--theme-accent);' : ''}>
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card description text</CardDescription>
				</CardHeader>
				<CardContent>
					<p class="text-sm" style="color: var(--theme-foreground);">This is card content with some text to demonstrate how the theme looks.</p>
				</CardContent>
			</Card>
			<Card id="card-nested" class={isHighlighted('card-nested') ? 'ring-2 ring-offset-2' : ''} style={isHighlighted('card-nested') ? '--tw-ring-color: var(--theme-accent);' : ''}>
				<CardHeader>
					<CardTitle>Nested Card</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="p-3 rounded-md" style="background-color: var(--theme-card-nested);">
						<p class="text-sm" style="color: var(--theme-foreground);">Nested card background</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- Inputs -->
	<div class="space-y-2">
		<Label>Inputs</Label>
		<div class="space-y-3">
			<Input id="input" placeholder="Text input" />
			<Input type="email" placeholder="Email input" />
			<Input disabled placeholder="Disabled input" />
		</div>
	</div>

	<!-- Text Hierarchy -->
	<div class="space-y-2">
		<Label>Text Hierarchy</Label>
		<div class="space-y-2">
			<h1 id="text-heading" class="text-3xl font-bold" style="color: var(--theme-foreground);">Heading 1</h1>
			<h2 class="text-2xl font-semibold" style="color: var(--theme-foreground);">Heading 2</h2>
			<p id="text-body" class="text-base" style="color: var(--theme-foreground);">Body text with normal weight</p>
			<p id="text-muted" class="text-sm" style="color: var(--theme-text-muted);">Muted text for secondary information</p>
			<p id="text-disabled" class="text-sm" style="color: var(--theme-text-disabled);">Disabled text</p>
		</div>
	</div>

	<!-- Semantic Colors -->
	<div class="space-y-2">
		<Label>Semantic Colors</Label>
		<div class="grid grid-cols-4 gap-2">
			<div id="badge-success" class="p-3 rounded-md text-sm text-center {isHighlighted('badge-success') ? 'ring-2 ring-offset-2' : ''}" style="background-color: var(--theme-success-bg); color: var(--theme-success); {isHighlighted('badge-success') ? '--tw-ring-color: var(--theme-accent);' : ''}">
				Success
			</div>
			<div id="badge-error" class="p-3 rounded-md text-sm text-center {isHighlighted('badge-error') ? 'ring-2 ring-offset-2' : ''}" style="background-color: var(--theme-error-bg); color: var(--theme-error); {isHighlighted('badge-error') ? '--tw-ring-color: var(--theme-accent);' : ''}">
				Error
			</div>
			<div id="badge-warning" class="p-3 rounded-md text-sm text-center {isHighlighted('badge-warning') ? 'ring-2 ring-offset-2' : ''}" style="background-color: var(--theme-warning-bg); color: var(--theme-warning); {isHighlighted('badge-warning') ? '--tw-ring-color: var(--theme-accent);' : ''}">
				Warning
			</div>
			<div id="badge-info" class="p-3 rounded-md text-sm text-center {isHighlighted('badge-info') ? 'ring-2 ring-offset-2' : ''}" style="background-color: var(--theme-info-bg); color: var(--theme-info); {isHighlighted('badge-info') ? '--tw-ring-color: var(--theme-accent);' : ''}">
				Info
			</div>
		</div>
	</div>

	<!-- Priority Badges -->
	<div class="space-y-2">
		<Label>Priority Badges</Label>
		<div class="flex gap-2">
			<div id="priority-low" class="px-3 py-1 rounded-md text-sm {isHighlighted('priority-low') ? 'ring-2 ring-offset-2' : ''}" style="background-color: var(--theme-priority-low-bg); color: var(--theme-priority-low-text); border: 1px solid var(--theme-priority-low-border); {isHighlighted('priority-low') ? '--tw-ring-color: var(--theme-accent);' : ''}">
				Low
			</div>
			<div id="priority-medium" class="px-3 py-1 rounded-md text-sm {isHighlighted('priority-medium') ? 'ring-2 ring-offset-2' : ''}" style="background-color: var(--theme-priority-medium-bg); color: var(--theme-priority-medium-text); border: 1px solid var(--theme-priority-medium-border); {isHighlighted('priority-medium') ? '--tw-ring-color: var(--theme-accent);' : ''}">
				Medium
			</div>
			<div id="priority-high" class="px-3 py-1 rounded-md text-sm {isHighlighted('priority-high') ? 'ring-2 ring-offset-2' : ''}" style="background-color: var(--theme-priority-high-bg); color: var(--theme-priority-high-text); border: 1px solid var(--theme-priority-high-border); {isHighlighted('priority-high') ? '--tw-ring-color: var(--theme-accent);' : ''}">
				High
			</div>
		</div>
	</div>

	<!-- Borders -->
	<div class="space-y-2">
		<Label>Borders</Label>
		<div class="space-y-2">
			<div class="p-3 rounded-md border" style="border-color: var(--theme-border);">
				Standard border
			</div>
			<div class="p-3 rounded-md border" style="border-color: var(--theme-border-subtle);">
				Subtle border
			</div>
			<div class="p-3 rounded-md border-2" style="border-color: var(--theme-border-strong);">
				Strong border
			</div>
		</div>
	</div>

	<!-- Forms -->
	<div class="space-y-2">
		<Label>Form Elements</Label>
		<Card>
			<CardContent class="pt-6 space-y-4">
				<div class="space-y-2">
					<Label for="preview-select">Select Dropdown</Label>
					<Select id="preview-select">
						<option value="option1">Option 1</option>
						<option value="option2">Option 2</option>
						<option value="option3">Option 3</option>
					</Select>
				</div>
				<div class="space-y-2">
					<Label for="preview-textarea">Textarea</Label>
					<Textarea id="preview-textarea" placeholder="Enter your message here..." rows="3" />
				</div>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<Checkbox id="preview-checkbox" />
						<Label for="preview-checkbox" class="cursor-pointer">Checkbox option</Label>
					</div>
					<div class="flex items-center gap-2">
						<Switch id="preview-switch" />
						<Label for="preview-switch" class="cursor-pointer">Toggle switch</Label>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Tables -->
	<div class="space-y-2">
		<Label>Tables</Label>
		<Card>
			<CardContent class="pt-6 p-0">
				<div class="overflow-x-auto">
					<table id="preview-table" class="w-full" style="border-color: var(--theme-border);">
						<thead>
							<tr style="border-bottom: 1px solid var(--theme-border); background-color: var(--theme-section-bg);">
								<th class="px-4 py-3 text-left text-sm font-semibold" style="color: var(--theme-foreground);">Name</th>
								<th class="px-4 py-3 text-left text-sm font-semibold" style="color: var(--theme-foreground);">Status</th>
								<th class="px-4 py-3 text-left text-sm font-semibold" style="color: var(--theme-foreground);">Priority</th>
								<th class="px-4 py-3 text-left text-sm font-semibold" style="color: var(--theme-foreground);">Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr style="border-bottom: 1px solid var(--theme-border);">
								<td class="px-4 py-3 text-sm" style="color: var(--theme-foreground);">Task Item 1</td>
								<td class="px-4 py-3">
									<Badge style="background-color: var(--theme-success-bg); color: var(--theme-success);">Active</Badge>
								</td>
								<td class="px-4 py-3">
									<span class="text-xs px-2 py-1 rounded" style="background-color: var(--theme-priority-high-bg); color: var(--theme-priority-high-text);">High</span>
								</td>
								<td class="px-4 py-3">
									<Button size="sm" variant="ghost">Edit</Button>
								</td>
							</tr>
							<tr style="border-bottom: 1px solid var(--theme-border); background-color: var(--theme-card-bg);">
								<td class="px-4 py-3 text-sm" style="color: var(--theme-foreground);">Task Item 2</td>
								<td class="px-4 py-3">
									<Badge style="background-color: var(--theme-warning-bg); color: var(--theme-warning);">Pending</Badge>
								</td>
								<td class="px-4 py-3">
									<span class="text-xs px-2 py-1 rounded" style="background-color: var(--theme-priority-medium-bg); color: var(--theme-priority-medium-text);">Medium</span>
								</td>
								<td class="px-4 py-3">
									<Button size="sm" variant="ghost">Edit</Button>
								</td>
							</tr>
							<tr>
								<td class="px-4 py-3 text-sm" style="color: var(--theme-foreground);">Task Item 3</td>
								<td class="px-4 py-3">
									<Badge style="background-color: var(--theme-error-bg); color: var(--theme-error);">Completed</Badge>
								</td>
								<td class="px-4 py-3">
									<span class="text-xs px-2 py-1 rounded" style="background-color: var(--theme-priority-low-bg); color: var(--theme-priority-low-text);">Low</span>
								</td>
								<td class="px-4 py-3">
									<Button size="sm" variant="ghost">Edit</Button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Tabs -->
	<div class="space-y-2">
		<Label>Tabs</Label>
		<Card>
			<CardContent class="pt-6">
				<Tabs defaultValue="tab1" class="w-full">
					<TabsList class="grid w-full grid-cols-3">
						<TabsTrigger value="tab1">Tab 1</TabsTrigger>
						<TabsTrigger value="tab2">Tab 2</TabsTrigger>
						<TabsTrigger value="tab3">Tab 3</TabsTrigger>
					</TabsList>
					<TabsContent value="tab1" class="mt-4">
						<p class="text-sm" style="color: var(--theme-foreground);">Content for tab 1 with some example text.</p>
					</TabsContent>
					<TabsContent value="tab2" class="mt-4">
						<p class="text-sm" style="color: var(--theme-foreground);">Content for tab 2 with different information.</p>
					</TabsContent>
					<TabsContent value="tab3" class="mt-4">
						<p class="text-sm" style="color: var(--theme-foreground);">Content for tab 3 with more details.</p>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	</div>

	<!-- Progress & Loading -->
	<div class="space-y-2">
		<Label>Progress & Loading States</Label>
		<Card>
			<CardContent class="pt-6 space-y-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span style="color: var(--theme-foreground);">Progress Bar</span>
						<span style="color: var(--theme-text-muted);">60%</span>
					</div>
					<Progress value={60} />
				</div>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<LoadingSpinner />
						<span class="text-sm" style="color: var(--theme-foreground);">Loading state</span>
					</div>
				</div>
				<div class="space-y-2">
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-4 w-1/2" />
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Lists -->
	<div class="space-y-2">
		<Label>Lists</Label>
		<Card>
			<CardContent class="pt-6">
				<ul class="space-y-2">
					<li class="flex items-center gap-2 text-sm" style="color: var(--theme-foreground);">
						<span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--theme-primary);"></span>
						List item 1
					</li>
					<li class="flex items-center gap-2 text-sm" style="color: var(--theme-foreground);">
						<span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--theme-primary);"></span>
						List item 2
					</li>
					<li class="flex items-center gap-2 text-sm" style="color: var(--theme-text-muted);">
						<span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--theme-text-muted);"></span>
						List item 3 (muted)
					</li>
				</ul>
				<Separator class="my-4" />
				<ol class="space-y-2 list-decimal list-inside">
					<li class="text-sm" style="color: var(--theme-foreground);">Ordered list item 1</li>
					<li class="text-sm" style="color: var(--theme-foreground);">Ordered list item 2</li>
					<li class="text-sm" style="color: var(--theme-foreground);">Ordered list item 3</li>
				</ol>
			</CardContent>
		</Card>
	</div>

	<!-- Avatars & Badges -->
	<div class="space-y-2">
		<Label>Avatars & Badges</Label>
		<Card>
			<CardContent class="pt-6">
				<div class="flex items-center gap-4">
					<Avatar>
						<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" />
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" alt="User" />
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarFallback>AB</AvatarFallback>
					</Avatar>
				</div>
				<div class="flex items-center gap-2 mt-4">
					<Badge>Default Badge</Badge>
					<Badge style="background-color: var(--theme-primary); color: var(--theme-card-bg);">Primary</Badge>
					<Badge style="background-color: var(--theme-success-bg); color: var(--theme-success);">Success</Badge>
					<Badge style="background-color: var(--theme-error-bg); color: var(--theme-error);">Error</Badge>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Interactive States -->
	<div class="space-y-2">
		<Label>Interactive States</Label>
		<Card>
			<CardContent class="pt-6 space-y-3">
				<div class="space-y-2">
					<Label>Hover States</Label>
					<div class="flex gap-2">
						<Button variant="default">Hover me</Button>
						<Button variant="outline">Hover me</Button>
						<Button variant="ghost">Hover me</Button>
					</div>
				</div>
				<div class="space-y-2">
					<Label>Focus States</Label>
					<Input placeholder="Click to focus" />
				</div>
				<div class="space-y-2">
					<Label>Disabled States</Label>
					<div class="flex gap-2">
						<Button disabled>Disabled Button</Button>
						<Input disabled placeholder="Disabled input" />
						<Checkbox disabled />
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>

