const mockData = {
  leads: [
    {
      id: 1,
      company: "Company A",
      poc: "John Doe",
      status: "Open",
      turnover: "$100,000",
      location: "New York",
    },
    {
      id: 2,
      company: "Company B",
      poc: "Jane Smith",
      status: "Open",
      turnover: "$150,000",
      location: "Los Angeles",
    },
    {
      id: 3,
      company: "Company C",
      poc: "Alice Johnson",
      status: "Open",
      turnover: "$200,000",
      location: "Chicago",
    },
  ],
  progress: [
    {
      id: 1,
      company: "Company A",
      status: "In Progress",
      stage: "Documentation",
      banker: "Banker X",
      pendingDocs: ["Document 1", "Document 2"],
      product: "Product A",
    },
    {
      id: 2,
      company: "Company B",
      status: "Completed",
      stage: "Final Review",
      banker: "Banker Y",
      pendingDocs: [],
      product: "Product B",
    },
    {
      id: 3,
      company: "Company C",
      status: "In Progress",
      stage: "Negotiation",
      banker: "Banker Z",
      pendingDocs: ["Document 3"],
      product: "Product C",
    },
  ],
};

export default mockData;