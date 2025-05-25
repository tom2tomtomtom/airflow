import type { Campaign } from '@/types/models';
import type { UICampaign } from '@/lib/demo-data';

// Type guards and helpers for Campaign/UICampaign compatibility
export function isCampaign(campaign: Campaign | UICampaign): campaign is Campaign {
  return 'targeting' in campaign && 'schedule' in campaign;
}

export function getTargeting(campaign: Campaign | UICampaign) {
  if (isCampaign(campaign)) {
    return campaign.targeting;
  }
  // UICampaign doesn't have targeting, return a default
  return undefined;
}

export function getSchedule(campaign: Campaign | UICampaign) {
  if (isCampaign(campaign)) {
    return campaign.schedule;
  }
  // UICampaign doesn't have schedule, return a default
  return undefined;
}

export function getBudgetTotal(budget: number | { total: number; spent: number; currency: string; } | undefined): number {
  if (!budget) return 0;
  if (typeof budget === 'number') return budget;
  return budget.total;
}

export function getBudgetSpent(budget: number | { total: number; spent: number; currency: string; } | undefined): number {
  if (!budget) return 0;
  if (typeof budget === 'number') return 0; // If it's just a number, there's no spent amount
  return budget.spent;
}
