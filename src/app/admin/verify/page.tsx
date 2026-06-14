import { Mail } from 'lucide-react'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center">
        <div className="font-script text-5xl text-purple-800 mb-6">E &amp; E</div>
        <Mail size={48} className="text-purple-700 mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-purple-900 mb-3">Check Your Email</h2>
        <p className="text-earth-600">
          A sign-in link has been sent to your email address.
          Click the link to access the admin dashboard.
        </p>
      </div>
    </div>
  )
}
