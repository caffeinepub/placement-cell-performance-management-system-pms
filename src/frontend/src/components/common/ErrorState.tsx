import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = 'Error', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md shadow-sm">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="ml-2">{title}</AlertTitle>
        <AlertDescription className="ml-2 mt-2">{message}</AlertDescription>
        {onRetry && (
          <div className="mt-4 ml-2">
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}
      </Alert>
    </div>
  );
}
