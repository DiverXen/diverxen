"use client";

import React from "react";
import { FilterCapsule } from "@/components/ui/FilterCapsule";
import { WORK_FILTER_TABS } from "@/constants/workProjects";

export interface WorkFilterCapsuleProps {
  activeTab: "all" | "ui-ux" | "branding";
  onTabChange: (tabId: "all" | "ui-ux" | "branding") => void;
  className?: string;
}

export const WorkFilterCapsule: React.FC<WorkFilterCapsuleProps> = ({
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <FilterCapsule
      tabs={WORK_FILTER_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={className}
      ariaLabel="Work category filter"
    />
  );
};

export default WorkFilterCapsule;
