"use client";
import { Card, } from "@/components/ui/card";
import cn from "classnames";
import {
  BookOpen,
  Rocket,
  Globe,
  PencilLine,
  Settings,
  LayoutDashboard,
  Activity,
  Terminal
} from "lucide-react";
import BentoCard from "./BentoCard";

interface StatCardProps {
  type: 'posts' | 'deploy' | 'visit' | 'newPost' | string;
  value: number | string | null;
  colors: string[];
  onClick: () => void;
}

const StatCard = ({ type, value, colors, onClick }: StatCardProps) => {
  const getCardContent = () => {
    switch (type) {
      case 'posts':
        return {
          icon: <BookOpen className="h-6 w-6" />,
          label: 'Posts',
          value: value,
          action: null
        };
      case 'deployStat':
        return {
          icon: <><Rocket className="h-5 w-5" /><Activity className="h-5 w-5" /></>,
          label: 'Deploy Status',
          value: value ? <img src={value as string} alt="Netlify Deploy Status" /> : null,
          action: null
        };
      case 'visit':
        return {
          icon: <Globe className="h-6 w-6" />,
          label: 'Visit Site',
          value: null,
          action: 'Visit'
        };
      case 'newPost':
        return {
          icon: <PencilLine className="h-6 w-6" />,
          label: 'Create Post',
          value: null,
          action: 'New Post'
        };
      case 'deploySite':
        return {
          icon: <Rocket className="h-6 w-6" />,
          label: 'Deploy Site',
          value: null,
          action: 'Deploy'
        };
      case 'quickActions':
        return {
          icon: <Settings className="h-6 w-6" />,
          label: 'Quick Actions',
          value: null,
          action: 'Edit'
        };
      case 'overview':
        return {
          icon: <LayoutDashboard className="h-6 w-6" />,
          label: 'Site Overview',
          value: value,
          action: null
        };
      case 'activity':
        return {
          icon: <Activity className="h-6 w-6" />,
          label: 'Recent Activity',
          value: value,
          action: null
        };
      case 'technical':
        return {
          icon: <Terminal className="h-6 w-6" />,
          label: 'Technical Details',
          value: value,
          action: null
        };
      default:
        return {
          icon: null,
          label: type,
          value: value,
          action: null
        };
    }
  };

  const content = getCardContent();

  return (
    <span>
      <Card onClick={onClick}
        className={cn(
          "bg-card hover:bg-accent/50 transition-colors mb-8",
          content.action && "cursor-pointer"
        )}
      >
        {/*
          TODO  - add a color prop to this comp so colors can be different,
          and make sure the animation and size of the cards are smooth
         */}
        <BentoCard
          title={content.label}
          value={content.value}
          icon={content.icon}
          colors={colors}
          delay={0.2}
        />
      </Card>
    </span>
  );
};

export default StatCard;