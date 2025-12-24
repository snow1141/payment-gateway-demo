import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Heart, PawPrint, Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PIX_KEY = "984c97f3-49bc-4ac1-9f95-b62c2d1c2ead";
const BENEFICIARY_NAME = "PATINHA ESSENCIAL";
const BENEFICIARY_CITY = "SAO PAULO";

// CRC16 CCITT-FALSE calculation for PIX
const crc16ccitt = (str: string): string => {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

// Generate valid PIX payload according to EMV-QRCPS-MPM spec
const generatePixPayload = (): string => {
  // Payload Format Indicator
  const payloadFormat = "000201";
  
  // Merchant Account Information (PIX)
  const gui = "0014BR.GOV.BCB.PIX";
  const pixKey = `01${PIX_KEY.length.toString().padStart(2, '0')}${PIX_KEY}`;
  const merchantAccount = `26${(gui.length + pixKey.length).toString().padStart(2, '0')}${gui}${pixKey}`;
  
  // Merchant Category Code (0000 = not specified)
  const merchantCategory = "52040000";
  
  // Transaction Currency (986 = BRL)
  const currency = "5303986";
  
  // Country Code
  const countryCode = "5802BR";
  
  // Merchant Name
  const name = BENEFICIARY_NAME.substring(0, 25);
  const merchantName = `59${name.length.toString().padStart(2, '0')}${name}`;
  
  // Merchant City
  const city = BENEFICIARY_CITY.substring(0, 15);
  const merchantCity = `60${city.length.toString().padStart(2, '0')}${city}`;
  
  // Additional Data Field (transaction ID)
  const txId = "***";
  const additionalData = `62${(4 + txId.length).toString().padStart(2, '0')}05${txId.length.toString().padStart(2, '0')}${txId}`;
  
  // Build payload without CRC
  const payloadWithoutCRC = `${payloadFormat}${merchantAccount}${merchantCategory}${currency}${countryCode}${merchantName}${merchantCity}${additionalData}6304`;
  
  // Calculate CRC16
  const crc = crc16ccitt(payloadWithoutCRC);
  
  return `${payloadWithoutCRC}${crc}`;
};

const Index = () => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [expired, setExpired] = useState(false);
  const [pixPayload] = useState(generatePixPayload());

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
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar o código");
    }
  };

  const handleReset = () => {
    setTimeLeft(10 * 60);
    setExpired(false);
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
              <p className="text-center text-gray-600 mb-4">
                Escaneie o QR Code abaixo para fazer sua doação via PIX. 
                Sua contribuição ajuda a cuidar de animais abandonados! 🐾
              </p>

              {/* Timer */}
              <div className={`flex items-center justify-center gap-2 mb-6 py-2 px-4 rounded-full mx-auto w-fit ${
                expired 
                  ? "bg-red-100 text-red-600" 
                  : timeLeft <= 60 
                    ? "bg-amber-100 text-amber-600" 
                    : "bg-green-100 text-green-600"
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold text-lg">
                  {expired ? "Expirado" : formatTime(timeLeft)}
                </span>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className={`bg-white p-4 rounded-2xl shadow-lg border-4 border-orange-200 transition-opacity ${
                  expired ? "opacity-50" : ""
                }`}>
                  <QRCodeSVG
                    value={pixPayload}
                    size={220}
                    level="M"
                    includeMargin
                    fgColor={expired ? "#9ca3af" : "#ea580c"}
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              {/* Copy Button or Reset */}
              <div className="flex justify-center">
                {expired ? (
                  <Button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all hover:scale-105"
                  >
                    Gerar Novo QR Code
                  </Button>
                ) : (
                  <Button
                    onClick={handleCopy}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Código Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copiar Código PIX
                      </>
                    )}
                  </Button>
                )}
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
