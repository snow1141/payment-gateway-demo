import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PIX_KEY = "984c97f3-49bc-4ac1-9f95-b62c2d1c2ead";
const EXPIRATION_TIME = 10 * 60; // 10 minutes in seconds

const PaymentGateway = () => {
  const [timeLeft, setTimeLeft] = useState(EXPIRATION_TIME);
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    toast.success("Chave PIX copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTimeLeft(EXPIRATION_TIME);
    setExpired(false);
  };

  // Generate PIX payload for QR code (simplified EMV format)
  const pixPayload = `00020126580014BR.GOV.BCB.PIX0136${PIX_KEY}5204000053039865802BR5913Pagamento PIX6008Sao Paulo62070503***6304`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pagamento PIX</h1>
          <p className="text-muted-foreground mt-2">Escaneie o QR Code para pagar</p>
        </div>

        {/* Payment Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-payment">
          {/* Timer */}
          <div className={`flex items-center justify-center gap-2 mb-6 py-3 px-4 rounded-lg ${expired ? "bg-destructive/10" : "bg-timer"}`}>
            <Clock className={`w-5 h-5 ${expired ? "text-destructive" : "text-timer-foreground"}`} />
            <span className={`font-mono text-lg font-semibold ${expired ? "text-destructive" : "text-timer-foreground"}`}>
              {expired ? "Expirado" : formatTime(timeLeft)}
            </span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className={`bg-white p-4 rounded-xl ${expired ? "opacity-50 grayscale" : ""}`}>
              <QRCodeSVG
                value={pixPayload}
                size={200}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* PIX Key */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground block mb-2">Chave PIX</label>
            <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg p-3">
              <code className="flex-1 text-sm text-foreground font-mono truncate">
                {PIX_KEY}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={expired}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Actions */}
          {expired ? (
            <Button onClick={handleReset} className="w-full" variant="default">
              Gerar novo código
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Aguardando pagamento...
              </p>
              <div className="flex justify-center mt-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Pagamento seguro via PIX • Demonstração
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
