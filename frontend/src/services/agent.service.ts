const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export const agentService = {
  getAgents: async () => {
    const res = await fetch(`${API_BASE}/agents`);
    return res.json();
  },

  getAgentCapabilities: async (type: string) => {
    const res = await fetch(
      `${API_BASE}/agents/${type}/capabilities`
    );
    return res.json();
  },
};
