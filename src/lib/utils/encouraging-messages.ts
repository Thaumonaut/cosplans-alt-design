/**
 * Encouraging Messages Utility
 * 
 * Generates positive, non-judgmental messages for task completions.
 * Designed for ADHD-friendly feedback that celebrates progress.
 */

const encouragingMessages = [
	// Achievement-focused
	"Great work! You got it done!",
	"Task complete! You're making progress!",
	"Another one checked off! Well done!",
	"You did it! Keep that momentum going!",
	
	// Effort-focused
	"Nice work sticking with it!",
	"You powered through! That's awesome!",
	"Look at you go! Task done!",
	"You showed up and got it done!",
	
	// Progress-focused
	"One step closer to your goal!",
	"Progress made! You're on a roll!",
	"Task complete! Every step counts!",
	"You're building momentum!",
	
	// Celebration-focused
	"Task complete! Time to celebrate!",
	"You did it! That deserves a moment!",
	"Another win! You're crushing it!",
	"Task done! You're doing great!",
	
	// Supportive
	"You got this done! That's no small thing!",
	"Task complete! Your effort shows!",
	"You made it happen! Well done!",
	"Look at what you accomplished!",
];

/**
 * Get a random encouraging message
 */
export function getEncouragingMessage(): string {
	const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
	return encouragingMessages[randomIndex];
}

/**
 * Get a contextual encouraging message based on task details
 */
export function getContextualMessage(taskTitle?: string, completedEarly?: boolean): string {
	if (completedEarly) {
		const earlyMessages = [
			"Done early! You're ahead of schedule!",
			"Finished ahead of time! That's impressive!",
			"Early completion! You're crushing it!",
		];
		return earlyMessages[Math.floor(Math.random() * earlyMessages.length)];
	}
	
	if (taskTitle && taskTitle.length > 0) {
		// Use task title for more personal messages
		const personalMessages = [
			`${taskTitle} is complete! Great job!`,
			`You finished ${taskTitle}! Well done!`,
			`${taskTitle} done! You made it happen!`,
		];
		return personalMessages[Math.floor(Math.random() * personalMessages.length)];
	}
	
	return getEncouragingMessage();
}


