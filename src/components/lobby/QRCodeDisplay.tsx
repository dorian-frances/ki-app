import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  code: string
}

export default function QRCodeDisplay({ code }: QRCodeDisplayProps) {
  const joinUrl = `${window.location.origin}/join/${code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-2xl">
        <QRCodeSVG value={joinUrl} size={180} level="M" />
      </div>
      <div className="text-center">
        <p className="text-sm text-white/50 mb-1">Code de la partie</p>
        <p className="text-4xl font-black tracking-[0.3em] text-ki-yellow">{code}</p>
      </div>
      <button
        onClick={handleCopy}
        className="text-sm text-ki-purple-light hover:text-white transition-colors font-bold"
      >
        Copier le lien d'invitation
      </button>
    </div>
  )
}
