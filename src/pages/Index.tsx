import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Heart, PawPrint, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PIX_KEY = "984c97f3-49bc-4ac1-9f95-b62c2d1c2ead";

const Index = () => {
  const [copied, setCopied] = useState(false);

  const generatePixPayload = () => {
    const payload = `00020126580014BR.GOV.BCB.PIX0136${PIX_KEY}5204000053039865802BR5925PATINHA ESSENCIAL6009SAO PAULO62070503***6304`;
    return payload;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      toast.success("Chave PIX copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar a chave");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <PawPrint className="w-10 h-10" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Patinha Essencial
          </h1>
          <PawPrint className="w-10 h-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Donation Section */}
        <section className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
            {/* Tab Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
              <div className="flex items-center justify-center gap-2 text-white">
                <Heart className="w-6 h-6 fill-white animate-pulse" />
                <h2 className="text-2xl font-bold">Doe Aqui</h2>
                <Heart className="w-6 h-6 fill-white animate-pulse" />
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-center text-gray-600 mb-6">
                Escaneie o QR Code abaixo para fazer sua doação via PIX. 
                Sua contribuição ajuda a cuidar de animais abandonados! 🐾
              </p>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-orange-200">
                  <QRCodeSVG
                    value={generatePixPayload()}
                    size={220}
                    level="H"
                    includeMargin
                    fgColor="#ea580c"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              {/* Copy Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleCopy}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Chave Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copiar Chave PIX
                    </>
                  )}
                </Button>
              </div>

              {/* Message */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Obrigado por ajudar os nossos peludos! 💛
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md text-gray-600">
              <PawPrint className="w-5 h-5 text-orange-500" />
              <span>Cada doação faz a diferença!</span>
              <PawPrint className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-90">
            © 2024 Patinha Essencial - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
