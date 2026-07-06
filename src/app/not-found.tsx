import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fade-in mt-16">
      <h2 className="text-[10px] font-sans tracking-[0.3em] uppercase text-stone-400 font-bold mb-4">
        404 Error
      </h2>
      <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-stone-900 dark:text-stone-100 mb-6">
        Page not found.
      </h1>
      <p className="text-sm text-stone-500 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. 
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium text-sm hover:scale-105 transition-transform"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}
