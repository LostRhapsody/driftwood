import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-9xl font-extrabold">404</h1>
        <h2 className="text-3xl font-bold">
          Page Not Found
        </h2>
        <p className="pb-2">
          We couldn&apos;t find the page you&apos;re looking for.<br />
          Please report this issue if you think it&apos;s a bug.
        </p>
        <Link className="underline" target='' href="https://github.com/LostRhapsody/driftwood/issues">Report issue on Github here.</Link>
        <div className="mt-8">
          <Link
            href="/"
          >
            <Button>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}