# Migration Guide: JSON to Database

This guide explains how to migrate from the JSON-based level system to a database-driven content management system.

## What Changed

### 1. Database Schema
- **New tables**: `themes`, `levels`, `exercises`
- **Relations**: themes → levels → exercises (one-to-many)
- **User ownership**: Each theme is owned by a user

### 2. Data Structure
- **IDs changed**: From strings to auto-incrementing integers
- **Null handling**: Description fields can now be null
- **User association**: Themes are linked to users

### 3. API Functions
All functions in `src/lib/levels.ts` are now async:
- `getAllThemes()` → `getAllThemes(): Promise<Theme[]>`
- `getLevelById(id)` → `getLevelById(id: number): Promise<Level | undefined>`
- etc.

### 4. New Features
- **CRUD API endpoints**: `/api/themes`, `/api/levels`, `/api/exercises`
- **Admin interface**: `/admin` page for content management
- **User ownership**: Only theme owners can edit their content

## Migration Steps

### 1. Update Database Schema
```bash
# Generate and run migrations
bun run db:generate
bun run db:migrate
```

### 2. Migrate Existing Data
```bash
# Run the data migration script
bun run migrate:data
```

This script will:
- Create a default admin user (`admin@skyromat.sk`)
- Import all themes, levels, and exercises from the JSON file
- Assign ownership to the admin user

### 3. Update Your Components
If you have custom components using the level functions, update them to handle async:

```typescript
// Before
const themes = getAllThemes();

// After
const themes = await getAllThemes();
```

### 4. Test the Migration
1. Start your development server: `bun run dev`
2. Check that existing levels still work
3. Visit `/admin` to test content creation
4. Verify API endpoints work

## API Endpoints

### Themes
- `GET /api/themes` - List all themes
- `POST /api/themes` - Create new theme
- `GET /api/themes/[id]` - Get specific theme
- `PUT /api/themes/[id]` - Update theme
- `DELETE /api/themes/[id]` - Delete theme

### Levels
- `GET /api/levels` - List all levels
- `POST /api/levels` - Create new level
- `GET /api/levels/[id]` - Get specific level
- `PUT /api/levels/[id]` - Update level
- `DELETE /api/levels/[id]` - Delete level

### Exercises
- `GET /api/exercises` - List all exercises
- `POST /api/exercises` - Create new exercise
- `GET /api/exercises/[id]` - Get specific exercise
- `PUT /api/exercises/[id]` - Update exercise
- `DELETE /api/exercises/[id]` - Delete exercise

## Admin Interface

Visit `/admin` to:
- View and manage themes, levels, and exercises
- Create new content with forms
- Edit existing content (only your own)

## Security Notes

- **Authentication required**: All API endpoints require user authentication
- **Ownership-based permissions**: Users can only edit content they created
- **Admin user**: The migration creates an admin user for managing migrated content

## Troubleshooting

### Migration Fails
- Check database connection in `.env`
- Ensure database schema is up to date
- Verify user permissions

### API Errors
- Check authentication (user must be logged in)
- Verify ownership (user must own the content)
- Check request format (JSON body required)

### Type Errors
- Update interface imports if using custom types
- Handle null values in description fields
- Use number IDs instead of string IDs

## Next Steps

After migration:
1. Remove `src/data/levels.json` (optional, keep as backup)
2. Update any hardcoded ID references
3. Add role-based permissions if needed
4. Customize the admin interface
5. Add validation for content creation

## Rollback

If you need to rollback:
1. Restore the original `src/lib/levels.ts`
2. Keep using the JSON file
3. Remove the new database tables