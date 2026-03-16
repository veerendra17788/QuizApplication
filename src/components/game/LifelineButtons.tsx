import { Lifelines } from '@/types/game';
import { Phone, Users, Split, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LifelineButtonsProps {
  lifelines: Lifelines;
  onFiftyFifty: () => void;
  onAskAudience: () => void;
  onPhoneFriend: () => void;
  onSkip: () => void;
  disabled: boolean;
  settings?: {
    useFiftyFifty: boolean;
    useAudiencePoll: boolean;
    usePhoneFriend: boolean;
    useSkip: boolean;
  };
}

const LifelineBtn = ({
  icon: Icon,
  label,
  available,
  disabled,
  onClick,
  color,
}: {
  icon: any;
  label: string;
  available: boolean;
  disabled: boolean;
  onClick: () => void;
  color: string;
}) => (
  <button
    onClick={onClick}
    disabled={!available || disabled}
    className={cn(
      'relative flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl border-2',
      'transition-all duration-300 min-w-[90px]',
      available && !disabled
        ? `${color} hover:scale-105 hover:shadow-lg cursor-pointer`
        : 'opacity-30 cursor-not-allowed border-gray-700/30 bg-gray-800/20',
    )}
  >
    {/* Used indicator */}
    {!available && (
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
        <span className="text-xs text-red-400 font-bold rotate-[-20deg]">USED</span>
      </div>
    )}
    <Icon className="h-5 w-5" />
    <span className="text-xs font-bold whitespace-nowrap">{label}</span>
  </button>
);

export const LifelineButtons = ({
  lifelines,
  onFiftyFifty,
  onAskAudience,
  onPhoneFriend,
  onSkip,
  disabled,
  settings,
}: LifelineButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {(!settings || settings.useFiftyFifty) && (
        <LifelineBtn
          icon={Split}
          label="50 : 50"
          available={lifelines.fiftyFifty}
          disabled={disabled}
          onClick={onFiftyFifty}
          color="border-blue-500/60 bg-blue-900/40 text-blue-300 hover:border-blue-400 hover:bg-blue-800/50"
        />
      )}
      {(!settings || settings.useAudiencePoll) && (
        <LifelineBtn
          icon={Users}
          label="Ask Audience"
          available={lifelines.askAudience}
          disabled={disabled}
          onClick={onAskAudience}
          color="border-purple-500/60 bg-purple-900/40 text-purple-300 hover:border-purple-400 hover:bg-purple-800/50"
        />
      )}
      {(!settings || settings.usePhoneFriend) && (
        <LifelineBtn
          icon={Phone}
          label="Phone Friend"
          available={lifelines.phoneAFriend}
          disabled={disabled}
          onClick={onPhoneFriend}
          color="border-green-500/60 bg-green-900/40 text-green-300 hover:border-green-400 hover:bg-green-800/50"
        />
      )}
      {(!settings || settings.useSkip) && (
        <LifelineBtn
          icon={FastForward}
          label="Skip Question"
          available={lifelines.skip}
          disabled={disabled}
          onClick={onSkip}
          color="border-orange-500/60 bg-orange-900/40 text-orange-300 hover:border-orange-400 hover:bg-orange-800/50"
        />
      )}
    </div>
  );
};
