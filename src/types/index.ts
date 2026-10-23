export const PLATFORMS = ["Facebook", "TikTok", "Google", "WhatsApp", "Website", "Other"] as const;
export const ADS_PLATFORMS = ["Facebook", "TikTok", "Google", "Other"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const LEAD_STATUSES = ["New", "Contacted", "Quotation Sent", "Won", "Lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES = ["To Do", "In Progress", "Completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  platform: string;
  machine: string;
  salesperson: string;
  status: LeadStatus;
}

export interface AdCampaign {
  id: string;
  campaignName: string;
  platform: string;
  date: string; // YYYY-MM-DD
  spend: number; // RM
  leads: number;
  sales: number; // RM
}

export interface Task {
  id: string;
  name: string;
  assignee: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
}
