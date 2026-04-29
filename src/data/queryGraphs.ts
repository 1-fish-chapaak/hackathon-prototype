// Graphs that have been generated in chat sessions for each query.
// Surfaced in the QueryCard's "Add Graph" modal — user picks one to attach
// to the card. Keep datasets small; these are visual mocks, not analytics.

export type QueryGraph = {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: { name: string; value: number }[];
};

export const QUERY_GRAPHS: Record<string, QueryGraph[]> = {
  Q01: [
    {
      id: 'q01-g1', title: 'Duplicates by vendor', type: 'bar',
      data: [
        { name: 'Acme', value: 42 },
        { name: 'Globex', value: 27 },
        { name: 'Initech', value: 18 },
        { name: 'Hooli', value: 14 },
        { name: 'Wonka', value: 9 },
      ],
    },
    {
      id: 'q01-g2', title: 'Flagged volume — last 10 weeks', type: 'line',
      data: [
        { name: 'W1', value: 40 }, { name: 'W2', value: 55 }, { name: 'W3', value: 80 },
        { name: 'W4', value: 65 }, { name: 'W5', value: 90 }, { name: 'W6', value: 75 },
        { name: 'W7', value: 95 }, { name: 'W8', value: 70 }, { name: 'W9', value: 85 },
        { name: 'W10', value: 100 },
      ],
    },
    {
      id: 'q01-g3', title: 'Status distribution', type: 'pie',
      data: [
        { name: 'Pending', value: 136 },
        { name: 'Resolved', value: 3 },
        { name: 'Manual', value: 1 },
      ],
    },
    {
      id: 'q01-g4', title: 'Cumulative exceptions', type: 'area',
      data: [
        { name: 'Jan', value: 12 }, { name: 'Feb', value: 28 }, { name: 'Mar', value: 47 },
        { name: 'Apr', value: 71 }, { name: 'May', value: 96 }, { name: 'Jun', value: 140 },
      ],
    },
  ],
  Q02: [
    {
      id: 'q02-g1', title: 'Vendor changes — by category', type: 'bar',
      data: [
        { name: 'Bank Acct', value: 18 },
        { name: 'Address', value: 12 },
        { name: 'Tax ID', value: 9 },
        { name: 'Contact', value: 8 },
      ],
    },
    {
      id: 'q02-g2', title: 'Authorization breakdown', type: 'pie',
      data: [
        { name: 'Verified', value: 35 },
        { name: 'Unauthorized', value: 12 },
      ],
    },
    {
      id: 'q02-g3', title: 'Changes over last 90 days', type: 'line',
      data: [
        { name: 'D1', value: 20 }, { name: 'D15', value: 35 }, { name: 'D30', value: 25 },
        { name: 'D45', value: 50 }, { name: 'D60', value: 40 }, { name: 'D75', value: 30 },
        { name: 'D90', value: 47 },
      ],
    },
  ],
  RA01: [
    {
      id: 'ra01-g1', title: 'Risk severity mix', type: 'pie',
      data: [
        { name: 'Critical', value: 2 },
        { name: 'High', value: 5 },
        { name: 'Medium', value: 3 },
        { name: 'Low', value: 2 },
      ],
    },
    {
      id: 'ra01-g2', title: 'Risks per process area', type: 'bar',
      data: [
        { name: 'P2P', value: 4 },
        { name: 'O2C', value: 3 },
        { name: 'R2R', value: 2 },
        { name: 'S2C', value: 3 },
      ],
    },
  ],
  RA02: [
    {
      id: 'ra02-g1', title: 'Mitigation effectiveness', type: 'pie',
      data: [
        { name: 'Effective', value: 10 },
        { name: 'Partial', value: 5 },
        { name: 'Ineffective', value: 3 },
      ],
    },
    {
      id: 'ra02-g2', title: 'Strategies reviewed by quarter', type: 'bar',
      data: [
        { name: 'Q1', value: 4 }, { name: 'Q2', value: 5 }, { name: 'Q3', value: 4 }, { name: 'Q4', value: 5 },
      ],
    },
  ],
  CE01: [
    {
      id: 'ce01-g1', title: 'Control test outcomes', type: 'bar',
      data: [
        { name: 'Effective', value: 48 },
        { name: 'Deficient', value: 4 },
        { name: 'Pending', value: 33 },
      ],
    },
    {
      id: 'ce01-g2', title: 'Effectiveness trend', type: 'line',
      data: [
        { name: 'Wk1', value: 88 }, { name: 'Wk2', value: 90 }, { name: 'Wk3', value: 87 },
        { name: 'Wk4', value: 92 }, { name: 'Wk5', value: 94 }, { name: 'Wk6', value: 91 },
      ],
    },
    {
      id: 'ce01-g3', title: 'Coverage by control family', type: 'pie',
      data: [
        { name: 'Preventive', value: 22 },
        { name: 'Detective', value: 18 },
        { name: 'Corrective', value: 14 },
      ],
    },
  ],
  WA01: [
    {
      id: 'wa01-g1', title: 'Workflow accuracy trend', type: 'line',
      data: [
        { name: 'Run1', value: 85 }, { name: 'Run2', value: 88 }, { name: 'Run3', value: 90 },
        { name: 'Run4', value: 87 }, { name: 'Run5', value: 92 }, { name: 'Run6', value: 94 },
      ],
    },
    {
      id: 'wa01-g2', title: 'Runs per workflow', type: 'bar',
      data: [
        { name: 'Vendor Audit', value: 32 },
        { name: 'Invoice Match', value: 28 },
        { name: 'Compliance Sweep', value: 24 },
        { name: 'Risk Scan', value: 31 },
      ],
    },
  ],
  WA02: [
    {
      id: 'wa02-g1', title: 'Exception resolution path', type: 'pie',
      data: [
        { name: 'Auto-Resolved', value: 8 },
        { name: 'Manual Review', value: 12 },
        { name: 'Escalated', value: 3 },
      ],
    },
    {
      id: 'wa02-g2', title: 'Daily exception count', type: 'area',
      data: [
        { name: 'Mon', value: 5 }, { name: 'Tue', value: 3 }, { name: 'Wed', value: 6 },
        { name: 'Thu', value: 4 }, { name: 'Fri', value: 2 }, { name: 'Sat', value: 3 },
        { name: 'Sun', value: 7 },
      ],
    },
  ],
  EX01: [
    {
      id: 'ex01-g1', title: 'Compliance score trend', type: 'line',
      data: [
        { name: 'Jan', value: 91 }, { name: 'Feb', value: 91.5 }, { name: 'Mar', value: 92 },
        { name: 'Apr', value: 92.3 }, { name: 'May', value: 93 }, { name: 'Jun', value: 94.2 },
      ],
    },
    {
      id: 'ex01-g2', title: 'Risk exposure by category', type: 'bar',
      data: [
        { name: 'Strategic', value: 8 },
        { name: 'Operational', value: 5 },
        { name: 'Financial', value: 3 },
        { name: 'Compliance', value: 2 },
      ],
    },
    {
      id: 'ex01-g3', title: 'Material weakness status', type: 'pie',
      data: [
        { name: 'Open', value: 2 },
        { name: 'Remediating', value: 4 },
        { name: 'Closed', value: 18 },
      ],
    },
  ],
};
