export interface MockStage {
	id: string;
	name: string;
	color?: string;
}

export interface MockTask {
	id: string;
	title: string;
	description?: string;
	status_id: string;
	priority: 'low' | 'medium' | 'high';
	due_date?: string | null;
}

export const mockStages: MockStage[] = [
	{ id: '1', name: 'To Do', color: '#3b82f6' },
	{ id: '2', name: 'In Progress', color: '#f59e0b' },
	{ id: '3', name: 'Review', color: '#8b5cf6' },
	{ id: '4', name: 'Done', color: '#10b981' }
];

export const mockTasks: MockTask[] = [
	{ id: 't1', title: 'Design character concept', description: 'Create initial character design sketches', status_id: '1', priority: 'high' },
	{ id: 't2', title: 'Research materials', description: 'Find suppliers for fabric and foam', status_id: '1', priority: 'medium' },
	{ id: 't3', title: 'Order materials', description: 'Purchase fabric, foam, and tools', status_id: '1', priority: 'high' },
	{ id: 't4', title: 'Cut fabric patterns', description: 'Cut out all fabric pieces', status_id: '2', priority: 'medium' },
	{ id: 't5', title: 'Sew base garment', description: 'Construct the base costume piece', status_id: '2', priority: 'high' },
	{ id: 't6', title: 'Shape foam armor', description: 'Heat form and shape EVA foam pieces', status_id: '2', priority: 'medium' },
	{ id: 't7', title: 'Prime and paint', description: 'Prime foam and apply base paint', status_id: '3', priority: 'low' },
	{ id: 't8', title: 'Add weathering effects', description: 'Apply weathering and detail painting', status_id: '3', priority: 'low' },
	{ id: 't9', title: 'Final assembly', description: 'Attach all pieces together', status_id: '4', priority: 'high' },
	{ id: 't10', title: 'Photoshoot prep', description: 'Prepare for photoshoot', status_id: '4', priority: 'medium' }
];

