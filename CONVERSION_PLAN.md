# React to Svelte Conversion Plan

Rebuilding everything from scratch to match `cosplay-tracker-react` exactly.

## Priority Order

### Phase 1: Core UI Components (Match React UI exactly)
1. ✅ InlineTextEditor - DONE
2. ✅ CreationFlyout - DONE  
3. ✅ CharacterCreationForm - DONE
4. ⏳ Tabs component (need to create)
5. ⏳ AppSidebar (need to rebuild)
6. ⏳ PageHeader (need to rebuild)
7. ⏳ IdeaCard - DONE

### Phase 2: Ideas Page
1. ⏳ Ideas page with exact React structure
2. ⏳ Integration with CreationFlyout

### Phase 3: All Other Pages
- Convert all app/*/page.tsx files systematically
- Match layout structure exactly

### Phase 4: All Feature Components
- Convert all components/*.tsx files
- Match styling exactly

## Notes
- Use Flowbite Svelte where possible, but match React styling exactly
- All Tailwind classes must match
- Component structure must match
- State management should use Svelte 5 runes

