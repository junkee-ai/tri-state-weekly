import Link from "next/link";

export default function QRCodePage() {
  // We use a free, reliable API to generate the code on the fly!
  const siteUrl = "https://tristateweekly.com";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(siteUrl)}`;

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-desert-orange/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Back Button */}
        <Link href="/" className="mb-8 text-foreground/50 hover:text-desert-orange font-bold uppercase tracking-widest text-sm transition-colors">
          ← Back to Site
        </Link>

        {/* The Printable Card */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center text-black w-full max-w-sm">
          
          <img 
            src="/nav-logo.png" 
            alt="Tri-State Weekly" 
            className="h-12 w-auto mb-6 drop-shadow-md" 
          />
          
          <h2 className="text-2xl font-black text-center mb-2 uppercase tracking-tight">
            Scan for Local Events
          </h2>
          <p className="text-center text-gray-600 font-medium mb-8">
            Fort Mohave • Bullhead City • Laughlin • Needles
          </p>

          {/* THE QR CODE */}
          <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200">
            <img 
              src={qrUrl} 
              alt="Tri-State Weekly QR Code" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain"
            />
          </div>

          <p className="mt-8 font-bold text-gray-400 text-sm tracking-widest uppercase">
            tristateweekly.com
          </p>

        </div>

      </div>
    </main>
  );
}