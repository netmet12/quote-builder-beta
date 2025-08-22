# Quote Builder Beta

## Overview
A Next.js application for building custom quotes for doors and hardware products. The app provides an interactive, step-by-step configuration interface for customers to select product types and customize their orders.

## Architecture

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks with local storage persistence
- **UI Components**: Custom components with Radix UI primitives

### Backend
- **Database**: Supabase PostgreSQL with real-time capabilities
- **API**: Next.js API routes for quote submission
- **Rules Engine**: JSON-based configuration system with conditional logic

## Key Features

### Product Configuration
- **Product Types**: Metal doors, wood doors, building doors, frames, hardware, lite kits, louvers
- **Dynamic Sections**: Step-by-step configuration based on product type
- **Conditional Logic**: Options appear/hide based on previous selections
- **Visual Progress**: Progress bar and completion tracking

### User Experience
- **Responsive Design**: Works on desktop and mobile
- **Iframe Support**: Can be embedded in other websites with height auto-adjustment
- **URL State**: Sharable URLs with current configuration
- **Local Storage**: Automatic save/restore of quote progress

### Quote Management
- **Real-time Validation**: Immediate feedback on selection conflicts
- **Price Calculation**: Dynamic pricing based on selections
- **Quote Summary**: Sidebar with current selections and pricing
- **Export**: Submit quotes via API endpoint

## File Structure

```
/
├── app/
│   ├── page.jsx                    # Home page component
│   ├── layout.jsx                  # Root layout
│   └── api/submit-quote/route.js   # Quote submission API
├── components/
│   ├── SimpleQuoteBuilder.jsx      # Main quote builder interface
│   └── layouts/
│       ├── OptionGrid.jsx          # Grid layout for multi-select options
│       └── RadioGroup.jsx          # Radio button layout for single-select
├── hooks/
│   ├── useSupabaseQuote.js         # Quote state management hook
│   └── useSimpleQuote.js           # Alternative simple quote hook
└── lib/
    ├── data-final.json             # Product configuration data
    ├── supabase-config.js          # Configuration helpers
    ├── supabase-config-helpers.js  # Business logic helpers
    └── supabase-*.js               # Database utilities
```

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Configuration System

The app uses a JSON-based configuration system (`data-final.json`) that defines:
- Product types and descriptions
- Section configurations with options
- Conditional logic for showing/hiding options
- Pricing rules and calculations

## Database Integration

Uses Supabase for:
- Storing quote configurations
- Managing product data
- Real-time updates
- User session management

## Embedding

The quote builder can be embedded as an iframe with automatic height adjustment and parent window communication for quote submission events.

## Technical Dependencies

- **UI**: Radix UI, Lucide React icons
- **Database**: Supabase client
- **Rules**: JSON Rules Engine
- **Styling**: Tailwind CSS with custom animations
- **Build**: Next.js with PostCSS and Autoprefixer