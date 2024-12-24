import type React from "react";
import { motion } from "framer-motion";
import AnimatedGradient from "@/components/app_ui/animated_gradient";

interface BentoCardProps {
  title: string;
  value: string | number | JSX.Element | null;
  subtitle?: string | null;
  icon: JSX.Element | null;
  colors: string[];
  delay: number;
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colors,
  delay,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3, // Add a small delay after the card appears
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-white rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="medium" />
      <motion.div
        className="relative z-10 p-3 sm:p-5 md:p-8 text-foreground flex items-center justify-between space-x-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          className="relative z-10 flex items-center justify-between space-x-4"
        >
          {icon}
          <motion.div
          className="relative z-10"
          >
            <motion.p className="text-sm sm:text-base md:text-lg flex" variants={item}>
              {title}
            </motion.p>
            {value && <motion.p className="text-2xl font-bold" variants={item}>{value}</motion.p>}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BentoCard;

const AnimatedGradientDemo: React.FC = () => {
  return (
    <div className="w-full bg-background h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 grow h-full">
        <div className="md:col-span-2">
          <BentoCard
            title="Total Revenue"
            value="$1,234,567"
            subtitle="15% increase from last month"
            colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
            delay={0.2}
            icon={null}
          />
        </div>
        <BentoCard
          title="New Users"
          value={1234}
          subtitle="Daily signups"
          colors={["#60A5FA", "#34D399", "#93C5FD"]}
          delay={0.4}
          icon={null}
        />
        <BentoCard
          title="Conversion Rate"
          value="3.45%"
          subtitle="0.5% increase from last week"
          colors={["#F59E0B", "#A78BFA", "#FCD34D"]}
          delay={0.6} icon={null}
        />
        <div className="md:col-span-2">
          <BentoCard
            title="Active Projects"
            value={42}
            subtitle="8 completed this month"
            colors={["#3B82F6", "#A78BFA", "#FBCFE8"]}
            delay={0.8} icon={null}
          />
        </div>
        <div className="md:col-span-3">
          <BentoCard
            title="Customer Satisfaction"
            value="4.8/5"
            subtitle="Based on 1,000+ reviews from verified customers across all product categories"
            colors={["#EC4899", "#F472B6", "#3B82F6"]}
            delay={1} icon={null}
          />
        </div>
      </div>
    </div>
  );
};