# ResumeIQ — Known Limitations & Future Enhancements

---

## 1. Known Limitations

1. **Scanned Images / Handwritten Resumes:**
   - Resumes uploaded as pure flat bitmap scans without embedded text layers require OCR (e.g., Tesseract). If Tesseract binary is not installed in the operating system environment, the parser flags a warning and recommends uploading a digital PDF with selectable text.
2. **Highly Unusual Non-Standard Graphical Resumes:**
   - Extremely decorative multi-canvas infographics with custom drawing vectors may produce scattered text sequences in raw streams. The parser detects this and flags an ATS formatting warning advising a linear layout.
3. **External LLM Latency & Cost:**
   - When external LLM mode is active (`AI_PROVIDER=openai`), analysis latency depends on the external provider's API availability. ResumeIQ includes a fast, zero-cost, offline rule-based NLP optimizer that eliminates this dependency.
4. **Third-Party ATS Black-Box Variations:**
   - Commercial ATS solutions (Workday, Taleo, Greenhouse, Lever, iCIMS) use proprietary parsers and custom employer weighting. ResumeIQ's score is an explainable benchmark against industry-standard criteria, not a guarantee of employer hiring outcomes.

---

## 2. Future Enhancements

- **Direct LinkedIn Profile Ingestion:**
  - One-click profile import via OAuth or profile archive JSON.
- **Multilingual Resume & Job Description Parsing:**
  - Extended language support for Spanish, German, French, and Japanese resumes.
- **DOCX Template Export:**
  - In addition to the built-in PDF generator, support downloading edited resumes as Word documents (`.docx`).
- **Interview Question Generator:**
  - Automatically generate tailored technical interview questions based on the identified gaps between the candidate's resume and target job description.
- **Cover Letter Generator:**
  - Generate matching, evidence-based cover letters aligning the candidate's verified achievements with the target company's culture.
