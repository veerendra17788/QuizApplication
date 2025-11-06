import { Card } from '@/components/ui/card';
import { Phone } from 'lucide-react';

interface PhoneFriendDialogProps {
  advice: string;
}

export const PhoneFriendDialog = ({ advice }: PhoneFriendDialogProps) => {
  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-secondary/50 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <Phone className="h-6 w-6 text-gold animate-pulse" />
        <h3 className="text-xl font-bold text-gold">Your Friend Says...</h3>
      </div>
      <p className="text-lg text-foreground italic">"{advice}"</p>
    </Card>
  );
};
