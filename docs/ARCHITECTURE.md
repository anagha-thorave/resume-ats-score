# ResumeIQ — Architecture & Request Flow

ResumeIQ is an enterprise-grade AI Resume Parser and ATS (Applicant Tracking System) Compatibility Scoring Platform built with a high-performance Python FastAPI backend and a responsive React frontend.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    User["👤 Candidate / User Browser"]
    
    subgraph Frontend ["Next.js / React Frontend (:3000 / SPA)"]
        UI["Modern UI Design System"]
        Gauge["Circular ATS Score Gauge"]
        Editor["Structured Resume Editor & Live A4 Preview"]
        Chips["Skill Chips & Gap Additions"]
        Comp["Before/After Comparison Modal"]
    end

    subgraph Backend ["FastAPI Application (:8000)"]
        API["REST API Router (/api/*)"]
        
        subgraph Parsers ["Parsing & Extraction Layer"]
            PDFP["pdfplumber / pypdf Parser"]
            DOCXP["python-docx Parser"]
            NLP["Entity & Section Extractor"]
        end
        
        subgraph Scoring ["ATS Scoring Engine (6 Pillars)"]
            RF["RapidFuzz Keyword Matcher"]
            TFIDF["TF-IDF Cosine Similarity"]
            Explain["Explainability & Rubric Weights"]
        end
        
        subgraph AI ["AI Recommendation Service"]
            OpenAI["OpenAI API Client (Configurable)"]
            LocalNLP["Intelligent Built-in NLP Rule Engine"]
        end
        
        subgraph PDFEngine ["Server-Side PDF Engine"]
            ReportLab["ReportLab Flowables & NumberedCanvas"]
            Templates["3 ATS-Friendly Templates"]
        end
    end

    subgraph Storage ["Persistence Layer"]
        DB[(SQLite / PostgreSQL DB)]
        Uploads["Local Uploads Directory"]
        Exports["Generated PDFs Directory"]
    end

    User <--> UI
    UI <--> API
    API --> Parsers
    API --> Scoring
    API --> AI
    API --> PDFEngine
    API <--> DB
    Parsers --> Uploads
    PDFEngine --> Exports
```

---

## 2. End-to-End Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Candidate
    participant FE as Frontend (React)
    participant BE as FastAPI Backend
    participant PE as Parsing Engine
    participant SE as ATS Scoring Engine
    participant AI as AI Service Layer
    participant RG as ReportLab PDF Engine

    User->>FE: Upload Resume (PDF / DOCX)
    FE->>BE: POST /api/resumes/upload (multipart)
    BE->>PE: Extract text & structured sections
    PE-->>BE: Parsed JSON (Contact, Skills, Experience, Education)
    BE-->>FE: Return Parsed Resume Data
    
    User->>FE: Provide Target Job Description
    FE->>BE: POST /api/job-descriptions
    BE->>BE: Extract required skills, qualifications & duties
    BE-->>FE: Return Job Requirements
    
    FE->>BE: POST /api/analyses (resume_id, job_id)
    BE->>SE: Calculate 6-category weighted ATS score
    BE->>AI: Generate truthful, evidence-based recommendations
    AI-->>BE: Suggestions (Summary, Bullets, Keywords)
    BE-->>FE: Return Overall Score (0-100), Gaps, & Recommendations
    
    User->>FE: Review & Accept/Reject Recommendations or Edit Bullets
    FE->>BE: POST /api/analyses/{id}/apply-recommendation
    BE-->>FE: Updated Resume State
    
    User->>FE: Click "Generate & Download PDF"
    FE->>BE: POST /api/resumes/{id}/export/pdf
    BE->>RG: Render A4 PDF using chosen ATS template
    RG-->>BE: Generated A4 PDF with selectable text
    BE-->>FE: Return Download URL
    FE-->>User: Browser downloads Anagha_Thorave_Resume.pdf
```

---

## 3. Database Entity-Relationship Model

```mermaid
erDiagram
    USERS ||--o{ RESUMES : owns
    USERS ||--o{ JOB_DESCRIPTIONS : creates
    USERS ||--o{ ANALYSES : runs
    USERS ||--o{ RESUME_VERSIONS : saves
    USERS ||--o{ GENERATED_EXPORTS : downloads

    RESUMES ||--o{ ANALYSES : evaluated_in
    RESUMES ||--o{ RESUME_VERSIONS : versioned_as
    RESUMES ||--o{ GENERATED_EXPORTS : exported_as

    JOB_DESCRIPTIONS ||--o{ ANALYSES : benchmarks

    USERS {
        string id PK
        string email UK
        string hashed_password
        string full_name
        boolean is_demo
        datetime created_at
    }

    RESUMES {
        string id PK
        string user_id FK
        string original_filename
        string file_type
        integer file_size
        text extracted_text
        text parsed_resume_json
        datetime created_at
    }

    JOB_DESCRIPTIONS {
        string id PK
        string user_id FK
        string title
        string company_name
        text description_text
        text extracted_requirements_json
        datetime created_at
    }

    ANALYSES {
        string id PK
        string user_id FK
        string resume_id FK
        string job_description_id FK
        float overall_score
        text category_scores_json
        text matched_keywords_json
        text missing_keywords_json
        text recommendations_json
        text formatting_feedback_json
        string scoring_version
        datetime created_at
    }

    RESUME_VERSIONS {
        string id PK
        string user_id FK
        string resume_id FK
        integer version_number
        string version_name
        text resume_content_json
        string template_name
        datetime created_at
    }

    GENERATED_EXPORTS {
        string id PK
        string user_id FK
        string resume_id FK
        string resume_version_id FK
        string filename
        string file_path
        string file_type
        datetime created_at
    }
```

---

## 4. Scoring Rubric Specifications

| Pillar | Weight | Evaluation Method |
|---|---:|---|
| **Required Keyword & Skill Coverage** | 30% | Exact match, synonym expansion, and fuzzy token matching against required job skills. |
| **Relevant Experience Alignment** | 25% | TF-IDF semantic cosine similarity with role responsibilities + action verb density in bullet points. |
| **Qualifications & Education** | 15% | Degree level verification, institution presence, and graduation timeline parsing. |
| **Projects & Achievement Relevance** | 15% | Practical technology overlap in candidate projects and verified professional certifications. |
| **Resume Structure & Readability** | 10% | Detection of ATS-friendly linear layout, standard headings, bullet points vs. paragraphs, and table avoidance. |
| **Contact Information & Completeness** | 5% | Presence of valid email, phone, location, LinkedIn, and GitHub links. |
