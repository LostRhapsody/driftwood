import { Card, CardContent } from "@/components/ui/card";
import cn from "classnames";
import {
  BookOpen,
  Rocket,
  Globe,
  PencilLine,
  Construction,
  Settings,
  LayoutDashboard,
  Activity,
  Terminal
} from "lucide-react";

interface StatCardProps {
  type: 'posts' | 'deploy' | 'visit' | 'newPost' | string;
  value: number | string | null;
  onClick: () => void;
}

const StatCard = ({ type, value, onClick }: StatCardProps) => {
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
    <Card onClick={onClick}
      className={cn(
        "bg-card hover:bg-accent/50 transition-colors",
        content.action && "cursor-pointer"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {content.icon}
            <div>
              <p className="text-md text-muted-foreground">{content.label}</p>
              {content.value && <p className="text-2xl font-bold">{content.value}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;