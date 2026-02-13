# Gator Scholars

Browse, filter, and save University of Florida faculty scholars. Built with **Next.js** and **MongoDB Atlas**.

## Features

- **Search & Filter** — by name, relevance score, grants, department, position, CS requirements
- **Scholar Detail Modal** — full profile with grants, publications, and analysis reasoning
- **Saved List** — add scholars, export as CSV/JSON, copy email prompts
- **Pagination** — 25 scholars per page, served on demand from MongoDB

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB Atlas (`ufl_scholars_db`, 6231 docs) |
| Frontend | React 19, client components |
| API | Next.js Route Handlers |

## Getting Started

```bash
# Install dependencies
npm install

# Create .env.local with your MongoDB connection string
echo "MONGODB_URI=your_connection_string" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scholars` | Paginated + filtered list (card-level fields) |
| GET | `/api/scholars/filters` | Distinct departments & positions |
| GET | `/api/scholars/:id` | Full scholar detail |
| POST | `/api/scholars/batch` | Full data for multiple IDs |

## Project Structure

```
src/
├── app/
│   ├── layout.jsx              # Root layout
│   ├── page.jsx                # Main search page
│   ├── globals.css             # Base styles
│   ├── App.css                 # Component styles
│   ├── list/
│   │   └── page.jsx            # Saved scholars list
│   └── api/scholars/
│       ├── route.js            # GET /api/scholars
│       ├── filters/route.js    # GET /api/scholars/filters
│       ├── batch/route.js      # POST /api/scholars/batch
│       └── [id]/route.js       # GET /api/scholars/:id
└── lib/
    ├── db.js                   # MongoDB connection (cached)
    └── api.js                  # Frontend API service
```
