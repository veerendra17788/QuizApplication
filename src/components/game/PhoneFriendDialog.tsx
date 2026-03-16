import { Card } from '@/components/ui/card';
import { Phone, X } from 'lucide-react';

interface PhoneFriendDialogProps {
  advice: string;
  onClose?: () => void;
}

export const PhoneFriendDialog = ({ advice, onClose }: PhoneFriendDialogProps) => {
  return (
    <Card className="relative p-6 bg-card/80 backdrop-blur-sm border-secondary/50 animate-slide-up">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors z-20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-center gap-3 mb-4 pr-6">
        <Phone className="h-6 w-6 text-gold animate-pulse" />
        <h3 className="text-xl font-bold text-gold">Your Friend Says...</h3>
      </div>
      <p className="text-lg text-foreground italic">"{advice}"</p>
    </Card>
  );
};
