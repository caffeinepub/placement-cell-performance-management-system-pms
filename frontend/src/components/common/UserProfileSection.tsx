import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check, User } from 'lucide-react';
import { principalToShortId } from '../../utils/principals';

export default function UserProfileSection() {
  const { identity } = useInternetIdentity();
  const [copied, setCopied] = useState(false);

  if (!identity) return null;

  const principalId = identity.getPrincipal().toText();
  const shortId = principalToShortId(principalId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = principalId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border border-border shadow-pastel-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <User className="h-4 w-4 text-primary" />
          Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            User ID
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-muted rounded-md px-3 py-2">
              <p className="text-2xl font-mono font-bold text-foreground tracking-widest">
                {shortId}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={handleCopy}
                    title={copied ? 'Copied!' : 'Copy full Principal ID'}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">Copy full Principal ID</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Shortened display — click copy for full ID
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Authenticated
          </Badge>
          {copied && (
            <span className="text-xs text-green-600 font-medium">Copied to clipboard!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
