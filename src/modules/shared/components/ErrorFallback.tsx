import React, { ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = React.useState(false);

  const handleGoHome = () => {
    if (onReset) {
      onReset();
    }
    navigate('/');
  };

  const handleReload = () => {
    if (onReset) {
      onReset();
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Error Icon */}
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t('error.boundary.title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('error.boundary.description')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-left">
                <p className="font-mono text-sm text-destructive break-words">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleGoHome} variant="default" size="lg">
              <Home className="w-4 h-4 mr-2" />
              {t('error.boundary.goHome')}
            </Button>
            <Button onClick={handleReload} variant="outline" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('error.boundary.reload')}
            </Button>
          </div>

          {/* Technical Details Toggle */}
          {(error || errorInfo) && (
            <div className="w-full space-y-2">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                {showDetails
                  ? t('error.boundary.hideDetails')
                  : t('error.boundary.showDetails')}
              </Button>

              {showDetails && (
                <div className="w-full max-h-64 overflow-auto bg-muted rounded-lg p-4 text-left">
                  {error?.stack && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-foreground">
                        Stack Trace:
                      </h3>
                      <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div className="space-y-2 mt-4">
                      <h3 className="font-semibold text-sm text-foreground">
                        Component Stack:
                      </h3>
                      <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <p className="text-sm text-muted-foreground">
            {t('error.boundary.helpText')}
          </p>
        </div>
      </Card>
    </div>
  );
};
