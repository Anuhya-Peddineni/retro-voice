# Synthetic Daily Standup Corpus

This corpus contains 10 fictional WebVTT standups, one for each workday of the same 10-workday sprint. The sprint runs from 2026-04-06 through 2026-04-17. Each file is labeled Sprint 01 and Day 01 through Day 10. Every transcript is a synthetic example and does not depict a real company, project, or meeting.

## Story context

The team is building an end-to-end e-commerce checkout flow. The ten-day story progresses from catalog filters into saved-cart merging, address validation, coupon eligibility, and payment authorization. Decisions and unfinished work carry from one day to the next: UI and API contracts are revised, external-service access delays integration, and QA findings affect review and release timing. The data includes recurring communication, dependency, workload, review, testing, access, and deployment friction, along with improvements that help in some places and remain incomplete in others. An external integration contact’s emergency leave affects the address-validation work and exposes gaps in the backup path.

These product details and workplace events are invented to make the synthetic conversations coherent. They are not real requirements, status reports, or incident records.

## Team

| Participant | Role |
|---|---|
| John Doe | Product Owner |
| Jane Doe | Scrum Master |
| Alex Smith | Tech Lead |
| Michael Brown | Backend Developer |
| Emily Davis | Backend Developer |
| David Wilson | Frontend Developer |
| Sarah Miller | QA Engineer |
| Robert Taylor | DevOps Engineer |

## Format

Each transcript uses platform-neutral WebVTT cues with timestamps and `<v Speaker>` attribution. Overlapping cue times represent occasional interruptions and crosstalk. The raw dialogue includes conversational hesitations, corrections, pauses, disagreement, and follow-up.
