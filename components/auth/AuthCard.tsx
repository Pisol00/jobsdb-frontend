// components/auth/AuthCard.tsx
import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-center text-gray-800">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-center text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-4">{children}</CardContent>

      {footer && <CardFooter className="flex justify-center pb-6 pt-2">{footer}</CardFooter>}
    </Card>
  );
}