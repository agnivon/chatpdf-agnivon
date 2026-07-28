# 📄 ChatPDF

A full-stack AI-powered chatbot that lets you **chat with your PDF documents** using Retrieval Augmented Generation (RAG). Upload one or more PDFs, and ask questions — the AI will answer based on the content of your documents.

Built with **Next.js 15**, **LangChain**, **OpenAI**, **Pinecone**, and **Neon PostgreSQL**.

---

## ✨ Features

- **📤 Multi-PDF Upload** — Upload up to 20 PDFs (5 in production) per chat session via drag-and-drop
- **💬 Conversational RAG** — Context-aware Q&A with chat history support, powered by LangChain
- **📖 In-App PDF Viewer** — Read your uploaded PDFs side-by-side with the chat interface
- **🔄 Streaming Responses** — Real-time streamed AI responses for a smooth conversational experience
- **🔐 Authentication** — Secure user authentication and session management via Clerk
- **☁️ Cloud Storage** — PDF files stored in AWS S3 with automatic URL generation
- **🧠 Vector Search** — Document embeddings stored in Pinecone for semantic similarity retrieval
- **🗂️ Chat Management** — Create, browse, and delete chat sessions with a sidebar navigation
- **📱 Resizable Panels** — Adjustable layout with resizable sidebar, chat, and document viewer panels
- **🌙 Dark Mode** — Dark theme enabled by default with a polished UI built on shadcn/ui
- **🔑 BYO API Key** — Users provide their own OpenAI API key, stored locally in the browser
- **⚡ Edge Runtime Support** — Alternative edge-compatible chat route for faster response times

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Next.js API      │────▶│   OpenAI     │
│  (React 19)  │     │  Routes           │     │  (GPT-4o-mini│
│              │     │                    │     │  + Embeddings│
└──────────────┘     └──────────────────┘     └──────────────┘
                            │    │
                   ┌────────┘    └────────┐
                   ▼                      ▼
            ┌──────────────┐       ┌──────────────┐
            │   Pinecone   │       │  Neon (PG)   │
            │  Vector DB   │       │  (Drizzle)   │
            └──────────────┘       └──────────────┘
                                          │
                                   ┌──────┘
                                   ▼
                            ┌──────────────┐
                            │    AWS S3     │
                            │  (PDF Files) │
                            └──────────────┘
```

### RAG Pipeline

1. **Upload** — PDFs are uploaded to AWS S3 and stored as documents in the database
2. **Ingest** — PDFs are downloaded, parsed via `PDFLoader`, and split into chunks (`RecursiveCharacterTextSplitter` with 1000 char chunks and 200 char overlap)
3. **Embed** — Chunks are embedded using OpenAI's `text-embedding-3-small` model (384 dimensions)
4. **Store** — Embeddings are upserted into a Pinecone vector index namespaced by chat ID
5. **Query** — User questions are contextualized using chat history, embedded, and used for similarity search
6. **Answer** — Retrieved context is injected into a prompt and sent to `gpt-4o-mini` for a streamed response

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org/) | React framework with App Router & Turbopack |
| [React 19](https://react.dev/) | UI library |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | Radix-based component library |
| [TanStack Query](https://tanstack.com/query) | Server state management & data fetching |
| [Zustand](https://zustand-demo.pmnd.rs/) | Client state management (with Immer middleware) |
| [Lucide React](https://lucide.dev/) | Icon library |
| [react-dropzone](https://react-dropzone.js.org/) | File upload with drag-and-drop |
| [@react-pdf-viewer](https://react-pdf-viewer.dev/) | In-app PDF rendering |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering for chat messages |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | Resizable layout panels |
| [Vercel AI SDK](https://sdk.vercel.ai/) | Streaming chat utilities |

### Backend
| Technology | Purpose |
|---|---|
| [LangChain](https://langchain.com/) | RAG orchestration, document loading, text splitting, and chain composition |
| [OpenAI](https://openai.com/) | Chat model (`gpt-4o-mini`) and embeddings (`text-embedding-3-small`) |
| [Pinecone](https://www.pinecone.io/) | Vector database for document embeddings |
| [Neon](https://neon.tech/) | Serverless PostgreSQL database |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL ORM with migrations |
| [AWS S3](https://aws.amazon.com/s3/) | PDF file storage |
| [Clerk](https://clerk.com/) | Authentication & user management |
| [Zod](https://zod.dev/) | Runtime schema validation for API requests |

---

## 📁 Project Structure

```
chatpdf/
├── drizzle/                    # Database migrations
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/           # Chat API routes (create, messages, delete)
│   │   │   │   ├── create/     # POST — Create new chat + ingest PDFs
│   │   │   │   ├── [chatId]/   # GET/DELETE — Chat operations
│   │   │   │   ├── rs/         # Response streaming
│   │   │   │   └── route.ts    # POST — Send message (LangChain streaming)
│   │   │   ├── chats/          # GET — List all user chats
│   │   │   ├── edge/
│   │   │   │   └── chat/       # POST — Edge runtime chat route (OpenAI direct)
│   │   │   └── s3/
│   │   │       ├── upload/     # POST — Upload file to S3
│   │   │       └── [fileKey]/  # GET — Download file from S3
│   │   ├── chat/[chatId]/      # Chat page (dynamic route)
│   │   ├── chats/              # Chats listing page
│   │   ├── sign-in/            # Clerk sign-in page
│   │   ├── sign-up/            # Clerk sign-up page
│   │   ├── globals.css         # Global styles & CSS variables
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── context/            # React context providers (Clerk, QueryClient, etc.)
│   │   ├── feature/
│   │   │   ├── chat/           # ChatComponent, ChatMessageList, ChatSidebar
│   │   │   ├── openai/         # OpenAI API key entry dialog
│   │   │   ├── DocumentViewer.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── global/             # Shared components (RenderIf, etc.)
│   │   ├── layout/             # RootLayout with Inter font
│   │   ├── page/               # Page-level components (HomePage, ChatPage, ChatsPage)
│   │   └── ui/                 # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── config/
│   │   ├── env.config.ts       # Environment variable exports & validation
│   │   └── metadata.config.ts  # SEO metadata configuration
│   ├── constants/              # Route & validation constants
│   ├── context/                # Chat context
│   ├── hooks/
│   │   ├── chat/               # useVercelChat, useDeleteChatUtils
│   │   └── data/               # useCreateChat, useGetChats, useGetMessages, etc.
│   ├── lib/
│   │   ├── chroma/             # ChromaDB vector store (alternative)
│   │   ├── db/                 # Drizzle ORM setup & schema
│   │   ├── langchain/          # LangChain config, prompts, chains, document processing
│   │   ├── pinecone/           # Pinecone client & vector operations
│   │   ├── s3.ts               # AWS S3 upload, download, delete utilities
│   │   └── utils.ts            # Shared utility functions
│   ├── middleware.ts           # Clerk auth middleware
│   ├── store/                  # Zustand store (API key, UI state)
│   └── types/                  # TypeScript type definitions
├── drizzle.config.ts           # Drizzle Kit configuration
├── migrate.mjs                 # Database migration script
├── next.config.ts              # Next.js configuration
├── package.json
├── tsconfig.json
└── yarn.lock
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Yarn](https://yarnpkg.com/) v4 (Corepack-enabled)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [Pinecone](https://www.pinecone.io/) account and index
- A [Neon](https://neon.tech/) PostgreSQL database
- An [AWS S3](https://aws.amazon.com/s3/) bucket
- A [Clerk](https://clerk.com/) application

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/agnivon/chatpdf.git
   cd chatpdf
   ```

2. **Enable Corepack and install dependencies**

   ```bash
   corepack enable
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root (see [Environment Variables](#-environment-variables) below).

4. **Run database migrations**

   ```bash
   yarn migrate-pg
   ```

5. **Start the development server**

   ```bash
   yarn dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-bucket-name
S3_BUCKET_REGION=your-region

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name

# OpenAI (optional — users provide their own key via the UI)
OPENAI_API_KEY=your_openai_api_key

# RAG Server
NEXT_PUBLIC_RAG_SERVER_HOST=http://localhost:5000

# LangChain
LANGCHAIN_CALLBACKS_BACKGROUND=true
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `yarn dev` | Start development server with Turbopack |
| `yarn build` | Build for production and run migrations |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn check` | Run lint + TypeScript type checking |
| `yarn generate-pg` | Generate Drizzle migration files |
| `yarn migrate-pg` | Run database migrations |
| `yarn push-pg` | Push schema changes to DB (no migration file) |
| `yarn pull-pg` | Introspect DB and generate schema |
| `yarn studio` | Open Drizzle Studio (DB GUI) |

---

## 🗃️ Database Schema

The application uses three main tables managed by Drizzle ORM:

### `chats`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated chat ID |
| `user_id` | VARCHAR(256) | Clerk user ID |
| `status` | ENUM | `initializing` / `live` / `failed` |
| `created_at` | TIMESTAMP | Creation timestamp |

### `documents`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated document ID |
| `chat_id` | UUID (FK → chats) | Parent chat (cascade delete) |
| `name` | TEXT | Original filename |
| `url` | TEXT | S3 public URL |
| `file_key` | TEXT | S3 object key |
| `file_type` | TEXT | MIME type |
| `created_at` | TIMESTAMP | Creation timestamp |

### `messages`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated message ID |
| `chat_id` | UUID (FK → chats) | Parent chat (cascade delete) |
| `content` | TEXT | Message content |
| `role` | ENUM | `system` / `user` / `assistant` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

## 🔌 API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/chat/create` | Create a new chat and ingest uploaded PDFs |
| `POST` | `/api/chat` | Send a message and get a streamed AI response (LangChain) |
| `POST` | `/api/edge/chat` | Send a message via edge runtime (OpenAI direct) |
| `GET` | `/api/chat/[chatId]` | Get chat details and status |
| `DELETE` | `/api/chat/[chatId]` | Delete a chat and associated data |
| `GET` | `/api/chats` | List all chats for the authenticated user |
| `POST` | `/api/s3/upload` | Upload a PDF file to S3 |
| `GET` | `/api/s3/[fileKey]` | Download a file from S3 |

---

## 🧩 What is RAG?

**Retrieval Augmented Generation (RAG)** is a technique for augmenting LLM knowledge with additional data.

LLMs can reason about wide-ranging topics, but their knowledge is limited to the public data up to a specific point in time that they were trained on. If you want to build AI applications that can reason about **private data** or data introduced after a model's cutoff date, you need to augment the knowledge of the model with the specific information it needs.

The process of bringing the appropriate information and inserting it into the model prompt is known as Retrieval Augmented Generation (RAG).

**How it works in ChatPDF:**

1. **Load** — PDF documents are loaded and parsed into text
2. **Split** — Text is split into overlapping chunks for granular retrieval
3. **Embed** — Each chunk is converted into a vector embedding
4. **Store** — Embeddings are stored in a vector database (Pinecone)
5. **Retrieve** — User questions are embedded and used to find the most relevant chunks
6. **Generate** — Retrieved chunks are provided as context to the LLM for answer generation

---

## 🚢 Deployment

This application is designed to be deployed on [Vercel](https://vercel.com/):

1. Push your repository to GitHub
2. Import the project in Vercel
3. Configure all environment variables in the Vercel dashboard
4. Deploy — Vercel will automatically run `next build` and `node migrate.mjs`

> **Note:** The edge runtime chat route (`/api/edge/chat`) is compatible with Vercel Edge Functions for lower latency responses.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Agnivo Neogi**
