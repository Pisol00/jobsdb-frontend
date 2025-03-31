// components/auth/AlertBox.tsx
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { 
  AlertCircle, 
  Check, 
  AlertTriangle, 
  CheckCircle,
  Info,
  XCircle
} from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

type AlertBoxProps = {
  type: AlertType;
  title?: string;
  message: string | ReactNode;
  icon?: ReactNode;
  centered?: boolean;
};

export default function AlertBox({
  type,
  title,
  message,
  icon,
  centered = false,
}: AlertBoxProps) {
  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          title: "text-green-800",
          icon: icon || <Check className="h-5 w-5 text-green-500" />,
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          title: "text-red-800",
          icon: icon || <AlertCircle className="h-5 w-5 text-red-500" />,
        };
      case "warning":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-700",
          title: "text-orange-800",
          icon: icon || <AlertTriangle className="h-5 w-5 text-orange-500" />,
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          title: "text-blue-800",
          icon: icon || <Info className="h-5 w-5 text-blue-500" />,
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 ${styles.bg} border ${
        styles.border
      } ${styles.text} text-sm rounded-lg flex ${
        centered ? "flex-col items-center text-center" : "items-start"
      }`}
    >
      <span className={`${centered ? "mb-2" : "mr-2"} flex-shrink-0`}>
        {styles.icon}
      </span>
      <div>
        {title && <p className={`font-semibold ${styles.title}`}>{title}</p>}
        <span>{message}</span>
      </div>
    </motion.div>
  );
}

// Large success message with checkmark
export function SuccessMessage({ 
  title, 
  message, 
  details 
}: { 
  title: string; 
  message: string; 
  details?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-center"
    >
      <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
      <h3 className="text-lg font-semibold text-green-800">{title}</h3>
      <p className="text-green-700 mt-2">{message}</p>
      {details && <p className="text-sm text-green-600 mt-2">{details}</p>}
    </motion.div>
  );
}

// Error message with X mark
export function ErrorMessage({ 
  title, 
  message, 
  details 
}: { 
  title: string; 
  message: string; 
  details?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center text-center"
    >
      <XCircle className="h-12 w-12 text-red-500 mb-3" />
      <h3 className="text-lg font-semibold text-red-800">{title}</h3>
      <p className="text-red-700 mt-2">{message}</p>
      {details && <p className="text-sm text-red-600 mt-2">{details}</p>}
    </motion.div>
  );
}