import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface UserCardProps {
  name: string;
}

export function User({ name = "John Doe" }: UserCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex items-center space-x-4 p-6">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
        </div>
      </CardContent>
    </Card>
  );
}
