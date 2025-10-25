import { getContext, setContext } from 'svelte';

interface SidebarContext {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SIDEBAR_CONTEXT_KEY = 'sidebar';

export function setSidebarContext(context: SidebarContext) {
  setContext(SIDEBAR_CONTEXT_KEY, context);
}

export function getSidebarContext(): SidebarContext {
  const context = getContext<SidebarContext>(SIDEBAR_CONTEXT_KEY);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}