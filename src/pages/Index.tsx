import { useState, useEffect, useCallback } from "react";
import { Heart, Copy, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import logoImage from "@/assets/delhey-logo.png";
import dogRescue1 from "@/assets/dog-rescue-1.jpg";
import dogRescue2 from "@/assets/dog-rescue-2.jpg";
import dogRescue3 from "@/assets/dog-rescue-3.jpg";

const PIX_KEY = "984c97f3-49bc-4ac1-9f95-b62c2d1c2ead";
const BENEFICIARY_NAME = "DELHEY";
const BENEFICIARY_CITY = "SAO PAULO";
const EXPIRATION_TIME = 10 * 60;

function crc16ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function generatePixPayload(
  pixKey: string,
  beneficiaryName: string,
  city: string
): string {
  const formatField = (id: string, value: string) =>
    `${id}${value.length.toString().padStart(2, "0")}${value}`;

  const gui = formatField("00", "BR.GOV.BCB.PIX");
  const key = formatField("01", pixKey);
  const merchantAccountInfo = formatField("26", gui + key);

  const mcc = formatField("52", "0000");
  const currency = formatField("53", "986");
  const country = formatField("58", "BR");
  const name = formatField("59", beneficiaryName.substring(0, 25).toUpperCase());
  const cityField = formatField("60", city.substring(0, 15).toUpperCase());
  const additionalData = formatField("62", formatField("05", "***"));
  const payloadFormat = formatField("00", "01");

  const payloadWithoutCRC =
    payloadFormat +
    merchantAccountInfo +
    mcc +
    currency +
    country +
    name +
    cityField +
    additionalData +
    "6304";

  const crc = crc16ccitt(payloadWithoutCRC);
  return payloadWithoutCRC + crc;
}

const Index = () => {
  const [showDonation, setShowDonation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXPIRATION_TIME);
  const [isExpired, setIsExpired] = useState(false);
  const [pixPayload, setPixPayload] = useState("");

  const generateNewQR = useCallback(() => {
    const payload = generatePixPayload(PIX_KEY, BENEFICIARY_NAME, BENEFICIARY_CITY);
    setPixPayload(payload);
    setTimeLeft(EXPIRATION_TIME);
    setIsExpired(false);
  }, []);

  useEffect(() => {
    generateNewQR();
  }, [generateNewQR]);

  useEffect(() => {
    if (!showDonation || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showDonation, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar código");
    }
  };

  const scrollToDonation = () => {
    setShowDonation(true);
    setTimeout(() => {
      document.getElementById("donation-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const rescueDogs = [
    { image: dogRescue1, name: "Rex", story: "Encontrado abandonado na rua" },
    { image: dogRescue2, name: "Luna", story: "Resgatada de situação de maus-tratos" },
    { image: dogRescue3, name: "Thor", story: "Abandonado ainda filhote" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="DelHey Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-orange-600">DelHey</span>
          </div>
          <Button
            onClick={scrollToDonation}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          >
            <Heart className="w-5 h-5 mr-2 fill-current" />
            Doe Aqui
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <img
            src={logoImage}
            alt="DelHey Mascote"
            className="w-40 h-40 md:w-52 md:h-52 mx-auto mb-8 drop-shadow-2xl animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <h1 className="text-5xl md:text-7xl font-extrabold text-orange-600 mb-4 tracking-tight">
            DelHey
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium italic mb-8">
            "Cuidamos de quem não pode falar"
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={scrollToDonation}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg px-10 py-6 rounded-full shadow-2xl hover:shadow-orange-300/50 transition-all duration-300 transform hover:scale-105"
            >
              <Heart className="w-6 h-6 mr-3 fill-current" />
              Doe por Aqui
            </Button>
          </div>
          <ChevronDown className="w-8 h-8 text-orange-400 mx-auto mt-12 animate-bounce" />
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            Nossa Missão
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            A DelHey é uma ONG dedicada ao resgate e cuidado de animais em situação de 
            vulnerabilidade. Acreditamos que todo ser vivo merece amor, respeito e uma 
            segunda chance.
          </p>
        </div>
      </section>

      {/* Dogs Gallery Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Eles Precisam de Você
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Conheça alguns dos animais que resgatamos. Sua doação ajuda a salvar vidas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {rescueDogs.map((dog, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={dog.image}
                    alt={dog.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{dog.name}</h3>
                  <p className="text-gray-600">{dog.story}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sua Ajuda Transforma Vidas
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Com sua doação, podemos continuar resgatando, alimentando e cuidando de 
            animais abandonados. Cada contribuição faz a diferença!
          </p>
          <Button
            onClick={scrollToDonation}
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-10 py-6 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Heart className="w-6 h-6 mr-3 fill-orange-500" />
            Fazer uma Doação
          </Button>
        </div>
      </section>

      {/* Donation Section */}
      {showDonation && (
        <section
          id="donation-section"
          className="py-16 bg-white"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl shadow-2xl p-8 border border-orange-100">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
                    <Heart className="w-8 h-8 text-white fill-current" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Doe via PIX
                  </h2>
                  <p className="text-gray-600">
                    Escaneie o QR Code ou copie o código
                  </p>
                </div>

                {!isExpired ? (
                  <>
                    <div className="bg-white rounded-2xl p-6 shadow-inner mb-6">
                      <div className="flex justify-center">
                        <QRCodeSVG
                          value={pixPayload}
                          size={200}
                          level="M"
                          includeMargin={true}
                          className="rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-500 mb-1">Expira em</p>
                      <p className="text-2xl font-mono font-bold text-orange-600">
                        {formatTime(timeLeft)}
                      </p>
                    </div>

                    <Button
                      onClick={handleCopyPix}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-all duration-200"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 mr-2" />
                          Copiar Código PIX
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-500 font-semibold mb-4">
                      QR Code expirado
                    </p>
                    <Button
                      onClick={generateNewQR}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl"
                    >
                      Gerar Novo QR Code
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logoImage} alt="DelHey" className="w-10 h-10" />
            <span className="text-xl font-bold">DelHey</span>
          </div>
          <p className="text-gray-400 italic mb-4">
            "Cuidamos de quem não pode falar"
          </p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DelHey ONG. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
