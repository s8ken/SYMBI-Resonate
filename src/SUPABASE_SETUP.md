# Supabase Setup Guide for SYMBI Synergy

This guide will help you set up Supabase for the SYMBI Synergy AI Collaboration Analytics Platform.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

You can find these values in your Supabase project dashboard under Settings > API.

### 2. Database Schema

Run the SQL script located in `/database/schema.sql` in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the script

This will create:
- `conversations` table (renamed to `collaborations` for SYMBI Synergy)
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Helper functions for statistics

### 3. Authentication (Optional)

If you want to add user authentication:

1. Enable authentication providers in Supabase Auth settings
2. Configure sign-in methods (Email, Google, GitHub, etc.)
3. Update the collaboration service to include user context

### 4. Storage (Optional)

For file uploads larger than the textarea limit:

1. Create a storage bucket called "collaboration-files"
2. Set up appropriate policies for file access
3. Update the file upload handler to use Supabase Storage

## Features Enabled

### ✅ Real-time Updates
- Collaborations automatically sync across browser tabs
- Live status updates when collaborations are processed
- Real-time synergy analysis results

### ✅ Persistent Storage
- All collaborations saved to PostgreSQL database
- Automatic timestamps and metadata tracking
- Search and filtering capabilities

### ✅ Data Security
- Row Level Security (RLS) enabled
- User-based access control
- Secure API endpoints

### ✅ Performance Optimizations
- Database indexes for fast queries
- Efficient search with full-text search
- Paginated results for large datasets

## API Examples

### Manual Testing

You can test the API directly from your browser console:

```javascript
// Import the service
import { ConversationsService } from './lib/conversations'

// Create a collaboration
const newCollab = await ConversationsService.createConversation({
  title: "AI Partnership Strategy",
  model: "OpenAI GPT-4",
  content: "User: Let's discuss synergy...\nAssistant: I'd be happy to collaborate..."
})

// Get all collaborations
const collaborations = await ConversationsService.getConversations()

// Search collaborations
const results = await ConversationsService.searchConversations("Partnership")
```

### cURL Examples

```bash
# Get collaborations (requires authentication)
curl -X GET 'https://your-project.supabase.co/rest/v1/conversations' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-jwt-token"

# Create collaboration
curl -X POST 'https://your-project.supabase.co/rest/v1/conversations' \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SYMBI Partnership Test",
    "model": "Claude 3",
    "content": "Test collaboration content"
  }'
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure `.env.local` is in the project root
   - Restart your development server after adding variables
   - Check that variable names start with `VITE_`

2. **Database connection errors**
   - Verify your Supabase URL and API key
   - Check that the database schema has been applied
   - Ensure RLS policies are correctly configured

3. **Real-time updates not working**
   - Check browser console for WebSocket errors
   - Verify that real-time is enabled in Supabase settings
   - Ensure the subscription is properly set up

### Support

For additional help:
- Check the [Supabase documentation](https://supabase.com/docs)
- Visit the [Supabase Discord community](https://discord.supabase.com)
- Review the browser console for detailed error messages

## Next Steps

1. **Add Authentication**: Implement user sign-up/sign-in for SYMBI users
2. **File Upload**: Add support for larger collaboration file uploads using Supabase Storage
3. **Analytics**: Create synergy dashboard views using the collaboration data
4. **AI Integration**: Connect to actual LLM APIs for real synergy analysis
5. **Export Features**: Implement collaboration data export functionality

## SYMBI Synergy Vision

SYMBI Synergy focuses on collaborative AI analytics, measuring how well brands and organizations work together with AI systems to create mutual value and enhanced outcomes. The platform tracks:

- **Synergy Scores**: How well your brand collaborates with AI models
- **Collaboration Quality**: The effectiveness of AI partnerships
- **Integration Success**: Seamless working relationships with AI systems
- **Partnership Analytics**: Data-driven insights into AI collaboration potential