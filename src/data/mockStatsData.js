export const summaryStats = {
  totalBeds: 247,
  occupiedBeds: 91,
  availableBeds: 156,
  emergencyBeds: 12
};

export const occupancyTrend = [
  { time: "8 AM", occupied: 72 },
  { time: "10 AM", occupied: 81 },
  { time: "12 PM", occupied: 93 },
  { time: "2 PM", occupied: 88 },
  { time: "4 PM", occupied: 91 }
];

export const departmentDistribution = [
  { name: "ICU", value: 22 },
  { name: "Emergency", value: 14 },
  { name: "General Ward", value: 62 },
  { name: "Maternity", value: 27 }
];

export const recentActivity = [
  { id: "B101", department: "ICU", status: "Occupied", updated: "2 min ago" },
  { id: "B205", department: "Emergency", status: "Available", updated: "5 min ago" },
  { id: "B309", department: "General Ward", status: "Occupied", updated: "10 min ago" },
  { id: "B412", department: "Maternity", status: "Discharging", updated: "18 min ago" },
  { id: "B118", department: "ICU", status: "Available", updated: "23 min ago" }
];
