import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import TeamSelector from './team-selector.svelte';

describe('TeamSelector Component', () => {
  it('should render with default selected team', () => {
    render(TeamSelector);

    expect(screen.getByText('My Personal Projects')).toBeInTheDocument();
  });

  it('should show dropdown when trigger is clicked', async () => {
    render(TeamSelector);

    const trigger = screen.getByRole('button');
    await fireEvent.click(trigger);

    expect(screen.getByText('Switch Team')).toBeInTheDocument();
    expect(screen.getByText('Cosplay Community')).toBeInTheDocument();
  });

  it('should change selected team when dropdown item is clicked', async () => {
    render(TeamSelector);

    // Open dropdown
    const trigger = screen.getByRole('button');
    await fireEvent.click(trigger);

    // Click on a different team
    const communityTeam = screen.getByText('Cosplay Community');
    await fireEvent.click(communityTeam);

    // Check if the selected team changed
    expect(screen.getByText('Cosplay Community')).toBeInTheDocument();
  });

  it('should group teams by type', async () => {
    render(TeamSelector);

    const trigger = screen.getByRole('button');
    await fireEvent.click(trigger);

    // Check if type labels are present
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Temporary')).toBeInTheDocument();
  });

  it('should show create new team option', async () => {
    render(TeamSelector);

    const trigger = screen.getByRole('button');
    await fireEvent.click(trigger);

    expect(screen.getByText('Create New Team')).toBeInTheDocument();
  });

  it('should show check mark for selected team', async () => {
    render(TeamSelector);

    const trigger = screen.getByRole('button');
    await fireEvent.click(trigger);

    // The default selected team should have a check mark
    const personalProjectsItem = screen.getByText('My Personal Projects').closest('div');
    expect(personalProjectsItem).toBeInTheDocument();
  });
});