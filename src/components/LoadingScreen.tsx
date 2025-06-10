import { LucideAnvil } from "lucide-react"

export const LoadingScreen = () => {
  return <div className="dark">
    <div className="flex w-screen h-screen items-center justify-center bg-background">
      <div className="flex flex-row items-center animate-pulse">
        <LucideAnvil className="h-24 w-24 text-foreground mr-5" />
        <h1 className="text-foreground text-5xl font-semibold">Cleaning your Anvil</h1>
      </div>
    </div>
  </div>
}
