import type { Submission, User } from "@/lib/types";

export const users: User[] = [
  { id: "user1", name: "Dawit Abebe", role: "User" },
  { id: "user2", name: "Fatima Yusuf", role: "User" },
  { id: "approver1", name: "Dr. Selamawit", role: "Approver" },
];

export const initialSubmissions: Submission[] = [
  {
    id: "sub1",
    userId: "user1",
    userName: "Dawit Abebe",
    projectTitle: "Research on Malaria Vaccines",
    department: "Immunology",
    budgetYear: 2018,
    objective: "To develop a more effective malaria vaccine.",
    activities: [
      {
        id: "act1",
        name: "Phase 1 Trials",
        description: "Conducting initial human trials.",
        timeline: "Q1-Q2",
        budget: 50000,
      },
      {
        id: "act2",
        name: "Data Analysis",
        description: "Analyzing trial results.",
        timeline: "Q3",
        budget: 15000,
      },
    ],
    expectedOutcome: "Successful identification of a candidate vaccine.",
    status: "Approved",
    submittedAt: new Date("2018-01-15T09:30:00Z").toISOString(),
    lastModifiedAt: new Date("2018-01-20T14:00:00Z").toISOString(),
    comments: "Good proposal. Approved.",
  },
  {
    id: "sub2",
    userId: "user2",
    userName: "Fatima Yusuf",
    projectTitle: "Tuberculosis Strain Analysis",
    department: "Microbiology",
    budgetYear: 2018,
    objective: "To map the genetic diversity of TB strains in the region.",
    activities: [
      {
        id: "act3",
        name: "Sample Collection",
        description: "Gathering samples from various clinics.",
        timeline: "Q1",
        budget: 20000,
      },
      {
        id: "act4",
        name: "Genetic Sequencing",
        description: "Sequencing the DNA of collected samples.",
        timeline: "Q2-Q4",
        budget: 120000,
      },
    ],
    expectedOutcome: "A comprehensive genetic map of local TB strains.",
    status: "Pending",
    submittedAt: new Date("2018-02-01T11:00:00Z").toISOString(),
    lastModifiedAt: new Date("2018-02-01T11:00:00Z").toISOString(),
  },
  {
    id: "sub3",
    userId: "user1",
    userName: "Dawit Abebe",
    projectTitle: "HIV/AIDS Community Outreach",
    department: "Public Health",
    budgetYear: 2018,
    objective: "To increase awareness and testing in rural areas.",
    activities: [
      {
        id: "act5",
        name: "Workshop Series",
        description: "Conducting educational workshops.",
        timeline: "Q1-Q4",
        budget: 75000,
      },
    ],
    expectedOutcome: "A 20% increase in testing rates in targeted communities.",
    status: "Rejected",
    submittedAt: new Date("2018-02-10T16:20:00Z").toISOString(),
    lastModifiedAt: new Date("2018-02-12T10:05:00Z").toISOString(),
    comments: "Budget exceeds department limits. Please revise and resubmit.",
  },
];
