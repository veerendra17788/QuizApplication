import { Button } from '@/components/ui/button';
import { Lifelines } from '@/types/game';
import { Phone, Users, Split } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LifelineButtonsProps {
  lifelines: Lifelines;
  onFiftyFifty: () => void;
  onAskAudience: () => void;
  onPhoneFriend: () => void;
  disabled: boolean;
}

export const LifelineButtons = ({
  lifelines,
  onFiftyFifty,
  onAskAudience,
  onPhoneFriend,
  disabled,
}: LifelineButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        onClick={onFiftyFifty}
        disabled={!lifelines.fiftyFifty || disabled}
        className={cn(
          "px-6 py-6 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
          "border-2 border-secondary-foreground/20",
          !lifelines.fiftyFifty && "opacity-30 pointer-events-none"
        )}
        variant="secondary"
      >
        <Split className="mr-2 h-5 w-5" />
        <span className="font-bold">50:50</span>
      </Button>

      <Button
        onClick={onAskAudience}
        disabled={!lifelines.askAudience || disabled}
        className={cn(
          "px-6 py-6 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
          "border-2 border-secondary-foreground/20",
          !lifelines.askAudience && "opacity-30 pointer-events-none"
        )}
        variant="secondary"
      >
        <Users className="mr-2 h-5 w-5" />
        <span className="font-bold">Ask Audience</span>
      </Button>

      <Button
        onClick={onPhoneFriend}
        disabled={!lifelines.phoneAFriend || disabled}
        className={cn(
          "px-6 py-6 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
          "border-2 border-secondary-foreground/20",
          !lifelines.phoneAFriend && "opacity-30 pointer-events-none"
        )}
        variant="secondary"
      >
        <Phone className="mr-2 h-5 w-5" />
        <span className="font-bold">Phone a Friend</span>
      </Button>
    </div>
  );
};
